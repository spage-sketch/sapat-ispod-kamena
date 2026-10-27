import { ITEMS } from "../data/items.js";

export class Inventory extends EventTarget {
  constructor(initialItems = {}) {
    super();
    this.quantities = new Map();
    this.deserialize(initialItems);
  }

  addItem(itemId, amount = 1) {
    if (!ITEMS[itemId] || !Number.isInteger(amount) || amount < 1) return false;
    this.quantities.set(itemId, (this.quantities.get(itemId) ?? 0) + amount);
    this.dispatchEvent(this.createUpdateEvent());
    return true;
  }

  removeItem(itemId, amount = 1) {
    const quantity = this.quantities.get(itemId) ?? 0;
    if (!Number.isInteger(amount) || amount < 1 || quantity < amount) return false;
    if (quantity === amount) this.quantities.delete(itemId);
    else this.quantities.set(itemId, quantity - amount);
    this.dispatchEvent(this.createUpdateEvent());
    return true;
  }

  hasItem(itemId, amount = 1) {
    return Number.isInteger(amount) && amount > 0 && (this.quantities.get(itemId) ?? 0) >= amount;
  }

  getInventory() {
    return [...this.quantities].map(([id, quantity]) => ({ ...ITEMS[id], id, category: ITEMS[id].category ?? "quest", quantity }));
  }

  serialize() {
    return Object.fromEntries(this.quantities);
  }

  deserialize(data = {}) {
    this.quantities.clear();
    const entries = Array.isArray(data) ? data.map(item => [item?.id, item?.quantity]) : Object.entries(data ?? {});
    for (const [id, quantity] of entries) {
      if (ITEMS[id] && Number.isInteger(quantity) && quantity > 0) this.quantities.set(id, quantity);
    }
    this.dispatchEvent(this.createUpdateEvent());
    return this.getInventory();
  }

  createUpdateEvent() {
    const event = new Event("inventory:updated");
    Object.defineProperty(event, "detail", { value: this.getInventory() });
    return event;
  }
}

export const inventory = new Inventory();
