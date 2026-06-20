export const GAME_VERSION = "1.1.0";

export const ZONES = {
  HUB: "hub",
  FIELD: "field",
  BOSS: "boss"
};

export const STARTING_PLAYER = {
  level: 1,
  xp: 0,
  coins: 50,
  health: 100,
  maxHealth: 100,
  attack: 10,
  defense: 2,
  speed: 8,
  equippedWeapon: "wooden_sword",
  equippedArmor: "traveler_tunic"
};

export const XP_TABLE = [0, 60, 145, 260, 420, 650, 940, 1300, 1760, 2300, 3000];

export const PLAYER_LIMITS = {
  partySize: 4,
  meleeRange: 3.2,
  abilityRange: 5.2,
  dashCooldownMs: 2200,
  attackCooldownMs: 520
};

export const SERVER_TICK_MS = 100;
export const SNAPSHOT_MS = 120;

export const PATCH_NOTES = {
  title: "Version 1.1 - First Adventure",
  items: [
    "Added Dawnrest hub town",
    "Added Greenvale Outskirts starter zone",
    "Added online players",
    "Added slimes, goblins, wolves, wisps, and golems",
    "Added Shadow Wyrm boss arena",
    "Added basic combat",
    "Added XP and coins",
    "Added loot drops",
    "Added inventory and equipment",
    "Added party system",
    "Added Netlify and Render deployment support"
  ]
};
