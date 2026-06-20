import { FIELD_SPAWNS, ENEMIES, getEnemy } from "../../shared/enemies.js";
import { ZONES } from "../../shared/constants.js";
import { distance2d, calculateIncomingDamage } from "../../shared/combat.js";
import { LootSystem } from "./LootSystem.js";

export class EnemySystem {
  constructor({ lootSystem = new LootSystem(), rng = Math.random } = {}) {
    this.lootSystem = lootSystem;
    this.rng = rng;
    this.enemies = new Map();
    this.nextId = 1;
    this.spawnField();
  }

  spawnField() {
    this.enemies.clear();
    for (const spawn of FIELD_SPAWNS) {
      for (let i = 0; i < spawn.count; i += 1) {
        const angle = this.rng() * Math.PI * 2;
        const radius = this.rng() * spawn.radius;
        this.spawnEnemy(spawn.enemyId, {
          x: spawn.center[0] + Math.cos(angle) * radius,
          y: 0,
          z: spawn.center[2] + Math.sin(angle) * radius
        });
      }
    }
  }

  spawnEnemy(enemyId, position, zone = ZONES.FIELD) {
    const enemy = getEnemy(enemyId);
    if (!enemy) throw new Error(`Unknown enemy id: ${enemyId}`);
    const instance = {
      id: `enemy_${this.nextId++}`,
      enemyId,
      zone,
      position,
      home: { ...position },
      health: enemy.maxHealth,
      maxHealth: enemy.maxHealth,
      targetId: null,
      lastAttackAt: 0,
      respawnAt: 0
    };
    this.enemies.set(instance.id, instance);
    return instance;
  }

  getZoneEnemies(zone) {
    return [...this.enemies.values()].filter((enemy) => enemy.zone === zone && enemy.health > 0);
  }

  damageEnemy({ zone, enemyInstanceId, damage, attackerId }) {
    const instance = this.enemies.get(enemyInstanceId);
    if (!instance || instance.zone !== zone || instance.health <= 0) {
      return { hit: false, defeated: false };
    }
    const enemyDef = getEnemy(instance.enemyId);
    instance.health = Math.max(0, instance.health - Math.max(1, Math.round(damage)));
    if (instance.health > 0) {
      return { hit: true, defeated: false, enemy: instance, enemyDef };
    }

    instance.respawnAt = Date.now() + (enemyDef.id === "stone_golem" ? 45000 : 14000);
    const drop = this.lootSystem.createDrop({
      enemy: enemyDef,
      zone,
      position: instance.position,
      ownerId: attackerId
    });
    return {
      hit: true,
      defeated: true,
      enemy: instance,
      enemyDef,
      reward: drop.reward,
      lootBag: drop.lootBag
    };
  }

  update(players, dtMs) {
    const now = Date.now();
    for (const instance of this.enemies.values()) {
      const enemyDef = getEnemy(instance.enemyId);
      if (instance.health <= 0) {
        if (now >= instance.respawnAt) {
          instance.health = enemyDef.maxHealth;
          instance.position = { ...instance.home };
        }
        continue;
      }

      const candidates = [...players.values()].filter((player) => player.zone === instance.zone && player.health > 0);
      let nearest = null;
      let nearestDistance = Infinity;
      for (const player of candidates) {
        const dist = distance2d(instance.position, player.position);
        if (dist < nearestDistance) {
          nearest = player;
          nearestDistance = dist;
        }
      }
      if (!nearest || nearestDistance > 18) {
        driftHome(instance, enemyDef.speed * 0.35, dtMs);
        continue;
      }

      if (nearestDistance > enemyDef.attackRange) {
        moveToward(instance.position, nearest.position, enemyDef.speed, dtMs);
      } else if (now - instance.lastAttackAt >= enemyDef.attackCooldownMs) {
        instance.lastAttackAt = now;
        nearest.health = Math.max(0, nearest.health - calculateIncomingDamage(enemyDef.damage, nearest));
      }
    }
  }

  snapshot(zone) {
    return this.getZoneEnemies(zone).map((enemy) => ({
      id: enemy.id,
      enemyId: enemy.enemyId,
      zone: enemy.zone,
      position: enemy.position,
      health: enemy.health,
      maxHealth: enemy.maxHealth
    }));
  }
}

function moveToward(position, target, speed, dtMs) {
  const dx = target.x - position.x;
  const dz = target.z - position.z;
  const length = Math.max(0.001, Math.sqrt(dx * dx + dz * dz));
  const step = speed * (dtMs / 1000);
  position.x += (dx / length) * step;
  position.z += (dz / length) * step;
}

function driftHome(instance, speed, dtMs) {
  if (distance2d(instance.position, instance.home) > 1.2) {
    moveToward(instance.position, instance.home, speed, dtMs);
  }
}

export { ENEMIES };
