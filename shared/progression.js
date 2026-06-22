export const LEVEL_CAP = 15;
export const ATTRIBUTE_POINTS_PER_LEVEL = 3;
export const SKILL_POINTS_PER_LEVEL = 1;
export const BASE_MANA = 50;
export const REST_STONE_ITEM_ID = "rest_stone";

export const ATTRIBUTES = {
  health: {
    id: "health",
    name: "Health",
    maxHealth: 12,
    potionBonus: 1
  },
  strength: {
    id: "strength",
    name: "Strength",
    physicalPower: 2,
    knockbackBonus: 0.04
  },
  magic: {
    id: "magic",
    name: "Magic",
    spellPower: 2,
    healingPower: 2,
    maxMana: 5
  },
  defense: {
    id: "defense",
    name: "Defense",
    defense: 2,
    guardBonus: 0.01
  }
};

const ATTRIBUTE_IDS = Object.keys(ATTRIBUTES);

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function finiteNumber(value, fallback = 0) {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

function nonNegativeInt(value, fallback = 0) {
  return Math.max(0, Math.floor(finiteNumber(value, fallback)));
}

function asObject(value) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}

function normalizeLevel(level) {
  return Math.max(1, Math.min(LEVEL_CAP, nonNegativeInt(level, 1)));
}

export function normalizeSpentAttributes(value = {}) {
  const source = asObject(value);
  return Object.fromEntries(ATTRIBUTE_IDS.map((id) => [id, nonNegativeInt(source[id], 0)]));
}

export function calculateEarnedAttributePoints(level) {
  return Math.max(0, (normalizeLevel(level) - 1) * ATTRIBUTE_POINTS_PER_LEVEL);
}

export function calculateEarnedSkillPoints(level) {
  return Math.max(0, (normalizeLevel(level) - 1) * SKILL_POINTS_PER_LEVEL);
}

export function calculateSpentSkillPoints(skillTreeNodes = {}) {
  return Object.values(asObject(skillTreeNodes)).reduce((total, value) => total + nonNegativeInt(value, 0), 0);
}

export function calculateDamageReduction(defense) {
  const safeDefense = Math.max(0, finiteNumber(defense, 0));
  return Math.min(0.85, safeDefense / (safeDefense + 100));
}

export function calculateAttributeBonuses(spentAttributes = {}) {
  const spent = normalizeSpentAttributes(spentAttributes);
  return {
    maxHealth: spent.health * ATTRIBUTES.health.maxHealth,
    physicalPower: spent.strength * ATTRIBUTES.strength.physicalPower,
    spellPower: spent.magic * ATTRIBUTES.magic.spellPower,
    healingPower: spent.magic * ATTRIBUTES.magic.healingPower,
    maxMana: spent.magic * ATTRIBUTES.magic.maxMana,
    defense: spent.defense * ATTRIBUTES.defense.defense,
    potionBonus: spent.health * ATTRIBUTES.health.potionBonus,
    guardBonus: spent.defense * ATTRIBUTES.defense.guardBonus
  };
}

export function applyProgressionStats(player) {
  const level = normalizeLevel(player.level);
  const spentAttributes = normalizeSpentAttributes(player.spentAttributes);
  const skillTreeNodes = asObject(player.skillTreeNodes);
  const bonuses = calculateAttributeBonuses(spentAttributes);
  const baseMaxHealth = Math.max(1, finiteNumber(player.baseMaxHealth, finiteNumber(player.maxHealth, 100)));
  const baseAttack = finiteNumber(player.baseAttack, finiteNumber(player.attack, 10));
  const baseDefense = Math.max(0, finiteNumber(player.baseDefense, finiteNumber(player.defense, 0)));
  const itemMagicPower = Math.max(0, finiteNumber(player.itemMagicPower, finiteNumber(player.magicPower, 0)));
  const oldMaxHealth = Math.max(1, finiteNumber(player.maxHealth, baseMaxHealth));
  const oldMaxMana = Math.max(1, finiteNumber(player.maxMana, BASE_MANA));
  const maxHealth = baseMaxHealth + bonuses.maxHealth;
  const maxMana = BASE_MANA + bonuses.maxMana;
  const healthValue = Number.isFinite(Number(player.health)) ? Math.max(0, Number(player.health)) : maxHealth;
  const manaValue = Number.isFinite(Number(player.mana)) ? Math.max(0, Number(player.mana)) : maxMana;
  const health = Math.min(maxHealth, healthValue + Math.max(0, maxHealth - oldMaxHealth));
  const mana = Math.min(maxMana, manaValue + Math.max(0, maxMana - oldMaxMana));
  const availableAttributePoints = Math.max(
    0,
    calculateEarnedAttributePoints(level) -
      Object.values(spentAttributes).reduce((total, value) => total + value, 0)
  );
  const availableSkillPoints = Math.max(0, calculateEarnedSkillPoints(level) - calculateSpentSkillPoints(skillTreeNodes));
  const defense = baseDefense + bonuses.defense;

  return {
    ...player,
    level,
    baseMaxHealth,
    baseAttack,
    baseDefense,
    spentAttributes,
    availableAttributePoints,
    availableSkillPoints,
    skillTreeNodes,
    physicalPower: bonuses.physicalPower,
    magicPower: itemMagicPower,
    spellPower: bonuses.spellPower + itemMagicPower,
    healingPower: bonuses.healingPower + itemMagicPower,
    potionBonus: bonuses.potionBonus,
    guardBonus: bonuses.guardBonus,
    maxMana,
    mana,
    maxHealth,
    health,
    attack: baseAttack + bonuses.physicalPower,
    defense,
    damageReduction: calculateDamageReduction(defense)
  };
}

export function spendAttributePoint(player, attributeId, count = 1) {
  if (!ATTRIBUTES[attributeId]) return { ok: false, reason: "attribute" };
  const spendCount = Math.max(1, Math.floor(finiteNumber(count, 1)));
  const current = applyProgressionStats(player);
  if (current.availableAttributePoints < spendCount) return { ok: false, reason: "points" };

  const spentAttributes = {
    ...current.spentAttributes,
    [attributeId]: current.spentAttributes[attributeId] + spendCount
  };
  return {
    ok: true,
    player: applyProgressionStats({ ...current, spentAttributes })
  };
}

export function spendMana(player, cost) {
  const current = applyProgressionStats(player);
  const manaCost = Math.max(0, finiteNumber(cost, 0));
  if (current.mana < manaCost) return { ok: false, reason: "mana", player: current };
  return { ok: true, player: { ...current, mana: current.mana - manaCost } };
}

export function regenerateMana(player, dtSeconds, inCombat = false) {
  const current = applyProgressionStats(player);
  const rate = inCombat ? 2 : 4;
  return {
    ...current,
    mana: Math.min(current.maxMana, current.mana + Math.max(0, finiteNumber(dtSeconds, 0)) * rate)
  };
}

export function useRestStone(player) {
  const current = applyProgressionStats(player);
  const inventory = Array.isArray(current.inventory) ? clone(current.inventory) : [];
  const restStone = inventory.find((entry) => entry.itemId === REST_STONE_ITEM_ID && nonNegativeInt(entry.quantity, 0) > 0);
  if (!restStone) return { ok: false, reason: "missing", player: current };

  restStone.quantity -= 1;
  const nextInventory = inventory.filter((entry) => nonNegativeInt(entry.quantity, 0) > 0);
  const reset = applyProgressionStats({
    ...current,
    inventory: nextInventory,
    spentAttributes: { health: 0, strength: 0, magic: 0, defense: 0 },
    skillTreeNodes: {}
  });

  return {
    ok: true,
    player: {
      ...reset,
      health: Math.max(1, Math.min(reset.health, reset.maxHealth)),
      mana: Math.min(reset.mana, reset.maxMana)
    }
  };
}
