import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { STARTING_PLAYER, ZONES } from "../../shared/constants.js";
import { applyEquipment, addProgressRewards, calculateIncomingDamage } from "../../shared/combat.js";
import { applyQuestKill, createQuestProgress } from "../../shared/quests.js";
import { EnemySystem } from "../src/EnemySystem.js";
import { LootSystem } from "../src/LootSystem.js";
import { PartySystem } from "../src/PartySystem.js";
import { CombatSystem } from "../src/CombatSystem.js";
import { BossSystem } from "../src/BossSystem.js";
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
      "ENEMIES",
      "FIELD_SPAWNS",
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
      "applyQuestKill",
      "createQuestProgress",
      "getQuestList",
      "getZone",
      "ZONE_DEFS",
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
      "env",
      `"use strict";\n${runtimeSource}`
    );
  });
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
  assert.equal(calculateIncomingDamage(12, player), 10);

  const rewarded = addProgressRewards(player, { xp: 120, coins: 25 });
  assert.equal(rewarded.level, 3);
  assert.equal(rewarded.coins, 75);
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
