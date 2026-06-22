import { STARTING_PLAYER, XP_TABLE } from "./constants.js";
import { getItem } from "./items.js";
import { applyProgressionStats, LEVEL_CAP } from "./progression.js";
import { hasInventoryItem } from "./inventory.js";
import { getFrostforgeRank, upgradedItemStats } from "./frostforge.js";

export const EQUIPMENT_SLOTS = ["head", "chest", "hands", "legs", "boots", "weapon", "offhand", "accessory"];

export function createEquipmentState(source = {}) {
  return Object.fromEntries(EQUIPMENT_SLOTS.map((slot) => [slot, source[slot] || null]));
}

export function slotForItem(item) {
  if (!item) return null;
  if (item.slot) return item.slot;
  if (item.type === "weapon" || item.type === "staff") return "weapon";
  if (item.type === "armor") return "chest";
  return null;
}

export function normalizeEquipment(player = {}) {
  return createEquipmentState({
    ...(player.equipment || {}),
    weapon: player.equipment?.weapon || player.equippedWeapon || STARTING_PLAYER.equippedWeapon,
    chest: player.equipment?.chest || player.equippedArmor || STARTING_PLAYER.equippedArmor
  });
}

export function ownsEquippableItem(player, itemId) {
  if (!itemId) return true;
  if (itemId === STARTING_PLAYER.equippedWeapon || itemId === STARTING_PLAYER.equippedArmor) return true;
  if (player.equippedWeapon === itemId || player.equippedArmor === itemId) return true;
  return hasInventoryItem(player.inventory, itemId);
}

export function equipItemToSlot(player, slot, itemId) {
  if (!EQUIPMENT_SLOTS.includes(slot)) return { ok: false, reason: "slot" };
  const item = getItem(itemId);
  if (!item) return { ok: false, reason: "item" };
  if (slotForItem(item) !== slot) return { ok: false, reason: "slot" };
  if (!ownsEquippableItem(player, itemId)) return { ok: false, reason: "missing" };
  if ((player.level || 1) < (item.level || 1)) return { ok: false, reason: "level" };

  const equipment = normalizeEquipment(player);
  equipment[slot] = itemId;
  return {
    ok: true,
    player: applyEquipmentSlots({
      ...player,
      equipment,
      equippedWeapon: equipment.weapon || STARTING_PLAYER.equippedWeapon,
      equippedArmor: equipment.chest || STARTING_PLAYER.equippedArmor
    })
  };
}

export function computeEquipmentBonuses(equipment, upgradeRanks = {}) {
  let attack = 0;
  let defense = 0;
  let magicPower = 0;
  let health = 0;
  let speedMultiplier = 1;

  for (const itemId of Object.values(equipment)) {
    const item = upgradedItemStats(getItem(itemId), getFrostforgeRank({ upgradeRanks }, itemId));
    if (!item) continue;
    attack += item.attack || 0;
    defense += item.defense || 0;
    magicPower += item.magicPower || 0;
    health += item.health || 0;
    speedMultiplier *= item.speed || 1;
  }

  return { attack, defense, magicPower, health, speedMultiplier };
}

function computeLevelFromXp(xp) {
  const safeXp = normalizeXp(xp);
  let level = 1;
  for (let i = 1; i < XP_TABLE.length; i += 1) {
    if (safeXp >= XP_TABLE[i]) level = i + 1;
  }
  return Math.min(level, LEVEL_CAP);
}

function normalizeXp(value) {
  const number = Number(value);
  if (!Number.isFinite(number) || number <= 0) return 0;
  return Math.min(Number.MAX_SAFE_INTEGER, Math.floor(number));
}

export function applyEquipmentSlots(player) {
  const equipment = normalizeEquipment(player);
  const bonuses = computeEquipmentBonuses(equipment, player.upgradeRanks || {});
  const level = computeLevelFromXp(player.xp || 0);
  const maxHealth = STARTING_PLAYER.maxHealth + (level - 1) * 14 + bonuses.health;
  const attack = STARTING_PLAYER.attack + (level - 1) * 2 + bonuses.attack;
  const defense = STARTING_PLAYER.defense + Math.floor((level - 1) / 2) + bonuses.defense;
  const speed = STARTING_PLAYER.speed * bonuses.speedMultiplier;

  return applyProgressionStats({
    ...player,
    level,
    equipment,
    equippedWeapon: equipment.weapon || STARTING_PLAYER.equippedWeapon,
    equippedArmor: equipment.chest || STARTING_PLAYER.equippedArmor,
    baseMaxHealth: maxHealth,
    baseAttack: attack,
    baseDefense: defense,
    itemMagicPower: bonuses.magicPower,
    maxHealth,
    health: Math.min(player.health ?? maxHealth, maxHealth),
    attack,
    defense,
    speed
  });
}
