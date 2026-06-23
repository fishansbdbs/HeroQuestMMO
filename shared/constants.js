export const GAME_VERSION = "2.2.0";

export const ZONES = {
  HUB: "hub",
  FIELD: "field",
  FROSTVEIL: "frostveil",
  PALACE: "palace",
  FROSTBOUND_VAULT: "frostbound_vault",
  FLAMEBURG: "flameburg",
  ASHEN_EXPANSE: "ashen_expanse",
  EMBERDEEP_MINES: "emberdeep_mines",
  CROWNFORGE_CITADEL: "crownforge_citadel",
  AQUA_PALACE: "aqua_palace",
  TIDERUIN_GARDENS: "tideruin_gardens",
  SUNKEN_SANCTUM: "sunken_sanctum",
  TIDE_EMPRESS_ARENA: "tide_empress_arena",
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

const LEGACY_XP_TABLE = [0, 60, 145, 260, 420, 650, 940, 1300, 1760, 2300, 3000, 3840, 4800, 5900, 7150];

function buildLevel100XpTable() {
  const table = [...LEGACY_XP_TABLE];
  while (table.length < 100) {
    const nextLevel = table.length + 1;
    const previous = table[table.length - 1];
    const increment = Math.round(1250 + Math.pow(nextLevel, 2.05) * 42);
    table.push(previous + increment);
  }
  return table;
}

export const XP_TABLE = buildLevel100XpTable();

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
      version: "2.2.0",
      title: "Flameburg & Aqua Palace",
      date: "2026-06-23",
      summary: "Adds fire and water regions, combat-ready spell coverage, physical Healing Orb pickups, new dungeons, bosses, items, bounties, achievements, and save migration support.",
      sections: [
        {
          title: "Regions",
          items: [
            "Added Flameburg Level 15-20 and Ashen Expanse.",
            "Added Emberdeep Mines and Ignivar, the Flame King.",
            "Added Aqua Palace Level 20-30 and Tideruin Gardens.",
            "Added Sunken Sanctum and Queen Nereida, the Tide Empress."
          ]
        },
        {
          title: "Combat And Progression",
          items: [
            "Fixed combat-ready spells for online and solo/local play.",
            "Ensured Healing Orb remains a physical pickup with server validation and solo pickup handling.",
            "Fixed the red hit-flash so it expires and resets on zone changes, death, and respawn.",
            "Added fire and water enemies, bosses, materials, bounties, Bestiary entries, achievements, titles, weapons, armor, and set bonuses."
          ]
        }
      ]
    },
    {
      version: "2.1.0",
      title: "Frostforged Paths",
      date: "2026-06-22",
      summary: "A systems expansion adding Frostforge upgrades, set bonuses, tier-two abilities, Frostbound Vault, and rotating bounties.",
      sections: [
        {
          title: "Progression",
          items: [
            "Added Iceguard, Zero-Born, and Dawnmender equipment sets with two-piece and four-piece bonuses.",
            "Added Whirlwind Cleave, Chain Frost, and Radiant Ward through tier-two skill-tree nodes.",
            "Raised long-term progression support through Level 100."
          ]
        },
        {
          title: "Frostbound",
          items: [
            "Added the Level 15 Frostbound Vault with elite rooms and the Runebound Colossus.",
            "Added the Dawnrest Bounty Board with deterministic rotating objectives.",
            "Added predictable +0 through +5 Frostforge upgrades."
          ]
        }
      ]
    },
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
