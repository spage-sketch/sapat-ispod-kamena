import { characters } from "../data/characters.js";
import { items } from "../data/items.js";
import { villageFrames } from "../data/villageArt.js";
import { HEIGHT, TILE, WIDTH, spawns, worlds } from "../worlds.js";

export default class WorldRenderer {
  constructor(scene) { this.scene = scene; }

  createAssetFrames(){
    for(const [sheet,sprites] of Object.entries(villageFrames)){
      const texture=this.scene.textures.get(`asset-${sheet}`);
      for(const [name,frame] of Object.entries(sprites.sprites))texture.add(name,0,frame.x*3,frame.y*3,frame.w*3,frame.h*3);
    }
  }
  createCharacterAnimations(){
    const directions=["down","left","right","up"];
    for(const actor of ["villager","adventurer"])for(const [row,direction] of directions.entries()){
      const start=row*6;
      this.scene.anims.create({key:`${actor}-${direction}-idle`,frames:this.scene.anims.generateFrameNumbers(`asset-${actor}`,{start,end:start+1}),frameRate:3,repeat:-1});
      this.scene.anims.create({key:`${actor}-${direction}-walk`,frames:this.scene.anims.generateFrameNumbers(`asset-${actor}`,{start:start+2,end:start+5}),frameRate:8,repeat:-1});
    }
  }
  addWorldAsset(sheet,frame,x,y,{originX=.5,originY=.5,depth=y}={}){
    const image=this.scene.add.image(x,y,`asset-${sheet}`,frame).setOrigin(originX,originY).setDepth(depth);
    this.scene.worldSprites.push(image);return image;
  }
  drawVillageBuilding(x,kind="home"){
    const parts=["left","middle","right"];
    for(let row=0;row<3;row++)for(let col=0;col<3;col++){
      const section=row===0?"ridge":row===1?"slope":"eave";
      this.addWorldAsset("roofs_thatch",`roof_thatch_${section}_${parts[col]}`,(x+col+.5)*TILE,(row+1.5)*TILE,{depth:(row+2)*TILE});
    }
    const upper=parts.map(part=>`facade_timber_window_${part}`);
    const lower=kind==="bakery"?parts.map(part=>`facade_timber_shop_${part}`):["facade_timber_wall_left","facade_timber_door_middle","facade_timber_wall_right"];
    for(let col=0;col<3;col++){
      this.addWorldAsset("facades_timber",upper[col],(x+col+.5)*TILE,4.5*TILE,{depth:5*TILE});
      this.addWorldAsset("facades_timber",lower[col],(x+col+.5)*TILE,5.5*TILE,{depth:6*TILE});
    }
    if(kind==="bakery")this.addWorldAsset("overlays","sign_baker",(x+1.5)*TILE,4.05*TILE,{depth:6*TILE+1});
    if(kind==="inn")this.addWorldAsset("overlays","sign_inn",(x+1.5)*TILE,4.05*TILE,{depth:6*TILE+1});
  }
  drawVillageWorld(){
    const variation=(x,y)=>((x*17+y*31+x*y*7)%4)+1;
    for(let y=0;y<HEIGHT;y++)for(let x=0;x<WIDTH;x++)this.addWorldAsset("ground",`grass_${variation(x,y)}`,x*TILE,y*TILE,{originX:0,originY:0,depth:0});
    const path=new Set();for(let x=2;x<=17;x++)path.add(`${x},8`);for(let y=6;y<=8;y++)path.add(`14,${y}`);
    const bits=[[0,-1,1],[1,-1,2],[1,0,4],[1,1,8],[0,1,16],[-1,1,32],[-1,0,64],[-1,-1,128]];
    for(const key of path){
      const [x,y]=key.split(",").map(Number);
      const north=path.has(`${x},${y-1}`),east=path.has(`${x+1},${y}`),south=path.has(`${x},${y+1}`),west=path.has(`${x-1},${y}`);
      const neighbors=[north,north&&east,east,east&&south,south,south&&west,west,west&&north];
      let mask=0;for(let i=0;i<bits.length;i++)if(neighbors[i])mask|=bits[i][2];
      const frame=`cobble_${String(mask).padStart(3,"0")}`;this.addWorldAsset("cobble",frame,x*TILE,y*TILE,{originX:0,originY:0,depth:1})
    }
    this.drawVillageBuilding(2,"home");this.drawVillageBuilding(8,"bakery");this.drawVillageBuilding(14,"inn");
    this.addWorldAsset("props","tree_oak",(1.5)*TILE,7*TILE,{originY:1,depth:7*TILE});
    this.addWorldAsset("props","tree_oak",(11.5)*TILE,7*TILE,{originY:1,depth:7*TILE});
    this.drawCaveEntrance();
    this.addWorldAsset("props","lamp_post_day",12.5*TILE,7.5*TILE,{originY:1,depth:8*TILE});
    this.addWorldAsset("props","barrel",11.5*TILE,9.5*TILE,{depth:10*TILE});
    this.addWorldAsset("props","crate",12.5*TILE,9.5*TILE,{depth:10*TILE});
    this.drawVillageLandmarks();
  }
  drawVillageLandmarks(){
    const label=(text,x,y)=>{
      const panel=this.scene.add.rectangle(x,y,106,22,0x30251d,.94).setStrokeStyle(1,0xc5a875,.9).setDepth(y+1);
      const caption=this.scene.add.text(x,y,text,{fontFamily:"Georgia, serif",fontSize:"10px",fontStyle:"bold",color:"#f5e4bd",letterSpacing:1}).setOrigin(.5).setDepth(y+2);
      this.scene.worldSprites.push(panel,caption);
    };
    // A quiet village well on the west edge and a small herb plot to the east
    // add landmarks without crossing NPC routes or the main cobbled lane.
    const wellX=3.5*TILE,wellY=10.5*TILE,well=this.scene.add.graphics().setDepth(11*TILE);
    well.fillStyle(0x342d27,1).fillEllipse(wellX,wellY+12,66,23);
    well.fillStyle(0x8a806c,1).fillRect(wellX-25,wellY-12,50,28);
    well.fillStyle(0x55534a,1).fillEllipse(wellX,wellY-12,50,20);
    well.fillStyle(0x263c3b,1).fillEllipse(wellX,wellY-12,34,11);
    well.lineStyle(4,0x624b36,1).beginPath().moveTo(wellX-31,wellY-25).lineTo(wellX-31,wellY-41).lineTo(wellX+31,wellY-41).lineTo(wellX+31,wellY-25).strokePath();
    well.lineStyle(3,0x624b36,1).beginPath().moveTo(wellX,wellY-41).lineTo(wellX,wellY-17).strokePath();
    this.scene.worldSprites.push(well);label("VILLAGE WELL",wellX,wellY-57);

    const bedX=16.5*TILE,bedY=10.5*TILE,garden=this.scene.add.graphics().setDepth(11*TILE);
    garden.fillStyle(0x554331,1).fillRoundedRect(bedX-54,bedY-17,108,39,5);
    for(let i=0;i<5;i++){
      const x=bedX-39+i*19;
      garden.lineStyle(3,0x496344,1).beginPath().moveTo(x,bedY+5).lineTo(x,bedY-12).strokePath();
      garden.fillStyle(i%2?0x8ea35a:0x70935a,1).fillEllipse(x-6,bedY-8,12,7);
      garden.fillStyle(0xb0ae67,1).fillEllipse(x+6,bedY-14,11,7);
    }
    this.scene.worldSprites.push(garden);label("HERB GARDEN",bedX,bedY-38);
  }
  drawCaveEntrance(){
    const x=14.5*TILE,y=6.8*TILE,g=this.scene.add.graphics().setDepth(7.5*TILE);
    g.fillStyle(0x465249,1).fillEllipse(x,y+10,68,66);
    g.fillStyle(0x716d5b,1).fillEllipse(x,y-5,58,50);
    g.fillStyle(0x252c29,1).fillRoundedRect(x-18,y-10,36,54,18);
    g.fillStyle(0x101614,1).fillEllipse(x,y-9,35,34);
    g.lineStyle(3,0x91866a,.9).strokeEllipse(x,y-5,58,50);
    g.fillStyle(0xa99c7b,.8).fillTriangle(x-19,y-16,x-8,y-22,x-9,y-8);
    g.fillStyle(0x857c62,.8).fillTriangle(x+12,y-20,x+22,y-12,x+10,y-7);
    this.scene.worldSprites.push(g);
    const sign=this.scene.add.rectangle(x,5.15*TILE,130,26,0x30251d,.95).setStrokeStyle(2,0xc5a875,.95).setDepth(6*TILE);
    const title=this.scene.add.text(x,5.15*TILE,"MOONLIT CAVE  ·  E",{fontFamily:"Georgia, serif",fontSize:"11px",fontStyle:"bold",color:"#f5e4bd",letterSpacing:1}).setOrigin(.5).setDepth(6*TILE+1);
    this.scene.worldSprites.push(sign,title);
  }
  drawWorld(){
    this.scene.worldSprites?.forEach(sprite=>sprite.destroy());this.scene.worldSprites=[];
    const map=worlds[this.scene.state.location].map;this.scene.mapGraphics.clear();
    if(this.scene.state.location==="village"){this.drawVillageWorld();return}
    for(let y=0;y<HEIGHT;y++)for(let x=0;x<WIDTH;x++){
      const t=map[y][x],px=x*TILE,py=y*TILE,wall=t==="#";
      const base=wall?0x4d514b:((x+y)%2?0x283330:0x2b3632);
      this.scene.mapGraphics.fillStyle(base,1).fillRect(px,py,TILE,TILE);
      if(wall){this.scene.mapGraphics.fillStyle(0x65675d,1).fillRoundedRect(px+5,py+5,TILE-10,9,3);this.scene.mapGraphics.fillStyle(0x171f1d,.35).fillRect(px+3,py+TILE-7,TILE-6,5)}
      else if(t==="R"){this.scene.mapGraphics.lineStyle(4,0xa99a7b,.9);this.scene.mapGraphics.beginPath();this.scene.mapGraphics.moveTo(px+12,py+6);this.scene.mapGraphics.lineTo(px+27,py+20);this.scene.mapGraphics.lineTo(px+20,py+28);this.scene.mapGraphics.lineTo(px+36,py+43);this.scene.mapGraphics.strokePath()}
      else if((x*7+y*11)%5===0){this.scene.mapGraphics.fillStyle(0x8d9b8b,.11).fillRect(px+11,py+17,3,3)}
      if(t==="C"){this.scene.mapGraphics.fillStyle(0x9a8359,1).fillEllipse(px+24,py+24,31,40);this.scene.mapGraphics.fillStyle(0xd2ba7a,.7).fillRect(px+20,py+10,8,5)}
    }
  }
  mark(x,y,emoji,color,size="24px"){return {shadow:this.scene.add.ellipse(x,y+13,28,11,0x0f1719,.6),disk:this.scene.add.circle(x,y-2,14,color),label:this.scene.add.text(x,y-4,emoji,{fontFamily:"Segoe UI Emoji, sans-serif",fontSize:size}).setOrigin(.5)}}
  positionMark(m,x,y){if(m?.setPosition){m.setPosition(x,y);m.setDepth(y+18);return}m.shadow.setPosition(x,y+13);m.disk.setPosition(x,y-2);m.label.setPosition(x,y-4)}
  clearMark(m){if(!m)return;if(m.destroy){m.destroy();return}Object.values(m).forEach(o=>o.destroy())}
  addActor(actor,x,y,direction="down",tint=0xffffff){
    const sprite=this.scene.add.sprite((x+.5)*TILE,(y+.5)*TILE,`asset-${actor}`).setDepth((y+1)*TILE).setTint(tint).play(`${actor}-${direction}-idle`);
    return sprite;
  }
  setActorMotion(sprite,actor,direction,moving){const key=`${actor}-${direction}-${moving?"walk":"idle"}`;if(sprite.anims.currentAnim?.key!==key)sprite.play(key,true)}
  updateHeroMotion(moving){const h=this.scene.state.hero,direction=Math.abs(h.faceX)>Math.abs(h.faceY)?(h.faceX<0?"left":"right"):(h.faceY<0?"up":"down");this.setActorMotion(this.scene.playerMark,"adventurer",direction,moving)}
  drawEntities(){
    for(const m of this.scene.marks||[])this.clearMark(m);this.scene.enemyHealth?.destroy();this.scene.marks=[];
    this.scene.npcManager?.clear();
    this.scene.npcMark=this.scene.enemyMark=this.scene.shardMark=null;
    if(this.scene.state.location==="village"){
      this.scene.npcManager.create(this.scene.state.worldMinute);
    }
    else{
      const foe=characters.caveGuardian;
      if(this.scene.state.enemy.alive){this.scene.enemyMark=this.mark((this.scene.state.enemy.x+.5)*TILE,(this.scene.state.enemy.y+.5)*TILE,foe.icon,0xcc806c);this.scene.enemyHealth=this.scene.add.graphics();this.scene.marks.push(this.scene.enemyMark)}
      const secondQuest=this.scene.state.questId==="stoneEcho",item=secondQuest?items.echoStone:items.moonShard,position=secondQuest?spawns.echoStone:spawns.shard,found=secondQuest?this.scene.state.echoFound:this.scene.state.shardFound;
      if(!found&&(this.scene.state.quest!=="complete"||secondQuest)){this.scene.shardMark=this.mark((position.x+.5)*TILE,(position.y+.5)*TILE,item.icon,0x9f8ce0,"31px");this.scene.marks.push(this.scene.shardMark)}
    }
    this.scene.playerMark=this.addActor("adventurer",this.scene.state.hero.x,this.scene.state.hero.y,"down");this.scene.marks.push(this.scene.playerMark);
  }
  updateEnemyMark(){if(this.scene.enemyMark&&this.scene.state.enemy.alive){const e=this.scene.state.enemy;this.positionMark(this.scene.enemyMark,(e.x+.5)*TILE,(e.y+.5)*TILE);const x=(e.x+.5)*TILE,y=(e.y+.12)*TILE;this.scene.enemyHealth.clear();this.scene.enemyHealth.fillStyle(0x101514,1).fillRect(x-19,y,38,5);this.scene.enemyHealth.fillStyle(0xd47c67,1).fillRect(x-19,y,38*e.hp/characters.caveGuardian.maxHp,5)}else{if(this.scene.enemyMark)Object.values(this.scene.enemyMark).forEach(object=>object.setVisible(false));this.scene.enemyHealth?.clear()}}
}
