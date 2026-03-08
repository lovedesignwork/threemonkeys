# Design Specifications

## Header Component

### Desktop Header
- **Logo**: Use `/images/HW Logo.png`
- **Font**: Oswald Regular 400
- **Font Size**: 22px
- **Text Transform**: ALL CAPS
- **Letter Spacing**: tracking-wide

### Navigation Items (in order)
1. COMBINED ZIPLINE
2. ZIPLINE
3. ROLLER
4. SKYWALK
5. SLINGSHOT
6. BLOG
7. FAQ
8. CONTACT

### Removed Elements
- Phone number
- "BOOK NOW" button

### Behavior
- Fixed position at top
- Transparent background initially
- Changes background on scroll (bg-primary-dark/95 backdrop-blur-md)

---

## Hero Slideshow

### Images
Located in `/public/images/Hero Image/`:
- Combined Zipline image
- Zipline (32 Platform) image
- Roller Zipline image
- Skywalk image
- Slingshot2.jpg (for Slingshot slide)

### Overlay
- Diagonal gradient (135deg)
- Very subtle opacity:
  ```css
  background: linear-gradient(
    135deg,
    rgba(6, 13, 26, 0.25) 0%,
    rgba(6, 13, 26, 0.12) 40%,
    rgba(6, 13, 26, 0.05) 70%,
    rgba(6, 13, 26, 0.08) 100%
  );
  ```

### Text Readability
- Use text shadows instead of background overlay:
  ```css
  text-shadow: 0 2px 10px rgba(0,0,0,0.8),
               0 4px 20px rgba(0,0,0,0.6),
               0 0 40px rgba(0,0,0,0.4);
  ```

### Top Gradient (for menu visibility)
```html
<div class="absolute top-0 left-0 right-0 h-28 bg-gradient-to-b from-primary-dark via-primary-dark/60 to-transparent z-10" />
```

### Bottom Gradient (for slider panel visibility)
```html
<div class="absolute bottom-0 left-0 right-0 h-28 bg-gradient-to-t from-primary-dark via-primary-dark/60 to-transparent z-10" />
```

---

## Featured Packages Section

### Section Background
- Solid `bg-primary-dark` (#0D1259)
- Grunge texture overlay at 20% opacity: `/images/grungebg.png`

### Layout Structure

#### World A+ (Featured Horizontal Card)
- Full width, horizontal layout (flex-row on lg)
- Image on left (50%), content on right (50%)
- Animated golden border around entire card
- Animated deep blue background gradient

#### Main Package Grid (3 columns)
Packages in order:
1. World C+
2. World D+
3. World B+
4. 32 Platform Zipline
5. 18 Platform Zipline
6. 10 Platform Zipline

#### Three Column Section (Roller, Skywalk, Slingshot)
- 3-column grid
- Packages: Roller Zipline, Skywalk, Slingshot, Slingshot+
- All have animated silver borders

### Card Borders by Package Type

#### Golden Border (World A+, B+, C+, D+)
```css
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
    #ffd700, #ffb347, #ffd700, #fff8dc, #ffd700, #daa520, #ffd700
  );
  -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
  mask-composite: exclude;
  animation: rotate-golden 12s linear infinite;
  z-index: 0;
}
```

#### Silver Border (32, 18, 10 Platform Zipline)
```css
.animated-silver-border::before {
  background: conic-gradient(
    from var(--angle, 0deg),
    #c0c0c0, #e8e8e8, #a8a8a8, #ffffff, #c0c0c0, #d8d8d8, #c0c0c0
  );
  /* Same mask and animation as golden */
}
```

#### Silver Border (Roller, Skywalk, Slingshot, Slingshot+)
Same as above silver border

### Card Background Gradients

Each package type has unique animated background:

| Package | Background Class | Colors |
|---------|-----------------|--------|
| World A+ | `animated-card-bg-deep-blue` | #2000f0, #1a237e, #0d1259 |
| World B+ | `animated-card-bg-mint` | Dark mint greens |
| World C+ | `animated-card-bg-purple` | Purple tones with royal blue |
| World D+ | `animated-card-bg-blue-green` | #1a237e, #0d1259, #1b5e20 |
| 32/18/10 Platform | `animated-card-bg-turquoise-mint` | Dark turquoise mint + royal blue |
| Roller/Skywalk/Slingshot | `animated-card-bg-turquoise-mint` | Same as platforms |

Animation: `card-bg-shift 100s ease infinite`

### Button Styling

All buttons have:
- Animated golden/silver border (matching card border)
- Animated dark blue gradient background
- Animation moves in OPPOSITE direction to card background
- White text, 19px font size
- Oswald Regular 400
- Hover: scale 1.05, increased shadow

```css
.animated-button-gradient {
  background: linear-gradient(135deg, #0d1259, #1a237e, #0d1259, #1e3a8a, #0d1259);
  background-size: 400% 400%;
  animation: gradient-rotate-reverse 15s ease infinite;
}
```

### Package Card Content

#### Image Section
- Height: `h-72` (288px) - 30% taller than original
- No gradient overlay on image
- Hover: scale 1.1 transition

#### Stats Display
- White stat numbers
- Stats shown in grid layout
- If package has ≤4 stats: single row
- If package has 5+ stats: 2 rows, second row centered
- Remove stats grid entirely for packages with only 1-2 stats

#### Includes Badges
- Yellow background (`bg-yellow-400`)
- Black text and icons
- Center aligned
- "Free Meal" and "Round Trip Transfer"

#### Circle Background Decoration
- Use `/images/circlebg.png`
- 10% opacity
- Random positioning per card
- Slow orbiting animation (20s duration)

### Card Hover Effects
- Light blue glow: `from-blue-400 to-blue-300`
- Scale and shadow increase

---

## Why Choose Us Section

### Background
- Image: `/images/BG_resize.jpg`
- Full opacity (100%)
- 15% black overlay on top

### Cards
- Blurred glass effect (`backdrop-blur-md`)
- 30% dark blue overlay (`bg-primary-dark/30`)

---

## Photo Gallery Section

### Layout
- 3 rows of horizontally scrolling images
- 4 columns visible at a time (`w-[25vw]`)
- Image height: 280px
- Rounded corners: `rounded-2xl`
- Gap between images: `gap-4`

### Images
Located in `/public/images/Gallery/`:
- 34 images total (Hanuman World Phuket 1-34 Zipline.jpg/JPG/jpeg)
- URL encode spaces in filenames: `%20`

### Animation Speeds (right to left movement)
- Row 1: 42 seconds
- Row 2: 137 seconds (slowest)
- Row 3: 47 seconds

### Spacing
- 30px padding at top of section (`!pt-[30px]`)

---

## Global CSS Animations

### Keyframes Required

```css
@keyframes rotate-golden {
  from { --angle: 0deg; }
  to { --angle: 360deg; }
}

@keyframes gradient-rotate {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}

@keyframes gradient-rotate-reverse {
  0% { background-position: 100% 50%; }
  50% { background-position: 0% 50%; }
  100% { background-position: 100% 50%; }
}

@keyframes card-bg-shift {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}

@keyframes circle-orbit-1 {
  0% { transform: translate(0, 0) rotate(0deg); }
  25% { transform: translate(20px, -20px) rotate(90deg); }
  50% { transform: translate(0, -40px) rotate(180deg); }
  75% { transform: translate(-20px, -20px) rotate(270deg); }
  100% { transform: translate(0, 0) rotate(360deg); }
}
/* Similar for circle-orbit-2, circle-orbit-3 with variations */
```

### Animation Durations
- Golden/Silver border rotation: 12s
- Button gradient: 15s
- Card background shift: 100s
- Circle orbit: 20s
