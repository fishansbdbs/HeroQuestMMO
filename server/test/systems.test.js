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
      "env",
      `"use strict";\n${runtimeSource}`
    );
  });
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
