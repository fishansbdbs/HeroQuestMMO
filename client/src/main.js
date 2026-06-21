import "./styles/main.css";
import * as THREE from "three";
import { io } from "socket.io-client";
import { ABILITIES } from "../../shared/abilities.js";
import { BOSS, ENEMIES, FIELD_SPAWNS, getEnemy } from "../../shared/enemies.js";
import { GAME_VERSION, PATCH_NOTES, PLAYER_LIMITS, STARTING_PLAYER, XP_TABLE, ZONES } from "../../shared/constants.js";
import { getItem, ITEMS, STARTER_INVENTORY } from "../../shared/items.js";
import { NET } from "../../shared/netMessages.js";
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

const runtimeSource = await Promise.all(
  runtimeParts.map(async (path) => {
    const response = await fetch(path);
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
  import.meta.env
);
