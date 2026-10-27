import { NPCS } from "../data/npcs.js";
import { TILE } from "../worlds.js";

const DAY_MINUTES = 24 * 60;
const distance = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);

export function getTimePeriod(minutes) {
  const hour = Math.floor((minutes % DAY_MINUTES) / 60);
  if (hour >= 5 && hour < 12) return "morning";
  if (hour >= 12 && hour < 17) return "afternoon";
  if (hour >= 17 && hour < 21) return "evening";
  return "night";
}

export function formatGameTime(minutes) {
  const normalized = ((minutes % DAY_MINUTES) + DAY_MINUTES) % DAY_MINUTES;
  const hour24 = Math.floor(normalized / 60);
  const minute = normalized % 60;
  const hour12 = hour24 % 12 || 12;
  return `${hour12}:${String(minute).padStart(2, "0")} ${hour24 < 12 ? "AM" : "PM"}`;
}

export function getRoutine(npc, minutes) {
  const minute = ((minutes % DAY_MINUTES) + DAY_MINUTES) % DAY_MINUTES;
  return npc.schedules.find(schedule => schedule.start < schedule.end
    ? minute >= schedule.start && minute < schedule.end
    : minute >= schedule.start || minute < schedule.end) ?? npc.schedules[0];
}

export default class NPCManager {
  constructor(scene) {
    this.scene = scene;
    this.actors = [];
  }

  create(minutes) {
    this.clear();
    this.actors = NPCS.map(npc => {
      const routine = getRoutine(npc, minutes);
      const start = routine.route[0];
      const character = this.scene.add.sprite(0, 0, "asset-villager")
        .setTint(npc.tint ?? 0xffffff)
        .play("villager-down-idle");
      const children = [];
      if (npc.appearance === "elowen") children.push(...this.createElowenAccessories());
      const container = this.scene.add.container((start.x + .5) * TILE, (start.y + .5) * TILE, [...children.slice(0, 1), character, ...children.slice(1)])
        .setDepth((start.y + 1) * TILE);
      const actor = { npc, x: start.x, y: start.y, routine, target: this.closestWaypoint(start, routine.route), character, container };
      this.setActivityAnimation(actor, "down", false);
      return actor;
    });
  }

  createElowenAccessories() {
    const cape = this.scene.add.graphics();
    cape.fillStyle(0x715083, 1).fillTriangle(-13, -5, 13, -5, 0, 18);
    cape.lineStyle(2, 0xd6b16d, 1).beginPath().moveTo(-8, 3).lineTo(0, 15).lineTo(8, 3).strokePath();
    const bonnet = this.scene.add.graphics();
    bonnet.fillStyle(0x75456f, 1).fillRoundedRect(-13, -17, 26, 11, 5);
    bonnet.fillStyle(0xd6b16d, 1).fillRect(-11, -8, 22, 2);
    bonnet.fillStyle(0xf2d891, 1).fillCircle(0, -13, 2.5);
    return [cape, bonnet];
  }

  closestWaypoint(position, route) {
    return route.reduce((nearest, point, index) => distance(position, point) < distance(position, route[nearest]) ? index : nearest, 0);
  }

  update(deltaSeconds, minutes) {
    for (const actor of this.actors) {
      const nextRoutine = getRoutine(actor.npc, minutes);
      if (nextRoutine.id !== actor.routine.id) {
        actor.routine = nextRoutine;
        actor.target = this.closestWaypoint(actor, nextRoutine.route);
      }
      const goal = actor.routine.route[actor.target];
      const dx = goal.x - actor.x, dy = goal.y - actor.y;
      const remaining = Math.hypot(dx, dy);
      if (remaining < .06) {
        if (actor.routine.route.length < 2) {
          this.setActivityAnimation(actor, "down", false);
          continue;
        }
        actor.target = (actor.target + 1) % actor.routine.route.length;
        continue;
      }
      const step = Math.min(remaining, (actor.npc.speed ?? .62) * deltaSeconds);
      const moveX = dx / remaining * step, moveY = dy / remaining * step;
      const direction = Math.abs(dx) >= Math.abs(dy) ? (dx < 0 ? "left" : "right") : (dy < 0 ? "up" : "down");
      const nextX = actor.x + moveX, nextY = actor.y + moveY;
      if (this.scene.tileAt(Math.floor(nextX), Math.floor(actor.y)) !== "#") actor.x = nextX;
      if (this.scene.tileAt(Math.floor(actor.x), Math.floor(nextY)) !== "#") actor.y = nextY;
      actor.container.setPosition((actor.x + .5) * TILE, (actor.y + .5) * TILE).setDepth((actor.y + 1) * TILE);
      this.setActivityAnimation(actor, direction, true);
    }
  }

  setActivityAnimation(actor, direction, moving) {
    const key = `villager-${direction}-${moving ? "walk" : "idle"}`;
    if (actor.character.anims.currentAnim?.key !== key) actor.character.play(key, true);
  }

  getNearby(position, radius = 1.5) {
    return this.actors
      .map(actor => ({ actor, distance: distance(actor, position) }))
      .filter(result => result.distance < radius)
      .sort((a, b) => a.distance - b.distance)[0]?.actor ?? null;
  }

  clear() {
    for (const actor of this.actors) actor.container.destroy();
    this.actors = [];
  }
}
