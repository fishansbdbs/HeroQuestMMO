import { STARTER_INVENTORY } from "../../shared/items.js";
import { STARTING_PLAYER, ZONES } from "../../shared/constants.js";
import { applyEquipment } from "../../shared/combat.js";
import { createQuestProgress } from "../../shared/quests.js";

export function createPlayerState(socketId, profile = {}) {
  const color = Number(profile.color || 0x4da7ff);
  const base = applyEquipment({
    ...STARTING_PLAYER,
    ...profile,
    health: profile.health ?? STARTING_PLAYER.health,
    inventory: profile.inventory || STARTER_INVENTORY,
    questProgress: profile.questProgress || createQuestProgress(),
    equippedWeapon: profile.equippedWeapon || STARTING_PLAYER.equippedWeapon,
    equippedArmor: profile.equippedArmor || STARTING_PLAYER.equippedArmor
  });

  return {
    id: socketId,
    name: cleanName(profile.name || "New Hero"),
    color,
    zone: profile.zone || ZONES.HUB,
    position: profile.position || { x: 0, y: 0, z: 6, rot: 0 },
    lastInputAt: Date.now(),
    lastAttackAt: 0,
    lastAbilityAt: 0,
    partyId: null,
    title: profile.title || "",
    ...base
  };
}

export function sanitizePlayer(player) {
  return {
    id: player.id,
    name: player.name,
    color: player.color,
    zone: player.zone,
    position: player.position,
    level: player.level,
    health: player.health,
    maxHealth: player.maxHealth,
    coins: player.coins,
    xp: player.xp,
    partyId: player.partyId,
    title: player.title,
    equippedWeapon: player.equippedWeapon,
    equippedArmor: player.equippedArmor
  };
}

function cleanName(value) {
  return String(value).replace(/[^\w -]/g, "").trim().slice(0, 18) || "New Hero";
}
