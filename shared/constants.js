export const GAME_VERSION = "1.2.3";

export const ZONES = {
  HUB: "hub",
  FIELD: "field",
  FROSTVEIL: "frostveil",
  PALACE: "palace",
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

export const PLAYER_STATES = {
  ALIVE: "alive",
  DEAD: "dead"
};

export const RESPAWN_DELAY_MS = 5000;

export const XP_TABLE = [0, 60, 145, 260, 420, 650, 940, 1300, 1760, 2300, 3000, 3840, 4800, 5900, 7150];

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
  title: "HeroQuest MMO Patch Notes",
  versions: [
    {
      version: "2.0.0",
      title: "ICEZERO",
      date: "2026-06-22",
      summary: "A major expansion adding IceZero progression, Frostveil Reach, the Palace of Zero, and long-term MMO meta systems.",
      sections: [
        {
          title: "Progression",
          items: [
            "Added character attributes and attribute points.",
            "Added three skill trees, skill points, and two build loadouts.",
            "Added mana, trainer abilities, spellbook management, and configurable hotbar abilities.",
            "Added Rest Stones for safe stat and skill resets."
          ]
        },
        {
          title: "World",
          items: [
            "Added Frostveil Reach as a level 5 ice zone.",
            "Added six frozen enemy types, elite variants, and a Frost Ward public event.",
            "Added the Palace of Zero and Zero, the Ice Mage with repeated telegraphed attacks.",
            "Added IceZero quests, waypoints, personal boss rewards, and first-clear rewards."
          ]
        },
        {
          title: "Items And Meta",
          items: [
            "Added staffs, ice weapons, armor, helmets, and visible equipment upgrades.",
            "Upgraded inventory and equipment handling.",
            "Added Bestiary, achievements, titles, zone completion, and quest breadcrumbs.",
            "Preserved existing multiplayer, quests, treasure chests, death recovery, boss telegraphs, Netlify, and Render support."
          ]
        }
      ]
    },
    {
      version: "1.2.4",
      title: "Movement & Weapon Hold Fix",
      date: "2026-06-21",
      summary: "Camera-relative movement now faces the hero correctly, with clearer held-weapon visuals.",
      sections: [
        {
          title: "Movement",
          items: [
            "Fixed third-person WASD movement direction.",
            "Improved camera-relative movement.",
            "Fixed character rotation facing the wrong way.",
            "Improved player movement feel."
          ]
        },
        {
          title: "Weapons",
          items: [
            "Fixed sword attachment so weapons are held in the hand.",
            "Improved sword swing visuals."
          ]
        }
      ]
    },
    {
      version: "1.2.3",
      title: "Black Screen Hotfix",
      date: "2026-06-21",
      summary: "Emergency stabilization for the v1.2.2 runtime bundle while preserving chest interactions.",
      sections: [
        {
          title: "Hotfix",
          items: [
            "Fixed fatal duplicate chest variable declaration causing black screen.",
            "Added duplicate declaration scan for recent loot/shop/chest changes.",
            "Preserved treasure chest interaction where possible."
          ]
        }
      ]
    },
    {
      version: "1.2.2",
      title: "Core Fixes & Boss Telegraphs",
      date: "2026-06-21",
      summary: "Death recovery, boss quest credit, working interactions, cleaner hero visuals, and clearer MMO danger zones.",
      sections: [
        {
          title: "Core Fixes",
          items: [
            "Fixed death and respawn behavior.",
            "Fixed loading with 0 HP.",
            "Fixed level-up healing.",
            "Fixed enemy death cleanup.",
            "Fixed loot pickup edge cases."
          ]
        },
        {
          title: "Boss Encounter",
          items: [
            "Fixed Shadow Wyrm quest completion.",
            "Fixed boss attack loop.",
            "Added boss telegraph danger zones.",
            "Removed duplicate boss health bars."
          ]
        },
        {
          title: "World Interactions",
          items: [
            "Added working treasure chests.",
            "Added working weapon shop.",
            "Added NPC dialogue/tutorials.",
            "Added working training dummy.",
            "Improved player model customization foundation."
          ]
        }
      ]
    },
    {
      version: "1.2.1",
      title: "Combat & UI Overhaul",
      date: "2026-06-20",
      summary: "Blocky character silhouettes, MMO hotbar combat, richer target feedback, and a grouped patch notes surface.",
      sections: [
        {
          title: "Combat Hotbar",
          items: [
            "Added slots 1-8 with icons, keybinds, cooldown sweeps, disabled states, and tooltips.",
            "Added Auto Attack targeting, Slash, Hero Pulse, Guard, Potion, Dash, and two future locked slots.",
            "Added target rings, target frames, combat log pulses, damage numbers, hit sparks, and loot toasts."
          ]
        },
        {
          title: "Characters & Enemies",
          items: [
            "Rebuilt the hero, NPCs, and goblins as segmented blocky humanoids with unique proportions.",
            "Added enemy nameplates with level and health bars.",
            "Added family-specific defeat effects for slimes, goblins, wolves, wisps, and golems."
          ]
        },
        {
          title: "World Polish",
          items: [
            "Improved HUD panels, boss warnings, quest tracker collapse behavior, and online/party indicators.",
            "Added clearer combat affordances while preserving the Netlify client and Render server deployment paths."
          ]
        }
      ]
    },
    {
      version: "1.1.0",
      title: "First Adventure",
      date: "2026-06-20",
      summary: "The first playable online adventure across Dawnrest, Greenvale, and Shadow Peak.",
      sections: [
        {
          title: "Launch Content",
          items: [
            "Added Dawnrest hub town and Greenvale Outskirts starter zone.",
            "Added slimes, goblins, wolves, wisps, golems, and the Shadow Wyrm boss arena.",
            "Added online players, XP, coins, loot drops, inventory, equipment, quests, parties, Netlify, and Render support."
          ]
        }
      ]
    }
  ]
};
