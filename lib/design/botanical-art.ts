/** Stable compositions: a section keeps its drawing across renders and locales. */
export const flowerFamilies = [
  'orchid', 'hibiscus', 'frangipani', 'jasmine', 'lotus',
  'ginger', 'passionflower', 'magnolia', 'bellflower',
] as const;

export type FlowerFamily = typeof flowerFamilies[number];

export function botanicalSeed(identity: string): number {
  let hash = 2166136261;
  for (const character of identity) {
    hash ^= character.charCodeAt(0);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

export function botanicalPage(pathname: string): string {
  const path = pathname.replace(/^\/(en|th|cn|ja|ko|ru|fr|es|ar)(?=\/|$)/, '') || '/';
  // Reservation tokens identify bookings, not designs. Never expose them in
  // decorative attributes or use them to personalize public artwork.
  return path.startsWith('/reservation/') ? '/reservation' : path;
}

export function botanicalRecipe(identity: string) {
  const seed = botanicalSeed(identity);
  let state = seed;
  const next = (min: number, max: number) => {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
    return Math.round((min + (state / 4294967296) * (max - min)) * 100) / 100;
  };

  return {
    seed,
    family: flowerFamilies[seed % flowerFamilies.length],
    arrangement: seed % 3,
    duration: next(27, 43),
    bend: next(-70, 70),
    petalLength: next(36, 62),
    petalWidth: next(15, 30),
    leafLength: next(58, 96),
    leafWidth: next(15, 34),
    leafType: (seed >>> 4) % 3,
    blooms: [
      { x: next(165, 225), y: next(135, 200), scale: next(.9, 1.15), angle: next(-25, 25) },
      { x: next(60, 110), y: next(285, 345), scale: next(.65, .9), angle: next(-50, -15) },
      { x: next(280, 335), y: next(375, 440), scale: next(.75, 1.05), angle: next(20, 50) },
    ],
  };
}
