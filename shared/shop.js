import { getItem } from "./items.js";

export const SHOP_STOCK = [
  { itemId: "wooden_sword", price: 0 },
  { itemId: "rusty_blade", price: 35 },
  { itemId: "goblin_dagger", price: 65 },
  { itemId: "wolf_fang_blade", price: 120 },
  { itemId: "stone_club", price: 155 },
  { itemId: "small_health_potion", price: 15 },
  { itemId: "greater_health_potion", price: 55 },
  { itemId: "burn_salve", price: 28 },
  { itemId: "fire_resistance_tonic", price: 48 },
  { itemId: "cinderbrand_sword", price: 540 },
  { itemId: "ashfang_dagger", price: 320 },
  { itemId: "emberstaff", price: 560 },
  { itemId: "coral_blade", price: 680 },
  { itemId: "pearl_wand", price: 700 },
  { itemId: "reefguard_shield", price: 620 },
  { itemId: "stormblade", price: 1180 },
  { itemId: "stormcaller_staff", price: 1260 },
  { itemId: "stormwall_shield", price: 980 },
  { itemId: "stormrunner_vest", price: 1040 }
];

export const SELL_VALUE_RATE = 0.4;
export const BUYBACK_LIMIT = 12;

const RARITY_BASE_VALUES = {
  Common: 30,
  Uncommon: 90,
  Rare: 220,
  Epic: 520
};

const TYPE_BASE_VALUES = {
  weapon: 20,
  staff: 24,
  armor: 22,
  consumable: 10,
  material: 8,
  special: 120
};

function finiteNumber(value, fallback = 0) {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

function nonNegativeInt(value, fallback = 0) {
  return Math.max(0, Math.floor(finiteNumber(value, fallback)));
}

export function normalizeTradeQuantity(quantity = 1) {
  const number = Number(quantity);
  if (!Number.isFinite(number)) return 0;
  return Math.floor(number);
}

export function getShopStock(itemId) {
  return SHOP_STOCK.find((entry) => entry.itemId === itemId) || null;
}

export function estimatePurchaseValue(itemId) {
  const stock = getShopStock(itemId);
  if (stock && stock.price > 0) return stock.price;

  const item = getItem(itemId);
  if (!item) return 0;
  if (Number.isFinite(Number(item.purchaseValue))) return Math.max(0, Math.floor(Number(item.purchaseValue)));
  if (Number.isFinite(Number(item.value))) return Math.max(0, Math.floor(Number(item.value)));

  const rarityValue = RARITY_BASE_VALUES[item.rarity] || RARITY_BASE_VALUES.Common;
  const typeValue = TYPE_BASE_VALUES[item.type] || 10;
  const statValue =
    (nonNegativeInt(item.attack) * 12) +
    (nonNegativeInt(item.defense) * 10) +
    (nonNegativeInt(item.magicPower) * 12) +
    (nonNegativeInt(item.health) * 2) +
    (nonNegativeInt(item.heal) * 0.5);

  return Math.max(0, Math.round(typeValue + rarityValue + statValue));
}

export function itemSellUnitValue(itemId) {
  const item = getItem(itemId);
  if (!item || isQuestItem(item)) return 0;
  return Math.max(0, Math.floor(estimatePurchaseValue(itemId) * SELL_VALUE_RATE));
}

export function itemSellValue(itemId, quantity = 1) {
  const count = normalizeTradeQuantity(quantity);
  if (count <= 0) return 0;
  return itemSellUnitValue(itemId) * count;
}

export function isQuestItem(item) {
  return Boolean(item?.questItem || item?.type === "quest");
}

export function isItemSellable(itemId) {
  const item = getItem(itemId);
  return Boolean(item && !isQuestItem(item) && itemSellUnitValue(itemId) > 0);
}

export function createBuybackEntry(itemId, quantity, saleValue, now = Date.now(), nonce = Math.random()) {
  const count = Math.max(1, normalizeTradeQuantity(quantity));
  const coins = nonNegativeInt(saleValue);
  return {
    id: createBuybackId(itemId, now, nonce),
    itemId,
    quantity: count,
    unitValue: Math.max(0, Math.floor(coins / count)),
    saleValue: coins,
    cost: coins,
    soldAt: now
  };
}

export function normalizeBuyback(entries = []) {
  if (!Array.isArray(entries)) return [];
  return entries
    .filter((entry) => entry && typeof entry.itemId === "string" && getItem(entry.itemId))
    .map((entry) => {
      const quantity = Math.max(1, normalizeTradeQuantity(entry.quantity));
      const saleValue = nonNegativeInt(entry.saleValue ?? entry.coins ?? itemSellValue(entry.itemId, quantity));
      const cost = nonNegativeInt(entry.cost ?? entry.buybackPrice ?? saleValue);
      return {
        id: typeof entry.id === "string" && entry.id.trim() ? entry.id : createBuybackId(entry.itemId, entry.soldAt || Date.now()),
        itemId: entry.itemId,
        quantity,
        unitValue: nonNegativeInt(entry.unitValue, Math.floor(saleValue / quantity)),
        saleValue,
        cost,
        soldAt: nonNegativeInt(entry.soldAt, Date.now())
      };
    })
    .slice(0, BUYBACK_LIMIT);
}

function createBuybackId(itemId, now = Date.now(), nonce = Math.random()) {
  const safeItemId = String(itemId || "item").replace(/[^a-z0-9_-]/gi, "");
  return `bb_${safeItemId}_${Number(now).toString(36)}_${Math.floor(Number(nonce) * 1000000).toString(36)}`;
}
