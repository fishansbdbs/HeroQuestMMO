import { ABILITIES } from "../../shared/abilities.js";
import { PLAYER_LIMITS, ZONES } from "../../shared/constants.js";
import { ICE_MAGE_BOSS } from "../../shared/enemies.js";
import { applyEquipment, calculatePlayerDamage, distance2d, isPlayerDead } from "../../shared/combat.js";
import { spendMana } from "../../shared/progression.js";

export class CombatSystem {
  constructor({ enemySystem, bossSystem, iceMageSystem = null, rng = Math.random }) {
    this.enemySystem = enemySystem;
    this.bossSystem = bossSystem;
    this.iceMageSystem = iceMageSystem;
    this.rng = rng;
    this.healingOrbs = new Map();
    this.nextHealingOrbId = 1;
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
    if (kind === "slash") {
      applyIceguardGuard(player, now);
      applyAshenCrownAura(player, ABILITIES.slash, now);
    }

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
    if (ability.id === "healing_orb") {
      const manaSpend = spendMana(player, ability.manaCost || 0);
      if (!manaSpend.ok) return { ok: false, reason: "mana" };
      Object.assign(player, manaSpend.player);
      player.lastAbilityAt = now;
      applyTideguardShield(player, ability, now);
      return {
        ok: true,
        abilityId: ability.id,
        healingOrb: this.createHealingOrb(player, ability, now)
      };
    }
    if (ability.id === "mend_ally") {
      const target = resolveFriendlyTarget(player, payload?.targetId, players, ability.range || 15);
      if (!target.ok) return target;
      if ((target.player.health ?? 0) >= (target.player.maxHealth ?? 1)) return { ok: false, reason: "full" };
      const manaSpend = spendMana(player, ability.manaCost || 0);
      if (!manaSpend.ok) return { ok: false, reason: "mana" };
      Object.assign(player, manaSpend.player);
      player.lastAbilityAt = now;
      applyTideguardShield(player, ability, now);
      const healResult = applyFriendlyHeal(player, target.player, ability);
      return {
        ...healResult,
        healingEffect: createHealingEffectPayload(ability.id, player, target.player, healResult.heals[0]?.amount || 0)
      };
    }
    if (ability.id === "static_renewal") {
      const manaSpend = spendMana(player, ability.manaCost || 0);
      if (!manaSpend.ok) return { ok: false, reason: "mana" };
      Object.assign(player, manaSpend.player);
      player.lastAbilityAt = now;
      applyStormguardSurge(player, ability, now);
      const heals = [];
      const affected = [];
      for (const target of players.values()) {
        if (!target || isPlayerDead(target) || target.zone !== player.zone) continue;
        if (distance2d(player.position, target.position) > (ability.radius || 6)) continue;
        const amount = Math.max(8, Math.round((ability.heal || 36) + (player.healingPower || player.spellPower || 0) * 0.45));
        heals.push(applyHealingToTarget(player, target, amount, ability.id));
        target.staticRenewalUntil = now + (ability.durationMs || 5200);
        target.staticRenewalSpeedBonus = ability.moveSpeedBonus || 0.08;
        affected.push(target.id);
      }
      return {
        ok: true,
        abilityId: ability.id,
        affected,
        heals,
        areaEffect: createAreaEffectPayload(ability.id, player.position, ability),
        healingEffect: createHealingEffectPayload(ability.id, player, player, heals.reduce((total, heal) => total + (heal.amount || 0), 0))
      };
    }
    if (ability.id === "fireball") {
      const target = resolveHostileEnemy(this.enemySystem, player, payload?.targetId, ability.range || PLAYER_LIMITS.abilityRange);
      if (!target.ok) return target;
      const manaSpend = spendMana(player, ability.manaCost || 0);
      if (!manaSpend.ok) return { ok: false, reason: "mana" };
      Object.assign(player, manaSpend.player);
      player.lastAbilityAt = now;
      const damage = calculateAbilityDamage(player, ability, this.rng);
      const result = this.enemySystem.damageEnemy({
        zone: player.zone,
        enemyInstanceId: target.enemy.id,
        damage,
        attackerId: player.id
      });
      const statusEffect = applyEnemyStatusEffect(target.enemy, createBurnStatusEffect(ability, now));
      return applyZeroBornRefund(player, ability, {
        ok: true,
        abilityId: ability.id,
        damage,
        result,
        statusEffect,
        projectile: createProjectilePayload(ability.id, player.position, target.enemy.position, target.enemy.id)
      });
    }
    if (ability.id === "water_blast") {
      const target = resolveHostileEnemy(this.enemySystem, player, payload?.targetId, ability.range || PLAYER_LIMITS.abilityRange);
      if (!target.ok) return target;
      const manaSpend = spendMana(player, ability.manaCost || 0);
      if (!manaSpend.ok) return { ok: false, reason: "mana" };
      Object.assign(player, manaSpend.player);
      player.lastAbilityAt = now;
      const damage = calculateAbilityDamage(player, ability, this.rng);
      const result = this.enemySystem.damageEnemy({
        zone: player.zone,
        enemyInstanceId: target.enemy.id,
        damage,
        attackerId: player.id
      });
      const statusEffect = applyEnemyStatusEffect(target.enemy, createSlowStatusEffect(ability, now));
      applyTideguardShield(player, ability, now);
      return applyZeroBornRefund(player, ability, {
        ok: true,
        abilityId: ability.id,
        damage,
        result,
        statusEffect,
        projectile: createProjectilePayload(ability.id, player.position, target.enemy.position, target.enemy.id, { knockback: ability.knockback || 0 })
      });
    }
    if (ability.id === "dark_punch") {
      const target = resolveHostileEnemy(this.enemySystem, player, payload?.targetId, ability.range || PLAYER_LIMITS.meleeRange);
      if (!target.ok) return target;
      const manaSpend = spendMana(player, ability.manaCost || 0);
      if (!manaSpend.ok) return { ok: false, reason: "mana" };
      Object.assign(player, manaSpend.player);
      player.lastAbilityAt = now;
      const damage = calculateAbilityDamage(player, ability, this.rng);
      const result = this.enemySystem.damageEnemy({
        zone: player.zone,
        enemyInstanceId: target.enemy.id,
        damage,
        attackerId: player.id
      });
      return {
        ok: true,
        abilityId: ability.id,
        damage,
        result,
        meleeEffect: createMeleeEffectPayload(ability.id, player.position, target.enemy.position, target.enemy.id)
      };
    }
    if (["ground_pound", "magma_breaker", "flame_wave", "thunder_leap"].includes(ability.id)) {
      const manaSpend = spendMana(player, ability.manaCost || 0);
      if (!manaSpend.ok) return { ok: false, reason: "mana" };
      Object.assign(player, manaSpend.player);
      player.lastAbilityAt = now;
      applyIceguardGuard(player, now);
      applyAshenCrownAura(player, ability, now);
      applyStormguardSurge(player, ability, now);
      const damage = calculateAbilityDamage(player, ability, this.rng);
      const hits = [];
      const hitIds = new Set();
      for (const enemy of this.enemySystem.getZoneEnemies(player.zone)) {
        if (!enemy?.id || hitIds.has(enemy.id)) continue;
        if (enemy.health <= 0 || distance2d(player.position, enemy.position) > ability.radius) continue;
        hitIds.add(enemy.id);
        hits.push(this.enemySystem.damageEnemy({
          zone: player.zone,
          enemyInstanceId: enemy.id,
          damage,
          attackerId: player.id
        }));
        if (ability.id === "flame_wave") applyEnemyStatusEffect(enemy, createBurnStatusEffect(ability, now));
      }
      return {
        ok: true,
        abilityId: ability.id,
        damage,
        hits,
        areaEffect: createAreaEffectPayload(ability.id, player.position, ability)
      };
    }
    if (ability.id === "whirlwind_cleave") {
      const manaSpend = spendMana(player, ability.manaCost || 0);
      if (!manaSpend.ok) return { ok: false, reason: "mana" };
      Object.assign(player, manaSpend.player);
      player.lastAbilityAt = now;
      applyIceguardGuard(player, now);
      const damage = calculateAbilityDamage(player, ability, this.rng);
      const hits = [];
      const hitIds = new Set();
      for (const enemy of this.enemySystem.getZoneEnemies(player.zone)) {
        if (!enemy?.id || hitIds.has(enemy.id)) continue;
        if (enemy.health <= 0 || distance2d(player.position, enemy.position) > ability.radius) continue;
        hitIds.add(enemy.id);
        hits.push(this.enemySystem.damageEnemy({
          zone: player.zone,
          enemyInstanceId: enemy.id,
          damage,
          attackerId: player.id
        }));
      }
      return {
        ok: true,
        abilityId: ability.id,
        damage,
        hits,
        areaEffect: createAreaEffectPayload(ability.id, player.position, ability)
      };
    }
    if (ability.id === "chain_frost" || ability.id === "storm_bolt") {
      const target = resolveHostileEnemy(this.enemySystem, player, payload?.targetId, ability.range || PLAYER_LIMITS.abilityRange);
      if (!target.ok) return target;
      const manaSpend = spendMana(player, ability.manaCost || 0);
      if (!manaSpend.ok) return { ok: false, reason: "mana" };
      Object.assign(player, manaSpend.player);
      player.lastAbilityAt = now;
      applyStormguardSurge(player, ability, now);
      const damage = calculateAbilityDamage(player, ability, this.rng);
      const targets = collectChainTargets(this.enemySystem, player.zone, target.enemy, ability);
      const hits = targets.map((enemy) => this.enemySystem.damageEnemy({
        zone: player.zone,
        enemyInstanceId: enemy.id,
        damage,
        attackerId: player.id
      }));
      return applyZeroBornRefund(player, ability, {
        ok: true,
        abilityId: ability.id,
        damage,
        hits,
        projectile: {
          type: ability.id,
          targetId: target.enemy.id,
          chainTargets: targets.map((enemy) => ({
            id: enemy.id,
            position: { x: enemy.position?.x || 0, y: (enemy.position?.y || 0) + 1, z: enemy.position?.z || 0 }
          })),
          from: { x: player.position?.x || 0, y: (player.position?.y || 0) + 1.2, z: player.position?.z || 0 },
          to: { x: target.enemy.position?.x || 0, y: (target.enemy.position?.y || 0) + 1, z: target.enemy.position?.z || 0 },
          travelMs: 300,
          impactEffect: ability.id === "storm_bolt" ? "storm_jump" : "frost_jump"
        }
      });
    }
    if (ability.id === "radiant_ward" || ability.id === "hearth_ward") {
      const manaSpend = spendMana(player, ability.manaCost || 0);
      if (!manaSpend.ok) return { ok: false, reason: "mana" };
      Object.assign(player, manaSpend.player);
      player.lastAbilityAt = now;
      const affected = [];
      for (const target of players.values()) {
        if (!target || isPlayerDead(target) || target.zone !== player.zone) continue;
        if (distance2d(player.position, target.position) > ability.radius) continue;
        target.radiantWardUntil = now + ability.durationMs;
        target.radiantWardReduction = ability.damageReduction;
        if (ability.fireResistance) target.fireResistance = Math.max(Number(target.fireResistance) || 0, ability.fireResistance);
        affected.push(target.id);
      }
      applyTideguardShield(player, ability, now);
      return {
        ok: true,
        abilityId: ability.id,
        affected,
        areaEffect: createAreaEffectPayload(ability.id, player.position, ability),
        healingEffect: {
          type: ability.id,
          casterId: player.id,
          targetId: player.id,
          from: { x: player.position?.x || 0, y: (player.position?.y || 0) + 1.2, z: player.position?.z || 0 },
          to: { x: player.position?.x || 0, y: (player.position?.y || 0) + 1.2, z: player.position?.z || 0 },
          beamMs: ability.durationMs,
          pulseEffect: ability.id,
          amount: 0
        }
      };
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

  createHealingOrb(caster, ability, now) {
    const id = `healing_orb_${caster.id}_${this.nextHealingOrbId++}`;
    const orb = {
      id,
      abilityId: ability.id,
      casterId: caster.id,
      zone: caster.zone,
      position: { x: caster.position?.x || 0, y: 0.55, z: caster.position?.z || 0 },
      radius: ability.pickupRadius || 3.2,
      amount: calculateHealingAmount(caster, ability),
      createdAt: now,
      expiresAt: now + (ability.durationMs || 10000)
    };
    this.healingOrbs.set(id, orb);
    return healingOrbSnapshot(orb);
  }

  consumeHealingOrb(player, orbId, players = new Map(), now = Date.now()) {
    if (!player) return { ok: false, reason: "missing_player" };
    const orb = this.healingOrbs.get(orbId);
    if (!orb) return { ok: false, reason: "missing" };
    if (now >= orb.expiresAt) {
      this.healingOrbs.delete(orb.id);
      return { ok: false, reason: "expired", healingOrb: { ...healingOrbSnapshot(orb), expired: true } };
    }
    if (isPlayerDead(player)) return { ok: false, reason: "dead" };
    if (player.zone !== orb.zone) return { ok: false, reason: "zone" };
    if (distance2d(player.position, orb.position) > orb.radius) return { ok: false, reason: "range" };
    if ((player.health ?? 0) >= (player.maxHealth ?? 1)) return { ok: false, reason: "full" };

    const caster = players.get(orb.casterId);
    const heal = applyHealingToTarget(caster, player, orb.amount, orb.abilityId);
    this.healingOrbs.delete(orb.id);
    return {
      ok: true,
      abilityId: orb.abilityId,
      healingOrb: { ...healingOrbSnapshot(orb), consumed: true },
      heals: [heal]
    };
  }

  expireHealingOrbs(now = Date.now()) {
    const expired = [];
    for (const orb of this.healingOrbs.values()) {
      if (now < orb.expiresAt) continue;
      this.healingOrbs.delete(orb.id);
      expired.push({ ...healingOrbSnapshot(orb), expired: true });
    }
    return expired;
  }

  snapshotHealingOrbs(zone, now = Date.now()) {
    this.expireHealingOrbs(now);
    return [...this.healingOrbs.values()]
      .filter((orb) => orb.zone === zone)
      .map(healingOrbSnapshot);
  }
}

function resolveHostileEnemy(enemySystem, player, targetId, range) {
  if (!targetId) return { ok: false, reason: "target" };
  const enemy = enemySystem?.enemies?.get(targetId);
  if (!enemy || enemy.health <= 0 || enemy.zone !== player.zone) return { ok: false, reason: "target" };
  if (distance2d(player.position, enemy.position) > range) return { ok: false, reason: "range" };
  return { ok: true, enemy };
}

function calculateAbilityDamage(player, ability, rng = Math.random) {
  const stats = applyEquipment(player);
  const base = calculatePlayerDamage(stats, rng);
  const scalingBonus = ability.scalingStat === "magic" ? stats.spellPower || 0 : stats.physicalPower || 0;
  return Math.max(1, Math.round((base + scalingBonus) * (ability.damageScale || 1)));
}

function createProjectilePayload(type, from, to, targetId, options = {}) {
  const isWaterBlast = type === "water_blast";
  const isStormBolt = type === "storm_bolt";
  const payload = {
    type,
    targetId,
    from: { x: from?.x || 0, y: (from?.y || 0) + 1.2, z: from?.z || 0 },
    to: { x: to?.x || 0, y: (to?.y || 0) + 1, z: to?.z || 0 },
    travelMs: isStormBolt ? 260 : isWaterBlast ? 360 : 420,
    impactEffect: type === "fireball" ? "burn" : isWaterBlast ? "splash" : isStormBolt ? "storm_jump" : "impact"
  };
  if (options.knockback) payload.knockback = options.knockback;
  return payload;
}

function createSlowStatusEffect(ability, now) {
  return {
    type: "slow",
    multiplier: ability.slowMultiplier ?? 0.55,
    expiresAt: now + (ability.slowDurationMs ?? 3500),
    sourceAbility: ability.id
  };
}

function createBurnStatusEffect(ability, now) {
  return {
    type: "burn",
    damagePerTick: Math.max(1, Math.round((ability.damageScale || 1) * 3)),
    expiresAt: now + 4000,
    sourceAbility: ability.id
  };
}

function applyEnemyStatusEffect(enemy, effect) {
  if (!enemy || !effect?.type) return null;
  enemy.statusEffects = {
    ...(enemy.statusEffects || {}),
    [effect.type]: effect
  };
  return enemy.statusEffects[effect.type];
}

function createAreaEffectPayload(type, origin, ability) {
  return {
    type,
    origin: { x: origin?.x || 0, y: origin?.y || 0, z: origin?.z || 0 },
    radius: ability.radius || PLAYER_LIMITS.abilityRange,
    knockback: ability.knockback || 0
  };
}

function createMeleeEffectPayload(type, from, to, targetId) {
  return {
    type,
    targetId,
    from: { x: from?.x || 0, y: (from?.y || 0) + 1.1, z: from?.z || 0 },
    to: { x: to?.x || 0, y: (to?.y || 0) + 1, z: to?.z || 0 },
    lungeMs: 220,
    impactEffect: type === "dark_punch" ? "dark_burst" : "impact"
  };
}

function createHealingEffectPayload(type, caster, target, amount) {
  return {
    type,
    casterId: caster.id,
    targetId: target.id,
    from: { x: caster.position?.x || 0, y: (caster.position?.y || 0) + 1.2, z: caster.position?.z || 0 },
    to: { x: target.position?.x || 0, y: (target.position?.y || 0) + 1.2, z: target.position?.z || 0 },
    beamMs: 420,
    pulseEffect: type === "mend_ally" ? "gold_heal" : "heal",
    amount
  };
}

function healingOrbSnapshot(orb) {
  return {
    id: orb.id,
    abilityId: orb.abilityId,
    casterId: orb.casterId,
    zone: orb.zone,
    position: { ...orb.position },
    radius: orb.radius,
    amount: orb.amount,
    createdAt: orb.createdAt,
    expiresAt: orb.expiresAt
  };
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

function calculateHealingAmount(caster, ability) {
  const healingPower = Math.max(0, Number(caster.healingPower ?? caster.spellPower) || 0);
  const base = ability.id === "healing_orb" ? 24 : 32;
  return Math.max(8, Math.round(base + healingPower * 0.8));
}

function applyHealingToTarget(caster, target, amount, sourceAbility) {
  const before = Math.max(0, Number(target.health) || 0);
  const maxHealth = Math.max(1, Number(target.maxHealth) || 1);
  target.health = Math.min(maxHealth, before + amount);
  const actual = Math.max(0, Math.round(target.health - before));
  if (caster) caster.healingDone = Math.max(0, Number(caster.healingDone) || 0) + actual;
  return {
    playerId: target.id,
    amount: actual,
    health: target.health,
    maxHealth,
    sourceAbility
  };
}

function applyFriendlyHeal(caster, target, ability) {
  const heal = applyHealingToTarget(caster, target, calculateHealingAmount(caster, ability), ability.id);
  if (caster?.setBonusEffects?.allyHealGuardMs && target?.id !== caster.id) {
    const now = Date.now();
    for (const player of [caster, target]) {
      player.radiantWardUntil = now + caster.setBonusEffects.allyHealGuardMs;
      player.radiantWardReduction = caster.setBonusEffects.allyHealGuardReduction || 0.18;
    }
  }
  return {
    ok: true,
    abilityId: ability.id,
    heals: [
      heal
    ]
  };
}

function applyIceguardGuard(player, now = Date.now()) {
  const effects = player?.setBonusEffects || {};
  if (!effects.physicalGuardMs) return;
  player.setGuardUntil = now + effects.physicalGuardMs;
  player.setGuardReduction = effects.physicalGuardReduction || 0.25;
}

function applyAshenCrownAura(player, ability, now = Date.now()) {
  const effects = player?.setBonusEffects || {};
  if (!effects.flameAuraMs || !["slash", "ground_pound", "whirlwind_cleave", "magma_breaker"].includes(ability.id)) return;
  if (now < (player.flameAuraCooldownUntil || 0)) return;
  player.flameAuraUntil = now + effects.flameAuraMs;
  player.flameAuraCooldownUntil = now + (effects.flameAuraCooldownMs || 9000);
}

function applyTideguardShield(player, ability, now = Date.now()) {
  const effects = player?.setBonusEffects || {};
  if (!effects.tideShieldMs || !["water_blast", "healing_orb", "mend_ally", "hearth_ward"].includes(ability.id)) return;
  player.radiantWardUntil = now + effects.tideShieldMs;
  player.radiantWardReduction = effects.tideShieldReduction || 0.16;
}

function applyStormguardSurge(player, ability, now = Date.now()) {
  const effects = player?.setBonusEffects || {};
  if (!effects.stormSurgeMs || !["thunder_leap", "storm_bolt", "static_renewal"].includes(ability.id)) return;
  player.stormSurgeUntil = now + effects.stormSurgeMs;
  player.stormSurgeSpeed = effects.stormSurgeSpeed || 0.08;
  player.lightningResistance = Math.max(Number(player.lightningResistance) || 0, effects.stormSurgeResistance || 12);
}

function applyZeroBornRefund(player, ability, result) {
  const effects = player?.setBonusEffects || {};
  if (!effects.spellCooldownRefundChance || !["fireball", "water_blast", "chain_frost", "storm_bolt"].includes(ability.id)) return result;
  if (Math.random() > effects.spellCooldownRefundChance) return result;
  const refundMs = Math.max(0, Number(effects.spellCooldownRefundMs) || 0);
  player.lastAbilityAt = Math.max(0, (player.lastAbilityAt || 0) - refundMs);
  return { ...result, cooldownRefundMs: refundMs };
}

function collectChainTargets(enemySystem, zone, firstEnemy, ability) {
  const maxTargets = Math.max(1, Number(ability.maxTargets) || 1);
  const jumpRange = Math.max(1, Number(ability.jumpRange) || 7);
  const selected = [];
  const used = new Set();
  let current = firstEnemy;
  while (current && selected.length < maxTargets) {
    selected.push(current);
    used.add(current.id);
    current = enemySystem.getZoneEnemies(zone)
      .filter((enemy) => !used.has(enemy.id) && enemy.health > 0 && distance2d(current.position, enemy.position) <= jumpRange)
      .sort((a, b) => distance2d(current.position, a.position) - distance2d(current.position, b.position))[0];
  }
  return selected;
}
