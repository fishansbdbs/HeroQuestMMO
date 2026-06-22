import { STARTER_INVENTORY } from "../../shared/items.js";
import { PLAYER_STATES, STARTING_PLAYER, ZONES } from "../../shared/constants.js";
import { applyEquipment } from "../../shared/combat.js";
import { createQuestProgress } from "../../shared/quests.js";
import { migrateIceZeroSave } from "../../shared/saveMigration.js";

export function createPlayerState(socketId, profile = {}) {
  const migrated = migrateIceZeroSave(profile).save;
  const color = Number(migrated.color || 0x4da7ff);
  const rawIncomingHealth = Number(profile.health ?? STARTING_PLAYER.health);
  const incomingHealth = Number(migrated.health ?? STARTING_PLAYER.health);
  const shouldRecover = rawIncomingHealth <= 0 || incomingHealth <= 0 || profile.state === PLAYER_STATES.DEAD || migrated.state === PLAYER_STATES.DEAD;
  const base = applyEquipment({
    ...STARTING_PLAYER,
    ...migrated,
    health: shouldRecover ? STARTING_PLAYER.health : incomingHealth,
    inventory: migrated.inventory || STARTER_INVENTORY,
    questProgress: migrated.questProgress || createQuestProgress(),
    equippedWeapon: migrated.equippedWeapon || STARTING_PLAYER.equippedWeapon,
    equippedArmor: migrated.equippedArmor || STARTING_PLAYER.equippedArmor
  });
  if (shouldRecover) base.health = base.maxHealth;

  return {
    ...base,
    id: socketId,
    name: cleanName(migrated.name || "New Hero"),
    color,
    state: PLAYER_STATES.ALIVE,
    defeatedAt: null,
    respawnAt: null,
    zone: shouldRecover ? ZONES.HUB : migrated.zone || ZONES.HUB,
    position: shouldRecover ? dawnrestSpawn() : migrated.position || dawnrestSpawn(),
    lastInputAt: Date.now(),
    lastAttackAt: 0,
    lastAbilityAt: 0,
    partyId: null,
    title: migrated.title || ""
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
    mana: player.mana,
    maxMana: player.maxMana,
    physicalPower: player.physicalPower,
    spellPower: player.spellPower,
    healingPower: player.healingPower,
    damageReduction: player.damageReduction,
    availableAttributePoints: player.availableAttributePoints,
    availableSkillPoints: player.availableSkillPoints,
    spentAttributes: player.spentAttributes,
    coins: player.coins,
    xp: player.xp,
    partyId: player.partyId,
    title: player.title,
    state: player.state || PLAYER_STATES.ALIVE,
    respawnAt: player.respawnAt || null,
    equipment: player.equipment,
    equippedWeapon: player.equippedWeapon,
    equippedArmor: player.equippedArmor,
    magicPower: player.magicPower,
    inventory: player.inventory,
    learnedAbilities: player.learnedAbilities,
    hotbar: player.hotbar,
    skillTreeNodes: player.skillTreeNodes,
    savedBuilds: player.savedBuilds,
    activeLoadout: player.activeLoadout
  };
}

function dawnrestSpawn() {
  return { x: 0, y: 0, z: 6, rot: 0 };
}

function cleanName(value) {
  return String(value).replace(/[^\w -]/g, "").trim().slice(0, 18) || "New Hero";
}
