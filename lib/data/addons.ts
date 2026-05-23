/**
 * Promotional add-on catalog.
 *
 * Single source of truth for both the public checkout UI and the
 * server-side payment intent creation route. Keep this in sync with the
 * pricing offered to customers.
 */
export interface PromotionalAddon {
  id: string;
  name: string;
  price: number;
}

export const PROMOTIONAL_ADDONS: PromotionalAddon[] = [
  { id: 'violin-dinner', name: 'Private Dinner With Violin 1 Hour', price: 6000 },
  { id: 'saxophone-dinner', name: 'Private Dinner With Saxophone', price: 6000 },
  { id: 'spark-fountain', name: 'Spark Fountain & Smoke Machine', price: 2500 },
  { id: 'honeymoon-anniversary', name: 'Honeymoon Anniversary', price: 1999 },
  { id: 'birthday-mini', name: 'Birthday Mini', price: 1200 },
  { id: 'private-transfer', name: 'Private Round-Trip Transfer', price: 2000 },
];

export function getAddonById(id: string): PromotionalAddon | undefined {
  return PROMOTIONAL_ADDONS.find((a) => a.id === id);
}

// ============================================================
// Package pricing helpers (mirrors the booking/checkout UI logic)
// ============================================================

const SPECIAL_PACKAGE_IDS = [
  'ultimate-dinner',
  'ultimate-birthday',
  'ultimate-romantic-dinner',
  'will-you-marry-me',
];

const PER_TABLE_PACKAGE_IDS = ['monkey-dome', 'monkey-nest'];

export function isSpecialPackage(packageId: string | null | undefined): boolean {
  if (!packageId) return false;
  return SPECIAL_PACKAGE_IDS.includes(packageId);
}

export function isPerTablePackage(packageId: string | null | undefined): boolean {
  if (!packageId) return false;
  return PER_TABLE_PACKAGE_IDS.includes(packageId);
}

/**
 * Fixed-price packages charge a flat package price regardless of guest
 * count (per-table seats + special packages). All other packages are
 * priced per-person.
 */
export function isFixedPricePackage(packageId: string | null | undefined): boolean {
  return isPerTablePackage(packageId) || isSpecialPackage(packageId);
}
