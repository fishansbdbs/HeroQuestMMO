import { STARTING_PLAYER } from "./constants.js";
import { applyProgressionStats } from "./progression.js";

export const SKILL_TREES = {
  might: {
    id: "might",
    name: "Might",
    nodeIds: ["might_training", "heavy_slash", "iron_body", "warriors_rhythm", "earthbreaker"]
  },
  arcana: {
    id: "arcana",
    name: "Arcana",
    nodeIds: ["mana_flow", "spell_focus", "pulse_mastery", "arcane_resonance", "elemental_nova"]
  },
  restoration: {
    id: "restoration",
    name: "Restoration",
    nodeIds: ["healing_study", "orb_mastery", "protective_grace", "lifebinder", "sanctuary"]
  }
};

export const SKILL_NODES = {
  might_training: {
    id: "might_training",
    treeId: "might",
    name: "Physical Training",
    maxRank: 5,
    description: "+3% physical damage per rank."
  },
  heavy_slash: {
    id: "heavy_slash",
    treeId: "might",
    name: "Heavy Slash",
    maxRank: 3,
    prerequisites: [{ nodeId: "might_training", rank: 2 }],
    description: "Slash gains bonus damage."
  },
  iron_body: {
    id: "iron_body",
    treeId: "might",
    name: "Iron Body",
    maxRank: 3,
    prerequisites: [{ nodeId: "might_training", rank: 1 }],
    description: "Gain a small Defense bonus."
  },
  warriors_rhythm: {
    id: "warriors_rhythm",
    treeId: "might",
    name: "Warrior's Rhythm",
    maxRank: 1,
    prerequisites: [{ nodeId: "heavy_slash", rank: 3 }],
    description: "Physical hits reward steady offense."
  },
  earthbreaker: {
    id: "earthbreaker",
    treeId: "might",
    name: "Earthbreaker",
    maxRank: 1,
    prerequisites: [{ nodeId: "warriors_rhythm", rank: 1 }],
    activeAbilityId: "earthbreaker",
    description: "Unlocks a large physical ground strike."
  },
  mana_flow: {
    id: "mana_flow",
    treeId: "arcana",
    name: "Mana Flow",
    maxRank: 5,
    description: "Increases mana regeneration."
  },
  spell_focus: {
    id: "spell_focus",
    treeId: "arcana",
    name: "Spell Focus",
    maxRank: 5,
    prerequisites: [{ nodeId: "mana_flow", rank: 1 }],
    description: "Increases magical damage."
  },
  pulse_mastery: {
    id: "pulse_mastery",
    treeId: "arcana",
    name: "Pulse Mastery",
    maxRank: 3,
    prerequisites: [{ nodeId: "spell_focus", rank: 2 }],
    description: "Improves Hero Pulse."
  },
  arcane_resonance: {
    id: "arcane_resonance",
    treeId: "arcana",
    name: "Arcane Resonance",
    maxRank: 1,
    prerequisites: [{ nodeId: "pulse_mastery", rank: 3 }],
    description: "Spells resonate with trained magic."
  },
  elemental_nova: {
    id: "elemental_nova",
    treeId: "arcana",
    name: "Elemental Nova",
    maxRank: 1,
    prerequisites: [{ nodeId: "arcane_resonance", rank: 1 }],
    activeAbilityId: "elemental_nova",
    description: "Unlocks a long-cooldown elemental explosion."
  },
  healing_study: {
    id: "healing_study",
    treeId: "restoration",
    name: "Healing Study",
    maxRank: 5,
    description: "Increases healing."
  },
  orb_mastery: {
    id: "orb_mastery",
    treeId: "restoration",
    name: "Orb Mastery",
    maxRank: 3,
    prerequisites: [{ nodeId: "healing_study", rank: 2 }],
    description: "Healing Orb lasts longer."
  },
  protective_grace: {
    id: "protective_grace",
    treeId: "restoration",
    name: "Protective Grace",
    maxRank: 3,
    prerequisites: [{ nodeId: "healing_study", rank: 1 }],
    description: "Healed players gain brief defense."
  },
  lifebinder: {
    id: "lifebinder",
    treeId: "restoration",
    name: "Lifebinder",
    maxRank: 1,
    prerequisites: [{ nodeId: "orb_mastery", rank: 3 }],
    description: "Support magic links allies together."
  },
  sanctuary: {
    id: "sanctuary",
    treeId: "restoration",
    name: "Sanctuary",
    maxRank: 1,
    prerequisites: [{ nodeId: "lifebinder", rank: 1 }],
    activeAbilityId: "sanctuary",
    description: "Unlocks a healing zone."
  }
};

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function ownsItem(player, itemId) {
  if (!itemId) return true;
  if (itemId === STARTING_PLAYER.equippedWeapon || itemId === STARTING_PLAYER.equippedArmor) return true;
  return (player.inventory || []).some((entry) => entry.itemId === itemId && (entry.quantity || 0) > 0);
}

function hotbarAbilitiesAreKnown(player, hotbar) {
  const learned = new Set(player.learnedAbilities || []);
  const baseActions = new Set(["auto", "slash", "guard", "potion", "dash", null]);
  return hotbar.every((abilityId) => baseActions.has(abilityId) || learned.has(abilityId));
}

export function purchaseSkillNode(player, nodeId) {
  const node = SKILL_NODES[nodeId];
  if (!node) return { ok: false, reason: "node" };
  const current = applyProgressionStats(player);
  const currentRank = current.skillTreeNodes[nodeId] || 0;
  if (currentRank >= node.maxRank) return { ok: false, reason: "max_rank" };
  if (current.availableSkillPoints <= 0) return { ok: false, reason: "points" };
  for (const prerequisite of node.prerequisites || []) {
    if ((current.skillTreeNodes[prerequisite.nodeId] || 0) < prerequisite.rank) {
      return { ok: false, reason: "prerequisite", prerequisite };
    }
  }
  return {
    ok: true,
    node,
    player: applyProgressionStats({
      ...current,
      skillTreeNodes: {
        ...current.skillTreeNodes,
        [nodeId]: currentRank + 1
      }
    })
  };
}

export function saveLoadout(player, slot, label = "Build") {
  if (!["A", "B"].includes(slot)) return { ok: false, reason: "slot" };
  const savedBuilds = { ...(player.savedBuilds || {}) };
  savedBuilds[slot] = {
    label: String(label || `Loadout ${slot}`).slice(0, 24),
    skillTreeNodes: clone(player.skillTreeNodes || {}),
    hotbar: clone(player.hotbar || []),
    equippedWeapon: player.equippedWeapon,
    equippedArmor: player.equippedArmor,
    role: slot === "A" ? "Primary" : "Secondary"
  };
  return { ok: true, player: { ...player, savedBuilds } };
}

export function activateLoadout(player, slot) {
  if (player.inCombat) return { ok: false, reason: "combat" };
  const build = player.savedBuilds?.[slot];
  if (!build) return { ok: false, reason: "missing" };
  if (!ownsItem(player, build.equippedWeapon) || !ownsItem(player, build.equippedArmor)) {
    return { ok: false, reason: "item" };
  }
  const hotbar = clone(build.hotbar || []);
  if (!hotbarAbilitiesAreKnown(player, hotbar)) return { ok: false, reason: "ability" };
  return {
    ok: true,
    player: applyProgressionStats({
      ...player,
      skillTreeNodes: clone(build.skillTreeNodes || {}),
      hotbar,
      equippedWeapon: build.equippedWeapon,
      equippedArmor: build.equippedArmor,
      activeLoadout: slot
    })
  };
}
