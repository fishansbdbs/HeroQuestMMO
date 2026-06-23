import { getItem } from "./items.js";

export const EQUIPMENT_SETS = {
  iceguard: {
    id: "iceguard",
    name: "Iceguard",
    role: "Strength / Defense",
    pieces: ["iceguard_helm", "iceguard_chestplate", "iceguard_gauntlets", "iceguard_boots"],
    bonuses: {
      2: { id: "iceguard_2", label: "2 pieces: +6 physical power and +4 defense.", stats: { attack: 6, defense: 4 } },
      4: { id: "iceguard_4", label: "4 pieces: Slash and Ground Pound grant a short guard.", effects: { physicalGuardMs: 2500, physicalGuardReduction: 0.25 } }
    }
  },
  zero_born: {
    id: "zero_born",
    name: "Zero-Born",
    role: "Magic / Mana",
    pieces: ["zero_born_crown", "zero_born_robe", "zero_born_gloves", "zero_born_boots"],
    bonuses: {
      2: { id: "zero_born_2", label: "2 pieces: +8 magic power and +10 max mana.", stats: { magicPower: 8, maxMana: 10 } },
      4: { id: "zero_born_4", label: "4 pieces: offensive spells can refund a small cooldown.", effects: { spellCooldownRefundChance: 0.25, spellCooldownRefundMs: 1200 } }
    }
  },
  dawnmender: {
    id: "dawnmender",
    name: "Dawnmender",
    role: "Health / Healing",
    pieces: ["dawnmender_circlet", "dawnmender_vestments", "dawnmender_wraps", "dawnmender_sandals"],
    bonuses: {
      2: { id: "dawnmender_2", label: "2 pieces: +10 healing power and +24 health.", stats: { healingPower: 10, health: 24 } },
      4: { id: "dawnmender_4", label: "4 pieces: healing an ally shields both players briefly.", effects: { allyHealGuardMs: 3000, allyHealGuardReduction: 0.18 } }
    }
  }
};

export function calculateSetProgress(equipment = {}) {
  const equipped = new Set(Object.values(equipment).filter(Boolean));
  return Object.fromEntries(Object.values(EQUIPMENT_SETS).map((set) => {
    const equippedPieces = set.pieces.filter((itemId) => equipped.has(itemId));
    return [
      set.id,
      {
        id: set.id,
        name: set.name,
        count: equippedPieces.length,
        total: set.pieces.length,
        pieces: equippedPieces,
        activeBonuses: activeBonusIds(set, equippedPieces.length)
      }
    ];
  }));
}

export function calculateSetBonuses(equipment = {}) {
  const progress = calculateSetProgress(equipment);
  const stats = { attack: 0, defense: 0, magicPower: 0, healingPower: 0, health: 0, maxMana: 0 };
  const effects = {};
  const activeSetBonuses = [];

  for (const set of Object.values(EQUIPMENT_SETS)) {
    const count = progress[set.id]?.count || 0;
    for (const threshold of [2, 4]) {
      if (count < threshold) continue;
      const bonus = set.bonuses[threshold];
      activeSetBonuses.push(bonus.id);
      for (const [key, value] of Object.entries(bonus.stats || {})) {
        stats[key] = (stats[key] || 0) + value;
      }
      Object.assign(effects, bonus.effects || {});
    }
  }

  return { progress, stats, effects, activeSetBonuses };
}

export function applySetBonuses(stats, setBonuses) {
  const bonuses = setBonuses || calculateSetBonuses(stats.equipment || {});
  const maxHealth = stats.maxHealth + (bonuses.stats.health || 0);
  const maxMana = stats.maxMana + (bonuses.stats.maxMana || 0);
  const defense = stats.defense + (bonuses.stats.defense || 0);
  return {
    ...stats,
    maxHealth,
    health: Math.min(maxHealth, stats.health + Math.max(0, maxHealth - stats.maxHealth)),
    maxMana,
    mana: Math.min(maxMana, stats.mana + Math.max(0, maxMana - stats.maxMana)),
    attack: stats.attack + (bonuses.stats.attack || 0),
    defense,
    damageReduction: calculateDamageReduction(defense),
    magicPower: stats.magicPower + (bonuses.stats.magicPower || 0),
    spellPower: stats.spellPower + (bonuses.stats.magicPower || 0),
    healingPower: stats.healingPower + (bonuses.stats.magicPower || 0) + (bonuses.stats.healingPower || 0),
    setProgress: bonuses.progress,
    activeSetBonuses: bonuses.activeSetBonuses,
    setBonusEffects: bonuses.effects
  };
}

export function getItemSet(itemId) {
  const item = getItem(itemId);
  return item?.setId ? EQUIPMENT_SETS[item.setId] || null : null;
}

function activeBonusIds(set, count) {
  return [2, 4].filter((threshold) => count >= threshold).map((threshold) => set.bonuses[threshold].id);
}

function calculateDamageReduction(defense) {
  const safeDefense = Math.max(0, Number(defense) || 0);
  return Math.min(0.85, safeDefense / (safeDefense + 100));
}
