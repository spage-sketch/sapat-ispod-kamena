export const heroClasses = {
  "čuvar": { label: "Guardian", icon: "🛡️", maxHp: 6, speed: 3.2 },
  "tragač": { label: "Scout", icon: "🧭", maxHp: 4, speed: 4.2 },
};

export const characters = {
  elowen: { id: "elowen", name: "Elowen", title: "Keeper of the Path", icon: "🧙" },
  caveGuardian: {
    id: "cave-guardian",
    name: "Cave Guardian",
    icon: "👾",
    maxHp: 3,
    damage: 1,
    speed: 1.2,
    chaseDistance: 6,
    attackRange: 0.85,
    attackCooldownMs: 1100,
    playerAttackRange: 1.65,
    playerAttackCooldownMs: 430,
  },
};
