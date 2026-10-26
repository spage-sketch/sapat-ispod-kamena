import assert from "node:assert/strict";
import test from "node:test";
import { transitionQuest } from "../src/systems/questSystem.js";

test("quest prolazi kroz sva četiri dogovorena stanja", () => {
  let status = "waiting";
  const steps = [
    ["accept", "active"],
    ["collect", "carrying"],
    ["complete", "complete"],
  ];

  for (const [event, expectedStatus] of steps) {
    status = transitionQuest(status, event);
    assert.equal(status, expectedStatus);
  }
});

test("nevažeći prijelazi ostavljaju stanje nepromijenjenim", () => {
  const states = ["waiting", "active", "carrying", "complete"];
  const events = ["accept", "collect", "complete", "unknown"];
  const validEvents = {
    waiting: "accept",
    active: "collect",
    carrying: "complete",
  };

  for (const status of states) {
    for (const event of events) {
      if (validEvents[status] === event) continue;
      assert.equal(
        transitionQuest(status, event),
        status,
        `${event} ne smije promijeniti stanje ${status}`,
      );
    }
  }
});
