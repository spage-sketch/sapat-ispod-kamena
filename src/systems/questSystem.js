import { quests } from "../data/quests.js";

export function transitionQuest(status, event) {
  const transitions = {
    accept: { waiting: "active" },
    collect: { active: "carrying" },
    complete: { carrying: "complete" },
  };
  return transitions[event]?.[status] ?? status;
}

export function elowenDialogue(questId, status, heroName) {
  // Support the original (status, heroName) call while older sessions are being migrated.
  if (heroName === undefined) {
    heroName = status;
    status = questId;
    questId = "moonShard";
  }
  const quest = quests[questId];
  const dialogueKey = status === "waiting" ? "greeting" : status === "carrying" ? "completion" : status;
  return quest.dialogue[dialogueKey].map((line) => line.replaceAll("{heroName}", heroName));
}
