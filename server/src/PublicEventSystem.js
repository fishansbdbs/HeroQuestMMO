import { ZONES } from "../../shared/constants.js";
import { distance2d } from "../../shared/combat.js";

const FROST_WARD_EVENT_ID = "defend_frost_ward";
const FROST_WARD_CENTER = { x: 8, y: 0, z: -8 };
const EVENT_RADIUS = 22;
const EVENT_DURATION_MS = 90000;
const EVENT_COOLDOWN_MS = 180000;

export class PublicEventSystem {
  constructor({ enemySystem, rng = Math.random } = {}) {
    this.enemySystem = enemySystem;
    this.rng = rng;
    this.state = {
      eventId: FROST_WARD_EVENT_ID,
      zone: ZONES.FROSTVEIL,
      active: false,
      startedAt: 0,
      endsAt: 0,
      nextAvailableAt: 0,
      participants: new Set(),
      wave: 0
    };
  }

  update(players) {
    const now = Date.now();
    const events = [];
    if (this.state.active && now >= this.state.endsAt) {
      this.state.active = false;
      this.state.nextAvailableAt = now + EVENT_COOLDOWN_MS;
      events.push({ type: "public_event_completed", eventId: this.state.eventId, zone: this.state.zone });
      return events;
    }

    if (this.state.active || now < this.state.nextAvailableAt) return events;
    const participants = [...players.values()].filter((player) => (
      player.zone === ZONES.FROSTVEIL &&
      player.health > 0 &&
      distance2d(player.position || {}, FROST_WARD_CENTER) <= EVENT_RADIUS
    ));
    if (participants.length === 0) return events;

    this.start(participants, now);
    events.push({
      type: "public_event_started",
      eventId: this.state.eventId,
      zone: this.state.zone,
      name: "Defend the Frost Ward",
      participants: participants.map((player) => player.id)
    });
    events.push({ type: "public_event_wave", eventId: this.state.eventId, zone: this.state.zone, wave: this.state.wave });
    return events;
  }

  start(participants, now = Date.now()) {
    this.state.active = true;
    this.state.startedAt = now;
    this.state.endsAt = now + EVENT_DURATION_MS;
    this.state.participants = new Set(participants.map((player) => player.id));
    this.state.wave = 1;

    const waveSize = Math.min(6, 3 + participants.length);
    const enemyIds = ["frost_slime", "ice_goblin", "frost_wisp"];
    for (let i = 0; i < waveSize; i += 1) {
      const angle = (i / waveSize) * Math.PI * 2;
      const radius = 6 + this.rng() * 4;
      const enemyId = enemyIds[i % enemyIds.length];
      this.enemySystem.spawnEnemy(enemyId, {
        x: FROST_WARD_CENTER.x + Math.cos(angle) * radius,
        y: 0,
        z: FROST_WARD_CENTER.z + Math.sin(angle) * radius
      }, ZONES.FROSTVEIL, {
        eventId: this.state.eventId,
        eliteModifier: i === 0 ? "chilling" : null
      });
    }
  }

  snapshot(zone) {
    if (zone !== ZONES.FROSTVEIL) return null;
    return {
      eventId: this.state.eventId,
      zone: this.state.zone,
      active: this.state.active,
      endsAt: this.state.endsAt,
      wave: this.state.wave,
      participants: [...this.state.participants]
    };
  }
}
