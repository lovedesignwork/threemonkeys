// Promotional Add-ons (only available for advance bookings - at least 1 day in advance)
export interface Addon {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice: number | null;
  discount: string | null;
  image: string;
}

export const allAddons: Addon[] = [
  {
    id: 'violin-dinner',
    name: 'Private Dinner With Violin 1 Hour',
    description: 'Enjoy an exclusive experience with live 1 hour Violin performance — all at your own private table.',
    price: 6000,
    originalPrice: null,
    discount: null,
    image: '/images/by_slide/slide_07/threemonkeys_addon4.jpg',
  },
  {
    id: 'saxophone-dinner',
    name: 'Private Dinner With Saxophone',
    description: 'Enjoy an exclusive experience with live 1 hour saxophone performance — all at your own private table.',
    price: 6000,
    originalPrice: null,
    discount: null,
    image: '/images/by_slide/slide_07/threemonkeys_addon3.jpg',
  },
  {
    id: 'spark-fountain',
    name: 'Spark Fountain & Smoke Machine',
    description: 'Take your celebration to the next level with our dramatic spark fountain effect. Perfect for grand entrances, birthday surprises, or romantic proposals!',
    price: 2500,
    originalPrice: null,
    discount: null,
    image: '/images/by_slide/slide_17/sparkfountain.jpg',
  },
  {
    id: 'honeymoon-anniversary',
    name: 'Honeymoon Anniversary',
    description: 'Romantic table setting for Honeymoon Anniversary, Sparkling wine 1BTL (Prosecco), Bouquet of Roses, Table Decorations.',
    price: 1999,
    originalPrice: null,
    discount: null,
    image: '/images/by_slide/slide_07/threemonkeys_addon1.jpg',
  },
  {
    id: 'birthday-mini',
    name: 'Birthday Mini',
    description: 'Brownies Cake 1 Piece | 1 Set of Balloons Pole. Make your birthday extra special at Three Monkeys! Celebrate your special day with our new Birthday Promotional Set. *Note: You can specify the message for the cake plate in the notes.',
    price: 1200,
    originalPrice: null,
    discount: null,
    image: '/images/by_slide/slide_07/threemonkeys_addon2.jpg',
  },
  {
    id: 'private-transfer',
    name: 'Private Round-Trip Transfer',
    description: 'Maximum 10 Passengers / Van. *Note: Service applied in Phuket Area except for pick up from Phuket International Airport.',
    price: 2000,
    originalPrice: null,
    discount: null,
    image: '/images/by_slide/slide_07/threemonkeys_addon5.jpg',
  },
];

export function getAddonById(id: string): Addon | undefined {
  return allAddons.find(addon => addon.id === id);
}

// Special package IDs (require 1 day advance booking)
const SPECIAL_PACKAGE_IDS = ['ultimate-dinner', 'ultimate-birthday', 'will-you-marry-me'];

// Helper to check if a package is a special package
export function isSpecialPackage(packageId: string | null): boolean {
  if (!packageId) return false;
  return SPECIAL_PACKAGE_IDS.includes(packageId);
}

// Per-table packages (fixed price regardless of guest count)
export function isPerTablePackage(pkgId: string | null): boolean {
  return pkgId === 'monkey-dome' || pkgId === 'monkey-nest';
}

// Fixed price packages (special packages + per-table packages)
// These have fixed prices that don't change with guest count
export function isFixedPricePackage(pkgId: string | null): boolean {
  return isPerTablePackage(pkgId) || isSpecialPackage(pkgId);
}
