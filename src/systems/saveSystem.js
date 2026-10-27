import { heroClasses, characters } from "../data/characters.js";
import { HEIGHT, WIDTH, worlds } from "../worlds.js";

export const SAVE_KEY = "sapat-ispod-kamena-save";
const SAVE_VERSION = 1;
const questStates = ["waiting", "active", "carrying", "complete"];
const questIds = ["moonShard", "stoneEcho"];

export function readSave(storage) {
  let serialized;
  try {
    serialized = storage.getItem(SAVE_KEY);
  } catch (error) {
    return { status: "error", error };
  }

  if (serialized === null) return { status: "missing" };

  let save;
  try {
    save = JSON.parse(serialized);
  } catch {
    return { status: "invalid" };
  }

  if (!isValidSave(save)) return { status: "invalid" };
  return { status: "available", state: save.state };
}

export function writeSave(storage, state) {
  storage.setItem(SAVE_KEY, JSON.stringify({ version: SAVE_VERSION, state }));
}

export function clearSave(storage) {
  storage.removeItem(SAVE_KEY);
}

function isValidSave(save) {
  if (!save || save.version !== SAVE_VERSION || !save.state) return false;

  const { state } = save;
  const hero = state.hero;
  const enemy = state.enemy;
  if (!hero || !enemy) return false;
  if (!["village", "cave"].includes(state.location)) return false;
  const questId = state.questId ?? "moonShard";
  const echoFound = state.echoFound ?? false;
  if (!questIds.includes(questId)) return false;
  if (state.echoFound !== undefined && typeof state.echoFound !== "boolean") return false;
  if (!questStates.includes(state.quest)) return false;
  if (typeof state.shardFound !== "boolean") return false;
  if (questId === "moonShard") {
    if (state.shardFound !== (state.quest === "carrying" || state.quest === "complete") || echoFound) return false;
  } else if (!state.shardFound || state.quest === "waiting" || echoFound !== (state.quest === "carrying" || state.quest === "complete")) return false;

  if (!Object.hasOwn(heroClasses, hero.role)) return false;
  const heroClass = heroClasses[hero.role];
  if (typeof hero.name !== "string" || !hero.name.trim() || hero.name.length > 18) return false;
  if (!isPosition(hero.x, hero.y, state.location)) return false;
  if (!Number.isInteger(hero.hp) || hero.hp < 1 || hero.hp > heroClass.maxHp) return false;

  if (!isPosition(enemy.x, enemy.y, "cave")) return false;
  if (!Number.isInteger(enemy.hp) || enemy.hp < 0 || enemy.hp > characters.caveGuardian.maxHp) return false;
  return enemy.alive === (enemy.hp > 0);
}

function isPosition(x, y, location) {
  return Number.isFinite(x)
    && Number.isFinite(y)
    && x >= 1 && x < WIDTH - 1
    && y >= 1 && y < HEIGHT - 1
    && worlds[location].map[Math.floor(y)][Math.floor(x)] !== "#";
}
