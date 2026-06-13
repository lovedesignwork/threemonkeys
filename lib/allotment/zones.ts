/**
 * Static mapping between front-end package IDs and back-end zone IDs.
 * Kept in code (not the DB) so the booking page can render without a DB round-trip.
 *
 * Source of truth for canonical zone names + time slots is the `tm_zones` table.
 * This file just lets the customer flow know "which zone does this package belong to".
 *
 * See docs/ALLOTMENT_SPEC.md section 3.
 */

export interface PackageZoneMapping {
  zoneId: string;
  zoneName: string;
  blockMinutes: number;
}

/**
 * Map a customer-facing package id (from lib/data/packages.ts) to its zone.
 * Returns null for packages that don't consume an allotment slot — e.g. special
 * packages (ultimate-dinner, ultimate-birthday, etc.) which the admin assigns
 * a table to manually.
 */
const PACKAGE_TO_ZONE: Record<string, PackageZoneMapping> = {
  'monkey-dome':                { zoneId: 'monkey-dome',           zoneName: 'Monkey Dome',                  blockMinutes: 180 },
  'monkey-nest':                { zoneId: 'monkey-nest',           zoneName: 'Monkey Nest',                  blockMinutes: 180 },
  'monkey-hilltop':             { zoneId: 'monkey-hilltop',        zoneName: 'Monkey Hilltop',               blockMinutes: 180 },
  'bamboo-pavilion':            { zoneId: 'bamboo-pavilion',       zoneName: 'Bamboo Pavilion',              blockMinutes: 180 },
  'zone-6':                     { zoneId: 'zone-t',                zoneName: 'Zone T',                       blockMinutes: 180 },
  'zone-7':                     { zoneId: 'zone-z',                zoneName: 'Zone Z',                       blockMinutes: 180 },
  'exclusive-romantic-zone-7':  { zoneId: 'exclusive-romantic',    zoneName: 'Exclusive Romantic — Zone Z',  blockMinutes: 180 },
  'rooftop-romantic':           { zoneId: 'romantic-rooftop-luge', zoneName: 'Romantic Rooftop Luge',        blockMinutes: 180 },
};

export function getZoneForPackage(packageId: string | null | undefined): PackageZoneMapping | null {
  if (!packageId) return null;
  return PACKAGE_TO_ZONE[packageId] ?? null;
}

/** Returns true if this package consumes table inventory at booking time. */
export function packageRequiresAllotment(packageId: string | null | undefined): boolean {
  return getZoneForPackage(packageId) !== null;
}

/** All package IDs that map to a zone — useful for tests / admin filters. */
export const ALLOTMENT_PACKAGE_IDS = Object.keys(PACKAGE_TO_ZONE);

/**
 * Build an ISO timestamp string for a given date + HH:MM time in Asia/Bangkok.
 * Returns e.g. "2026-06-01T19:00:00+07:00"
 */
export function buildBangkokTimestamp(date: string, timeHHMM: string): string {
  // date: "YYYY-MM-DD"; timeHHMM: "HH:MM"
  return `${date}T${timeHHMM}:00+07:00`;
}

export const ALL_ALLOTMENT_SOURCES = ['live_chat', 'phone', 'email', 'walk_in', 'admin', 'other'] as const;
