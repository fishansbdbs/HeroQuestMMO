import { ICE_MAGE_BOSS, ENEMIES } from "../../shared/enemies.js";
import { ZONES } from "../../shared/constants.js";
import { calculateIncomingDamage, distance2d, isPlayerDead } from "../../shared/combat.js";
import { LootSystem } from "./LootSystem.js";

const ICE_MAGE_ATTACKS = {
  ice_lance: {
    name: "Ice Lance",
    delayMs: 1300,
    recastMs: 3600,
    shape: { kind: "line", length: 32, width: 3 },
    damageScale: 1.25
  },
  frozen_circle: {
    name: "Frozen Circle",
    delayMs: 1400,
    recastMs: 3900,
    shape: { kind: "circle", radius: 4.6 },
    damageScale: 1.05
  },
  frost_bolt: {
    name: "Frost Bolt",
    delayMs: 900,
    recastMs: 2600,
    shape: { kind: "circle", radius: 2.8 },
    damageScale: 0.72
  },
  ice_wall: {
    name: "Ice Wall",
    delayMs: 1100,
    recastMs: 4300,
    shape: { kind: "walls" },
    damageScale: 0
  },
  blizzard_ring: {
    name: "Blizzard Ring",
    delayMs: 1450,
    recastMs: 4400,
    shape: { kind: "ring", x: 0, z: 0, innerRadius: 6, outerRadius: 15 },
    damageScale: 0.9
  },
  frozen_servants: {
    name: "Frozen Servants",
    delayMs: 1200,
    recastMs: 5200,
    shape: { kind: "summon", radius: 3.2 },
    damageScale: 0
  },
  zero_hour: {
    name: "Zero Hour",
    delayMs: 1650,
    recastMs: 5600,
    shape: { kind: "sequence" },
    damageScale: 1.2
  },
  shatter: {
    name: "Shatter",
    delayMs: 1350,
    recastMs: 4300,
    shape: { kind: "sequence" },
    damageScale: 1.05
  }
};

export class IceMageSystem {
  constructor({ lootSystem = new LootSystem(), rng = Math.random } = {}) {
    this.lootSystem = lootSystem;
    this.rng = rng;
    this.reset();
  }

  reset() {
    this.state = {
      id: ICE_MAGE_BOSS.id,
      health: ICE_MAGE_BOSS.maxHealth,
      maxHealth: ICE_MAGE_BOSS.maxHealth,
      phase: 1,
      active: false,
      defeated: false,
      attack: null,
      participants: new Set(),
      nextAttackAt: Date.now() + 4000
    };
  }

  start() {
    if (this.state.defeated) this.reset();
    this.state.active = true;
    this.state.nextAttackAt = Math.min(this.state.nextAttackAt, Date.now() + 2400);
    return this.snapshot();
  }

  damage(amount, playerId) {
    this.start();
    if (playerId) this.state.participants.add(playerId);
    this.state.health = Math.max(0, this.state.health - Math.max(1, Math.round(amount)));
    this.syncPhase();
    if (this.state.health <= 0 && !this.state.defeated) {
      this.state.defeated = true;
      this.state.active = false;
      this.state.attack = null;
      const drop = this.lootSystem.createDrop({
        enemy: ICE_MAGE_BOSS,
        zone: ZONES.PALACE,
        position: { x: 0, y: 0.25, z: 0 },
        ownerId: null
      });
      return { defeated: true, reward: drop.reward, lootBag: drop.lootBag, boss: this.snapshot(), iceMage: this.snapshot() };
    }
    return { defeated: false, boss: this.snapshot(), iceMage: this.snapshot() };
  }

  update(players) {
    const now = Date.now();
    if (!this.state.active || this.state.defeated) return [];
    const alivePlayers = [...players.values()].filter((player) => player.zone === ZONES.PALACE && !isPlayerDead(player));
    if (alivePlayers.length === 0) {
      this.state.active = false;
      this.state.attack = null;
      return [{ type: "ice_mage_reset", boss: this.snapshot(), iceMage: this.snapshot() }];
    }

    if (this.state.attack && now - this.state.attack.startedAt > this.state.attack.durationMs) {
      this.state.attack = null;
    }

    const events = [];
    if (!this.state.attack && now >= this.state.nextAttackAt) {
      const attack = this.createAttack(now, alivePlayers);
      this.state.attack = attack;
      this.state.nextAttackAt = now + attack.recastMs;
      events.push({ type: "ice_mage_telegraph", attack, iceMage: this.snapshot() });
    }

    if (this.state.attack && now >= this.state.attack.resolvesAt && !this.state.attack.resolved) {
      this.state.attack.resolved = true;
      if (this.state.attack.type === "frozen_servants") {
        events.push({ type: "ice_mage_summon", attack: this.state.attack, enemies: [ENEMIES.frost_wisp, ENEMIES.frozen_knight] });
      } else {
        const hits = [];
        for (const player of players.values()) {
          if (player.zone !== ZONES.PALACE || isPlayerDead(player)) continue;
          if (!this.playerInAttack(player, this.state.attack)) continue;
          const rawDamage = Math.round(ICE_MAGE_BOSS.damage * (this.state.attack.damageScale || 1));
          const damage = calculateIncomingDamage(rawDamage, player);
          player.health = Math.max(0, player.health - damage);
          hits.push({ playerId: player.id, damage, health: player.health });
        }
        events.push({ type: "ice_mage_impact", attack: this.state.attack, hits, iceMage: this.snapshot() });
      }
    }
    return events;
  }

  createAttack(now, alivePlayers) {
    const phaseOne = ["ice_lance", "frozen_circle", "frost_bolt"];
    const phaseTwo = [...phaseOne, "ice_wall", "blizzard_ring", "frozen_servants"];
    const phaseThree = [...phaseTwo, "zero_hour", "shatter"];
    const attackTypes = this.state.phase === 1 ? phaseOne : this.state.phase === 2 ? phaseTwo : phaseThree;
    const type = attackTypes[Math.floor(this.rng() * attackTypes.length)];
    const def = ICE_MAGE_ATTACKS[type];
    const target = pickTarget(alivePlayers, this.rng);
    const shape = createAttackShape(type, def.shape, target, this.rng);
    return {
      type,
      name: def.name,
      startedAt: now,
      resolvesAt: now + def.delayMs,
      durationMs: def.delayMs + 1300,
      recastMs: def.recastMs,
      targetId: target?.id || null,
      damageScale: def.damageScale,
      shape
    };
  }

  playerInAttack(player, attack) {
    const pos = player.position || { x: 0, z: 0 };
    const shape = attack.shape || {};
    if (shape.kind === "line") {
      return Math.abs(pos.x - (shape.x || 0)) <= (shape.width || 3) / 2 && pos.z >= -16 && pos.z <= 20;
    }
    if (shape.kind === "circle") {
      return distance2d(pos, shape) <= shape.radius;
    }
    if (shape.kind === "ring") {
      const dist = distance2d(pos, shape);
      return dist >= shape.innerRadius && dist <= shape.outerRadius;
    }
    if (shape.kind === "sequence") {
      return (shape.circles || []).some((circle) => distance2d(pos, circle) <= circle.radius) ||
        (shape.lines || []).some((line) => Math.abs(pos.x - line.x) <= line.width / 2 && pos.z >= line.zMin && pos.z <= line.zMax);
    }
    return false;
  }

  syncPhase() {
    if (this.state.health <= ICE_MAGE_BOSS.maxHealth * 0.3) this.state.phase = 3;
    else if (this.state.health <= ICE_MAGE_BOSS.maxHealth * 0.6) this.state.phase = 2;
    else this.state.phase = 1;
  }

  snapshot() {
    return {
      id: this.state.id,
      name: ICE_MAGE_BOSS.name,
      health: this.state.health,
      maxHealth: this.state.maxHealth,
      phase: this.state.phase,
      active: this.state.active,
      defeated: this.state.defeated,
      attack: this.state.attack
    };
  }
}

function pickTarget(players, rng) {
  if (!players.length) return null;
  return players[Math.floor(rng() * players.length)] || players[0];
}

function createAttackShape(type, baseShape, target, rng) {
  const targetPos = target?.position || { x: 0, z: 0 };
  if (type === "ice_lance") {
    return { ...baseShape, x: targetPos.x, z: 0 };
  }
  if (type === "frozen_circle" || type === "frost_bolt") {
    return { ...baseShape, x: targetPos.x, z: targetPos.z };
  }
  if (type === "ice_wall") {
    return {
      ...baseShape,
      walls: [
        { x: -8, z: -2, width: 2, length: 18 },
        { x: 8, z: -2, width: 2, length: 18 }
      ]
    };
  }
  if (type === "frozen_servants") {
    return {
      ...baseShape,
      points: [
        { x: -10, z: -6 },
        { x: 10, z: -6 }
      ]
    };
  }
  if (type === "zero_hour") {
    return {
      ...baseShape,
      lines: [
        { x: -9, zMin: -18, zMax: 18, width: 3 },
        { x: 9, zMin: -18, zMax: 18, width: 3 }
      ]
    };
  }
  if (type === "shatter") {
    return {
      ...baseShape,
      circles: Array.from({ length: 4 }, () => {
        const angle = rng() * Math.PI * 2;
        const radius = 5 + rng() * 10;
        return { x: Math.cos(angle) * radius, z: Math.sin(angle) * radius, radius: 3.2 };
      })
    };
  }
  return { ...baseShape };
}
