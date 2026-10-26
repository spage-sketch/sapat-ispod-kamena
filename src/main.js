import Phaser from "phaser";
import "../styles.css";
import GameScene from "./GameScene.js";
import { heroClasses } from "./data/characters.js";
import { clearSave, readSave, writeSave } from "./systems/saveSystem.js";
const $=selector=>document.querySelector(selector),form=$("#character-form"),creation=$("#creation"),gamePanel=$("#game");
const continueButton=document.createElement("button"),saveMessage=document.createElement("p");
let game,savedState=null,lastSaveError="";
continueButton.type="button";continueButton.className="primary hidden";continueButton.textContent="Nastavi spremljenu pustolovinu →";
saveMessage.className="intro-save-message";saveMessage.setAttribute("role","status");
$(".intro").append(continueButton,saveMessage);
function setHud(s){$("#hero-label").textContent=s.hero.name;$("#hero-class-label").textContent=heroClasses[s.hero.role].label;$("#hero-avatar").textContent=heroClasses[s.hero.role].icon;$("#location-label").textContent=s.locationName;$("#health-hearts").innerHTML=Array.from({length:s.hero.maxHp},(_,i)=>'<span class="'+(i>=s.hero.hp?"heart-empty":"")+'">♥</span>').join("");const q=s.questData;$("#quest-title").textContent=q[0];$("#quest-copy").textContent=q[1];$("#quest-status").textContent=q[2];$("#tip-copy").textContent=q[3]}
function showToast({message,duration}){const el=$("#game-toast");el.textContent=message;el.classList.remove("hidden");clearTimeout(showToast.timer);showToast.timer=setTimeout(()=>el.classList.add("hidden"),duration)}
function showDialogue({speaker,icon,text}){$("#speaker-label").textContent=speaker.toLocaleUpperCase("hr-HR");$("#dialogue-portrait").textContent=icon;$("#dialogue-text").textContent=text;$("#dialogue-next").textContent="Dalje →";$("#dialogue").classList.remove("hidden")}
function setSaveMessage(message){saveMessage.textContent=message}
function startAdventure(event){event?.preventDefault();if(game)return;const data=event?new FormData(form):null,name=data?String(data.get("heroName")||"Putnik").trim().slice(0,18)||"Putnik":savedState.hero.name,role=data?String(data.get("heroClass")||"čuvar"):savedState.hero.role;
  if(data){savedState=null;continueButton.classList.add("hidden");try{clearSave(window.localStorage);setSaveMessage("")}catch(error){setSaveMessage(`Staro spremanje nije uklonjeno: ${error.message}`)}}
  launchAdventure({name,role,savedState:data?null:savedState});
}
function launchAdventure(playerData){const hint=document.createElement("div");hint.id="interaction-hint";hint.className="interaction-hint hidden";hint.setAttribute("aria-live","polite");$(".board").append(hint);creation.classList.add("hidden");gamePanel.classList.remove("hidden");game=new Phaser.Game({type:Phaser.AUTO,parent:"game-board",width:960,height:624,backgroundColor:"#17201e",render:{pixelArt:true,antialias:true},scale:{mode:Phaser.Scale.FIT,autoCenter:Phaser.Scale.CENTER_BOTH},scene:[]});game.events.on("hud",setHud);game.events.on("toast",showToast);game.events.on("interaction",message=>{hint.textContent=message||"";hint.classList.toggle("hidden",!message)});game.events.on("dialogue",showDialogue);game.events.on("dialogue-close",()=>$("#dialogue").classList.add("hidden"));game.events.on("save",state=>{try{writeSave(window.localStorage,state);lastSaveError=""}catch(error){const message=`Spremanje nije uspjelo: ${error.message}`;if(message!==lastSaveError)showToast({message,duration:4500});lastSaveError=message}});game.events.once("ready",()=>game.scene.add("PlayScene",GameScene,true,playerData))}
function loadSavedGame(){try{const result=readSave(window.localStorage);if(result.status==="available"){savedState=result.state;continueButton.classList.remove("hidden");setSaveMessage("Pronađena je spremljena pustolovina na ovom uređaju.")}else if(result.status==="invalid"){setSaveMessage("Spremljena pustolovina nije valjana i ne može se nastaviti.")}else if(result.status==="error"){setSaveMessage(`Spremanje nije dostupno: ${result.error.message}`)}}catch(error){setSaveMessage(`Spremanje nije dostupno: ${error.message}`)}}
form.addEventListener("submit",startAdventure);continueButton.addEventListener("click",()=>startAdventure());loadSavedGame();$("#dialogue-next").addEventListener("click",()=>game?.scene.getScene("PlayScene").advanceDialogue());$("#restart-button").addEventListener("click",()=>window.location.reload());
