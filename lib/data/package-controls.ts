/**
 * Admin-controlled package availability + pricing overrides.
 *
 * Stored in the `site_settings` table under the `package_controls` key
 * (same pattern as `disabled_addons`). The hardcoded catalog in
 * lib/data/packages.ts remains the source of default prices; these controls
 * layer on top of it so the admin dashboard can:
 *
 *  - disable/enable a package entirely (hidden from all public surfaces)
 *  - block specific dates for a package (not bookable on those dates)
 *  - override the sale price of a package
 *
 * IMPORTANT: price overrides only affect NEW bookings. Existing bookings
 * snapshot their price into `bookings.total_amount` at purchase time and are
 * never touched by a price change.
 */

export interface PackageControls {
  /** Package ids that are fully disabled (hidden / not bookable). */
  disabledPackages: string[];
  /** Package id -> list of 'YYYY-MM-DD' dates on which it cannot be booked. */
  blockedDates: Record<string, string[]>;
  /** Package id -> overridden price in THB (replaces the catalog price). */
  priceOverrides: Record<string, number>;
}

export const PACKAGE_CONTROLS_KEY = 'package_controls';

export const EMPTY_PACKAGE_CONTROLS: PackageControls = {
  disabledPackages: [],
  blockedDates: {},
  priceOverrides: {},
};

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

/** Validate/sanitize a raw value from the database (or a POST body). */
export function normalizePackageControls(raw: unknown): PackageControls {
  if (!raw || typeof raw !== 'object') return { ...EMPTY_PACKAGE_CONTROLS };
  const obj = raw as Record<string, unknown>;

  const disabledPackages = Array.isArray(obj.disabledPackages)
    ? obj.disabledPackages.filter((id): id is string => typeof id === 'string')
    : [];

  const blockedDates: Record<string, string[]> = {};
  if (obj.blockedDates && typeof obj.blockedDates === 'object') {
    for (const [pkgId, dates] of Object.entries(obj.blockedDates as Record<string, unknown>)) {
      if (!Array.isArray(dates)) continue;
      const valid = dates.filter((d): d is string => typeof d === 'string' && DATE_RE.test(d));
      if (valid.length > 0) blockedDates[pkgId] = [...new Set(valid)].sort();
    }
  }

  const priceOverrides: Record<string, number> = {};
  if (obj.priceOverrides && typeof obj.priceOverrides === 'object') {
    for (const [pkgId, price] of Object.entries(obj.priceOverrides as Record<string, unknown>)) {
      const n = Number(price);
      if (Number.isFinite(n) && n > 0) priceOverrides[pkgId] = Math.round(n);
    }
  }

  return { disabledPackages, blockedDates, priceOverrides };
}

export function isPackageDisabled(packageId: string | null | undefined, controls: PackageControls): boolean {
  if (!packageId) return false;
  return controls.disabledPackages.includes(packageId);
}

/** `date` must be in 'YYYY-MM-DD' format. */
export function isPackageDateBlocked(
  packageId: string | null | undefined,
  date: string | null | undefined,
  controls: PackageControls
): boolean {
  if (!packageId || !date) return false;
  return (controls.blockedDates[packageId] || []).includes(date);
}

/** Effective sale price: admin override if set, otherwise the catalog price. */
export function getEffectivePrice(
  packageId: string | null | undefined,
  basePrice: number,
  controls: PackageControls
): number {
  if (!packageId) return basePrice;
  const override = controls.priceOverrides[packageId];
  return Number.isFinite(override) && override > 0 ? override : basePrice;
}
