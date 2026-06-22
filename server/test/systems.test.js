import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { ABILITIES } from "../../shared/abilities.js";
import { GAME_VERSION, PATCH_NOTES, STARTING_PLAYER, ZONES } from "../../shared/constants.js";
import { applyEquipment, addProgressRewards, calculateIncomingDamage } from "../../shared/combat.js";
import { BOSS, ENEMIES, FROSTVEIL_SPAWNS, ELITE_MODIFIERS, ICE_MAGE_BOSS } from "../../shared/enemies.js";
import { canEnterZone, getZone, unlockWaypoint } from "../../shared/zones.js";
import {
  calculateDamageReduction,
  regenerateMana,
  spendAttributePoint,
  spendMana,
  useRestStone
} from "../../shared/progression.js";
import { assignHotbarAbility, purchaseTrainerAbility, validateAbilityTarget } from "../../shared/trainers.js";
import { activateLoadout, purchaseSkillNode, saveLoadout } from "../../shared/skillTrees.js";
import { EQUIPMENT_SLOTS, createEquipmentState, equipItemToSlot } from "../../shared/equipment.js";
import { INVENTORY_SLOT_COUNT, addInventoryStack } from "../../shared/inventory.js";
import { NET } from "../../shared/netMessages.js";
import { applyQuestEvent, applyQuestKill, createQuestProgress } from "../../shared/quests.js";
import { EnemySystem } from "../src/EnemySystem.js";
import { LootSystem } from "../src/LootSystem.js";
import { PartySystem } from "../src/PartySystem.js";
import { CombatSystem } from "../src/CombatSystem.js";
import { BossSystem } from "../src/BossSystem.js";
import { PublicEventSystem } from "../src/PublicEventSystem.js";
import { createPlayerState } from "../src/PlayerState.js";
import { RoomManager } from "../src/RoomManager.js";

const nearlyEqual = (actual, expected, epsilon = 0.000001) => {
  assert.ok(Math.abs(actual - expected) <= epsilon, `expected ${actual} to be within ${epsilon} of ${expected}`);
};

const inventoryQuantity = (inventory, itemId) =>
  (inventory || []).filter((entry) => entry?.itemId === itemId).reduce((total, entry) => total + (entry.quantity || 0), 0);

test("client runtime chunks compile after concatenation", () => {
  const root = path.resolve(import.meta.dirname, "../..");
  const runtimeParts = ["1", "2", "3", "4", "5", "6", "7", "7b", "8", "8b", "9"];
  const runtimeSource = runtimeParts
    .map((part) => fs.readFileSync(path.join(root, `client/public/runtime/heroquest-runtime-${part}.js.txt`), "utf8"))
    .join("\n");

  assert.doesNotThrow(() => {
    new Function(
      "THREE",
      "io",
      "ABILITIES",
      "BOSS",
      "ICE_MAGE_BOSS",
      "ENEMIES",
      "FIELD_SPAWNS",
      "FROSTVEIL_SPAWNS",
      "getEnemy",
      "GAME_VERSION",
      "PATCH_NOTES",
      "PLAYER_LIMITS",
      "STARTING_PLAYER",
      "XP_TABLE",
      "ZONES",
      "getItem",
      "ITEMS",
      "STARTER_INVENTORY",
      "NET",
      "EQUIPMENT_SLOTS",
      "createEquipmentState",
      "equipItemToSlot",
      "slotForItem",
      "INVENTORY_SLOT_COUNT",
      "addInventoryStack",
      "normalizeInventory",
      "applyQuestEvent",
      "applyQuestKill",
      "createQuestProgress",
      "getQuestList",
      "getZone",
      "ZONE_DEFS",
      "canEnterZone",
      "unlockWaypoint",
      "ACHIEVEMENTS",
      "TITLES",
      "calculateZoneCompletion",
      "recordBestiaryKill",
      "refreshMetaProgress",
      "refreshZoneCompletion",
      "setActiveTitle",
      "addInventoryItem",
      "addProgressRewards",
      "applyEquipment",
      "calculateIncomingDamage",
      "calculatePlayerDamage",
      "consumeInventoryItem",
      "distance2d",
      "rollLoot",
      "xpToNextLevel",
      "createCameraRelativeMove",
      "smoothAngleToward",
      "visualYawForMoveDirection",
      "FROSTFORGED_MIGRATION_ID",
      "migrateFrostforgedSave",
      "applyProgressionStats",
      "regenerateMana",
      "spendAttributePoint",
      "spendMana",
      "useRestStone",
      "assignHotbarAbility",
      "getTrainerAbilities",
      "purchaseTrainerAbility",
      "activateLoadout",
      "purchaseSkillNode",
      "saveLoadout",
      "SKILL_NODES",
      "SKILL_TREES",
      "env",
      `"use strict";\n${runtimeSource}`
    );
  });
});

test("client runtime animates Fireball projectile acknowledgements", () => {
  const root = path.resolve(import.meta.dirname, "../..");
  const runtimeParts = ["1", "2", "3", "4", "5", "6", "7", "7b", "8", "8b", "9"];
  const runtimeSource = runtimeParts
    .map((part) => fs.readFileSync(path.join(root, `client/public/runtime/heroquest-runtime-${part}.js.txt`), "utf8"))
    .join("\n");
  const combatAckSource = runtimeSource.match(/function handleCombatAck\([\s\S]*?\n}\r?\n\r?\nfunction damagePlayer/)?.[0] || "";

  assert.ok(combatAckSource, "handleCombatAck runtime source should exist");
  assert.match(combatAckSource, /projectileEffect\(result\.projectile\)/);
  assert.match(runtimeSource, /function projectileEffect\(projectile\)/);
  assert.match(runtimeSource, /projectile\.type === "fireball"/);
});

test("client runtime animates Ground Pound area acknowledgements", () => {
  const root = path.resolve(import.meta.dirname, "../..");
  const runtimeParts = ["1", "2", "3", "4", "5", "6", "7", "7b", "8", "8b", "9"];
  const runtimeSource = runtimeParts
    .map((part) => fs.readFileSync(path.join(root, `client/public/runtime/heroquest-runtime-${part}.js.txt`), "utf8"))
    .join("\n");
  const combatAckSource = runtimeSource.match(/function handleCombatAck\([\s\S]*?\n}\r?\n\r?\nfunction damagePlayer/)?.[0] || "";

  assert.ok(combatAckSource, "handleCombatAck runtime source should exist");
  assert.match(combatAckSource, /areaEffect\(result\.areaEffect\)/);
  assert.match(runtimeSource, /function areaEffect\(effect\)/);
  assert.match(runtimeSource, /effect\.type === "ground_pound"/);
});

test("IceZero v2 title presentation and patch notes are registered", () => {
  const root = path.resolve(import.meta.dirname, "../..");
  const menuSource = fs.readFileSync(path.join(root, "client/public/runtime/heroquest-runtime-1.js.txt"), "utf8");

  assert.equal(GAME_VERSION, "2.0.0");
  assert.equal(PATCH_NOTES.versions[0].version, "2.0.0");
  assert.equal(PATCH_NOTES.versions[0].title, "ICEZERO");
  assert.match(menuSource, /HeroQuest MMO[\s\S]*ICEZERO/);
  assert.match(menuSource, /Continue Game/);
  assert.match(menuSource, /Character/);
  assert.match(menuSource, /Settings/);
  assert.match(menuSource, /Server status/);
  assert.match(menuSource, /Current character level/);
});

test("camera-relative movement maps WASD to flattened camera forward and right", async () => {
  const { createCameraRelativeMove } = await import("../../shared/movement.js");
  const cameraForward = { x: 0, y: -0.35, z: -1 };

  const forward = createCameraRelativeMove({ forward: 1, strafe: 0 }, cameraForward);
  nearlyEqual(forward.x, 0);
  nearlyEqual(forward.y, 0);
  nearlyEqual(forward.z, -1);

  const backward = createCameraRelativeMove({ forward: -1, strafe: 0 }, cameraForward);
  nearlyEqual(backward.x, 0);
  nearlyEqual(backward.z, 1);

  const left = createCameraRelativeMove({ forward: 0, strafe: -1 }, cameraForward);
  nearlyEqual(left.x, -1);
  nearlyEqual(left.z, 0);

  const right = createCameraRelativeMove({ forward: 0, strafe: 1 }, cameraForward);
  nearlyEqual(right.x, 1);
  nearlyEqual(right.z, 0);

  const diagonal = createCameraRelativeMove({ forward: 1, strafe: 1 }, cameraForward);
  nearlyEqual(Math.hypot(diagonal.x, diagonal.z), 1);
});

test("visual yaw faces the blocky hero front toward movement without a 180 degree flip", async () => {
  const { shortestAngleDelta, smoothAngleToward, visualYawForMoveDirection } = await import("../../shared/movement.js");

  nearlyEqual(visualYawForMoveDirection({ x: 0, z: -1 }), 0);
  nearlyEqual(visualYawForMoveDirection({ x: 1, z: 0 }), -Math.PI / 2);
  nearlyEqual(Math.abs(visualYawForMoveDirection({ x: 0, z: 1 })), Math.PI);

  const current = Math.PI - 0.1;
  const target = -Math.PI + 0.1;
  const next = smoothAngleToward(current, target, 0.5);

  assert.ok(Math.abs(next) > 3);
  assert.ok(Math.abs(shortestAngleDelta(next, target)) < Math.abs(shortestAngleDelta(current, target)));
});

test("player weapon is parented to a right hand anchor for held sword animation", () => {
  const root = path.resolve(import.meta.dirname, "../..");
  const runtimeSource = fs.readFileSync(path.join(root, "client/public/runtime/heroquest-runtime-2.js.txt"), "utf8");

  assert.match(runtimeSource, /rightHandAnchor/);
  assert.match(runtimeSource, /rightLowerArm\.add\(rightHandAnchor\)|parts\.rightLowerArm\.add\(rightHandAnchor\)/);
  assert.match(runtimeSource, /parts\.weaponGroup/);
});

test("IceZero save migration preserves legacy progress and grants retroactive points once", async () => {
  const { ICEZERO_MIGRATION_ID, migrateIceZeroSave } = await import("../../shared/saveMigration.js");
  const legacySave = {
    name: "Legacy Hero",
    color: 0x55d07a,
    level: 4,
    xp: 260,
    coins: 50,
    health: 0,
    maxHealth: 142,
    inventory: [
      { itemId: "small_health_potion", quantity: 2 },
      { itemId: "slime_gel", quantity: 3 }
    ],
    equippedWeapon: "stone_club",
    equippedArmor: "leather_vest",
    openedChests: ["hub_weapon_cache"],
    questProgress: createQuestProgress(),
    title: "Wyrm Slayer",
    settings: { master: 0.5, sensitivity: 1.1 },
    learnedAbilities: ["hero_pulse"],
    hotbar: ["auto", "slash", "hero_pulse", "guard", "potion", "dash", null, null]
  };

  const result = migrateIceZeroSave(legacySave);

  assert.equal(result.migrated, true);
  assert.deepEqual(result.backup.save, legacySave);
  assert.ok(result.save.migrations.includes(ICEZERO_MIGRATION_ID));
  assert.equal(result.save.name, legacySave.name);
  assert.equal(result.save.color, legacySave.color);
  assert.equal(result.save.level, legacySave.level);
  assert.equal(result.save.xp, legacySave.xp);
  assert.equal(result.save.coins, 150);
  assert.deepEqual(result.save.inventory, legacySave.inventory);
  assert.deepEqual(result.save.openedChests, legacySave.openedChests);
  assert.equal(result.save.title, legacySave.title);
  assert.equal(result.save.settings.sensitivity, 1.1);
  assert.equal(result.save.health > 0, true);
  assert.equal(result.save.equipment.weapon, legacySave.equippedWeapon);
  assert.equal(result.save.equipment.chest, legacySave.equippedArmor);
  assert.equal(result.save.availableAttributePoints, 9);
  assert.equal(result.save.availableSkillPoints, 3);
  assert.deepEqual(result.save.spentAttributes, { health: 0, strength: 0, magic: 0, defense: 0 });
  assert.equal(result.save.maxMana, 50);
  assert.equal(result.save.mana, 50);
  assert.deepEqual(result.save.learnedAbilities, []);
  assert.equal(result.save.hotbar.includes("hero_pulse"), false);
  assert.ok(result.messages.some((message) => message.includes("Combat training has changed")));
});

test("IceZero save migration does not duplicate retroactive grants on repeated loads", async () => {
  const { ICEZERO_MIGRATION_ID, migrateIceZeroSave } = await import("../../shared/saveMigration.js");
  const first = migrateIceZeroSave({
    name: "Repeat Hero",
    level: 5,
    xp: 420,
    coins: 10,
    inventory: [{ itemId: "small_health_potion", quantity: 2 }],
    learnedAbilities: ["hero_pulse"],
    hotbar: ["auto", "slash", "hero_pulse", "guard", "potion", "dash", null, null]
  }).save;

  const second = migrateIceZeroSave(first).save;

  assert.equal(second.availableAttributePoints, 12);
  assert.equal(second.availableSkillPoints, 4);
  assert.equal(second.coins, 110);
  assert.equal(second.migrations.filter((id) => id === ICEZERO_MIGRATION_ID).length, 1);
  assert.deepEqual(second.inventory, [{ itemId: "small_health_potion", quantity: 2 }]);
});

test("IceZero save migration keeps a backup and falls back safely for corrupted saves", async () => {
  const { migrateIceZeroSave } = await import("../../shared/saveMigration.js");
  const result = migrateIceZeroSave("{ not valid json");

  assert.equal(result.migrated, true);
  assert.equal(result.backup.raw, "{ not valid json");
  assert.equal(result.errors.length > 0, true);
  assert.equal(result.save.name, "");
  assert.equal(result.save.health > 0, true);
  assert.equal(result.save.availableAttributePoints >= 0, true);
  assert.equal(result.save.availableSkillPoints >= 0, true);
  assert.equal(Number.isNaN(result.save.maxMana), false);
  assert.equal(Number.isNaN(result.save.mana), false);
  assert.deepEqual(result.save.inventory, [{ itemId: "small_health_potion", quantity: 2 }]);
  assert.equal(result.save.equipment.weapon, STARTING_PLAYER.equippedWeapon);
  assert.equal(result.save.equipment.chest, STARTING_PLAYER.equippedArmor);
});

test("Frostforged Paths progression supports level cap 100 and max-level XP display", async () => {
  const { XP_TABLE } = await import("../../shared/constants.js");
  const { LEVEL_CAP, calculateEarnedAttributePoints, calculateEarnedSkillPoints } = await import("../../shared/progression.js");
  const { addProgressRewards, applyEquipment, xpToNextLevel } = await import("../../shared/combat.js");

  assert.equal(LEVEL_CAP, 100);
  assert.equal(XP_TABLE.length, LEVEL_CAP);
  assert.equal(XP_TABLE[0], 0);
  assert.ok(XP_TABLE.every((xp, index) => index === 0 || xp > XP_TABLE[index - 1]));

  const level100 = applyEquipment({ ...STARTING_PLAYER, xp: XP_TABLE[99] });
  assert.equal(level100.level, 100);
  assert.equal(level100.availableAttributePoints, calculateEarnedAttributePoints(100));
  assert.equal(level100.availableSkillPoints, calculateEarnedSkillPoints(100));
  assert.equal(xpToNextLevel(100), null);

  const rewarded = addProgressRewards({ ...level100, coins: 11 }, { xp: Number.MAX_SAFE_INTEGER, coins: 9 });
  assert.equal(rewarded.level, 100);
  assert.equal(rewarded.coins, 20);
  assert.equal(Number.isFinite(rewarded.xp), true);
  assert.equal(Number.isNaN(rewarded.xp), false);
});

test("Frostforged v2.1 save migration adds scaffold fields once without duplicating points", async () => {
  const { XP_TABLE } = await import("../../shared/constants.js");
  const { ICEZERO_MIGRATION_ID, FROSTFORGED_MIGRATION_ID, FROSTFORGED_SAVE_SCHEMA_VERSION, migrateFrostforgedSave } =
    await import("../../shared/saveMigration.js");

  const migrated = migrateFrostforgedSave({
    name: "Vault Runner",
    level: 20,
    xp: XP_TABLE[19],
    coins: 333,
    migrations: [ICEZERO_MIGRATION_ID],
    spentAttributes: { health: 1, strength: 2, magic: 3, defense: 4 },
    skillTreeNodes: { might_1: 2, arcana_1: 1 },
    inventory: [{ itemId: "small_health_potion", quantity: 3 }],
    learnedAbilities: ["fireball"],
    hotbar: ["auto", "slash", "fireball", "guard", "potion", "dash", null, null],
    publicEventClaims: ["defend_frost_ward:1", "defend_frost_ward:1"]
  }).save;

  assert.equal(migrated.saveSchemaVersion, FROSTFORGED_SAVE_SCHEMA_VERSION);
  assert.equal(migrated.level, 20);
  assert.equal(migrated.availableAttributePoints, 47);
  assert.equal(migrated.availableSkillPoints, 16);
  assert.equal(migrated.migrations.filter((id) => id === FROSTFORGED_MIGRATION_ID).length, 1);
  assert.deepEqual(migrated.itemInstances, {});
  assert.deepEqual(migrated.upgradeRanks, {});
  assert.deepEqual(migrated.buyback, []);
  assert.equal(migrated.spellbookHotbarVersion, 2);
  assert.equal(migrated.dungeonProgress.frostbound_vault.bestEncounterLevel, 0);
  assert.deepEqual(migrated.bounties.active, []);
  assert.deepEqual(migrated.publicEventClaims, ["defend_frost_ward:1"]);

  const remigrated = migrateFrostforgedSave(migrated).save;

  assert.equal(remigrated.migrations.filter((id) => id === FROSTFORGED_MIGRATION_ID).length, 1);
  assert.equal(remigrated.availableAttributePoints, migrated.availableAttributePoints);
  assert.equal(remigrated.availableSkillPoints, migrated.availableSkillPoints);
  assert.deepEqual(remigrated.inventory, migrated.inventory);
});

test("Frostbound Vault is a level 15 gate with clamped party encounter scaling", async () => {
  const { XP_TABLE, ZONES } = await import("../../shared/constants.js");
  const { canEnterZone, calculateDungeonEncounterScale, getZone } = await import("../../shared/zones.js");
  const root = path.resolve(import.meta.dirname, "../..");
  const runtimeOne = fs.readFileSync(path.join(root, "client/public/runtime/heroquest-runtime-1.js.txt"), "utf8");
  const runtimeTwo = fs.readFileSync(path.join(root, "client/public/runtime/heroquest-runtime-2.js.txt"), "utf8");

  assert.equal(ZONES.FROSTBOUND_VAULT, "frostbound_vault");

  const vault = getZone(ZONES.FROSTBOUND_VAULT);
  assert.equal(vault.minLevel, 15);
  assert.equal(vault.recommendedLevel, "15+");
  assert.equal(vault.scaling.minimumLevel, 15);
  assert.equal(vault.scaling.maximumLevel, 100);
  assert.equal(canEnterZone({ level: 14 }, ZONES.FROSTBOUND_VAULT).message, "Frostbound Vault requires Level 15.");
  assert.equal(canEnterZone({ level: 15 }, ZONES.FROSTBOUND_VAULT).ok, true);

  const solo = calculateDungeonEncounterScale(ZONES.FROSTBOUND_VAULT, [{ level: 15 }]);
  assert.equal(solo.encounterLevel, 15);
  assert.equal(solo.partySize, 1);
  assert.equal(solo.healthMultiplier, 1);
  assert.equal(solo.damageMultiplier, 1);

  const party = calculateDungeonEncounterScale(ZONES.FROSTBOUND_VAULT, [{ level: 100 }, { level: 80 }, { level: 90 }]);
  assert.equal(party.encounterLevel, 90);
  assert.equal(party.partySize, 3);
  nearlyEqual(party.healthMultiplier, 1.9);
  nearlyEqual(party.damageMultiplier, 1.2);

  const clamped = calculateDungeonEncounterScale(ZONES.FROSTBOUND_VAULT, [{ level: 140 }, { level: 120 }]);
  assert.equal(clamped.encounterLevel, 100);

  assert.match(runtimeOne, /buildFrostboundVault/);
  assert.match(runtimeTwo, /"Frostbound Vault", ZONES\.FROSTBOUND_VAULT/);
  assert.match(runtimeTwo, /"Frostbound Vault requires Level 15\."/);

  const io = { to: () => ({ emit: () => {} }), sockets: { sockets: new Map() } };
  const room = new RoomManager(io);
  clearInterval(room.tickTimer);
  clearInterval(room.snapshotTimer);
  try {
    const underleveled = createPlayerState("p1", { name: "Too Soon", level: 14, xp: XP_TABLE[13], zone: ZONES.FROSTVEIL });
    const blocked = room.changePlayerZone(underleveled, ZONES.FROSTBOUND_VAULT);
    assert.equal(blocked.ok, false);
    assert.equal(blocked.message, "Frostbound Vault requires Level 15.");
    assert.equal(underleveled.zone, ZONES.FROSTVEIL);

    const eligible = createPlayerState("p2", { name: "Vault Ready", level: 15, xp: XP_TABLE[14], zone: ZONES.FROSTVEIL });
    const entered = room.changePlayerZone(eligible, ZONES.FROSTBOUND_VAULT);
    assert.equal(entered.ok, true);
    assert.equal(eligible.zone, ZONES.FROSTBOUND_VAULT);
    assert.deepEqual(eligible.position, { x: 0, y: 0, z: 18, rot: Math.PI });
  } finally {
    clearInterval(room.tickTimer);
    clearInterval(room.snapshotTimer);
  }
});

test("client and server boot through the Frostforged v2.1 save migration", async () => {
  const root = path.resolve(import.meta.dirname, "../..");
  const mainSource = fs.readFileSync(path.join(root, "client/src/main.js"), "utf8");
  const runtimeSource = fs.readFileSync(path.join(root, "client/public/runtime/heroquest-runtime-1.js.txt"), "utf8");
  const { FROSTFORGED_MIGRATION_ID, FROSTFORGED_SAVE_SCHEMA_VERSION } = await import("../../shared/saveMigration.js");

  assert.match(mainSource, /FROSTFORGED_MIGRATION_ID/);
  assert.match(mainSource, /migrateFrostforgedSave/);
  assert.match(runtimeSource, /FROSTFORGED_MIGRATION_ID/);
  assert.match(runtimeSource, /migrateFrostforgedSave/);

  const player = createPlayerState("p1", {
    name: "Frost Runner",
    level: 20,
    xp: 5000,
    migrations: [],
    skillTreeNodes: { might_1: 2 },
    spentAttributes: { health: 1, strength: 1, magic: 1, defense: 1 }
  });

  assert.equal(player.saveSchemaVersion, FROSTFORGED_SAVE_SCHEMA_VERSION);
  assert.ok(player.migrations.includes(FROSTFORGED_MIGRATION_ID));
  assert.deepEqual(player.dungeonProgress.frostbound_vault, {
    clears: 0,
    firstClear: false,
    bestEncounterLevel: 0,
    personalChestClaims: []
  });
});

test("client HUD displays MAX instead of raw XP at the level cap", () => {
  const root = path.resolve(import.meta.dirname, "../..");
  const runtimeSource = fs.readFileSync(path.join(root, "client/public/runtime/heroquest-runtime-2.js.txt"), "utf8");

  assert.match(runtimeSource, /atLevelCap/);
  assert.match(runtimeSource, /ui\.xpText\.textContent\s*=\s*atLevelCap\s*\?\s*"MAX"/);
});

test("equipment and XP rewards update player stats", () => {
  const player = applyEquipment({
    ...STARTING_PLAYER,
    xp: 70,
    equippedWeapon: "stone_club",
    equippedArmor: "leather_vest"
  });

  assert.equal(player.level, 2);
  assert.equal(player.attack, 19);
  assert.equal(player.defense, 4);
  assert.equal(calculateIncomingDamage(100, { ...player, baseDefense: 100, defense: 100 }), 50);

  const rewarded = addProgressRewards(player, { xp: 120, coins: 25 });
  assert.equal(rewarded.level, 3);
  assert.equal(rewarded.coins, 75);
  assert.equal(rewarded.availableAttributePoints, 6);
  assert.equal(rewarded.availableSkillPoints, 2);
  assert.equal(rewarded.health, rewarded.maxHealth);
  assert.equal(rewarded.mana, rewarded.maxMana);
});

test("IceZero progression spends attributes and derives mana safely", () => {
  const player = applyEquipment({
    ...STARTING_PLAYER,
    level: 4,
    xp: 260,
    availableAttributePoints: 9,
    availableSkillPoints: 3
  });

  const magicSpend = spendAttributePoint(player, "magic", 2);
  assert.equal(magicSpend.ok, true);
  assert.equal(magicSpend.player.spentAttributes.magic, 2);
  assert.equal(magicSpend.player.availableAttributePoints, 7);
  assert.equal(magicSpend.player.maxMana, 60);
  assert.equal(magicSpend.player.mana, 60);
  assert.equal(magicSpend.player.spellPower, 4);
  assert.equal(magicSpend.player.healingPower, 4);

  const healthSpend = spendAttributePoint(player, "health", 1);
  assert.equal(healthSpend.ok, true);
  assert.equal(healthSpend.player.maxHealth, player.maxHealth + 12);
  assert.equal(healthSpend.player.health, player.health + 12);

  const invalidSpend = spendAttributePoint(magicSpend.player, "strength", 99);
  assert.equal(invalidSpend.ok, false);
  assert.equal(invalidSpend.reason, "points");

  const cast = spendMana(magicSpend.player, 25);
  assert.equal(cast.ok, true);
  assert.equal(cast.player.mana, 35);

  const regen = regenerateMana(cast.player, 2, false);
  assert.equal(regen.mana, 43);
  assert.equal(calculateDamageReduction(100), 0.5);
});

test("Rest Stone refunds spent progression without wiping learned abilities or progress", () => {
  const spent = spendAttributePoint(
    applyEquipment({
      ...STARTING_PLAYER,
      level: 5,
      xp: 420,
      availableAttributePoints: 12,
      availableSkillPoints: 4,
      inventory: [
        { itemId: "rest_stone", quantity: 1 },
        { itemId: "small_health_potion", quantity: 2 }
      ],
      learnedAbilities: ["hero_pulse"],
      skillTreeNodes: { might_training: 2 }
    }),
    "strength",
    3
  ).player;

  const result = useRestStone({ ...spent, availableSkillPoints: 2 });

  assert.equal(result.ok, true);
  assert.equal(result.player.level, 5);
  assert.equal(result.player.xp, 420);
  assert.deepEqual(result.player.spentAttributes, { health: 0, strength: 0, magic: 0, defense: 0 });
  assert.deepEqual(result.player.skillTreeNodes, {});
  assert.equal(result.player.availableAttributePoints, 12);
  assert.equal(result.player.availableSkillPoints, 4);
  assert.deepEqual(result.player.learnedAbilities, ["hero_pulse"]);
  assert.deepEqual(result.player.inventory, [{ itemId: "small_health_potion", quantity: 2 }]);
  assert.equal(result.player.health >= 1, true);
});

test("trainer purchases validate requirements, coins, and duplicates", () => {
  const fireballReady = applyEquipment({
    ...STARTING_PLAYER,
    level: 4,
    xp: 260,
    coins: 250,
    spentAttributes: { health: 0, strength: 0, magic: 5, defense: 0 },
    learnedAbilities: []
  });

  const bought = purchaseTrainerAbility(fireballReady, "fireball");
  assert.equal(bought.ok, true);
  assert.equal(bought.player.coins, 50);
  assert.ok(bought.player.learnedAbilities.includes("fireball"));

  const duplicate = purchaseTrainerAbility(bought.player, "fireball");
  assert.equal(duplicate.ok, false);
  assert.equal(duplicate.reason, "known");

  const underleveled = purchaseTrainerAbility({ ...fireballReady, level: 2, coins: 500 }, "fireball");
  assert.equal(underleveled.ok, false);
  assert.equal(underleveled.reason, "level");

  const missingMagic = purchaseTrainerAbility({ ...fireballReady, spentAttributes: { magic: 0 }, coins: 500 }, "fireball");
  assert.equal(missingMagic.ok, false);
  assert.equal(missingMagic.reason, "attribute");
});

test("ability targeting and hotbar assignment reject invalid friendly or hostile use", () => {
  assert.equal(validateAbilityTarget("fireball", "hostile").ok, true);
  assert.equal(validateAbilityTarget("fireball", "friendly").ok, false);
  assert.equal(validateAbilityTarget("mend_ally", "friendly").ok, true);
  assert.equal(validateAbilityTarget("mend_ally", "hostile").ok, false);
  assert.equal(validateAbilityTarget("healing_orb", "self").ok, true);

  const player = {
    ...STARTING_PLAYER,
    learnedAbilities: ["hero_pulse"],
    hotbar: ["auto", "slash", null, "guard", "potion", "dash", null, null]
  };
  const assigned = assignHotbarAbility(player, 3, "hero_pulse");
  assert.equal(assigned.ok, true);
  assert.equal(assigned.player.hotbar[2], "hero_pulse");

  const invalid = assignHotbarAbility(player, 3, "fireball");
  assert.equal(invalid.ok, false);
  assert.equal(invalid.reason, "not_learned");
});

test("learned active abilities can be assigned, replaced, and removed from active hotbar slots", () => {
  const player = {
    ...STARTING_PLAYER,
    learnedAbilities: ["hero_pulse", "fireball", "mend_ally"],
    hotbar: ["auto", "slash", "hero_pulse", "guard", "potion", "dash", null, null]
  };

  const fireball = assignHotbarAbility(player, 7, "fireball");
  assert.equal(fireball.ok, true);
  assert.equal(fireball.player.hotbar[6], "fireball");

  const replaced = assignHotbarAbility(fireball.player, 7, "mend_ally");
  assert.equal(replaced.ok, true);
  assert.equal(replaced.player.hotbar[6], "mend_ally");

  const cleared = assignHotbarAbility(replaced.player, 7, null);
  assert.equal(cleared.ok, true);
  assert.equal(cleared.player.hotbar[6], null);
});

test("skill trees enforce prerequisites, ranks, and skill point spending", () => {
  const player = applyEquipment({
    ...STARTING_PLAYER,
    level: 5,
    xp: 420,
    availableSkillPoints: 4,
    skillTreeNodes: {}
  });

  const blocked = purchaseSkillNode(player, "heavy_slash");
  assert.equal(blocked.ok, false);
  assert.equal(blocked.reason, "prerequisite");

  const rank1 = purchaseSkillNode(player, "might_training");
  assert.equal(rank1.ok, true);
  assert.equal(rank1.player.skillTreeNodes.might_training, 1);
  assert.equal(rank1.player.availableSkillPoints, 3);

  const rank2 = purchaseSkillNode(rank1.player, "might_training");
  const heavy = purchaseSkillNode(rank2.player, "heavy_slash");
  assert.equal(heavy.ok, true);
  assert.equal(heavy.player.skillTreeNodes.heavy_slash, 1);
  assert.equal(heavy.player.availableSkillPoints, 1);

  const noPoints = purchaseSkillNode({
    ...heavy.player,
    skillTreeNodes: { might_training: 2, heavy_slash: 1, iron_body: 1 }
  }, "mana_flow");
  assert.equal(noPoints.ok, false);
  assert.equal(noPoints.reason, "points");
});

test("loadouts save and activate owned abilities and equipment without duplicating items", () => {
  const player = applyEquipment({
    ...STARTING_PLAYER,
    level: 5,
    xp: 420,
    inventory: [
      { itemId: "stone_club", quantity: 1 },
      { itemId: "snowhide_helmet", quantity: 1 }
    ],
    equipment: createEquipmentState({
      weapon: "stone_club",
      chest: "traveler_tunic",
      head: "snowhide_helmet"
    }),
    equippedWeapon: "stone_club",
    equippedArmor: "traveler_tunic",
    learnedAbilities: ["hero_pulse"],
    hotbar: ["auto", "slash", "hero_pulse", "guard", "potion", "dash", null, null],
    skillTreeNodes: { might_training: 2 },
    savedBuilds: {}
  });

  const saved = saveLoadout(player, "A", "Pulse Might");
  assert.equal(saved.ok, true);
  assert.equal(saved.player.savedBuilds.A.label, "Pulse Might");
  assert.equal(saved.player.savedBuilds.A.equipment.head, "snowhide_helmet");

  const changed = {
    ...saved.player,
    equipment: createEquipmentState({
      weapon: "wooden_sword",
      chest: "traveler_tunic"
    }),
    equippedWeapon: "wooden_sword",
    hotbar: ["auto", "slash", null, "guard", "potion", "dash", null, null],
    skillTreeNodes: {}
  };
  const activated = activateLoadout(changed, "A");
  assert.equal(activated.ok, true);
  assert.equal(activated.player.equippedWeapon, "stone_club");
  assert.equal(activated.player.equipment.head, "snowhide_helmet");
  assert.equal(activated.player.hotbar[2], "hero_pulse");
  assert.equal(activated.player.skillTreeNodes.might_training, 2);
  assert.deepEqual(activated.player.inventory, [
    { itemId: "stone_club", quantity: 1 },
    { itemId: "snowhide_helmet", quantity: 1 }
  ]);

  const missingAbility = activateLoadout({ ...changed, learnedAbilities: [] }, "A");
  assert.equal(missingAbility.ok, false);
  assert.equal(missingAbility.reason, "ability");
});

test("IceZero inventory stacks items to limits and refuses overflow without deleting loot", () => {
  const potions = addInventoryStack([], "small_health_potion", 23);
  assert.equal(potions.ok, true);
  assert.deepEqual(potions.inventory, [
    { itemId: "small_health_potion", quantity: 20 },
    { itemId: "small_health_potion", quantity: 3 }
  ]);

  const fullInventory = Array.from({ length: INVENTORY_SLOT_COUNT }, (_, index) => ({
    itemId: index === 0 ? "small_health_potion" : `full_slot_${index}`,
    quantity: 1
  }));
  const stacked = addInventoryStack(fullInventory, "small_health_potion", 19);
  assert.equal(stacked.ok, true);
  assert.equal(stacked.inventory[0].quantity, 20);

  const overflow = addInventoryStack(stacked.inventory, "rusty_blade", 1);
  assert.equal(overflow.ok, false);
  assert.equal(overflow.reason, "full");
  assert.deepEqual(overflow.inventory, stacked.inventory);
  assert.deepEqual(overflow.overflow, [{ itemId: "rusty_blade", quantity: 1 }]);
});

test("equipment slots validate ownership, level requirements, and item categories", () => {
  assert.deepEqual(EQUIPMENT_SLOTS, ["head", "chest", "hands", "legs", "boots", "weapon", "offhand", "accessory"]);

  const player = applyEquipment({
    ...STARTING_PLAYER,
    xp: 260,
    inventory: [
      { itemId: "apprentice_staff", quantity: 1 },
      { itemId: "frostspire_staff", quantity: 1 },
      { itemId: "snowhide_helmet", quantity: 1 }
    ],
    equipment: createEquipmentState()
  });

  const staff = equipItemToSlot(player, "weapon", "apprentice_staff");
  assert.equal(staff.ok, true);
  assert.equal(staff.player.equipment.weapon, "apprentice_staff");
  assert.equal(staff.player.equippedWeapon, "apprentice_staff");
  assert.equal(staff.player.magicPower >= 3, true);

  const highLevel = equipItemToSlot(player, "weapon", "frostspire_staff");
  assert.equal(highLevel.ok, false);
  assert.equal(highLevel.reason, "level");

  const wrongSlot = equipItemToSlot(player, "weapon", "snowhide_helmet");
  assert.equal(wrongSlot.ok, false);
  assert.equal(wrongSlot.reason, "slot");
});

test("server loot and chest rewards do not delete rewards when inventory is full", () => {
  const io = { to: () => ({ emit: () => {} }) };
  const room = new RoomManager(io);
  clearInterval(room.tickTimer);
  clearInterval(room.snapshotTimer);
  try {
    const fullInventory = Array.from({ length: INVENTORY_SLOT_COUNT }, (_, index) => ({
      itemId: `full_slot_${index}`,
      quantity: 1
    }));
    const player = createPlayerState("p1", {
      zone: ZONES.HUB,
      position: { x: -12, y: 0, z: 12 },
      coins: 5,
      inventory: fullInventory
    });
    room.players.set(player.id, player);

    const chestBlocked = room.claimChest(player, "hub_weapon_cache");
    assert.equal(chestBlocked.ok, false);
    assert.equal(chestBlocked.reason, "inventory_full");
    assert.equal(room.chests.get("hub_weapon_cache").openedBy.has(player.id), false);
    assert.equal(player.coins, 5);

    const lootBag = {
      id: "loot_full",
      zone: ZONES.HUB,
      position: { x: -12, y: 0.25, z: 12 },
      ownerId: null,
      coins: 12,
      xp: 0,
      items: [{ itemId: "rusty_blade", quantity: 1 }],
      createdAt: Date.now()
    };
    room.loot.lootBags.set(lootBag.id, lootBag);
    const lootBlocked = room.claimLoot(player, lootBag.id);
    assert.equal(lootBlocked.ok, false);
    assert.equal(lootBlocked.reason, "inventory_full");
    assert.equal(room.loot.lootBags.has(lootBag.id), true);
    assert.equal(player.coins, 5);

    player.inventory = [];
    const lootClaimed = room.claimLoot(player, lootBag.id);
    assert.equal(lootClaimed.ok, true);
    assert.equal(room.loot.lootBags.has(lootBag.id), false);
    assert.equal(player.coins, 17);
    assert.deepEqual(player.inventory, [{ itemId: "rusty_blade", quantity: 1 }]);
  } finally {
    clearInterval(room.tickTimer);
    clearInterval(room.snapshotTimer);
  }
});

test("server equipment changes validate slots and update authoritative player state", () => {
  const io = { to: () => ({ emit: () => {} }) };
  const room = new RoomManager(io);
  clearInterval(room.tickTimer);
  clearInterval(room.snapshotTimer);
  try {
    const player = createPlayerState("p1", {
      xp: 260,
      inventory: [
        { itemId: "apprentice_staff", quantity: 1 },
        { itemId: "snowhide_helmet", quantity: 1 }
      ],
      equipment: createEquipmentState()
    });

    const equipped = room.equipItem(player, "weapon", "apprentice_staff");
    assert.equal(equipped.ok, true);
    assert.equal(player.equipment.weapon, "apprentice_staff");
    assert.equal(player.equippedWeapon, "apprentice_staff");
    assert.equal(player.magicPower >= 3, true);

    const wrongSlot = room.equipItem(player, "weapon", "snowhide_helmet");
    assert.equal(wrongSlot.ok, false);
    assert.equal(wrongSlot.reason, "slot");
    assert.equal(player.equipment.weapon, "apprentice_staff");
  } finally {
    clearInterval(room.tickTimer);
    clearInterval(room.snapshotTimer);
  }
});

test("Frostveil Reach is registered as a level 5 gated zone with a discoverable waypoint", () => {
  assert.equal(ZONES.FROSTVEIL, "frostveil");

  const level4 = applyEquipment({ ...STARTING_PLAYER, xp: 260 });
  const blocked = canEnterZone(level4, ZONES.FROSTVEIL);
  assert.equal(blocked.ok, false);
  assert.equal(blocked.reason, "level");
  assert.equal(blocked.minLevel, 5);
  assert.match(blocked.message, /Reach Level 5/);

  const level5 = applyEquipment({ ...STARTING_PLAYER, xp: 420, waypoints: ["dawnrest"] });
  const allowed = canEnterZone(level5, ZONES.FROSTVEIL);
  assert.equal(allowed.ok, true);

  const unlocked = unlockWaypoint(level5, "frostveil_camp");
  assert.equal(unlocked.ok, true);
  assert.deepEqual(unlocked.player.waypoints, ["dawnrest", "frostveil_camp"]);
  assert.deepEqual(unlockWaypoint(unlocked.player, "frostveil_camp").player.waypoints, ["dawnrest", "frostveil_camp"]);
});

test("Frostveil enemies, elite modifiers, and spawn table are data driven", () => {
  const frostIds = FROSTVEIL_SPAWNS.map((spawn) => spawn.enemyId);
  assert.deepEqual(frostIds, ["frost_slime", "ice_goblin", "snow_wolf", "frost_wisp", "ice_golem", "frozen_knight"]);

  for (const enemyId of frostIds) {
    const enemy = ENEMIES[enemyId];
    assert.equal(enemy.zone, ZONES.FROSTVEIL);
    assert.equal(enemy.level >= 5, true);
    assert.equal(enemy.loot.some((drop) => drop.itemId === "ice_shard" || drop.itemId === "small_health_potion"), true);
  }

  assert.equal(ENEMIES.ice_golem.elite, true);
  assert.equal(ENEMIES.frozen_knight.family, "knight");
  assert.deepEqual(Object.keys(ELITE_MODIFIERS), ["armored", "swift", "chilling", "regenerating"]);
});

test("Ice quest chain supports zone events, multi-target kills, and elite kill progress", () => {
  let progress = createQuestProgress();
  const entered = applyQuestEvent(progress, "enter_frostveil");
  assert.equal(entered.progress.frozen_road.complete, true);
  assert.equal(entered.completed[0].id, "frozen_road");
  progress = entered.progress;

  for (let i = 0; i < 5; i += 1) {
    progress = applyQuestKill(progress, ENEMIES.frost_slime).progress;
  }
  assert.equal(progress.cold_blooded.complete, false);
  assert.equal(progress.cold_blooded.targets.frost_slime.current, 5);

  for (let i = 0; i < 3; i += 1) {
    progress = applyQuestKill(progress, ENEMIES.ice_goblin).progress;
  }
  assert.equal(progress.cold_blooded.complete, true);
  assert.equal(progress.cold_blooded.current, 8);

  for (let i = 0; i < 3; i += 1) {
    progress = applyQuestKill(progress, ENEMIES.snow_wolf).progress;
  }
  assert.equal(progress.howling_white.complete, true);

  progress = applyQuestKill(progress, ENEMIES.ice_golem).progress;
  assert.equal(progress.heart_of_the_blizzard.complete, true);
});

test("server rejects underleveled Frostveil travel and unlocks the camp waypoint on entry", () => {
  const io = { to: () => ({ emit: () => {} }) };
  const room = new RoomManager(io);
  clearInterval(room.tickTimer);
  clearInterval(room.snapshotTimer);
  try {
    const underleveled = createPlayerState("p1", { xp: 260, zone: ZONES.FIELD, waypoints: ["dawnrest"] });
    const blocked = room.changePlayerZone(underleveled, ZONES.FROSTVEIL, { x: 0, y: 0, z: 0 });
    assert.equal(blocked.ok, false);
    assert.equal(blocked.reason, "level");
    assert.equal(underleveled.zone, ZONES.FIELD);

    const ready = createPlayerState("p2", { xp: 420, zone: ZONES.FIELD, waypoints: ["dawnrest"] });
    const allowed = room.changePlayerZone(ready, ZONES.FROSTVEIL, { x: 0, y: 0, z: 24 });
    assert.equal(allowed.ok, true);
    assert.equal(ready.zone, ZONES.FROSTVEIL);
    assert.ok(ready.waypoints.includes("frostveil_camp"));
  } finally {
    clearInterval(room.tickTimer);
    clearInterval(room.snapshotTimer);
  }
});

test("Frost Ward public event waits for explicit activation before spawning enemies", () => {
  const enemies = new EnemySystem({ rng: () => 0 });
  const eventSystem = new PublicEventSystem({ enemySystem: enemies, rng: () => 0 });
  const player = createPlayerState("p1", {
    xp: 420,
    zone: ZONES.FROSTVEIL,
    position: { x: 8, y: 0, z: -8 }
  });
  const players = new Map([[player.id, player]]);

  const idleEvents = eventSystem.update(players, 1000);
  assert.deepEqual(idleEvents, []);
  assert.equal(eventSystem.snapshot(ZONES.FROSTVEIL).active, false);
  assert.equal(enemies.getZoneEnemies(ZONES.FROSTVEIL).some((enemy) => enemy.eventId === "defend_frost_ward"), false);

  const activation = eventSystem.activate(player, players, 1000);
  assert.equal(activation.ok, true);
  assert.ok(activation.events.some((event) => event.type === "public_event_starting" && event.eventId === "defend_frost_ward"));
  assert.equal(enemies.getZoneEnemies(ZONES.FROSTVEIL).some((enemy) => enemy.eventId === "defend_frost_ward"), false);

  const events = eventSystem.update(players, 6000);
  assert.ok(events.some((event) => event.type === "public_event_started" && event.eventId === "defend_frost_ward"));
  assert.equal(eventSystem.snapshot(ZONES.FROSTVEIL).active, true);
  assert.ok(enemies.getZoneEnemies(ZONES.FROSTVEIL).some((enemy) => enemy.eventId === "defend_frost_ward"));
});

test("Frost Ward public event advances three tracked waves and completes without restarting immediately", () => {
  const enemies = new EnemySystem({ rng: () => 0 });
  const eventSystem = new PublicEventSystem({ enemySystem: enemies, rng: () => 0 });
  const player = createPlayerState("p1", {
    xp: 420,
    zone: ZONES.FROSTVEIL,
    position: { x: 8, y: 0, z: -8 }
  });
  const players = new Map([[player.id, player]]);
  const eventEnemies = () => enemies.getZoneEnemies(ZONES.FROSTVEIL).filter((enemy) => enemy.eventId === "defend_frost_ward");
  const defeatCurrentWave = () => {
    for (const enemy of eventEnemies()) {
      enemy.health = 0;
      enemy.respawnAt = Number.MAX_SAFE_INTEGER;
    }
  };

  const activation = eventSystem.activate(player, players, 1000);
  assert.equal(activation.ok, true);
  eventSystem.update(players, 6000);
  assert.equal(eventSystem.snapshot(ZONES.FROSTVEIL).wave, 1);
  assert.equal(eventSystem.snapshot(ZONES.FROSTVEIL).remaining, eventEnemies().length);
  assert.ok(eventEnemies().every((enemy) => ["frost_slime", "ice_goblin"].includes(enemy.enemyId)));

  defeatCurrentWave();
  const waveTwo = eventSystem.update(players, 7000);
  assert.ok(waveTwo.some((event) => event.type === "public_event_wave" && event.wave === 2));
  assert.equal(eventSystem.snapshot(ZONES.FROSTVEIL).wave, 2);
  assert.ok(eventEnemies().every((enemy) => ["snow_wolf", "frost_wisp"].includes(enemy.enemyId)));

  defeatCurrentWave();
  const waveThree = eventSystem.update(players, 8000);
  assert.ok(waveThree.some((event) => event.type === "public_event_wave" && event.wave === 3));
  assert.equal(eventSystem.snapshot(ZONES.FROSTVEIL).wave, 3);
  assert.ok(eventEnemies().some((enemy) => enemy.enemyId === "ice_golem"));

  defeatCurrentWave();
  const completed = eventSystem.update(players, 9000);
  assert.ok(completed.some((event) => event.type === "public_event_completed" && event.eventId === "defend_frost_ward"));
  assert.equal(eventSystem.snapshot(ZONES.FROSTVEIL).active, false);

  const cooldownAttempt = eventSystem.activate(player, players, 9000);
  assert.equal(cooldownAttempt.ok, false);
  assert.equal(cooldownAttempt.reason, "cooldown");
});

test("server validates Frost Ward activation intent before starting countdown", () => {
  const emitted = [];
  const io = { to: (zone) => ({ emit: (type, payload) => emitted.push({ zone, type, payload }) }) };
  const room = new RoomManager(io);
  clearInterval(room.tickTimer);
  clearInterval(room.snapshotTimer);
  try {
    const player = createPlayerState("p1", {
      xp: 420,
      zone: ZONES.FROSTVEIL,
      position: { x: 8, y: 0, z: -8 }
    });
    room.players.set(player.id, player);

    const idleEvents = room.publicEvents.update(room.players, 1000);
    assert.deepEqual(idleEvents, []);

    const result = room.activatePublicEvent(player, "defend_frost_ward", 1000);
    assert.equal(result.ok, true);
    assert.ok(emitted.some((event) => event.type === NET.WORLD_EVENT && event.payload.type === "public_event_starting"));
    assert.equal(room.enemies.getZoneEnemies(ZONES.FROSTVEIL).some((enemy) => enemy.eventId === "defend_frost_ward"), false);

    room.handlePublicEvents(room.publicEvents.update(room.players, 6000));
    assert.ok(emitted.some((event) => event.type === NET.WORLD_EVENT && event.payload.type === "public_event_started"));
    assert.ok(room.enemies.getZoneEnemies(ZONES.FROSTVEIL).some((enemy) => enemy.eventId === "defend_frost_ward"));
  } finally {
    clearInterval(room.tickTimer);
    clearInterval(room.snapshotTimer);
  }
});

test("Frost Ward activation uses stable ward IDs for event payloads and spawns", () => {
  const enemies = new EnemySystem({ rng: () => 0 });
  const eventSystem = new PublicEventSystem({ enemySystem: enemies, rng: () => 0 });
  const player = createPlayerState("p1", {
    xp: 420,
    zone: ZONES.FROSTVEIL,
    position: { x: -18, y: 0, z: -22 }
  });
  const players = new Map([[player.id, player]]);

  const activation = eventSystem.activate(player, players, 1000, "north_ward");
  assert.equal(activation.ok, true);
  assert.equal(activation.events[0].wardId, "north_ward");

  const events = eventSystem.update(players, 6000);
  assert.ok(events.some((event) => event.type === "public_event_started" && event.wardId === "north_ward"));
  assert.ok(events.some((event) => event.type === "public_event_wave" && event.wardId === "north_ward"));
  assert.ok(enemies.getZoneEnemies(ZONES.FROSTVEIL).some((enemy) => (
    enemy.eventId === "defend_frost_ward" && enemy.wardId === "north_ward"
  )));
});

test("Frost Ward event enemies have wave spawn IDs", () => {
  const enemies = new EnemySystem({ rng: () => 0 });
  const eventSystem = new PublicEventSystem({ enemySystem: enemies, rng: () => 0 });
  const player = createPlayerState("p1", {
    xp: 420,
    zone: ZONES.FROSTVEIL,
    position: { x: 8, y: 0, z: -8 }
  });
  const players = new Map([[player.id, player]]);

  const activation = eventSystem.activate(player, players, 1000, "frost_ward");
  assert.equal(activation.ok, true);
  eventSystem.update(players, 6000);

  const waveOneEnemies = enemies.getZoneEnemies(ZONES.FROSTVEIL).filter((enemy) => enemy.eventId === "defend_frost_ward");
  assert.ok(waveOneEnemies.length > 0);
  assert.ok(waveOneEnemies.every((enemy) => enemy.eventWave === 1));
  assert.ok(waveOneEnemies.every((enemy) => enemy.eventSpawnId?.startsWith(`${enemy.eventInstanceId}:wave1:spawn`)));
  const waveOneSnapshot = enemies.snapshot(ZONES.FROSTVEIL).filter((enemy) => enemy.eventId === "defend_frost_ward");
  assert.ok(waveOneSnapshot.every((enemy) => enemy.eventWave === 1));
  assert.ok(waveOneSnapshot.every((enemy) => enemy.eventSpawnId?.startsWith(`${enemy.eventInstanceId}:wave1:spawn`)));
});

test("Frost Ward out-of-bounds event enemies do not block waves", () => {
  const enemies = new EnemySystem({ rng: () => 0 });
  const eventSystem = new PublicEventSystem({ enemySystem: enemies, rng: () => 0 });
  const player = createPlayerState("p1", {
    xp: 420,
    zone: ZONES.FROSTVEIL,
    position: { x: 8, y: 0, z: -8 }
  });
  const players = new Map([[player.id, player]]);

  const activation = eventSystem.activate(player, players, 1000, "frost_ward");
  assert.equal(activation.ok, true);
  eventSystem.update(players, 6000);

  const waveOneEnemies = enemies.getZoneEnemies(ZONES.FROSTVEIL).filter((enemy) => enemy.eventId === "defend_frost_ward");
  assert.ok(waveOneEnemies.length > 0);

  const staleEnemy = waveOneEnemies[0];
  staleEnemy.position = { x: 999, y: 0, z: 999 };
  for (const enemy of waveOneEnemies.slice(1)) {
    enemy.health = 0;
    enemy.respawnAt = Number.MAX_SAFE_INTEGER;
  }

  const waveTwo = eventSystem.update(players, 7000);
  assert.ok(waveTwo.some((event) => event.type === "public_event_wave" && event.wave === 2));
  assert.equal(enemies.enemies.has(staleEnemy.id), false);
  assert.equal(eventSystem.snapshot(ZONES.FROSTVEIL).wave, 2);
});

test("client Frost Ward activation asks for confirmation before starting defense", () => {
  const root = path.resolve(import.meta.dirname, "../..");
  const runtimeSource = fs.readFileSync(path.join(root, "client/public/runtime/heroquest-runtime-3.js.txt"), "utf8");

  assert.match(runtimeSource, /Begin the defense\?/);
  assert.match(runtimeSource, /confirmFrostWardActivation/);
  assert.match(runtimeSource, /confirmFrostWardActivation\(nearestWard\)/);
});

test("Frost Ward completion credits participants once per stable ward and awards Shattered Ward once", () => {
  const emitted = [];
  const io = { to: (zone) => ({ emit: (type, payload) => emitted.push({ zone, type, payload }) }) };
  const room = new RoomManager(io);
  clearInterval(room.tickTimer);
  clearInterval(room.snapshotTimer);
  try {
    const participant = createPlayerState("p1", {
      name: "Wardkeeper",
      xp: 420,
      coins: 0,
      zone: ZONES.FROSTVEIL,
      position: { x: 8, y: 0, z: -8 },
      inventory: []
    });
    const bystander = createPlayerState("p2", {
      name: "Bystander",
      xp: 420,
      coins: 0,
      zone: ZONES.FROSTVEIL,
      inventory: []
    });
    room.players.set(participant.id, participant);
    room.players.set(bystander.id, bystander);

    const completeWard = (wardId, eventInstanceId = `${wardId}:run`) => {
      room.handlePublicEvents([
        {
          type: "public_event_completed",
          eventId: "defend_frost_ward",
          wardId,
          eventInstanceId,
          zone: ZONES.FROSTVEIL,
          participants: [participant.id]
        }
      ]);
    };

    completeWard("frost_ward", "frost_ward:first");
    completeWard("frost_ward", "frost_ward:repeat");
    assert.equal(participant.questProgress.shattered_ward.current, 1);
    assert.deepEqual(participant.publicEventClaims, ["defend_frost_ward:frost_ward"]);
    assert.equal(bystander.questProgress.shattered_ward.current, 0);

    completeWard("north_ward");
    const coinsBeforeFinalCredit = participant.coins;
    const iceShardsBeforeFinalCredit = inventoryQuantity(participant.inventory, "ice_shard");

    completeWard("east_ward");
    assert.equal(participant.questProgress.shattered_ward.current, 3);
    assert.equal(participant.questProgress.shattered_ward.complete, true);
    assert.equal(participant.coins, coinsBeforeFinalCredit + 140);
    assert.equal(inventoryQuantity(participant.inventory, "ice_shard"), iceShardsBeforeFinalCredit + 1);

    const coinsAfterCompletion = participant.coins;
    const iceShardsAfterCompletion = inventoryQuantity(participant.inventory, "ice_shard");
    completeWard("east_ward", "east_ward:repeat");
    assert.equal(participant.coins, coinsAfterCompletion);
    assert.equal(inventoryQuantity(participant.inventory, "ice_shard"), iceShardsAfterCompletion);
    assert.ok(emitted.some((event) => event.type === NET.WORLD_EVENT && event.payload.type === "public_event_completed"));
  } finally {
    clearInterval(room.tickTimer);
    clearInterval(room.snapshotTimer);
  }
});

test("enemy defeat produces rewards and marks quest progress", () => {
  const loot = new LootSystem(() => 0.01);
  const enemies = new EnemySystem({ lootSystem: loot, rng: () => 0.01 });
  const [slime] = enemies.getZoneEnemies("field").filter((enemy) => enemy.enemyId === "green_slime");

  const result = enemies.damageEnemy({
    zone: "field",
    enemyInstanceId: slime.id,
    damage: 999,
    attackerId: "p1"
  });

  assert.equal(result.defeated, true);
  assert.equal(result.reward.xp, 8);
  assert.ok(result.reward.coins >= 3);
  assert.ok(result.lootBag.items.some((item) => item.itemId === "slime_gel"));

  const progress = applyQuestKill(createQuestProgress(), result.enemyDef);
  assert.equal(progress.progress.slime_trouble.current, 1);
});

test("slash attack uses the authoritative 150 percent damage scale", () => {
  const enemySystem = {
    enemies: new Map([
      [
        "goblin-1",
        {
          id: "goblin-1",
          zone: "field",
          position: { x: 1, y: 0, z: 0 }
        }
      ]
    ]),
    damageEnemy(payload) {
      return { defeated: false, payload };
    }
  };
  const bossSystem = { damage: () => ({ defeated: false }) };
  const combat = new CombatSystem({ enemySystem, bossSystem, rng: () => 0.5 });
  const player = {
    ...STARTING_PLAYER,
    id: "p1",
    zone: "field",
    position: { x: 0, y: 0, z: 0 },
    lastAttackAt: 0
  };

  const result = combat.attack(player, "goblin-1", { kind: "slash" });

  assert.equal(result.ok, true);
  assert.equal(result.kind, "slash");
  assert.equal(result.damage, 17);
  assert.equal(result.result.payload.damage, 17);
});

test("enemy attacks deal damage at every player health threshold", () => {
  const realNow = Date.now;
  let now = 20000;
  Date.now = () => now;
  try {
    for (const health of [100, 75, 50, 25, 9, 1]) {
      const enemies = new EnemySystem({ rng: () => 0.5 });
      enemies.enemies.clear();
      const slime = enemies.spawnEnemy("green_slime", { x: 0, y: 0, z: 0 }, ZONES.FIELD);
      slime.lastAttackAt = 0;
      const player = {
        id: `threshold-${health}`,
        zone: ZONES.FIELD,
        health,
        maxHealth: 100,
        defense: 0,
        state: "alive",
        position: { x: 0.5, y: 0, z: 0.5 }
      };

      enemies.update(new Map([[player.id, player]]), 100);

      assert.ok(player.health < health, `expected damage at ${health} HP`);
      assert.ok(player.health >= 0, `expected non-negative health at ${health} HP`);
      now += ENEMIES.green_slime.attackCooldownMs + 1;
    }
  } finally {
    Date.now = realNow;
  }
});

test("party codes support create, join, and leave", () => {
  const parties = new PartySystem(() => "abcd");
  const created = parties.createParty("leader");
  assert.equal(created.code, "ABCD");

  const joined = parties.joinParty("friend", "ABCD");
  assert.equal(joined.members.length, 2);
  assert.equal(parties.getPartyForPlayer("friend").code, "ABCD");

  parties.leaveParty("leader");
  assert.equal(parties.getPartyForPlayer("leader"), null);
  assert.equal(parties.getPartyForPlayer("friend").leaderId, "friend");
});

test("saved defeated players recover at Dawnrest instead of loading at zero HP", () => {
  const player = createPlayerState("p1", {
    name: "Defeated Hero",
    health: 0,
    xp: 70,
    zone: ZONES.BOSS,
    position: { x: 12, y: 0, z: -4, rot: 1 }
  });

  assert.equal(player.state, "alive");
  assert.equal(player.zone, ZONES.HUB);
  assert.equal(player.health, player.maxHealth);
  assert.deepEqual(player.position, { x: 0, y: 0, z: 6, rot: 0 });
});

test("server player state migrates IceZero saves and validates stat allocation", () => {
  const player = createPlayerState("p1", {
    name: "Server Migrant",
    level: 5,
    xp: 420,
    coins: 10,
    health: 0,
    learnedAbilities: ["hero_pulse"],
    hotbar: ["auto", "slash", "hero_pulse", "guard", "potion", "dash", null, null]
  });

  assert.equal(player.coins, 110);
  assert.equal(player.availableAttributePoints, 12);
  assert.equal(player.availableSkillPoints, 4);
  assert.deepEqual(player.learnedAbilities, []);
  assert.equal(player.hotbar.includes("hero_pulse"), false);

  const io = { to: () => ({ emit: () => {} }) };
  const room = new RoomManager(io);
  clearInterval(room.tickTimer);
  clearInterval(room.snapshotTimer);
  try {
    room.players.set(player.id, player);
    const spent = room.allocateAttribute(player, "health", 2);
    assert.equal(spent.ok, true);
    assert.equal(player.spentAttributes.health, 2);
    assert.equal(player.availableAttributePoints, 10);
    assert.equal(player.maxHealth, STARTING_PLAYER.maxHealth + (player.level - 1) * 14 + 24);

    const invalid = room.allocateAttribute(player, "bogus", 1);
    assert.equal(invalid.ok, false);
    assert.equal(invalid.reason, "attribute");
  } finally {
    clearInterval(room.tickTimer);
    clearInterval(room.snapshotTimer);
  }
});

test("dead players cannot attack, cast abilities, or spend cooldowns", () => {
  const enemySystem = {
    enemies: new Map([
      ["slime-1", { id: "slime-1", zone: ZONES.FIELD, position: { x: 1, y: 0, z: 0 } }]
    ]),
    getZoneEnemies: () => [],
    damageEnemy() {
      throw new Error("dead players should not damage enemies");
    }
  };
  const combat = new CombatSystem({ enemySystem, bossSystem: { damage: () => ({ defeated: false }) } });
  const player = {
    ...STARTING_PLAYER,
    id: "p1",
    zone: ZONES.FIELD,
    position: { x: 0, y: 0, z: 0 },
    health: 0,
    state: "dead",
    lastAttackAt: 0,
    lastAbilityAt: 0
  };

  assert.deepEqual(combat.attack(player, "slime-1"), { ok: false, reason: "dead" });
  assert.deepEqual(combat.ability(player), { ok: false, reason: "dead" });
  assert.equal(player.lastAttackAt, 0);
  assert.equal(player.lastAbilityAt, 0);
});

test("server potion use heals, decrements inventory, and starts cooldown", () => {
  const realNow = Date.now;
  let now = 1000;
  Date.now = () => now;
  const io = { to: () => ({ emit: () => {} }) };
  const room = new RoomManager(io);
  clearInterval(room.tickTimer);
  clearInterval(room.snapshotTimer);
  try {
    const player = createPlayerState("potion-user", {
      health: 65,
      maxHealth: 100,
      inventory: [{ itemId: "small_health_potion", quantity: 2 }]
    });

    const used = room.usePotion(player);

    assert.equal(used.ok, true);
    assert.equal(used.heal.amount, 30);
    assert.equal(player.health, 95);
    assert.equal(inventoryQuantity(player.inventory, "small_health_potion"), 1);
    assert.equal(player.lastPotionAt, now);

    now += ABILITIES.potion.cooldownMs - 1;
    const cooldown = room.usePotion(player);

    assert.equal(cooldown.ok, false);
    assert.equal(cooldown.reason, "cooldown");
    assert.equal(player.health, 95);
    assert.equal(inventoryQuantity(player.inventory, "small_health_potion"), 1);
  } finally {
    Date.now = realNow;
    clearInterval(room.tickTimer);
    clearInterval(room.snapshotTimer);
  }
});

test("server potion use rejects full health, missing potions, and dead players without consuming", () => {
  const io = { to: () => ({ emit: () => {} }) };
  const room = new RoomManager(io);
  clearInterval(room.tickTimer);
  clearInterval(room.snapshotTimer);
  try {
    const full = createPlayerState("full-potion-user", {
      health: 100,
      maxHealth: 100,
      inventory: [{ itemId: "small_health_potion", quantity: 1 }]
    });
    const fullResult = room.usePotion(full);
    assert.equal(fullResult.ok, false);
    assert.equal(fullResult.reason, "full");
    assert.equal(inventoryQuantity(full.inventory, "small_health_potion"), 1);

    const missing = createPlayerState("missing-potion-user", {
      health: 50,
      maxHealth: 100,
      inventory: []
    });
    const missingResult = room.usePotion(missing);
    assert.equal(missingResult.ok, false);
    assert.equal(missingResult.reason, "missing");

    const dead = createPlayerState("dead-potion-user", {
      inventory: [{ itemId: "small_health_potion", quantity: 1 }]
    });
    dead.health = 0;
    dead.state = "dead";
    const deadResult = room.usePotion(dead);
    assert.equal(deadResult.ok, false);
    assert.equal(deadResult.reason, "dead");
    assert.equal(inventoryQuantity(dead.inventory, "small_health_potion"), 1);
  } finally {
    clearInterval(room.tickTimer);
    clearInterval(room.snapshotTimer);
  }
});

test("server respawn request restores HP and mana at Dawnrest with protection", () => {
  const realNow = Date.now;
  let now = 5000;
  Date.now = () => now;
  const io = { to: () => ({ emit: () => {} }) };
  const room = new RoomManager(io);
  clearInterval(room.tickTimer);
  clearInterval(room.snapshotTimer);
  try {
    const player = createPlayerState("respawn-user", {
      zone: ZONES.BOSS,
      position: { x: 12, y: 0, z: -3, rot: 1 },
      spentAttributes: { health: 0, strength: 0, magic: 4, defense: 0 }
    });
    player.state = "dead";
    player.health = 0;
    player.mana = 0;
    player.respawnAt = now;

    const respawned = room.requestRespawn(player);

    assert.equal(respawned.ok, true);
    assert.equal(player.state, "alive");
    assert.equal(player.zone, ZONES.HUB);
    assert.equal(player.health, player.maxHealth);
    assert.equal(player.mana, player.maxMana);
    assert.deepEqual(player.position, { x: 0, y: 0, z: 6, rot: 0 });
    assert.ok(player.respawnProtectionUntil >= now + 3000);
  } finally {
    Date.now = realNow;
    clearInterval(room.tickTimer);
    clearInterval(room.snapshotTimer);
  }
});

test("server respawn request rejects early and duplicate respawns", () => {
  const realNow = Date.now;
  let now = 10000;
  Date.now = () => now;
  const io = { to: () => ({ emit: () => {} }) };
  const room = new RoomManager(io);
  clearInterval(room.tickTimer);
  clearInterval(room.snapshotTimer);
  try {
    const player = createPlayerState("early-respawn-user", { zone: ZONES.BOSS });
    player.state = "dead";
    player.health = 0;
    player.respawnAt = now + 1000;

    const early = room.requestRespawn(player);
    assert.equal(early.ok, false);
    assert.equal(early.reason, "not_ready");
    assert.equal(player.state, "dead");

    now = player.respawnAt;
    const first = room.requestRespawn(player);
    assert.equal(first.ok, true);

    const duplicate = room.requestRespawn(player);
    assert.equal(duplicate.ok, false);
    assert.equal(duplicate.reason, "not_dead");
  } finally {
    Date.now = realNow;
    clearInterval(room.tickTimer);
    clearInterval(room.snapshotTimer);
  }
});

test("server validates Hero Pulse ownership and mana before casting", () => {
  const enemySystem = {
    getZoneEnemies: () => []
  };
  const combat = new CombatSystem({ enemySystem, bossSystem: { damage: () => ({ defeated: false }) } });
  const player = applyEquipment({
    ...STARTING_PLAYER,
    id: "p1",
    zone: ZONES.FIELD,
    position: { x: 0, y: 0, z: 0 },
    health: 100,
    learnedAbilities: [],
    lastAbilityAt: 0
  });

  assert.deepEqual(combat.ability(player), { ok: false, reason: "not_learned" });

  player.learnedAbilities = ["hero_pulse"];
  player.mana = 5;
  assert.deepEqual(combat.ability(player), { ok: false, reason: "mana" });

  player.mana = 50;
  const result = combat.ability(player);
  assert.equal(result.ok, true);
  assert.equal(player.mana, 25);
});

test("Fireball resolves as a server-authoritative projectile against one hostile target", () => {
  const target = {
    id: "enemy_fireball",
    enemyId: "goblin_scout",
    zone: ZONES.FIELD,
    position: { x: 8, y: 0, z: 1 },
    health: 45,
    maxHealth: 45
  };
  const damageEvents = [];
  const enemySystem = {
    enemies: new Map([[target.id, target]]),
    getZoneEnemies: () => [target],
    damageEnemy(payload) {
      damageEvents.push(payload);
      target.health = Math.max(0, target.health - payload.damage);
      return { hit: true, defeated: target.health <= 0, enemy: target };
    }
  };
  const combat = new CombatSystem({ enemySystem, bossSystem: { damage: () => ({ defeated: false }) }, rng: () => 0.5 });
  const player = applyEquipment({
    ...STARTING_PLAYER,
    id: "caster",
    zone: ZONES.FIELD,
    position: { x: 0, y: 0, z: 0 },
    health: 100,
    level: 4,
    mana: 70,
    learnedAbilities: ["fireball"],
    spentAttributes: { health: 0, strength: 0, magic: 5, defense: 0 },
    lastAbilityAt: 0
  });
  const beforeMana = player.mana;

  const result = combat.ability(player, { abilityId: "fireball", targetId: target.id });

  assert.equal(result.ok, true);
  assert.equal(result.abilityId, "fireball");
  assert.equal(damageEvents.length, 1);
  assert.equal(damageEvents[0].enemyInstanceId, target.id);
  assert.ok(damageEvents[0].damage > 0);
  assert.equal(player.mana, beforeMana - ABILITIES.fireball.manaCost);
  assert.ok(target.health < target.maxHealth);
  assert.deepEqual(result.projectile, {
    type: "fireball",
    targetId: target.id,
    from: { x: 0, y: 1.2, z: 0 },
    to: { x: 8, y: 1, z: 1 },
    travelMs: 420,
    impactEffect: "burn"
  });
});

test("Ground Pound resolves circular area hits once per cast", () => {
  const near = {
    id: "enemy_ground_1",
    enemyId: "goblin_scout",
    zone: ZONES.FIELD,
    position: { x: 2, y: 0, z: 1 },
    health: 45,
    maxHealth: 45
  };
  const center = {
    id: "enemy_ground_2",
    enemyId: "green_slime",
    zone: ZONES.FIELD,
    position: { x: 0.8, y: 0, z: 0.6 },
    health: 25,
    maxHealth: 25
  };
  const far = {
    id: "enemy_ground_far",
    enemyId: "forest_wisp",
    zone: ZONES.FIELD,
    position: { x: 7, y: 0, z: 0 },
    health: 50,
    maxHealth: 50
  };
  const damageEvents = [];
  const enemySystem = {
    enemies: new Map([
      [near.id, near],
      [center.id, center],
      [far.id, far]
    ]),
    getZoneEnemies: () => [near, near, center, far],
    damageEnemy(payload) {
      damageEvents.push(payload);
      const target = this.enemies.get(payload.enemyInstanceId);
      target.health = Math.max(0, target.health - payload.damage);
      return { hit: true, defeated: target.health <= 0, enemy: target };
    }
  };
  const combat = new CombatSystem({ enemySystem, bossSystem: { damage: () => ({ defeated: false }) }, rng: () => 0.5 });
  const player = applyEquipment({
    ...STARTING_PLAYER,
    id: "bruiser",
    zone: ZONES.FIELD,
    position: { x: 0, y: 0, z: 0 },
    health: 100,
    level: 3,
    learnedAbilities: ["ground_pound"],
    spentAttributes: { health: 0, strength: 5, magic: 0, defense: 0 },
    lastAbilityAt: 0
  });

  const result = combat.ability(player, { abilityId: "ground_pound" });

  assert.equal(result.ok, true);
  assert.equal(result.abilityId, "ground_pound");
  assert.deepEqual(damageEvents.map((event) => event.enemyInstanceId), [near.id, center.id]);
  assert.ok(damageEvents.every((event) => event.damage > 0));
  assert.equal(far.health, far.maxHealth);
  assert.equal(new Set(result.hits.map((hit) => hit.enemy?.id)).size, result.hits.length);
  assert.deepEqual(result.areaEffect, {
    type: "ground_pound",
    origin: { x: 0, y: 0, z: 0 },
    radius: ABILITIES.ground_pound.radius,
    knockback: ABILITIES.ground_pound.knockback
  });
});

test("loot claims validate alive state and range before deleting the bag", () => {
  const loot = new LootSystem(() => 0.5);
  const bag = {
    id: "loot_test",
    zone: ZONES.FIELD,
    position: { x: 8, y: 0.25, z: 0 },
    ownerId: null,
    coins: 10,
    items: [],
    createdAt: Date.now()
  };
  loot.lootBags.set(bag.id, bag);

  const dead = loot.claimForPlayer({
    lootId: bag.id,
    player: { id: "p1", zone: ZONES.FIELD, position: { x: 8, y: 0, z: 0 }, health: 0, state: "dead" }
  });
  assert.equal(dead.ok, false);
  assert.equal(dead.reason, "dead");
  assert.equal(loot.lootBags.has(bag.id), true);

  const far = loot.claimForPlayer({
    lootId: bag.id,
    player: { id: "p1", zone: ZONES.FIELD, position: { x: 0, y: 0, z: 0 }, health: 100, state: "alive" }
  });
  assert.equal(far.ok, false);
  assert.equal(far.reason, "range");
  assert.equal(loot.lootBags.has(bag.id), true);

  const claimed = loot.claimForPlayer({
    lootId: bag.id,
    player: { id: "p1", zone: ZONES.FIELD, position: { x: 8, y: 0, z: 0 }, health: 100, state: "alive" }
  });
  assert.equal(claimed.ok, true);
  assert.equal(claimed.bag.id, bag.id);
  assert.equal(loot.lootBags.has(bag.id), false);
});

test("boss telegraphs include target slams, resolve after the warning, and keep cycling", () => {
  const realNow = Date.now;
  let now = 1000;
  Date.now = () => now;
  try {
    const boss = new BossSystem({ rng: () => 0.7 });
    boss.start();
    boss.state.phase = 2;
    boss.state.nextAttackAt = now;
    const players = new Map([
      [
        "p1",
        {
          id: "p1",
          zone: ZONES.BOSS,
          health: 100,
          maxHealth: 100,
          defense: 0,
          position: { x: 4, y: 0, z: 2 }
        }
      ]
    ]);

    const telegraph = boss.update(players).find((event) => event.type === "boss_telegraph");
    assert.equal(telegraph.attack.type, "shadow_slam");
    assert.equal(telegraph.attack.targetId, "p1");
    assert.ok(telegraph.attack.resolvesAt - telegraph.attack.startedAt >= 1000);
    assert.equal(players.get("p1").health, 100);

    now = telegraph.attack.resolvesAt;
    const resolved = boss.update(players);
    assert.ok(players.get("p1").health < 100);
    assert.ok(resolved.some((event) => event.type === "boss_impact"));

    now = boss.state.nextAttackAt + 1;
    const next = boss.update(players);
    assert.ok(next.some((event) => event.type === "boss_telegraph"));
  } finally {
    Date.now = realNow;
  }
});

test("Shadow Wyrm enters aggro immediately when damaged and tracks attacker threat", () => {
  const realNow = Date.now;
  let now = 2000;
  Date.now = () => now;
  try {
    const boss = new BossSystem({ rng: () => 0.1 });
    const damaged = boss.damage(21, "p1");
    assert.equal(damaged.defeated, false);
    assert.equal(boss.state.active, true);
    assert.equal(boss.state.mode, "CHOOSE_ATTACK");
    assert.equal(boss.state.threat.get("p1"), 21);

    const players = new Map([
      [
        "p1",
        {
          id: "p1",
          zone: ZONES.BOSS,
          health: 100,
          maxHealth: 100,
          defense: 0,
          position: { x: 2, y: 0, z: -3 }
        }
      ]
    ]);

    const events = boss.update(players);
    assert.ok(events.some((event) => event.type === "boss_telegraph"));
    assert.equal(boss.state.mode, "WINDUP");
  } finally {
    Date.now = realNow;
  }
});

test("Shadow Wyrm watchdog clears stale attack state and continues attacking", () => {
  const realNow = Date.now;
  let now = 50000;
  Date.now = () => now;
  try {
    const boss = new BossSystem({ rng: () => 0.1 });
    boss.start();
    boss.state.mode = "ACTIVE_ATTACK";
    boss.state.attack = {
      type: "fire_cone",
      name: "Fire Cone",
      startedAt: now - 30000,
      resolvesAt: now - 29000,
      durationMs: 60000,
      recastMs: 4200,
      damageScale: 1,
      shape: { kind: "cone", x: 0, z: -4, length: 20, width: 16 }
    };
    boss.state.nextAttackAt = now + 60000;
    const players = new Map([
      [
        "p1",
        {
          id: "p1",
          zone: ZONES.BOSS,
          health: 100,
          maxHealth: 100,
          defense: 0,
          position: { x: 1, y: 0, z: -3 }
        }
      ]
    ]);

    const events = boss.update(players);

    assert.ok(events.some((event) => event.type === "boss_telegraph"));
    assert.equal(boss.state.mode, "WINDUP");
    assert.notEqual(boss.state.attack.startedAt, now - 30000);
  } finally {
    Date.now = realNow;
  }
});

test("Shadow Wyrm damage during windup preserves the active attack loop", () => {
  const realNow = Date.now;
  let now = 70000;
  Date.now = () => now;
  try {
    const boss = new BossSystem({ rng: () => 0.1 });
    boss.damage(20, "p1");
    const players = new Map([
      [
        "p1",
        {
          id: "p1",
          zone: ZONES.BOSS,
          health: 100,
          maxHealth: 100,
          defense: 0,
          position: { x: 1, y: 0, z: -3 }
        }
      ]
    ]);
    boss.update(players);
    const activeAttack = boss.state.attack;
    const nextAttackAt = boss.state.nextAttackAt;

    now += 100;
    boss.damage(6, "p1");

    assert.equal(boss.state.mode, "WINDUP");
    assert.equal(boss.state.attack, activeAttack);
    assert.equal(boss.state.nextAttackAt, nextAttackAt);
    assert.equal(boss.state.threat.get("p1"), 26);
  } finally {
    Date.now = realNow;
  }
});

test("boss defeat rewards quest credit to participants and party members in the arena", () => {
  const io = { to: () => ({ emit: () => {} }) };
  const room = new RoomManager(io);
  clearInterval(room.tickTimer);
  clearInterval(room.snapshotTimer);
  try {
    const attacker = createPlayerState("p1", { name: "Attacker", zone: ZONES.BOSS });
    const ally = createPlayerState("p2", { name: "Ally", zone: ZONES.BOSS });
    const away = createPlayerState("p3", { name: "Away", zone: ZONES.FIELD });
    room.players.set(attacker.id, attacker);
    room.players.set(ally.id, ally);
    room.players.set(away.id, away);
    const party = room.parties.createParty(attacker.id);
    room.parties.joinParty(ally.id, party.code);
    room.syncPartyIds();
    room.boss.state.participants.add(attacker.id);

    room.awardBossDefeat({ reward: { xp: 400, coins: 300 }, lootBag: null }, attacker);

    assert.equal(attacker.questProgress.shadow_at_the_peak.current, 1);
    assert.equal(attacker.questProgress.shadow_at_the_peak.complete, true);
    assert.equal(ally.questProgress.shadow_at_the_peak.current, 1);
    assert.equal(ally.questProgress.shadow_at_the_peak.complete, true);
    assert.equal(away.questProgress.shadow_at_the_peak.current, 0);
  } finally {
    clearInterval(room.tickTimer);
    clearInterval(room.snapshotTimer);
  }
});

test("Shadow Wyrm defeat rolls personal Rest Stone rewards independently", () => {
  const io = { to: () => ({ emit: () => {} }) };
  const room = new RoomManager(io);
  clearInterval(room.tickTimer);
  clearInterval(room.snapshotTimer);
  try {
    const attacker = createPlayerState("p1", { name: "Attacker", zone: ZONES.BOSS });
    const ally = createPlayerState("p2", { name: "Ally", zone: ZONES.BOSS });
    room.players.set(attacker.id, attacker);
    room.players.set(ally.id, ally);
    room.boss.state.participants.add(attacker.id);
    room.boss.state.participants.add(ally.id);
    const rolls = [0.49, 0.51];
    room.rng = () => rolls.shift() ?? 0.99;

    room.awardBossDefeat({ reward: { xp: 400, coins: 300 }, lootBag: null }, attacker);

    assert.equal(inventoryQuantity(attacker.inventory, "rest_stone"), 1);
    assert.equal(inventoryQuantity(ally.inventory, "rest_stone"), 0);
  } finally {
    clearInterval(room.tickTimer);
    clearInterval(room.snapshotTimer);
  }
});

test("server Mend Ally heals a friendly player and spends mana", () => {
  const lootSystem = new LootSystem(() => 0.5);
  const enemySystem = new EnemySystem({ lootSystem, rng: () => 0.5 });
  const bossSystem = new BossSystem({ lootSystem, rng: () => 0.5 });
  const combat = new CombatSystem({ enemySystem, bossSystem, rng: () => 0.5 });
  const healer = createPlayerState("p1", {
    name: "Healer",
    level: 6,
    zone: ZONES.HUB,
    learnedAbilities: ["mend_ally"],
    spentAttributes: { health: 0, strength: 0, magic: 10, defense: 0 }
  });
  healer.mana = 80;
  healer.maxMana = 100;
  healer.healingPower = 24;
  healer.position = { x: 0, y: 0, z: 0 };
  const ally = createPlayerState("p2", { name: "Ally", zone: ZONES.HUB });
  ally.maxHealth = 140;
  ally.health = 45;
  ally.position = { x: 4, y: 0, z: 0 };
  const players = new Map([[healer.id, healer], [ally.id, ally]]);

  const result = combat.ability(healer, { abilityId: "mend_ally", targetId: ally.id }, players);

  assert.equal(result.ok, true);
  assert.equal(result.abilityId, "mend_ally");
  assert.ok(result.heals[0].amount > 0);
  assert.ok(ally.health > 45);
  assert.ok(healer.mana < 80);
  assert.ok(healer.healingDone >= result.heals[0].amount);
});

test("Palace of Zero is registered as a level 8 gated zone from Frostveil", () => {
  assert.equal(ZONES.PALACE, "palace");

  const frostveil = getZone(ZONES.FROSTVEIL);
  const palacePortal = frostveil.portals.find((portal) => portal.targetZone === ZONES.PALACE);
  assert.equal(palacePortal.label, "Palace of Zero");
  assert.equal(palacePortal.minLevel, 8);

  const palace = getZone(ZONES.PALACE);
  assert.equal(palace.name, "Palace of Zero");
  assert.equal(palace.minLevel, 8);
  assert.equal(palace.spawn.z, 18);

  const level7 = applyEquipment({ ...STARTING_PLAYER, xp: 940 });
  const blocked = canEnterZone(level7, ZONES.PALACE);
  assert.equal(blocked.ok, false);
  assert.equal(blocked.reason, "level");
  assert.match(blocked.message, /Reach Level 8/);

  const level8 = applyEquipment({ ...STARTING_PLAYER, xp: 1300 });
  const allowed = canEnterZone(level8, ZONES.PALACE);
  assert.equal(allowed.ok, true);
});

test("Ice Mage quest chain supports palace entry and boss defeat", async () => {
  const { ICE_MAGE_BOSS } = await import("../../shared/enemies.js");
  let progress = createQuestProgress();

  const entered = applyQuestEvent(progress, "enter_palace");
  assert.equal(entered.progress.palace_of_zero.complete, true);
  assert.equal(entered.completed[0].id, "palace_of_zero");
  progress = entered.progress;

  const defeated = applyQuestKill(progress, ICE_MAGE_BOSS);
  assert.equal(defeated.progress.icezero.complete, true);
  assert.equal(defeated.completed[0].id, "icezero");
});

test("Ice Mage telegraphs repeated phase attacks and resets when the palace empties", async () => {
  const { IceMageSystem } = await import("../src/IceMageSystem.js");
  const realNow = Date.now;
  let now = 1000;
  Date.now = () => now;
  try {
    const boss = new IceMageSystem({ rng: () => 0 });
    boss.start();
    boss.state.nextAttackAt = now;
    const players = new Map([
      [
        "p1",
        {
          id: "p1",
          zone: ZONES.PALACE,
          health: 160,
          maxHealth: 160,
          defense: 0,
          position: { x: 0, y: 0, z: 4 }
        }
      ]
    ]);

    const telegraph = boss.update(players).find((event) => event.type === "ice_mage_telegraph");
    assert.equal(telegraph.attack.type, "ice_lance");
    assert.ok(telegraph.attack.resolvesAt - telegraph.attack.startedAt >= 1200);
    assert.equal(players.get("p1").health, 160);

    now = telegraph.attack.resolvesAt;
    const resolved = boss.update(players);
    assert.ok(resolved.some((event) => event.type === "ice_mage_impact"));
    assert.ok(players.get("p1").health < 160);

    boss.damage(1050, "p1");
    assert.equal(boss.state.phase, 2);
    boss.damage(750, "p1");
    assert.equal(boss.state.phase, 3);

    now = boss.state.nextAttackAt + 1;
    boss.state.attack = null;
    const next = boss.update(players);
    assert.ok(next.some((event) => event.type === "ice_mage_telegraph"));

    players.get("p1").zone = ZONES.FROSTVEIL;
    const reset = boss.update(players);
    assert.ok(reset.some((event) => event.type === "ice_mage_reset"));
    assert.equal(boss.state.active, false);
  } finally {
    Date.now = realNow;
  }
});

test("server grants Ice Mage quest and first-clear rewards once to eligible palace players", () => {
  const io = { to: () => ({ emit: () => {} }) };
  const room = new RoomManager(io);
  clearInterval(room.tickTimer);
  clearInterval(room.snapshotTimer);
  try {
    const attacker = createPlayerState("p1", { name: "Attacker", xp: 1300, zone: ZONES.FROSTVEIL });
    const ally = createPlayerState("p2", { name: "Ally", xp: 1300, zone: ZONES.PALACE });
    const away = createPlayerState("p3", { name: "Away", xp: 1300, zone: ZONES.FROSTVEIL });
    room.players.set(attacker.id, attacker);
    room.players.set(ally.id, ally);
    room.players.set(away.id, away);
    const party = room.parties.createParty(attacker.id);
    room.parties.joinParty(ally.id, party.code);
    room.syncPartyIds();

    const entry = room.changePlayerZone(attacker, ZONES.PALACE, { x: 0, y: 0, z: 18 });
    assert.equal(entry.ok, true);
    assert.equal(attacker.questProgress.palace_of_zero.complete, true);
    assert.equal(room.snapshotForZone(ZONES.PALACE).iceMage.active, true);

    room.iceMage.state.participants.add(attacker.id);
    room.awardIceMageDefeat({ reward: { xp: 520, coins: 420 }, lootBag: null }, attacker);

    assert.equal(attacker.questProgress.icezero.complete, true);
    assert.equal(ally.questProgress.icezero.complete, true);
    assert.equal(away.questProgress.icezero.current, 0);
    assert.equal(attacker.title, "Icebreaker");
    assert.equal(attacker.firstClearRewards.zero_ice_mage, true);
    assert.ok(attacker.achievements.includes("icebreaker"));

    const xpAfterFirstClear = attacker.xp;
    room.awardIceMageDefeat({ reward: { xp: 520, coins: 420 }, lootBag: null }, attacker);
    assert.equal(attacker.firstClearRewards.zero_ice_mage, true);
    assert.equal(attacker.xp, xpAfterFirstClear + 520);
  } finally {
    clearInterval(room.tickTimer);
    clearInterval(room.snapshotTimer);
  }
});

test("IceZero meta progress records bestiary kills, achievements, and active titles", async () => {
  const {
    evaluateAchievements,
    recordBestiaryKill,
    setActiveTitle
  } = await import("../../shared/metaProgress.js");

  let player = {
    ...STARTING_PLAYER,
    learnedAbilities: ["hero_pulse"],
    bestiaryProgress: {},
    achievements: [],
    firstClearRewards: {},
    questProgress: createQuestProgress(),
    waypoints: ["dawnrest", "frostveil_camp"],
    title: ""
  };

  player = recordBestiaryKill(player, ENEMIES.frost_slime).player;
  assert.equal(player.bestiaryProgress.frost_slime.discovered, true);
  assert.equal(player.bestiaryProgress.frost_slime.kills, 1);
  assert.equal(player.bestiaryProgress.frost_slime.zone, ZONES.FROSTVEIL);

  player = recordBestiaryKill(player, ENEMIES.ice_golem, { elite: true }).player;
  assert.equal(player.bestiaryProgress.ice_golem.eliteKills, 1);

  const evaluated = evaluateAchievements({
    ...player,
    firstClearRewards: { [ICE_MAGE_BOSS.id]: true }
  }).player;
  assert.ok(evaluated.achievements.includes("first_spell"));
  assert.ok(evaluated.achievements.includes("elite_hunter"));
  assert.ok(evaluated.achievements.includes("icebreaker"));
  assert.ok(evaluated.achievements.includes("frostveil_explorer"));

  const titled = setActiveTitle(evaluated, "icebreaker");
  assert.equal(titled.ok, true);
  assert.equal(titled.player.title, "Icebreaker");

  const invalid = setActiveTitle(evaluated, "wyrm_slayer");
  assert.equal(invalid.ok, false);
  assert.equal(invalid.reason, "locked");
});

test("zone completion summarizes quests, bestiary, bosses, waypoints, and chests", async () => {
  const { calculateZoneCompletion, recordBestiaryKill, refreshZoneCompletion } = await import("../../shared/metaProgress.js");
  let progress = createQuestProgress();
  progress = applyQuestEvent(progress, "enter_frostveil").progress;
  progress = applyQuestEvent(progress, "activate_frost_ward").progress;
  progress = applyQuestEvent(progress, "activate_frost_ward").progress;
  progress = applyQuestEvent(progress, "activate_frost_ward").progress;
  progress = applyQuestEvent(progress, "enter_palace").progress;
  progress = applyQuestKill(progress, ICE_MAGE_BOSS).progress;

  let player = {
    ...STARTING_PLAYER,
    questProgress: progress,
    waypoints: ["dawnrest", "frostveil_camp"],
    openedChests: ["frostveil_snow_cache"],
    bestiaryProgress: {},
    firstClearRewards: { [ICE_MAGE_BOSS.id]: true },
    zoneCompletion: {}
  };
  for (const enemyId of ["frost_slime", "ice_goblin", "snow_wolf", "frost_wisp", "ice_golem", "frozen_knight"]) {
    player = recordBestiaryKill(player, ENEMIES[enemyId], { elite: enemyId === "ice_golem" }).player;
  }

  const frostveil = calculateZoneCompletion(player, ZONES.FROSTVEIL);
  assert.equal(frostveil.checklist.waypoint.complete, true);
  assert.equal(frostveil.checklist.chests.complete, true);
  assert.ok(frostveil.percent >= 70);

  const palace = calculateZoneCompletion(player, ZONES.PALACE);
  assert.equal(palace.percent, 100);
  assert.equal(palace.checklist.boss.complete, true);

  const refreshed = refreshZoneCompletion(player).player;
  assert.equal(refreshed.zoneCompletion[ZONES.PALACE].percent, 100);
  assert.ok(refreshed.zoneCompletion[ZONES.FROSTVEIL].percent >= 70);
});

test("server records bestiary and zone completion when enemies and bosses are defeated", async () => {
  const io = { to: () => ({ emit: () => {} }) };
  const room = new RoomManager(io);
  clearInterval(room.tickTimer);
  clearInterval(room.snapshotTimer);
  try {
    const player = createPlayerState("p1", {
      xp: 1300,
      zone: ZONES.FROSTVEIL,
      waypoints: ["dawnrest", "frostveil_camp"]
    });
    room.players.set(player.id, player);

    room.applyCombatRewards(player, {
      result: {
        defeated: true,
        reward: { xp: 150, coins: 80 },
        enemyDef: ENEMIES.ice_golem
      }
    });

    assert.equal(player.bestiaryProgress.ice_golem.kills, 1);
    assert.ok(player.achievements.includes("elite_hunter"));
    assert.ok(player.zoneCompletion[ZONES.FROSTVEIL].percent > 0);

    room.changePlayerZone(player, ZONES.PALACE, { x: 0, y: 0, z: 18 });
    room.iceMage.state.participants.add(player.id);
    room.awardIceMageDefeat({ reward: { xp: ICE_MAGE_BOSS.xp, coins: ICE_MAGE_BOSS.coins }, lootBag: null }, player);

    assert.ok(player.achievements.includes("icebreaker"));
    assert.equal(player.zoneCompletion[ZONES.PALACE].percent, 100);
  } finally {
    clearInterval(room.tickTimer);
    clearInterval(room.snapshotTimer);
  }
});
