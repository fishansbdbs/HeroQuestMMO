export const QUESTS = {
  slime_trouble: {
    id: "slime_trouble",
    name: "Slime Trouble",
    description: "Defeat 5 slimes in Greenvale Outskirts.",
    targetFamily: "slime",
    required: 5,
    reward: { coins: 50, xp: 50 }
  },
  goblin_patrol: {
    id: "goblin_patrol",
    name: "Goblin Patrol",
    description: "Defeat 3 goblins near the old path.",
    targetFamily: "goblin",
    required: 3,
    reward: { coins: 80, xp: 80 }
  },
  first_hunt: {
    id: "first_hunt",
    name: "First Hunt",
    description: "Defeat 2 wolves.",
    targetFamily: "wolf",
    required: 2,
    reward: { coins: 65, xp: 70, itemId: "wolf_fang_blade" }
  },
  stone_in_the_woods: {
    id: "stone_in_the_woods",
    name: "Stone in the Woods",
    description: "Defeat the Stone Golem.",
    targetEnemyId: "stone_golem",
    required: 1,
    reward: { coins: 150, xp: 150 }
  },
  shadow_at_the_peak: {
    id: "shadow_at_the_peak",
    name: "Shadow at the Peak",
    description: "Defeat the Shadow Wyrm.",
    targetEnemyId: "shadow_wyrm",
    required: 1,
    reward: { coins: 260, xp: 300, title: "Wyrm-Touched" }
  },
  frozen_road: {
    id: "frozen_road",
    name: "The Frozen Road",
    description: "Enter Frostveil Reach and secure the camp waypoint.",
    targetEventId: "enter_frostveil",
    required: 1,
    reward: { coins: 80, xp: 100 }
  },
  cold_blooded: {
    id: "cold_blooded",
    name: "Cold Blooded",
    description: "Defeat 5 Frost Slimes and 3 Ice Goblins.",
    targets: [
      { enemyId: "frost_slime", required: 5 },
      { enemyId: "ice_goblin", required: 3 }
    ],
    required: 8,
    reward: { coins: 120, xp: 150 }
  },
  howling_white: {
    id: "howling_white",
    name: "Howling White",
    description: "Defeat 3 Snow Wolves.",
    targetEnemyId: "snow_wolf",
    required: 3,
    reward: { coins: 110, xp: 130 }
  },
  shattered_ward: {
    id: "shattered_ward",
    name: "Shattered Ward",
    description: "Activate three frozen ward crystals in Frostveil Reach.",
    targetEventId: "activate_frost_ward",
    required: 3,
    reward: { coins: 140, xp: 170, itemId: "ice_shard" }
  },
  heart_of_the_blizzard: {
    id: "heart_of_the_blizzard",
    name: "Heart of the Blizzard",
    description: "Defeat an Ice Golem elite.",
    targetEnemyId: "ice_golem",
    required: 1,
    reward: { coins: 180, xp: 220 }
  },
  palace_of_zero: {
    id: "palace_of_zero",
    name: "Palace of Zero",
    description: "Enter the Palace of Zero.",
    targetEventId: "enter_palace",
    required: 1,
    reward: { coins: 220, xp: 260 }
  },
  icezero: {
    id: "icezero",
    name: "IceZero",
    description: "Defeat Zero, the Ice Mage.",
    targetEnemyId: "zero_ice_mage",
    required: 1,
    reward: { coins: 420, xp: 520, title: "Icebreaker" }
  }
};

export function getQuestList() {
  return Object.values(QUESTS);
}

export function createQuestProgress() {
  return Object.fromEntries(getQuestList().map((quest) => [quest.id, createQuestEntry(quest)]));
}

export function applyQuestKill(progress, enemy) {
  const next = normalizeQuestProgress(progress);
  const completed = [];
  for (const quest of getQuestList()) {
    const entry = normalizeQuestEntry(quest, next[quest.id]);
    if (!entry.complete && applyKillToQuestEntry(entry, quest, enemy)) {
      if (entry.complete) completed.push(quest);
    }
    next[quest.id] = entry;
  }
  return { progress: next, completed };
}

export function applyQuestEvent(progress, eventId) {
  const next = normalizeQuestProgress(progress);
  const completed = [];
  for (const quest of getQuestList()) {
    const entry = normalizeQuestEntry(quest, next[quest.id]);
    if (!entry.complete && quest.targetEventId === eventId) {
      entry.current = Math.min(quest.required, entry.current + 1);
      entry.complete = entry.current >= quest.required;
      if (entry.complete) completed.push(quest);
    }
    next[quest.id] = entry;
  }
  return { progress: next, completed };
}

export function normalizeQuestProgress(progress) {
  const source = structuredCloneSafe(progress || {});
  return Object.fromEntries(getQuestList().map((quest) => [quest.id, normalizeQuestEntry(quest, source[quest.id])]));
}

function createQuestEntry(quest) {
  if (Array.isArray(quest.targets)) {
    return {
      current: 0,
      required: quest.required,
      complete: false,
      claimed: false,
      targets: Object.fromEntries(quest.targets.map((target) => [target.enemyId || target.family, { current: 0, required: target.required }]))
    };
  }
  return { current: 0, complete: false, claimed: false };
}

function normalizeQuestEntry(quest, entry = null) {
  const fallback = createQuestEntry(quest);
  if (!entry || typeof entry !== "object") return fallback;
  if (!Array.isArray(quest.targets)) {
    return {
      current: Math.min(quest.required, Math.max(0, Math.floor(Number(entry.current) || 0))),
      complete: Boolean(entry.complete),
      claimed: Boolean(entry.claimed)
    };
  }
  const targets = { ...fallback.targets };
  for (const [id, target] of Object.entries(entry.targets || {})) {
    if (!targets[id]) continue;
    targets[id] = {
      current: Math.min(targets[id].required, Math.max(0, Math.floor(Number(target.current) || 0))),
      required: targets[id].required
    };
  }
  const current = Object.values(targets).reduce((total, target) => total + target.current, 0);
  const complete = Object.values(targets).every((target) => target.current >= target.required);
  return { current, required: quest.required, complete: Boolean(entry.complete) || complete, claimed: Boolean(entry.claimed), targets };
}

function applyKillToQuestEntry(entry, quest, enemy) {
  if (Array.isArray(quest.targets)) {
    let matched = false;
    for (const target of quest.targets) {
      const key = target.enemyId || target.family;
      const matchesEnemy = target.enemyId && target.enemyId === enemy.id;
      const matchesFamily = target.family && target.family === enemy.family;
      if (!matchesEnemy && !matchesFamily) continue;
      const targetEntry = entry.targets[key];
      targetEntry.current = Math.min(targetEntry.required, targetEntry.current + 1);
      matched = true;
    }
    if (!matched) return false;
    entry.current = Object.values(entry.targets).reduce((total, target) => total + target.current, 0);
    entry.complete = Object.values(entry.targets).every((target) => target.current >= target.required);
    return true;
  }

  const matchesFamily = quest.targetFamily && quest.targetFamily === enemy.family;
  const matchesEnemy = quest.targetEnemyId && quest.targetEnemyId === enemy.id;
  if (!matchesFamily && !matchesEnemy) return false;
  entry.current = Math.min(quest.required, entry.current + 1);
  entry.complete = entry.current >= quest.required;
  return true;
}

function structuredCloneSafe(value) {
  return JSON.parse(JSON.stringify(value));
}
