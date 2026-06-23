import { ZONES } from "./constants.js";

export const ZONE_DEFS = {
  [ZONES.HUB]: {
    id: ZONES.HUB,
    name: "Dawnrest",
    subtitle: "Hub Town",
    spawn: { x: 0, y: 0, z: 6 },
    bounds: 42,
    portals: [
      { id: "to_field", label: "Greenvale Outskirts", targetZone: ZONES.FIELD, x: 0, z: -31, radius: 3 },
      { id: "to_boss", label: "Shadow Peak", targetZone: ZONES.BOSS, x: 28, z: 25, radius: 3, minLevel: 3 }
    ]
  },
  [ZONES.FIELD]: {
    id: ZONES.FIELD,
    name: "Greenvale Outskirts",
    subtitle: "Starter Field",
    spawn: { x: 0, y: 0, z: 31 },
    bounds: 54,
    portals: [
      { id: "to_hub", label: "Dawnrest", targetZone: ZONES.HUB, x: 0, z: 37, radius: 3 },
      { id: "to_boss", label: "Shadow Peak", targetZone: ZONES.BOSS, x: 36, z: -34, radius: 3, minLevel: 3 },
      {
        id: "to_frostveil",
        label: "Frostveil Reach",
        targetZone: ZONES.FROSTVEIL,
        x: -40,
        z: -36,
        radius: 3,
        minLevel: 5,
        lockMessage: "The frozen passage rejects you. Reach Level 5 to enter."
      }
    ]
  },
  [ZONES.FROSTVEIL]: {
    id: ZONES.FROSTVEIL,
    name: "Frostveil Reach",
    subtitle: "Level 5 Ice Frontier",
    spawn: { x: 0, y: 0, z: 24 },
    bounds: 58,
    minLevel: 5,
    waypointId: "frostveil_camp",
    portals: [
      { id: "to_field", label: "Greenvale Outskirts", targetZone: ZONES.FIELD, x: 0, z: 32, radius: 3 },
      {
        id: "to_palace",
        label: "Palace of Zero",
        targetZone: ZONES.PALACE,
        x: 34,
        z: -34,
        radius: 3,
        minLevel: 8,
        lockMessage: "The palace gate is sealed. Reach Level 8 to enter."
      },
      {
        id: "to_frostbound_vault",
        label: "Frostbound Vault",
        targetZone: ZONES.FROSTBOUND_VAULT,
        x: -36,
        z: 34,
        radius: 3,
        minLevel: 15,
        lockMessage: "Frostbound Vault requires Level 15."
      },
      {
        id: "to_flameburg",
        label: "Molten Gate",
        targetZone: ZONES.FLAMEBURG,
        x: 42,
        z: -4,
        radius: 3,
        minLevel: 15,
        lockMessage: "The Molten Gate rejects you. Reach Level 15 to enter Flameburg."
      }
    ]
  },
  [ZONES.FROSTBOUND_VAULT]: {
    id: ZONES.FROSTBOUND_VAULT,
    name: "Frostbound Vault",
    subtitle: "Scalable Dungeon",
    spawn: { x: 0, y: 0, z: 18 },
    bounds: 34,
    minLevel: 15,
    recommendedLevel: "15+",
    scaling: {
      minimumLevel: 15,
      maximumLevel: 100,
      baseLevel: 15,
      scalingMode: "party_average",
      partyHealthMultiplier: 0.45,
      partyDamageMultiplier: 0.1,
      maxHealthMultiplier: 2.35,
      maxDamageMultiplier: 1.35,
      rewardScaling: "encounter_level"
    },
    portals: [
      { id: "to_frostveil", label: "Frostveil Reach", targetZone: ZONES.FROSTVEIL, x: 0, z: 24, radius: 3 }
    ]
  },
  [ZONES.PALACE]: {
    id: ZONES.PALACE,
    name: "Palace of Zero",
    subtitle: "Ice Mage Boss Chamber",
    spawn: { x: 0, y: 0, z: 18 },
    bounds: 32,
    minLevel: 8,
    portals: [
      { id: "to_frostveil", label: "Frostveil Reach", targetZone: ZONES.FROSTVEIL, x: 0, z: 24, radius: 3 }
    ]
  },
  [ZONES.FLAMEBURG]: {
    id: ZONES.FLAMEBURG,
    name: "Flameburg",
    subtitle: "Level 15-20 Fire City",
    spawn: { x: 0, y: 0, z: 26 },
    bounds: 52,
    minLevel: 15,
    waypointId: "flameburg_waypoint",
    portals: [
      { id: "to_frostveil", label: "Frostveil Reach", targetZone: ZONES.FROSTVEIL, x: -32, z: 28, radius: 3 },
      { id: "to_ashen", label: "Ashen Expanse", targetZone: ZONES.ASHEN_EXPANSE, x: 0, z: -34, radius: 3, minLevel: 15 },
      { id: "to_emberdeep", label: "Emberdeep Mines", targetZone: ZONES.EMBERDEEP_MINES, x: 28, z: -18, radius: 3, minLevel: 17, lockMessage: "Emberdeep Mines requires Level 17." }
    ]
  },
  [ZONES.ASHEN_EXPANSE]: {
    id: ZONES.ASHEN_EXPANSE,
    name: "Ashen Expanse",
    subtitle: "Level 15-20 Fire Frontier",
    spawn: { x: 0, y: 0, z: 32 },
    bounds: 60,
    minLevel: 15,
    portals: [
      { id: "to_flameburg", label: "Flameburg", targetZone: ZONES.FLAMEBURG, x: 0, z: 38, radius: 3 },
      { id: "to_crownforge", label: "Crownforge Citadel", targetZone: ZONES.CROWNFORGE_CITADEL, x: 36, z: -36, radius: 3, minLevel: 18, lockMessage: "Crownforge Citadel requires Level 18." },
      { id: "to_aqua", label: "Tidegate", targetZone: ZONES.AQUA_PALACE, x: -38, z: -36, radius: 3, minLevel: 20, lockMessage: "The Tidegate remains sealed. Reach Level 20 to enter Aqua Palace." }
    ]
  },
  [ZONES.EMBERDEEP_MINES]: {
    id: ZONES.EMBERDEEP_MINES,
    name: "Emberdeep Mines",
    subtitle: "Level 17 Dungeon",
    spawn: { x: 0, y: 0, z: 20 },
    bounds: 36,
    minLevel: 17,
    portals: [
      { id: "to_flameburg", label: "Flameburg", targetZone: ZONES.FLAMEBURG, x: 0, z: 24, radius: 3 }
    ]
  },
  [ZONES.CROWNFORGE_CITADEL]: {
    id: ZONES.CROWNFORGE_CITADEL,
    name: "Crownforge Citadel",
    subtitle: "Ignivar Boss Arena",
    spawn: { x: 0, y: 0, z: 22 },
    bounds: 34,
    minLevel: 18,
    portals: [
      { id: "to_ashen", label: "Ashen Expanse", targetZone: ZONES.ASHEN_EXPANSE, x: 0, z: 26, radius: 3 }
    ]
  },
  [ZONES.AQUA_PALACE]: {
    id: ZONES.AQUA_PALACE,
    name: "Aqua Palace",
    subtitle: "Level 20-30 Water Palace",
    spawn: { x: 0, y: 0, z: 26 },
    bounds: 52,
    minLevel: 20,
    waypointId: "aqua_palace_waypoint",
    portals: [
      { id: "to_ashen", label: "Ashen Expanse", targetZone: ZONES.ASHEN_EXPANSE, x: -32, z: 28, radius: 3 },
      { id: "to_tideruin", label: "Tideruin Gardens", targetZone: ZONES.TIDERUIN_GARDENS, x: 0, z: -34, radius: 3, minLevel: 20 },
      { id: "to_sanctum", label: "Sunken Sanctum", targetZone: ZONES.SUNKEN_SANCTUM, x: 28, z: -18, radius: 3, minLevel: 24, lockMessage: "Sunken Sanctum requires Level 24." }
    ]
  },
  [ZONES.TIDERUIN_GARDENS]: {
    id: ZONES.TIDERUIN_GARDENS,
    name: "Tideruin Gardens",
    subtitle: "Level 20-30 Water Frontier",
    spawn: { x: 0, y: 0, z: 32 },
    bounds: 60,
    minLevel: 20,
    portals: [
      { id: "to_aqua", label: "Aqua Palace", targetZone: ZONES.AQUA_PALACE, x: 0, z: 38, radius: 3 },
      { id: "to_nereida", label: "Tide Empress Arena", targetZone: ZONES.TIDE_EMPRESS_ARENA, x: 36, z: -36, radius: 3, minLevel: 25, lockMessage: "Queen Nereida requires Level 25." }
    ]
  },
  [ZONES.SUNKEN_SANCTUM]: {
    id: ZONES.SUNKEN_SANCTUM,
    name: "Sunken Sanctum",
    subtitle: "Level 24 Dungeon",
    spawn: { x: 0, y: 0, z: 20 },
    bounds: 36,
    minLevel: 24,
    portals: [
      { id: "to_aqua", label: "Aqua Palace", targetZone: ZONES.AQUA_PALACE, x: 0, z: 24, radius: 3 }
    ]
  },
  [ZONES.TIDE_EMPRESS_ARENA]: {
    id: ZONES.TIDE_EMPRESS_ARENA,
    name: "Tide Empress Arena",
    subtitle: "Queen Nereida Boss Arena",
    spawn: { x: 0, y: 0, z: 22 },
    bounds: 34,
    minLevel: 25,
    portals: [
      { id: "to_tideruin", label: "Tideruin Gardens", targetZone: ZONES.TIDERUIN_GARDENS, x: 0, z: 26, radius: 3 }
    ]
  },
  [ZONES.BOSS]: {
    id: ZONES.BOSS,
    name: "Shadow Peak",
    subtitle: "Boss Arena",
    spawn: { x: 0, y: 0, z: 22 },
    bounds: 30,
    portals: [
      { id: "to_hub", label: "Dawnrest", targetZone: ZONES.HUB, x: 0, z: 26, radius: 3 }
    ]
  }
};

export const WAYPOINTS = {
  dawnrest: { id: "dawnrest", zone: ZONES.HUB, label: "Dawnrest" },
  greenvale_camp: { id: "greenvale_camp", zone: ZONES.FIELD, label: "Greenvale Camp" },
  frostveil_camp: { id: "frostveil_camp", zone: ZONES.FROSTVEIL, label: "Frostveil Camp" },
  flameburg_waypoint: { id: "flameburg_waypoint", zone: ZONES.FLAMEBURG, label: "Flameburg" },
  aqua_palace_waypoint: { id: "aqua_palace_waypoint", zone: ZONES.AQUA_PALACE, label: "Aqua Palace" }
};

export function getZone(zoneId) {
  return ZONE_DEFS[zoneId] || ZONE_DEFS[ZONES.HUB];
}

export function canEnterZone(player, zoneId) {
  const zone = getZone(zoneId);
  const minLevel = zone.minLevel || 1;
  if ((player?.level || 1) < minLevel) {
    return {
      ok: false,
      reason: "level",
      minLevel,
      message: zoneId === ZONES.FROSTVEIL
      ? "The frozen passage rejects you. Reach Level 5 to enter."
      : zoneId === ZONES.PALACE
        ? "The palace gate is sealed. Reach Level 8 to enter."
        : zoneId === ZONES.FROSTBOUND_VAULT
          ? "Frostbound Vault requires Level 15."
        : zoneId === ZONES.FLAMEBURG
          ? "The Molten Gate rejects you. Reach Level 15 to enter Flameburg."
        : zoneId === ZONES.AQUA_PALACE
          ? "The Tidegate remains sealed. Reach Level 20 to enter Aqua Palace."
        : `Reach Level ${minLevel} to enter ${zone.name}.`
    };
  }
  return { ok: true, zone };
}

export function calculateDungeonEncounterScale(zoneId, partyMembers = []) {
  const zone = getZone(zoneId);
  const scaling = zone.scaling || {};
  const minLevel = scaling.minimumLevel || zone.minLevel || 1;
  const maxLevel = scaling.maximumLevel || minLevel;
  const eligibleLevels = (Array.isArray(partyMembers) ? partyMembers : [])
    .map((member) => clampLevel(member?.level, minLevel, maxLevel))
    .filter((level) => level >= minLevel);
  const partySize = Math.max(1, Math.min(4, eligibleLevels.length || 1));
  const averageLevel = eligibleLevels.length
    ? eligibleLevels.reduce((total, level) => total + level, 0) / eligibleLevels.length
    : scaling.baseLevel || minLevel;
  const encounterLevel = clampLevel(Math.round(averageLevel), minLevel, maxLevel);
  const additionalPlayers = partySize - 1;
  const healthMultiplier = Math.min(
    scaling.maxHealthMultiplier || 2.35,
    1 + additionalPlayers * (scaling.partyHealthMultiplier ?? 0.45)
  );
  const damageMultiplier = Math.min(
    scaling.maxDamageMultiplier || 1.35,
    1 + additionalPlayers * (scaling.partyDamageMultiplier ?? 0.1)
  );

  return {
    zoneId: zone.id,
    scalingMode: scaling.scalingMode || "fixed",
    encounterLevel,
    partySize,
    healthMultiplier,
    damageMultiplier,
    rewardScaling: scaling.rewardScaling || "fixed"
  };
}

export function unlockWaypoint(player, waypointId) {
  if (!WAYPOINTS[waypointId]) return { ok: false, reason: "waypoint", player };
  const waypoints = Array.from(new Set([...(player.waypoints || []), waypointId]));
  return { ok: true, player: { ...player, waypoints } };
}

function clampLevel(level, minLevel, maxLevel) {
  const number = Number(level);
  const safe = Number.isFinite(number) ? Math.round(number) : minLevel;
  return Math.max(minLevel, Math.min(maxLevel, safe));
}
