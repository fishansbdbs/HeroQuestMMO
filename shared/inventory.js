import { getItem } from "./items.js";

export const INVENTORY_SLOT_COUNT = 36;
export const DEFAULT_STACK_LIMIT = 1;
export const INVENTORY_STACK_LIMITS = {
  consumable: 20,
  material: 99,
  special: 10
};

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

export function stackLimitForItem(itemId) {
  const item = getItem(itemId);
  if (!item) return DEFAULT_STACK_LIMIT;
  if (item.stackLimit) return item.stackLimit;
  return INVENTORY_STACK_LIMITS[item.type] || DEFAULT_STACK_LIMIT;
}

function normalizeEntry(entry) {
  return {
    itemId: entry.itemId,
    quantity: Math.max(1, Math.floor(Number(entry.quantity) || 1))
  };
}

export function normalizeInventory(inventory = []) {
  return (Array.isArray(inventory) ? inventory : [])
    .filter((entry) => entry && typeof entry.itemId === "string")
    .map(normalizeEntry)
    .slice(0, INVENTORY_SLOT_COUNT);
}

export function addInventoryStack(inventory, itemId, quantity = 1) {
  const item = getItem(itemId);
  if (!item) return { ok: false, reason: "item", inventory: normalizeInventory(inventory), overflow: [{ itemId, quantity }] };

  const next = normalizeInventory(inventory);
  let remaining = Math.max(1, Math.floor(Number(quantity) || 1));
  const stackLimit = stackLimitForItem(itemId);

  for (const entry of next) {
    if (entry.itemId !== itemId || entry.quantity >= stackLimit) continue;
    const add = Math.min(remaining, stackLimit - entry.quantity);
    entry.quantity += add;
    remaining -= add;
    if (remaining <= 0) return { ok: true, inventory: next, overflow: [] };
  }

  while (remaining > 0 && next.length < INVENTORY_SLOT_COUNT) {
    const add = Math.min(remaining, stackLimit);
    next.push({ itemId, quantity: add });
    remaining -= add;
  }

  if (remaining > 0) {
    return {
      ok: false,
      reason: "full",
      inventory: normalizeInventory(inventory),
      overflow: [{ itemId, quantity: remaining }]
    };
  }

  return { ok: true, inventory: next, overflow: [] };
}

export function removeInventoryItems(inventory, itemId, quantity = 1) {
  const next = clone(normalizeInventory(inventory));
  let remaining = Math.max(1, Math.floor(Number(quantity) || 1));
  for (const entry of next) {
    if (entry.itemId !== itemId) continue;
    const remove = Math.min(remaining, entry.quantity);
    entry.quantity -= remove;
    remaining -= remove;
    if (remaining <= 0) break;
  }
  if (remaining > 0) return { ok: false, inventory: normalizeInventory(inventory) };
  return { ok: true, inventory: next.filter((entry) => entry.quantity > 0) };
}

export function hasInventoryItem(inventory, itemId) {
  return normalizeInventory(inventory).some((entry) => entry.itemId === itemId && entry.quantity > 0);
}
