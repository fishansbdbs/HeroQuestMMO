export const RARITIES = {
  COMMON: "Common",
  UNCOMMON: "Uncommon",
  RARE: "Rare",
  EPIC: "Epic"
};

export const ITEMS = {
  wooden_sword: {
    id: "wooden_sword",
    name: "Wooden Sword",
    type: "weapon",
    rarity: RARITIES.COMMON,
    attack: 0,
    speed: 1,
    description: "A balanced starter blade for new heroes."
  },
  rusty_blade: {
    id: "rusty_blade",
    name: "Rusty Blade",
    type: "weapon",
    rarity: RARITIES.COMMON,
    attack: 2,
    speed: 1,
    description: "Dull, but still better than a stick."
  },
  goblin_dagger: {
    id: "goblin_dagger",
    name: "Goblin Dagger",
    type: "weapon",
    rarity: RARITIES.COMMON,
    attack: 3,
    speed: 1.15,
    description: "A quick little cutter taken from a patrol."
  },
  wolf_fang_blade: {
    id: "wolf_fang_blade",
    name: "Wolf Fang Blade",
    type: "weapon",
    rarity: RARITIES.UNCOMMON,
    attack: 5,
    speed: 1.08,
    description: "A light blade edged with wild fang fragments."
  },
  stone_club: {
    id: "stone_club",
    name: "Stone Club",
    type: "weapon",
    rarity: RARITIES.UNCOMMON,
    attack: 7,
    speed: 0.82,
    description: "Heavy enough to make the ground complain."
  },
  wisp_wand: {
    id: "wisp_wand",
    name: "Wisp Wand",
    type: "weapon",
    slot: "weapon",
    rarity: RARITIES.RARE,
    attack: 4,
    magicPower: 4,
    speed: 1,
    pulseCooldownBonus: 0.85,
    description: "A bright wand that helps Hero Pulse recharge faster."
  },
  frostbite_sword: {
    id: "frostbite_sword",
    name: "Frostbite Sword",
    type: "weapon",
    slot: "weapon",
    rarity: RARITIES.UNCOMMON,
    level: 5,
    attack: 8,
    speed: 1,
    description: "A cold-edged blade from Frostveil scouts."
  },
  glacier_greatblade: {
    id: "glacier_greatblade",
    name: "Glacier Greatblade",
    type: "weapon",
    slot: "weapon",
    rarity: RARITIES.RARE,
    level: 8,
    attack: 14,
    speed: 0.86,
    description: "A heavy blade carved from blue glacier steel."
  },
  ice_goblin_shiv: {
    id: "ice_goblin_shiv",
    name: "Ice Goblin Shiv",
    type: "weapon",
    slot: "weapon",
    rarity: RARITIES.COMMON,
    level: 5,
    attack: 6,
    speed: 1.18,
    description: "A fast frozen dagger."
  },
  frozen_knight_blade: {
    id: "frozen_knight_blade",
    name: "Frozen Knight Blade",
    type: "weapon",
    slot: "weapon",
    rarity: RARITIES.UNCOMMON,
    level: 8,
    attack: 12,
    speed: 0.98,
    description: "A disciplined knight's sword rimed with ice."
  },
  apprentice_staff: {
    id: "apprentice_staff",
    name: "Apprentice Staff",
    type: "staff",
    slot: "weapon",
    rarity: RARITIES.COMMON,
    level: 2,
    magicPower: 3,
    speed: 1,
    description: "A simple focus for early spellcasting."
  },
  emberwood_staff: {
    id: "emberwood_staff",
    name: "Emberwood Staff",
    type: "staff",
    slot: "weapon",
    rarity: RARITIES.UNCOMMON,
    level: 4,
    magicPower: 6,
    speed: 1,
    fireballBonus: 0.08,
    description: "Warm wood that sharpens Fireball practice."
  },
  tidecaller_staff: {
    id: "tidecaller_staff",
    name: "Tidecaller Staff",
    type: "staff",
    slot: "weapon",
    rarity: RARITIES.UNCOMMON,
    level: 5,
    magicPower: 7,
    speed: 1,
    waterBlastBonus: 0.08,
    description: "A staff that hums with stored water magic."
  },
  wispwood_staff: {
    id: "wispwood_staff",
    name: "Wispwood Staff",
    type: "staff",
    slot: "weapon",
    rarity: RARITIES.RARE,
    level: 5,
    magicPower: 9,
    speed: 1,
    manaRegenBonus: 0.08,
    description: "A rare staff grown around a living spark."
  },
  frostspire_staff: {
    id: "frostspire_staff",
    name: "Frostspire Staff",
    type: "staff",
    slot: "weapon",
    rarity: RARITIES.RARE,
    level: 7,
    magicPower: 12,
    speed: 1,
    chillChance: 0.12,
    description: "A sharp blue focus with a chance to chill."
  },
  scepter_of_zero: {
    id: "scepter_of_zero",
    name: "Scepter of Zero",
    type: "staff",
    slot: "weapon",
    rarity: RARITIES.EPIC,
    level: 10,
    magicPower: 18,
    speed: 1,
    icezeroBonus: 0.12,
    description: "An epic focus taken from the Ice Mage."
  },
  shadow_fang: {
    id: "shadow_fang",
    name: "Shadow Fang",
    type: "weapon",
    slot: "weapon",
    rarity: RARITIES.EPIC,
    attack: 12,
    speed: 1.05,
    description: "An epic blade that leaks smoke-black light."
  },
  traveler_tunic: {
    id: "traveler_tunic",
    name: "Traveler Tunic",
    type: "armor",
    slot: "chest",
    rarity: RARITIES.COMMON,
    defense: 0,
    speed: 1,
    description: "Comfortable clothes for the road."
  },
  leather_vest: {
    id: "leather_vest",
    name: "Leather Vest",
    type: "armor",
    slot: "chest",
    rarity: RARITIES.COMMON,
    defense: 2,
    speed: 1,
    description: "Light armor for field work."
  },
  goblin_guardmail: {
    id: "goblin_guardmail",
    name: "Goblin Guardmail",
    type: "armor",
    slot: "chest",
    rarity: RARITIES.UNCOMMON,
    defense: 4,
    speed: 0.98,
    description: "Ugly guard plates with useful straps."
  },
  stoneguard_plate: {
    id: "stoneguard_plate",
    name: "Stoneguard Plate",
    type: "armor",
    slot: "chest",
    rarity: RARITIES.RARE,
    defense: 7,
    speed: 0.9,
    description: "Sturdy armor chipped from golem stone."
  },
  wyrm_scale_shield: {
    id: "wyrm_scale_shield",
    name: "Wyrm Scale Shield",
    type: "armor",
    slot: "offhand",
    rarity: RARITIES.EPIC,
    defense: 10,
    speed: 0.96,
    description: "A shield of dark scale, still warm from the fight."
  },
  snowhide_helmet: {
    id: "snowhide_helmet",
    name: "Snowhide Helmet",
    type: "armor",
    slot: "head",
    rarity: RARITIES.COMMON,
    level: 5,
    defense: 2,
    health: 8,
    description: "A warm hood reinforced with pale hide."
  },
  frozen_crown: {
    id: "frozen_crown",
    name: "Frozen Crown",
    type: "armor",
    slot: "head",
    rarity: RARITIES.EPIC,
    level: 10,
    defense: 5,
    magicPower: 6,
    description: "A crown of clear ice from Zero's palace."
  },
  frostguard_chestplate: {
    id: "frostguard_chestplate",
    name: "Frostguard Chestplate",
    type: "armor",
    slot: "chest",
    rarity: RARITIES.RARE,
    level: 7,
    defense: 9,
    health: 18,
    speed: 0.96,
    description: "Heavy Frostveil armor for frontline builds."
  },
  glacier_robe: {
    id: "glacier_robe",
    name: "Glacier Robe",
    type: "armor",
    slot: "chest",
    rarity: RARITIES.RARE,
    level: 7,
    defense: 4,
    magicPower: 8,
    description: "Layered robes for cold-weather spellcasters."
  },
  icebound_gloves: {
    id: "icebound_gloves",
    name: "Icebound Gloves",
    type: "armor",
    slot: "hands",
    rarity: RARITIES.UNCOMMON,
    level: 6,
    defense: 2,
    magicPower: 3,
    description: "Gloves that help hold cold spell energy."
  },
  frostguard_leggings: {
    id: "frostguard_leggings",
    name: "Frostguard Leggings",
    type: "armor",
    slot: "legs",
    rarity: RARITIES.UNCOMMON,
    level: 6,
    defense: 4,
    health: 10,
    description: "Leg armor built for snowy patrols."
  },
  frostwalker_boots: {
    id: "frostwalker_boots",
    name: "Frostwalker Boots",
    type: "armor",
    slot: "boots",
    rarity: RARITIES.RARE,
    level: 7,
    defense: 3,
    speed: 1.04,
    description: "Boots that keep footing steady on ice."
  },
  frozen_knight_shield: {
    id: "frozen_knight_shield",
    name: "Frozen Knight Shield",
    type: "armor",
    slot: "offhand",
    rarity: RARITIES.UNCOMMON,
    level: 8,
    defense: 6,
    health: 12,
    description: "A shield carried by the palace guard."
  },
  small_health_potion: {
    id: "small_health_potion",
    name: "Small Health Potion",
    type: "consumable",
    rarity: RARITIES.COMMON,
    heal: 30,
    description: "Restores 30 health."
  },
  rest_stone: {
    id: "rest_stone",
    name: "Rest Stone",
    type: "special",
    rarity: RARITIES.RARE,
    description: "Resets spent attribute and skill points while preserving level, XP, abilities, and gear."
  },
  slime_gel: {
    id: "slime_gel",
    name: "Slime Gel",
    type: "material",
    rarity: RARITIES.COMMON,
    description: "A crafting material for future recipes."
  },
  magic_shard: {
    id: "magic_shard",
    name: "Magic Shard",
    type: "material",
    rarity: RARITIES.UNCOMMON,
    description: "A bright shard dropped by forest wisps."
  },
  shadow_scale: {
    id: "shadow_scale",
    name: "Shadow Scale",
    type: "material",
    rarity: RARITIES.RARE,
    description: "A dark boss material for future upgrades."
  },
  ice_shard: {
    id: "ice_shard",
    name: "Ice Shard",
    type: "material",
    rarity: RARITIES.COMMON,
    description: "A cold shard gathered from Frostveil enemies."
  },
  wyrm_scale: {
    id: "wyrm_scale",
    name: "Wyrm Scale",
    type: "material",
    rarity: RARITIES.RARE,
    description: "A sturdy scale used in future boss gear recipes."
  },
  runic_core: {
    id: "runic_core",
    name: "Runic Core",
    type: "material",
    rarity: RARITIES.RARE,
    description: "A cold rune engine used for advanced Frostforge upgrades."
  }
};

export const STARTER_INVENTORY = [
  { itemId: "small_health_potion", quantity: 2 }
];

export function getItem(itemId) {
  return ITEMS[itemId] || null;
}
