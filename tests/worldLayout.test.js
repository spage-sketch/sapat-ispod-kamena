import assert from "node:assert/strict";
import test from "node:test";
import { NPCS } from "../src/data/npcs.js";
import { getRoutine } from "../src/systems/npcSystem.js";
import { spawns, worlds } from "../src/worlds.js";

const village = worlds.village.map;
const cave = worlds.cave.map;
const isWalkable = (map, point) => map[Math.floor(point.y)]?.[Math.floor(point.x)] !== "#";

test("sva tri vidljiva kućna ulaza ostaju prohodna", () => {
  for (const [x, y] of [[3, 5], [9, 5], [15, 5]]) {
    assert.notEqual(village[y][x], "#", `blocked house entrance at ${x},${y}`);
  }
});

test("igrač može prići špilji, a bunar i vrt ostaju izvan prolaza", () => {
  assert.ok(isWalkable(village, spawns.village));
  assert.ok(isWalkable(village, spawns.entrance));
  assert.equal(village[10][3], "#", "well footprint is blocked");
  assert.equal(village[10][16], "#", "garden footprint is blocked");
  assert.equal(village[10][17], "#", "garden footprint is blocked");
});

test("NPC rute ne ulaze u kuće ni u otiske novih orijentira", () => {
  for (const npc of NPCS) {
    for (const schedule of npc.schedules) {
      for (const waypoint of schedule.route) {
        assert.ok(isWalkable(village, waypoint), `${npc.name} ${schedule.id} blocked at ${waypoint.x},${waypoint.y}`);
      }
    }
  }
});

test("NPC-evi se ne preklapaju tijekom punog dnevnog ciklusa", () => {
  const actors = NPCS.map(npc => ({
    npc,
    ...npc.schedules[0].route[0],
    routine: getRoutine(npc, 8 * 60),
    target: 0,
  }));
  const distance = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
  let minute = 8 * 60;

  // Match the game clock: one game minute per second, with 20 update steps.
  for (let tick = 1; tick <= 24 * 60 * 20; tick++) {
    if (tick % 20 === 0) {
      minute = (minute + 1) % (24 * 60);
      for (const actor of actors) {
        const routine = getRoutine(actor.npc, minute);
        if (routine.id !== actor.routine.id) {
          actor.routine = routine;
          const distances = routine.route.map(point => distance(actor, point));
          actor.target = distances.indexOf(Math.min(...distances));
        }
      }
    }

    for (const actor of actors) {
      const goal = actor.routine.route[actor.target];
      const dx = goal.x - actor.x;
      const dy = goal.y - actor.y;
      const remaining = Math.hypot(dx, dy);
      if (remaining < 0.06) {
        actor.target = (actor.target + 1) % actor.routine.route.length;
        continue;
      }
      const step = Math.min(remaining, (actor.npc.speed ?? 0.62) * 0.05);
      actor.x += dx / remaining * step;
      actor.y += dy / remaining * step;
    }

    for (let i = 0; i < actors.length; i++) {
      for (let j = i + 1; j < actors.length; j++) {
        assert.ok(distance(actors[i], actors[j]) >= 0.6,
          `${actors[i].npc.name} overlaps ${actors[j].npc.name} at minute ${minute}`);
      }
    }
  }
});

test("ulaz u špilju i quest mjesta nalaze se na prohodnim poljima", () => {
  for (const point of [spawns.cave, spawns.enemy, spawns.shard, spawns.echoStone, spawns.crack]) {
    assert.ok(isWalkable(cave, point), `blocked cave location at ${point.x},${point.y}`);
  }
});
