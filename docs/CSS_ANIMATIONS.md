# CSS Animations Reference

## Complete globals.css Animations

```css
/* ================================
   CSS CUSTOM PROPERTIES
   ================================ */

:root {
  /* Colors */
  --primary: #1a237e;
  --primary-dark: #0d1259;
  --accent: #f97316;
  --accent-dark: #c2410c;
  --accent-light: #fb923c;
  --background-dark: #060d1a;
  
  /* Fonts */
  --font-heading: var(--font-oswald);
  --font-body: var(--font-inter);
  
  /* Animation angle for conic gradients */
  --angle: 0deg;
}

/* ================================
   ANIMATED BORDER CLASSES
   ================================ */

/* Golden Border - for World A+, B+, C+, D+ */
.animated-golden-border {
  position: relative;
}

.animated-golden-border::before {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: inherit;
  padding: 3px;
  background: conic-gradient(
    from var(--angle, 0deg),
    #ffd700,
    #ffb347,
    #ffd700,
    #fff8dc,
    #ffd700,
    #daa520,
    #ffd700
  );
  -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
  -webkit-mask-composite: xor;
  mask-composite: exclude;
  animation: rotate-golden 12s linear infinite;
  z-index: 0;
}

/* Silver Border - for 32, 18, 10 Platform Zipline */
.animated-silver-border {
  position: relative;
}

.animated-silver-border::before {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: inherit;
  padding: 3px;
  background: conic-gradient(
    from var(--angle, 0deg),
    #c0c0c0,
    #e8e8e8,
    #a8a8a8,
    #ffffff,
    #c0c0c0,
    #d8d8d8,
    #c0c0c0
  );
  -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
  -webkit-mask-composite: xor;
  mask-composite: exclude;
  animation: rotate-golden 12s linear infinite;
  z-index: 0;
}

/* Turquoise Border (alternative - ended up using silver for these) */
.animated-turquoise-border {
  position: relative;
}

.animated-turquoise-border::before {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: inherit;
  padding: 3px;
  background: conic-gradient(
    from var(--angle, 0deg),
    #40e0d0,
    #48d1cc,
    #00ced1,
    #20b2aa,
    #40e0d0,
    #5f9ea0,
    #40e0d0
  );
  -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
  -webkit-mask-composite: xor;
  mask-composite: exclude;
  animation: rotate-golden 12s linear infinite;
  z-index: 0;
}

/* ================================
   ANIMATED BUTTON GRADIENTS
   ================================ */

/* Default dark blue button gradient */
.animated-button-gradient {
  background: linear-gradient(135deg, #0d1259, #1a237e, #0d1259, #1e3a8a, #0d1259);
  background-size: 400% 400%;
  animation: gradient-rotate-reverse 15s ease infinite;
}

/* Purple button variant */
.animated-btn-purple {
  background: linear-gradient(135deg, #0d1259, #4c1d95, #0d1259, #1a237e, #0d1259);
  background-size: 400% 400%;
  animation: gradient-rotate-reverse 15s ease infinite;
}

/* Mint button variant */
.animated-btn-mint {
  background: linear-gradient(135deg, #0d1259, #064e3b, #0d1259, #1a237e, #0d1259);
  background-size: 400% 400%;
  animation: gradient-rotate-reverse 15s ease infinite;
}

/* Blue-green button variant */
.animated-btn-blue-green {
  background: linear-gradient(135deg, #0d1259, #1b5e20, #0d1259, #1a237e, #0d1259);
  background-size: 400% 400%;
  animation: gradient-rotate-reverse 15s ease infinite;
}

/* Deep blue button variant */
.animated-btn-deep-blue {
  background: linear-gradient(135deg, #0d1259, #2000f0, #0d1259, #1a237e, #0d1259);
  background-size: 400% 400%;
  animation: gradient-rotate-reverse 15s ease infinite;
}

/* Turquoise mint button variant */
.animated-btn-turquoise-mint {
  background: linear-gradient(135deg, #0d1259, #0d4f4f, #0d1259, #1a237e, #0d1259);
  background-size: 400% 400%;
  animation: gradient-rotate-reverse 15s ease infinite;
}

/* ================================
   ANIMATED CARD BACKGROUNDS
   ================================ */

/* Purple - World C+ and default */
.animated-card-bg-purple {
  background: linear-gradient(135deg, #1a237e, #4c1d95, #0d1259, #4c1d95, #1a237e);
  background-size: 400% 400%;
  animation: card-bg-shift 100s ease infinite;
}

/* Mint - World B+ */
.animated-card-bg-mint {
  background: linear-gradient(135deg, #1a237e, #064e3b, #0d1259, #064e3b, #1a237e);
  background-size: 400% 400%;
  animation: card-bg-shift 100s ease infinite;
}

/* Blue-green - World D+ */
.animated-card-bg-blue-green {
  background: linear-gradient(135deg, #1a237e, #0d1259, #1b5e20, #0d1259, #1a237e);
  background-size: 400% 400%;
  animation: card-bg-shift 100s ease infinite;
}

/* Deep blue - World A+ */
.animated-card-bg-deep-blue {
  background: linear-gradient(135deg, #2000f0, #1a237e, #0d1259, #1a237e, #2000f0);
  background-size: 400% 400%;
  animation: card-bg-shift 100s ease infinite;
}

/* Golden blue - 32 Platform (alternative) */
.animated-card-bg-golden-blue {
  background: linear-gradient(135deg, #1a237e, #b8860b, #0d1259, #daa520, #1a237e);
  background-size: 400% 400%;
  animation: card-bg-shift 100s ease infinite;
}

/* Brown blue - 10 Platform (alternative) */
.animated-card-bg-brown-blue {
  background: linear-gradient(135deg, #1a237e, #5d4037, #0d1259, #4e342e, #1a237e);
  background-size: 400% 400%;
  animation: card-bg-shift 100s ease infinite;
}

/* Turquoise mint - 32, 18, 10 Platform, Roller, Skywalk, Slingshot */
.animated-card-bg-turquoise-mint {
  background: linear-gradient(135deg, #0d4f4f, #0d1259, #0d4f4f, #1a237e, #0d4f4f);
  background-size: 400% 400%;
  animation: card-bg-shift 100s ease infinite;
}

/* ================================
   CIRCLE ORBIT ANIMATIONS
   ================================ */

.animate-circle-orbit-1 {
  animation: circle-orbit-1 20s ease-in-out infinite;
}

.animate-circle-orbit-2 {
  animation: circle-orbit-2 20s ease-in-out infinite;
}

.animate-circle-orbit-3 {
  animation: circle-orbit-3 20s ease-in-out infinite;
}

/* ================================
   HERO OVERLAY
   ================================ */

.hero-overlay {
  background: linear-gradient(
    135deg,
    rgba(6, 13, 26, 0.25) 0%,
    rgba(6, 13, 26, 0.12) 40%,
    rgba(6, 13, 26, 0.05) 70%,
    rgba(6, 13, 26, 0.08) 100%
  );
}

/* ================================
   KEYFRAME DEFINITIONS
   ================================ */

@property --angle {
  syntax: '<angle>';
  initial-value: 0deg;
  inherits: false;
}

@keyframes rotate-golden {
  from {
    --angle: 0deg;
  }
  to {
    --angle: 360deg;
  }
}

@keyframes gradient-rotate {
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
}

@keyframes gradient-rotate-reverse {
  0% {
    background-position: 100% 50%;
  }
  50% {
    background-position: 0% 50%;
  }
  100% {
    background-position: 100% 50%;
  }
}

@keyframes card-bg-shift {
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
}

@keyframes circle-orbit-1 {
  0% {
    transform: translate(0, 0) rotate(0deg);
  }
  25% {
    transform: translate(20px, -20px) rotate(90deg);
  }
  50% {
    transform: translate(0, -40px) rotate(180deg);
  }
  75% {
    transform: translate(-20px, -20px) rotate(270deg);
  }
  100% {
    transform: translate(0, 0) rotate(360deg);
  }
}

@keyframes circle-orbit-2 {
  0% {
    transform: translate(0, 0) rotate(0deg);
  }
  25% {
    transform: translate(-15px, 25px) rotate(90deg);
  }
  50% {
    transform: translate(0, 50px) rotate(180deg);
  }
  75% {
    transform: translate(15px, 25px) rotate(270deg);
  }
  100% {
    transform: translate(0, 0) rotate(360deg);
  }
}

@keyframes circle-orbit-3 {
  0% {
    transform: translate(0, 0) rotate(0deg);
  }
  25% {
    transform: translate(30px, 10px) rotate(90deg);
  }
  50% {
    transform: translate(0, 20px) rotate(180deg);
  }
  75% {
    transform: translate(-30px, 10px) rotate(270deg);
  }
  100% {
    transform: translate(0, 0) rotate(360deg);
  }
}

/* ================================
   BASE STYLES
   ================================ */

html {
  scroll-behavior: smooth;
}

body {
  font-family: var(--font-body);
  background-color: var(--background-dark);
  color: white;
}

h1, h2, h3, h4, h5, h6 {
  font-family: var(--font-heading);
  font-weight: 300;
  letter-spacing: 0.02em;
  text-transform: uppercase;
}

/* Custom scrollbar */
::-webkit-scrollbar {
  width: 8px;
}

::-webkit-scrollbar-track {
  background: var(--background-dark);
}

::-webkit-scrollbar-thumb {
  background: var(--primary);
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: var(--primary-dark);
}

/* Section padding utility */
.section-padding {
  padding-top: 5rem;
  padding-bottom: 5rem;
}

@media (max-width: 768px) {
  .section-padding {
    padding-top: 3rem;
    padding-bottom: 3rem;
  }
}
```

## Animation Summary Table

| Animation | Duration | Timing | Use Case |
|-----------|----------|--------|----------|
| rotate-golden | 12s | linear | Border rotation |
| gradient-rotate | 15s | ease | Button gradients (forward) |
| gradient-rotate-reverse | 15s | ease | Button gradients (reverse) |
| card-bg-shift | 100s | ease | Card background movement |
| circle-orbit-1/2/3 | 20s | ease-in-out | Circle decorations |
