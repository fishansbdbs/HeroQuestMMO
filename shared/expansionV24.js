export const V24_WEAPON_IDS = [
  "iron_longsword",
  "bandit_cutlass",
  "knightbreaker_axe",
  "golem_hammer",
  "riftglass_blade",
  "frostbite_rapier",
  "ember_cleaver",
  "tideguard_trident",
  "stormhook_spear",
  "dawnmender_staff",
  "moonwell_staff",
  "titanbone_greatblade"
];

export const V24_ARMOR_IDS = [
  "adventurer_cap",
  "adventurer_vest",
  "adventurer_gloves",
  "adventurer_boots",
  "bandit_hood",
  "bandit_jacket",
  "bandit_wraps",
  "bandit_boots",
  "stoneguard_helm",
  "stoneguard_plate",
  "stoneguard_fists",
  "stoneguard_boots",
  "moonwell_circlet",
  "moonwell_robe",
  "moonwell_gloves",
  "moonwell_sandals"
];

export const V24_RELIC_IDS = [
  "slime_charm",
  "goblin_lucky_coin",
  "wyrm_ember_scale",
  "zero_crystal_pendant",
  "flameheart_relic",
  "tide_pearl",
  "storm_sigil",
  "adventurers_badge"
];

export const V24_ITEMS = {
  iron_longsword: weapon("iron_longsword", "Iron Longsword", "Common", 4, { attack: 7, speed: 1 }, "Balanced blade from Dawnrest smiths.", "iron-longblade-straight", "IL", 0xb8c0c8, 95),
  bandit_cutlass: weapon("bandit_cutlass", "Bandit Cutlass", "Uncommon", 6, { attack: 8, speed: 1.08 }, "Curved blade for quick physical builds.", "bandit-cutlass-curved", "BC", 0xc59a57, 135),
  knightbreaker_axe: weapon("knightbreaker_axe", "Knightbreaker Axe", "Uncommon", 8, { attack: 13, speed: 0.88 }, "Heavy axe with high physical power.", "knightbreaker-broad-axe", "KA", 0x8f9aa3, 175),
  golem_hammer: weapon("golem_hammer", "Golem Hammer", "Rare", 10, { attack: 16, defense: 2, speed: 0.78, knockbackBonus: 1.2 }, "Slow stone hammer that hits with heavy knockback.", "golem-stone-hammer", "GH", 0x77736b, 260),
  riftglass_blade: weapon("riftglass_blade", "Riftglass Blade", "Rare", 12, { attack: 12, magicPower: 5, heroPulseBonus: 0.08 }, "Purple glass edge that sharpens Hero Pulse.", "riftglass-purple-blade", "RB", 0x9a76ff, 320),
  frostbite_rapier: weapon("frostbite_rapier", "Frostbite Rapier", "Rare", 15, { attack: 11, magicPower: 4, speed: 1.16, chillChance: 0.06 }, "Thin ice blade with a small chill chance.", "frostbite-needle-rapier", "FR", 0x9fe7ff, 360),
  ember_cleaver: weapon("ember_cleaver", "Ember Cleaver", "Rare", 18, { attack: 16, fireResistance: 5, burnChance: 0.07 }, "Wide orange blade built for burn synergy.", "ember-cleaver-wide", "EC", 0xff6a24, 420),
  tideguard_trident: weapon("tideguard_trident", "Tideguard Trident", "Rare", 22, { attack: 13, magicPower: 6, waterBlastBonus: 0.1 }, "Long trident that empowers Water Blast.", "tideguard-three-prong", "TT", 0x67dfff, 520),
  stormhook_spear: weapon("stormhook_spear", "Stormhook Spear", "Rare", 30, { attack: 17, speed: 1.05, movementSpeed: 4, lightningResistance: 4 }, "Hooked spear that moves like lightning.", "stormhook-hook-spear", "SS", 0xfff38a, 720),
  dawnmender_staff: weapon("dawnmender_staff", "Dawnmender Staff", "Rare", 10, { magicPower: 4, healingPower: 9, maxMana: 12, healingOrbBonus: 0.1 }, "Warm staff that strengthens Healing Orb.", "dawnmender-sun-staff", "DS", 0xffdf72, 280, "staff"),
  moonwell_staff: weapon("moonwell_staff", "Moonwell Staff", "Epic", 16, { magicPower: 10, healingPower: 10, maxMana: 24, mendAllyBonus: 0.12 }, "Floating crescent staff for healers and mages.", "moonwell-crescent-staff", "MS", 0xc5a6ff, 640, "staff"),
  titanbone_greatblade: weapon("titanbone_greatblade", "Titanbone Greatblade", "Epic", 25, { attack: 24, defense: 4, speed: 0.72 }, "Huge elite blade carved from titan bone.", "titanbone-huge-greatblade", "TG", 0xe7d7bd, 880),

  adventurer_cap: armor("adventurer_cap", "Adventurer Cap", "Common", 3, "head", "adventurer", { health: 12, defense: 1 }, "adventurer-cap-feather", "AC", 0x5d8f71, 60),
  adventurer_vest: armor("adventurer_vest", "Adventurer Vest", "Common", 4, "chest", "adventurer", { health: 18, defense: 2 }, "adventurer-vest-sash", "AV", 0x7a9458, 80),
  adventurer_gloves: armor("adventurer_gloves", "Adventurer Gloves", "Common", 5, "hands", "adventurer", { health: 10, defense: 1, attack: 1 }, "adventurer-gloves-cuffed", "AG", 0x8a6f4a, 70),
  adventurer_boots: armor("adventurer_boots", "Adventurer Boots", "Common", 6, "boots", "adventurer", { health: 10, defense: 1, speed: 1.03 }, "adventurer-boots-travel", "AB", 0x6d583c, 75),
  bandit_hood: armor("bandit_hood", "Bandit Hood", "Uncommon", 6, "head", "bandit", { attack: 2, speed: 1.02 }, "bandit-hood-shadow", "BH", 0x2d3142, 110),
  bandit_jacket: armor("bandit_jacket", "Bandit Jacket", "Uncommon", 8, "chest", "bandit", { attack: 3, defense: 3, speed: 1.02 }, "bandit-jacket-straps", "BJ", 0x493241, 145),
  bandit_wraps: armor("bandit_wraps", "Bandit Wraps", "Uncommon", 9, "hands", "bandit", { attack: 3, speed: 1.04 }, "bandit-wraps-knotted", "BW", 0x5b4231, 120),
  bandit_boots: armor("bandit_boots", "Bandit Boots", "Uncommon", 10, "boots", "bandit", { attack: 2, speed: 1.08, movementSpeed: 3 }, "bandit-boots-silent", "BB", 0x1f2a30, 135),
  stoneguard_helm: armor("stoneguard_helm", "Stoneguard Helm", "Rare", 10, "head", "stoneguard", { health: 22, defense: 5, speed: 0.99 }, "stoneguard-helm-brow", "SH", 0x6f766f, 210),
  stoneguard_plate: armor("stoneguard_plate", "Stoneguard Plate", "Rare", 12, "chest", "stoneguard", { health: 45, defense: 9, speed: 0.96 }, "stoneguard-plate-slab", "SP", 0x77736b, 300),
  stoneguard_fists: armor("stoneguard_fists", "Stoneguard Fists", "Rare", 13, "hands", "stoneguard", { health: 18, defense: 5, attack: 2 }, "stoneguard-fists-block", "SF", 0x8b8b80, 230),
  stoneguard_boots: armor("stoneguard_boots", "Stoneguard Boots", "Rare", 15, "boots", "stoneguard", { health: 20, defense: 5, speed: 0.98 }, "stoneguard-boots-anchored", "SB", 0x5f625d, 235),
  moonwell_circlet: armor("moonwell_circlet", "Moonwell Circlet", "Rare", 12, "head", "moonwell", { magicPower: 4, healingPower: 4, maxMana: 12 }, "moonwell-circlet-orbit", "MC", 0xa6d8ff, 230),
  moonwell_robe: armor("moonwell_robe", "Moonwell Robe", "Rare", 14, "chest", "moonwell", { magicPower: 5, healingPower: 5, maxMana: 18, defense: 2 }, "moonwell-robe-runes", "MR", 0x4b75a8, 310),
  moonwell_gloves: armor("moonwell_gloves", "Moonwell Gloves", "Rare", 16, "hands", "moonwell", { magicPower: 4, healingPower: 4, maxMana: 10 }, "moonwell-gloves-silver", "MG", 0x7e9fd0, 240),
  moonwell_sandals: armor("moonwell_sandals", "Moonwell Sandals", "Rare", 18, "boots", "moonwell", { healingPower: 4, maxMana: 10, speed: 1.04 }, "moonwell-sandals-flow", "MN", 0x9fc8ff, 245),

  slime_charm: relic("slime_charm", "Slime Charm", "Common", 2, { health: 30 }, "Taking damage can heal 5 HP on a short cooldown.", "slime-charm-green-drop", "SC", 0x54d46f, 80, { id: "slime_mend", healOnHit: 5, cooldownMs: 12000 }),
  goblin_lucky_coin: relic("goblin_lucky_coin", "Goblin Lucky Coin", "Uncommon", 4, { coinGain: 0.05 }, "Small chance for extra coins from normal enemies.", "goblin-lucky-coin", "GC", 0xf2c867, 140, { id: "lucky_coin", coinGain: 0.05 }),
  wyrm_ember_scale: relic("wyrm_ember_scale", "Wyrm Ember Scale", "Rare", 8, { attack: 6, defense: 4 }, "Slash grants a tiny temporary damage shield.", "wyrm-ember-scale", "WE", 0xff6b57, 260, { id: "slash_shield", shieldAfterSlash: 8 }),
  zero_crystal_pendant: relic("zero_crystal_pendant", "Zero Crystal Pendant", "Rare", 10, { magicPower: 8, maxMana: 20 }, "Water Blast and Chain Frost cost slightly less mana.", "zero-crystal-pendant", "ZP", 0xb8fbff, 320, { id: "zero_focus", manaCostReduction: 0.08 }),
  flameheart_relic: relic("flameheart_relic", "Flameheart Relic", "Rare", 18, { attack: 10, fireResistance: 5 }, "Physical hits can apply a small Burn.", "flameheart-relic-core", "FR", 0xff6a24, 420, { id: "flameheart_burn", burnChance: 0.05 }),
  tide_pearl: relic("tide_pearl", "Tide Pearl", "Rare", 22, { healingPower: 8, health: 40 }, "Healing Orb heals slightly more.", "tide-pearl-orb", "TP", 0x8ceaff, 440, { id: "orb_amplifier", healingOrbBonus: 0.12 }),
  storm_sigil: relic("storm_sigil", "Storm Sigil", "Rare", 30, { magicPower: 6, movementSpeed: 4, lightningResistance: 4, cooldownReduction: 0.04 }, "Dash cooldown is slightly reduced.", "storm-sigil-bolt", "SG", 0xfff38a, 560, { id: "storm_dash", dashCooldownReduction: 0.08 }),
  adventurers_badge: relic("adventurers_badge", "Adventurer's Badge", "Uncommon", 5, { health: 8, attack: 2, magicPower: 2, defense: 2, questXpGain: 0.05 }, "Quest XP is slightly increased.", "adventurers-badge-star", "AD", 0xd8b46a, 180, { id: "quest_xp", questXpGain: 0.05 })
};

export const V24_EQUIPMENT_SETS = {
  adventurer: set("adventurer", "Adventurer", "Starter / Health", V24_ARMOR_IDS.slice(0, 4), { 2: { health: 12 }, 4: { defense: 2 } }),
  bandit: set("bandit", "Bandit", "Speed / Physical", V24_ARMOR_IDS.slice(4, 8), { 2: { attack: 3 }, 4: { movementSpeed: 4 } }),
  stoneguard: set("stoneguard", "Stoneguard", "Tank / Defense", V24_ARMOR_IDS.slice(8, 12), { 2: { defense: 4 }, 4: { health: 35 } }),
  moonwell: set("moonwell", "Moonwell", "Magic / Healing", V24_ARMOR_IDS.slice(12, 16), { 2: { maxMana: 15 }, 4: { healingPower: 7 } })
};

function weapon(id, name, rarity, level, stats, description, visualProfile, icon, visualColor, sellValue, type = "weapon") {
  return { id, name, type, slot: "weapon", rarity, level, icon, visualColor, visualProfile, sellValue, source: "Relic Arsenal loot tables", description, ...stats };
}

function armor(id, name, rarity, level, slot, setId, stats, visualProfile, icon, visualColor, sellValue) {
  return { id, name, type: "armor", slot, setId, rarity, level, icon, visualColor, visualProfile, sellValue, source: `${setId} armor drops`, description: `${name} with a distinct ${setId} silhouette.`, ...stats };
}

function relic(id, name, rarity, level, stats, effectText, visualProfile, icon, visualColor, sellValue, passiveEffect) {
  return { id, name, type: "relic", slot: "accessory", rarity, level, icon, visualColor, visualProfile, sellValue, source: "Relic Arsenal drops, bosses, shops, and bounties", description: effectText, effectText, passiveEffect, ...stats };
}

function set(id, name, role, pieces, stats) {
  return {
    id,
    name,
    role,
    pieces,
    bonuses: {
      2: { id: `${id}_2`, label: `2 pieces: ${statText(stats[2])}.`, stats: stats[2] },
      4: { id: `${id}_4`, label: `4 pieces: ${statText(stats[4])}.`, stats: stats[4] }
    }
  };
}

function statText(stats) {
  return Object.entries(stats).map(([key, value]) => `+${value}${key === "movementSpeed" ? "% " : " "}${key}`).join(", ");
}
