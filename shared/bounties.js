import { V22_BOUNTIES } from "./expansionV22.js";

export const BOUNTY_ROTATION_DAYS = 3;

export const BOUNTIES = [
  {
    id: "frostveil_slime_hunt",
    title: "Thin the Frost Slimes",
    type: "hunt_enemy",
    target: "frost_slime",
    required: 8,
    zone: "Frostveil Reach",
    reward: { xp: 180, coins: 90, items: [{ itemId: "ice_shard", quantity: 2 }] }
  },
  {
    id: "defend_frost_ward_bounty",
    title: "Keep the Ward Burning",
    type: "complete_event",
    target: "defend_frost_ward",
    required: 1,
    zone: "Frostveil Reach",
    reward: { xp: 220, coins: 110, items: [{ itemId: "ice_shard", quantity: 3 }] }
  },
  {
    id: "vault_colossus_bounty",
    title: "Silence the Runebound Colossus",
    type: "defeat_boss",
    target: "runebound_colossus",
    required: 1,
    zone: "Frostbound Vault",
    reward: { xp: 420, coins: 180, items: [{ itemId: "runic_core", quantity: 1 }] }
  },
  {
    id: "elite_icebreaker",
    title: "Break Elite Patrols",
    type: "defeat_elite",
    target: "any",
    required: 2,
    zone: "Frostveil Reach",
    reward: { xp: 260, coins: 120, items: [{ itemId: "runic_core", quantity: 1 }] }
  },
  ...V22_BOUNTIES
];

export function activeBountyDefinitions(now = Date.now()) {
  const day = Math.floor(now / 86400000);
  const offset = Math.floor(day / BOUNTY_ROTATION_DAYS) % BOUNTIES.length;
  return [0, 1, 2].map((index) => BOUNTIES[(offset + index) % BOUNTIES.length]);
}

export function createBountyState(source = {}, now = Date.now()) {
  const existing = source && typeof source === "object" ? source : {};
  const progress = existing.progress && typeof existing.progress === "object" ? existing.progress : {};
  return {
    active: activeBountyDefinitions(now).map((bounty) => ({
      id: bounty.id,
      progress: Math.max(0, Math.floor(Number(progress[bounty.id]) || 0)),
      required: bounty.required
    })),
    progress: { ...progress },
    completed: uniqueStrings(existing.completed),
    claimed: uniqueStrings(existing.claimed),
    rotationStartedAt: rotationStart(now)
  };
}

export function recordBountyProgress(player, event, now = Date.now()) {
  const bounties = createBountyState(player?.bounties, now);
  const completed = new Set(bounties.completed);
  const rewards = [];

  for (const bounty of activeBountyDefinitions(now)) {
    if (completed.has(bounty.id) || bounties.claimed.includes(bounty.id)) continue;
    if (!eventMatchesBounty(event, bounty)) continue;
    const current = Math.max(0, Math.floor(Number(bounties.progress[bounty.id]) || 0));
    const next = Math.min(bounty.required, current + 1);
    bounties.progress[bounty.id] = next;
    if (next >= bounty.required) {
      completed.add(bounty.id);
      rewards.push(bounty);
    }
  }

  bounties.completed = [...completed];
  bounties.active = activeBountyDefinitions(now).map((bounty) => ({
    id: bounty.id,
    progress: Math.max(0, Math.floor(Number(bounties.progress[bounty.id]) || 0)),
    required: bounty.required
  }));
  return { player: { ...player, bounties }, rewards };
}

export function claimBountyReward(player, bountyId) {
  const bounties = createBountyState(player?.bounties);
  const bounty = BOUNTIES.find((entry) => entry.id === bountyId);
  if (!bounty) return { ok: false, reason: "bounty" };
  if (!bounties.completed.includes(bountyId)) return { ok: false, reason: "incomplete" };
  if (bounties.claimed.includes(bountyId)) return { ok: false, reason: "claimed" };
  return {
    ok: true,
    bounty,
    player: {
      ...player,
      bounties: {
        ...bounties,
        claimed: [...bounties.claimed, bountyId]
      }
    }
  };
}

function eventMatchesBounty(event, bounty) {
  if (!event || !bounty) return false;
  if (bounty.type === "hunt_enemy") return event.type === "kill" && event.enemyId === bounty.target;
  if (bounty.type === "defeat_elite") return event.type === "kill" && Boolean(event.elite);
  if (bounty.type === "defeat_boss") return event.type === "boss" && event.bossId === bounty.target;
  if (bounty.type === "complete_event") return event.type === "event" && event.eventId === bounty.target;
  if (bounty.type === "clear_dungeon") return event.type === "dungeon_clear" && event.dungeonId === bounty.target;
  if (bounty.type === "collect_material") return event.type === "collect" && event.itemId === bounty.target;
  return false;
}

function rotationStart(now) {
  const day = Math.floor(now / 86400000);
  return (day - (day % BOUNTY_ROTATION_DAYS)) * 86400000;
}

function uniqueStrings(value) {
  if (!Array.isArray(value)) return [];
  return [...new Set(value.filter((entry) => typeof entry === "string"))];
}
