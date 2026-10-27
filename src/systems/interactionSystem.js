import { inventory } from "../state/inventory.js";
import { spawns } from "../worlds.js";

const near = (a, b, radius = 1.5) => Math.hypot(a.x - b.x, a.y - b.y) < radius;

export default class InteractionSystem {
  constructor(scene) { this.scene = scene; }

  updateInteractionHint(){
    if(this.scene.dialoguePaused)return;
    const h=this.scene.state.hero;let message="";
    if(this.scene.state.location==="village"){
      const npc=this.scene.npcManager?.getNearby(h);
      if(npc)message=`E — Talk to ${npc.npc.name} · ${npc.routine.activity}`;
      else if(near(h,spawns.entrance))message="E — Enter Moonlit Cave";
    }else if(near(h,spawns.cave))message="E — Exit the cave";
    else if(near(h,spawns.crack))message=this.scene.crackOpened?"The crack is open":inventory.hasItem("klesano_dlijeto")?"E — Use the chisel":"The crack is too narrow to reach [Tool required]";
    if(message!==this.scene.interactionMessage){this.scene.interactionMessage=message;this.scene.game.events.emit("interaction",message)}
  }
  interact(){const h=this.scene.state.hero;if(this.scene.state.location==="village"){const npc=this.scene.npcManager.getNearby(h);if(npc)return this.scene.dialogueManager.startDialogue(npc.npc.id);if(near(h,spawns.entrance))return this.scene.changeLocation("cave")}if(this.scene.state.location==="cave"&&near(h,spawns.cave))return this.scene.changeLocation("village");if(this.scene.state.location==="cave"&&near(h,spawns.crack)){if(this.scene.crackOpened)return;if(!this.scene.state.crackDiscovered){this.scene.state.crackDiscovered=true;this.scene.emitSave()}if(!inventory.hasItem("klesano_dlijeto"))return this.scene.notify("You found a narrow crack, but it is too tight to open by hand. Tell Elowen what you found.");this.scene.crackOpened=true;this.scene.notify("You use the chisel to open the crack in the rock.");this.updateInteractionHint();return}this.scene.notify("No one is close enough.",1200)}
}
