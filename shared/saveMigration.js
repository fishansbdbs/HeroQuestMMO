import { STARTING_PLAYER } from "./constants.js";
import { createEquipmentState } from "./equipment.js";
import { STARTER_INVENTORY } from "./items.js";
import { createQuestProgress } from "./quests.js";

export const ICEZERO_SAVE_SCHEMA_VERSION = 2;
export const ICEZERO_MIGRATION_ID = "icezero-v2-save-migration";
export const HERO_PULSE_REFUND_MESSAGE =
  "Combat training has changed. Visit the Mage Trainer in Dawnrest to relearn Hero Pulse.";

const BASE_MANA = 50;
const ATTRIBUTE_IDS = ["health", "strength", "magic", "defense"];
const DEFAULT_HOTBAR = ["auto", "slash", null, "guard", "potion", "dash", null, null];

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function asObject(value) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}

function finiteNumber(value, fallback = 0) {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

function nonNegativeInt(value, fallback = 0) {
  return Math.max(0, Math.floor(finiteNumber(value, fallback)));
}

function positiveNumber(value, fallback) {
  const number = finiteNumber(value, fallback);
  return number > 0 ? number : fallback;
}

function uniqueStrings(value) {
  if (!Array.isArray(value)) return [];
  return [...new Set(value.filter((entry) => typeof entry === "string"))];
}

function normalizeInventory(inventory) {
  if (!Array.isArray(inventory)) return clone(STARTER_INVENTORY);
  return inventory
    .filter((entry) => entry && typeof entry.itemId === "string")
    .map((entry) => ({
      itemId: entry.itemId,
      quantity: Math.max(1, Math.floor(finiteNumber(entry.quantity, 1)))
    }));
}

function normalizeSpentAttributes(value) {
  const source = asObject(value);
  return Object.fromEntries(ATTRIBUTE_IDS.map((id) => [id, nonNegativeInt(source[id], 0)]));
}

function spentSkillPoints(source) {
  const explicit = Number(source.spentSkillPoints);
  if (Number.isFinite(explicit)) return Math.max(0, Math.floor(explicit));

  const nodes = asObject(source.skillTreeNodes || source.skillTree);
  return Object.values(nodes).reduce((total, value) => total + nonNegativeInt(value, 0), 0);
}

function parseSaveInput(input) {
  const errors = [];
  const backup = {};

  if (typeof input === "string") {
    backup.raw = input;
    try {
      const parsed = JSON.parse(input);
      return { source: asObject(parsed), backup, errors };
    } catch (error) {
      errors.push(error.message);
      return { source: {}, backup, errors };
    }
  }

  if (input && typeof input === "object") {
    const source = asObject(input.save && input.backup ? input.save : input);
    backup.save = clone(source);
    return { source, backup, errors };
  }

  errors.push("Save data was not a readable object.");
  return { source: {}, backup, errors };
}

function createDefaultIceZeroSave() {
  return {
    ...clone(STARTING_PLAYER),
    name: "",
    color: 0x4da7ff,
    inventory: clone(STARTER_INVENTORY),
    equipment: createEquipmentState({
      weapon: STARTING_PLAYER.equippedWeapon,
      chest: STARTING_PLAYER.equippedArmor
    }),
    openedChests: [],
    questProgress: createQuestProgress(),
    title: "",
    settings: {},
    migrations: [],
    saveSchemaVersion: ICEZERO_SAVE_SCHEMA_VERSION,
    spentAttributes: { health: 0, strength: 0, magic: 0, defense: 0 },
    availableAttributePoints: 0,
    availableSkillPoints: 0,
    skillTreeNodes: {},
    learnedAbilities: [],
    hotbar: clone(DEFAULT_HOTBAR),
    savedBuilds: { A: null, B: null },
    bestiaryProgress: {},
    zoneCompletion: {},
    waypoints: ["dawnrest"],
    achievements: [],
    firstClearRewards: {},
    restStones: 0,
    maxMana: BASE_MANA,
    mana: BASE_MANA
  };
}

export function migrateIceZeroSave(input) {
  const { source, backup, errors } = parseSaveInput(input);
  const base = createDefaultIceZeroSave();
  const existingMigrations = uniqueStrings(source.migrations);
  const alreadyMigrated = existingMigrations.includes(ICEZERO_MIGRATION_ID);
  const messages = [];

  const level = Math.max(1, nonNegativeInt(source.level, base.level));
  const spentAttributes = normalizeSpentAttributes(source.spentAttributes);
  const spentAttributePoints = Object.values(spentAttributes).reduce((total, value) => total + value, 0);
  const earnedAttributePoints = Math.max(0, (level - 1) * 3);
  const earnedSkillPoints = Math.max(0, level - 1);
  const availableAttributePoints = Math.max(0, earnedAttributePoints - spentAttributePoints);
  const availableSkillPoints = Math.max(0, earnedSkillPoints - spentSkillPoints(source));
  const maxHealth = positiveNumber(source.maxHealth, STARTING_PLAYER.maxHealth + (level - 1) * 14);
  const health = positiveNumber(source.health, maxHealth);
  const learnedBefore = uniqueStrings(source.learnedAbilities);
  const hotbarBefore = Array.isArray(source.hotbar) ? clone(source.hotbar) : clone(DEFAULT_HOTBAR);
  const hadLegacyHeroPulse = learnedBefore.includes("hero_pulse") || hotbarBefore.includes("hero_pulse");
  const removeLegacyHeroPulse = hadLegacyHeroPulse && !alreadyMigrated;
  const maxMana = positiveNumber(source.maxMana, BASE_MANA + spentAttributes.magic * 5);
  const mana = Number.isFinite(Number(source.mana))
    ? Math.min(maxMana, Math.max(0, Number(source.mana)))
    : maxMana;
  const sourceEquipment = asObject(source.equipment);
  const equippedWeapon = typeof source.equippedWeapon === "string" ? source.equippedWeapon : base.equippedWeapon;
  const equippedArmor = typeof source.equippedArmor === "string" ? source.equippedArmor : base.equippedArmor;
  const equipment = createEquipmentState({
    ...sourceEquipment,
    weapon: typeof sourceEquipment.weapon === "string" ? sourceEquipment.weapon : equippedWeapon,
    chest: typeof sourceEquipment.chest === "string" ? sourceEquipment.chest : equippedArmor
  });

  if (removeLegacyHeroPulse) {
    messages.push(HERO_PULSE_REFUND_MESSAGE);
  }

  const migrations = alreadyMigrated ? existingMigrations : [...existingMigrations, ICEZERO_MIGRATION_ID];
  const save = {
    ...base,
    ...clone(source),
    name: typeof source.name === "string" ? source.name : base.name,
    color: finiteNumber(source.color, base.color),
    level,
    xp: nonNegativeInt(source.xp, base.xp),
    coins: nonNegativeInt(source.coins, base.coins) + (removeLegacyHeroPulse ? 100 : 0),
    health: Math.min(health, maxHealth),
    maxHealth,
    inventory: normalizeInventory(source.inventory),
    equipment,
    equippedWeapon: equipment.weapon || base.equippedWeapon,
    equippedArmor: equipment.chest || base.equippedArmor,
    openedChests: uniqueStrings(source.openedChests),
    questProgress: { ...base.questProgress, ...asObject(source.questProgress) },
    title: typeof source.title === "string" ? source.title : base.title,
    settings: asObject(source.settings),
    migrations,
    saveSchemaVersion: ICEZERO_SAVE_SCHEMA_VERSION,
    spentAttributes,
    availableAttributePoints,
    availableSkillPoints,
    skillTreeNodes: asObject(source.skillTreeNodes),
    learnedAbilities: removeLegacyHeroPulse
      ? learnedBefore.filter((abilityId) => abilityId !== "hero_pulse")
      : learnedBefore,
    hotbar: removeLegacyHeroPulse
      ? hotbarBefore.map((abilityId) => (abilityId === "hero_pulse" ? null : abilityId))
      : hotbarBefore,
    savedBuilds: asObject(source.savedBuilds || base.savedBuilds),
    bestiaryProgress: asObject(source.bestiaryProgress),
    zoneCompletion: asObject(source.zoneCompletion),
    waypoints: uniqueStrings(source.waypoints).length ? uniqueStrings(source.waypoints) : clone(base.waypoints),
    achievements: uniqueStrings(source.achievements),
    firstClearRewards: asObject(source.firstClearRewards),
    restStones: nonNegativeInt(source.restStones, 0),
    maxMana,
    mana
  };

  return {
    save,
    backup,
    migrated: !alreadyMigrated || errors.length > 0,
    messages,
    errors
  };
}
