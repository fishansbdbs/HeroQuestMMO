import { ZONES } from "./constants.js";

export const V22_MATERIAL_ITEMS = {
  emberstone: {
    id: "emberstone",
    name: "Emberstone",
    type: "material",
    rarity: "Common",
    icon: "EM",
    stackable: true,
    description: "A warm ore chipped from Flameburg cracks."
  },
  magma_core: {
    id: "magma_core",
    name: "Magma Core",
    type: "material",
    rarity: "Rare",
    icon: "MC",
    stackable: true,
    description: "A pulsing core from elite fire constructs."
  },
  ashwing_leather: {
    id: "ashwing_leather",
    name: "Ashwing Leather",
    type: "material",
    rarity: "Uncommon",
    icon: "AL",
    stackable: true,
    description: "Heatproof leather from Cinder Bats."
  },
  fire_golem_fragment: {
    id: "fire_golem_fragment",
    name: "Fire Golem Fragment",
    type: "material",
    rarity: "Uncommon",
    icon: "FG",
    stackable: true,
    description: "A glowing shard of compact golem stone."
  },
  royal_cinder: {
    id: "royal_cinder",
    name: "Royal Cinder",
    type: "material",
    rarity: "Epic",
    icon: "RC",
    stackable: true,
    description: "A crown-hot ember left by Ignivar."
  },
  coral_chunk: {
    id: "coral_chunk",
    name: "Coral Chunk",
    type: "material",
    rarity: "Common",
    icon: "CC",
    stackable: true,
    description: "A sturdy piece of palace reef."
  },
  pearl_shard: {
    id: "pearl_shard",
    name: "Pearl Shard",
    type: "material",
    rarity: "Uncommon",
    icon: "PS",
    stackable: true,
    description: "A shimmering shard used by Aqua Palace crafters."
  },
  tide_essence: {
    id: "tide_essence",
    name: "Tide Essence",
    type: "material",
    rarity: "Rare",
    icon: "TE",
    stackable: true,
    description: "Condensed current magic from water foes."
  },
  leviathan_scale: {
    id: "leviathan_scale",
    name: "Leviathan Scale",
    type: "material",
    rarity: "Epic",
    icon: "LS",
    stackable: true,
    description: "A rare scale from Marrowfin."
  },
  royal_pearl: {
    id: "royal_pearl",
    name: "Royal Pearl",
    type: "material",
    rarity: "Epic",
    icon: "RP",
    stackable: true,
    description: "A pearl carrying Nereida's palace light."
  },
  ember_hide: {
    id: "ember_hide",
    name: "Ember Hide",
    type: "material",
    rarity: "Uncommon",
    icon: "EH",
    stackable: true,
    description: "Charred hide from Ember Hounds."
  },
  furnace_spark: {
    id: "furnace_spark",
    name: "Furnace Spark",
    type: "material",
    rarity: "Uncommon",
    icon: "FS",
    stackable: true,
    description: "A stable flame mote from Furnace Wisps."
  }
};

export const V22_ITEMS = {
  ...V22_MATERIAL_ITEMS,
  greater_health_potion: {
    id: "greater_health_potion",
    name: "Greater Health Potion",
    type: "consumable",
    rarity: "Uncommon",
    heal: 80,
    sellValue: 18,
    icon: "G+",
    description: "Restores 80 health."
  },
  burn_salve: {
    id: "burn_salve",
    name: "Burn Salve",
    type: "consumable",
    rarity: "Common",
    heal: 18,
    fireResistance: 4,
    sellValue: 8,
    icon: "BS",
    description: "A quick salve for fire-scarred adventurers."
  },
  fire_resistance_tonic: {
    id: "fire_resistance_tonic",
    name: "Fire Resistance Tonic",
    type: "consumable",
    rarity: "Uncommon",
    fireResistance: 12,
    sellValue: 16,
    icon: "FR",
    description: "Temporarily steadies a hero against flame."
  },
  cinderbrand_sword: {
    id: "cinderbrand_sword",
    name: "Cinderbrand Sword",
    type: "weapon",
    slot: "weapon",
    rarity: "Rare",
    level: 15,
    attack: 18,
    speed: 1.02,
    burnChance: 0.1,
    sellValue: 170,
    dropSource: "Ashborn Raiders",
    visualColor: 0xff6a24,
    icon: "CS",
    description: "A black-orange blade with a controlled burn edge."
  },
  ashfang_dagger: {
    id: "ashfang_dagger",
    name: "Ashfang Dagger",
    type: "weapon",
    slot: "weapon",
    rarity: "Uncommon",
    level: 15,
    attack: 12,
    speed: 1.24,
    sellValue: 96,
    dropSource: "Ember Hounds",
    visualColor: 0x2a2220,
    icon: "AD",
    description: "A curved charcoal dagger for fast strikes."
  },
  molten_maul: {
    id: "molten_maul",
    name: "Molten Maul",
    type: "weapon",
    slot: "weapon",
    rarity: "Rare",
    level: 17,
    attack: 25,
    speed: 0.78,
    groundPoundBonus: 0.14,
    sellValue: 190,
    dropSource: "Mini Fire Golems",
    visualColor: 0xb23b1a,
    icon: "MM",
    description: "A giant hammer that deepens Ground Pound shockwaves."
  },
  emberstaff: {
    id: "emberstaff",
    name: "Emberstaff",
    type: "staff",
    slot: "weapon",
    rarity: "Rare",
    level: 16,
    magicPower: 18,
    speed: 1,
    fireballBonus: 0.14,
    sellValue: 176,
    dropSource: "Furnace Wisps",
    visualColor: 0xff8b31,
    icon: "ES",
    description: "A staff capped with a living flame crystal."
  },
  furnace_wand: {
    id: "furnace_wand",
    name: "Furnace Wand",
    type: "staff",
    slot: "weapon",
    rarity: "Uncommon",
    level: 15,
    magicPower: 13,
    manaRegenBonus: 0.1,
    sellValue: 118,
    dropSource: "Furnace Wisps",
    visualColor: 0xffc35a,
    icon: "FW",
    description: "A short wand with a compact fire orb."
  },
  flame_kings_greatsword: {
    id: "flame_kings_greatsword",
    name: "Flame King's Greatsword",
    type: "weapon",
    slot: "weapon",
    rarity: "Epic",
    level: 20,
    attack: 34,
    speed: 0.86,
    sellValue: 520,
    boss: true,
    dropSource: "Ignivar, the Flame King",
    visualColor: 0xff3b1f,
    icon: "KG",
    description: "A royal greatsword with a persistent flame edge."
  },
  scepter_of_ignivar: {
    id: "scepter_of_ignivar",
    name: "Scepter of Ignivar",
    type: "staff",
    slot: "weapon",
    rarity: "Epic",
    level: 20,
    magicPower: 30,
    fireballBonus: 0.18,
    sellValue: 520,
    boss: true,
    dropSource: "Ignivar, the Flame King",
    visualColor: 0xffb032,
    icon: "SI",
    description: "A royal fire scepter crowned with emberstone."
  },
  magma_bulwark: {
    id: "magma_bulwark",
    name: "Magma Bulwark",
    type: "armor",
    slot: "offhand",
    rarity: "Rare",
    level: 17,
    defense: 12,
    health: 18,
    fireResistance: 16,
    sellValue: 160,
    dropSource: "Lava Colossus",
    visualColor: 0x742f1f,
    icon: "MB",
    description: "A basalt shield veined with cooled magma."
  },
  ashen_crown_helm: {
    id: "ashen_crown_helm",
    name: "Ashen Crown Helm",
    type: "armor",
    slot: "head",
    setId: "ashen_crown",
    rarity: "Rare",
    level: 18,
    defense: 7,
    attack: 4,
    fireResistance: 8,
    sellValue: 142,
    dropSource: "Crownforge Citadel",
    visualColor: 0x17110f,
    icon: "AH",
    description: "A black helm with a low ember crown."
  },
  crownforge_chestplate: {
    id: "crownforge_chestplate",
    name: "Crownforge Chestplate",
    type: "armor",
    slot: "chest",
    setId: "ashen_crown",
    rarity: "Rare",
    level: 18,
    defense: 14,
    attack: 5,
    health: 24,
    fireResistance: 10,
    sellValue: 190,
    dropSource: "Ignivar, the Flame King",
    visualColor: 0x2b1712,
    icon: "AC",
    description: "Heavy crownforged armor glowing between plates."
  },
  kings_gauntlets: {
    id: "kings_gauntlets",
    name: "King's Gauntlets",
    type: "armor",
    slot: "hands",
    setId: "ashen_crown",
    rarity: "Rare",
    level: 18,
    defense: 6,
    attack: 5,
    fireResistance: 6,
    sellValue: 132,
    dropSource: "Moltar or Ignivar",
    visualColor: 0x9c3a20,
    icon: "KG",
    description: "Gauntlets warm enough to haze the air."
  },
  molten_greaves: {
    id: "molten_greaves",
    name: "Molten Greaves",
    type: "armor",
    slot: "boots",
    setId: "ashen_crown",
    rarity: "Rare",
    level: 18,
    defense: 6,
    attack: 3,
    speed: 1.03,
    fireResistance: 6,
    sellValue: 126,
    dropSource: "Emberdeep Mines",
    visualColor: 0x5a2118,
    icon: "MG",
    description: "Fire-lit greaves that leave brief ash trails."
  },
  ashwalker_vest: {
    id: "ashwalker_vest",
    name: "Ashwalker Vest",
    type: "armor",
    slot: "chest",
    rarity: "Uncommon",
    level: 15,
    defense: 9,
    health: 16,
    fireResistance: 6,
    sellValue: 96,
    dropSource: "Ashen Expanse enemies",
    visualColor: 0x4b342a,
    icon: "AV",
    description: "Light fire-region armor for long ash roads."
  },
  sootguard_boots: {
    id: "sootguard_boots",
    name: "Sootguard Boots",
    type: "armor",
    slot: "boots",
    rarity: "Uncommon",
    level: 15,
    defense: 4,
    speed: 1.06,
    fireResistance: 4,
    sellValue: 72,
    dropSource: "Ashborn Raiders",
    visualColor: 0x30241f,
    icon: "SB",
    description: "Boots wrapped for hot basalt paths."
  },
  coral_blade: {
    id: "coral_blade",
    name: "Coral Blade",
    type: "weapon",
    slot: "weapon",
    rarity: "Rare",
    level: 20,
    attack: 24,
    speed: 1.04,
    sellValue: 210,
    dropSource: "Spearfin Raiders",
    visualColor: 0xff8fa3,
    icon: "CB",
    description: "A water-themed sword grown from sharpened coral."
  },
  pearl_wand: {
    id: "pearl_wand",
    name: "Pearl Wand",
    type: "staff",
    slot: "weapon",
    rarity: "Rare",
    level: 21,
    magicPower: 22,
    healingPower: 8,
    sellValue: 218,
    dropSource: "Pearl Wisps",
    visualColor: 0xf4fbff,
    icon: "PW",
    description: "A white wand that brightens healing spells."
  },
  tidecaller_trident: {
    id: "tidecaller_trident",
    name: "Tidecaller Trident",
    type: "weapon",
    slot: "weapon",
    rarity: "Epic",
    level: 24,
    attack: 22,
    magicPower: 18,
    waterBlastBonus: 0.16,
    sellValue: 360,
    dropSource: "Sunken Sanctum",
    visualColor: 0x2eb8ff,
    icon: "TT",
    description: "A hybrid trident for martial spellcasters."
  },
  reefguard_shield: {
    id: "reefguard_shield",
    name: "Reefguard Shield",
    type: "armor",
    slot: "offhand",
    rarity: "Rare",
    level: 20,
    defense: 14,
    health: 22,
    waterResistance: 14,
    sellValue: 180,
    dropSource: "Reef Golems",
    visualColor: 0x2d8bb7,
    icon: "RS",
    description: "A shield layered with blue coral plates."
  },
  leviathan_fang: {
    id: "leviathan_fang",
    name: "Leviathan Fang",
    type: "weapon",
    slot: "weapon",
    rarity: "Epic",
    level: 24,
    attack: 32,
    speed: 0.94,
    sellValue: 460,
    boss: true,
    dropSource: "Marrowfin Leviathan",
    visualColor: 0xd9fbff,
    icon: "LF",
    description: "A curved blade shaped from a leviathan fang."
  },
  nereidas_scepter: {
    id: "nereidas_scepter",
    name: "Nereida's Scepter",
    type: "staff",
    slot: "weapon",
    rarity: "Epic",
    level: 25,
    magicPower: 36,
    healingPower: 10,
    waterBlastBonus: 0.18,
    sellValue: 560,
    boss: true,
    dropSource: "Queen Nereida",
    visualColor: 0x8ceaff,
    icon: "NS",
    description: "A royal water scepter with a pearl-lit crown."
  },
  tideguard_crown: {
    id: "tideguard_crown",
    name: "Tideguard Crown",
    type: "armor",
    slot: "head",
    setId: "tideguard",
    rarity: "Rare",
    level: 22,
    defense: 5,
    magicPower: 8,
    health: 12,
    sellValue: 150,
    dropSource: "Aqua Palace elites",
    visualColor: 0x8ceaff,
    icon: "TC",
    description: "A blue-white crown set with palace pearls."
  },
  tideguard_armor: {
    id: "tideguard_armor",
    name: "Tideguard Armor",
    type: "armor",
    slot: "chest",
    setId: "tideguard",
    rarity: "Rare",
    level: 22,
    defense: 11,
    magicPower: 9,
    health: 28,
    sellValue: 210,
    dropSource: "Queen Nereida",
    visualColor: 0x2f91d1,
    icon: "TA",
    description: "Pearl-trimmed armor for palace defenders."
  },
  tideguard_gloves: {
    id: "tideguard_gloves",
    name: "Tideguard Gloves",
    type: "armor",
    slot: "hands",
    setId: "tideguard",
    rarity: "Rare",
    level: 22,
    defense: 4,
    magicPower: 7,
    health: 10,
    sellValue: 142,
    dropSource: "Sunken Sanctum",
    visualColor: 0xa7f4ff,
    icon: "TG",
    description: "Gloves that ripple when water spells are cast."
  },
  tideguard_boots: {
    id: "tideguard_boots",
    name: "Tideguard Boots",
    type: "armor",
    slot: "boots",
    setId: "tideguard",
    rarity: "Rare",
    level: 22,
    defense: 5,
    magicPower: 5,
    speed: 1.05,
    health: 10,
    sellValue: 136,
    dropSource: "Tideruin Gardens",
    visualColor: 0x4fc7ff,
    icon: "TB",
    description: "Boots that grip wet marble."
  }
};

export const V22_ABILITIES = {
  magma_breaker: {
    id: "magma_breaker",
    name: "Magma Breaker",
    trainerId: "mage",
    scalingStat: "strength",
    targetType: "area_hostile",
    price: 650,
    levelRequirement: 15,
    attributeRequirements: { strength: 14 },
    cooldownMs: 13000,
    manaCost: 0,
    radius: 5.6,
    damageScale: 1.25,
    knockback: 4,
    description: "A physical lava-crack impact that damages nearby enemies."
  },
  flame_wave: {
    id: "flame_wave",
    name: "Flame Wave",
    trainerId: "mage",
    scalingStat: "magic",
    targetType: "area_hostile",
    price: 700,
    levelRequirement: 16,
    attributeRequirements: { magic: 14 },
    cooldownMs: 10000,
    manaCost: 36,
    radius: 6.4,
    damageScale: 1.05,
    burnChance: 0.2,
    description: "A forward wave of fire that scorches clustered enemies."
  },
  hearth_ward: {
    id: "hearth_ward",
    name: "Hearth Ward",
    trainerId: "healer",
    scalingStat: "magic",
    targetType: "friendly_area",
    price: 650,
    levelRequirement: 16,
    attributeRequirements: { magic: 12 },
    cooldownMs: 15000,
    manaCost: 34,
    radius: 6,
    durationMs: 5200,
    damageReduction: 0.18,
    fireResistance: 18,
    description: "A warm protective ward for nearby allies."
  }
};

export const V22_EQUIPMENT_SETS = {
  ashen_crown: {
    id: "ashen_crown",
    name: "Ashen Crown",
    role: "Strength / Fire Resistance",
    pieces: ["ashen_crown_helm", "crownforge_chestplate", "kings_gauntlets", "molten_greaves"],
    bonuses: {
      2: { id: "ashen_crown_2", label: "2 pieces: +8 physical power and +10 fire resistance.", stats: { attack: 8, fireResistance: 10 } },
      4: { id: "ashen_crown_4", label: "4 pieces: physical abilities create a brief flame aura.", effects: { flameAuraChance: 1, flameAuraMs: 2200, flameAuraCooldownMs: 9000 } }
    }
  },
  tideguard: {
    id: "tideguard",
    name: "Tideguard",
    role: "Magic / Health",
    pieces: ["tideguard_crown", "tideguard_armor", "tideguard_gloves", "tideguard_boots"],
    bonuses: {
      2: { id: "tideguard_2", label: "2 pieces: +10 magic power and +30 health.", stats: { magicPower: 10, health: 30 } },
      4: { id: "tideguard_4", label: "4 pieces: water and healing abilities grant a brief shield.", effects: { tideShieldMs: 3000, tideShieldReduction: 0.16 } }
    }
  }
};

export const V22_ENEMIES = {
  magma_rockling: {
    id: "magma_rockling",
    name: "Magma Rockling",
    family: "rockling",
    zone: ZONES.ASHEN_EXPANSE,
    level: 15,
    maxHealth: 180,
    damage: 30,
    xp: 120,
    coins: [44, 78],
    speed: 2,
    attackRange: 1.75,
    attackCooldownMs: 1050,
    color: 0xff6a24,
    loot: [{ itemId: "emberstone", chance: 0.72 }, { itemId: "small_health_potion", chance: 0.1 }]
  },
  mini_fire_golem: {
    id: "mini_fire_golem",
    name: "Mini Fire Golem",
    family: "fire_golem",
    zone: ZONES.ASHEN_EXPANSE,
    level: 16,
    elite: true,
    maxHealth: 440,
    damage: 38,
    xp: 210,
    coins: [92, 150],
    speed: 0.95,
    attackRange: 2.5,
    attackCooldownMs: 1850,
    color: 0xd95425,
    loot: [{ itemId: "fire_golem_fragment", chance: 0.75 }, { itemId: "molten_maul", chance: 0.08 }]
  },
  ember_hound: {
    id: "ember_hound",
    name: "Ember Hound",
    family: "hound",
    zone: ZONES.ASHEN_EXPANSE,
    level: 16,
    maxHealth: 210,
    damage: 34,
    xp: 145,
    coins: [50, 88],
    speed: 3.25,
    attackRange: 1.9,
    attackCooldownMs: 1000,
    color: 0x3a221a,
    loot: [{ itemId: "ember_hide", chance: 0.55 }, { itemId: "ashfang_dagger", chance: 0.08 }]
  },
  cinder_bat: {
    id: "cinder_bat",
    name: "Cinder Bat",
    family: "bat",
    zone: ZONES.ASHEN_EXPANSE,
    level: 17,
    ranged: true,
    maxHealth: 170,
    damage: 31,
    xp: 150,
    coins: [48, 82],
    speed: 2.8,
    attackRange: 5.4,
    attackCooldownMs: 1300,
    color: 0xff8a3d,
    loot: [{ itemId: "ashwing_leather", chance: 0.58 }, { itemId: "small_health_potion", chance: 0.1 }]
  },
  furnace_wisp: {
    id: "furnace_wisp",
    name: "Furnace Wisp",
    family: "fire_wisp",
    zone: ZONES.ASHEN_EXPANSE,
    level: 18,
    ranged: true,
    maxHealth: 190,
    damage: 35,
    xp: 170,
    coins: [64, 102],
    speed: 1.9,
    attackRange: 6,
    attackCooldownMs: 1450,
    color: 0xffc65a,
    loot: [{ itemId: "furnace_spark", chance: 0.6 }, { itemId: "furnace_wand", chance: 0.1 }, { itemId: "emberstaff", chance: 0.06 }]
  },
  ashborn_raider: {
    id: "ashborn_raider",
    name: "Ashborn Raider",
    family: "raider",
    zone: ZONES.ASHEN_EXPANSE,
    level: 18,
    maxHealth: 260,
    damage: 39,
    xp: 185,
    coins: [80, 135],
    speed: 1.75,
    attackRange: 2.1,
    attackCooldownMs: 1250,
    color: 0x9a3d26,
    loot: [{ itemId: "cinderbrand_sword", chance: 0.08 }, { itemId: "sootguard_boots", chance: 0.12 }, { itemId: "emberstone", chance: 0.55 }]
  },
  lava_colossus: {
    id: "lava_colossus",
    name: "Lava Colossus",
    family: "fire_golem",
    zone: ZONES.ASHEN_EXPANSE,
    level: 20,
    elite: true,
    boss: true,
    maxHealth: 2400,
    damage: 52,
    xp: 520,
    coins: [240, 380],
    speed: 0.72,
    attackRange: 3,
    attackCooldownMs: 2200,
    color: 0xff4c24,
    loot: [{ itemId: "magma_core", chance: 0.65 }, { itemId: "magma_bulwark", chance: 0.16 }, { itemId: "emberstone", chance: 0.9, quantity: 2 }]
  },
  moltar_minebreaker: {
    id: "moltar_minebreaker",
    name: "Moltar, the Minebreaker",
    family: "fire_golem",
    zone: ZONES.EMBERDEEP_MINES,
    level: 18,
    elite: true,
    boss: true,
    maxHealth: 3200,
    damage: 48,
    xp: 680,
    coins: [300, 460],
    speed: 0.78,
    attackRange: 3,
    attackCooldownMs: 2100,
    color: 0xb94225,
    loot: [{ itemId: "fire_golem_fragment", chance: 0.85, quantity: 2 }, { itemId: "magma_core", chance: 0.35 }, { itemId: "kings_gauntlets", chance: 0.18 }, { itemId: "molten_greaves", chance: 0.18 }]
  },
  ignivar_flame_king: {
    id: "ignivar_flame_king",
    name: "Ignivar, the Flame King",
    family: "flame_king",
    zone: ZONES.CROWNFORGE_CITADEL,
    level: 20,
    elite: true,
    boss: true,
    maxHealth: 5200,
    damage: 60,
    xp: 1150,
    coins: [520, 760],
    speed: 1.05,
    attackRange: 3.2,
    attackCooldownMs: 1800,
    color: 0xff3d20,
    loot: [{ itemId: "flame_kings_greatsword", chance: 0.18 }, { itemId: "scepter_of_ignivar", chance: 0.18 }, { itemId: "royal_cinder", chance: 0.8 }, { itemId: "crownforge_chestplate", chance: 0.2 }]
  },
  bubble_slime: {
    id: "bubble_slime",
    name: "Bubble Slime",
    family: "slime",
    zone: ZONES.TIDERUIN_GARDENS,
    level: 20,
    maxHealth: 260,
    damage: 36,
    xp: 190,
    coins: [76, 120],
    speed: 1.65,
    attackRange: 1.5,
    attackCooldownMs: 1100,
    color: 0x67dfff,
    loot: [{ itemId: "pearl_shard", chance: 0.35 }, { itemId: "small_health_potion", chance: 0.1 }]
  },
  coral_crab: {
    id: "coral_crab",
    name: "Coral Crab",
    family: "crab",
    zone: ZONES.TIDERUIN_GARDENS,
    level: 21,
    maxHealth: 330,
    damage: 40,
    xp: 220,
    coins: [86, 138],
    speed: 1.45,
    attackRange: 1.8,
    attackCooldownMs: 1200,
    color: 0xff7f98,
    loot: [{ itemId: "coral_chunk", chance: 0.7 }, { itemId: "reefguard_shield", chance: 0.07 }]
  },
  tide_imp: {
    id: "tide_imp",
    name: "Tide Imp",
    family: "imp",
    zone: ZONES.TIDERUIN_GARDENS,
    level: 22,
    ranged: true,
    maxHealth: 280,
    damage: 42,
    xp: 235,
    coins: [94, 150],
    speed: 2.15,
    attackRange: 5.8,
    attackCooldownMs: 1350,
    color: 0x33a8ff,
    loot: [{ itemId: "tide_essence", chance: 0.28 }, { itemId: "pearl_wand", chance: 0.08 }]
  },
  spearfin_raider: {
    id: "spearfin_raider",
    name: "Spearfin Raider",
    family: "raider",
    zone: ZONES.TIDERUIN_GARDENS,
    level: 23,
    maxHealth: 370,
    damage: 46,
    xp: 260,
    coins: [110, 170],
    speed: 1.9,
    attackRange: 2.4,
    attackCooldownMs: 1250,
    color: 0x2e7ec8,
    loot: [{ itemId: "coral_blade", chance: 0.08 }, { itemId: "tide_essence", chance: 0.35 }]
  },
  pearl_wisp: {
    id: "pearl_wisp",
    name: "Pearl Wisp",
    family: "wisp",
    zone: ZONES.TIDERUIN_GARDENS,
    level: 24,
    ranged: true,
    maxHealth: 260,
    damage: 38,
    xp: 255,
    coins: [100, 160],
    speed: 1.8,
    attackRange: 6.2,
    attackCooldownMs: 1450,
    color: 0xf4fbff,
    loot: [{ itemId: "pearl_shard", chance: 0.72 }, { itemId: "pearl_wand", chance: 0.1 }]
  },
  reef_golem: {
    id: "reef_golem",
    name: "Reef Golem",
    family: "golem",
    zone: ZONES.TIDERUIN_GARDENS,
    level: 25,
    elite: true,
    maxHealth: 760,
    damage: 54,
    xp: 420,
    coins: [180, 280],
    speed: 0.82,
    attackRange: 2.7,
    attackCooldownMs: 1900,
    color: 0x46b7a8,
    loot: [{ itemId: "coral_chunk", chance: 0.85, quantity: 2 }, { itemId: "reefguard_shield", chance: 0.12 }]
  },
  abyss_knight: {
    id: "abyss_knight",
    name: "Abyss Knight",
    family: "knight",
    zone: ZONES.TIDERUIN_GARDENS,
    level: 27,
    elite: true,
    maxHealth: 820,
    damage: 58,
    xp: 500,
    coins: [220, 330],
    speed: 1.45,
    attackRange: 2.3,
    attackCooldownMs: 1350,
    color: 0x19528c,
    loot: [{ itemId: "tidecaller_trident", chance: 0.08 }, { itemId: "tideguard_boots", chance: 0.12 }, { itemId: "tide_essence", chance: 0.52 }]
  },
  marrowfin_leviathan: {
    id: "marrowfin_leviathan",
    name: "Marrowfin Leviathan",
    family: "leviathan",
    zone: ZONES.SUNKEN_SANCTUM,
    level: 24,
    elite: true,
    boss: true,
    maxHealth: 6200,
    damage: 64,
    xp: 1250,
    coins: [560, 840],
    speed: 1.2,
    attackRange: 3.5,
    attackCooldownMs: 1750,
    color: 0x35c7ff,
    loot: [{ itemId: "leviathan_fang", chance: 0.2 }, { itemId: "leviathan_scale", chance: 0.86 }, { itemId: "tidecaller_trident", chance: 0.15 }, { itemId: "tideguard_gloves", chance: 0.18 }]
  },
  queen_nereida: {
    id: "queen_nereida",
    name: "Queen Nereida, the Tide Empress",
    family: "tide_empress",
    zone: ZONES.TIDE_EMPRESS_ARENA,
    level: 30,
    elite: true,
    boss: true,
    maxHealth: 8200,
    damage: 72,
    xp: 1800,
    coins: [780, 1100],
    speed: 1.1,
    attackRange: 3.4,
    attackCooldownMs: 1650,
    color: 0x8ceaff,
    loot: [{ itemId: "nereidas_scepter", chance: 0.2 }, { itemId: "royal_pearl", chance: 0.85 }, { itemId: "tideguard_armor", chance: 0.22 }, { itemId: "tideguard_crown", chance: 0.18 }]
  }
};

export const IGNIVAR_BOSS = V22_ENEMIES.ignivar_flame_king;
export const NEREIDA_BOSS = V22_ENEMIES.queen_nereida;
export const MOLTAR_BOSS = V22_ENEMIES.moltar_minebreaker;
export const MARROWFIN_BOSS = V22_ENEMIES.marrowfin_leviathan;

export const ASHEN_EXPANSE_SPAWNS = [
  { enemyId: "magma_rockling", count: 5, center: [-22, 0, 8], radius: 10, eliteChance: 0.08 },
  { enemyId: "ember_hound", count: 4, center: [18, 0, 6], radius: 9, eliteChance: 0.08 },
  { enemyId: "cinder_bat", count: 3, center: [-26, 0, -20], radius: 8, eliteChance: 0.1 },
  { enemyId: "furnace_wisp", count: 3, center: [24, 0, -18], radius: 8, eliteChance: 0.12 },
  { enemyId: "mini_fire_golem", count: 2, center: [-4, 0, -30], radius: 7, eliteChance: 0.35 },
  { enemyId: "ashborn_raider", count: 4, center: [34, 0, -32], radius: 8, eliteChance: 0.12 },
  { enemyId: "lava_colossus", count: 1, center: [0, 0, -40], radius: 1, eliteChance: 1 }
];

export const EMBERDEEP_MINES_SPAWNS = [
  { enemyId: "magma_rockling", count: 4, center: [-12, 0, -6], radius: 5, eliteChance: 0.12 },
  { enemyId: "mini_fire_golem", count: 2, center: [12, 0, -12], radius: 5, eliteChance: 0.4 },
  { enemyId: "furnace_wisp", count: 2, center: [0, 0, -22], radius: 4, eliteChance: 0.18 },
  { enemyId: "moltar_minebreaker", count: 1, center: [0, 0, -30], radius: 1, eliteChance: 1 }
];

export const CROWNFORGE_CITADEL_SPAWNS = [
  { enemyId: "ashborn_raider", count: 3, center: [-12, 0, -8], radius: 5, eliteChance: 0.18 },
  { enemyId: "mini_fire_golem", count: 2, center: [12, 0, -12], radius: 5, eliteChance: 0.35 },
  { enemyId: "ignivar_flame_king", count: 1, center: [0, 0, -18], radius: 1, eliteChance: 1 }
];

export const TIDERUIN_GARDENS_SPAWNS = [
  { enemyId: "bubble_slime", count: 5, center: [-22, 0, 4], radius: 9, eliteChance: 0.08 },
  { enemyId: "coral_crab", count: 4, center: [18, 0, 8], radius: 9, eliteChance: 0.1 },
  { enemyId: "tide_imp", count: 4, center: [-20, 0, -20], radius: 8, eliteChance: 0.1 },
  { enemyId: "spearfin_raider", count: 3, center: [24, 0, -22], radius: 8, eliteChance: 0.12 },
  { enemyId: "pearl_wisp", count: 3, center: [-2, 0, -32], radius: 7, eliteChance: 0.15 },
  { enemyId: "reef_golem", count: 1, center: [32, 0, -36], radius: 4, eliteChance: 1 },
  { enemyId: "abyss_knight", count: 2, center: [-34, 0, -36], radius: 6, eliteChance: 0.45 }
];

export const SUNKEN_SANCTUM_SPAWNS = [
  { enemyId: "coral_crab", count: 3, center: [-12, 0, -6], radius: 5, eliteChance: 0.12 },
  { enemyId: "pearl_wisp", count: 3, center: [12, 0, -12], radius: 5, eliteChance: 0.18 },
  { enemyId: "reef_golem", count: 1, center: [0, 0, -22], radius: 4, eliteChance: 1 },
  { enemyId: "marrowfin_leviathan", count: 1, center: [0, 0, -30], radius: 1, eliteChance: 1 }
];

export const TIDE_EMPRESS_ARENA_SPAWNS = [
  { enemyId: "tide_imp", count: 3, center: [-10, 0, -8], radius: 5, eliteChance: 0.18 },
  { enemyId: "pearl_wisp", count: 2, center: [10, 0, -10], radius: 5, eliteChance: 0.18 },
  { enemyId: "queen_nereida", count: 1, center: [0, 0, -18], radius: 1, eliteChance: 1 }
];

export const V22_QUESTS = {
  steam_through_the_ice: {
    id: "steam_through_the_ice",
    name: "Steam Through the Ice",
    description: "Enter Flameburg through the Molten Gate.",
    targetEventId: "enter_flameburg",
    required: 1,
    reward: { coins: 180, xp: 240 }
  },
  welcome_to_flameburg: {
    id: "welcome_to_flameburg",
    name: "Welcome to Flameburg",
    description: "Speak with Warden Pyra and unlock the Flameburg waypoint.",
    targetEventId: "speak_warden_pyra",
    required: 1,
    reward: { coins: 180, xp: 260 }
  },
  stones_that_walk: {
    id: "stones_that_walk",
    name: "Stones That Walk",
    description: "Defeat Magma Rocklings and Mini Fire Golems.",
    targets: [{ enemyId: "magma_rockling", required: 5 }, { enemyId: "mini_fire_golem", required: 2 }],
    required: 7,
    reward: { coins: 220, xp: 320, itemId: "emberstone" }
  },
  hounds_of_ash_road: {
    id: "hounds_of_ash_road",
    name: "Hounds of Ash Road",
    description: "Defeat Ember Hounds.",
    targetEnemyId: "ember_hound",
    required: 4,
    reward: { coins: 210, xp: 300 }
  },
  ashes_in_the_sky: {
    id: "ashes_in_the_sky",
    name: "Ashes in the Sky",
    description: "Defeat Cinder Bats and Furnace Wisps.",
    targets: [{ enemyId: "cinder_bat", required: 3 }, { enemyId: "furnace_wisp", required: 3 }],
    required: 6,
    reward: { coins: 240, xp: 340, itemId: "furnace_spark" }
  },
  seal_the_eruption: {
    id: "seal_the_eruption",
    name: "Seal the Eruption",
    description: "Complete the Seal the Eruption public event.",
    targetEventId: "seal_the_eruption",
    required: 1,
    reward: { coins: 280, xp: 420, itemId: "magma_core" }
  },
  into_emberdeep: {
    id: "into_emberdeep",
    name: "Into Emberdeep",
    description: "Clear Emberdeep Mines.",
    targetEnemyId: "moltar_minebreaker",
    required: 1,
    reward: { coins: 360, xp: 620, itemId: "fire_golem_fragment" }
  },
  crownforge_approach: {
    id: "crownforge_approach",
    name: "Crownforge Approach",
    description: "Defeat Ashborn Raiders and the Lava Colossus.",
    targets: [{ enemyId: "ashborn_raider", required: 4 }, { enemyId: "lava_colossus", required: 1 }],
    required: 5,
    reward: { coins: 420, xp: 700 }
  },
  the_flame_king: {
    id: "the_flame_king",
    name: "The Flame King",
    description: "Defeat Ignivar in Crownforge Citadel.",
    targetEnemyId: "ignivar_flame_king",
    required: 1,
    reward: { coins: 650, xp: 950, title: "Kingsflame" }
  },
  tidegate_opens: {
    id: "tidegate_opens",
    name: "Tidegate Opens",
    description: "Enter Aqua Palace.",
    targetEventId: "enter_aqua_palace",
    required: 1,
    reward: { coins: 260, xp: 360 }
  },
  welcome_to_the_palace: {
    id: "welcome_to_the_palace",
    name: "Welcome to the Palace",
    description: "Speak with the palace envoy.",
    targetEventId: "speak_palace_envoy",
    required: 1,
    reward: { coins: 260, xp: 380 }
  },
  bubble_trouble: {
    id: "bubble_trouble",
    name: "Bubble Trouble",
    description: "Defeat Bubble Slimes and Coral Crabs.",
    targets: [{ enemyId: "bubble_slime", required: 5 }, { enemyId: "coral_crab", required: 4 }],
    required: 9,
    reward: { coins: 320, xp: 520, itemId: "coral_chunk" }
  },
  raiders_of_the_reef: {
    id: "raiders_of_the_reef",
    name: "Raiders of the Reef",
    description: "Defeat Tide Imps and Spearfin Raiders.",
    targets: [{ enemyId: "tide_imp", required: 4 }, { enemyId: "spearfin_raider", required: 3 }],
    required: 7,
    reward: { coins: 360, xp: 580 }
  },
  pearl_recovery: {
    id: "pearl_recovery",
    name: "Pearl Recovery",
    description: "Defeat Pearl Wisps and recover pearl shards.",
    targetEnemyId: "pearl_wisp",
    required: 4,
    reward: { coins: 380, xp: 600, itemId: "pearl_shard" }
  },
  into_the_sunken_sanctum: {
    id: "into_the_sunken_sanctum",
    name: "Into the Sunken Sanctum",
    description: "Clear Sunken Sanctum.",
    targetEnemyId: "marrowfin_leviathan",
    required: 1,
    reward: { coins: 520, xp: 900, itemId: "leviathan_scale" }
  },
  deep_current: {
    id: "deep_current",
    name: "Deep Current",
    description: "Defeat a Reef Golem or Abyss Knight.",
    targets: [{ enemyId: "reef_golem", required: 1 }, { enemyId: "abyss_knight", required: 1 }],
    required: 2,
    reward: { coins: 480, xp: 760 }
  },
  tide_empress: {
    id: "tide_empress",
    name: "Tide Empress",
    description: "Defeat Queen Nereida.",
    targetEnemyId: "queen_nereida",
    required: 1,
    reward: { coins: 820, xp: 1300, title: "Tidebreaker" }
  }
};

export const V22_BOUNTIES = [
  { id: "flameburg_rocklings", title: "Crack the Rocklings", type: "hunt_enemy", target: "magma_rockling", required: 8, zone: "Ashen Expanse", reward: { xp: 300, coins: 140, items: [{ itemId: "emberstone", quantity: 3 }] } },
  { id: "flameburg_golems", title: "Break Fire Golems", type: "hunt_enemy", target: "mini_fire_golem", required: 3, zone: "Ashen Expanse", reward: { xp: 380, coins: 170, items: [{ itemId: "fire_golem_fragment", quantity: 2 }] } },
  { id: "seal_eruption_bounty", title: "Seal the Eruption", type: "complete_event", target: "seal_the_eruption", required: 1, zone: "Ashen Expanse", reward: { xp: 460, coins: 220, items: [{ itemId: "magma_core", quantity: 1 }] } },
  { id: "clear_emberdeep", title: "Clear Emberdeep Mines", type: "clear_dungeon", target: "emberdeep_mines", required: 1, zone: "Emberdeep Mines", reward: { xp: 620, coins: 280, items: [{ itemId: "fire_golem_fragment", quantity: 3 }] } },
  { id: "defeat_ignivar", title: "Crown Falls", type: "defeat_boss", target: "ignivar_flame_king", required: 1, zone: "Crownforge Citadel", reward: { xp: 800, coins: 360, items: [{ itemId: "royal_cinder", quantity: 1 }] } },
  { id: "aqua_bubble_slimes", title: "Bubble Trouble", type: "hunt_enemy", target: "bubble_slime", required: 8, zone: "Tideruin Gardens", reward: { xp: 420, coins: 190, items: [{ itemId: "pearl_shard", quantity: 2 }] } },
  { id: "aqua_coral_crabs", title: "Crab Line", type: "hunt_enemy", target: "coral_crab", required: 6, zone: "Tideruin Gardens", reward: { xp: 460, coins: 210, items: [{ itemId: "coral_chunk", quantity: 3 }] } },
  { id: "aqua_tide_imps", title: "Imp Tide", type: "hunt_enemy", target: "tide_imp", required: 6, zone: "Tideruin Gardens", reward: { xp: 500, coins: 240, items: [{ itemId: "tide_essence", quantity: 1 }] } },
  { id: "clear_sunken_sanctum", title: "Sanctum Diver", type: "clear_dungeon", target: "sunken_sanctum", required: 1, zone: "Sunken Sanctum", reward: { xp: 860, coins: 340, items: [{ itemId: "leviathan_scale", quantity: 1 }] } },
  { id: "defeat_nereida", title: "Tidebreaker", type: "defeat_boss", target: "queen_nereida", required: 1, zone: "Tide Empress Arena", reward: { xp: 1050, coins: 480, items: [{ itemId: "royal_pearl", quantity: 1 }] } }
];

export const V22_ZONE_COMPLETION_REQUIREMENTS = {
  [ZONES.FLAMEBURG]: {
    quests: ["steam_through_the_ice", "welcome_to_flameburg"],
    waypoint: "flameburg_waypoint",
    chests: ["flameburg_forge_cache"]
  },
  [ZONES.ASHEN_EXPANSE]: {
    quests: ["stones_that_walk", "hounds_of_ash_road", "ashes_in_the_sky", "seal_the_eruption", "crownforge_approach"],
    bestiary: ["magma_rockling", "mini_fire_golem", "ember_hound", "cinder_bat", "furnace_wisp", "ashborn_raider", "lava_colossus"],
    chests: ["ashen_ember_cache"]
  },
  [ZONES.EMBERDEEP_MINES]: {
    quests: ["into_emberdeep"],
    bestiary: ["moltar_minebreaker"],
    boss: "moltar_minebreaker"
  },
  [ZONES.CROWNFORGE_CITADEL]: {
    quests: ["the_flame_king"],
    bestiary: ["ignivar_flame_king"],
    boss: "ignivar_flame_king"
  },
  [ZONES.AQUA_PALACE]: {
    quests: ["tidegate_opens", "welcome_to_the_palace"],
    waypoint: "aqua_palace_waypoint",
    chests: ["aqua_pearl_cache"]
  },
  [ZONES.TIDERUIN_GARDENS]: {
    quests: ["bubble_trouble", "raiders_of_the_reef", "pearl_recovery", "deep_current"],
    bestiary: ["bubble_slime", "coral_crab", "tide_imp", "spearfin_raider", "pearl_wisp", "reef_golem", "abyss_knight"],
    chests: ["tideruin_coral_cache"]
  },
  [ZONES.SUNKEN_SANCTUM]: {
    quests: ["into_the_sunken_sanctum"],
    bestiary: ["marrowfin_leviathan"],
    boss: "marrowfin_leviathan"
  },
  [ZONES.TIDE_EMPRESS_ARENA]: {
    quests: ["tide_empress"],
    bestiary: ["queen_nereida"],
    boss: "queen_nereida"
  }
};
