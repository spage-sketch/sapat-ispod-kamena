import { characters } from "../data/characters.js";
import { dialogues } from "../data/dialogues.js";
import { items } from "../data/items.js";
import { getNPC } from "../data/npcs.js";

export default class DialogueManager {
  constructor(scene, { getQuestContext, onQuestAction, onItemAction, onDialogueFlag, onDialogueSeen }) {
    this.scene = scene;
    this.getQuestContext = getQuestContext;
    this.onQuestAction = onQuestAction;
    this.onItemAction = onItemAction;
    this.onDialogueFlag = onDialogueFlag;
    this.onDialogueSeen = onDialogueSeen;
    this.activeDialogue = null;
  }

  get isActive() {
    return this.activeDialogue !== null;
  }

  startDialogue(npcId) {
    if (this.isActive) return false;

    const context = this.getQuestContext();
    const dialogue = dialogues.find(entry =>
      entry.npcId === npcId
      && (!entry.once || !context.seenDialogues?.includes(entry.id))
      && Object.entries(entry.conditions).every(([key, value]) => {
        const contextKey = key === "state" ? "questState" : key;
        return context[contextKey] === value;
      })
    );
    if (!dialogue) return false;

    const speaker = getNPC(dialogue.npcId) ?? [...Object.values(characters), ...Object.values(items)]
      .find(entry => entry.id === dialogue.npcId);
    const lines = dialogue.lines.map(line => ({
      ...line,
      text: line.text.replaceAll("{heroName}", context.heroName ?? "Traveler"),
    }));
    this.activeDialogue = {
      ...dialogue,
      lines,
      speaker: { name: speaker?.name ?? npcId, icon: speaker?.icon ?? "✦" },
      lineIndex: 0,
      closeAfterCurrentLine: false,
    };

    this.emit("dialogue:pause", true);
    this.emitCurrentLine();
    return true;
  }

  advance() {
    const dialogue = this.activeDialogue;
    if (!dialogue) return;

    if (dialogue.closeAfterCurrentLine) return this.finishDialogue();
    const currentLine = dialogue.lines[dialogue.lineIndex];
    const choicePoint = dialogue.choices?.length
      && currentLine.id === (dialogue.choiceLineId ?? dialogue.lines.at(-1)?.id);
    if (choicePoint) {
      this.emit("dialogue:choices", dialogue.choices.map(({ text }, index) => ({ text, index })));
      return;
    }
    if (dialogue.lineIndex < dialogue.lines.length - 1) {
      dialogue.lineIndex++;
      this.emitCurrentLine();
      return;
    }
    this.finishDialogue();
  }

  choose(index) {
    const dialogue = this.activeDialogue;
    const choice = dialogue?.choices?.[index];
    if (!choice) return;

    this.emit("dialogue:choices-clear");
    if (choice.triggerQuestAction) this.triggerQuestAction(choice.triggerQuestAction);
    if (choice.addItem) this.onItemAction?.(choice.addItem.itemId, choice.addItem.amount ?? 1);
    if (!choice.nextLineId) return this.finishDialogue();

    const nextIndex = dialogue.lines.findIndex(line => line.id === choice.nextLineId);
    if (nextIndex < 0) return this.finishDialogue();
    dialogue.lineIndex = nextIndex;
    dialogue.closeAfterCurrentLine = true;
    this.emitCurrentLine();
  }

  emitCurrentLine() {
    const dialogue = this.activeDialogue;
    const line = dialogue.lines[dialogue.lineIndex];
    this.emit("dialogue:open", {
      dialogueId: dialogue.id,
      speaker: dialogue.speaker.name,
      icon: dialogue.speaker.icon,
      text: line.text,
    });
  }

  finishDialogue() {
    const action = this.activeDialogue?.completionAction;
    const itemReward = this.activeDialogue?.completionItem;
    const completionFlag = this.activeDialogue?.completionFlag;
    const dialogueId = this.activeDialogue?.id;
    const isOnce = this.activeDialogue?.once;
    if (action) this.triggerQuestAction(action);
    if (completionFlag) this.onDialogueFlag?.(completionFlag);
    if (itemReward) this.onItemAction?.(itemReward.itemId, itemReward.amount ?? 1);
    if (isOnce && dialogueId) this.onDialogueSeen?.(dialogueId);
    this.activeDialogue = null;
    this.emit("dialogue:choices-clear");
    this.emit("dialogue:close");
    this.emit("dialogue:pause", false);
  }

  triggerQuestAction(action) {
    this.emit("dialogue:quest-action", action);
    this.onQuestAction?.(action);
  }

  emit(eventName, payload) {
    this.scene.game.events.emit(eventName, payload);
  }
}
