export const ITEM_TRADE_DIVISOR = 0.85;

export function round2(value: number): number {
  const num = Number(value || 0);
  if (!Number.isFinite(num)) return 0;
  return Math.round((num + Number.EPSILON) * 100) / 100;
}

/**
 * Parse total sellable units per pack from packing string
 * (e.g. "10x10" -> 100, "20x5" -> 100, "1x1" -> 1, "10 Tab" -> 10, "30" -> 30).
 */
export function parsePackingUnits(packingStr?: string | null): number {
  const clean = String(packingStr || '1x1').trim().toLowerCase();
  if (!clean) return 1;

  const multMatch = clean.match(/(\d+)\s*[x*×]\s*(\d+)/);
  if (multMatch) {
    const a = parseInt(multMatch[1], 10);
    const b = parseInt(multMatch[2], 10);
    if (Number.isFinite(a) && Number.isFinite(b) && a > 0 && b > 0) {
      return Math.max(1, a * b);
    }
  }

  const singleMatch = clean.match(
    /(\d+)\s*(tab|cap|sachet|amp|vial|strip|pack|unit|pc|pill|softgel|lozenge|'s|s\b)/i
  );
  if (singleMatch) {
    const qty = parseInt(singleMatch[1], 10);
    if (Number.isFinite(qty) && qty > 0) {
      return Math.max(1, qty);
    }
  }

  if (!/ml|mg|gm|g\b|kg|l\b|oz|drop|syr|susp|cream|oint|gel|lotion|inj|inf/i.test(clean)) {
    const plainNum = clean.match(/^(\d+)$/);
    if (plainNum) {
      const qty = parseInt(plainNum[1], 10);
      if (Number.isFinite(qty) && qty > 0) {
        return Math.max(1, qty);
      }
    }
  }

  return 1;
}

/**
 * Trade Price = Purchase Price ÷ 0.85 (rounded to 2 decimals).
 */
export function calculateTradePriceFromPurchase(purchasePrice: number): number {
  const p = Math.max(0, Number(purchasePrice) || 0);
  return p > 0 ? round2(p / ITEM_TRADE_DIVISOR) : 0;
}

export function calculateLooseRateFromRetail(
  retailPrice: number,
  packingStr?: string | null
): number {
  const retail = Math.max(0, Number(retailPrice) || 0);
  if (retail <= 0) return 0;
  const units = Math.max(1, parsePackingUnits(packingStr));
  return round2(retail / units);
}

/**
 * Derives Wholesale Price, Retail Price, and Loose Rate using Trade Price as base.
 */
export function calculatePricesFromTradePrice(
  tradePrice: number,
  packingStr?: string | null
): {
  tradePrice: number;
  wholesalePrice: number;
  retailPrice: number;
  looseRate: number;
  unitsPerPack: number;
} {
  const tp = Math.max(0, round2(tradePrice));
  const unitsPerPack = Math.max(1, parsePackingUnits(packingStr));
  const wholesalePrice = tp;
  const retailPrice = tp;
  const looseRate = calculateLooseRateFromRetail(retailPrice, packingStr);
  return {
    tradePrice: tp,
    wholesalePrice,
    retailPrice,
    looseRate,
    unitsPerPack,
  };
}

/**
 * Shared Item Master & Purchase pricing calculation from Purchase Price:
 * - Trade Price = Purchase Price ÷ 0.85
 * - Wholesale Price = Trade Price (base)
 * - Retail Price = Trade Price (base)
 * - Loose Rate = Retail Price ÷ Units Per Pack
 */
export function calculateItemPricingFromPurchase(
  purchasePrice: number,
  packingStr?: string | null
): {
  purchasePrice: number;
  tradePrice: number;
  wholesalePrice: number;
  retailPrice: number;
  looseRate: number;
  unitsPerPack: number;
} {
  const p = Math.max(0, round2(purchasePrice));
  const tradePrice = calculateTradePriceFromPurchase(p);
  const derived = calculatePricesFromTradePrice(tradePrice, packingStr);
  return {
    purchasePrice: p,
    ...derived,
  };
}
