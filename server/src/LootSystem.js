import { distance2d, isPlayerDead, rollLoot } from "../../shared/combat.js";

export class LootSystem {
  constructor(rng = Math.random) {
    this.rng = rng;
    this.lootBags = new Map();
    this.nextId = 1;
  }

  createDrop({ enemy, zone, position, ownerId = null }) {
    const reward = rollLoot(enemy, this.rng);
    const bag = {
      id: `loot_${this.nextId++}`,
      zone,
      position: { ...position, y: 0.25 },
      ownerId,
      coins: 0,
      xp: reward.xp,
      items: reward.items,
      createdAt: Date.now()
    };
    this.lootBags.set(bag.id, bag);
    return { reward, lootBag: bag };
  }

  claim(lootId, playerId) {
    const bag = this.lootBags.get(lootId);
    if (!bag) return null;
    if (bag.ownerId && bag.ownerId !== playerId) return null;
    this.lootBags.delete(lootId);
    return bag;
  }

  claimForPlayer({ lootId, player, range = 4 }) {
    const inspected = this.inspectForPlayer({ lootId, player, range });
    if (!inspected.ok) return inspected;
    const bag = inspected.bag;
    this.lootBags.delete(lootId);
    return { ok: true, bag };
  }

  inspectForPlayer({ lootId, player, range = 4 }) {
    const bag = this.lootBags.get(lootId);
    if (!player) return { ok: false, reason: "missing_player" };
    if (isPlayerDead(player)) return { ok: false, reason: "dead" };
    if (!bag) return { ok: false, reason: "missing" };
    if (bag.ownerId && bag.ownerId !== player.id) return { ok: false, reason: "owner" };
    if (bag.zone && bag.zone !== player.zone) return { ok: false, reason: "zone" };
    if (distance2d(player.position, bag.position) > range) return { ok: false, reason: "range" };
    return { ok: true, bag };
  }

  cleanup(maxAgeMs = 90000) {
    const now = Date.now();
    for (const [id, bag] of this.lootBags.entries()) {
      if (now - bag.createdAt > maxAgeMs) this.lootBags.delete(id);
    }
  }

  snapshot(zone = null) {
    return [...this.lootBags.values()].filter((bag) => !zone || bag.zone === zone);
  }
}
