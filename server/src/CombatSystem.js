import { ABILITIES } from "../../shared/abilities.js";
import { PLAYER_LIMITS, ZONES } from "../../shared/constants.js";
import { ICE_MAGE_BOSS } from "../../shared/enemies.js";
import { calculatePlayerDamage, distance2d, isPlayerDead } from "../../shared/combat.js";
import { spendMana } from "../../shared/progression.js";

export class CombatSystem {
  constructor({ enemySystem, bossSystem, iceMageSystem = null, rng = Math.random }) {
    this.enemySystem = enemySystem;
    this.bossSystem = bossSystem;
    this.iceMageSystem = iceMageSystem;
    this.rng = rng;
  }

  attack(player, targetId, options = {}) {
    const now = Date.now();
    if (isPlayerDead(player)) {
      return { ok: false, reason: "dead" };
    }
    if (now - player.lastAttackAt < PLAYER_LIMITS.attackCooldownMs) {
      return { ok: false, reason: "cooldown" };
    }
    player.lastAttackAt = now;
    const kind = options.kind === "slash" ? "slash" : "auto";
    const damageScale = kind === "slash" ? ABILITIES.slash.damageScale : 1;

    if (targetId === "shadow_wyrm") {
      const dist = distance2d(player.position, { x: 0, z: 0 });
      if (player.zone !== ZONES.BOSS || dist > 8) return { ok: false, reason: "range" };
      const damage = Math.max(1, Math.round(calculatePlayerDamage(player, this.rng) * damageScale));
      return { ok: true, kind, damage, boss: this.bossSystem.damage(damage, player.id) };
    }

    if (targetId === ICE_MAGE_BOSS.id) {
      const dist = distance2d(player.position, { x: 0, z: 0 });
      if (!this.iceMageSystem || player.zone !== ZONES.PALACE || dist > 8) return { ok: false, reason: "range" };
      const damage = Math.max(1, Math.round(calculatePlayerDamage(player, this.rng) * damageScale));
      return { ok: true, kind, damage, iceMage: this.iceMageSystem.damage(damage, player.id) };
    }

    const enemy = this.enemySystem.enemies.get(targetId);
    if (!enemy || enemy.zone !== player.zone || distance2d(player.position, enemy.position) > PLAYER_LIMITS.meleeRange) {
      return { ok: false, reason: "range" };
    }
    const damage = Math.max(1, Math.round(calculatePlayerDamage(player, this.rng) * damageScale));
    return { ok: true, kind, damage, result: this.enemySystem.damageEnemy({ zone: player.zone, enemyInstanceId: targetId, damage, attackerId: player.id }) };
  }

  ability(player) {
    const ability = ABILITIES.hero_pulse;
    const now = Date.now();
    if (isPlayerDead(player)) {
      return { ok: false, reason: "dead" };
    }
    if (!(player.learnedAbilities || []).includes("hero_pulse")) {
      return { ok: false, reason: "not_learned" };
    }
    if (now - player.lastAbilityAt < ability.cooldownMs) {
      return { ok: false, reason: "cooldown" };
    }
    const manaSpend = spendMana(player, ability.manaCost || 0);
    if (!manaSpend.ok) return { ok: false, reason: "mana" };
    Object.assign(player, manaSpend.player);
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
    if (player.zone === ZONES.PALACE && this.iceMageSystem && distance2d(player.position, { x: 0, z: 0 }) <= ability.radius + 3) {
      hits.push({ iceMage: this.iceMageSystem.damage(damage, player.id) });
    }
    return { ok: true, damage, hits };
  }
}
