import Phaser from "phaser";
import { HEIGHT,TILE,WIDTH,spawns,worlds } from "./worlds.js";
const questCopy={
 waiting:["Mirna dolina","Razgovaraj s Elowen pokraj stare staze.","ZADATAK ČEKA","Priđi Elowen i pritisni E da započneš razgovor."],
 active:["Odlomak mjesečine","U špilji pronađi odlomak. Čuvar ga neće lako prepustiti.","U TIJEKU","Porazi čuvara i pokupi odlomak."],
 carrying:["Povratak Elowen","Odlomak je pronađen. Vrati se čuvarici staze.","PREDMET PRONAĐEN","Vrati se u selo i razgovaraj s Elowen."],
 complete:["Dolina je sigurna","Elowen je preuzela odlomak. Dobar posao!","ZAVRŠENO","Pustolovina je završena — možeš još istraživati špilju."]
};
const near=(a,b,r=1.5)=>Math.hypot(a.x-b.x,a.y-b.y)<r;

export default class GameScene extends Phaser.Scene{
 constructor(){super("PlayScene");this.state={location:"village",quest:"waiting",shardFound:false,hero:{...spawns.village,name:"Putnik",role:"čuvar",hp:5,maxHp:5,speed:3.2,faceX:1,faceY:0},enemy:{...spawns.enemy,hp:3,alive:true}};this.dialogue=null;this.lastAttack=0;this.lastDamage=0}
 init(data={}){this.state.hero.name=data.name||"Putnik";this.state.hero.role=data.role||"čuvar";this.state.hero.maxHp=this.state.hero.role==="čuvar"?6:4;this.state.hero.hp=this.state.hero.maxHp;this.state.hero.speed=this.state.hero.role==="čuvar"?3.2:4.2}
 create(){
  this.cursors=this.input.keyboard.createCursorKeys();
  this.keys=this.input.keyboard.addKeys({w:"W",a:"A",s:"S",d:"D",e:"E",space:Phaser.Input.Keyboard.KeyCodes.SPACE});
  this.mapGraphics=this.add.graphics();this.entityGraphics=this.add.graphics();this.drawWorld();this.drawEntities();this.emitHud();
 }
 hudData(){return {...this.state,locationName:worlds[this.state.location].name,questData:questCopy[this.state.quest]}}
 emitHud(){this.game.events.emit("hud",this.hudData())}
 notify(message,duration=2200){this.game.events.emit("toast",{message,duration})}
 drawWorld(){
  const {map}=worlds[this.state.location];this.mapGraphics.clear();
  for(let y=0;y<HEIGHT;y++)for(let x=0;x<WIDTH;x++){
   const t=map[y][x],px=x*TILE,py=y*TILE,cave=this.state.location==="cave",wall=t==="#";
   const base=wall?(cave?0x4d514b:0x566953):cave?((x+y)%2?0x283330:0x2b3632):((x+y)%2?0x345544:0x385949);
   this.mapGraphics.fillStyle(base,1);this.mapGraphics.fillRect(px,py,TILE,TILE);
   if(wall){this.mapGraphics.fillStyle(cave?0x65675d:0x75836a,1);this.mapGraphics.fillRoundedRect(px+5,py+5,TILE-10,9,3);this.mapGraphics.fillStyle(0x171f1d,.35);this.mapGraphics.fillRect(px+3,py+TILE-7,TILE-6,5)}
   else if((x*7+y*11)%5===0){this.mapGraphics.fillStyle(cave?0x8d9b8b:0xe4d294,.11);this.mapGraphics.fillRect(px+11,py+17,3,3);this.mapGraphics.fillRect(px+34,py+35,2,2)}
   if(t==="C"){this.mapGraphics.fillStyle(cave?0x9a8359:0x171d1a,1);this.mapGraphics.fillEllipse(px+24,py+24,31,40);this.mapGraphics.fillStyle(0xd2ba7a,.7);this.mapGraphics.fillRect(px+20,py+10,8,5)}
  }
 }
 mark(x,y,emoji,color,size="24px"){
  return {shadow:this.add.ellipse(x,y+13,28,11,0x0f1719,.6),disk:this.add.circle(x,y-2,14,color),label:this.add.text(x,y-4,emoji,{fontFamily:"Segoe UI Emoji, sans-serif",fontSize:size}).setOrigin(.5)};
 }
 place(mark,x,y){mark.shadow.setPosition(x,y+13);mark.disk.setPosition(x,y-2);mark.label.setPosition(x,y-4)}
 clearMark(mark){if(mark)Object.values(mark).forEach(o=>o.destroy())}
 drawEntities(){
  for(const mark of this.marks||[])this.clearMark(mark);this.enemyHealth?.destroy();this.marks=[];
  this.npcMark=this.enemyMark=this.shardMark=null;
  if(this.state.location==="village"){this.npcMark=this.mark((spawns.npc.x+.5)*TILE,(spawns.npc.y+.5)*TILE,"🧙",0xe9c987);this.marks.push(this.npcMark)}
  else{this.enemyMark=this.mark((spawns.enemy.x+.5)*TILE,(spawns.enemy.y+.5)*TILE,"👾",0xcc806c);this.enemyHealth=this.add.graphics();this.shardMark=this.mark((spawns.shard.x+.5)*TILE,(spawns.shard.y+.5)*TILE,"✧",0x9f8ce0,"31px");this.marks.push(this.enemyMark,this.shardMark)}
  this.playerMark=this.mark((this.state.hero.x+.5)*TILE,(this.state.hero.y+.5)*TILE,this.state.hero.role==="čuvar"?"🛡️":"🧭",0xe9c987);this.marks.push(this.playerMark);
 }
 tileAt(x,y){return worlds[this.state.location].map[y]?.[x]??"#"}
 update(_time,deltaMs){
  if(this.dialogue)return;const dt=Math.min(deltaMs/1000,.05),h=this.state.hero;
  let dx=Number(this.keys.d.isDown||this.cursors.right.isDown)-Number(this.keys.a.isDown||this.cursors.left.isDown),dy=Number(this.keys.s.isDown||this.cursors.down.isDown)-Number(this.keys.w.isDown||this.cursors.up.isDown);
  if(dx||dy){const n=Math.hypot(dx,dy);dx/=n;dy/=n;h.faceX=Math.abs(dx)>Math.abs(dy)?Math.sign(dx):0;h.faceY=Math.abs(dy)>=Math.abs(dx)?Math.sign(dy):0;const nx=h.x+dx*h.speed*dt,ny=h.y+dy*h.speed*dt;if(this.tileAt(Math.floor(nx+Math.sign(dx)*.26),Math.floor(h.y))!=="#")h.x=nx;if(this.tileAt(Math.floor(h.x),Math.floor(ny+Math.sign(dy)*.26))!=="#")h.y=ny}
  if(Phaser.Input.Keyboard.JustDown(this.keys.e))this.interact();
  if(Phaser.Input.Keyboard.JustDown(this.keys.space))this.attack();
  if(this.state.location==="cave"&&this.state.enemy.alive)this.updateEnemy(dt);
  this.pickUpShard();this.place(this.playerMark,(h.x+.5)*TILE,(h.y+.5)*TILE);
  if(this.enemyMark&&this.state.enemy.alive){const e=this.state.enemy;this.place(this.enemyMark,(e.x+.5)*TILE,(e.y+.5)*TILE);const x=(e.x+.5)*TILE,y=(e.y+.12)*TILE;this.enemyHealth.clear();this.enemyHealth.fillStyle(0x101514,1).fillRect(x-19,y,38,5);this.enemyHealth.fillStyle(0xd47c67,1).fillRect(x-19,y,38*e.hp/3,5)}else this.enemyHealth?.clear();
 }
 updateEnemy(dt){
  const h=this.state.hero,e=this.state.enemy,d=Math.hypot(h.x-e.x,h.y-e.y);
  if(d>.85&&d<6){const step=Math.min(1.2*dt,d-.78),nx=e.x+(h.x-e.x)/d*step,ny=e.y+(h.y-e.y)/d*step;if(this.tileAt(Math.floor(nx),Math.floor(e.y))!=="#")e.x=nx;if(this.tileAt(Math.floor(e.x),Math.floor(ny))!=="#")e.y=ny}
  else if(d<=.85&&this.game.loop.time-this.lastDamage>1100){this.lastDamage=this.game.loop.time;h.hp--;this.emitHud();this.notify("Čuvar te je pogodio.",900);if(h.hp<=0){h.hp=h.maxHp;this.state.enemy={...spawns.enemy,hp:3,alive:true};this.changeLocation("village");this.notify("Probudio si se na ulazu. Čuvar te čeka.",2600)}}
 }
 interact(){if(this.dialogue)return this.advanceDialogue();const h=this.state.hero;if(this.state.location==="village"&&near(h,spawns.npc))return this.talkToElowen();if(this.state.location==="village"&&near(h,spawns.entrance))return this.changeLocation("cave");if(this.state.location==="cave"&&near(h,spawns.cave))return this.changeLocation("village");this.notify("Nema nikoga dovoljno blizu.",1200)}
 talkToElowen(){
  if(this.state.quest==="waiting"){this.state.quest="active";this.openDialogue("Elowen, čuvarica staze","🧙",["Dobro došao, "+this.state.hero.name+". Iz špilje se noću čuje čudno pjevanje.","Ondje je ostao odlomak mjesečine, važan za zaštitu naše doline.","Možeš li ga pronaći? Uđi kroz stari prolaz i vrati mi ga."],()=>this.emitHud())}
  else if(this.state.quest==="carrying"){this.state.quest="complete";this.openDialogue("Elowen, čuvarica staze","🧙",["Vratio si odlomak! Svjetlo se opet vratilo u dolinu.","Hvala ti, pustolove. Neka ti putovi budu mirni."],()=>this.emitHud())}
  else this.openDialogue("Elowen, čuvarica staze","🧙",[this.state.quest==="complete"?"Dolina je sigurna, zahvaljujući tebi.":"Odlomak je još u špilji. Čuvaj se čuvara!"])
 }
 openDialogue(speaker,icon,lines,done=null){this.dialogue={speaker,icon,lines,index:0,done};this.game.events.emit("dialogue",{speaker,icon,text:lines[0]})}
 advanceDialogue(){if(!this.dialogue)return;this.dialogue.index++;if(this.dialogue.index>=this.dialogue.lines.length){const done=this.dialogue.done;this.dialogue=null;this.game.events.emit("dialogue-close");done?.();return}this.game.events.emit("dialogue",{speaker:this.dialogue.speaker,icon:this.dialogue.icon,text:this.dialogue.lines[this.dialogue.index]})}
 changeLocation(location){this.state.location=location;Object.assign(this.state.hero,spawns[location],{faceX:location==="village"?1:0,faceY:location==="village"?0:1});this.drawWorld();this.drawEntities();this.emitHud();this.notify(location==="cave"?"Ušao si u Mjesečevu špilju.":"Vratio si se u selo.")}
 attack(){if(this.state.location!=="cave"||!this.state.enemy.alive||this.game.loop.time-this.lastAttack<430)return;this.lastAttack=this.game.loop.time;const dx=this.state.enemy.x-this.state.hero.x,dy=this.state.enemy.y-this.state.hero.y;if(Math.hypot(dx,dy)<1.65&&dx*this.state.hero.faceX+dy*this.state.hero.faceY>-.25){if(--this.state.enemy.hp<=0){this.state.enemy.alive=false;this.notify("Čuvar je pao. Odlomak je slobodan!")}else this.notify("Pogodak! Čuvar se zatetura.",850)}else this.notify("Udarac nije dosegnuo čuvara.",700)}
 pickUpShard(){if(this.state.location!=="cave"||this.state.quest!=="active"||this.state.shardFound||this.state.enemy.alive||!near(this.state.hero,spawns.shard,.8))return;this.state.shardFound=true;this.state.quest="carrying";this.shardMark.setVisible(false);this.emitHud();this.openDialogue("Mjesečev odlomak","✧",["Pronašao si odlomak mjesečine! Vrati se u selo i predaj ga Elowen."])}
}