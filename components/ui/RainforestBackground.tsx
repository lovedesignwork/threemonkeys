'use client';

import { useMemo, useRef, type CSSProperties } from 'react';
import { useInView } from 'framer-motion';
import { usePathname } from 'next/navigation';
import { botanicalPage, botanicalRecipe } from '@/lib/design/botanical-art';
import { BotanicalDrawing } from './BotanicalDrawing';
import styles from './RainforestBackground.module.css';

type RainforestScene = 'palms' | 'vines' | 'leaves' | 'bamboo' | 'canopy' | 'ferns';

// Botanical line work inspired by the palms, bamboo and layered foliage in
// the restaurant photography. Kept as vectors for crisp, lightweight artwork.
function Palm() {
  return (
    <g>
      <path d="M35 590C60 402 133 210 350 65M41 590C67 400 143 206 350 65" />
      {Array.from({ length: 20 }, (_, i) => {
        const t = i / 20;
        const x = 76 + t * t * 274;
        const y = 414 - t * 350;
        const length = Math.sin((t * .8 + .16) * Math.PI) * 151;
        return <g key={i}>
          <path d={`M${x} ${y}Q${x - length * .9} ${y - 55} ${x - length} ${y - 140}Q${x - length * .45} ${y - 73} ${x} ${y}`} />
          <path d={`M${x} ${y}Q${x + length * .72} ${y - 20} ${x + length * 1.25} ${y + 44}Q${x + length * .57} ${y + 10} ${x} ${y}`} />
        </g>;
      })}
    </g>
  );
}

function Vine() {
  return (
    <g>
      <path d="M132 -30C262 70 85 122 150 238S305 358 194 480S160 589 212 645" />
      <path d="M300 -15C187 90 336 154 271 275S200 384 286 471" opacity=".6" />
      {Array.from({ length: 12 }, (_, i) => {
        const y = 40 + i * 47;
        const x = 175 + Math.sin(i * .9) * 42;
        return <g key={i} transform={`translate(${x} ${y}) rotate(${i % 2 ? -55 : 118})`}>
          <path d="M0 0C-7-25-50-53-35-78C-23-98-8-82 0-66C8-83 31-96 40-74C50-49 12-21 0 0Z" fill="currentColor" fillOpacity=".055" />
          <path d="M0 0Q3-33 0-66M0-22-23-52M1-39 25-63" opacity=".65" />
        </g>;
      })}
      <path d="M194 480C267 463 265 538 233 528C205 519 231 491 243 510M150 238C80 221 70 280 97 276" />
    </g>
  );
}

function BananaLeaf({ transform }: { transform: string }) {
  return (
    <g transform={transform}>
      <path d="M20 390C-51 267-62 74 60 0C167 75 161 280 20 390Z" fill="currentColor" fillOpacity=".06" />
      <path d="M9 480C17 318 38 138 60 0" />
      {Array.from({ length: 15 }, (_, i) => {
        const y = 40 + i * 22;
        const x = 58 - i * 2.35;
        const spread = Math.sin(((i + 2) / 18) * Math.PI) * 78;
        return <g key={i} opacity=".7">
          <path d={`M${x} ${y}Q${x - spread * .4} ${y - 20} ${x - spread} ${y - 33}`} />
          <path d={`M${x} ${y}Q${x + spread * .65} ${y - 30} ${x + spread} ${y - 58}`} />
        </g>;
      })}
    </g>
  );
}

function BroadLeaves() {
  return <g>
    <BananaLeaf transform="translate(190 80) rotate(22)" />
    <BananaLeaf transform="translate(-25 360) rotate(-40) scale(.78)" />
  </g>;
}

function Bamboo() {
  return <g>
    {[0, 1, 2, 3].map((stem) => <g key={stem} transform={`translate(${50 + stem * 62} 0) rotate(${stem * 4 - 5} 0 600)`}>
      <path d="M0 670Q14 340 2-40M15 670Q29 340 16-40" />
      {Array.from({ length: 8 }, (_, i) => <g key={i} transform={`translate(${Math.sin(i / 3) * 7} ${i * 87})`}>
        <path d="M-3 0Q9 6 20 0M-2 5Q9 11 20 5" />
        {i % 2 === stem % 2 && <g transform={`translate(12 4) scale(${i % 3 ? 1 : -1} 1)`}>
          <path d="M0 0Q65-62 125-78M39-33Q65-8 90 4" />
          {[0, 1, 2, 3].map((leaf) => <g key={leaf} transform={`translate(${30 + leaf * 22} ${-27 - leaf * 13}) rotate(${leaf * 9})`}>
            <path d="M0 0Q-10-35 5-69Q18-29 0 0M0 0Q40-6 66 17Q28 22 0 0" fill="currentColor" fillOpacity=".05" />
          </g>)}
        </g>}
      </g>)}
    </g>)}
  </g>;
}

function Canopy() {
  return <g>
    <path d="M60 660C97 510 104 387 91 176M83 660C120 492 123 367 108 173M103 362Q183 268 262 229M105 330Q40 262-4 233M112 241Q177 176 187 110" />
    <path d="M278 664Q255 461 288 284M296 664Q276 432 301 285M284 408Q221 365 208 319M287 365Q350 314 407 306" opacity=".6" />
    {[[-8, 180, 1.15], [102, 122, 1.1], [214, 198, 1], [322, 255, .85], [62, 303, .68]].map(([x, y, scale], i) => <g key={i} transform={`translate(${x} ${y}) scale(${scale})`}>
      {[-65, -5, 58].map(angle => <g key={angle} transform={`rotate(${angle})`}>
        <path d="M0 45Q-4-16 22-102" />
        {[0, 1, 2, 3].map(leaf => <g key={leaf} transform={`translate(${leaf * leaf * 1.4} ${10 - leaf * 28})`}>
          <path d="M0 0C-24 5-45-16-53-39C-23-42-7-17 0 0ZM0 0C25 3 50-23 53-47C26-42 4-24 0 0Z" fill="currentColor" fillOpacity=".04" />
          <path d="M-42-31 0 0 43-37" opacity=".5" />
        </g>)}
      </g>)}
    </g>)}
    <path d="M-50 609Q125 535 235 576T480 559M-50 635Q138 564 245 602T490 582" opacity=".5" />
  </g>;
}

function Fern({ transform }: { transform: string }) {
  return <g transform={transform}>
    <path d="M0 400Q-18 199 86 10" />
    {Array.from({ length: 16 }, (_, i) => {
      const t = i / 16;
      const x = t * t * 86;
      const y = 357 - i * 21;
      const width = Math.sin((t * .88 + .08) * Math.PI) * 89;
      return <g key={i}>
        <path d={`M${x} ${y}Q${x - width * .8} ${y + 6} ${x - width} ${y - 18}Q${x - width * .42} ${y - 17} ${x} ${y}M${x} ${y}Q${x + width * .8} ${y + 6} ${x + width} ${y - 18}Q${x + width * .42} ${y - 17} ${x} ${y}`} fill="currentColor" fillOpacity=".055" />
        <path d={`M${x - width * .75} ${y - 12} ${x} ${y} ${x + width * .75} ${y - 12}`} opacity=".55" />
      </g>;
    })}
  </g>;
}

function Ferns() {
  return <g>
    <Fern transform="translate(168 245) rotate(-35)" />
    <Fern transform="translate(216 230) rotate(30) scale(.9)" />
    <Fern transform="translate(73 372) rotate(-67) scale(.75)" />
    <path d="M190 653C212 545 167 489 137 519C112 544 150 572 163 547C174 525 147 522 145 537" />
  </g>;
}

const scenes = { palms: Palm, vines: Vine, leaves: BroadLeaves, bamboo: Bamboo, canopy: Canopy, ferns: Ferns };

type RainforestBackgroundProps = {
  scene?: RainforestScene;
  designKey?: string;
  light?: boolean;
  quiet?: boolean;
};

export function RainforestBackground({ scene, designKey, light = false, quiet = false }: RainforestBackgroundProps) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { margin: '80px 0px' });
  const pathname = usePathname();
  const page = botanicalPage(pathname || '/');
  const identity = `${page}:${designKey || scene || 'garden'}`;
  const recipe = useMemo(() => botanicalRecipe(identity), [identity]);
  // Preserve the six original homepage drawings. Shared sections elsewhere
  // receive their own route-specific flowers instead of repeating that art.
  const Drawing = scene && !designKey && page === '/' ? scenes[scene] : null;
  const composition = Drawing ? styles[scene!] : `${styles.flora} ${styles[`arrangement${recipe.arrangement}`] || ''}`;

  return (
    <div
      ref={ref}
      aria-hidden="true"
      data-rainforest={Drawing ? scene : recipe.family}
      data-botanical-design={identity}
      data-active={inView}
      className={`${styles.root} ${composition} ${light ? styles.light : ''} ${quiet ? styles.quiet : ''}`}
      style={Drawing ? undefined : { '--sway': `${recipe.duration}s` } as CSSProperties}
    >
      <div className={styles.wash} />
      <div className={`${styles.frame} ${styles.left}`}>
        <svg className={styles.drawing} viewBox="-90 -40 570 760" fill="none" stroke="currentColor" strokeWidth="1.15" strokeLinecap="round" strokeLinejoin="round" focusable="false">
          {Drawing ? <Drawing /> : <BotanicalDrawing identity={`${identity}/left`} />}
        </svg>
      </div>
      <div className={`${styles.frame} ${styles.right}`}>
        <svg className={styles.drawing} viewBox="-90 -40 570 760" fill="none" stroke="currentColor" strokeWidth="1.15" strokeLinecap="round" strokeLinejoin="round" focusable="false">
          {Drawing ? <Drawing /> : <BotanicalDrawing identity={`${identity}/right`} />}
        </svg>
      </div>
    </div>
  );
}
