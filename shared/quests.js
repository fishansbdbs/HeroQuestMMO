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
  }
};

export function getQuestList() {
  return Object.values(QUESTS);
}

export function createQuestProgress() {
  return Object.fromEntries(getQuestList().map((quest) => [quest.id, { current: 0, complete: false, claimed: false }]));
}

export function applyQuestKill(progress, enemy) {
  const next = structuredCloneSafe(progress || createQuestProgress());
  const completed = [];
  for (const quest of getQuestList()) {
    const entry = next[quest.id] || { current: 0, complete: false, claimed: false };
    if (!entry.complete) {
      const matchesFamily = quest.targetFamily && quest.targetFamily === enemy.family;
      const matchesEnemy = quest.targetEnemyId && quest.targetEnemyId === enemy.id;
      if (matchesFamily || matchesEnemy) {
        entry.current = Math.min(quest.required, entry.current + 1);
        entry.complete = entry.current >= quest.required;
        if (entry.complete) completed.push(quest);
      }
    }
    next[quest.id] = entry;
  }
  return { progress: next, completed };
}

function structuredCloneSafe(value) {
  return JSON.parse(JSON.stringify(value));
}
