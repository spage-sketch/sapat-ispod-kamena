import Phaser from "phaser";
import { characters, heroClasses } from "./data/characters.js";
import { items } from "./data/items.js";
import { quests, getQuestDisplay } from "./data/quests.js";
import { elowenDialogue, transitionQuest } from "./systems/questSystem.js";
import { canPlayerHit, createEnemyState, damageEnemy, damageHero, enemyCanAttack, enemyCanChase, enemyStep, isPlayerAttackReady } from "./systems/combatSystem.js";
import { HEIGHT, TILE, WIDTH, spawns, worlds } from "./worlds.js";

const near = (a,b,r=1.5) => Math.hypot(a.x-b.x,a.y-b.y) < r;

export default class GameScene extends Phaser.Scene {
  constructor() {
    super("PlayScene");
    this.state = { location:"village", questId:"moonShard", quest:"waiting", shardFound:false, echoFound:false, hero:{...spawns.village,name:"Putnik",role:"čuvar",hp:6,maxHp:6,speed:3.2,faceX:1,faceY:0}, enemy:createEnemyState() };
    this.dialogue = null; this.lastAttack = 0; this.lastDamage = 0; this.interactionMessage = null;
  }
  init(data={}) {
    const role = data.savedState?.hero.role || data.role || "čuvar", heroClass = heroClasses[role] || heroClasses["čuvar"];
    if (data.savedState) {
      const saved = data.savedState;
      this.state = {
        location: saved.location,
        questId: saved.questId ?? "moonShard",
        quest: saved.quest,
        shardFound: saved.shardFound,
        echoFound: saved.echoFound || false,
        hero: { ...saved.hero, maxHp: heroClass.maxHp, speed: heroClass.speed, faceX: 1, faceY: 0 },
        enemy: { ...saved.enemy },
      };
    } else {
      this.state = { location:"village", questId:"moonShard", quest:"waiting", shardFound:false, echoFound:false, hero:{...spawns.village,name:data.name||"Putnik",role,maxHp:heroClass.maxHp,hp:heroClass.maxHp,speed:heroClass.speed,faceX:1,faceY:0}, enemy:createEnemyState() };
    }
  }
  create() {
    this.cursors=this.input.keyboard.createCursorKeys();
    this.keys=this.input.keyboard.addKeys({w:"W",a:"A",s:"S",d:"D",e:"E",space:Phaser.Input.Keyboard.KeyCodes.SPACE});
    this.mapGraphics=this.add.graphics();this.drawWorld();this.drawEntities();this.emitHud();this.emitSave();
  }
  hudData(){return {...this.state,locationName:worlds[this.state.location].name,questData:getQuestDisplay(this.state.questId,this.state.quest)}}
  emitHud(){this.game.events.emit("hud",this.hudData())}
  emitSave(){this.game.events.emit("save",{location:this.state.location,questId:this.state.questId,quest:this.state.quest,shardFound:this.state.shardFound,echoFound:this.state.echoFound,hero:{name:this.state.hero.name,role:this.state.hero.role,x:this.state.hero.x,y:this.state.hero.y,hp:this.state.hero.hp},enemy:{...this.state.enemy}})}
  notify(message,duration=2200){this.game.events.emit("toast",{message,duration})}
  drawWorld(){
    const map=worlds[this.state.location].map;this.mapGraphics.clear();
    for(let y=0;y<HEIGHT;y++)for(let x=0;x<WIDTH;x++){
      const t=map[y][x],px=x*TILE,py=y*TILE,cave=this.state.location==="cave",wall=t==="#";
      const base=wall?(cave?0x4d514b:0x566953):cave?((x+y)%2?0x283330:0x2b3632):((x+y)%2?0x345544:0x385949);
      this.mapGraphics.fillStyle(base,1).fillRect(px,py,TILE,TILE);
      if(wall){this.mapGraphics.fillStyle(cave?0x65675d:0x75836a,1).fillRoundedRect(px+5,py+5,TILE-10,9,3);this.mapGraphics.fillStyle(0x171f1d,.35).fillRect(px+3,py+TILE-7,TILE-6,5)}
      else if((x*7+y*11)%5===0){this.mapGraphics.fillStyle(cave?0x8d9b8b:0xe4d294,.11).fillRect(px+11,py+17,3,3)}
      if(t==="C"){this.mapGraphics.fillStyle(cave?0x9a8359:0x171d1a,1).fillEllipse(px+24,py+24,31,40);this.mapGraphics.fillStyle(0xd2ba7a,.7).fillRect(px+20,py+10,8,5)}
    }
  }
  mark(x,y,emoji,color,size="24px"){return {shadow:this.add.ellipse(x,y+13,28,11,0x0f1719,.6),disk:this.add.circle(x,y-2,14,color),label:this.add.text(x,y-4,emoji,{fontFamily:"Segoe UI Emoji, sans-serif",fontSize:size}).setOrigin(.5)}}
  positionMark(m,x,y){m.shadow.setPosition(x,y+13);m.disk.setPosition(x,y-2);m.label.setPosition(x,y-4)}
  clearMark(m){if(m)Object.values(m).forEach(o=>o.destroy())}
  drawEntities(){
    for(const m of this.marks||[])this.clearMark(m);this.enemyHealth?.destroy();this.marks=[];
    this.npcMark=this.enemyMark=this.shardMark=null;
    if(this.state.location==="village"){const npc=characters.elowen;this.npcMark=this.mark((spawns.npc.x+.5)*TILE,(spawns.npc.y+.5)*TILE,npc.icon,0xe9c987);this.marks.push(this.npcMark)}
    else{
      const foe=characters.caveGuardian;
      if(this.state.enemy.alive){this.enemyMark=this.mark((this.state.enemy.x+.5)*TILE,(this.state.enemy.y+.5)*TILE,foe.icon,0xcc806c);this.enemyHealth=this.add.graphics();this.marks.push(this.enemyMark)}
      const secondQuest=this.state.questId==="stoneEcho",item=secondQuest?items.echoStone:items.moonShard,position=secondQuest?spawns.echoStone:spawns.shard,found=secondQuest?this.state.echoFound:this.state.shardFound;
      if(!found&&(this.state.quest!=="complete"||secondQuest)){this.shardMark=this.mark((position.x+.5)*TILE,(position.y+.5)*TILE,item.icon,0x9f8ce0,"31px");this.marks.push(this.shardMark)}
    }
    const hero=heroClasses[this.state.hero.role];this.playerMark=this.mark((this.state.hero.x+.5)*TILE,(this.state.hero.y+.5)*TILE,hero.icon,0xe9c987);this.marks.push(this.playerMark);
  }
  tileAt(x,y){return worlds[this.state.location].map[y]?.[x]??"#"}
  update(_time,deltaMs){
    if(this.dialogue)return;const dt=Math.min(deltaMs/1000,.05),h=this.state.hero,previousX=h.x,previousY=h.y,enemyX=this.state.enemy.x,enemyY=this.state.enemy.y;
    let dx=Number(this.keys.d.isDown||this.cursors.right.isDown)-Number(this.keys.a.isDown||this.cursors.left.isDown),dy=Number(this.keys.s.isDown||this.cursors.down.isDown)-Number(this.keys.w.isDown||this.cursors.up.isDown);
    if(dx||dy){const n=Math.hypot(dx,dy);dx/=n;dy/=n;h.faceX=Math.abs(dx)>Math.abs(dy)?Math.sign(dx):0;h.faceY=Math.abs(dy)>=Math.abs(dx)?Math.sign(dy):0;const nx=h.x+dx*h.speed*dt,ny=h.y+dy*h.speed*dt;if(this.tileAt(Math.floor(nx+Math.sign(dx)*.26),Math.floor(h.y))!=="#")h.x=nx;if(this.tileAt(Math.floor(h.x),Math.floor(ny+Math.sign(dy)*.26))!=="#")h.y=ny}
    if(Phaser.Input.Keyboard.JustDown(this.keys.e))this.interact();if(Phaser.Input.Keyboard.JustDown(this.keys.space))this.attack();
    if(this.state.location==="cave"&&this.state.enemy.alive)this.updateEnemy(dt);this.pickUpQuestItem();this.positionMark(this.playerMark,(h.x+.5)*TILE,(h.y+.5)*TILE);this.updateEnemyMark();this.updateInteractionHint();
    if(h.x!==previousX||h.y!==previousY||this.state.enemy.x!==enemyX||this.state.enemy.y!==enemyY){this.saveElapsed=(this.saveElapsed||0)+deltaMs;if(this.saveElapsed>=1000){this.saveElapsed=0;this.emitSave()}}
  }
  updateInteractionHint(){
    const h=this.state.hero;let message="";
    if(this.state.location==="village"){
      if(near(h,spawns.npc))message="E — Razgovaraj s Elowen";
      else if(near(h,spawns.entrance))message="E — Uđi u Mjesečevu špilju";
    }else if(near(h,spawns.cave))message="E — Izađi iz špilje";
    if(message!==this.interactionMessage){this.interactionMessage=message;this.game.events.emit("interaction",message)}
  }
  updateEnemyMark(){if(this.enemyMark&&this.state.enemy.alive){const e=this.state.enemy;this.positionMark(this.enemyMark,(e.x+.5)*TILE,(e.y+.5)*TILE);const x=(e.x+.5)*TILE,y=(e.y+.12)*TILE;this.enemyHealth.clear();this.enemyHealth.fillStyle(0x101514,1).fillRect(x-19,y,38,5);this.enemyHealth.fillStyle(0xd47c67,1).fillRect(x-19,y,38*e.hp/characters.caveGuardian.maxHp,5)}else{if(this.enemyMark)Object.values(this.enemyMark).forEach(object=>object.setVisible(false));this.enemyHealth?.clear()}}
  updateEnemy(dt){
    const h=this.state.hero,e=this.state.enemy,d=Math.hypot(h.x-e.x,h.y-e.y);
    if(enemyCanChase(d)){const step=enemyStep(d,dt),nx=e.x+(h.x-e.x)/d*step,ny=e.y+(h.y-e.y)/d*step;if(this.tileAt(Math.floor(nx),Math.floor(e.y))!=="#")e.x=nx;if(this.tileAt(Math.floor(e.x),Math.floor(ny))!=="#")e.y=ny}
    else if(enemyCanAttack(d,this.game.loop.time,this.lastDamage)){this.lastDamage=this.game.loop.time;this.state.hero=damageHero(h);this.emitHud();this.notify("Čuvar te je pogodio.",900);if(this.state.hero.hp<=0){this.state.hero.hp=this.state.hero.maxHp;this.state.enemy=createEnemyState();this.changeLocation("village");this.notify("Probudio si se na ulazu. Čuvar te čeka.",2600)}else this.emitSave()}
  }
  interact(){if(this.dialogue)return this.advanceDialogue();const h=this.state.hero;if(this.state.location==="village"&&near(h,spawns.npc))return this.talkToElowen();if(this.state.location==="village"&&near(h,spawns.entrance))return this.changeLocation("cave");if(this.state.location==="cave"&&near(h,spawns.cave))return this.changeLocation("village");this.notify("Nema nikoga dovoljno blizu.",1200)}
  talkToElowen(){
    const questId=this.state.questId,status=this.state.quest,npc=characters.elowen;
    let lines=elowenDialogue(questId,status,this.state.hero.name);
    if(questId==="moonShard"&&status==="carrying")lines=[...lines,...elowenDialogue("stoneEcho","waiting",this.state.hero.name)];
    if(status==="waiting")this.state.quest=transitionQuest(status,"accept");
    if(status==="carrying"){
      this.state.quest=transitionQuest(status,"complete");
      if(questId==="moonShard"){
        this.state.questId="stoneEcho";
        this.state.quest="active";
        this.state.echoFound=false;
        this.state.enemy=createEnemyState();
        this.state.hero.hp=this.state.hero.maxHp;
      }
    }
    if(this.state.quest!==status||this.state.questId!==questId)this.emitSave();
    const finish=status==="waiting"||status==="carrying"?()=>this.emitHud():null;
    this.openDialogue(npc.name+", "+npc.title,npc.icon,lines,finish);
  }
  openDialogue(speaker,icon,lines,done=null){this.dialogue={speaker,icon,lines,index:0,done};this.game.events.emit("interaction","");this.interactionMessage=null;this.game.events.emit("dialogue",{speaker,icon,text:lines[0]})}
  advanceDialogue(){if(!this.dialogue)return;this.dialogue.index++;if(this.dialogue.index>=this.dialogue.lines.length){const done=this.dialogue.done;this.dialogue=null;this.game.events.emit("dialogue-close");done?.();return}this.game.events.emit("dialogue",{speaker:this.dialogue.speaker,icon:this.dialogue.icon,text:this.dialogue.lines[this.dialogue.index]})}
  changeLocation(location){this.state.location=location;Object.assign(this.state.hero,spawns[location],{faceX:location==="village"?1:0,faceY:location==="village"?0:1});this.drawWorld();this.drawEntities();this.emitHud();this.emitSave();this.notify(location==="cave"?"Ušao si u Mjesečevu špilju.":"Vratio si se u selo.")}
  attack(){const now=this.game.loop.time;if(this.state.location!=="cave"||!this.state.enemy.alive||!isPlayerAttackReady(now,this.lastAttack))return;this.lastAttack=now;if(!canPlayerHit(this.state.hero,this.state.enemy)){this.notify("Udarac nije dosegnuo čuvara.",700);return}this.state.enemy=damageEnemy(this.state.enemy);this.emitSave();if(!this.state.enemy.alive)this.notify("Čuvar je pao. Odlomak je slobodan!");else this.notify("Pogodak! Čuvar se zatetura.",850)}
  pickUpQuestItem(){
    if(this.state.location!=="cave"||this.state.quest!=="active"||this.state.enemy.alive)return;
    const secondQuest=this.state.questId==="stoneEcho",item=secondQuest?items.echoStone:items.moonShard,position=secondQuest?spawns.echoStone:spawns.shard;
    if((secondQuest?this.state.echoFound:this.state.shardFound)||!near(this.state.hero,position,.8))return;
    if(secondQuest)this.state.echoFound=true;else this.state.shardFound=true;
    this.state.quest=transitionQuest(this.state.quest,"collect");
    if(this.shardMark)Object.values(this.shardMark).forEach(object=>object.setVisible(false));
    this.emitHud();this.emitSave();this.openDialogue(item.name,item.icon,quests[this.state.questId].dialogue.recovered);
  }
}
