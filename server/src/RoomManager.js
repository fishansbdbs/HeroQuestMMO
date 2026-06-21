import { PLAYER_STATES, RESPAWN_DELAY_MS, SNAPSHOT_MS, SERVER_TICK_MS, ZONES } from "../../shared/constants.js";
import { NET } from "../../shared/netMessages.js";
import { addInventoryItem, addProgressRewards, distance2d, isPlayerDead } from "../../shared/combat.js";
import { applyQuestKill } from "../../shared/quests.js";
import { createPlayerState, sanitizePlayer } from "./PlayerState.js";
import { LootSystem } from "./LootSystem.js";
import { EnemySystem } from "./EnemySystem.js";
import { BossSystem } from "./BossSystem.js";
import { CombatSystem } from "./CombatSystem.js";
import { PartySystem } from "./PartySystem.js";

export class RoomManager {
  constructor(io) {
    this.io = io;
    this.players = new Map();
    this.loot = new LootSystem();
    this.enemies = new EnemySystem({ lootSystem: this.loot });
    this.boss = new BossSystem({ lootSystem: this.loot });
    this.combat = new CombatSystem({ enemySystem: this.enemies, bossSystem: this.boss });
    this.parties = new PartySystem();
    this.chests = createChests();
    this.lastTick = Date.now();
    this.tickTimer = setInterval(() => this.tick(), SERVER_TICK_MS);
    this.snapshotTimer = setInterval(() => this.broadcastSnapshots(), SNAPSHOT_MS);
  }

  attach(socket) {
    socket.on(NET.PLAYER_JOIN, (profile, ack) => {
      const player = createPlayerState(socket.id, profile);
      this.players.set(socket.id, player);
      socket.join(player.zone);
      ack?.({ ok: true, player: sanitizePlayer(player), snapshot: this.snapshotForZone(player.zone) });
      this.broadcastSnapshots();
    });

    socket.on(NET.PLAYER_MOVE, (payload) => {
      const player = this.players.get(socket.id);
      if (!player || !payload?.position) return;
      if (isPlayerDead(player)) return;
      player.position = clampPosition(payload.position, player.zone);
      player.lastInputAt = Date.now();
    });

    socket.on(NET.PLAYER_ZONE, (payload, ack) => {
      const player = this.players.get(socket.id);
      if (!player || !payload?.zone) return;
      if (isPlayerDead(player)) {
        ack?.({ ok: false, reason: "dead", player: sanitizePlayer(player) });
        return;
      }
      socket.leave(player.zone);
      player.zone = payload.zone;
      player.position = payload.position || defaultZonePosition(payload.zone);
      socket.join(player.zone);
      if (player.zone === ZONES.BOSS) this.boss.start();
      ack?.({ ok: true, player: sanitizePlayer(player), snapshot: this.snapshotForZone(player.zone) });
      this.broadcastSnapshots();
    });

    socket.on(NET.PLAYER_SAVE, (payload) => {
      const player = this.players.get(socket.id);
      if (!player || !payload) return;
      Object.assign(player, {
        xp: payload.xp ?? player.xp,
        coins: payload.coins ?? player.coins,
        inventory: payload.inventory ?? player.inventory,
        equippedWeapon: payload.equippedWeapon ?? player.equippedWeapon,
        equippedArmor: payload.equippedArmor ?? player.equippedArmor,
        questProgress: payload.questProgress ?? player.questProgress,
        title: payload.title ?? player.title
      });
    });

    socket.on(NET.COMBAT_ATTACK, (payload, ack) => {
      const player = this.players.get(socket.id);
      if (!player) return;
      const result = this.combat.attack(player, payload?.targetId, { kind: payload?.kind });
      this.applyCombatRewards(player, result);
      ack?.(result);
      this.broadcastSnapshots();
    });

    socket.on(NET.COMBAT_ABILITY, (_payload, ack) => {
      const player = this.players.get(socket.id);
      if (!player) return;
      const result = this.combat.ability(player);
      for (const hit of result.hits || []) this.applyCombatRewards(player, { result: hit, boss: hit.boss });
      ack?.(result);
      this.broadcastSnapshots();
    });

    socket.on(NET.LOOT_CLAIM, (payload, ack) => {
      const player = this.players.get(socket.id);
      const claim = payload?.lootId ? this.loot.claimForPlayer({ lootId: payload.lootId, player, range: 4 }) : { ok: false, reason: "missing" };
      if (!claim.ok) {
        ack?.({ ok: false, reason: claim.reason });
        return;
      }
      const bag = claim.bag;
      player.coins += bag.coins || 0;
      for (const item of bag.items || []) {
        player.inventory = addInventoryItem(player.inventory, item.itemId, item.quantity || 1);
      }
      ack?.({ ok: true, bag, player: sanitizePlayer(player) });
      this.broadcastSnapshots();
    });

    socket.on(NET.CHEST_CLAIM, (payload, ack) => {
      const player = this.players.get(socket.id);
      const result = this.claimChest(player, payload?.chestId);
      ack?.(result);
      if (result.ok) this.broadcastSnapshots();
    });

    socket.on(NET.PLAYER_RESPAWN, (_payload, ack) => {
      const player = this.players.get(socket.id);
      if (!player) return;
      if (!isPlayerDead(player) || Date.now() < (player.respawnAt || 0)) {
        ack?.({ ok: false, reason: "not_ready", player: sanitizePlayer(player) });
        return;
      }
      const oldZone = player.zone;
      this.respawnPlayer(player);
      socket.leave(oldZone);
      socket.join(ZONES.HUB);
      ack?.({ ok: true, player: sanitizePlayer(player), snapshot: this.snapshotForZone(player.zone) });
      this.broadcastSnapshots();
    });

    socket.on(NET.PARTY_CREATE, (_payload, ack) => {
      const party = this.parties.createParty(socket.id);
      this.syncPartyIds();
      ack?.({ ok: true, party });
      this.broadcastSnapshots();
    });

    socket.on(NET.PARTY_JOIN, (payload, ack) => {
      try {
        const party = this.parties.joinParty(socket.id, payload?.code);
        this.syncPartyIds();
        ack?.({ ok: true, party });
        this.broadcastSnapshots();
      } catch (error) {
        ack?.({ ok: false, error: error.message });
      }
    });

    socket.on(NET.PARTY_LEAVE, (_payload, ack) => {
      this.parties.leaveParty(socket.id);
      this.syncPartyIds();
      ack?.({ ok: true });
      this.broadcastSnapshots();
    });

    socket.on("disconnect", () => {
      this.parties.leaveParty(socket.id);
      this.players.delete(socket.id);
      this.broadcastSnapshots();
    });
  }

  applyCombatRewards(player, result) {
    if (isPlayerDead(player)) return;
    const defeat = result?.result?.defeated ? result.result : null;
    if (defeat?.reward) {
      Object.assign(player, addProgressRewards(player, defeat.reward));
      const questUpdate = applyQuestKill(player.questProgress, defeat.enemyDef);
      player.questProgress = questUpdate.progress;
    }
    const boss = result?.boss || result?.result?.boss;
    if (boss?.defeated || boss?.boss?.defeated) {
      this.awardBossDefeat(boss, player);
    }
  }

  awardBossDefeat(bossResult, triggeringPlayer) {
    const eligibleIds = new Set(this.boss.state.participants);
    if (triggeringPlayer?.id) eligibleIds.add(triggeringPlayer.id);
    for (const player of this.players.values()) {
      if (player.zone === ZONES.BOSS) eligibleIds.add(player.id);
    }
    for (const id of [...eligibleIds]) {
      const party = this.parties.getPartyForPlayer(id);
      if (party) {
        for (const memberId of party.members) {
          const member = this.players.get(memberId);
          if (member?.zone === ZONES.BOSS) eligibleIds.add(memberId);
        }
      }
    }
    const reward = bossResult.reward || { xp: 400, coins: 300 };
    for (const id of eligibleIds) {
      const player = this.players.get(id);
      if (!player || isPlayerDead(player)) continue;
      Object.assign(player, addProgressRewards(player, reward));
      const questUpdate = applyQuestKill(player.questProgress, { id: "shadow_wyrm", family: "dragon" });
      player.questProgress = questUpdate.progress;
      player.title = "Wyrm-Touched";
    }
    this.io.to(ZONES.BOSS).emit(NET.WORLD_EVENT, {
      type: "boss_defeated",
      playerIds: [...eligibleIds],
      reward,
      lootBag: bossResult.lootBag || null
    });
  }

  syncPartyIds() {
    for (const player of this.players.values()) {
      const party = this.parties.getPartyForPlayer(player.id);
      player.partyId = party?.code || null;
    }
  }

  tick() {
    const now = Date.now();
    const dt = now - this.lastTick;
    this.lastTick = now;
    this.enemies.update(this.players, dt);
    this.processDeaths();
    const bossEvents = this.boss.update(this.players);
    this.handleBossEvents(bossEvents);
    this.processDeaths();
    this.processRespawns();
    this.loot.cleanup();
  }

  handleBossEvents(events) {
    for (const event of events || []) {
      if (event.type === "boss_summon") this.spawnShadowSlimes(event.attack?.shape?.points);
      this.io.to(ZONES.BOSS).emit(NET.WORLD_EVENT, event);
    }
  }

  spawnShadowSlimes(points = []) {
    const spawnPoints = points.length ? points : [{ x: 7, z: 0 }, { x: -6, z: 4 }, { x: 2, z: -8 }];
    for (const point of spawnPoints.slice(0, 3)) {
      this.enemies.spawnEnemy("shadow_slime", { x: point.x, y: 0, z: point.z }, ZONES.BOSS);
    }
  }

  processDeaths() {
    for (const player of this.players.values()) {
      if ((player.health ?? 0) <= 0 && player.state !== PLAYER_STATES.DEAD) {
        this.markDefeated(player);
      }
    }
  }

  markDefeated(player) {
    const now = Date.now();
    player.health = 0;
    player.state = PLAYER_STATES.DEAD;
    player.defeatedAt = now;
    player.respawnAt = now + RESPAWN_DELAY_MS;
    player.lastAttackAt = now;
    player.lastAbilityAt = now;
    this.io.to(player.zone).emit(NET.WORLD_EVENT, {
      type: "player_defeated",
      playerId: player.id,
      respawnAt: player.respawnAt
    });
  }

  processRespawns() {
    for (const player of this.players.values()) {
      if (player.state === PLAYER_STATES.DEAD && Date.now() >= (player.respawnAt || 0)) {
        const oldZone = player.zone;
        this.respawnPlayer(player);
        const socket = this.io.sockets?.sockets?.get?.(player.id);
        if (socket) {
          socket.leave(oldZone);
          socket.join(player.zone);
        }
        this.io.to(player.zone).emit(NET.WORLD_EVENT, { type: "player_respawned", playerId: player.id });
      }
    }
  }

  respawnPlayer(player) {
    Object.assign(player, {
      state: PLAYER_STATES.ALIVE,
      health: player.maxHealth,
      zone: ZONES.HUB,
      position: defaultZonePosition(ZONES.HUB),
      defeatedAt: null,
      respawnAt: null,
      lastAttackAt: 0,
      lastAbilityAt: 0
    });
  }

  claimChest(player, chestId) {
    const chest = this.chests.get(chestId);
    if (!player) return { ok: false, reason: "missing_player" };
    if (isPlayerDead(player)) return { ok: false, reason: "dead" };
    if (!chest) return { ok: false, reason: "missing" };
    if (chest.zone !== player.zone) return { ok: false, reason: "zone" };
    if (chest.openedBy.has(player.id)) return { ok: false, reason: "opened" };
    if (distance2d(player.position, chest.position) > 4) return { ok: false, reason: "range" };
    chest.openedBy.add(player.id);
    const reward = { coins: chest.coins, items: [...chest.items] };
    player.coins += reward.coins;
    for (const item of reward.items) {
      player.inventory = addInventoryItem(player.inventory, item.itemId, item.quantity || 1);
    }
    return { ok: true, chestId, reward, player: sanitizePlayer(player) };
  }

  broadcastSnapshots() {
    const zones = new Set([...this.players.values()].map((player) => player.zone));
    zones.add(ZONES.HUB);
    for (const zone of zones) {
      this.io.to(zone).emit(NET.WORLD_SNAPSHOT, this.snapshotForZone(zone));
    }
  }

  snapshotForZone(zone) {
    return {
      zone,
      players: [...this.players.values()].filter((player) => player.zone === zone).map(sanitizePlayer),
      enemies: this.enemies.snapshot(zone),
      loot: this.loot.snapshot(zone),
      chests: this.snapshotChests(zone),
      boss: this.boss.snapshot(),
      parties: this.parties.snapshot(),
      serverTime: Date.now()
    };
  }

  snapshotChests(zone) {
    return [...this.chests.values()]
      .filter((chest) => chest.zone === zone)
      .map((chest) => ({
        id: chest.id,
        zone: chest.zone,
        position: chest.position,
        openedBy: [...chest.openedBy]
      }));
  }
}

function clampPosition(position, zone) {
  const bounds = zone === ZONES.FIELD ? 54 : zone === ZONES.BOSS ? 30 : 42;
  return {
    x: Math.max(-bounds, Math.min(bounds, Number(position.x) || 0)),
    y: 0,
    z: Math.max(-bounds, Math.min(bounds, Number(position.z) || 0)),
    rot: Number(position.rot) || 0
  };
}

function defaultZonePosition(zone) {
  if (zone === ZONES.FIELD) return { x: 0, y: 0, z: 31, rot: Math.PI };
  if (zone === ZONES.BOSS) return { x: 0, y: 0, z: 22, rot: Math.PI };
  return { x: 0, y: 0, z: 6, rot: 0 };
}

function createChests() {
  return new Map([
    [
      "hub_weapon_cache",
      {
        id: "hub_weapon_cache",
        zone: ZONES.HUB,
        position: { x: -12, y: 0.25, z: 12 },
        coins: 18,
        items: [{ itemId: "small_health_potion", quantity: 1 }],
        openedBy: new Set()
      }
    ],
    [
      "field_north_cache",
      {
        id: "field_north_cache",
        zone: ZONES.FIELD,
        position: { x: -8, y: 0.25, z: 22 },
        coins: 28,
        items: [{ itemId: "small_health_potion", quantity: 1 }],
        openedBy: new Set()
      }
    ],
    [
      "field_south_cache",
      {
        id: "field_south_cache",
        zone: ZONES.FIELD,
        position: { x: 20, y: 0.25, z: -22 },
        coins: 36,
        items: [{ itemId: "rusty_blade", quantity: 1 }],
        openedBy: new Set()
      }
    ]
  ]);
}
