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
    rarity: RARITIES.RARE,
    attack: 4,
    speed: 1,
    pulseCooldownBonus: 0.85,
    description: "A bright wand that helps Hero Pulse recharge faster."
  },
  shadow_fang: {
    id: "shadow_fang",
    name: "Shadow Fang",
    type: "weapon",
    rarity: RARITIES.EPIC,
    attack: 12,
    speed: 1.05,
    description: "An epic blade that leaks smoke-black light."
  },
  traveler_tunic: {
    id: "traveler_tunic",
    name: "Traveler Tunic",
    type: "armor",
    rarity: RARITIES.COMMON,
    defense: 0,
    speed: 1,
    description: "Comfortable clothes for the road."
  },
  leather_vest: {
    id: "leather_vest",
    name: "Leather Vest",
    type: "armor",
    rarity: RARITIES.COMMON,
    defense: 2,
    speed: 1,
    description: "Light armor for field work."
  },
  goblin_guardmail: {
    id: "goblin_guardmail",
    name: "Goblin Guardmail",
    type: "armor",
    rarity: RARITIES.UNCOMMON,
    defense: 4,
    speed: 0.98,
    description: "Ugly guard plates with useful straps."
  },
  stoneguard_plate: {
    id: "stoneguard_plate",
    name: "Stoneguard Plate",
    type: "armor",
    rarity: RARITIES.RARE,
    defense: 7,
    speed: 0.9,
    description: "Sturdy armor chipped from golem stone."
  },
  wyrm_scale_shield: {
    id: "wyrm_scale_shield",
    name: "Wyrm Scale Shield",
    type: "armor",
    rarity: RARITIES.EPIC,
    defense: 10,
    speed: 0.96,
    description: "A shield of dark scale, still warm from the fight."
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
  }
};

export const STARTER_INVENTORY = [
  { itemId: "small_health_potion", quantity: 2 }
];

export function getItem(itemId) {
  return ITEMS[itemId] || null;
}
