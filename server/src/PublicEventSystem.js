import { ZONES } from "../../shared/constants.js";
import { distance2d } from "../../shared/combat.js";

const FROST_WARD_EVENT_ID = "defend_frost_ward";
const FROST_WARDS = [
  { id: "frost_ward", label: "Frost Ward", position: { x: 8, y: 0, z: -8 } },
  { id: "north_ward", label: "North Ward", position: { x: -18, y: 0, z: -22 } },
  { id: "east_ward", label: "East Ward", position: { x: 24, y: 0, z: 10 } }
];
const EVENT_RADIUS = 22;
const EVENT_INTERACTION_RADIUS = 5;
const EVENT_START_DELAY_MS = 5000;
const EVENT_DURATION_MS = 90000;
const EVENT_COOLDOWN_MS = 180000;
const FROST_WARD_WAVES = [
  ["frost_slime", "ice_goblin"],
  ["snow_wolf", "frost_wisp"],
  ["ice_golem", "frozen_knight", "frost_wisp"]
];

export class PublicEventSystem {
  constructor({ enemySystem, rng = Math.random } = {}) {
    this.enemySystem = enemySystem;
    this.rng = rng;
    this.nextInstanceId = 1;
    this.state = {
      eventId: FROST_WARD_EVENT_ID,
      eventInstanceId: null,
      wardId: null,
      wardLabel: null,
      wardPosition: null,
      zone: ZONES.FROSTVEIL,
      phase: "inactive",
      active: false,
      startedAt: 0,
      startsAt: 0,
      endsAt: 0,
      nextAvailableAt: 0,
      participants: new Set(),
      wave: 0,
      currentWaveEnemyIds: new Set(),
      totalSpawned: 0
    };
  }

  update(players, now = Date.now()) {
    const events = [];
    if (this.state.phase === "starting") {
      if (now < this.state.startsAt) return events;
      this.beginActiveWave();
      events.push(this.createStartedEvent());
      events.push(this.createWaveEvent());
      return events;
    }

    if (this.state.active) {
      this.removeDefeatedEventEnemies();
      if (now >= this.state.endsAt) {
        this.reset(now);
        events.push({
          type: "public_event_failed",
          eventId: this.state.eventId,
          eventInstanceId: this.state.eventInstanceId,
          ...this.wardEventFields(),
          zone: this.state.zone
        });
        return events;
      }

      if (this.remainingEnemies() > 0) return events;
      if (this.state.wave >= FROST_WARD_WAVES.length) {
        this.complete(now);
        events.push({
          type: "public_event_completed",
          eventId: this.state.eventId,
          eventInstanceId: this.state.eventInstanceId,
          ...this.wardEventFields(),
          zone: this.state.zone,
          participants: [...this.state.participants]
        });
        return events;
      }

      this.spawnWave(this.state.wave + 1);
      events.push(this.createWaveEvent());
      return events;
    }

    if (this.state.phase === "cooldown" && now >= this.state.nextAvailableAt) {
      this.state.phase = "inactive";
      this.state.eventInstanceId = null;
      this.state.wardId = null;
      this.state.wardLabel = null;
      this.state.wardPosition = null;
      this.state.startedAt = 0;
      this.state.startsAt = 0;
      this.state.endsAt = 0;
      this.state.participants = new Set();
      this.state.wave = 0;
      this.state.totalSpawned = 0;
    }

    return events;
  }

  activate(player, players, now = Date.now(), wardId = null) {
    if (this.state.active || this.state.phase === "starting") return { ok: false, reason: "active" };
    if (now < this.state.nextAvailableAt) return { ok: false, reason: "cooldown", nextAvailableAt: this.state.nextAvailableAt };
    const ward = this.activatableWard(player, wardId);
    if (!ward) return { ok: false, reason: this.activationFailureReason(player, wardId) };

    const participants = this.eligibleParticipants(players, ward);
    if (!participants.some((entry) => entry.id === player.id)) participants.push(player);
    this.prepareStart(participants, ward, now);
    return { ok: true, events: [this.createStartingEvent()] };
  }

  activatableWard(player, requestedWardId = null) {
    if (!player || player.zone !== ZONES.FROSTVEIL || player.health <= 0) return null;
    const wards = requestedWardId ? FROST_WARDS.filter((ward) => ward.id === requestedWardId) : FROST_WARDS;
    let nearest = null;
    let nearestDistance = Infinity;
    for (const ward of wards) {
      const dist = distance2d(player.position || {}, ward.position);
      if (dist <= EVENT_INTERACTION_RADIUS && dist < nearestDistance) {
        nearest = ward;
        nearestDistance = dist;
      }
    }
    return nearest;
  }

  activationFailureReason(player, requestedWardId = null) {
    if (!player || player.health <= 0) return "dead";
    if (player.zone !== ZONES.FROSTVEIL) return "zone";
    if (requestedWardId && !FROST_WARDS.some((ward) => ward.id === requestedWardId)) return "ward";
    return "range";
  }

  eligibleParticipants(players, ward = this.currentWard()) {
    const center = ward?.position || this.currentWard().position;
    return [...players.values()].filter((player) => (
      player.zone === ZONES.FROSTVEIL &&
      player.health > 0 &&
      distance2d(player.position || {}, center) <= EVENT_RADIUS
    ));
  }

  currentWard() {
    if (!this.state.wardId) return FROST_WARDS[0];
    const fallback = FROST_WARDS.find((ward) => ward.id === this.state.wardId) || FROST_WARDS[0];
    return {
      id: this.state.wardId,
      label: this.state.wardLabel || fallback.label,
      position: this.state.wardPosition || fallback.position
    };
  }

  wardEventFields() {
    const ward = this.currentWard();
    return {
      wardId: ward.id,
      wardLabel: ward.label,
      wardPosition: { ...ward.position }
    };
  }

  createStartingEvent() {
    return {
      type: "public_event_starting",
      eventId: this.state.eventId,
      eventInstanceId: this.state.eventInstanceId,
      ...this.wardEventFields(),
      zone: this.state.zone,
      name: "Defend the Frost Ward",
      startsAt: this.state.startsAt,
      participants: [...this.state.participants]
    };
  }

  createStartedEvent() {
    return {
      type: "public_event_started",
      eventId: this.state.eventId,
      eventInstanceId: this.state.eventInstanceId,
      ...this.wardEventFields(),
      zone: this.state.zone,
      name: "Defend the Frost Ward",
      participants: [...this.state.participants]
    };
  }

  prepareStart(participants, ward, now = Date.now()) {
    this.state.phase = "starting";
    this.state.active = false;
    this.state.wardId = ward.id;
    this.state.wardLabel = ward.label;
    this.state.wardPosition = { ...ward.position };
    this.state.eventInstanceId = `${this.state.eventId}:${ward.id}:${now}:${this.nextInstanceId}`;
    this.nextInstanceId += 1;
    this.state.startedAt = now;
    this.state.startsAt = now + EVENT_START_DELAY_MS;
    this.state.endsAt = this.state.startsAt + EVENT_DURATION_MS;
    this.state.participants = new Set(participants.map((player) => player.id));
    this.state.wave = 0;
    this.state.currentWaveEnemyIds = new Set();
    this.state.totalSpawned = 0;
  }

  beginActiveWave() {
    this.state.phase = "active";
    this.state.active = true;
    this.spawnWave(1);
  }

  spawnWave(wave) {
    this.state.wave = Math.max(1, Math.min(FROST_WARD_WAVES.length, wave));
    this.state.currentWaveEnemyIds = new Set();
    const participantCount = Math.max(1, this.state.participants.size || 1);
    const waveSize = Math.min(6, 3 + participantCount);
    const enemyIds = FROST_WARD_WAVES[this.state.wave - 1] || FROST_WARD_WAVES[0];
    const center = this.currentWard().position;
    for (let i = 0; i < waveSize; i += 1) {
      const angle = (i / waveSize) * Math.PI * 2;
      const radius = 6 + this.rng() * 4;
      const enemyId = this.state.wave === 3 && i === 0 ? "ice_golem" : enemyIds[i % enemyIds.length];
      const enemy = this.enemySystem.spawnEnemy(enemyId, {
        x: center.x + Math.cos(angle) * radius,
        y: 0,
        z: center.z + Math.sin(angle) * radius
      }, ZONES.FROSTVEIL, {
        eventId: this.state.eventId,
        eventInstanceId: this.state.eventInstanceId,
        wardId: this.state.wardId,
        eliteModifier: this.state.wave === 3 && enemyId === "ice_golem" ? "chilling" : null
      });
      this.state.currentWaveEnemyIds.add(enemy.id);
      this.state.totalSpawned += 1;
    }
  }

  removeDefeatedEventEnemies() {
    for (const [id, enemy] of this.enemySystem.enemies.entries()) {
      if (enemy.eventId === this.state.eventId && enemy.health <= 0) {
        this.enemySystem.enemies.delete(id);
      }
    }
  }

  remainingEnemies() {
    let remaining = 0;
    for (const enemyId of this.state.currentWaveEnemyIds) {
      const enemy = this.enemySystem.enemies.get(enemyId);
      if (enemy?.eventId === this.state.eventId && enemy.health > 0) remaining += 1;
    }
    return remaining;
  }

  createWaveEvent() {
    return {
      type: "public_event_wave",
      eventId: this.state.eventId,
      eventInstanceId: this.state.eventInstanceId,
      ...this.wardEventFields(),
      zone: this.state.zone,
      wave: this.state.wave,
      totalWaves: FROST_WARD_WAVES.length,
      remaining: this.remainingEnemies()
    };
  }

  complete(now) {
    this.state.phase = "cooldown";
    this.state.active = false;
    this.state.nextAvailableAt = now + EVENT_COOLDOWN_MS;
    this.state.currentWaveEnemyIds = new Set();
  }

  reset(now) {
    this.state.phase = "cooldown";
    this.state.active = false;
    this.state.nextAvailableAt = now + EVENT_COOLDOWN_MS;
    this.state.currentWaveEnemyIds = new Set();
  }

  snapshot(zone) {
    if (zone !== ZONES.FROSTVEIL) return null;
    return {
      eventId: this.state.eventId,
      eventInstanceId: this.state.eventInstanceId,
      ...this.wardEventFields(),
      zone: this.state.zone,
      phase: this.state.phase,
      active: this.state.active,
      startsAt: this.state.startsAt,
      endsAt: this.state.endsAt,
      wave: this.state.wave,
      totalWaves: FROST_WARD_WAVES.length,
      remaining: this.remainingEnemies(),
      totalSpawned: this.state.totalSpawned,
      participants: [...this.state.participants]
    };
  }
}
