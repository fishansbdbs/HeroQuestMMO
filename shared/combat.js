import { XP_TABLE, STARTING_PLAYER } from "./constants.js";
import { getItem, ITEMS } from "./items.js";
import { applyProgressionStats, calculateDamageReduction, LEVEL_CAP } from "./progression.js";

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
  let level = 1;
  for (let i = 1; i < XP_TABLE.length; i += 1) {
    if (xp >= XP_TABLE[i]) level = i + 1;
  }
  return Math.min(level, LEVEL_CAP);
}

export function xpToNextLevel(level) {
  return XP_TABLE[level] ?? XP_TABLE[XP_TABLE.length - 1];
}

export function applyEquipment(basePlayer) {
  const player = { ...STARTING_PLAYER, ...basePlayer };
  const weapon = getItem(player.equippedWeapon) || ITEMS.wooden_sword;
  const armor = getItem(player.equippedArmor) || ITEMS.traveler_tunic;
  const level = computeLevelFromXp(player.xp || 0);
  const maxHealth = STARTING_PLAYER.maxHealth + (level - 1) * 14;
  const attack = STARTING_PLAYER.attack + (level - 1) * 2 + (weapon.attack || 0);
  const defense = STARTING_PLAYER.defense + Math.floor((level - 1) / 2) + (armor.defense || 0);
  const speed = STARTING_PLAYER.speed * (weapon.speed || 1) * (armor.speed || 1);
  return applyProgressionStats({
    ...player,
    level,
    baseMaxHealth: maxHealth,
    baseAttack: attack,
    baseDefense: defense,
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
  const xp = (before.xp || 0) + (reward.xp || 0);
  const coins = (before.coins || 0) + (reward.coins || 0);
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
