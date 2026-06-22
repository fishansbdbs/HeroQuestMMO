import "./styles/main.css";
import * as THREE from "three";
import { io } from "socket.io-client";
import { ABILITIES } from "../../shared/abilities.js";
import { BOSS, ENEMIES, FIELD_SPAWNS, getEnemy } from "../../shared/enemies.js";
import { GAME_VERSION, PATCH_NOTES, PLAYER_LIMITS, STARTING_PLAYER, XP_TABLE, ZONES } from "../../shared/constants.js";
import { getItem, ITEMS, STARTER_INVENTORY } from "../../shared/items.js";
import { NET } from "../../shared/netMessages.js";
import { EQUIPMENT_SLOTS, createEquipmentState, equipItemToSlot, slotForItem } from "../../shared/equipment.js";
import { INVENTORY_SLOT_COUNT, addInventoryStack, normalizeInventory } from "../../shared/inventory.js";
import { ICEZERO_MIGRATION_ID, migrateIceZeroSave } from "../../shared/saveMigration.js";
import { applyProgressionStats, regenerateMana, spendAttributePoint, spendMana, useRestStone } from "../../shared/progression.js";
import { assignHotbarAbility, getTrainerAbilities, purchaseTrainerAbility } from "../../shared/trainers.js";
import { activateLoadout, purchaseSkillNode, saveLoadout, SKILL_NODES, SKILL_TREES } from "../../shared/skillTrees.js";
import { applyQuestKill, createQuestProgress, getQuestList } from "../../shared/quests.js";
import { getZone, ZONE_DEFS } from "../../shared/zones.js";
import {
  addInventoryItem,
  addProgressRewards,
  applyEquipment,
  calculateIncomingDamage,
  calculatePlayerDamage,
  consumeInventoryItem,
  distance2d,
  rollLoot,
  xpToNextLevel
} from "../../shared/combat.js";
import { createCameraRelativeMove, smoothAngleToward, visualYawForMoveDirection } from "../../shared/movement.js";

const runtimeParts = [
  "/runtime/heroquest-runtime-1.js.txt",
  "/runtime/heroquest-runtime-2.js.txt",
  "/runtime/heroquest-runtime-3.js.txt",
  "/runtime/heroquest-runtime-4.js.txt",
  "/runtime/heroquest-runtime-5.js.txt",
  "/runtime/heroquest-runtime-6.js.txt",
  "/runtime/heroquest-runtime-7.js.txt",
  "/runtime/heroquest-runtime-7b.js.txt",
  "/runtime/heroquest-runtime-8.js.txt",
  "/runtime/heroquest-runtime-8b.js.txt",
  "/runtime/heroquest-runtime-9.js.txt"
];

const runtimeCacheKey = import.meta.env.DEV ? `${GAME_VERSION}-${Date.now()}` : GAME_VERSION;

const runtimeSource = await Promise.all(
  runtimeParts.map(async (path) => {
    const response = await fetch(`${path}?v=${encodeURIComponent(runtimeCacheKey)}`);
    if (!response.ok) {
      throw new Error(`Could not load runtime chunk: ${path}`);
    }
    return response.text();
  })
).then((parts) => parts.join("\n"));

const bootRuntime = new Function(
  "THREE",
  "io",
  "ABILITIES",
  "BOSS",
  "ENEMIES",
  "FIELD_SPAWNS",
  "getEnemy",
  "GAME_VERSION",
  "PATCH_NOTES",
  "PLAYER_LIMITS",
  "STARTING_PLAYER",
  "XP_TABLE",
  "ZONES",
  "getItem",
  "ITEMS",
  "STARTER_INVENTORY",
  "NET",
  "EQUIPMENT_SLOTS",
  "createEquipmentState",
  "equipItemToSlot",
  "slotForItem",
  "INVENTORY_SLOT_COUNT",
  "addInventoryStack",
  "normalizeInventory",
  "applyQuestKill",
  "createQuestProgress",
  "getQuestList",
  "getZone",
  "ZONE_DEFS",
  "addInventoryItem",
  "addProgressRewards",
  "applyEquipment",
  "calculateIncomingDamage",
  "calculatePlayerDamage",
  "consumeInventoryItem",
  "distance2d",
  "rollLoot",
  "xpToNextLevel",
  "createCameraRelativeMove",
  "smoothAngleToward",
  "visualYawForMoveDirection",
  "ICEZERO_MIGRATION_ID",
  "migrateIceZeroSave",
  "applyProgressionStats",
  "regenerateMana",
  "spendAttributePoint",
  "spendMana",
  "useRestStone",
  "assignHotbarAbility",
  "getTrainerAbilities",
  "purchaseTrainerAbility",
  "activateLoadout",
  "purchaseSkillNode",
  "saveLoadout",
  "SKILL_NODES",
  "SKILL_TREES",
  "env",
  `"use strict";\n${runtimeSource}`
);

bootRuntime(
  THREE,
  io,
  ABILITIES,
  BOSS,
  ENEMIES,
  FIELD_SPAWNS,
  getEnemy,
  GAME_VERSION,
  PATCH_NOTES,
  PLAYER_LIMITS,
  STARTING_PLAYER,
  XP_TABLE,
  ZONES,
  getItem,
  ITEMS,
  STARTER_INVENTORY,
  NET,
  EQUIPMENT_SLOTS,
  createEquipmentState,
  equipItemToSlot,
  slotForItem,
  INVENTORY_SLOT_COUNT,
  addInventoryStack,
  normalizeInventory,
  applyQuestKill,
  createQuestProgress,
  getQuestList,
  getZone,
  ZONE_DEFS,
  addInventoryItem,
  addProgressRewards,
  applyEquipment,
  calculateIncomingDamage,
  calculatePlayerDamage,
  consumeInventoryItem,
  distance2d,
  rollLoot,
  xpToNextLevel,
  createCameraRelativeMove,
  smoothAngleToward,
  visualYawForMoveDirection,
  ICEZERO_MIGRATION_ID,
  migrateIceZeroSave,
  applyProgressionStats,
  regenerateMana,
  spendAttributePoint,
  spendMana,
  useRestStone,
  assignHotbarAbility,
  getTrainerAbilities,
  purchaseTrainerAbility,
  activateLoadout,
  purchaseSkillNode,
  saveLoadout,
  SKILL_NODES,
  SKILL_TREES,
  import.meta.env
);
