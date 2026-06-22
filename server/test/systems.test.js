import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { GAME_VERSION, PATCH_NOTES, STARTING_PLAYER, ZONES } from "../../shared/constants.js";
import { applyEquipment, addProgressRewards, calculateIncomingDamage } from "../../shared/combat.js";
import { ENEMIES, FROSTVEIL_SPAWNS, ELITE_MODIFIERS, ICE_MAGE_BOSS } from "../../shared/enemies.js";
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
      "ICEZERO_MIGRATION_ID",
      "migrateIceZeroSave",
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

test("Frost Ward public event starts for Frostveil players and spawns event enemies", () => {
  const enemies = new EnemySystem({ rng: () => 0 });
  const eventSystem = new PublicEventSystem({ enemySystem: enemies, rng: () => 0 });
  const player = createPlayerState("p1", {
    xp: 420,
    zone: ZONES.FROSTVEIL,
    position: { x: 8, y: 0, z: -8 }
  });

  const events = eventSystem.update(new Map([[player.id, player]]), 1000);
  assert.ok(events.some((event) => event.type === "public_event_started" && event.eventId === "defend_frost_ward"));
  assert.equal(eventSystem.snapshot(ZONES.FROSTVEIL).active, true);
  assert.ok(enemies.getZoneEnemies(ZONES.FROSTVEIL).some((enemy) => enemy.eventId === "defend_frost_ward"));
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
