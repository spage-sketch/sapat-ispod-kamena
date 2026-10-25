import { quests } from "../data/quests.js";

export function transitionQuest(status, event) {
  const transitions = {
    accept: { waiting: "active" },
    collect: { active: "carrying" },
    complete: { carrying: "complete" },
  };
  return transitions[event]?.[status] ?? status;
}

export function elowenDialogue(status, heroName) {
  const quest = quests.moonShard;
  const dialogueKey = status === "waiting" ? "greeting" : status === "carrying" ? "completion" : status;
  return quest.dialogue[dialogueKey].map((line) => line.replaceAll("{heroName}", heroName));
}