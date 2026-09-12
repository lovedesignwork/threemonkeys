import { botanicalRecipe, type FlowerFamily } from '@/lib/design/botanical-art';

function Flower({ family, length: l, width: w }: { family: FlowerFamily; length: number; width: number }) {
  const petal = (count: number, path: string, veins = true) => Array.from({ length: count }, (_, i) => (
    <g key={i} transform={`rotate(${i * 360 / count})`}>
      <path d={path} fill="currentColor" fillOpacity=".055" />
      {veins && <path d={`M0-5Q${w * .18}-${l * .45} 0-${l * .78}`} opacity=".5" />}
    </g>
  ));

  switch (family) {
    case 'orchid':
      return <g>
        {petal(5, `M0-3C${-w * 1.6}-${l * .25} ${-w * 1.5}-${l * .95} 0-${l}C${w * 1.5}-${l * .95} ${w * 1.6}-${l * .25} 0-3Z`)}
        <path d="M-7-4C-22 1-28 21-12 29Q0 17 12 29C28 21 22 1 7-4Q0 5-7-4ZM-4 5Q0 14 4 5" fill="currentColor" fillOpacity=".09" />
      </g>;
    case 'hibiscus':
      return <g>
        {petal(5, `M0 0C${-w * 1.8}-${l * .32} ${-w * 1.4}-${l * 1.12} 0-${l}C${w * 1.2}-${l * 1.13} ${w * 1.8}-${l * .36} 0 0Z`)}
        <path d={`M0 0Q17-13 23-${l * 1.1}M3 1Q22-13 26-${l * 1.1}`} />
        {[0, 1, 2, 3, 4].map(i => <circle key={i} cx={23 + (i % 2 ? -4 : 4)} cy={-l + i * 6} r="2" />)}
      </g>;
    case 'frangipani':
      return <g>
        {petal(5, `M0 1C${-w}-${l * .15} ${-w * .7}-${l * .85} 2-${l}C${w * 1.7}-${l * 1.1} ${w * 1.7}-${l * .35} 0 1Z`, false)}
        {petal(5, `M0 0Q${w * 1.1}-${l * .4} 2-${l}`, false)}
        <circle r="4" />
      </g>;
    case 'jasmine':
      return <g>
        {petal(7, `M0-4Q${-w}-${l * .55} 0-${l}Q${w * .72}-${l * .4} 0-4Z`)}
        <circle r="6" /><circle r="2" />
      </g>;
    case 'lotus':
      return <g transform="translate(0 25)">
        {[-66, -43, -21, 0, 21, 43, 66].map(angle => <g key={angle} transform={`rotate(${angle})`}>
          <path d={`M0 0C${-w * 1.3}-${l * .25} ${-w * .65}-${l * .8} 0-${l * 1.25}C${w * .9}-${l * .7} ${w}-${l * .25} 0 0Z`} fill="currentColor" fillOpacity=".06" />
          <path d={`M0 0Q-3-${l * .6} 0-${l}`} opacity=".45" />
        </g>)}
        <path d="M-38 2Q0 22 38 2M-28 7Q0 25 28 7" />
      </g>;
    case 'ginger':
      return <g>
        <path d={`M0 35Q-5-24 0-${l * 1.6}`} />
        {[0, 1, 2, 3, 4, 5].map(i => <g key={i} transform={`translate(0 ${22 - i * 17}) scale(${i % 2 ? -1 : 1} 1)`}>
          <path d={`M0 10C${-w * 1.5} 9 ${-w * 1.7}-16 ${-w * .7}-29Q${w * .1}-12 0 10Z`} fill="currentColor" fillOpacity=".075" />
          <path d={`M0 10Q${-w * .8}-1 ${-w * .7}-23`} opacity=".6" />
        </g>)}
      </g>;
    case 'passionflower':
      return <g>
        {petal(10, `M0-10Q${-w * .64}-${l * .78} 0-${l}Q${w * .64}-${l * .7} 0-10Z`)}
        {Array.from({ length: 18 }, (_, i) => <path key={i} transform={`rotate(${i * 20})`} d={`M0-8Q5-${l * .3} 0-${l * .64}`} opacity=".7" />)}
        <circle r="13" /><circle r="7" /><path d="M0-7 0-21M-6 3-20 12M6 3 20 12" />
      </g>;
    case 'magnolia':
      return <g>
        {petal(8, `M0-3C${-w}-${l * .24} ${-w}-${l} 0-${l}C${w}-${l} ${w}-${l * .24} 0-3Z`)}
        <ellipse rx="5" ry="13" fill="currentColor" fillOpacity=".08" />
        <path d="M-4-5 4-2M-4 1 4 4M-3 7 3 9" />
      </g>;
    case 'bellflower':
      return <g>
        {[-1, 0, 1].map((side) => <g key={side} transform={`translate(${side * 32} ${Math.abs(side) * 20}) rotate(${side * -28})`}>
          <path d={`M-5-${l * .8}C${-w}-${l * .5} -4-10 ${-w} 12Q-9 5 0 14Q9 5 ${w} 12C4-10 ${w}-${l * .5} 5-${l * .8}Z`} fill="currentColor" fillOpacity=".06" />
          <path d={`M0-${l} 0-${l * .8}M-4-3-4 18M4-3 4 18`} />
        </g>)}
      </g>;
  }
}

/** Each identity changes flowers, petals, branching, leaves and bloom placement. */
export function BotanicalDrawing({ identity }: { identity: string }) {
  const recipe = botanicalRecipe(identity);
  const { bend, blooms, leafLength: l, leafWidth: w } = recipe;
  return <g>
    {blooms.map((bloom, i) => <g key={i}>
      <path d={`M${145 + i * 13} 687Q${135 + bend + i * 55} ${440 + i * 48} ${bloom.x} ${bloom.y}`} />
      <g transform={`translate(${bloom.x} ${bloom.y}) rotate(${bloom.angle}) scale(${bloom.scale})`}>
        <Flower family={recipe.family} length={recipe.petalLength * (1 - i * .06)} width={recipe.petalWidth} />
      </g>
    </g>)}
    {[0, 1, 2, 3, 4, 5].map(i => {
      const x = 145 + bend * .23 + i * 12;
      const y = 590 - i * 55;
      return <g key={i} transform={`translate(${x} ${y}) rotate(${i % 2 ? 45 + i * 4 : -66 - i * 3})`}>
        <path d={`M0 18 0 0C${-w}-${l * .25} ${-w * (recipe.leafType === 1 ? 1.4 : .8)}-${l * .75} 0-${l}C${w * .85}-${l * .75} ${w}-${l * .25} 0 0Z`} fill="currentColor" fillOpacity=".04" />
        <path d={`M0 18Q3-${l * .4} 0-${l}`} />
        {[.25, .45, .65].map(t => <path key={t} d={`M0-${l * t} ${-w * .65}-${l * (t + .15)}M0-${l * t} ${w * .65}-${l * (t + .15)}`} opacity=".45" />)}
      </g>;
    })}
    <path d={`M145 676Q${50 + bend} 540 53 450M168 675Q${320 + bend} 577 365 535`} opacity=".7" />
    <path d="M53 450C29 437 38 411 56 403C70 426 72 442 53 450ZM365 535C343 516 365 488 380 485C389 510 387 529 365 535Z" fill="currentColor" fillOpacity=".055" />
  </g>;
}
