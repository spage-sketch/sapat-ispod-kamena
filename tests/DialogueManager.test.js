import assert from "node:assert/strict";
import test from "node:test";
import DialogueManager from "../src/systems/DialogueManager.js";
import { createEnemyState } from "../src/systems/combatSystem.js";
import { readSave, SAVE_KEY, writeSave } from "../src/systems/saveSystem.js";
import { applyQuestAction } from "../src/systems/questSystem.js";

function createStorage() {
  const values = new Map();
  return {
    getItem: key => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, value),
    removeItem: key => values.delete(key),
  };
}

function createState(overrides = {}) {
  return {
    location: "village",
    questId: "moonShard",
    quest: "waiting",
    shardFound: false,
    echoFound: false,
    hero: { name: "Lina", role: "čuvar", x: 4, y: 9, hp: 6, maxHp: 6 },
    enemy: createEnemyState(),
    ...overrides,
  };
}

function createHarness(initialState) {
  let state = initialState;
  const events = [];
  const storage = createStorage();
  const scene = { game: { events: { emit: (name, payload) => events.push({ name, payload }) } } };
  const manager = new DialogueManager(scene, {
    getQuestContext: () => ({ questId: state.questId, questState: state.quest, heroName: state.hero.name }),
    onQuestAction: action => {
      state = applyQuestAction(state, action);
      writeSave(storage, state);
    },
  });
  return {
    manager,
    events,
    storage,
    get state() { return state; },
    set state(nextState) { state = nextState; },
    save: () => writeSave(storage, state),
  };
}

function advanceToFirstChoice(manager) {
  manager.advance();
  manager.advance();
  manager.advance();
}

test("prihvaćanje zadatka mijenja i sprema stanje", () => {
  const game = createHarness(createState());

  assert.equal(game.manager.startDialogue("elowen"), true);
  advanceToFirstChoice(game.manager);
  assert.ok(game.events.some(event => event.name === "dialogue:choices"));
  game.manager.choose(0);

  assert.equal(game.state.quest, "active");
  assert.equal(readSave(game.storage).state.quest, "active");
  assert.equal(game.manager.isActive, true);
  game.manager.advance();
  assert.equal(game.manager.isActive, false);
});

test("odbijanje zadatka zatvara razgovor bez promjene ili spremanja questa", () => {
  const game = createHarness(createState());

  game.manager.startDialogue("elowen");
  advanceToFirstChoice(game.manager);
  game.manager.choose(1);
  game.manager.advance();

  assert.equal(game.state.quest, "waiting");
  assert.equal(readSave(game.storage).status, "missing");
  assert.equal(game.manager.isActive, false);
});

test("predaja prvog predmeta otključava i sprema drugi zadatak", () => {
  const game = createHarness(createState({
    quest: "carrying",
    shardFound: true,
    hero: { name: "Lina", role: "čuvar", x: 4, y: 9, hp: 2, maxHp: 6 },
    enemy: { ...createEnemyState(), hp: 0, alive: false },
  }));

  game.manager.startDialogue("elowen");
  game.manager.advance();
  game.manager.advance();
  game.manager.advance();

  assert.equal(game.state.questId, "stoneEcho");
  assert.equal(game.state.quest, "active");
  assert.equal(game.state.hero.hp, 6);
  const saved = readSave(game.storage);
  assert.equal(saved.status, "available");
  assert.equal(saved.state.questId, "stoneEcho");
  assert.equal(saved.state.quest, "active");
  assert.equal(saved.state.enemy.alive, true);
});

test("pronalazak i predaja drugog predmeta spremaju završetak zadatka", () => {
  const game = createHarness(createState({
    location: "cave",
    questId: "stoneEcho",
    quest: "active",
    shardFound: true,
    hero: { name: "Lina", role: "čuvar", x: 10, y: 10, hp: 6, maxHp: 6 },
    enemy: { ...createEnemyState(), hp: 0, alive: false },
  }));
  game.state = applyQuestAction(game.state, "collect");
  game.save();

  assert.equal(game.state.quest, "carrying");
  assert.equal(readSave(game.storage).state.echoFound, true);
  assert.equal(game.manager.startDialogue("echo-stone"), true);
  game.manager.advance();
  assert.equal(game.manager.isActive, false);

  game.state = {
    ...game.state,
    location: "village",
    hero: { ...game.state.hero, x: 4, y: 9 },
  };
  game.save();
  game.manager.startDialogue("elowen");
  game.manager.advance();
  game.manager.advance();
  game.manager.advance();

  assert.equal(game.state.quest, "complete");
  const saved = readSave(game.storage);
  assert.equal(saved.status, "available");
  assert.equal(saved.state.questId, "stoneEcho");
  assert.equal(saved.state.quest, "complete");
});
