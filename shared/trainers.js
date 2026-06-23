import { ABILITIES } from "./abilities.js";
import { normalizeSpentAttributes } from "./progression.js";

export const TRAINERS = {
  mage: {
    id: "mage",
    name: "Arcanist Mira",
    label: "Mage Trainer",
    abilityIds: ["hero_pulse", "ground_pound", "fireball", "dark_punch", "water_blast", "magma_breaker", "flame_wave"]
  },
  healer: {
    id: "healer",
    name: "Sister Elara",
    label: "Healer",
    abilityIds: ["healing_orb", "mend_ally", "hearth_ward"]
  }
};

export const DEFAULT_HOTBAR = ["auto", "slash", null, "guard", "potion", "dash", null, null];

function uniqueStrings(value) {
  if (!Array.isArray(value)) return [];
  return [...new Set(value.filter((entry) => typeof entry === "string"))];
}

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

export function getTrainerAbilities(trainerId) {
  const trainer = TRAINERS[trainerId];
  if (!trainer) return [];
  return trainer.abilityIds.map((abilityId) => ABILITIES[abilityId]).filter(Boolean);
}

export function purchaseTrainerAbility(player, abilityId) {
  const ability = ABILITIES[abilityId];
  if (!ability?.trainerId) return { ok: false, reason: "ability" };
  const learnedAbilities = uniqueStrings(player.learnedAbilities);
  if (learnedAbilities.includes(abilityId)) return { ok: false, reason: "known" };
  if ((player.level || 1) < (ability.levelRequirement || 1)) return { ok: false, reason: "level" };

  const spentAttributes = normalizeSpentAttributes(player.spentAttributes);
  for (const [attributeId, required] of Object.entries(ability.attributeRequirements || {})) {
    if ((spentAttributes[attributeId] || 0) < required) return { ok: false, reason: "attribute", attributeId };
  }

  if ((player.coins || 0) < (ability.price || 0)) return { ok: false, reason: "coins" };

  return {
    ok: true,
    ability,
    player: {
      ...player,
      coins: (player.coins || 0) - (ability.price || 0),
      learnedAbilities: [...learnedAbilities, abilityId]
    }
  };
}

export function validateAbilityTarget(abilityId, targetType = "none") {
  const ability = ABILITIES[abilityId];
  if (!ability) return { ok: false, reason: "ability" };
  const target = targetType || "none";
  if (ability.targetType === "friendly") {
    return target === "friendly" || target === "self" ? { ok: true } : { ok: false, reason: "target" };
  }
  if (ability.targetType === "self_or_friendly") {
    return target === "friendly" || target === "self" || target === "none" ? { ok: true } : { ok: false, reason: "target" };
  }
  if (ability.targetType === "hostile") {
    return target === "hostile" ? { ok: true } : { ok: false, reason: "target" };
  }
  if (ability.targetType === "area_hostile") {
    return target === "hostile" || target === "self" || target === "none" ? { ok: true } : { ok: false, reason: "target" };
  }
  return { ok: true };
}

export function assignHotbarAbility(player, slotNumber, abilityId) {
  const slot = Number(slotNumber);
  if (!Number.isInteger(slot) || slot < 1 || slot > 8) return { ok: false, reason: "slot" };
  const hotbar = Array.isArray(player.hotbar) ? clone(player.hotbar).slice(0, 8) : clone(DEFAULT_HOTBAR);
  while (hotbar.length < 8) hotbar.push(null);

  if (abilityId == null || abilityId === "") {
    hotbar[slot - 1] = null;
    return { ok: true, player: { ...player, hotbar } };
  }

  const ability = ABILITIES[abilityId];
  if (!ability?.trainerId) return { ok: false, reason: "ability" };
  if (!uniqueStrings(player.learnedAbilities).includes(abilityId)) return { ok: false, reason: "not_learned" };

  hotbar[slot - 1] = abilityId;
  return { ok: true, player: { ...player, hotbar } };
}
