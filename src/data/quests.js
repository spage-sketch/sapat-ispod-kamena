export const quests = {
  moonShard: {
    id: "moon-shard",
    states: {
      waiting: { title: "A Quiet Valley", description: "Speak with Elowen beside the old path.", status: "QUEST AVAILABLE", tip: "Find Elowen and press E to talk." },
      active: { title: "Moonlit Shard", description: "Find the shard in the cave. The guardian will not give it up easily.", status: "IN PROGRESS", tip: "Defeat the guardian and collect the shard." },
      carrying: { title: "Return to Elowen", description: "You found the shard. Bring it back to the keeper of the path.", status: "ITEM FOUND", tip: "Return to the village and speak with Elowen." },
      complete: { title: "The Valley Is Safe", description: "Elowen has the shard. Well done!", status: "COMPLETE", tip: "The quest is complete. You can keep exploring the cave." },
    },
  },
  stoneEcho: {
    id: "stone-echo",
    states: {
      active: { title: "Echoes Below", description: "Elowen heard a new echo from the cave. Find its source.", status: "IN PROGRESS", tip: "Return to the cave and find the echo stone." },
      carrying: { title: "The Echo Stone", description: "You found the mysterious stone. Take it to Elowen.", status: "ITEM FOUND", tip: "Return to the village and speak with Elowen." },
      complete: { title: "The Echo Is Silent", description: "Elowen has the stone, and the cave is quiet at last.", status: "COMPLETE", tip: "The quest is complete. You can keep exploring." },
    },
  },
};

export function getQuestDisplay(questId, status) {
  // Keep the original one-argument call compatible with existing call sites.
  if (status === undefined) {
    status = questId;
    questId = "moonShard";
  }
  const entry = quests[questId].states[status];
  return [entry.title, entry.description, entry.status, entry.tip];
}
