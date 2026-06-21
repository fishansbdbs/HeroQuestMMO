import { ZONES } from "./constants.js";

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
  }
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

export const FIELD_SPAWNS = [
  { enemyId: "green_slime", count: 6, center: [-16, 0, -8], radius: 10 },
  { enemyId: "blue_slime", count: 4, center: [-24, 0, 14], radius: 8 },
  { enemyId: "goblin_scout", count: 4, center: [14, 0, -10], radius: 9 },
  { enemyId: "goblin_cutter", count: 3, center: [25, 0, -4], radius: 8 },
  { enemyId: "gray_wolf", count: 4, center: [2, 0, 24], radius: 11 },
  { enemyId: "forest_wisp", count: 3, center: [-30, 0, 28], radius: 7 },
  { enemyId: "stone_golem", count: 1, center: [30, 0, 24], radius: 3 }
];

export function getEnemy(enemyId) {
  return ENEMIES[enemyId] || null;
}
