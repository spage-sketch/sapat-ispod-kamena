const makeDialogue = (id, npcId, conditions, text, options = {}) => ({
  id,
  npcId,
  conditions,
  lines: text.map((line, index) => ({ id: `${id}-${index + 1}`, text: line })),
  ...options,
});

export const dialogues = [
  makeDialogue("elowen-reported-crack", "elowen", { crackDiscovered: true, toolMissing: true }, [
    "A narrow fissure along the rear wall, you say? Then the stone did not crack by chance.",
    "Take this Old Chisel. It belonged to the road-builders of the first age.",
    "If the echo originates beyond that wall, pry it open with care.",
  ], { completionItem: { itemId: "klesano_dlijeto" } }),
  {
    ...makeDialogue("elowen-before-quest1", "elowen", { questId: "moonShard", state: "waiting" }, [
      "Welcome to the Hill, {heroName}. The path before us has grown restless.",
      "A pale light stirs inside the Moonlit Cave, guarded by a creature that knows no calm.",
      "Enter the cave and bring me the Moonlit Shard. We must understand what has awakened.",
      "Thank you, {heroName}. Take care against the Guardian within.",
      "I understand. I'll be here if you change your mind.",
    ], { choiceLineId: "elowen-before-quest1-3" }),
    choices: [
      { text: "I'll help", nextLineId: "elowen-before-quest1-4", triggerQuestAction: "accept" },
      { text: "Not yet", nextLineId: "elowen-before-quest1-5" },
    ],
  },
  makeDialogue("elowen-quest1-active", "elowen", { questId: "moonShard", state: "active" }, [
    "The cave lies beyond the village path.",
    "Take care against the Guardian within. Keep your guard high and watch your footing.",
  ]),
  makeDialogue("elowen-has-moonlit-shard", "elowen", { questId: "moonShard", state: "carrying" }, [
    "You hold the Moonlit Shard. Even wrapped in cloth, its glow cuts through the dusk.",
    "You have done well, {heroName}. But listen... the cave did not fall silent. A hollow echo has taken its place.",
    "Something deeper responds to the shard's removal. Find the source of this new echo and bring back the Echo Stone.",
  ], { completionAction: "turnIn" }),
  makeDialogue("elowen-quest2-active", "elowen", { questId: "stoneEcho", state: "active" }, [
    "The echo persists. Track its cadence inside the cavern until you locate the Echo Stone.",
  ]),
  makeDialogue("elowen-has-echo-stone", "elowen", { questId: "stoneEcho", state: "carrying" }, [
    "The Echo Stone... its pulse settles the moment it touches the open air.",
    "The cavern sleeps once more, and our path is preserved. The village owes you its peace, {heroName}.",
  ], { completionAction: "turnIn" }),
  makeDialogue("elowen-quest2-complete", "elowen", { questId: "stoneEcho", state: "complete" }, [
    "The air above the valley is still again. Walk the village freely; you are a stranger to no one here.",
  ]),

  makeDialogue("moon-shard-recovered", "moon-shard", { questId: "moonShard", state: "carrying" }, [
    "You found the Moonlit Shard! Return to the village and give it to Elowen.",
  ]),
  makeDialogue("echo-stone-recovered", "echo-stone", { questId: "stoneEcho", state: "carrying" }, [
    "You found the Echo Stone! Return to the village and give it to Elowen.",
  ]),

  makeDialogue("mira-before-quest1", "mira", { questId: "moonShard", state: "waiting" }, [
    "Good day, {heroName}! If you smell burnt rye, don't mention it—the draft from the hill threw off my oven heat.",
    "Are you heading up the path? Mind Elowen's counsel; she rarely troubles travelers without cause.",
  ]),
  makeDialogue("mira-quest1-active", "mira", { questId: "moonShard", state: "active" }, [
    "Off to the cave? Don't go picking fights on an empty stomach.",
    "Keep your wits about you. Beasts in the dark rarely care for manners.",
  ]),
  makeDialogue("mira-has-moonlit-shard", "mira", { questId: "moonShard", state: "carrying" }, [
    "Is that what was glowing up there? It looks colder than midwinter ice.",
    "Hurry that over to Elowen. Strange stones belong in a keeper's hands, not out in the market.",
  ]),
  makeDialogue("mira-quest1-complete", "mira", { questId: "stoneEcho", state: "active", miraWarmLoafClaimed: false }, [
    "You returned in one piece! Here—take this loaf, still warm from the hearth.",
    "Though Alden says he still hears a thrumming from the ridge. Eat first, worry later.",
  ], {
    once: true,
    completionItem: { itemId: "warmLoaf" },
    completionFlag: "miraWarmLoafClaimed",
  }),
  makeDialogue("mira-quest2-active", "mira", { questId: "stoneEcho", state: "active" }, [
    "More trouble in the rock? My yeast rises slower when the ground shakes like that. Be careful down there.",
  ]),
  makeDialogue("mira-has-echo-stone", "mira", { questId: "stoneEcho", state: "carrying" }, [
    "That stone hums like a wet kettle! Carry it straight to Elowen before my roof tiles start rattling.",
  ]),
  makeDialogue("mira-quest2-complete", "mira", { questId: "stoneEcho", state: "complete" }, [
    "Quiet morning at last. The oven holds its heat, and the crust turned out golden. Stop by whenever you need provender.",
  ]),

  makeDialogue("alden-before-quest1", "alden", { questId: "moonShard", state: "waiting" }, [
    "Welcome to the Hilltop. Fire's stoked, and water's on the boil.",
    "Most folks stay along the lower road these days. The northern cave has made the horses skittish.",
  ]),
  makeDialogue("alden-quest1-active", "alden", { questId: "moonShard", state: "active" }, [
    "Going into the dark? Don't break what you can't replace, and come back before nightfall.",
  ]),
  makeDialogue("alden-has-moonlit-shard", "alden", { questId: "moonShard", state: "carrying" }, [
    "That's a peculiar light you're carrying. Don't leave it on the tavern pine; it looks like it would freeze the varnish.",
  ]),
  makeDialogue("alden-quest1-complete", "alden", { questId: "stoneEcho", state: "active" }, [
    "Elowen took the shard, yet my window panes hummed all through the third watch.",
    "Whatever sits under that hill isn't done shifting its weight.",
  ], { once: true }),
  makeDialogue("alden-quest2-active", "alden", { questId: "stoneEcho", state: "active" }, [
    "If you're going back in, listen for the gap in the sound. An echo always bounces off an empty space.",
  ]),
  makeDialogue("alden-has-echo-stone", "alden", { questId: "stoneEcho", state: "carrying" }, [
    "So that was the bell tolling under the floorboards. Best hand that to Elowen before it wakes the cellar mice.",
  ]),
  makeDialogue("alden-quest2-complete", "alden", { questId: "stoneEcho", state: "complete" }, [
    "First silent night in a fortnight. If you need a stool by the hearth, {heroName}, yours is paid for.",
  ]),

  makeDialogue("nessa-before-quest1", "nessa", { questId: "moonShard", state: "waiting" }, [
    "Step clear of the dry bundles, please.",
    "The hill-sage is wilting along the upper crags. I suspect something down in the cave is souring the groundwater.",
  ]),
  makeDialogue("nessa-quest1-active", "nessa", { questId: "moonShard", state: "active" }, [
    "I don't think the Guardian is there out of malice. It stays where the mineral veins run thick.",
  ]),
  makeDialogue("nessa-has-moonlit-shard", "nessa", { questId: "moonShard", state: "carrying" }, [
    "The Moonlit Shard... it smells of rainwater and copper. Take it to Elowen before its dampness fades.",
  ]),
  makeDialogue("nessa-quest1-complete", "nessa", { questId: "stoneEcho", state: "active" }, [
    "If my reading of the roots is right, the shard was acting as a stopper. The moment you lifted it, the deep echo began.",
    "If you find where the air bleeds through the rock, Elowen keeps durable tools by the path.",
  ], { once: true }),
  makeDialogue("nessa-quest2-active", "nessa", { questId: "stoneEcho", state: "active" }, [
    "Look for the pale lichen. It only grows where stone has been chipped away recently.",
  ]),
  makeDialogue("nessa-has-echo-stone", "nessa", { questId: "stoneEcho", state: "carrying" }, [
    "That stone vibrates like a trapped hornet. Deliver it to the Keeper; herbs cannot soothe what it stirs.",
  ]),
  makeDialogue("nessa-quest2-complete", "nessa", { questId: "stoneEcho", state: "complete" }, [
    "The sage leaves are standing straight again this morning. The soil remembers its quiet.",
  ]),

  makeDialogue("pip-before-quest1", "pip", { questId: "moonShard", state: "waiting" }, [
    "Morning! Or afternoon! I've lost track—three letters to the orchard and one that smells like sheep grease.",
    "Are you the traveler everyone's watching? Don't wander into the cave; Elowen has that stern look again!",
  ]),
  makeDialogue("pip-quest1-active", "pip", { questId: "moonShard", state: "active" }, [
    "I saw sparks near the cave mouth earlier! Be quick on your feet if that big watcher comes running!",
  ]),
  makeDialogue("pip-has-moonlit-shard", "pip", { questId: "moonShard", state: "carrying" }, [
    "Whoa! Look at that shine! Does it leave a trail in your pack? Go show Elowen, quick!",
  ]),
  makeDialogue("pip-quest1-complete", "pip", { questId: "stoneEcho", state: "active" }, [
    "Everyone heard you got the shard back! But the sheep wouldn't graze near the ridge today. Something's buzzing down low.",
  ], { once: true }),
  makeDialogue("pip-quest2-active", "pip", { questId: "stoneEcho", state: "active" }, [
    "If you're exploring the back tunnels, check the draft! My papers almost flew away when I stood near the crest!",
  ]),
  makeDialogue("pip-has-echo-stone", "pip", { questId: "stoneEcho", state: "carrying" }, [
    "You found it! That sounds like singing through an iron pot! Elowen is waiting right by the post!",
  ]),
  makeDialogue("pip-quest2-complete", "pip", { questId: "stoneEcho", state: "complete" }, [
    "The whole village is quiet! Well, except for Mira's pans. Next parcel I get with your name on it, I'll deliver first class!",
  ]),
];
