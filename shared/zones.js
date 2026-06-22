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
      }
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
  frostveil_camp: { id: "frostveil_camp", zone: ZONES.FROSTVEIL, label: "Frostveil Camp" }
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
        : `Reach Level ${minLevel} to enter ${zone.name}.`
    };
  }
  return { ok: true, zone };
}

export function unlockWaypoint(player, waypointId) {
  if (!WAYPOINTS[waypointId]) return { ok: false, reason: "waypoint", player };
  const waypoints = Array.from(new Set([...(player.waypoints || []), waypointId]));
  return { ok: true, player: { ...player, waypoints } };
}
