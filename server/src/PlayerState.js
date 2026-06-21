import { STARTER_INVENTORY } from "../../shared/items.js";
import { PLAYER_STATES, STARTING_PLAYER, ZONES } from "../../shared/constants.js";
import { applyEquipment } from "../../shared/combat.js";
import { createQuestProgress } from "../../shared/quests.js";

export function createPlayerState(socketId, profile = {}) {
  const color = Number(profile.color || 0x4da7ff);
  const incomingHealth = Number(profile.health ?? STARTING_PLAYER.health);
  const shouldRecover = incomingHealth <= 0 || profile.state === PLAYER_STATES.DEAD;
  const base = applyEquipment({
    ...STARTING_PLAYER,
    ...profile,
    health: shouldRecover ? STARTING_PLAYER.health : incomingHealth,
    inventory: profile.inventory || STARTER_INVENTORY,
    questProgress: profile.questProgress || createQuestProgress(),
    equippedWeapon: profile.equippedWeapon || STARTING_PLAYER.equippedWeapon,
    equippedArmor: profile.equippedArmor || STARTING_PLAYER.equippedArmor
  });
  if (shouldRecover) base.health = base.maxHealth;

  return {
    ...base,
    id: socketId,
    name: cleanName(profile.name || "New Hero"),
    color,
    state: PLAYER_STATES.ALIVE,
    defeatedAt: null,
    respawnAt: null,
    zone: shouldRecover ? ZONES.HUB : profile.zone || ZONES.HUB,
    position: shouldRecover ? dawnrestSpawn() : profile.position || dawnrestSpawn(),
    lastInputAt: Date.now(),
    lastAttackAt: 0,
    lastAbilityAt: 0,
    partyId: null,
    title: profile.title || ""
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
    state: player.state || PLAYER_STATES.ALIVE,
    respawnAt: player.respawnAt || null,
    equippedWeapon: player.equippedWeapon,
    equippedArmor: player.equippedArmor
  };
}

function dawnrestSpawn() {
  return { x: 0, y: 0, z: 6, rot: 0 };
}

function cleanName(value) {
  return String(value).replace(/[^\w -]/g, "").trim().slice(0, 18) || "New Hero";
}
