import { BOSS, ENEMIES } from "../../shared/enemies.js";
import { ZONES } from "../../shared/constants.js";
import { distance2d, calculateIncomingDamage } from "../../shared/combat.js";
import { LootSystem } from "./LootSystem.js";

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
      attack: null,
      participants: new Set(),
      nextAttackAt: Date.now() + 4000
    };
  }

  start() {
    if (this.state.defeated) this.reset();
    this.state.active = true;
    this.state.nextAttackAt = Date.now() + 2400;
    return this.snapshot();
  }

  damage(amount, playerId) {
    this.start();
    this.state.participants.add(playerId);
    this.state.health = Math.max(0, this.state.health - Math.max(1, Math.round(amount)));
    if (this.state.health <= BOSS.maxHealth * 0.5) this.state.phase = 2;
    if (this.state.health <= 0 && !this.state.defeated) {
      this.state.defeated = true;
      this.state.active = false;
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
    if (now >= this.state.nextAttackAt) {
      const attacks = this.state.phase === 1 ? ["fire_cone", "tail_sweep", "wing_gust"] : ["fire_cone", "tail_sweep", "wing_gust", "shadow_summon"];
      const attackType = attacks[Math.floor(this.rng() * attacks.length)];
      this.state.attack = { type: attackType, startedAt: now, resolvesAt: now + 1100 };
      this.state.nextAttackAt = now + 4200;
      events.push({ type: "boss_telegraph", attack: this.state.attack });
    }

    if (this.state.attack && now >= this.state.attack.resolvesAt && !this.state.attack.resolved) {
      this.state.attack.resolved = true;
      if (this.state.attack.type === "shadow_summon") {
        events.push({ type: "boss_summon", enemy: ENEMIES.shadow_slime });
      } else {
        for (const player of players.values()) {
          if (player.zone !== ZONES.BOSS || player.health <= 0) continue;
          const dist = distance2d(player.position, { x: 0, z: 0 });
          const hit = this.state.attack.type === "fire_cone" ? player.position.z > -4 && dist < 18 : dist < 12;
          if (hit) {
            player.health = Math.max(0, player.health - calculateIncomingDamage(BOSS.damage, player));
          }
        }
      }
    }

    if (this.state.attack && now - this.state.attack.startedAt > 1900) {
      this.state.attack = null;
    }
    return events;
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
      attack: this.state.attack
    };
  }
}
