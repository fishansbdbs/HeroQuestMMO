import { ZONES } from "./constants.js";
import { AURELION_BOSS, BOSS, ENEMIES, ICE_MAGE_BOSS, VOLTRUK_BOSS } from "./enemies.js";
import { V22_ZONE_COMPLETION_REQUIREMENTS } from "./expansionV22.js";
import { V23_ZONE_COMPLETION_REQUIREMENTS } from "./expansionV23.js";

export const ACHIEVEMENTS = {
  first_spell: {
    id: "first_spell",
    name: "First Spell",
    description: "Learn a trainer ability.",
    title: "Spell-Touched"
  },
  field_medic: {
    id: "field_medic",
    name: "Field Medic",
    description: "Learn or use a healing ability.",
    title: "Field Medic"
  },
  wyrm_slayer: {
    id: "wyrm_slayer",
    name: "Wyrm Slayer",
    description: "Defeat the Shadow Wyrm.",
    title: "Wyrm Slayer"
  },
  icebreaker: {
    id: "icebreaker",
    name: "Icebreaker",
    description: "Defeat Zero, the Ice Mage.",
    title: "Icebreaker"
  },
  elite_hunter: {
    id: "elite_hunter",
    name: "Elite Hunter",
    description: "Defeat an elite enemy.",
    title: "Elite Hunter"
  },
  frostveil_explorer: {
    id: "frostveil_explorer",
    name: "Frostveil Explorer",
    description: "Discover Frostveil Camp.",
    title: "Frostveil Explorer"
  },
  through_the_molten_gate: {
    id: "through_the_molten_gate",
    name: "Through the Molten Gate",
    description: "Enter Flameburg.",
    title: "Gatewalker"
  },
  eruption_sealed: {
    id: "eruption_sealed",
    name: "Eruption Sealed",
    description: "Complete Seal the Eruption.",
    title: "Eruption Sealer"
  },
  the_crown_falls: {
    id: "the_crown_falls",
    name: "The Crown Falls",
    description: "Defeat Ignivar.",
    title: "Kingsflame"
  },
  tidegate_opened: {
    id: "tidegate_opened",
    name: "Tidegate Opened",
    description: "Enter Aqua Palace.",
    title: "Tidegate Walker"
  },
  sanctum_diver: {
    id: "sanctum_diver",
    name: "Sanctum Diver",
    description: "Clear Sunken Sanctum.",
    title: "Sanctum Diver"
  },
  tidebreaker: {
    id: "tidebreaker",
    name: "Tidebreaker",
    description: "Defeat Queen Nereida.",
    title: "Tidebreaker"
  },
  stormgate_opened: {
    id: "stormgate_opened",
    name: "Stormgate Opened",
    description: "Enter Stormwatch Landing.",
    title: "Stormwalker"
  },
  skybreaker: {
    id: "skybreaker",
    name: "Skybreaker",
    description: "Clear Skybreaker Ruins.",
    title: "Skybreaker"
  },
  thunderstruck: {
    id: "thunderstruck",
    name: "Thunderstruck",
    description: "Learn a storm ability.",
    title: "Thunderstruck"
  },
  stormbound: {
    id: "stormbound",
    name: "Stormbound",
    description: "Defeat Aurelion, the Storm Titan.",
    title: "Stormbound"
  }
};

export const TITLES = Object.fromEntries(
  Object.values(ACHIEVEMENTS).map((achievement) => [achievement.id, achievement.title])
);

export const ZONE_COMPLETION_REQUIREMENTS = {
  [ZONES.HUB]: {
    waypoint: "dawnrest",
    chests: ["hub_weapon_cache"]
  },
  [ZONES.FIELD]: {
    quests: ["slime_trouble", "goblin_patrol", "first_hunt", "stone_in_the_woods"],
    bestiary: ["green_slime", "blue_slime", "goblin_scout", "goblin_cutter", "gray_wolf", "forest_wisp", "stone_golem"],
    chests: ["field_north_cache", "field_south_cache"]
  },
  [ZONES.FROSTVEIL]: {
    quests: ["frozen_road", "cold_blooded", "howling_white", "shattered_ward", "heart_of_the_blizzard"],
    bestiary: ["frost_slime", "ice_goblin", "snow_wolf", "frost_wisp", "ice_golem", "frozen_knight"],
    waypoint: "frostveil_camp",
    chests: ["frostveil_snow_cache"]
  },
  [ZONES.PALACE]: {
    quests: ["palace_of_zero", "icezero"],
    boss: ICE_MAGE_BOSS.id
  },
  [ZONES.BOSS]: {
    quests: ["shadow_at_the_peak"],
    boss: BOSS.id
  },
  ...V22_ZONE_COMPLETION_REQUIREMENTS,
  ...V23_ZONE_COMPLETION_REQUIREMENTS
};

export function recordBestiaryKill(player, enemyDef, options = {}) {
  if (!player || !enemyDef?.id) return { ok: false, reason: "enemy", player };
  const bestiaryProgress = { ...(player.bestiaryProgress || {}) };
  const existing = bestiaryProgress[enemyDef.id] || {};
  const elite = Boolean(options.elite || enemyDef.elite);
  bestiaryProgress[enemyDef.id] = {
    id: enemyDef.id,
    name: enemyDef.name || existing.name || enemyDef.id,
    family: enemyDef.family || existing.family || "unknown",
    zone: enemyDef.zone || existing.zone || ZONES.FIELD,
    level: enemyDef.level || existing.level || 1,
    discovered: true,
    kills: nonNegativeInt(existing.kills) + 1,
    eliteKills: nonNegativeInt(existing.eliteKills) + (elite ? 1 : 0)
  };
  return { ok: true, player: { ...player, bestiaryProgress } };
}

export function evaluateAchievements(player) {
  if (!player) return { player, unlocked: [] };
  const achievements = new Set(Array.isArray(player.achievements) ? player.achievements : []);
  const unlocked = [];
  const learnedAbilities = Array.isArray(player.learnedAbilities) ? player.learnedAbilities : [];
  const firstClearRewards = player.firstClearRewards || {};
  const bestiaryEntries = Object.values(player.bestiaryProgress || {});
  const waypoints = Array.isArray(player.waypoints) ? player.waypoints : [];

  unlockWhen(learnedAbilities.length > 0, "first_spell", achievements, unlocked);
  unlockWhen(learnedAbilities.includes("healing_orb") || learnedAbilities.includes("mend_ally") || nonNegativeInt(player.healingDone) > 0, "field_medic", achievements, unlocked);
  unlockWhen(Boolean(firstClearRewards[BOSS.id]) || questComplete(player, "shadow_at_the_peak"), "wyrm_slayer", achievements, unlocked);
  unlockWhen(Boolean(firstClearRewards[ICE_MAGE_BOSS.id]) || questComplete(player, "icezero"), "icebreaker", achievements, unlocked);
  unlockWhen(bestiaryEntries.some((entry) => nonNegativeInt(entry.eliteKills) > 0), "elite_hunter", achievements, unlocked);
  unlockWhen(waypoints.includes("frostveil_camp") || questComplete(player, "frozen_road"), "frostveil_explorer", achievements, unlocked);
  unlockWhen(waypoints.includes("flameburg_waypoint") || questComplete(player, "steam_through_the_ice"), "through_the_molten_gate", achievements, unlocked);
  unlockWhen(questComplete(player, "seal_the_eruption"), "eruption_sealed", achievements, unlocked);
  unlockWhen(Boolean(firstClearRewards.ignivar_flame_king) || questComplete(player, "the_flame_king"), "the_crown_falls", achievements, unlocked);
  unlockWhen(waypoints.includes("aqua_palace_waypoint") || questComplete(player, "tidegate_opens"), "tidegate_opened", achievements, unlocked);
  unlockWhen(Boolean(firstClearRewards.marrowfin_leviathan) || questComplete(player, "into_the_sunken_sanctum"), "sanctum_diver", achievements, unlocked);
  unlockWhen(Boolean(firstClearRewards.queen_nereida) || questComplete(player, "tide_empress"), "tidebreaker", achievements, unlocked);
  unlockWhen(waypoints.includes("stormwatch_waypoint") || questComplete(player, "welcome_to_stormwatch"), "stormgate_opened", achievements, unlocked);
  unlockWhen(Boolean(firstClearRewards[VOLTRUK_BOSS.id]) || questComplete(player, "heart_of_thunder"), "skybreaker", achievements, unlocked);
  unlockWhen(learnedAbilities.some((abilityId) => ["thunder_leap", "storm_bolt", "static_renewal"].includes(abilityId)), "thunderstruck", achievements, unlocked);
  unlockWhen(Boolean(firstClearRewards[AURELION_BOSS.id]) || questComplete(player, "storm_titan"), "stormbound", achievements, unlocked);

  return { player: { ...player, achievements: [...achievements] }, unlocked };
}

export function setActiveTitle(player, achievementId) {
  if (!player || !TITLES[achievementId]) return { ok: false, reason: "title", player };
  const achievements = Array.isArray(player.achievements) ? player.achievements : [];
  if (!achievements.includes(achievementId)) return { ok: false, reason: "locked", player };
  return { ok: true, player: { ...player, title: TITLES[achievementId] } };
}

export function calculateZoneCompletion(player, zoneId) {
  const requirements = ZONE_COMPLETION_REQUIREMENTS[zoneId] || {};
  const checklist = {};
  let completed = 0;
  let total = 0;

  const addCriterion = (id, entry) => {
    checklist[id] = entry;
    total += 1;
    if (entry.complete) completed += 1;
  };

  if (Array.isArray(requirements.quests) && requirements.quests.length) {
    const done = requirements.quests.filter((questId) => questComplete(player, questId)).length;
    addCriterion("quests", {
      label: "Quests",
      complete: done === requirements.quests.length,
      current: done,
      required: requirements.quests.length
    });
  }

  if (Array.isArray(requirements.bestiary) && requirements.bestiary.length) {
    const discovered = requirements.bestiary.filter((enemyId) => bestiaryDiscovered(player, enemyId)).length;
    addCriterion("bestiary", {
      label: "Bestiary",
      complete: discovered === requirements.bestiary.length,
      current: discovered,
      required: requirements.bestiary.length
    });
  }

  if (requirements.waypoint) {
    const complete = (player?.waypoints || []).includes(requirements.waypoint);
    addCriterion("waypoint", {
      label: "Waypoint",
      complete,
      current: complete ? 1 : 0,
      required: 1
    });
  }

  if (Array.isArray(requirements.chests) && requirements.chests.length) {
    const opened = requirements.chests.filter((chestId) => (player?.openedChests || []).includes(chestId)).length;
    addCriterion("chests", {
      label: "Treasure Chests",
      complete: opened === requirements.chests.length,
      current: opened,
      required: requirements.chests.length
    });
  }

  if (requirements.boss) {
    const complete = bossComplete(player, requirements.boss);
    addCriterion("boss", {
      label: "Boss",
      complete,
      current: complete ? 1 : 0,
      required: 1
    });
  }

  return {
    zone: zoneId,
    percent: total ? Math.round((completed / total) * 100) : 100,
    completed,
    total,
    checklist
  };
}

export function refreshZoneCompletion(player) {
  if (!player) return { player };
  const zoneCompletion = {};
  for (const zoneId of Object.keys(ZONE_COMPLETION_REQUIREMENTS)) {
    zoneCompletion[zoneId] = calculateZoneCompletion(player, zoneId);
  }
  return { player: { ...player, zoneCompletion } };
}

export function refreshMetaProgress(player) {
  const zoned = refreshZoneCompletion(player).player;
  return evaluateAchievements(zoned);
}

function unlockWhen(condition, achievementId, achievements, unlocked) {
  if (!condition || achievements.has(achievementId)) return;
  achievements.add(achievementId);
  unlocked.push(ACHIEVEMENTS[achievementId]);
}

function questComplete(player, questId) {
  return Boolean(player?.questProgress?.[questId]?.complete);
}

function bestiaryDiscovered(player, enemyId) {
  const entry = player?.bestiaryProgress?.[enemyId];
  return Boolean(entry?.discovered || nonNegativeInt(entry?.kills) > 0);
}

function bossComplete(player, bossId) {
  if (player?.firstClearRewards?.[bossId]) return true;
  if (bossId === BOSS.id) return questComplete(player, "shadow_at_the_peak") || bestiaryDiscovered(player, BOSS.id);
  if (bossId === ICE_MAGE_BOSS.id) return questComplete(player, "icezero") || bestiaryDiscovered(player, ICE_MAGE_BOSS.id);
  return Boolean(player?.firstClearRewards?.[bossId]) || bestiaryDiscovered(player, bossId);
}

function nonNegativeInt(value) {
  return Math.max(0, Math.floor(Number(value) || 0));
}
