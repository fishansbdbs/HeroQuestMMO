import { PLAYER_STATES, RESPAWN_DELAY_MS, SNAPSHOT_MS, SERVER_TICK_MS, ZONES } from "../../shared/constants.js";
import { ABILITIES } from "../../shared/abilities.js";
import { BOSS, ICE_MAGE_BOSS } from "../../shared/enemies.js";
import { NET } from "../../shared/netMessages.js";
import { addProgressRewards, applyEquipment, consumeInventoryItem, distance2d, isPlayerDead } from "../../shared/combat.js";
import { equipItemToSlot, normalizeEquipment } from "../../shared/equipment.js";
import { addInventoryStack, removeInventoryItems } from "../../shared/inventory.js";
import { getItem } from "../../shared/items.js";
import { spendAttributePoint, useRestStone } from "../../shared/progression.js";
import { assignHotbarAbility, purchaseTrainerAbility } from "../../shared/trainers.js";
import { activateLoadout, purchaseSkillNode, saveLoadout } from "../../shared/skillTrees.js";
import { applyQuestEvent, applyQuestKill } from "../../shared/quests.js";
import {
  BUYBACK_LIMIT,
  createBuybackEntry,
  isItemSellable,
  itemSellValue,
  normalizeBuyback,
  normalizeTradeQuantity
} from "../../shared/shop.js";
import { upgradeFrostforgeItem } from "../../shared/frostforge.js";
import { canEnterZone, unlockWaypoint } from "../../shared/zones.js";
import { recordBestiaryKill, refreshMetaProgress as refreshPlayerMetaProgress } from "../../shared/metaProgress.js";
import { createPlayerState, sanitizePlayer } from "./PlayerState.js";
import { LootSystem } from "./LootSystem.js";
import { EnemySystem } from "./EnemySystem.js";
import { BossSystem } from "./BossSystem.js";
import { IceMageSystem } from "./IceMageSystem.js";
import { CombatSystem } from "./CombatSystem.js";
import { PartySystem } from "./PartySystem.js";
import { PublicEventSystem } from "./PublicEventSystem.js";

export class RoomManager {
  constructor(io) {
    this.io = io;
    this.players = new Map();
    this.loot = new LootSystem();
    this.enemies = new EnemySystem({ lootSystem: this.loot });
    this.boss = new BossSystem({ lootSystem: this.loot });
    this.iceMage = new IceMageSystem({ lootSystem: this.loot });
    this.combat = new CombatSystem({ enemySystem: this.enemies, bossSystem: this.boss, iceMageSystem: this.iceMage });
    this.parties = new PartySystem();
    this.publicEvents = new PublicEventSystem({ enemySystem: this.enemies });
    this.chests = createChests();
    this.rng = Math.random;
    this.lastTick = Date.now();
    this.tickTimer = setInterval(() => this.tick(), SERVER_TICK_MS);
    this.snapshotTimer = setInterval(() => this.broadcastSnapshots(), SNAPSHOT_MS);
  }

  attach(socket) {
    socket.on(NET.PLAYER_JOIN, (profile, ack) => {
      const player = createPlayerState(socket.id, profile);
      this.players.set(socket.id, player);
      socket.join(player.zone);
      if (player.zone === ZONES.BOSS) this.boss.start();
      if (player.zone === ZONES.PALACE) this.iceMage.start();
      ack?.({ ok: true, player: sanitizePlayer(player), snapshot: this.snapshotForZone(player.zone) });
      this.broadcastSnapshots();
    });

    socket.on(NET.PLAYER_MOVE, (payload) => {
      const player = this.players.get(socket.id);
      if (!player || !payload?.position) return;
      if (isPlayerDead(player)) return;
      player.position = clampPosition(payload.position, player.zone);
      player.lastInputAt = Date.now();
    });

    socket.on(NET.PLAYER_ZONE, (payload, ack) => {
      const player = this.players.get(socket.id);
      if (!player || !payload?.zone) return;
      if (isPlayerDead(player)) {
        ack?.({ ok: false, reason: "dead", player: sanitizePlayer(player) });
        return;
      }
      const oldZone = player.zone;
      const result = this.changePlayerZone(player, payload.zone, payload.position);
      if (!result.ok) {
        ack?.(result);
        return;
      }
      socket.leave(oldZone);
      socket.join(player.zone);
      if (player.zone === ZONES.BOSS) this.boss.start();
      if (player.zone === ZONES.PALACE) this.iceMage.start();
      ack?.({ ok: true, player: sanitizePlayer(player), snapshot: this.snapshotForZone(player.zone) });
      this.broadcastSnapshots();
    });

    socket.on(NET.PLAYER_SAVE, (payload) => {
      const player = this.players.get(socket.id);
      if (!player || !payload) return;
      Object.assign(player, {
        xp: payload.xp ?? player.xp,
        coins: payload.coins ?? player.coins,
        mana: payload.mana ?? player.mana,
        inventory: payload.inventory ?? player.inventory,
        equipment: payload.equipment ?? player.equipment,
        equippedWeapon: payload.equippedWeapon ?? player.equippedWeapon,
        equippedArmor: payload.equippedArmor ?? player.equippedArmor,
        questProgress: payload.questProgress ?? player.questProgress,
        waypoints: payload.waypoints ?? player.waypoints,
        openedChests: payload.openedChests ?? player.openedChests,
        bestiaryProgress: payload.bestiaryProgress ?? player.bestiaryProgress,
        zoneCompletion: payload.zoneCompletion ?? player.zoneCompletion,
        achievements: payload.achievements ?? player.achievements,
        firstClearRewards: payload.firstClearRewards ?? player.firstClearRewards,
        publicEventClaims: payload.publicEventClaims ?? player.publicEventClaims,
        buyback: payload.buyback ?? player.buyback,
        upgradeRanks: payload.upgradeRanks ?? player.upgradeRanks,
        title: payload.title ?? player.title
      });
    });

    socket.on(NET.PLAYER_SPEND_ATTRIBUTE, (payload, ack) => {
      const player = this.players.get(socket.id);
      const result = this.allocateAttribute(player, payload?.attributeId, payload?.count);
      ack?.(result.ok ? { ...result, player: sanitizePlayer(player) } : result);
      if (result.ok) this.broadcastSnapshots();
    });

    socket.on(NET.PLAYER_USE_REST_STONE, (_payload, ack) => {
      const player = this.players.get(socket.id);
      const result = this.resetWithRestStone(player);
      ack?.(result.ok ? { ...result, player: sanitizePlayer(player) } : result);
      if (result.ok) this.broadcastSnapshots();
    });

    socket.on(NET.PLAYER_USE_CONSUMABLE, (payload, ack) => {
      const player = this.players.get(socket.id);
      const result = this.usePotion(player, payload?.itemId);
      ack?.(result.ok ? { ...result, player: sanitizePlayer(player) } : result);
      if (result.ok) this.broadcastSnapshots();
    });

    socket.on(NET.PLAYER_BUY_ABILITY, (payload, ack) => {
      const player = this.players.get(socket.id);
      const result = this.buyAbility(player, payload?.abilityId);
      ack?.(result.ok ? { ...result, player: sanitizePlayer(player) } : result);
      if (result.ok) this.broadcastSnapshots();
    });

    socket.on(NET.PLAYER_ASSIGN_HOTBAR, (payload, ack) => {
      const player = this.players.get(socket.id);
      const result = this.assignHotbar(player, payload?.slot, payload?.abilityId);
      ack?.(result.ok ? { ...result, player: sanitizePlayer(player) } : result);
      if (result.ok) this.broadcastSnapshots();
    });

    socket.on(NET.PLAYER_BUY_SKILL_NODE, (payload, ack) => {
      const player = this.players.get(socket.id);
      const result = this.buySkillNode(player, payload?.nodeId);
      ack?.(result.ok ? { ...result, player: sanitizePlayer(player) } : result);
      if (result.ok) this.broadcastSnapshots();
    });

    socket.on(NET.PLAYER_SAVE_LOADOUT, (payload, ack) => {
      const player = this.players.get(socket.id);
      const result = this.saveBuildLoadout(player, payload?.slot, payload?.label);
      ack?.(result.ok ? { ...result, player: sanitizePlayer(player) } : result);
      if (result.ok) this.broadcastSnapshots();
    });

    socket.on(NET.PLAYER_ACTIVATE_LOADOUT, (payload, ack) => {
      const player = this.players.get(socket.id);
      const result = this.activateBuildLoadout(player, payload?.slot);
      ack?.(result.ok ? { ...result, player: sanitizePlayer(player) } : result);
      if (result.ok) this.broadcastSnapshots();
    });

    socket.on(NET.PLAYER_EQUIP_ITEM, (payload, ack) => {
      const player = this.players.get(socket.id);
      const result = this.equipItem(player, payload?.slot, payload?.itemId);
      ack?.(result.ok ? { ...result, player: sanitizePlayer(player) } : result);
      if (result.ok) this.broadcastSnapshots();
    });

    socket.on(NET.PLAYER_SELL_ITEM, (payload, ack) => {
      const player = this.players.get(socket.id);
      const result = this.sellItem(player, payload?.itemId, payload?.quantity, { confirmed: Boolean(payload?.confirmed) });
      ack?.(result.ok ? { ...result, player: sanitizePlayer(player) } : result);
      if (result.ok) this.broadcastSnapshots();
    });

    socket.on(NET.PLAYER_BUYBACK_ITEM, (payload, ack) => {
      const player = this.players.get(socket.id);
      const result = this.buyBackItem(player, payload?.buybackId);
      ack?.(result.ok ? { ...result, player: sanitizePlayer(player) } : result);
      if (result.ok) this.broadcastSnapshots();
    });

    socket.on(NET.PLAYER_UPGRADE_ITEM, (payload, ack) => {
      const player = this.players.get(socket.id);
      const result = this.upgradeItem(player, payload?.itemId);
      ack?.(result.ok ? { ...result, player: sanitizePlayer(player) } : result);
      if (result.ok) this.broadcastSnapshots();
    });

    socket.on(NET.COMBAT_ATTACK, (payload, ack) => {
      const player = this.players.get(socket.id);
      if (!player) return;
      const result = this.combat.attack(player, payload?.targetId, { kind: payload?.kind });
      this.applyCombatRewards(player, result);
      ack?.(result);
      this.broadcastSnapshots();
    });

    socket.on(NET.COMBAT_ABILITY, (payload, ack) => {
      const player = this.players.get(socket.id);
      if (!player) return;
      const result = this.combat.ability(player, payload, this.players);
      for (const hit of result.hits || []) this.applyCombatRewards(player, { result: hit, boss: hit.boss, iceMage: hit.iceMage });
      if (result.ok && result.heals?.length) this.refreshMetaProgress(player);
      ack?.(result);
      this.broadcastSnapshots();
    });

    socket.on(NET.HEALING_ORB_CLAIM, (payload, ack) => {
      const player = this.players.get(socket.id);
      const result = this.combat.consumeHealingOrb(player, payload?.orbId, this.players);
      if (result.ok) {
        this.refreshMetaProgress(player);
        const caster = this.players.get(result.healingOrb?.casterId);
        if (caster && caster.id !== player.id) this.refreshMetaProgress(caster);
        this.io.to(player.zone).emit(NET.WORLD_EVENT, {
          type: "healing_orb_consumed",
          healingOrb: result.healingOrb,
          heals: result.heals
        });
      }
      ack?.(result.ok ? { ...result, player: sanitizePlayer(player) } : result);
      this.broadcastSnapshots();
    });

    socket.on(NET.LOOT_CLAIM, (payload, ack) => {
      const player = this.players.get(socket.id);
      const result = this.claimLoot(player, payload?.lootId);
      ack?.(result.ok ? { ...result, player: sanitizePlayer(player) } : result);
      if (result.ok) this.broadcastSnapshots();
    });

    socket.on(NET.CHEST_CLAIM, (payload, ack) => {
      const player = this.players.get(socket.id);
      const result = this.claimChest(player, payload?.chestId);
      ack?.(result);
      if (result.ok) this.broadcastSnapshots();
    });

    socket.on(NET.PUBLIC_EVENT_ACTIVATE, (payload, ack) => {
      const player = this.players.get(socket.id);
      const result = this.activatePublicEvent(player, payload?.eventId, Date.now(), payload?.wardId);
      ack?.(result.ok ? { ...result, player: sanitizePlayer(player) } : result);
      if (result.ok) this.broadcastSnapshots();
    });

    socket.on(NET.PLAYER_RESPAWN, (_payload, ack) => {
      const player = this.players.get(socket.id);
      if (!player) return;
      const oldZone = player.zone;
      const result = this.requestRespawn(player);
      if (!result.ok) {
        ack?.({ ...result, player: sanitizePlayer(player) });
        return;
      }
      socket.leave(oldZone);
      socket.join(ZONES.HUB);
      ack?.({ ok: true, player: sanitizePlayer(player), snapshot: this.snapshotForZone(player.zone) });
      this.broadcastSnapshots();
    });

    socket.on(NET.PARTY_CREATE, (_payload, ack) => {
      const party = this.parties.createParty(socket.id);
      this.syncPartyIds();
      ack?.({ ok: true, party });
      this.broadcastSnapshots();
    });

    socket.on(NET.PARTY_JOIN, (payload, ack) => {
      try {
        const party = this.parties.joinParty(socket.id, payload?.code);
        this.syncPartyIds();
        ack?.({ ok: true, party });
        this.broadcastSnapshots();
      } catch (error) {
        ack?.({ ok: false, error: error.message });
      }
    });

    socket.on(NET.PARTY_LEAVE, (_payload, ack) => {
      this.parties.leaveParty(socket.id);
      this.syncPartyIds();
      ack?.({ ok: true });
      this.broadcastSnapshots();
    });

    socket.on("disconnect", () => {
      this.parties.leaveParty(socket.id);
      this.players.delete(socket.id);
      this.broadcastSnapshots();
    });
  }

  applyCombatRewards(player, result) {
    if (isPlayerDead(player)) return;
    const defeat = result?.result?.defeated ? result.result : null;
    if (defeat) {
      if (defeat.reward) Object.assign(player, addProgressRewards(player, defeat.reward));
      const enemyDef = defeat.enemyDef || defeat.enemy;
      if (enemyDef) {
        const questUpdate = applyQuestKill(player.questProgress, enemyDef);
        player.questProgress = questUpdate.progress;
        const bestiary = recordBestiaryKill(player, enemyDef, { elite: defeat.enemy?.eliteModifier || enemyDef.elite });
        if (bestiary.ok) Object.assign(player, bestiary.player);
      }
      this.refreshMetaProgress(player);
    }
    const boss = result?.boss || result?.result?.boss;
    if (boss?.defeated || boss?.boss?.defeated) {
      this.awardBossDefeat(boss, player);
    }
    const iceMage = result?.iceMage || result?.result?.iceMage;
    if (iceMage?.defeated || iceMage?.boss?.defeated || iceMage?.iceMage?.defeated) {
      this.awardIceMageDefeat(iceMage, player);
    }
  }

  refreshMetaProgress(player) {
    if (!player) return;
    const result = refreshPlayerMetaProgress(player);
    if (result?.player) Object.assign(player, result.player);
  }

  allocateAttribute(player, attributeId, count = 1) {
    if (!player || isPlayerDead(player)) return { ok: false, reason: "dead" };
    const result = spendAttributePoint(player, attributeId, count);
    if (!result.ok) return result;
    Object.assign(player, result.player);
    return { ok: true };
  }

  resetWithRestStone(player) {
    if (!player || isPlayerDead(player)) return { ok: false, reason: "dead" };
    const result = useRestStone(player);
    if (!result.ok) return result;
    Object.assign(player, result.player);
    return { ok: true };
  }

  usePotion(player, itemId = "small_health_potion") {
    if (!player || isPlayerDead(player)) return { ok: false, reason: "dead" };
    if (itemId !== "small_health_potion") return { ok: false, reason: "item" };

    const maxHealth = Math.max(1, Number(player.maxHealth) || 1);
    const currentHealth = Math.max(0, Number(player.health) || 0);
    if (currentHealth >= maxHealth) return { ok: false, reason: "full" };

    const now = Date.now();
    const cooldownMs = ABILITIES.potion.cooldownMs;
    const lastPotionAt = Number(player.lastPotionAt) || 0;
    if (lastPotionAt && now - lastPotionAt < cooldownMs) {
      return {
        ok: false,
        reason: "cooldown",
        remainingMs: Math.max(0, cooldownMs - (now - lastPotionAt))
      };
    }

    const consumed = consumeInventoryItem(player.inventory || [], itemId, 1);
    if (!consumed.consumed) return { ok: false, reason: "missing" };

    const healCap = maxHealth - currentHealth;
    const configuredHeal = Math.max(1, Math.round((ABILITIES.potion.heal || 30) + (Number(player.potionBonus) || 0)));
    const amount = Math.min(healCap, configuredHeal);
    player.inventory = consumed.inventory;
    player.health = currentHealth + amount;
    player.lastPotionAt = now;
    return {
      ok: true,
      itemId,
      heal: {
        amount,
        health: player.health,
        maxHealth
      },
      cooldownMs
    };
  }

  buyAbility(player, abilityId) {
    if (!player || isPlayerDead(player)) return { ok: false, reason: "dead" };
    const result = purchaseTrainerAbility(player, abilityId);
    if (!result.ok) return result;
    Object.assign(player, result.player);
    return { ok: true, ability: result.ability };
  }

  assignHotbar(player, slot, abilityId) {
    if (!player || isPlayerDead(player)) return { ok: false, reason: "dead" };
    const result = assignHotbarAbility(player, slot, abilityId);
    if (!result.ok) return result;
    Object.assign(player, result.player);
    return { ok: true };
  }

  buySkillNode(player, nodeId) {
    if (!player || isPlayerDead(player)) return { ok: false, reason: "dead" };
    const result = purchaseSkillNode(player, nodeId);
    if (!result.ok) return result;
    Object.assign(player, result.player);
    return { ok: true, node: result.node };
  }

  saveBuildLoadout(player, slot, label) {
    if (!player || isPlayerDead(player)) return { ok: false, reason: "dead" };
    const result = saveLoadout(player, slot, label);
    if (!result.ok) return result;
    Object.assign(player, result.player);
    return { ok: true };
  }

  activateBuildLoadout(player, slot) {
    if (!player || isPlayerDead(player)) return { ok: false, reason: "dead" };
    const result = activateLoadout(player, slot);
    if (!result.ok) return result;
    Object.assign(player, result.player);
    return { ok: true };
  }

  changePlayerZone(player, zone, position = null) {
    if (!player || isPlayerDead(player)) return { ok: false, reason: "dead" };
    const gate = canEnterZone(player, zone);
    if (!gate.ok) return gate;

    player.zone = zone;
    player.position = position || defaultZonePosition(zone);
    if (zone === ZONES.FROSTVEIL) {
      const waypoint = unlockWaypoint(player, "frostveil_camp");
      if (waypoint.ok) Object.assign(player, waypoint.player);
      const questUpdate = applyQuestEvent(player.questProgress, "enter_frostveil");
      player.questProgress = questUpdate.progress;
    }
    if (zone === ZONES.PALACE) {
      const questUpdate = applyQuestEvent(player.questProgress, "enter_palace");
      player.questProgress = questUpdate.progress;
      this.iceMage.start();
    }
    this.refreshMetaProgress(player);
    return { ok: true };
  }

  equipItem(player, slot, itemId) {
    if (!player || isPlayerDead(player)) return { ok: false, reason: "dead" };
    const result = equipItemToSlot(player, slot, itemId);
    if (!result.ok) return result;
    Object.assign(player, result.player);
    return { ok: true };
  }

  sellItem(player, itemId, quantity = 1, options = {}) {
    if (!player || isPlayerDead(player)) return { ok: false, reason: "dead" };

    const item = getItem(itemId);
    if (!item) return { ok: false, reason: "item" };

    const count = normalizeTradeQuantity(quantity);
    if (count <= 0) return { ok: false, reason: "quantity" };
    if (!isItemSellable(itemId)) return { ok: false, reason: "not_sellable" };
    if (isEquippedItem(player, itemId)) return { ok: false, reason: "equipped" };
    if (requiresSellConfirmation(player, item) && !options.confirmed) return { ok: false, reason: "confirm_required" };
    if (inventoryQuantity(player.inventory, itemId) < count) return { ok: false, reason: "missing" };

    const coins = itemSellValue(itemId, count);
    if (coins <= 0) return { ok: false, reason: "not_sellable" };

    const removed = removeInventoryItems(player.inventory, itemId, count);
    if (!removed.ok) return { ok: false, reason: "missing" };

    player.inventory = removed.inventory;
    player.coins = nonNegativeInt(player.coins) + coins;
    const buybackEntry = createBuybackEntry(itemId, count, coins);
    player.buyback = [buybackEntry, ...normalizeBuyback(player.buyback)].slice(0, BUYBACK_LIMIT);
    return { ok: true, itemId, quantity: count, coins, buyback: buybackEntry };
  }

  buyBackItem(player, buybackId) {
    if (!player || isPlayerDead(player)) return { ok: false, reason: "dead" };

    const entries = normalizeBuyback(player.buyback);
    const index = entries.findIndex((entry) => entry.id === buybackId);
    if (index < 0) {
      player.buyback = entries;
      return { ok: false, reason: "missing" };
    }

    const entry = entries[index];
    const cost = nonNegativeInt(entry.cost ?? entry.saleValue);
    if (nonNegativeInt(player.coins) < cost) {
      player.buyback = entries;
      return { ok: false, reason: "coins" };
    }

    const inventoryResult = addInventoryStack(player.inventory || [], entry.itemId, entry.quantity);
    if (!inventoryResult.ok) {
      player.buyback = entries;
      return {
        ok: false,
        reason: inventoryResult.reason === "full" ? "inventory_full" : inventoryResult.reason,
        overflow: inventoryResult.overflow
      };
    }

    player.coins = nonNegativeInt(player.coins) - cost;
    player.inventory = inventoryResult.inventory;
    entries.splice(index, 1);
    player.buyback = entries;
    return { ok: true, itemId: entry.itemId, quantity: entry.quantity, cost };
  }

  upgradeItem(player, itemId) {
    if (!player || isPlayerDead(player)) return { ok: false, reason: "dead" };
    const result = upgradeFrostforgeItem(player, itemId);
    if (!result.ok) return result;
    Object.assign(player, applyEquipment(result.player));
    return { ok: true, itemId: result.itemId, rank: result.rank, cost: result.cost };
  }

  claimLoot(player, lootId) {
    const inspected = lootId ? this.loot.inspectForPlayer({ lootId, player, range: 4 }) : { ok: false, reason: "missing" };
    if (!inspected.ok) return { ok: false, reason: inspected.reason };

    const inventoryResult = applyRewardItems(player.inventory, inspected.bag.items || []);
    if (!inventoryResult.ok) {
      return {
        ok: false,
        reason: inventoryResult.reason === "full" ? "inventory_full" : inventoryResult.reason,
        overflow: inventoryResult.overflow
      };
    }

    const claim = this.loot.claimForPlayer({ lootId, player, range: 4 });
    if (!claim.ok) return { ok: false, reason: claim.reason };
    const bag = claim.bag;
    player.coins += bag.coins || 0;
    player.inventory = inventoryResult.inventory;
    return { ok: true, bag };
  }

  awardBossDefeat(bossResult, triggeringPlayer) {
    const eligibleIds = new Set(this.boss.state.participants);
    if (triggeringPlayer?.id) eligibleIds.add(triggeringPlayer.id);
    for (const player of this.players.values()) {
      if (player.zone === ZONES.BOSS) eligibleIds.add(player.id);
    }
    for (const id of [...eligibleIds]) {
      const party = this.parties.getPartyForPlayer(id);
      if (party) {
        for (const memberId of party.members) {
          const member = this.players.get(memberId);
          if (member?.zone === ZONES.BOSS) eligibleIds.add(memberId);
        }
      }
    }
    const reward = bossResult.reward || { xp: 400, coins: 300 };
    for (const id of eligibleIds) {
      const player = this.players.get(id);
      if (!player || isPlayerDead(player)) continue;
      Object.assign(player, addProgressRewards(player, reward));
      const questUpdate = applyQuestKill(player.questProgress, { id: "shadow_wyrm", family: "dragon" });
      player.questProgress = questUpdate.progress;
      player.firstClearRewards = player.firstClearRewards || {};
      if (!player.firstClearRewards[BOSS.id]) player.firstClearRewards[BOSS.id] = true;
      const restStoneRoll = this.rng();
      if (restStoneRoll < 0.5) {
        const restStone = addInventoryStack(player.inventory || [], "rest_stone", 1);
        if (restStone.ok) player.inventory = restStone.inventory;
      }
      player.title = "Wyrm-Touched";
      this.refreshMetaProgress(player);
    }
    this.io.to(ZONES.BOSS).emit(NET.WORLD_EVENT, {
      type: "boss_defeated",
      playerIds: [...eligibleIds],
      reward,
      lootBag: bossResult.lootBag || null
    });
  }

  awardIceMageDefeat(bossResult, triggeringPlayer) {
    const eligibleIds = new Set(this.iceMage.state.participants);
    if (triggeringPlayer?.id) eligibleIds.add(triggeringPlayer.id);
    for (const player of this.players.values()) {
      if (player.zone === ZONES.PALACE) eligibleIds.add(player.id);
    }
    for (const id of [...eligibleIds]) {
      const party = this.parties.getPartyForPlayer(id);
      if (party) {
        for (const memberId of party.members) {
          const member = this.players.get(memberId);
          if (member?.zone === ZONES.PALACE) eligibleIds.add(memberId);
        }
      }
    }

    const reward = bossResult.reward || { xp: ICE_MAGE_BOSS.xp, coins: ICE_MAGE_BOSS.coins };
    for (const id of eligibleIds) {
      const player = this.players.get(id);
      if (!player || isPlayerDead(player)) continue;
      Object.assign(player, addProgressRewards(player, reward));
      const questUpdate = applyQuestKill(player.questProgress, ICE_MAGE_BOSS);
      player.questProgress = questUpdate.progress;
      player.title = "Icebreaker";
      player.firstClearRewards = player.firstClearRewards || {};
      player.achievements = Array.isArray(player.achievements) ? player.achievements : [];
      if (!player.firstClearRewards[ICE_MAGE_BOSS.id]) {
        player.firstClearRewards[ICE_MAGE_BOSS.id] = true;
        if (!player.achievements.includes("icebreaker")) player.achievements.push("icebreaker");
        Object.assign(player, addProgressRewards(player, { xp: 300, coins: 180 }));
        const rare = addInventoryStack(player.inventory || [], "frostspire_staff", 1);
        if (rare.ok) player.inventory = rare.inventory;
      }
      this.refreshMetaProgress(player);
    }

    this.io.to(ZONES.PALACE).emit(NET.WORLD_EVENT, {
      type: "ice_mage_defeated",
      playerIds: [...eligibleIds],
      reward,
      lootBag: bossResult.lootBag || null
    });
  }

  syncPartyIds() {
    for (const player of this.players.values()) {
      const party = this.parties.getPartyForPlayer(player.id);
      player.partyId = party?.code || null;
    }
  }

  tick() {
    const now = Date.now();
    const dt = now - this.lastTick;
    this.lastTick = now;
    this.enemies.update(this.players, dt);
    this.processDeaths();
    const bossEvents = this.boss.update(this.players);
    this.handleBossEvents(bossEvents);
    const iceMageEvents = this.iceMage.update(this.players);
    this.handleIceMageEvents(iceMageEvents);
    this.handlePublicEvents(this.publicEvents.update(this.players));
    this.processDeaths();
    this.processRespawns();
    this.handleHealingOrbExpirations(this.combat.expireHealingOrbs(now));
    this.loot.cleanup();
  }

  handleBossEvents(events) {
    for (const event of events || []) {
      if (event.type === "boss_summon") this.spawnShadowSlimes(event.attack?.shape?.points);
      this.io.to(ZONES.BOSS).emit(NET.WORLD_EVENT, event);
    }
  }

  handleIceMageEvents(events) {
    for (const event of events || []) {
      if (event.type === "ice_mage_summon") this.spawnIceMageServants(event.attack?.shape?.points);
      this.io.to(ZONES.PALACE).emit(NET.WORLD_EVENT, event);
    }
  }

  handleHealingOrbExpirations(orbs = []) {
    for (const orb of orbs) {
      this.io.to(orb.zone).emit(NET.WORLD_EVENT, {
        type: "healing_orb_expired",
        healingOrb: orb
      });
    }
  }

  spawnShadowSlimes(points = []) {
    const spawnPoints = points.length ? points : [{ x: 7, z: 0 }, { x: -6, z: 4 }, { x: 2, z: -8 }];
    for (const point of spawnPoints.slice(0, 3)) {
      this.enemies.spawnEnemy("shadow_slime", { x: point.x, y: 0, z: point.z }, ZONES.BOSS);
    }
  }

  spawnIceMageServants(points = []) {
    const spawnPoints = points.length ? points : [{ x: -10, z: -6 }, { x: 10, z: -6 }];
    const enemyIds = ["frost_wisp", "frozen_knight"];
    spawnPoints.slice(0, 2).forEach((point, index) => {
      this.enemies.spawnEnemy(enemyIds[index % enemyIds.length], { x: point.x, y: 0, z: point.z }, ZONES.PALACE);
    });
  }

  processDeaths() {
    for (const player of this.players.values()) {
      if ((player.health ?? 0) <= 0 && player.state !== PLAYER_STATES.DEAD) {
        this.markDefeated(player);
      }
    }
  }

  markDefeated(player) {
    const now = Date.now();
    player.health = 0;
    player.state = PLAYER_STATES.DEAD;
    player.defeatedAt = now;
    player.respawnAt = now + RESPAWN_DELAY_MS;
    player.lastAttackAt = now;
    player.lastAbilityAt = now;
    this.io.to(player.zone).emit(NET.WORLD_EVENT, {
      type: "player_defeated",
      playerId: player.id,
      respawnAt: player.respawnAt
    });
  }

  processRespawns() {
    for (const player of this.players.values()) {
      if (player.state === PLAYER_STATES.DEAD && Date.now() >= (player.respawnAt || 0)) {
        if (!player.respawnReadyNotified) {
          player.respawnReadyNotified = true;
          this.io.to(player.zone).emit(NET.WORLD_EVENT, { type: "player_respawn_ready", playerId: player.id });
        }
      }
    }
  }

  requestRespawn(player) {
    if (!player || !isPlayerDead(player)) return { ok: false, reason: "not_dead" };
    if (Date.now() < (player.respawnAt || 0)) return { ok: false, reason: "not_ready" };
    this.respawnPlayer(player);
    return { ok: true };
  }

  respawnPlayer(player) {
    const now = Date.now();
    Object.assign(player, {
      state: PLAYER_STATES.ALIVE,
      health: player.maxHealth,
      mana: player.maxMana,
      zone: ZONES.HUB,
      position: defaultZonePosition(ZONES.HUB),
      defeatedAt: null,
      respawnAt: null,
      respawnReadyNotified: false,
      respawnProtectionUntil: now + 3000,
      lastAttackAt: 0,
      lastAbilityAt: 0
    });
  }

  claimChest(player, chestId) {
    const chest = this.chests.get(chestId);
    if (!player) return { ok: false, reason: "missing_player" };
    if (isPlayerDead(player)) return { ok: false, reason: "dead" };
    if (!chest) return { ok: false, reason: "missing" };
    if (chest.zone !== player.zone) return { ok: false, reason: "zone" };
    if (chest.openedBy.has(player.id)) return { ok: false, reason: "opened" };
    if (distance2d(player.position, chest.position) > 4) return { ok: false, reason: "range" };
    const reward = { coins: chest.coins, items: [...chest.items] };
    const inventoryResult = applyRewardItems(player.inventory, reward.items);
    if (!inventoryResult.ok) {
      return {
        ok: false,
        reason: inventoryResult.reason === "full" ? "inventory_full" : inventoryResult.reason,
        overflow: inventoryResult.overflow
      };
    }
    chest.openedBy.add(player.id);
    player.coins += reward.coins;
    player.inventory = inventoryResult.inventory;
    player.openedChests = Array.from(new Set([...(player.openedChests || []), chestId]));
    this.refreshMetaProgress(player);
    return { ok: true, chestId, reward, player: sanitizePlayer(player) };
  }

  handlePublicEvents(events) {
    for (const event of events || []) {
      if (event.type === "public_event_completed") this.awardPublicEventCompletion(event);
      this.io.to(event.zone || ZONES.FROSTVEIL).emit(NET.WORLD_EVENT, event);
    }
  }

  activatePublicEvent(player, eventId, now = Date.now(), wardId = null) {
    if (!player || isPlayerDead(player)) return { ok: false, reason: "dead" };
    if (eventId !== "defend_frost_ward") return { ok: false, reason: "event" };
    const result = this.publicEvents.activate(player, this.players, now, wardId);
    if (!result.ok) return result;
    this.handlePublicEvents(result.events);
    return { ok: true, event: result.events[0] || null };
  }

  awardPublicEventCompletion(event) {
    if (event?.eventId !== "defend_frost_ward") return;
    const participantIds = new Set(Array.isArray(event.participants) ? event.participants : []);
    if (participantIds.size === 0 && this.publicEvents?.state?.participants) {
      for (const id of this.publicEvents.state.participants) participantIds.add(id);
    }

    const claimKey = publicEventClaimKey(event);
    const creditedPlayerIds = [];
    for (const id of participantIds) {
      const player = this.players.get(id);
      if (!player || isPlayerDead(player)) continue;
      player.publicEventClaims = uniqueStringList(player.publicEventClaims);
      if (player.publicEventClaims.includes(claimKey)) continue;

      player.publicEventClaims.push(claimKey);
      const questUpdate = applyQuestEvent(player.questProgress, "activate_frost_ward");
      player.questProgress = questUpdate.progress;
      this.grantQuestCompletionRewards(player, questUpdate.completed);
      this.refreshMetaProgress(player);
      creditedPlayerIds.push(id);
    }
    event.creditedPlayerIds = creditedPlayerIds;
  }

  grantQuestCompletionRewards(player, completedQuests = []) {
    for (const quest of completedQuests) {
      if (!quest?.reward) continue;
      Object.assign(player, addProgressRewards(player, quest.reward));
      if (quest.reward.itemId) {
        const item = addInventoryStack(player.inventory || [], quest.reward.itemId, 1);
        if (item.ok) player.inventory = item.inventory;
      }
      if (quest.reward.title) player.title = quest.reward.title;
    }
  }

  broadcastSnapshots() {
    const zones = new Set([...this.players.values()].map((player) => player.zone));
    zones.add(ZONES.HUB);
    for (const zone of zones) {
      this.io.to(zone).emit(NET.WORLD_SNAPSHOT, this.snapshotForZone(zone));
    }
  }

  snapshotForZone(zone) {
    return {
      zone,
      players: [...this.players.values()].filter((player) => player.zone === zone).map(sanitizePlayer),
      enemies: this.enemies.snapshot(zone),
      loot: this.loot.snapshot(zone),
      healingOrbs: this.combat.snapshotHealingOrbs(zone),
      chests: this.snapshotChests(zone),
      boss: this.boss.snapshot(),
      iceMage: this.iceMage.snapshot(),
      publicEvent: this.publicEvents.snapshot(zone),
      parties: this.parties.snapshot(),
      serverTime: Date.now()
    };
  }

  snapshotChests(zone) {
    return [...this.chests.values()]
      .filter((chest) => chest.zone === zone)
      .map((chest) => ({
        id: chest.id,
        zone: chest.zone,
        position: chest.position,
        openedBy: [...chest.openedBy]
      }));
  }
}

function inventoryQuantity(inventory, itemId) {
  return (inventory || [])
    .filter((entry) => entry?.itemId === itemId)
    .reduce((total, entry) => total + (Number(entry.quantity) || 0), 0);
}

function isEquippedItem(player, itemId) {
  return Object.values(normalizeEquipment(player)).includes(itemId);
}

function requiresSellConfirmation(player, item) {
  if (!item) return false;
  if (item.id === "rest_stone") return true;
  if (item.rarity === "Rare" || item.rarity === "Epic") return true;
  if (item.boss || item.setId) return true;
  if (Array.isArray(player?.favoriteItems) && player.favoriteItems.includes(item.id)) return true;
  if (nonNegativeInt(player?.upgradeRanks?.[item.id]) > 0) return true;
  return false;
}

function nonNegativeInt(value, fallback = 0) {
  const number = Number(value);
  if (!Number.isFinite(number)) return fallback;
  return Math.max(0, Math.floor(number));
}

function applyRewardItems(inventory, items = []) {
  let nextInventory = inventory || [];
  for (const item of items) {
    const result = addInventoryStack(nextInventory, item.itemId, item.quantity || 1);
    if (!result.ok) return result;
    nextInventory = result.inventory;
  }
  return { ok: true, inventory: nextInventory, overflow: [] };
}

function publicEventClaimKey(event) {
  if (event?.eventId === "defend_frost_ward") {
    const wardId = typeof event.wardId === "string" ? event.wardId.trim() : "";
    if (wardId) return `${event.eventId}:${wardId}`;
  }
  const instanceId = typeof event?.eventInstanceId === "string" ? event.eventInstanceId.trim() : "";
  return instanceId || `${event?.eventId || "public_event"}:completed`;
}

function uniqueStringList(value) {
  if (!Array.isArray(value)) return [];
  return [...new Set(value.filter((entry) => typeof entry === "string"))];
}

function clampPosition(position, zone) {
  const bounds = zone === ZONES.FIELD ? 54 : zone === ZONES.FROSTVEIL ? 58 : zone === ZONES.FROSTBOUND_VAULT ? 34 : zone === ZONES.PALACE ? 32 : zone === ZONES.BOSS ? 30 : 42;
  return {
    x: Math.max(-bounds, Math.min(bounds, Number(position.x) || 0)),
    y: 0,
    z: Math.max(-bounds, Math.min(bounds, Number(position.z) || 0)),
    rot: Number(position.rot) || 0
  };
}

function defaultZonePosition(zone) {
  if (zone === ZONES.FIELD) return { x: 0, y: 0, z: 31, rot: Math.PI };
  if (zone === ZONES.FROSTVEIL) return { x: 0, y: 0, z: 24, rot: Math.PI };
  if (zone === ZONES.FROSTBOUND_VAULT) return { x: 0, y: 0, z: 18, rot: Math.PI };
  if (zone === ZONES.PALACE) return { x: 0, y: 0, z: 18, rot: Math.PI };
  if (zone === ZONES.BOSS) return { x: 0, y: 0, z: 22, rot: Math.PI };
  return { x: 0, y: 0, z: 6, rot: 0 };
}

function createChests() {
  return new Map([
    [
      "hub_weapon_cache",
      {
        id: "hub_weapon_cache",
        zone: ZONES.HUB,
        position: { x: -12, y: 0.25, z: 12 },
        coins: 18,
        items: [{ itemId: "small_health_potion", quantity: 1 }],
        openedBy: new Set()
      }
    ],
    [
      "field_north_cache",
      {
        id: "field_north_cache",
        zone: ZONES.FIELD,
        position: { x: -8, y: 0.25, z: 22 },
        coins: 28,
        items: [{ itemId: "small_health_potion", quantity: 1 }],
        openedBy: new Set()
      }
    ],
    [
      "field_south_cache",
      {
        id: "field_south_cache",
        zone: ZONES.FIELD,
        position: { x: 20, y: 0.25, z: -22 },
        coins: 36,
        items: [{ itemId: "rusty_blade", quantity: 1 }],
        openedBy: new Set()
      }
    ],
    [
      "frostveil_snow_cache",
      {
        id: "frostveil_snow_cache",
        zone: ZONES.FROSTVEIL,
        position: { x: -10, y: 0.25, z: -12 },
        coins: 45,
        items: [{ itemId: "ice_shard", quantity: 2 }],
        openedBy: new Set()
      }
    ]
  ]);
}
