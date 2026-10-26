import assert from "node:assert/strict";
import test from "node:test";
import { clearSave, readSave, SAVE_KEY, writeSave } from "../src/systems/saveSystem.js";

const state = {
  location: "cave",
  quest: "active",
  shardFound: false,
  hero: { name: "Putnik", role: "čuvar", x: 4.5, y: 5.5, hp: 5 },
  enemy: { x: 15, y: 6, hp: 2, alive: true },
};

function createStorage(initialValue = null) {
  let value = initialValue;
  return {
    getItem: key => key === SAVE_KEY ? value : null,
    setItem: (key, nextValue) => { if (key === SAVE_KEY) value = nextValue; },
    removeItem: key => { if (key === SAVE_KEY) value = null; },
  };
}

test("sprema i učitava stanje pustolovine", () => {
  const storage = createStorage();
  writeSave(storage, state);
  assert.deepEqual(readSave(storage), { status: "available", state });
});

test("razlikuje nepostojeće, neispravno i nekompatibilno spremanje", () => {
  assert.deepEqual(readSave(createStorage()), { status: "missing" });
  assert.deepEqual(readSave(createStorage("{")), { status: "invalid" });
  assert.deepEqual(readSave(createStorage(JSON.stringify({ version: 2, state }))), { status: "invalid" });
});

test("odbacuje nevaljane podatke igre", () => {
  const invalidState = { ...state, hero: { ...state.hero, hp: 99 } };
  assert.deepEqual(readSave(createStorage(JSON.stringify({ version: 1, state: invalidState }))), { status: "invalid" });
});

test("uklanja spremljeno stanje", () => {
  const storage = createStorage();
  writeSave(storage, state);
  clearSave(storage);
  assert.deepEqual(readSave(storage), { status: "missing" });
});

test("vraća pogreške pregledničke pohrane bez prikrivanja", () => {
  const error = new Error("storage disabled");
  const storage = { getItem() { throw error; } };
  assert.deepEqual(readSave(storage), { status: "error", error });
});
