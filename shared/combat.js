import { XP_TABLE, STARTING_PLAYER } from "./constants.js";
import { getItem } from "./items.js";
import { applyProgressionStats, calculateDamageReduction, LEVEL_CAP } from "./progression.js";
import { normalizeEquipment } from "./equipment.js";
import { getFrostforgeRank, upgradedItemStats } from "./frostforge.js";

export function randomInt(min, max, rng = Math.random) {
  return Math.floor(rng() * (max - min + 1)) + min;
}

export function distance2d(a, b) {
  const dx = (a.x || 0) - (b.x || 0);
  const dz = (a.z || 0) - (b.z || 0);
  return Math.sqrt(dx * dx + dz * dz);
}

export function isPlayerDead(player) {
  return !player || player.state === "dead" || (player.health ?? 0) <= 0;
}

export function computeLevelFromXp(xp) {
  const safeXp = normalizeXp(xp);
  let level = 1;
  for (let i = 1; i < XP_TABLE.length; i += 1) {
    if (safeXp >= XP_TABLE[i]) level = i + 1;
  }
  return Math.min(level, LEVEL_CAP);
}

export function xpToNextLevel(level) {
  const safeLevel = Math.max(1, Math.floor(Number(level) || 1));
  if (safeLevel >= LEVEL_CAP) return null;
  return XP_TABLE[safeLevel] ?? null;
}

export function applyEquipment(basePlayer) {
  const player = { ...STARTING_PLAYER, ...basePlayer };
  const equipment = normalizeEquipment(player);
  const equippedItems = Object.values(equipment)
    .map((itemId) => upgradedItemStats(getItem(itemId), getFrostforgeRank(player, itemId)))
    .filter(Boolean);
  const level = computeLevelFromXp(player.xp || 0);
  const itemAttack = equippedItems.reduce((total, item) => total + (item.attack || 0), 0);
  const itemDefense = equippedItems.reduce((total, item) => total + (item.defense || 0), 0);
  const itemHealth = equippedItems.reduce((total, item) => total + (item.health || 0), 0);
  const itemMagicPower = equippedItems.reduce((total, item) => total + (item.magicPower || 0), 0);
  const itemSpeedMultiplier = equippedItems.reduce((total, item) => total * (item.speed || 1), 1);
  const maxHealth = STARTING_PLAYER.maxHealth + (level - 1) * 14 + itemHealth;
  const attack = STARTING_PLAYER.attack + (level - 1) * 2 + itemAttack;
  const defense = STARTING_PLAYER.defense + Math.floor((level - 1) / 2) + itemDefense;
  const speed = STARTING_PLAYER.speed * itemSpeedMultiplier;
  return applyProgressionStats({
    ...player,
    equipment,
    equippedWeapon: equipment.weapon || STARTING_PLAYER.equippedWeapon,
    equippedArmor: equipment.chest || STARTING_PLAYER.equippedArmor,
    level,
    baseMaxHealth: maxHealth,
    baseAttack: attack,
    baseDefense: defense,
    itemMagicPower,
    maxHealth,
    health: Math.min(player.health ?? maxHealth, maxHealth),
    attack,
    defense,
    speed
  });
}

export function calculatePlayerDamage(player, rng = Math.random) {
  const stats = applyEquipment(player);
  const variance = randomInt(-2, 3, rng);
  return Math.max(1, stats.attack + variance);
}

export function calculateIncomingDamage(rawDamage, player) {
  const stats = player?.baseDefense != null || player?.baseMaxHealth != null ? applyProgressionStats(player) : applyEquipment(player);
  return Math.max(1, Math.round(rawDamage * (1 - calculateDamageReduction(stats.defense))));
}

export function addProgressRewards(player, reward) {
  const before = applyEquipment(player);
  const xp = normalizeXp(normalizeXp(before.xp) + normalizeXp(reward.xp));
  const coins = Math.max(0, Math.floor((Number(before.coins) || 0) + (Number(reward.coins) || 0)));
  const afterLevel = computeLevelFromXp(xp);
  const leveledUp = afterLevel > before.level;
  const after = applyEquipment({
    ...before,
    xp,
    coins,
    level: afterLevel
  });
  return {
    ...after,
    health: leveledUp ? after.maxHealth : after.health,
    mana: leveledUp ? after.maxMana : after.mana
  };
}

function normalizeXp(value) {
  const number = Number(value);
  if (!Number.isFinite(number) || number <= 0) return 0;
  return Math.min(Number.MAX_SAFE_INTEGER, Math.floor(number));
}

export function addInventoryItem(inventory, itemId, quantity = 1) {
  const next = [...(inventory || [])];
  const existing = next.find((entry) => entry.itemId === itemId);
  if (existing) existing.quantity += quantity;
  else next.push({ itemId, quantity });
  return next;
}

export function consumeInventoryItem(inventory, itemId, quantity = 1) {
  const next = [...(inventory || [])];
  const existing = next.find((entry) => entry.itemId === itemId);
  if (!existing || existing.quantity < quantity) {
    return { inventory: next, consumed: false };
  }
  existing.quantity -= quantity;
  return { inventory: next.filter((entry) => entry.quantity > 0), consumed: true };
}

export function rollLoot(enemy, rng = Math.random) {
  const coins = Array.isArray(enemy.coins) ? randomInt(enemy.coins[0], enemy.coins[1], rng) : enemy.coins || 0;
  const items = [];
  for (const loot of enemy.loot || []) {
    if (rng() <= loot.chance) {
      items.push({ itemId: loot.itemId, quantity: loot.quantity || 1 });
    }
  }
  return { coins, xp: enemy.xp || 0, items };
}
