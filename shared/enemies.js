import { ZONES } from "./constants.js";
import {
  ASHEN_EXPANSE_SPAWNS,
  CROWNFORGE_CITADEL_SPAWNS,
  EMBERDEEP_MINES_SPAWNS,
  IGNIVAR_BOSS,
  MARROWFIN_BOSS,
  MOLTAR_BOSS,
  NEREIDA_BOSS,
  SUNKEN_SANCTUM_SPAWNS,
  TIDERUIN_GARDENS_SPAWNS,
  TIDE_EMPRESS_ARENA_SPAWNS,
  V22_ENEMIES
} from "./expansionV22.js";
import {
  AURELION_BOSS,
  SKYBREAKER_RUINS_SPAWNS,
  STORMREACH_ISLES_SPAWNS,
  TEMPEST_GATE_SPAWNS,
  V23_ENEMIES,
  VOLTRUK_BOSS
} from "./expansionV23.js";

export const ENEMIES = {
  green_slime: {
    id: "green_slime",
    name: "Green Slime",
    family: "slime",
    zone: ZONES.FIELD,
    level: 1,
    maxHealth: 25,
    damage: 5,
    xp: 8,
    coins: [3, 8],
    speed: 1.35,
    attackRange: 1.35,
    attackCooldownMs: 1200,
    color: 0x54d46f,
    loot: [
      { itemId: "slime_gel", chance: 0.38 },
      { itemId: "small_health_potion", chance: 0.12 }
    ]
  },
  blue_slime: {
    id: "blue_slime",
    name: "Blue Slime",
    family: "slime",
    zone: ZONES.FIELD,
    level: 2,
    maxHealth: 35,
    damage: 7,
    xp: 12,
    coins: [5, 10],
    speed: 1.45,
    attackRange: 1.35,
    attackCooldownMs: 1150,
    color: 0x4da7ff,
    loot: [
      { itemId: "slime_gel", chance: 0.45 },
      { itemId: "rusty_blade", chance: 0.07 },
      { itemId: "small_health_potion", chance: 0.14 }
    ]
  },
  goblin_scout: {
    id: "goblin_scout",
    name: "Goblin Scout",
    family: "goblin",
    zone: ZONES.FIELD,
    level: 2,
    maxHealth: 45,
    damage: 9,
    xp: 18,
    coins: [8, 15],
    speed: 2.1,
    attackRange: 1.7,
    attackCooldownMs: 1100,
    color: 0xb1623e,
    loot: [
      { itemId: "goblin_dagger", chance: 0.12 },
      { itemId: "leather_vest", chance: 0.08 },
      { itemId: "small_health_potion", chance: 0.1 }
    ]
  },
  goblin_cutter: {
    id: "goblin_cutter",
    name: "Goblin Cutter",
    family: "goblin",
    zone: ZONES.FIELD,
    level: 3,
    maxHealth: 60,
    damage: 12,
    xp: 25,
    coins: [12, 20],
    speed: 2.2,
    attackRange: 1.8,
    attackCooldownMs: 1050,
    color: 0x9b3f33,
    loot: [
      { itemId: "goblin_dagger", chance: 0.18 },
      { itemId: "goblin_guardmail", chance: 0.09 },
      { itemId: "small_health_potion", chance: 0.1 }
    ]
  },
  gray_wolf: {
    id: "gray_wolf",
    name: "Gray Wolf",
    family: "wolf",
    zone: ZONES.FIELD,
    level: 3,
    maxHealth: 55,
    damage: 14,
    xp: 24,
    coins: [10, 18],
    speed: 3,
    attackRange: 1.9,
    attackCooldownMs: 1250,
    color: 0x89867e,
    loot: [
      { itemId: "wolf_fang_blade", chance: 0.12 },
      { itemId: "small_health_potion", chance: 0.08 }
    ]
  },
  forest_wisp: {
    id: "forest_wisp",
    name: "Forest Wisp",
    family: "wisp",
    zone: ZONES.FIELD,
    level: 4,
    maxHealth: 50,
    damage: 11,
    ranged: true,
    xp: 30,
    coins: [15, 25],
    speed: 1.85,
    attackRange: 5,
    attackCooldownMs: 1500,
    color: 0x90ffdc,
    loot: [
      { itemId: "magic_shard", chance: 0.35 },
      { itemId: "wisp_wand", chance: 0.1 },
      { itemId: "small_health_potion", chance: 0.11 }
    ]
  },
  stone_golem: {
    id: "stone_golem",
    name: "Stone Golem",
    family: "golem",
    zone: ZONES.FIELD,
    level: 5,
    maxHealth: 180,
    damage: 18,
    xp: 90,
    coins: [50, 90],
    speed: 0.92,
    attackRange: 2.25,
    attackCooldownMs: 1900,
    color: 0x77736b,
    loot: [
      { itemId: "stone_club", chance: 0.25 },
      { itemId: "stoneguard_plate", chance: 0.16 },
      { itemId: "small_health_potion", chance: 0.2 }
    ]
  },
  frost_slime: {
    id: "frost_slime",
    name: "Frost Slime",
    family: "slime",
    zone: ZONES.FROSTVEIL,
    level: 5,
    maxHealth: 72,
    damage: 15,
    xp: 42,
    coins: [18, 32],
    speed: 1.55,
    attackRange: 1.45,
    attackCooldownMs: 1120,
    color: 0x9fe7ff,
    loot: [
      { itemId: "ice_shard", chance: 0.55 },
      { itemId: "small_health_potion", chance: 0.13 }
    ]
  },
  ice_goblin: {
    id: "ice_goblin",
    name: "Ice Goblin",
    family: "goblin",
    zone: ZONES.FROSTVEIL,
    level: 6,
    maxHealth: 92,
    damage: 18,
    xp: 58,
    coins: [24, 42],
    speed: 2.2,
    attackRange: 1.8,
    attackCooldownMs: 1050,
    color: 0x6aa6c8,
    loot: [
      { itemId: "ice_shard", chance: 0.45 },
      { itemId: "ice_goblin_shiv", chance: 0.12 },
      { itemId: "small_health_potion", chance: 0.1 }
    ]
  },
  snow_wolf: {
    id: "snow_wolf",
    name: "Snow Wolf",
    family: "wolf",
    zone: ZONES.FROSTVEIL,
    level: 6,
    maxHealth: 86,
    damage: 19,
    xp: 62,
    coins: [22, 38],
    speed: 3.15,
    attackRange: 1.95,
    attackCooldownMs: 1150,
    color: 0xd8e5ec,
    loot: [
      { itemId: "ice_shard", chance: 0.35 },
      { itemId: "snowhide_helmet", chance: 0.08 },
      { itemId: "small_health_potion", chance: 0.1 }
    ]
  },
  frost_wisp: {
    id: "frost_wisp",
    name: "Frost Wisp",
    family: "wisp",
    zone: ZONES.FROSTVEIL,
    level: 7,
    maxHealth: 82,
    damage: 17,
    ranged: true,
    xp: 72,
    coins: [30, 48],
    speed: 1.95,
    attackRange: 5.8,
    attackCooldownMs: 1450,
    color: 0xb8fbff,
    loot: [
      { itemId: "ice_shard", chance: 0.42 },
      { itemId: "wispwood_staff", chance: 0.08 },
      { itemId: "small_health_potion", chance: 0.1 }
    ]
  },
  ice_golem: {
    id: "ice_golem",
    name: "Ice Golem",
    family: "golem",
    zone: ZONES.FROSTVEIL,
    level: 8,
    elite: true,
    maxHealth: 320,
    damage: 27,
    xp: 150,
    coins: [80, 130],
    speed: 0.85,
    attackRange: 2.55,
    attackCooldownMs: 2050,
    color: 0x8ed8ff,
    loot: [
      { itemId: "ice_shard", chance: 0.8, quantity: 2 },
      { itemId: "frostguard_chestplate", chance: 0.14 },
      { itemId: "frostbite_sword", chance: 0.1 },
      { itemId: "small_health_potion", chance: 0.18 }
    ]
  },
  frozen_knight: {
    id: "frozen_knight",
    name: "Frozen Knight",
    family: "knight",
    zone: ZONES.FROSTVEIL,
    level: 8,
    maxHealth: 185,
    damage: 24,
    xp: 118,
    coins: [58, 96],
    speed: 1.55,
    attackRange: 2,
    attackCooldownMs: 1350,
    color: 0xa8cad9,
    loot: [
      { itemId: "ice_shard", chance: 0.5 },
      { itemId: "frozen_knight_blade", chance: 0.12 },
      { itemId: "frozen_knight_shield", chance: 0.1 },
      { itemId: "small_health_potion", chance: 0.12 }
    ]
  },
  vault_sentinel: {
    id: "vault_sentinel",
    name: "Vault Sentinel",
    family: "construct",
    zone: ZONES.FROSTBOUND_VAULT,
    level: 15,
    elite: true,
    maxHealth: 460,
    damage: 34,
    xp: 180,
    coins: [90, 150],
    speed: 1.18,
    attackRange: 2.3,
    attackCooldownMs: 1650,
    color: 0x80c9df,
    loot: [
      { itemId: "iceguard_gauntlets", chance: 0.12 },
      { itemId: "zero_born_gloves", chance: 0.12 },
      { itemId: "dawnmender_wraps", chance: 0.12 },
      { itemId: "runic_core", chance: 0.18 }
    ]
  },
  rune_wraith: {
    id: "rune_wraith",
    name: "Rune Wraith",
    family: "wraith",
    zone: ZONES.FROSTBOUND_VAULT,
    level: 15,
    maxHealth: 240,
    damage: 29,
    ranged: true,
    xp: 120,
    coins: [62, 104],
    speed: 1.9,
    attackRange: 6,
    attackCooldownMs: 1450,
    color: 0xb8fbff,
    loot: [
      { itemId: "zero_born_crown", chance: 0.08 },
      { itemId: "dawnmender_circlet", chance: 0.08 },
      { itemId: "ice_shard", chance: 0.58, quantity: 2 }
    ]
  },
  runebound_colossus: {
    id: "runebound_colossus",
    name: "The Runebound Colossus",
    family: "construct",
    zone: ZONES.FROSTBOUND_VAULT,
    level: 16,
    elite: true,
    boss: true,
    maxHealth: 3600,
    damage: 42,
    xp: 620,
    coins: [280, 420],
    speed: 0.72,
    attackRange: 3,
    attackCooldownMs: 2100,
    color: 0x6ac9e6,
    loot: [
      { itemId: "iceguard_chestplate", chance: 0.2 },
      { itemId: "zero_born_robe", chance: 0.2 },
      { itemId: "dawnmender_vestments", chance: 0.2 },
      { itemId: "iceguard_helm", chance: 0.14 },
      { itemId: "zero_born_boots", chance: 0.14 },
      { itemId: "dawnmender_sandals", chance: 0.14 },
      { itemId: "runic_core", chance: 0.85, quantity: 2 }
    ]
  },
  shadow_slime: {
    id: "shadow_slime",
    name: "Shadow Slime",
    family: "slime",
    zone: ZONES.BOSS,
    level: 6,
    maxHealth: 70,
    damage: 13,
    xp: 18,
    coins: [8, 18],
    speed: 2.2,
    attackRange: 1.5,
    attackCooldownMs: 1000,
    color: 0x1a1430,
    loot: [
      { itemId: "shadow_scale", chance: 0.08 },
      { itemId: "small_health_potion", chance: 0.16 }
    ]
  },
  training_dummy: {
    id: "training_dummy",
    name: "Training Dummy",
    family: "dummy",
    zone: ZONES.HUB,
    level: 1,
    maxHealth: 120,
    damage: 0,
    xp: 0,
    coins: 0,
    speed: 0,
    attackRange: 0,
    attackCooldownMs: 999999,
    color: 0xc19458,
    loot: []
  },
  ...V22_ENEMIES,
  ...V23_ENEMIES
};

export const BOSS = {
  id: "shadow_wyrm",
  name: "Shadow Wyrm",
  family: "dragon",
  zone: ZONES.BOSS,
  level: 8,
  maxHealth: 1500,
  damage: 24,
  xp: 400,
  coins: 300,
  loot: [
    { itemId: "shadow_fang", chance: 0.32 },
    { itemId: "wyrm_scale_shield", chance: 0.28 },
    { itemId: "shadow_scale", chance: 0.72 },
    { itemId: "small_health_potion", chance: 0.5 }
  ]
};

export const ICE_MAGE_BOSS = {
  id: "zero_ice_mage",
  name: "Zero, the Ice Mage",
  family: "ice_mage",
  zone: ZONES.PALACE,
  level: 10,
  maxHealth: 2500,
  damage: 32,
  xp: 520,
  coins: 420,
  loot: [
    { itemId: "scepter_of_zero", chance: 0.16 },
    { itemId: "frostspire_staff", chance: 0.24 },
    { itemId: "frozen_crown", chance: 0.18 },
    { itemId: "glacier_robe", chance: 0.22 },
    { itemId: "icebound_gloves", chance: 0.28 },
    { itemId: "frostwalker_boots", chance: 0.26 },
    { itemId: "ice_shard", chance: 0.9, quantity: 3 },
    { itemId: "small_health_potion", chance: 0.5, quantity: 2 }
  ]
};

export { AURELION_BOSS, IGNIVAR_BOSS, MARROWFIN_BOSS, MOLTAR_BOSS, NEREIDA_BOSS, VOLTRUK_BOSS };

export const FIELD_SPAWNS = [
  { enemyId: "green_slime", count: 6, center: [-16, 0, -8], radius: 10 },
  { enemyId: "blue_slime", count: 4, center: [-24, 0, 14], radius: 8 },
  { enemyId: "goblin_scout", count: 4, center: [14, 0, -10], radius: 9 },
  { enemyId: "goblin_cutter", count: 3, center: [25, 0, -4], radius: 8 },
  { enemyId: "gray_wolf", count: 4, center: [2, 0, 24], radius: 11 },
  { enemyId: "forest_wisp", count: 3, center: [-30, 0, 28], radius: 7 },
  { enemyId: "stone_golem", count: 1, center: [30, 0, 24], radius: 3 }
];

export const FROSTVEIL_SPAWNS = [
  { enemyId: "frost_slime", count: 6, center: [-18, 0, 4], radius: 10, eliteChance: 0.08 },
  { enemyId: "ice_goblin", count: 4, center: [17, 0, 0], radius: 9, eliteChance: 0.1 },
  { enemyId: "snow_wolf", count: 4, center: [-8, 0, -20], radius: 10, eliteChance: 0.1 },
  { enemyId: "frost_wisp", count: 3, center: [24, 0, -22], radius: 8, eliteChance: 0.12 },
  { enemyId: "ice_golem", count: 1, center: [-28, 0, -28], radius: 4, eliteChance: 1 },
  { enemyId: "frozen_knight", count: 2, center: [32, 0, 18], radius: 7, eliteChance: 0.16 }
];

export const FROSTBOUND_VAULT_SPAWNS = [
  { enemyId: "rune_wraith", count: 3, center: [-12, 0, -8], radius: 5, eliteChance: 0.18 },
  { enemyId: "vault_sentinel", count: 2, center: [12, 0, -10], radius: 5, eliteChance: 1 },
  { enemyId: "rune_wraith", count: 2, center: [0, 0, -22], radius: 4, eliteChance: 0.25 },
  { enemyId: "runebound_colossus", count: 1, center: [0, 0, -26], radius: 1, eliteChance: 1 }
];

export {
  ASHEN_EXPANSE_SPAWNS,
  CROWNFORGE_CITADEL_SPAWNS,
  EMBERDEEP_MINES_SPAWNS,
  SUNKEN_SANCTUM_SPAWNS,
  SKYBREAKER_RUINS_SPAWNS,
  STORMREACH_ISLES_SPAWNS,
  TEMPEST_GATE_SPAWNS,
  TIDERUIN_GARDENS_SPAWNS,
  TIDE_EMPRESS_ARENA_SPAWNS
};

export const ELITE_MODIFIERS = {
  armored: { id: "armored", label: "Armored", healthMultiplier: 1.45, damageMultiplier: 1.08, speedMultiplier: 0.92, rewardMultiplier: 1.25 },
  swift: { id: "swift", label: "Swift", healthMultiplier: 1.18, damageMultiplier: 1.05, speedMultiplier: 1.28, rewardMultiplier: 1.18 },
  chilling: { id: "chilling", label: "Chilling", healthMultiplier: 1.25, damageMultiplier: 1.16, speedMultiplier: 1, rewardMultiplier: 1.22 },
  regenerating: { id: "regenerating", label: "Regenerating", healthMultiplier: 1.35, damageMultiplier: 1.02, speedMultiplier: 0.96, rewardMultiplier: 1.24 }
};

export function getEnemy(enemyId) {
  return ENEMIES[enemyId] || null;
}
