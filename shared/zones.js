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
      { id: "to_boss", label: "Shadow Peak", targetZone: ZONES.BOSS, x: 36, z: -34, radius: 3, minLevel: 3 }
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

export function getZone(zoneId) {
  return ZONE_DEFS[zoneId] || ZONE_DEFS[ZONES.HUB];
}
