import { SNAPSHOT_MS, SERVER_TICK_MS, ZONES } from "../../shared/constants.js";
import { NET } from "../../shared/netMessages.js";
import { addInventoryItem, addProgressRewards, distance2d } from "../../shared/combat.js";
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
      player.position = clampPosition(payload.position, player.zone);
      player.lastInputAt = Date.now();
    });

    socket.on(NET.PLAYER_ZONE, (payload, ack) => {
      const player = this.players.get(socket.id);
      if (!player || !payload?.zone) return;
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
      const bag = payload?.lootId ? this.loot.claim(payload.lootId, socket.id) : null;
      if (!player || !bag || distance2d(player.position, bag.position) > 4) {
        ack?.({ ok: false });
        return;
      }
      player.coins += bag.coins || 0;
      for (const item of bag.items || []) {
        player.inventory = addInventoryItem(player.inventory, item.itemId, item.quantity || 1);
      }
      ack?.({ ok: true, bag, player: sanitizePlayer(player) });
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
    const defeat = result?.result?.defeated ? result.result : null;
    if (defeat?.reward) {
      Object.assign(player, addProgressRewards(player, defeat.reward));
      const questUpdate = applyQuestKill(player.questProgress, defeat.enemyDef);
      player.questProgress = questUpdate.progress;
    }
    const boss = result?.boss || result?.result?.boss;
    if (boss?.defeated || boss?.boss?.defeated) {
      const reward = boss.reward || { xp: 400, coins: 300 };
      Object.assign(player, addProgressRewards(player, reward));
      const questUpdate = applyQuestKill(player.questProgress, { id: "shadow_wyrm", family: "dragon" });
      player.questProgress = questUpdate.progress;
      player.title = "Wyrm-Touched";
    }
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
    this.boss.update(this.players);
    this.loot.cleanup();
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
      boss: this.boss.snapshot(),
      parties: this.parties.snapshot(),
      serverTime: Date.now()
    };
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
