import "./styles/main.css";
import * as THREE from "three";
import { io } from "socket.io-client";
import { ABILITIES } from "../../shared/abilities.js";
import { BOSS, ICE_MAGE_BOSS, ENEMIES, FIELD_SPAWNS, FROSTVEIL_SPAWNS, getEnemy } from "../../shared/enemies.js";
import { GAME_VERSION, PATCH_NOTES, PLAYER_LIMITS, STARTING_PLAYER, XP_TABLE, ZONES } from "../../shared/constants.js";
import { getItem, ITEMS, STARTER_INVENTORY } from "../../shared/items.js";
import { NET } from "../../shared/netMessages.js";
import { EQUIPMENT_SLOTS, createEquipmentState, equipItemToSlot, slotForItem } from "../../shared/equipment.js";
import { INVENTORY_SLOT_COUNT, addInventoryStack, normalizeInventory, removeInventoryItems } from "../../shared/inventory.js";
import { FROSTFORGED_MIGRATION_ID, migrateFrostforgedSave } from "../../shared/saveMigration.js";
import { applyProgressionStats, regenerateMana, spendAttributePoint, spendMana, useRestStone } from "../../shared/progression.js";
import { assignHotbarAbility, getTrainerAbilities, purchaseTrainerAbility } from "../../shared/trainers.js";
import { activateLoadout, purchaseSkillNode, saveLoadout, SKILL_NODES, SKILL_TREES } from "../../shared/skillTrees.js";
import { applyQuestEvent, applyQuestKill, createQuestProgress, getQuestList } from "../../shared/quests.js";
import { getZone, ZONE_DEFS, canEnterZone, unlockWaypoint } from "../../shared/zones.js";
import { ACHIEVEMENTS, TITLES, calculateZoneCompletion, recordBestiaryKill, refreshMetaProgress, refreshZoneCompletion, setActiveTitle } from "../../shared/metaProgress.js";
import {
  BUYBACK_LIMIT,
  SHOP_STOCK,
  createBuybackEntry,
  isItemSellable,
  itemSellUnitValue,
  itemSellValue,
  normalizeBuyback
} from "../../shared/shop.js";
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
  "ICE_MAGE_BOSS",
  "ENEMIES",
  "FIELD_SPAWNS",
  "FROSTVEIL_SPAWNS",
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
  "removeInventoryItems",
  "applyQuestEvent",
  "applyQuestKill",
  "createQuestProgress",
  "getQuestList",
  "getZone",
  "ZONE_DEFS",
  "canEnterZone",
  "unlockWaypoint",
  "ACHIEVEMENTS",
  "TITLES",
  "calculateZoneCompletion",
  "recordBestiaryKill",
  "refreshMetaProgress",
  "refreshZoneCompletion",
  "setActiveTitle",
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
  "FROSTFORGED_MIGRATION_ID",
  "migrateFrostforgedSave",
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
  "BUYBACK_LIMIT",
  "SHOP_STOCK",
  "createBuybackEntry",
  "isItemSellable",
  "itemSellUnitValue",
  "itemSellValue",
  "normalizeBuyback",
  "env",
  `"use strict";\n${runtimeSource}`
);

bootRuntime(
  THREE,
  io,
  ABILITIES,
  BOSS,
  ICE_MAGE_BOSS,
  ENEMIES,
  FIELD_SPAWNS,
  FROSTVEIL_SPAWNS,
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
  removeInventoryItems,
  applyQuestEvent,
  applyQuestKill,
  createQuestProgress,
  getQuestList,
  getZone,
  ZONE_DEFS,
  canEnterZone,
  unlockWaypoint,
  ACHIEVEMENTS,
  TITLES,
  calculateZoneCompletion,
  recordBestiaryKill,
  refreshMetaProgress,
  refreshZoneCompletion,
  setActiveTitle,
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
  FROSTFORGED_MIGRATION_ID,
  migrateFrostforgedSave,
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
  BUYBACK_LIMIT,
  SHOP_STOCK,
  createBuybackEntry,
  isItemSellable,
  itemSellUnitValue,
  itemSellValue,
  normalizeBuyback,
  import.meta.env
);
