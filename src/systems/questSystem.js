import { createEnemyState } from "./combatSystem.js";

export function transitionQuest(status, event) {
  const transitions = {
    accept: { waiting: "active" },
    collect: { active: "carrying" },
    complete: { carrying: "complete" },
  };
  return transitions[event]?.[status] ?? status;
}

export function applyQuestAction(state, action) {
  if (action === "accept") {
    const quest = transitionQuest(state.quest, "accept");
    return quest === state.quest ? state : { ...state, quest };
  }

  if (action === "collect") {
    if (state.quest !== "active") return state;
    return {
      ...state,
      quest: transitionQuest(state.quest, "collect"),
      ...(state.questId === "stoneEcho" ? { echoFound: true } : { shardFound: true }),
    };
  }

  if (action === "turnIn") {
    const quest = transitionQuest(state.quest, "complete");
    if (quest === state.quest) return state;
    if (state.questId === "moonShard") {
      return {
        ...state,
        questId: "stoneEcho",
        quest: "active",
        echoFound: false,
        enemy: createEnemyState(),
        hero: { ...state.hero, hp: state.hero.maxHp },
      };
    }
    return { ...state, quest };
  }

  return state;
}
