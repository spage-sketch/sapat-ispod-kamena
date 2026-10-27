export const ITEMS = {
  klesano_dlijeto: {
    id: "klesano_dlijeto",
    name: "Old Chisel",
    category: "Tool",
    description: "A worn piece of iron. It might pry open a crack in the rock.",
    icon: "🔨",
  },
  kameni_fragment: {
    id: "kameni_fragment",
    name: "Whispering Fragment",
    category: "Quest",
    description: "A cold stone etched with unreadable runes. It seems to softly vibrate at your touch.",
    icon: "◈",
  },
  moonShard: {
    id: "moon-shard",
    name: "Moonlit Shard",
    category: "Quest",
    icon: "✧",
    description: "A glowing fragment that protects the valley.",
    questId: "moon-shard",
  },
  echoStone: {
    id: "echo-stone",
    name: "Echo Stone",
    category: "Quest",
    icon: "◈",
    description: "A mysterious stone that echoed through the cave.",
    questId: "stone-echo",
  },
  warmLoaf: {
    id: "warmLoaf",
    name: "Warm Loaf",
    category: "Food",
    icon: "🍞",
    description: "A fresh loaf from Mira's oven, still warm from the hearth.",
  },
};

// Keep the existing story item identifiers available to the game scene.
export const items = ITEMS;
