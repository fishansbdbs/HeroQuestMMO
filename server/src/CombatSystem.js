import { ABILITIES } from "../../shared/abilities.js";
import { PLAYER_LIMITS } from "../../shared/constants.js";
import { calculatePlayerDamage, distance2d } from "../../shared/combat.js";

export class CombatSystem {
  constructor({ enemySystem, bossSystem, rng = Math.random }) {
    this.enemySystem = enemySystem;
    this.bossSystem = bossSystem;
    this.rng = rng;
  }

  attack(player, targetId) {
    const now = Date.now();
    if (now - player.lastAttackAt < PLAYER_LIMITS.attackCooldownMs) {
      return { ok: false, reason: "cooldown" };
    }
    player.lastAttackAt = now;

    if (targetId === "shadow_wyrm") {
      const dist = distance2d(player.position, { x: 0, z: 0 });
      if (player.zone !== "boss" || dist > 8) return { ok: false, reason: "range" };
      return { ok: true, boss: this.bossSystem.damage(calculatePlayerDamage(player, this.rng), player.id) };
    }

    const enemy = this.enemySystem.enemies.get(targetId);
    if (!enemy || enemy.zone !== player.zone || distance2d(player.position, enemy.position) > PLAYER_LIMITS.meleeRange) {
      return { ok: false, reason: "range" };
    }
    const damage = calculatePlayerDamage(player, this.rng);
    return { ok: true, damage, result: this.enemySystem.damageEnemy({ zone: player.zone, enemyInstanceId: targetId, damage, attackerId: player.id }) };
  }

  ability(player) {
    const ability = ABILITIES.hero_pulse;
    const now = Date.now();
    if (now - player.lastAbilityAt < ability.cooldownMs) {
      return { ok: false, reason: "cooldown" };
    }
    player.lastAbilityAt = now;
    const damage = Math.max(4, Math.round(calculatePlayerDamage(player, this.rng) * ability.damageScale));
    const hits = [];
    for (const enemy of this.enemySystem.getZoneEnemies(player.zone)) {
      if (distance2d(player.position, enemy.position) <= ability.radius) {
        hits.push(this.enemySystem.damageEnemy({ zone: player.zone, enemyInstanceId: enemy.id, damage, attackerId: player.id }));
      }
    }
    if (player.zone === "boss" && distance2d(player.position, { x: 0, z: 0 }) <= ability.radius + 3) {
      hits.push({ boss: this.bossSystem.damage(damage, player.id) });
    }
    return { ok: true, damage, hits };
  }
}
