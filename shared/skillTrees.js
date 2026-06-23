import { STARTING_PLAYER } from "./constants.js";
import { applyEquipmentSlots, createEquipmentState, normalizeEquipment } from "./equipment.js";
import { applyProgressionStats } from "./progression.js";

export const SKILL_TREES = {
  might: {
    id: "might",
    name: "Might",
    nodeIds: ["might_training", "heavy_slash", "iron_body", "warriors_rhythm", "whirlwind_cleave_node"]
  },
  arcana: {
    id: "arcana",
    name: "Arcana",
    nodeIds: ["mana_flow", "spell_focus", "pulse_mastery", "arcane_resonance", "chain_frost_node"]
  },
  restoration: {
    id: "restoration",
    name: "Restoration",
    nodeIds: ["healing_study", "orb_mastery", "protective_grace", "lifebinder", "radiant_ward_node"]
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
  whirlwind_cleave_node: {
    id: "whirlwind_cleave_node",
    treeId: "might",
    name: "Whirlwind Cleave",
    maxRank: 1,
    prerequisites: [{ nodeId: "warriors_rhythm", rank: 1 }],
    levelRequirement: 15,
    requiredTreePoints: 10,
    activeAbilityId: "whirlwind_cleave",
    description: "Unlocks a circular sword attack."
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
  chain_frost_node: {
    id: "chain_frost_node",
    treeId: "arcana",
    name: "Chain Frost",
    maxRank: 1,
    prerequisites: [{ nodeId: "arcane_resonance", rank: 1 }],
    levelRequirement: 15,
    requiredTreePoints: 10,
    activeAbilityId: "chain_frost",
    description: "Unlocks a cold spell that jumps between enemies."
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
  radiant_ward_node: {
    id: "radiant_ward_node",
    treeId: "restoration",
    name: "Radiant Ward",
    maxRank: 1,
    prerequisites: [{ nodeId: "lifebinder", rank: 1 }],
    levelRequirement: 15,
    requiredTreePoints: 10,
    activeAbilityId: "radiant_ward",
    description: "Unlocks a friendly shield pulse."
  }
};

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function ownsItem(player, itemId) {
  if (!itemId) return true;
  if (itemId === STARTING_PLAYER.equippedWeapon || itemId === STARTING_PLAYER.equippedArmor) return true;
  if (Object.values(normalizeEquipment(player)).includes(itemId)) return true;
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
  if ((current.level || 1) < (node.levelRequirement || 1)) return { ok: false, reason: "level" };
  if (countTreePoints(current.skillTreeNodes, node.treeId) < (node.requiredTreePoints || 0)) return { ok: false, reason: "investment" };
  if (current.availableSkillPoints <= 0) return { ok: false, reason: "points" };
  for (const prerequisite of node.prerequisites || []) {
    if ((current.skillTreeNodes[prerequisite.nodeId] || 0) < prerequisite.rank) {
      return { ok: false, reason: "prerequisite", prerequisite };
    }
  }
  const learnedAbilities = node.activeAbilityId
    ? Array.from(new Set([...(current.learnedAbilities || []), node.activeAbilityId]))
    : current.learnedAbilities || [];
  return {
    ok: true,
    node,
    player: applyProgressionStats({
      ...current,
      learnedAbilities,
      skillTreeNodes: {
        ...current.skillTreeNodes,
        [nodeId]: currentRank + 1
      }
    })
  };
}

function countTreePoints(skillTreeNodes, treeId) {
  return Object.entries(skillTreeNodes || {}).reduce((total, [nodeId, rank]) => {
    return SKILL_NODES[nodeId]?.treeId === treeId ? total + (Math.max(0, Math.floor(Number(rank) || 0))) : total;
  }, 0);
}

export function saveLoadout(player, slot, label = "Build") {
  if (!["A", "B"].includes(slot)) return { ok: false, reason: "slot" };
  const savedBuilds = { ...(player.savedBuilds || {}) };
  const equipment = normalizeEquipment(player);
  savedBuilds[slot] = {
    label: String(label || `Loadout ${slot}`).slice(0, 24),
    skillTreeNodes: clone(player.skillTreeNodes || {}),
    hotbar: clone(player.hotbar || []),
    equipment,
    equippedWeapon: equipment.weapon,
    equippedArmor: equipment.chest,
    role: slot === "A" ? "Primary" : "Secondary"
  };
  return { ok: true, player: { ...player, savedBuilds } };
}

export function activateLoadout(player, slot) {
  if (player.inCombat) return { ok: false, reason: "combat" };
  const build = player.savedBuilds?.[slot];
  if (!build) return { ok: false, reason: "missing" };
  const equipment = createEquipmentState({
    ...(build.equipment || {}),
    weapon: build.equipment?.weapon || build.equippedWeapon,
    chest: build.equipment?.chest || build.equippedArmor
  });
  if (Object.values(equipment).some((itemId) => !ownsItem(player, itemId))) {
    return { ok: false, reason: "item" };
  }
  const hotbar = clone(build.hotbar || []);
  if (!hotbarAbilitiesAreKnown(player, hotbar)) return { ok: false, reason: "ability" };
  return {
    ok: true,
    player: applyEquipmentSlots({
      ...player,
      skillTreeNodes: clone(build.skillTreeNodes || {}),
      hotbar,
      equipment,
      equippedWeapon: equipment.weapon || STARTING_PLAYER.equippedWeapon,
      equippedArmor: equipment.chest || STARTING_PLAYER.equippedArmor,
      activeLoadout: slot
    })
  };
}
