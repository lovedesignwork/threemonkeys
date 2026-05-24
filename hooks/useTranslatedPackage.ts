'use client';

import { useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { Package } from '@/types';

export function useTranslatedPackage() {
  const t = useTranslations('pkgData');
  
  const getTranslatedPackage = useCallback((pkg: Package): Package => {
    try {
      const name = t(`${pkg.id}.name`);
      const shortDescription = t(`${pkg.id}.shortDesc`);
      const features = [
        t(`${pkg.id}.features.0`),
        t(`${pkg.id}.features.1`),
        t(`${pkg.id}.features.2`),
      ].filter(f => f && !f.startsWith('pkgData.'));
      
      return {
        ...pkg,
        name: name.startsWith('pkgData.') ? pkg.name : name,
        shortDescription: shortDescription.startsWith('pkgData.') ? pkg.shortDescription : shortDescription,
        features: features.length > 0 ? features : pkg.features.slice(0, 3),
      };
    } catch {
      return pkg;
    }
  }, [t]);

  return { getTranslatedPackage };
}
