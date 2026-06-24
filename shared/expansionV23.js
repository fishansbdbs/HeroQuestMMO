import { ZONES } from "./constants.js";

export const V23_MATERIAL_ITEMS = {
  storm_gel: {
    id: "storm_gel",
    name: "Storm Gel",
    type: "material",
    rarity: "Common",
    stackable: true,
    maxStack: 99,
    sellValue: 6,
    icon: "SG",
    source: "Spark Slimes",
    description: "A quivering gel that crackles when squeezed."
  },
  shock_shell: {
    id: "shock_shell",
    name: "Shock Shell",
    type: "material",
    rarity: "Common",
    stackable: true,
    maxStack: 99,
    sellValue: 8,
    icon: "SS",
    source: "Storm Crabs",
    description: "A crystal crab shell that stores a small static charge."
  },
  thunder_feather: {
    id: "thunder_feather",
    name: "Thunder Feather",
    type: "material",
    rarity: "Uncommon",
    stackable: true,
    maxStack: 99,
    sellValue: 10,
    icon: "TF",
    source: "Thunder Hawks",
    description: "A feather with a bright yellow quill."
  },
  cloud_essence: {
    id: "cloud_essence",
    name: "Cloud Essence",
    type: "material",
    rarity: "Uncommon",
    stackable: true,
    maxStack: 99,
    sellValue: 12,
    icon: "CE",
    source: "Cloud Wisps",
    description: "Mist captured around a flickering storm core."
  },
  charged_scale: {
    id: "charged_scale",
    name: "Charged Scale",
    type: "material",
    rarity: "Rare",
    stackable: true,
    maxStack: 99,
    sellValue: 20,
    icon: "CS",
    source: "Crystal Eels and Skybreaker Ruins",
    description: "An eel scale that tingles against metal."
  },
  storm_core: {
    id: "storm_core",
    name: "Storm Core",
    type: "material",
    rarity: "Rare",
    stackable: true,
    maxStack: 50,
    sellValue: 35,
    icon: "SC",
    source: "Thunder Golems and Voltruk",
    description: "A condensed heart of thunder."
  },
  titan_spark: {
    id: "titan_spark",
    name: "Titan Spark",
    type: "material",
    rarity: "Epic",
    stackable: true,
    maxStack: 20,
    sellValue: 80,
    icon: "TS",
    source: "Aurelion, the Storm Titan",
    description: "A tiny immortal spark from a storm titan's crown."
  }
};

export const V23_ITEMS = {
  ...V23_MATERIAL_ITEMS,
  stormblade: {
    id: "stormblade",
    name: "Stormblade",
    type: "weapon",
    slot: "weapon",
    rarity: "Rare",
    level: 30,
    attack: 34,
    magicPower: 4,
    lightningPower: 6,
    speed: 1.04,
    sellValue: 420,
    icon: "SB",
    visualColor: 0x6bdfff,
    visualProfile: "stormblade-electric-edge",
    source: "Stormreach Isles",
    description: "A narrow blade with a blue electric edge."
  },
  thunder_pike: {
    id: "thunder_pike",
    name: "Thunder Pike",
    type: "weapon",
    slot: "weapon",
    rarity: "Rare",
    level: 31,
    attack: 38,
    strength: 4,
    speed: 0.96,
    meleeRangeBonus: 0.35,
    sellValue: 460,
    icon: "TP",
    visualColor: 0xd8f6ff,
    visualProfile: "thunder-pike-long-fork",
    source: "Shipwreck Raiders",
    description: "A long spear capped with forked lightning steel."
  },
  stormcaller_staff: {
    id: "stormcaller_staff",
    name: "Stormcaller Staff",
    type: "staff",
    slot: "weapon",
    rarity: "Rare",
    level: 32,
    magicPower: 28,
    maxMana: 18,
    stormBoltBonus: 0.12,
    speed: 1,
    sellValue: 520,
    icon: "ST",
    visualColor: 0xa774ff,
    visualProfile: "stormcaller-floating-crystal",
    source: "Cloud Wisps and Tempest Sage Iona",
    description: "A staff with a storm crystal floating above its head."
  },
  skybreaker_hammer: {
    id: "skybreaker_hammer",
    name: "Skybreaker Hammer",
    type: "weapon",
    slot: "weapon",
    rarity: "Epic",
    level: 34,
    attack: 48,
    strength: 8,
    speed: 0.78,
    thunderLeapBonus: 0.14,
    sellValue: 760,
    icon: "SH",
    visualColor: 0x4b6178,
    visualProfile: "skybreaker-stone-hammer",
    source: "Voltruk, the Skybreaker",
    description: "A heavy hammer made from storm-ruin stone."
  },
  aurelions_spear: {
    id: "aurelions_spear",
    name: "Aurelion's Spear",
    type: "weapon",
    slot: "weapon",
    rarity: "Epic",
    level: 36,
    attack: 52,
    magicPower: 12,
    lightningPower: 14,
    speed: 0.94,
    sellValue: 1050,
    icon: "AS",
    visualColor: 0xfff38a,
    visualProfile: "aurelion-spear-crown",
    source: "Aurelion, the Storm Titan",
    description: "A titan spear with a crown-shaped lightning head."
  },
  scepter_of_tempests: {
    id: "scepter_of_tempests",
    name: "Scepter of Tempests",
    type: "staff",
    slot: "weapon",
    rarity: "Epic",
    level: 36,
    magicPower: 42,
    maxMana: 30,
    stormBoltBonus: 0.2,
    staticRenewalBonus: 0.14,
    speed: 1,
    sellValue: 1050,
    icon: "SP",
    visualColor: 0xb48cff,
    visualProfile: "tempest-scepter-orbit",
    source: "Aurelion, the Storm Titan",
    description: "A scepter orbited by small storm motes."
  },
  stormwall_shield: {
    id: "stormwall_shield",
    name: "Stormwall Shield",
    type: "armor",
    slot: "offhand",
    rarity: "Rare",
    level: 30,
    defense: 18,
    health: 55,
    lightningResistance: 12,
    speed: 0.98,
    sellValue: 470,
    icon: "SW",
    visualColor: 0x264c7a,
    visualProfile: "stormwall-round-shield",
    source: "Stormbound Knights",
    description: "A round shield with a lightning rod spine."
  },
  stormguard_helm: {
    id: "stormguard_helm",
    name: "Stormguard Helm",
    type: "armor",
    slot: "head",
    setId: "stormguard",
    rarity: "Rare",
    level: 30,
    defense: 9,
    magicPower: 4,
    lightningResistance: 6,
    sellValue: 360,
    icon: "GH",
    visualColor: 0x233a5f,
    visualProfile: "stormguard-helm-crest",
    source: "Stormbound Knights",
    description: "A crested helm that hums before lightning hits."
  },
  stormguard_armor: {
    id: "stormguard_armor",
    name: "Stormguard Armor",
    type: "armor",
    slot: "chest",
    setId: "stormguard",
    rarity: "Rare",
    level: 31,
    defense: 16,
    health: 46,
    lightningResistance: 8,
    speed: 0.98,
    sellValue: 430,
    icon: "GA",
    visualColor: 0x1c2f54,
    visualProfile: "stormguard-armor-shoulders",
    source: "Skybreaker Ruins",
    description: "Dark plate with raised storm-rod shoulders."
  },
  stormguard_gloves: {
    id: "stormguard_gloves",
    name: "Stormguard Gloves",
    type: "armor",
    slot: "hands",
    setId: "stormguard",
    rarity: "Rare",
    level: 31,
    defense: 7,
    attack: 5,
    magicPower: 4,
    sellValue: 330,
    icon: "GG",
    visualColor: 0x405f9b,
    visualProfile: "stormguard-gloves-coils",
    source: "Shipwreck Raiders",
    description: "Gauntlets wrapped in copper storm coils."
  },
  stormguard_boots: {
    id: "stormguard_boots",
    name: "Stormguard Boots",
    type: "armor",
    slot: "boots",
    setId: "stormguard",
    rarity: "Rare",
    level: 30,
    defense: 7,
    speed: 1.05,
    lightningResistance: 5,
    sellValue: 330,
    icon: "GB",
    visualColor: 0x6bdfff,
    visualProfile: "stormguard-boots-fin",
    source: "Thunder Hawks",
    description: "Boots with finned heels for slick island rock."
  },
  skyglass_circlet: {
    id: "skyglass_circlet",
    name: "Skyglass Circlet",
    type: "armor",
    slot: "head",
    rarity: "Epic",
    level: 34,
    magicPower: 12,
    maxMana: 22,
    lightningResistance: 8,
    sellValue: 600,
    icon: "SC",
    visualColor: 0xaedcff,
    visualProfile: "skyglass-circlet-prism",
    source: "Skybreaker Ruins",
    description: "A prism circlet that bends lightning into runes."
  },
  stormrunner_vest: {
    id: "stormrunner_vest",
    name: "Stormrunner Vest",
    type: "armor",
    slot: "chest",
    rarity: "Uncommon",
    level: 30,
    defense: 10,
    attack: 6,
    speed: 1.04,
    sellValue: 270,
    icon: "RV",
    visualColor: 0x495f74,
    visualProfile: "stormrunner-vest-sashes",
    source: "Stormwatch Landing merchant",
    description: "A dockrunner vest bound with stormproof sashes."
  }
};

export const V23_ABILITIES = {
  thunder_leap: {
    id: "thunder_leap",
    name: "Thunder Leap",
    trainerId: "mage",
    scalingStat: "strength",
    targetType: "area_hostile",
    price: 950,
    levelRequirement: 30,
    attributeRequirements: { strength: 22 },
    cooldownMs: 14000,
    manaCost: 0,
    radius: 5.8,
    damageScale: 1.22,
    knockback: 3.8,
    description: "Leap into a crackling landing strike around your target area."
  },
  storm_bolt: {
    id: "storm_bolt",
    name: "Storm Bolt",
    trainerId: "mage",
    scalingStat: "magic",
    targetType: "hostile_chain",
    price: 1000,
    levelRequirement: 30,
    attributeRequirements: { magic: 22 },
    cooldownMs: 9000,
    manaCost: 34,
    range: 18,
    jumpRange: 6,
    maxTargets: 2,
    damageScale: 1.05,
    description: "A lightning projectile that can chain to one nearby enemy."
  },
  static_renewal: {
    id: "static_renewal",
    name: "Static Renewal",
    trainerId: "healer",
    scalingStat: "magic",
    targetType: "friendly_area",
    price: 950,
    levelRequirement: 30,
    attributeRequirements: { magic: 20 },
    cooldownMs: 15000,
    manaCost: 36,
    radius: 6,
    durationMs: 5200,
    heal: 36,
    moveSpeedBonus: 0.08,
    description: "Creates a small electric renewal field that heals allies and quickens their steps."
  }
};

export const V23_EQUIPMENT_SETS = {
  stormguard: {
    id: "stormguard",
    name: "Stormguard",
    role: "Magic / Defense",
    pieces: ["stormguard_helm", "stormguard_armor", "stormguard_gloves", "stormguard_boots"],
    bonuses: {
      2: { id: "stormguard_2", label: "2 pieces: +8 magic power and +6 defense.", stats: { magicPower: 8, defense: 6 } },
      4: { id: "stormguard_4", label: "4 pieces: storm abilities grant speed and lightning resistance.", stats: { lightningResistance: 10 }, effects: { stormSurgeMs: 3200, stormSurgeSpeed: 0.08, stormSurgeResistance: 12 } }
    }
  }
};

export const V23_ENEMIES = {
  spark_slime: {
    id: "spark_slime",
    name: "Spark Slime",
    family: "electric_slime",
    zone: ZONES.STORMREACH_ISLES,
    level: 30,
    maxHealth: 420,
    damage: 58,
    xp: 330,
    coins: [120, 185],
    speed: 1.9,
    attackRange: 1.7,
    attackCooldownMs: 1050,
    color: 0x65dfff,
    loot: [{ itemId: "storm_gel", chance: 0.78 }, { itemId: "stormblade", chance: 0.05 }]
  },
  storm_crab: {
    id: "storm_crab",
    name: "Storm Crab",
    family: "storm_crab",
    zone: ZONES.STORMREACH_ISLES,
    level: 31,
    maxHealth: 540,
    damage: 62,
    xp: 365,
    coins: [130, 210],
    speed: 1.35,
    attackRange: 1.9,
    attackCooldownMs: 1250,
    color: 0xf5d86b,
    loot: [{ itemId: "shock_shell", chance: 0.72 }, { itemId: "stormwall_shield", chance: 0.07 }]
  },
  thunder_hawk: {
    id: "thunder_hawk",
    name: "Thunder Hawk",
    family: "hawk",
    zone: ZONES.STORMREACH_ISLES,
    level: 32,
    ranged: true,
    maxHealth: 390,
    damage: 64,
    xp: 380,
    coins: [135, 220],
    speed: 3.25,
    attackRange: 5.6,
    attackCooldownMs: 1300,
    color: 0xffe36d,
    loot: [{ itemId: "thunder_feather", chance: 0.7 }, { itemId: "stormguard_boots", chance: 0.08 }]
  },
  cloud_wisp: {
    id: "cloud_wisp",
    name: "Cloud Wisp",
    family: "cloud_wisp",
    zone: ZONES.STORMREACH_ISLES,
    level: 33,
    ranged: true,
    maxHealth: 360,
    damage: 60,
    xp: 390,
    coins: [140, 230],
    speed: 1.85,
    attackRange: 6.4,
    attackCooldownMs: 1450,
    color: 0xdfeaff,
    loot: [{ itemId: "cloud_essence", chance: 0.72 }, { itemId: "stormcaller_staff", chance: 0.08 }]
  },
  shipwreck_raider: {
    id: "shipwreck_raider",
    name: "Shipwreck Raider",
    family: "raider",
    zone: ZONES.STORMREACH_ISLES,
    level: 34,
    maxHealth: 610,
    damage: 68,
    xp: 420,
    coins: [160, 260],
    speed: 2.05,
    attackRange: 2.3,
    attackCooldownMs: 1250,
    color: 0x8f644a,
    loot: [{ itemId: "thunder_pike", chance: 0.08 }, { itemId: "stormguard_gloves", chance: 0.1 }]
  },
  stormbound_knight: {
    id: "stormbound_knight",
    name: "Stormbound Knight",
    family: "storm_knight",
    zone: ZONES.STORMREACH_ISLES,
    level: 36,
    elite: true,
    maxHealth: 980,
    damage: 78,
    xp: 620,
    coins: [230, 360],
    speed: 1.42,
    attackRange: 2.4,
    attackCooldownMs: 1500,
    color: 0x405f9b,
    loot: [{ itemId: "stormguard_helm", chance: 0.14 }, { itemId: "stormguard_armor", chance: 0.12 }, { itemId: "storm_core", chance: 0.18 }]
  },
  crystal_eel: {
    id: "crystal_eel",
    name: "Crystal Eel",
    family: "eel",
    zone: ZONES.STORMREACH_ISLES,
    level: 35,
    ranged: true,
    maxHealth: 620,
    damage: 70,
    xp: 470,
    coins: [175, 290],
    speed: 2.65,
    attackRange: 4.8,
    attackCooldownMs: 1150,
    color: 0x8cf4ff,
    loot: [{ itemId: "charged_scale", chance: 0.76 }, { itemId: "skyglass_circlet", chance: 0.06 }]
  },
  thunder_golem: {
    id: "thunder_golem",
    name: "Thunder Golem",
    family: "thunder_golem",
    zone: ZONES.STORMREACH_ISLES,
    level: 37,
    elite: true,
    boss: true,
    maxHealth: 4200,
    damage: 92,
    xp: 1100,
    coins: [420, 680],
    speed: 0.82,
    attackRange: 3.1,
    attackCooldownMs: 2050,
    color: 0xffe36d,
    loot: [{ itemId: "storm_core", chance: 0.85 }, { itemId: "skybreaker_hammer", chance: 0.16 }]
  },
  voltruk_skybreaker: {
    id: "voltruk_skybreaker",
    name: "Voltruk, the Skybreaker",
    family: "thunder_golem",
    zone: ZONES.SKYBREAKER_RUINS,
    level: 38,
    elite: true,
    boss: true,
    maxHealth: 7600,
    damage: 96,
    xp: 1800,
    coins: [760, 1100],
    speed: 0.9,
    attackRange: 3.4,
    attackCooldownMs: 1800,
    color: 0xa774ff,
    loot: [{ itemId: "storm_core", chance: 0.9 }, { itemId: "charged_scale", chance: 0.8 }, { itemId: "skybreaker_hammer", chance: 0.22 }, { itemId: "stormguard_armor", chance: 0.18 }]
  },
  aurelion_storm_titan: {
    id: "aurelion_storm_titan",
    name: "Aurelion, the Storm Titan",
    family: "storm_titan",
    zone: ZONES.TEMPEST_GATE,
    level: 40,
    elite: true,
    boss: true,
    maxHealth: 11200,
    damage: 112,
    xp: 2600,
    coins: [1050, 1500],
    speed: 1.0,
    attackRange: 3.8,
    attackCooldownMs: 1600,
    color: 0xfff38a,
    loot: [{ itemId: "titan_spark", chance: 0.92 }, { itemId: "aurelions_spear", chance: 0.2 }, { itemId: "scepter_of_tempests", chance: 0.2 }, { itemId: "stormguard_helm", chance: 0.2 }]
  }
};

export const VOLTRUK_BOSS = V23_ENEMIES.voltruk_skybreaker;
export const AURELION_BOSS = V23_ENEMIES.aurelion_storm_titan;

export const STORMREACH_ISLES_SPAWNS = [
  { enemyId: "spark_slime", count: 5, center: [-24, 0, 10], radius: 10, eliteChance: 0.08 },
  { enemyId: "storm_crab", count: 4, center: [18, 0, 12], radius: 9, eliteChance: 0.08 },
  { enemyId: "thunder_hawk", count: 4, center: [-28, 0, -18], radius: 9, eliteChance: 0.1 },
  { enemyId: "cloud_wisp", count: 3, center: [22, 0, -20], radius: 8, eliteChance: 0.1 },
  { enemyId: "shipwreck_raider", count: 4, center: [-32, 0, -36], radius: 8, eliteChance: 0.12 },
  { enemyId: "crystal_eel", count: 3, center: [30, 0, -36], radius: 8, eliteChance: 0.16 },
  { enemyId: "stormbound_knight", count: 2, center: [0, 0, -46], radius: 7, eliteChance: 0.4 },
  { enemyId: "thunder_golem", count: 1, center: [38, 0, -46], radius: 2, eliteChance: 1 }
];

export const SKYBREAKER_RUINS_SPAWNS = [
  { enemyId: "storm_crab", count: 2, center: [-10, 0, -6], radius: 5, eliteChance: 0.12 },
  { enemyId: "cloud_wisp", count: 3, center: [10, 0, -12], radius: 5, eliteChance: 0.16 },
  { enemyId: "shipwreck_raider", count: 3, center: [-12, 0, -20], radius: 5, eliteChance: 0.18 },
  { enemyId: "thunder_golem", count: 1, center: [12, 0, -26], radius: 3, eliteChance: 1 },
  { enemyId: "voltruk_skybreaker", count: 1, center: [0, 0, -34], radius: 1, eliteChance: 1 }
];

export const TEMPEST_GATE_SPAWNS = [
  { enemyId: "stormbound_knight", count: 2, center: [-10, 0, -8], radius: 5, eliteChance: 0.25 },
  { enemyId: "cloud_wisp", count: 2, center: [10, 0, -10], radius: 5, eliteChance: 0.2 },
  { enemyId: "aurelion_storm_titan", count: 1, center: [0, 0, -18], radius: 1, eliteChance: 1 }
];

export const V23_QUESTS = {
  through_the_stormgate: {
    id: "through_the_stormgate",
    name: "Through the Stormgate",
    description: "Enter Stormwatch Landing through the Stormgate.",
    targetEventId: "enter_stormwatch",
    required: 1,
    reward: { xp: 900, coins: 420 }
  },
  welcome_to_stormwatch: {
    id: "welcome_to_stormwatch",
    name: "Welcome to Stormwatch",
    description: "Speak to Captain Rhea and unlock Stormwatch Landing waypoint.",
    targetEventId: "stormwatch_waypoint",
    required: 1,
    reward: { xp: 920, coins: 440, itemId: "stormrunner_vest" }
  },
  sparks_in_the_grass: {
    id: "sparks_in_the_grass",
    name: "Sparks in the Grass",
    description: "Defeat Spark Slimes and Storm Crabs.",
    targets: [{ enemyId: "spark_slime", required: 5 }, { enemyId: "storm_crab", required: 4 }],
    required: 9,
    reward: { xp: 1150, coins: 560, itemId: "storm_gel" }
  },
  wings_over_the_shoals: {
    id: "wings_over_the_shoals",
    name: "Wings Over the Shoals",
    description: "Defeat Thunder Hawks and Cloud Wisps.",
    targets: [{ enemyId: "thunder_hawk", required: 4 }, { enemyId: "cloud_wisp", required: 4 }],
    required: 8,
    reward: { xp: 1260, coins: 620, itemId: "thunder_feather" }
  },
  raiders_of_the_wreck: {
    id: "raiders_of_the_wreck",
    name: "Raiders of the Wreck",
    description: "Defeat Shipwreck Raiders.",
    targetEnemyId: "shipwreck_raider",
    required: 6,
    reward: { xp: 1320, coins: 660, itemId: "thunder_pike" }
  },
  charge_the_rods: {
    id: "charge_the_rods",
    name: "Charge the Rods",
    description: "Activate three lightning rods around Stormreach.",
    targetEventId: "activate_lightning_rod",
    required: 3,
    reward: { xp: 1380, coins: 700, itemId: "charged_scale" }
  },
  into_skybreaker_ruins: {
    id: "into_skybreaker_ruins",
    name: "Into Skybreaker Ruins",
    description: "Clear Skybreaker Ruins.",
    targetEnemyId: "voltruk_skybreaker",
    required: 1,
    reward: { xp: 1900, coins: 900, itemId: "storm_core" }
  },
  heart_of_thunder: {
    id: "heart_of_thunder",
    name: "Heart of Thunder",
    description: "Defeat a Thunder Golem.",
    targetEnemyId: "thunder_golem",
    required: 1,
    reward: { xp: 1500, coins: 780, itemId: "storm_core" }
  },
  the_tempest_gate: {
    id: "the_tempest_gate",
    name: "The Tempest Gate",
    description: "Reach Aurelion's arena.",
    targetEventId: "enter_tempest_gate",
    required: 1,
    reward: { xp: 1200, coins: 620 }
  },
  storm_titan: {
    id: "storm_titan",
    name: "Storm Titan",
    description: "Defeat Aurelion, the Storm Titan.",
    targetEnemyId: "aurelion_storm_titan",
    required: 1,
    reward: { xp: 3200, coins: 1400, title: "Stormbound", itemId: "titan_spark" }
  }
};

export const V23_BOUNTIES = [
  { id: "stormreach_spark_slimes", title: "Bottle the Spark", type: "hunt_enemy", target: "spark_slime", required: 8, zone: "Stormreach Isles", reward: { xp: 700, coins: 320, items: [{ itemId: "storm_gel", quantity: 4 }] } },
  { id: "stormreach_crabs", title: "Crack Shock Shells", type: "hunt_enemy", target: "storm_crab", required: 6, zone: "Stormreach Isles", reward: { xp: 780, coins: 360, items: [{ itemId: "shock_shell", quantity: 3 }] } },
  { id: "stormreach_hawks", title: "Ground the Hawks", type: "hunt_enemy", target: "thunder_hawk", required: 5, zone: "Stormreach Isles", reward: { xp: 820, coins: 380, items: [{ itemId: "thunder_feather", quantity: 3 }] } },
  { id: "stormreach_wisps", title: "Bottle Clouds", type: "hunt_enemy", target: "cloud_wisp", required: 5, zone: "Stormreach Isles", reward: { xp: 820, coins: 380, items: [{ itemId: "cloud_essence", quantity: 3 }] } },
  { id: "stormreach_raiders", title: "Raiders of the Coast", type: "hunt_enemy", target: "shipwreck_raider", required: 6, zone: "Shipwreck Coast", reward: { xp: 900, coins: 420, items: [{ itemId: "thunder_pike", quantity: 1 }] } },
  { id: "stormreach_knights", title: "Unbind the Knights", type: "hunt_enemy", target: "stormbound_knight", required: 3, zone: "Tempest Gate", reward: { xp: 980, coins: 460, items: [{ itemId: "stormguard_gloves", quantity: 1 }] } },
  { id: "stormreach_golem", title: "Break Thunder Stone", type: "defeat_boss", target: "thunder_golem", required: 1, zone: "Skyspire Cliffs", reward: { xp: 1150, coins: 520, items: [{ itemId: "storm_core", quantity: 1 }] } },
  { id: "clear_skybreaker", title: "Skybreaker", type: "clear_dungeon", target: "skybreaker_ruins", required: 1, zone: "Skybreaker Ruins", reward: { xp: 1600, coins: 720, items: [{ itemId: "storm_core", quantity: 1 }, { itemId: "charged_scale", quantity: 2 }] } },
  { id: "defeat_aurelion", title: "Thunderstruck", type: "defeat_boss", target: "aurelion_storm_titan", required: 1, zone: "Tempest Gate", reward: { xp: 2200, coins: 980, items: [{ itemId: "titan_spark", quantity: 1 }] } },
  { id: "collect_charged_scales", title: "Charged Scales", type: "collect_material", target: "charged_scale", required: 3, zone: "Stormreach Isles", reward: { xp: 760, coins: 360, items: [{ itemId: "storm_gel", quantity: 3 }] } },
  { id: "collect_storm_cores", title: "Storm Core Cache", type: "collect_material", target: "storm_core", required: 2, zone: "Skybreaker Ruins", reward: { xp: 1200, coins: 540, items: [{ itemId: "charged_scale", quantity: 2 }] } }
];

export const V23_ZONE_COMPLETION_REQUIREMENTS = {
  [ZONES.STORMWATCH_LANDING]: {
    quests: ["through_the_stormgate", "welcome_to_stormwatch"],
    waypoint: "stormwatch_waypoint",
    chests: ["stormwatch_supply_cache"]
  },
  [ZONES.STORMREACH_ISLES]: {
    quests: ["sparks_in_the_grass", "wings_over_the_shoals", "raiders_of_the_wreck", "charge_the_rods", "heart_of_thunder"],
    bestiary: ["spark_slime", "storm_crab", "thunder_hawk", "cloud_wisp", "shipwreck_raider", "stormbound_knight", "crystal_eel", "thunder_golem"],
    chests: ["stormreach_wreck_cache", "stormreach_cliff_cache"]
  },
  [ZONES.SKYBREAKER_RUINS]: {
    quests: ["into_skybreaker_ruins"],
    bestiary: ["voltruk_skybreaker"],
    boss: "voltruk_skybreaker"
  },
  [ZONES.TEMPEST_GATE]: {
    quests: ["the_tempest_gate", "storm_titan"],
    bestiary: ["aurelion_storm_titan"],
    boss: "aurelion_storm_titan"
  }
};
