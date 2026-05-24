import { createNavigation } from 'next-intl/navigation';
import { routing } from './routing';

/**
 * Locale-aware drop-in replacements for `next/link` and
 * `next/navigation`. Use these instead so internal hrefs automatically
 * get the right locale prefix (or no prefix for the default locale).
 *
 *   import { Link, useRouter, usePathname } from '@/i18n/navigation';
 */
export const { Link, redirect, usePathname, useRouter, getPathname } =
  createNavigation(routing);
