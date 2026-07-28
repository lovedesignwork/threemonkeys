'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  EMPTY_PACKAGE_CONTROLS,
  normalizePackageControls,
  isPackageDisabled,
  isPackageDateBlocked,
  getEffectivePrice,
  type PackageControls,
} from '@/lib/data/package-controls';
import type { Package } from '@/types';

/**
 * Loads the admin package controls (disabled packages, blocked dates, price
 * overrides) on the client. Until loaded — or if the request fails — it falls
 * back to empty controls, so pages render with catalog defaults.
 */
export function usePackageControls() {
  const [controls, setControls] = useState<PackageControls>(EMPTY_PACKAGE_CONTROLS);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch('/api/package-controls', { cache: 'no-store' });
        const json = await res.json();
        if (!cancelled && res.ok) {
          setControls(normalizePackageControls(json));
        }
      } catch (err) {
        console.error('Failed to fetch package controls:', err);
      } finally {
        if (!cancelled) setLoaded(true);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const priceOf = useCallback(
    (pkg: Pick<Package, 'id' | 'price'>) => getEffectivePrice(pkg.id, pkg.price, controls),
    [controls]
  );

  const isDisabled = useCallback(
    (packageId: string | null | undefined) => isPackageDisabled(packageId, controls),
    [controls]
  );

  const isDateBlocked = useCallback(
    (packageId: string | null | undefined, date: string | null | undefined) =>
      isPackageDateBlocked(packageId, date, controls),
    [controls]
  );

  const blockedDatesFor = useCallback(
    (packageId: string | null | undefined) =>
      packageId ? controls.blockedDates[packageId] || [] : [],
    [controls]
  );

  return { controls, loaded, priceOf, isDisabled, isDateBlocked, blockedDatesFor };
}
