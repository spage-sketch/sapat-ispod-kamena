import Phaser from "phaser";
import { characters, heroClasses } from "./data/characters.js";
import { items } from "./data/items.js";
import WorldRenderer from "./rendering/WorldRenderer.js";
import InteractionSystem from "./systems/interactionSystem.js";
import PlayerController from "./systems/playerController.js";
import NPCManager, { formatGameTime, getTimePeriod } from "./systems/npcSystem.js";
import { inventory } from "./state/inventory.js";
import { villageImages } from "./data/villageArt.js";
import { getQuestDisplay } from "./data/quests.js";
import { applyQuestAction } from "./systems/questSystem.js";
import DialogueManager from "./systems/DialogueManager.js";
import { canPlayerHit, createEnemyState, damageEnemy, damageHero, enemyCanAttack, enemyCanChase, enemyStep, isPlayerAttackReady } from "./systems/combatSystem.js";
import { TILE, spawns, worlds } from "./worlds.js";

const near = (a, b, radius = 1.5) => Math.hypot(a.x - b.x, a.y - b.y) < radius;

export default class GameScene extends Phaser.Scene {
  constructor() {
    super("PlayScene");
    this.state = { location:"village", questId:"moonShard", quest:"waiting", shardFound:false, echoFound:false, crackDiscovered:false, worldMinute:8*60, dialogueFlags:{}, seenDialogues:[], hero:{...spawns.village,name:"Traveler",role:"čuvar",hp:6,maxHp:6,speed:3.2,faceX:1,faceY:0}, enemy:createEnemyState() };
    this.dialoguePaused = false; this.inventoryOpen = false; this.crackOpened = false; this.lastAttack = 0; this.lastDamage = 0; this.interactionMessage = null; this.clockAccumulator = 0;
  }
  preload(){for(const [key,url] of Object.entries(villageImages)){if(key==="villager"||key==="adventurer")this.load.spritesheet(`asset-${key}`,url,{frameWidth:48,frameHeight:48});else this.load.image(`asset-${key}`,url)}}
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
        crackDiscovered: saved.crackDiscovered ?? false,
        worldMinute: saved.worldMinute ?? 8 * 60,
        dialogueFlags: saved.dialogueFlags ?? {},
        seenDialogues: saved.seenDialogues ?? [],
        hero: { ...saved.hero, maxHp: heroClass.maxHp, speed: heroClass.speed, faceX: 1, faceY: 0 },
        enemy: { ...saved.enemy },
      };
      inventory.deserialize(saved.inventory ?? {});
      if (saved.crackDiscovered === undefined) {
        const legacyChisel = inventory.getInventory().find(item => item.id === "klesano_dlijeto");
        if (legacyChisel) inventory.removeItem("klesano_dlijeto", legacyChisel.quantity);
      }
      if (saved.inventory === undefined && (saved.quest === "carrying" || saved.quest === "complete")) {
        inventory.addItem(saved.questId === "stoneEcho" ? "echoStone" : "moonShard");
      }
      if (saved.questId === "stoneEcho" && saved.quest === "complete") inventory.removeItem("echoStone");
    } else {
      inventory.deserialize({});
      this.state = { location:"village", questId:"moonShard", quest:"waiting", shardFound:false, echoFound:false, crackDiscovered:false, worldMinute:8*60, dialogueFlags:{}, seenDialogues:[], hero:{...spawns.village,name:data.name||"Traveler",role,maxHp:heroClass.maxHp,hp:heroClass.maxHp,speed:heroClass.speed,faceX:1,faceY:0}, enemy:createEnemyState() };
    }
  }
  create() {
    this.worldRenderer = new WorldRenderer(this);
    this.interactions = new InteractionSystem(this);
    this.playerController = new PlayerController(this);
    this.worldRenderer.createAssetFrames();this.worldRenderer.createCharacterAnimations();
    this.cursors=this.input.keyboard.createCursorKeys();
    this.keys=this.input.keyboard.addKeys({w:"W",a:"A",s:"S",d:"D",e:"E",i:"I",space:Phaser.Input.Keyboard.KeyCodes.SPACE});
    this.dialogueManager=new DialogueManager(this,{
      getQuestContext:()=>({questId:this.state.questId,questState:this.state.quest,heroName:this.state.hero.name,toolMissing:!inventory.hasItem("klesano_dlijeto"),crackDiscovered:this.state.crackDiscovered,timePeriod:getTimePeriod(this.state.worldMinute),miraWarmLoafClaimed:Boolean(this.state.dialogueFlags.miraWarmLoafClaimed),seenDialogues:this.state.seenDialogues}),
      onQuestAction:action=>this.handleDialogueQuestAction(action),
      onItemAction:(itemId,amount)=>this.giveItem(itemId,amount),
      onDialogueFlag:flag=>{this.state.dialogueFlags[flag]=true;this.emitSave()},
      onDialogueSeen:dialogueId=>{if(!this.state.seenDialogues.includes(dialogueId)){this.state.seenDialogues.push(dialogueId);this.emitSave()}},
    });
    this.game.events.on("dialogue:pause",paused=>{
      this.dialoguePaused=paused;
      if(paused){this.interactionMessage="";this.game.events.emit("interaction","")}
    });
    inventory.addEventListener("inventory:updated",event=>this.game.events.emit("inventory:updated",event.detail));
    this.npcManager=new NPCManager(this);
    this.mapGraphics=this.add.graphics();this.worldRenderer.drawWorld();this.worldRenderer.drawEntities();this.emitHud();this.emitSave();
  }
  hudData(){return {...this.state,locationName:worlds[this.state.location].name,timeLabel:`${formatGameTime(this.state.worldMinute)} · ${getTimePeriod(this.state.worldMinute)}`,questData:getQuestDisplay(this.state.questId,this.state.quest)}}
  emitHud(){this.game.events.emit("hud",this.hudData())}
  emitSave(){this.game.events.emit("save",{location:this.state.location,questId:this.state.questId,quest:this.state.quest,shardFound:this.state.shardFound,echoFound:this.state.echoFound,crackDiscovered:this.state.crackDiscovered,worldMinute:this.state.worldMinute,dialogueFlags:{...this.state.dialogueFlags},seenDialogues:[...this.state.seenDialogues],inventory:inventory.serialize(),hero:{name:this.state.hero.name,role:this.state.hero.role,x:this.state.hero.x,y:this.state.hero.y,hp:this.state.hero.hp},enemy:{...this.state.enemy}})}
  notify(message,duration=2200){this.game.events.emit("toast",{message,duration})}
  tileAt(x,y){return worlds[this.state.location].map[y]?.[x]??"#"}
  update(_time,deltaMs){
    if(Phaser.Input.Keyboard.JustDown(this.keys.i)){this.setInventoryOpen(!this.inventoryOpen)}
    if(this.dialoguePaused||this.inventoryOpen)return;const dt=Math.min(deltaMs/1000,.05),h=this.state.hero,previousX=h.x,previousY=h.y,enemyX=this.state.enemy.x,enemyY=this.state.enemy.y;
    this.updateWorldClock(deltaMs);
    this.playerController.update(dt);
    if(Phaser.Input.Keyboard.JustDown(this.keys.e))this.interactions.interact();if(this.dialoguePaused)return;if(Phaser.Input.Keyboard.JustDown(this.keys.space))this.attack();
    if(this.state.location==="cave"&&this.state.enemy.alive)this.updateEnemy(dt);if(this.state.location==="village")this.npcManager.update(dt,this.state.worldMinute);this.pickUpQuestItem();this.worldRenderer.positionMark(this.playerMark,(h.x+.5)*TILE,(h.y+.5)*TILE);this.worldRenderer.updateHeroMotion(h.x!==previousX||h.y!==previousY);this.worldRenderer.updateEnemyMark();this.interactions.updateInteractionHint();
    if(h.x!==previousX||h.y!==previousY||this.state.enemy.x!==enemyX||this.state.enemy.y!==enemyY){this.saveElapsed=(this.saveElapsed||0)+deltaMs;if(this.saveElapsed>=1000){this.saveElapsed=0;this.emitSave()}}
  }
  updateWorldClock(deltaMs){
    this.clockAccumulator+=deltaMs;
    while(this.clockAccumulator>=1000){
      this.clockAccumulator-=1000;
      this.state.worldMinute=(this.state.worldMinute+1)%(24*60);
      this.emitHud();
      if(this.state.worldMinute%5===0)this.emitSave();
    }
  }
  updateEnemy(dt){
    const h=this.state.hero,e=this.state.enemy,d=Math.hypot(h.x-e.x,h.y-e.y);
    if(enemyCanChase(d)){const step=enemyStep(d,dt),nx=e.x+(h.x-e.x)/d*step,ny=e.y+(h.y-e.y)/d*step;if(this.tileAt(Math.floor(nx),Math.floor(e.y))!=="#")e.x=nx;if(this.tileAt(Math.floor(e.x),Math.floor(ny))!=="#")e.y=ny}
    else if(enemyCanAttack(d,this.game.loop.time,this.lastDamage)){this.lastDamage=this.game.loop.time;this.state.hero=damageHero(h);this.emitHud();this.notify("The guardian struck you.",900);if(this.state.hero.hp<=0){this.state.hero.hp=this.state.hero.maxHp;this.state.enemy=createEnemyState();this.changeLocation("village");this.notify("You wake near the entrance. The guardian is still waiting.",2600)}else this.emitSave()}
  }
  setInventoryOpen(open){this.inventoryOpen=open;this.game.events.emit("inventory:visibility",open);if(open){this.interactionMessage="";this.game.events.emit("interaction","")}}
  giveItem(itemId,amount=1){if(inventory.addItem(itemId,amount)){this.game.events.emit("inventory:updated",inventory.getInventory());this.emitSave();this.notify(`Item received: ${inventory.getInventory().find(item=>item.id===itemId)?.name ?? itemId}.`);return true}return false}
  handleDialogueQuestAction(action){
    if(action==="turnIn")inventory.removeItem(this.state.questId==="stoneEcho"?"echoStone":"moonShard");
    this.state=applyQuestAction(this.state,action);
    this.emitHud();
    this.emitSave();
  }
  changeLocation(location){this.state.location=location;Object.assign(this.state.hero,spawns[location],{faceX:location==="village"?1:0,faceY:location==="village"?0:1});this.worldRenderer.drawWorld();this.worldRenderer.drawEntities();this.emitHud();this.emitSave();this.notify(location==="cave"?"You enter the Moonlit Cave.":"You return to the village.")}
  attack(){const now=this.game.loop.time;if(this.state.location!=="cave"||!this.state.enemy.alive||!isPlayerAttackReady(now,this.lastAttack))return;this.lastAttack=now;if(!canPlayerHit(this.state.hero,this.state.enemy)){this.notify("Your strike misses the guardian.",700);return}this.state.enemy=damageEnemy(this.state.enemy);this.emitSave();if(!this.state.enemy.alive)this.notify("The guardian falls. The shard is yours!");else this.notify("Hit! The guardian staggers.",850)}
  pickUpQuestItem(){
    if(this.state.location!=="cave"||this.state.quest!=="active"||this.state.enemy.alive)return;
    const secondQuest=this.state.questId==="stoneEcho",item=secondQuest?items.echoStone:items.moonShard,position=secondQuest?spawns.echoStone:spawns.shard;
    if((secondQuest?this.state.echoFound:this.state.shardFound)||!near(this.state.hero,position,.8))return;
    this.state=applyQuestAction(this.state,"collect");
    this.giveItem(secondQuest?"echoStone":"moonShard");
    if(this.shardMark)Object.values(this.shardMark).forEach(object=>object.setVisible(false));
    this.emitHud();this.emitSave();this.dialogueManager.startDialogue(item.id);
  }
}
