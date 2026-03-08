# Component Code Reference

This file contains the key component patterns extracted from the final working version.

---

## FeaturedPackages.tsx - Key Helper Functions

```tsx
const statLabels: Record<string, string> = {
  platforms: 'Platform',
  ziplines: 'Ziplines',
  skyBridge: 'Sky Bridge',
  abseilPoints: 'Abseil Point',
  dualZipline: 'Dual Zipline',
  spiralStaircase: 'Spiral Staircase',
  rollerZipline: 'Roller Zipline',
  skyWalk: 'Sky Walk',
  totalActivities: 'Total Activities',
  rollerZiplineMetres: 'Metres Roller Zipline',
  skywalkMetres: 'Metres Sky Walk',
};

const getContentGradient = (packageId?: string): string => {
  if (packageId === 'world-d-plus') {
    return 'animated-card-bg-blue-green';
  }
  if (packageId === 'world-b-plus') {
    return 'animated-card-bg-mint';
  }
  if (packageId === 'world-a-plus') {
    return 'animated-card-bg-deep-blue';
  }
  if (packageId === 'zipline-18' || packageId === 'zipline-32' || packageId === 'zipline-10' ||
      packageId === 'roller-zipline' || packageId === 'skywalk' || 
      packageId === 'slingshot' || packageId === 'slingshot-plus') {
    return 'animated-card-bg-turquoise-mint';
  }
  return 'animated-card-bg-purple';
};

const getButtonGradient = (packageId?: string): string => {
  if (packageId === 'world-d-plus') {
    return 'animated-btn-blue-green';
  }
  if (packageId === 'world-b-plus') {
    return 'animated-btn-mint';
  }
  if (packageId === 'world-a-plus') {
    return 'animated-btn-deep-blue';
  }
  if (packageId === 'zipline-18' || packageId === 'zipline-32' || packageId === 'zipline-10' ||
      packageId === 'roller-zipline' || packageId === 'skywalk' || 
      packageId === 'slingshot' || packageId === 'slingshot-plus') {
    return 'animated-btn-turquoise-mint';
  }
  return 'animated-btn-purple';
};

const getButtonBorder = (packageId?: string): string => {
  if (packageId === 'zipline-18' || packageId === 'zipline-32' || packageId === 'zipline-10' ||
      packageId === 'roller-zipline' || packageId === 'skywalk' || 
      packageId === 'slingshot' || packageId === 'slingshot-plus') {
    return 'animated-silver-border';
  }
  return 'animated-golden-border';
};

const getRandomPosition = (index: number) => {
  const positions = [
    { top: '10%', left: '5%', animationClass: 'animate-circle-orbit-1' },
    { top: '60%', right: '10%', animationClass: 'animate-circle-orbit-2' },
    { bottom: '20%', left: '15%', animationClass: 'animate-circle-orbit-3' },
    { top: '30%', right: '5%', animationClass: 'animate-circle-orbit-1' },
    { bottom: '10%', right: '20%', animationClass: 'animate-circle-orbit-2' },
    { top: '50%', left: '10%', animationClass: 'animate-circle-orbit-3' },
  ];
  return positions[index % positions.length];
};
```

---

## FeaturedPackages.tsx - Package Grouping

```tsx
export function FeaturedPackages() {
  const worldAPlus = packages.find(pkg => pkg.id === 'world-a-plus');
  
  // Main 3-column grid (World B+, C+, D+ and zipline platforms)
  const mainPackages = packages.filter(pkg => 
    !['world-a-plus', 'roller-zipline', 'skywalk', 'slingshot', 'slingshot-plus'].includes(pkg.id)
  );
  
  // 3-column section for standalone activities
  const threeColumnPackages = packages.filter(pkg => 
    ['roller-zipline', 'skywalk', 'slingshot'].includes(pkg.id)
  );
  
  // ... render logic
}
```

---

## World A+ Horizontal Card Structure

```tsx
{/* World A+ Featured Horizontal Card */}
{worldAPlus && (
  <div className="mb-8">
    <motion.div
      className="group relative"
      variants={staggerItem}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
    >
      {/* Outer wrapper with golden border */}
      <div className="p-[3px] rounded-2xl animated-golden-border">
        <div className="relative flex flex-col lg:flex-row rounded-2xl overflow-hidden bg-gradient-to-b lg:bg-gradient-to-r from-primary/90 to-primary-dark transition-all duration-300">
          
          {/* Image Section (50% on desktop) */}
          <div className="relative h-72 lg:h-auto lg:w-1/2 overflow-hidden">
            <div 
              className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
              style={{ 
                backgroundImage: `url(${worldAPlus.image})`,
                backgroundColor: '#1a237e'
              }}
            />
            {/* Duration Badge */}
            <div className="absolute top-4 left-4">
              <Badge>Up to 3 hours</Badge>
            </div>
            {/* Most Popular Badge */}
            <div className="absolute top-4 right-4">
              <Badge variant="accent">MOST POPULAR</Badge>
            </div>
          </div>
          
          {/* Content Section (50% on desktop) */}
          <div className={`relative p-6 lg:p-8 flex flex-col lg:w-1/2 ${getContentGradient(worldAPlus.id)} overflow-hidden`}>
            {/* Circle background decoration */}
            <div 
              className="absolute w-64 h-64 opacity-10 pointer-events-none animate-circle-orbit-1"
              style={{
                backgroundImage: 'url(/images/circlebg.png)',
                backgroundSize: 'contain',
                backgroundRepeat: 'no-repeat',
                top: '10%',
                right: '5%',
              }}
            />
            
            {/* Package Title */}
            <h3 className="text-2xl lg:text-3xl font-[family-name:var(--font-oswald)] font-normal tracking-wide text-white mb-4 relative z-10">
              {worldAPlus.name}
            </h3>
            
            {/* Stats Grid */}
            <div className="grid grid-cols-4 gap-2 mb-4 relative z-10">
              {Object.entries(worldAPlus.stats || {}).map(([key, value]) => (
                <div key={key} className="text-center">
                  <div className="text-xl font-bold text-white">{value}</div>
                  <div className="text-xs text-white/70 uppercase">{statLabels[key]}</div>
                </div>
              ))}
            </div>
            
            {/* Includes Badges */}
            <div className="flex justify-center gap-3 mb-4 relative z-10">
              {worldAPlus.includesMeal && (
                <span className="flex items-center gap-1 px-3 py-1 bg-yellow-400 text-black text-sm rounded-full">
                  <Utensils className="w-4 h-4" />
                  Free Meal
                </span>
              )}
              {worldAPlus.includesTransfer && (
                <span className="flex items-center gap-1 px-3 py-1 bg-yellow-400 text-black text-sm rounded-full">
                  <Bus className="w-4 h-4" />
                  Round Trip Transfer
                </span>
              )}
            </div>
            
            {/* CTA Button */}
            <Link href={`/booking?package=${worldAPlus.id}`} className="block mt-auto relative z-10">
              <div className={`p-[2px] rounded-xl transition-all duration-300 hover:scale-105 ${getButtonBorder(worldAPlus.id)}`}>
                <button className={`relative z-10 w-full flex items-center justify-center gap-3 py-3.5 rounded-xl ${getButtonGradient(worldAPlus.id)} text-white transition-all duration-300 shadow-lg hover:shadow-2xl overflow-hidden group/btn`}>
                  <CheckCircle className="w-[19px] h-[19px] relative z-10" />
                  <span className="font-[family-name:var(--font-oswald)] font-normal tracking-wide relative z-10 text-[19px]">
                    {formatPrice(worldAPlus.price)} / PERSON
                  </span>
                </button>
              </div>
            </Link>
          </div>
        </div>
      </div>
      
      {/* Hover glow effect */}
      <div className="absolute -inset-1 bg-gradient-to-r from-blue-400 to-blue-300 rounded-2xl opacity-0 group-hover:opacity-20 blur-xl transition-all duration-500 pointer-events-none" />
    </motion.div>
  </div>
)}
```

---

## Main Package Card Structure (3-column grid)

```tsx
{/* Main Packages Grid (3 columns) */}
<motion.div
  variants={staggerContainer}
  initial="hidden"
  whileInView="visible"
  viewport={{ once: true, margin: '-100px' }}
  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
>
  {mainPackages.map((pkg, index) => {
    const hasGoldenBorder = ['world-b-plus', 'world-c-plus', 'world-d-plus'].includes(pkg.id);
    const hasSilverBorder = ['zipline-32', 'zipline-18', 'zipline-10'].includes(pkg.id);
    const borderClass = hasGoldenBorder 
      ? 'p-[3px] rounded-2xl animated-golden-border h-full' 
      : hasSilverBorder 
        ? 'p-[3px] rounded-2xl animated-silver-border h-full' 
        : 'h-full';
    
    const stats = pkg.stats ? Object.entries(pkg.stats) : [];
    const showStats = stats.length > 2;
    const statsInOneRow = stats.length <= 4;
    
    return (
      <motion.div key={pkg.id} variants={staggerItem} className="group relative h-full">
        <div className={borderClass}>
          <div className="relative z-10 h-full flex flex-col rounded-2xl overflow-hidden bg-gradient-to-b from-primary/90 to-primary-dark transition-all duration-300">
            
            {/* Image Section */}
            <div className="relative h-72 overflow-hidden">
              <div 
                className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
                style={{ 
                  backgroundImage: `url(${pkg.image})`,
                  backgroundColor: '#1a237e'
                }}
              />
              {/* Duration Badge */}
              <div className="absolute top-4 left-4">
                <Badge>{pkg.duration}</Badge>
              </div>
            </div>
            
            {/* Content Section */}
            <div className={`relative p-5 flex flex-col flex-grow ${getContentGradient(pkg.id)} overflow-hidden`}>
              {/* Circle decoration */}
              <div 
                className={`absolute w-64 h-64 opacity-10 pointer-events-none ${getRandomPosition(index).animationClass}`}
                style={{
                  backgroundImage: 'url(/images/circlebg.png)',
                  backgroundSize: 'contain',
                  backgroundRepeat: 'no-repeat',
                  ...getRandomPosition(index),
                }}
              />
              
              {/* Package Name */}
              <h3 className="text-xl font-[family-name:var(--font-oswald)] font-normal tracking-wide text-white mb-3 text-center relative z-10">
                {pkg.name}
              </h3>
              
              {/* Stats Grid (conditional) */}
              {showStats && (
                <div className={`grid ${statsInOneRow ? `grid-cols-${stats.length}` : 'grid-cols-5'} gap-2 mb-3 relative z-10`}>
                  {stats.slice(0, statsInOneRow ? stats.length : 5).map(([key, value]) => (
                    <div key={key} className="text-center">
                      <div className="text-lg font-bold text-white">{value}</div>
                      <div className="text-[10px] text-white/70 uppercase">{statLabels[key]}</div>
                    </div>
                  ))}
                </div>
              )}
              
              {/* Second row of stats if needed */}
              {!statsInOneRow && stats.length > 5 && (
                <div className="flex justify-center gap-4 mb-3 relative z-10">
                  {stats.slice(5).map(([key, value]) => (
                    <div key={key} className="text-center">
                      <div className="text-lg font-bold text-white">{value}</div>
                      <div className="text-[10px] text-white/70 uppercase">{statLabels[key]}</div>
                    </div>
                  ))}
                </div>
              )}
              
              {/* Includes Badges */}
              <div className="flex justify-center gap-2 mb-3 relative z-10">
                {pkg.includesMeal && (
                  <span className="flex items-center gap-1 px-2 py-1 bg-yellow-400 text-black text-xs rounded-full">
                    <Utensils className="w-3 h-3" />
                    Free Meal
                  </span>
                )}
                {pkg.includesTransfer && (
                  <span className="flex items-center gap-1 px-2 py-1 bg-yellow-400 text-black text-xs rounded-full">
                    <Bus className="w-3 h-3" />
                    Round Trip Transfer
                  </span>
                )}
              </div>
              
              {/* CTA Button */}
              <Link href={`/booking?package=${pkg.id}`} className="block mt-auto relative z-10">
                <div className={`p-[2px] rounded-xl transition-all duration-300 hover:scale-105 ${getButtonBorder(pkg.id)}`}>
                  <button className={`relative z-10 w-full flex items-center justify-center gap-3 py-3.5 rounded-xl ${getButtonGradient(pkg.id)} text-white transition-all duration-300 shadow-lg hover:shadow-2xl overflow-hidden group/btn`}>
                    <CheckCircle className="w-[19px] h-[19px]" />
                    <span className="font-[family-name:var(--font-oswald)] font-normal tracking-wide text-[19px]">
                      {formatPrice(pkg.price)} / PERSON
                    </span>
                  </button>
                </div>
              </Link>
            </div>
          </div>
        </div>
        
        {/* Hover glow */}
        <div className="absolute -inset-1 bg-gradient-to-r from-blue-400 to-blue-300 rounded-2xl opacity-0 group-hover:opacity-20 blur-xl transition-all duration-500 pointer-events-none" />
      </motion.div>
    );
  })}
</motion.div>
```

---

## Three Column Section (Roller, Skywalk, Slingshot)

```tsx
{/* Roller, Skywalk, Slingshot (3 columns) */}
<motion.div
  variants={staggerContainer}
  initial="hidden"
  whileInView="visible"
  viewport={{ once: true, margin: '-100px' }}
  className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-8"
>
  {threeColumnPackages.map((pkg, index) => (
    <motion.div key={pkg.id} variants={staggerItem} className="group relative h-full">
      <div className="p-[3px] rounded-2xl animated-silver-border h-full">
        <div className="relative z-10 h-full flex flex-col rounded-2xl overflow-hidden bg-gradient-to-b from-primary/90 to-primary-dark transition-all duration-300">
          
          {/* Image Section */}
          <div className="relative h-72 overflow-hidden">
            <div 
              className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
              style={{ 
                backgroundImage: `url(${pkg.image})`,
                backgroundColor: '#1a237e'
              }}
            />
          </div>
          
          {/* Content Section */}
          <div className={`relative p-5 flex flex-col flex-grow ${getContentGradient(pkg.id)} overflow-hidden`}>
            {/* Package Name */}
            <h3 className="text-xl font-[family-name:var(--font-oswald)] font-normal tracking-wide text-white mb-3 text-center relative z-10">
              {pkg.name}
            </h3>
            
            {/* CTA Button */}
            <Link href={`/booking?package=${pkg.id}`} className="block mt-auto relative z-10">
              <div className={`p-[2px] rounded-xl transition-all duration-300 hover:scale-105 ${getButtonBorder(pkg.id)}`}>
                <button className={`relative z-10 w-full flex items-center justify-center gap-3 py-3.5 rounded-xl ${getButtonGradient(pkg.id)} text-white transition-all duration-300 shadow-lg hover:shadow-2xl overflow-hidden group/btn`}>
                  <CheckCircle className="w-[19px] h-[19px]" />
                  <span className="font-[family-name:var(--font-oswald)] font-normal tracking-wide text-[19px]">
                    {formatPrice(pkg.price)} / PERSON
                  </span>
                </button>
              </div>
            </Link>
          </div>
        </div>
      </div>
      
      {/* Hover glow */}
      <div className="absolute -inset-1 bg-gradient-to-r from-blue-400 to-blue-300 rounded-2xl opacity-0 group-hover:opacity-20 blur-xl transition-all duration-500 pointer-events-none" />
    </motion.div>
  ))}
</motion.div>
```

---

## Required Imports for FeaturedPackages.tsx

```tsx
'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { CheckCircle, Utensils, Bus } from 'lucide-react';
import { Container, Section, SectionHeader, Badge } from '@/components/ui';
import { packages } from '@/lib/data/packages';
import { formatPrice } from '@/lib/utils';
import { staggerContainer, staggerItem } from '@/lib/animations';
```

---

## Section Wrapper

```tsx
<Section className="bg-primary-dark relative overflow-hidden">
  {/* Grunge background texture */}
  <div 
    className="absolute inset-0 opacity-20 pointer-events-none"
    style={{
      backgroundImage: 'url(/images/grungebg.png)',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
    }}
  />
  <Container className="relative z-10">
    <SectionHeader
      title="Our Adventure Packages"
      subtitle="Choose from our exciting range of experiences and create unforgettable memories"
    />
    
    {/* World A+ Card */}
    {/* ... */}
    
    {/* Main Packages Grid */}
    {/* ... */}
    
    {/* Three Column Section */}
    {/* ... */}
  </Container>
</Section>
```
