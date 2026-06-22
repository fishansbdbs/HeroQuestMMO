import { getItem } from "./items.js";
import { hasInventoryItem, normalizeInventory, removeInventoryItems } from "./inventory.js";

export const FROSTFORGE_MAX_RANK = 5;

export const FROSTFORGE_COSTS = {
  1: { coins: 60, materials: { ice_shard: 2 } },
  2: { coins: 120, materials: { ice_shard: 4 } },
  3: { coins: 220, materials: { ice_shard: 6, wyrm_scale: 1 } },
  4: { coins: 380, materials: { ice_shard: 8, wyrm_scale: 2, runic_core: 1 } },
  5: { coins: 600, materials: { ice_shard: 12, wyrm_scale: 3, runic_core: 2 } }
};

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function nonNegativeInt(value, fallback = 0) {
  const number = Number(value);
  if (!Number.isFinite(number)) return fallback;
  return Math.max(0, Math.floor(number));
}

function clampedRank(value) {
  return Math.min(FROSTFORGE_MAX_RANK, nonNegativeInt(value));
}

export function isFrostforgeUpgradeable(itemId) {
  const item = getItem(itemId);
  return Boolean(item && (item.type === "weapon" || item.type === "staff" || item.type === "armor"));
}

export function getFrostforgeRank(player = {}, itemId) {
  return clampedRank(player.upgradeRanks?.[itemId]);
}

export function frostforgeUpgradeCost(nextRank) {
  const rank = Math.max(1, Math.min(FROSTFORGE_MAX_RANK, nonNegativeInt(nextRank, 1)));
  return clone(FROSTFORGE_COSTS[rank]);
}

export function upgradeDisplayName(itemId, rank = 0) {
  const item = getItem(itemId);
  const suffix = clampedRank(rank);
  return `${item?.name || itemId}${suffix > 0 ? ` +${suffix}` : ""}`;
}

export function upgradedItemStats(item, rank = 0) {
  if (!item) return null;
  const nextRank = clampedRank(rank);
  if (nextRank <= 0) return item;

  const upgraded = { ...item };
  if (item.type === "staff") upgraded.magicPower = nonNegativeInt(item.magicPower) + nextRank;
  else if (item.type === "armor") upgraded.defense = nonNegativeInt(item.defense) + nextRank;
  else upgraded.attack = nonNegativeInt(item.attack) + nextRank;

  if (item.health) upgraded.health = nonNegativeInt(item.health) + nextRank * 2;
  return upgraded;
}

export function frostforgeUpgradePreview(itemId, currentRank = 0) {
  const item = getItem(itemId);
  if (!item || !isFrostforgeUpgradeable(itemId)) return null;
  const rank = clampedRank(currentRank);
  const nextRank = Math.min(FROSTFORGE_MAX_RANK, rank + 1);
  return {
    itemId,
    rank,
    nextRank,
    current: upgradedItemStats(item, rank),
    next: upgradedItemStats(item, nextRank),
    cost: rank >= FROSTFORGE_MAX_RANK ? null : frostforgeUpgradeCost(nextRank)
  };
}

export function upgradeFrostforgeItem(player = {}, itemId) {
  const item = getItem(itemId);
  if (!item) return { ok: false, reason: "item" };
  if (!isFrostforgeUpgradeable(itemId)) return { ok: false, reason: "not_upgradeable" };
  if (!ownsFrostforgeItem(player, itemId)) return { ok: false, reason: "missing" };

  const currentRank = getFrostforgeRank(player, itemId);
  if (currentRank >= FROSTFORGE_MAX_RANK) return { ok: false, reason: "max_rank" };

  const nextRank = currentRank + 1;
  const cost = frostforgeUpgradeCost(nextRank);
  if (nonNegativeInt(player.coins) < cost.coins) return { ok: false, reason: "coins", cost };

  const missing = missingMaterials(player.inventory, cost.materials);
  if (missing.length) return { ok: false, reason: "materials", cost, missing };

  let inventory = normalizeInventory(player.inventory);
  for (const [materialId, quantity] of Object.entries(cost.materials)) {
    const removed = removeInventoryItems(inventory, materialId, quantity);
    if (!removed.ok) return { ok: false, reason: "materials", cost, missing: [{ itemId: materialId, quantity }] };
    inventory = removed.inventory;
  }

  const upgradeRanks = {
    ...(player.upgradeRanks || {}),
    [itemId]: nextRank
  };

  return {
    ok: true,
    itemId,
    rank: nextRank,
    cost,
    player: {
      ...player,
      coins: nonNegativeInt(player.coins) - cost.coins,
      inventory,
      upgradeRanks
    }
  };
}

function ownsFrostforgeItem(player, itemId) {
  if (!itemId) return false;
  if (hasInventoryItem(player.inventory, itemId)) return true;
  const equipment = player.equipment || {};
  return Object.values(equipment).includes(itemId) || player.equippedWeapon === itemId || player.equippedArmor === itemId;
}

function missingMaterials(inventory, materials = {}) {
  return Object.entries(materials)
    .filter(([itemId, quantity]) => inventoryQuantity(inventory, itemId) < quantity)
    .map(([itemId, quantity]) => ({ itemId, quantity }));
}

function inventoryQuantity(inventory, itemId) {
  return normalizeInventory(inventory)
    .filter((entry) => entry.itemId === itemId)
    .reduce((total, entry) => total + entry.quantity, 0);
}
