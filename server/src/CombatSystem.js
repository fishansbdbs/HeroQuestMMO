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

  ability(player, payload = {}, players = new Map()) {
    const abilityId = payload?.abilityId || "hero_pulse";
    const ability = ABILITIES[abilityId];
    const now = Date.now();
    if (!ability) {
      return { ok: false, reason: "ability" };
    }
    if (isPlayerDead(player)) {
      return { ok: false, reason: "dead" };
    }
    if (!(player.learnedAbilities || []).includes(ability.id)) {
      return { ok: false, reason: "not_learned" };
    }
    if (now - player.lastAbilityAt < ability.cooldownMs) {
      return { ok: false, reason: "cooldown" };
    }
    if (ability.id === "mend_ally" || ability.id === "healing_orb") {
      const target = resolveFriendlyTarget(player, payload?.targetId, players, ability.id === "healing_orb" ? 4 : ability.range || 15);
      if (!target.ok) return target;
      if ((target.player.health ?? 0) >= (target.player.maxHealth ?? 1)) return { ok: false, reason: "full" };
      const manaSpend = spendMana(player, ability.manaCost || 0);
      if (!manaSpend.ok) return { ok: false, reason: "mana" };
      Object.assign(player, manaSpend.player);
      player.lastAbilityAt = now;
      return applyFriendlyHeal(player, target.player, ability);
    }
    if (ability.id !== "hero_pulse") {
      return { ok: false, reason: "unsupported" };
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
    return { ok: true, abilityId: ability.id, damage, hits };
  }
}

function resolveFriendlyTarget(player, targetId, players, range) {
  const target = targetId ? players.get(targetId) : player;
  if (!target || isPlayerDead(target)) return { ok: false, reason: "target" };
  if (target.zone !== player.zone) return { ok: false, reason: "target" };
  if (target.id !== player.id && distance2d(player.position, target.position) > range) {
    return { ok: false, reason: "range" };
  }
  return { ok: true, player: target };
}

function applyFriendlyHeal(caster, target, ability) {
  const healingPower = Math.max(0, Number(caster.healingPower ?? caster.spellPower) || 0);
  const base = ability.id === "healing_orb" ? 24 : 32;
  const amount = Math.max(8, Math.round(base + healingPower * 0.8));
  const before = Math.max(0, Number(target.health) || 0);
  const maxHealth = Math.max(1, Number(target.maxHealth) || 1);
  target.health = Math.min(maxHealth, before + amount);
  const actual = Math.max(0, Math.round(target.health - before));
  caster.healingDone = Math.max(0, Number(caster.healingDone) || 0) + actual;
  return {
    ok: true,
    abilityId: ability.id,
    heals: [
      {
        playerId: target.id,
        amount: actual,
        health: target.health,
        maxHealth
      }
    ]
  };
}
