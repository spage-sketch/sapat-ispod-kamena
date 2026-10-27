const route = (...points) => points.map(([x, y]) => ({ x, y }));

export const NPCS = [
  {
    id: "elowen",
    name: "Elowen",
    title: "Keeper of the Path",
    icon: "🧙",
    appearance: "elowen",
    schedules: [{ id: "pathkeeper", start: 0, end: 1440, activity: "Keeping the old path", route: route([5, 7]) }],
  },
  {
    id: "mira",
    name: "Mira",
    title: "Village Baker",
    icon: "🥖",
    tint: 0xffd8bd,
    schedules: [
      { id: "morning", start: 360, end: 720, activity: "Baking at the bakery", route: route([7.2, 7.2], [7.8, 7.1], [7.8, 7.8]) },
      { id: "afternoon", start: 720, end: 1080, activity: "Serving fresh bread", route: route([7.2, 8.2], [7.7, 7.3], [8.1, 8.1]) },
      { id: "evening", start: 1080, end: 1260, activity: "Closing the bakery", route: route([7.4, 7.4], [7.8, 7.8]) },
      { id: "night", start: 1260, end: 360, activity: "Resting at home", route: route([7.6, 7.4]) },
    ],
  },
  {
    id: "alden",
    name: "Alden",
    title: "The Hilltop Innkeeper",
    icon: "🍵",
    tint: 0xd4dcff,
    schedules: [
      { id: "morning", start: 360, end: 720, activity: "Preparing the inn", route: route([17.1, 7.2], [18, 7.1], [17.7, 7.8]) },
      { id: "afternoon", start: 720, end: 1080, activity: "Welcoming travelers", route: route([17.4, 7.1], [18, 7.8], [17.2, 8.2]) },
      { id: "evening", start: 1080, end: 1260, activity: "Serving supper at the inn", route: route([17.6, 7.5], [17.1, 8.1]) },
      { id: "night", start: 1260, end: 360, activity: "Sleeping above the inn", route: route([17.5, 7.4]) },
    ],
  },
  {
    id: "nessa",
    name: "Nessa",
    title: "The Herb Gatherer",
    icon: "🌿",
    tint: 0xe0d0ff,
    schedules: [
      { id: "morning", start: 360, end: 720, activity: "Gathering herbs", route: route([6, 9.4], [7, 10], [8.2, 9.5]) },
      { id: "afternoon", start: 720, end: 1080, activity: "Sorting her bundles", route: route([9, 10.1], [10, 10.5], [10.6, 9.7]) },
      { id: "evening", start: 1080, end: 1260, activity: "Trading remedies", route: route([8.6, 9.3], [9.5, 9.6]) },
      { id: "night", start: 1260, end: 360, activity: "Resting by the gardens", route: route([6.2, 9.3]) },
    ],
  },
  {
    id: "pip",
    name: "Pip",
    title: "The Village Courier",
    icon: "📯",
    tint: 0xffe4a8,
    schedules: [
      { id: "morning", start: 360, end: 720, activity: "Delivering morning letters", route: route([5.7, 8.4], [7.3, 8.5], [9.2, 8.5]) },
      { id: "afternoon", start: 720, end: 1080, activity: "Carrying parcels", route: route([10.8, 8.5], [11.7, 8.5], [12.5, 8.4]) },
      { id: "evening", start: 1080, end: 1260, activity: "Making the last deliveries", route: route([15.5, 8.3], [16, 8.4], [15.5, 8.3]) },
      { id: "night", start: 1260, end: 360, activity: "Sleeping after the rounds", route: route([13.3, 9.4]) },
    ],
  },
];

export const getNPC = id => NPCS.find(npc => npc.id === id) ?? null;
