import { BOSS, ENEMIES } from "../../shared/enemies.js";
import { ZONES } from "../../shared/constants.js";
import { distance2d, calculateIncomingDamage, isPlayerDead } from "../../shared/combat.js";
import { LootSystem } from "./LootSystem.js";

const BOSS_ATTACKS = {
  fire_cone: {
    name: "Fire Cone",
    delayMs: 1200,
    recastMs: 4200,
    shape: { kind: "cone", x: 0, z: -4, length: 20, width: 16 },
    damageScale: 1.05
  },
  tail_sweep: {
    name: "Tail Sweep",
    delayMs: 1000,
    recastMs: 3800,
    shape: { kind: "arc", x: 0, z: 0, innerRadius: 7, outerRadius: 13, start: Math.PI * 0.18, length: Math.PI * 1.45 },
    damageScale: 0.95,
    knockback: 4.2
  },
  wing_gust: {
    name: "Wing Gust",
    delayMs: 1150,
    recastMs: 4000,
    shape: { kind: "circle", x: 0, z: 0, radius: 15 },
    damageScale: 0.62,
    knockback: 5
  },
  shadow_slam: {
    name: "Shadow Slam",
    delayMs: 1100,
    recastMs: 3900,
    shape: { kind: "circle", radius: 4.8 },
    damageScale: 1.15
  },
  shadow_summon: {
    name: "Shadow Summon",
    delayMs: 1250,
    recastMs: 4700,
    shape: { kind: "summon", radius: 3.2 },
    damageScale: 0
  }
};

const BOSS_MODES = {
  IDLE: "IDLE",
  AGGRO: "AGGRO",
  CHOOSE_ATTACK: "CHOOSE_ATTACK",
  WINDUP: "WINDUP",
  ACTIVE_ATTACK: "ACTIVE_ATTACK",
  RECOVERY: "RECOVERY",
  DEAD: "DEAD"
};

const BOSS_MODE_MAX_MS = {
  [BOSS_MODES.AGGRO]: 2000,
  [BOSS_MODES.CHOOSE_ATTACK]: 2000,
  [BOSS_MODES.WINDUP]: 5000,
  [BOSS_MODES.ACTIVE_ATTACK]: 5000,
  [BOSS_MODES.RECOVERY]: 5000
};

export class BossSystem {
  constructor({ lootSystem = new LootSystem(), rng = Math.random } = {}) {
    this.lootSystem = lootSystem;
    this.rng = rng;
    this.reset();
  }

  reset() {
    this.state = {
      id: BOSS.id,
      health: BOSS.maxHealth,
      maxHealth: BOSS.maxHealth,
      phase: 1,
      active: false,
      defeated: false,
      mode: BOSS_MODES.IDLE,
      stateEnteredAt: Date.now(),
      attack: null,
      threat: new Map(),
      currentTargetId: null,
      participants: new Set(),
      nextAttackAt: Date.now() + 4000
    };
  }

  start({ immediate = false } = {}) {
    if (this.state.defeated) this.reset();
    if (this.state.active) {
      if (immediate && !this.state.attack) {
        this.enterMode(BOSS_MODES.CHOOSE_ATTACK);
        this.state.nextAttackAt = Date.now();
      }
      return this.snapshot();
    }
    this.state.active = true;
    this.enterMode(BOSS_MODES.CHOOSE_ATTACK);
    this.state.nextAttackAt = Date.now() + (immediate ? 0 : 2400);
    return this.snapshot();
  }

  damage(amount, playerId) {
    this.start({ immediate: true });
    const damage = Math.max(1, Math.round(amount));
    this.state.participants.add(playerId);
    this.state.threat.set(playerId, (this.state.threat.get(playerId) || 0) + damage);
    this.state.health = Math.max(0, this.state.health - damage);
    if (this.state.health <= BOSS.maxHealth * 0.5) this.state.phase = 2;
    if (this.state.health <= 0 && !this.state.defeated) {
      this.state.defeated = true;
      this.state.active = false;
      this.enterMode(BOSS_MODES.DEAD);
      const drop = this.lootSystem.createDrop({
        enemy: BOSS,
        zone: ZONES.BOSS,
        position: { x: 0, y: 0, z: 0 },
        ownerId: null
      });
      return { defeated: true, reward: drop.reward, lootBag: drop.lootBag, boss: this.snapshot() };
    }
    return { defeated: false, boss: this.snapshot() };
  }

  update(players) {
    const now = Date.now();
    if (!this.state.active || this.state.defeated) return [];
    const events = [];
    const alivePlayers = [...players.values()].filter((player) => player.zone === ZONES.BOSS && !isPlayerDead(player));
    if (alivePlayers.length === 0) {
      this.state.active = false;
      this.state.attack = null;
      this.state.currentTargetId = null;
      this.enterMode(BOSS_MODES.IDLE);
      return [{ type: "boss_reset", boss: this.snapshot() }];
    }

    this.recoverStaleState(now);

    if (this.state.attack && now - this.state.attack.startedAt > this.state.attack.durationMs) {
      this.state.attack = null;
      this.enterMode(BOSS_MODES.RECOVERY);
    }

    if (!this.state.attack && now >= this.state.nextAttackAt && this.state.mode === BOSS_MODES.RECOVERY) {
      this.enterMode(BOSS_MODES.CHOOSE_ATTACK);
    }

    if (!this.state.attack && now >= this.state.nextAttackAt) {
      const attack = this.createAttack(now, alivePlayers);
      this.state.attack = attack;
      this.state.nextAttackAt = now + attack.recastMs;
      this.state.currentTargetId = attack.targetId || this.chooseTarget(alivePlayers)?.id || null;
      this.enterMode(BOSS_MODES.WINDUP);
      events.push({ type: "boss_telegraph", attack });
    }

    if (this.state.attack && now >= this.state.attack.resolvesAt && !this.state.attack.resolved) {
      this.state.attack.resolved = true;
      this.enterMode(BOSS_MODES.ACTIVE_ATTACK);
      if (this.state.attack.type === "shadow_summon") {
        events.push({ type: "boss_summon", attack: this.state.attack, enemy: ENEMIES.shadow_slime });
      } else {
        const hits = [];
        for (const player of players.values()) {
          if (player.zone !== ZONES.BOSS || isPlayerDead(player)) continue;
          const hit = this.playerInAttack(player, this.state.attack);
          if (hit) {
            const rawDamage = Math.round(BOSS.damage * (this.state.attack.damageScale || 1));
            const damage = calculateIncomingDamage(rawDamage, player);
            player.health = Math.max(0, player.health - damage);
            if (this.state.attack.knockback) applyKnockback(player, this.state.attack.knockback);
            hits.push({ playerId: player.id, damage, health: player.health });
          }
        }
        events.push({ type: "boss_impact", attack: this.state.attack, hits });
      }
      this.enterMode(BOSS_MODES.RECOVERY);
    }
    return events;
  }

  createAttack(now, alivePlayers) {
    const attackTypes = this.state.phase === 1
      ? ["fire_cone", "tail_sweep", "wing_gust"]
      : ["fire_cone", "tail_sweep", "wing_gust", "shadow_slam", "shadow_summon"];
    const type = attackTypes[Math.floor(this.rng() * attackTypes.length)];
    const def = BOSS_ATTACKS[type];
    const target = type === "shadow_slam" ? this.chooseTarget(alivePlayers) : null;
    const summonPoints = type === "shadow_summon" ? createSummonPoints(this.rng) : null;
    const shape = target
      ? { ...def.shape, x: target.position.x, z: target.position.z }
      : summonPoints
        ? { ...def.shape, points: summonPoints }
        : { ...def.shape };
    return {
      type,
      name: def.name,
      startedAt: now,
      resolvesAt: now + def.delayMs,
      durationMs: def.delayMs + 1200,
      recastMs: def.recastMs,
      targetId: target?.id || null,
      damageScale: def.damageScale,
      knockback: def.knockback || 0,
      shape
    };
  }

  playerInAttack(player, attack) {
    const pos = player.position || { x: 0, z: 0 };
    if (attack.type === "fire_cone") {
      const dist = distance2d(pos, { x: 0, z: 0 });
      return pos.z > -7 && Math.abs(pos.x) < 10 && dist < 20;
    }
    if (attack.type === "tail_sweep") {
      const dist = distance2d(pos, { x: 0, z: 0 });
      return dist >= 6.5 && dist <= 13.5;
    }
    if (attack.type === "wing_gust") {
      return distance2d(pos, { x: 0, z: 0 }) <= attack.shape.radius;
    }
    if (attack.type === "shadow_slam") {
      return distance2d(pos, attack.shape) <= attack.shape.radius;
    }
    return false;
  }

  chooseTarget(players) {
    const eligible = players.filter((player) => player.zone === ZONES.BOSS && !isPlayerDead(player));
    if (!eligible.length) return null;
    const threatened = eligible
      .map((player) => ({ player, threat: this.state.threat.get(player.id) || 0 }))
      .sort((a, b) => b.threat - a.threat);
    if (threatened[0].threat > 0) return threatened[0].player;
    return pickTarget(eligible, this.rng);
  }

  enterMode(mode) {
    if (this.state.mode === mode) return;
    this.state.mode = mode;
    this.state.stateEnteredAt = Date.now();
  }

  recoverStaleState(now) {
    const maxDuration = BOSS_MODE_MAX_MS[this.state.mode] || 0;
    const staleByMode = maxDuration > 0 && now - (this.state.stateEnteredAt || now) > maxDuration;
    const staleByAttack = this.state.attack && now - this.state.attack.startedAt > 8000;
    if (!staleByMode && !staleByAttack) return;
    this.state.attack = null;
    this.state.currentTargetId = null;
    this.enterMode(BOSS_MODES.CHOOSE_ATTACK);
    this.state.nextAttackAt = now;
  }

  snapshot() {
    return {
      id: this.state.id,
      name: BOSS.name,
      health: this.state.health,
      maxHealth: this.state.maxHealth,
      phase: this.state.phase,
      active: this.state.active,
      defeated: this.state.defeated,
      mode: this.state.mode,
      attack: this.state.attack
    };
  }
}

function pickTarget(players, rng) {
  if (!players.length) return null;
  return players[Math.floor(rng() * players.length)] || players[0];
}

function createSummonPoints(rng) {
  return Array.from({ length: 3 }, () => {
    const angle = rng() * Math.PI * 2;
    const radius = 7 + rng() * 7;
    return { x: Math.cos(angle) * radius, z: Math.sin(angle) * radius };
  });
}

function applyKnockback(player, amount) {
  const pos = player.position || { x: 0, y: 0, z: 0 };
  const length = Math.max(0.001, Math.sqrt(pos.x * pos.x + pos.z * pos.z));
  pos.x += (pos.x / length) * amount;
  pos.z += (pos.z / length) * amount;
}
