# Package Data Specifications

## All Packages

### World A+ (Most Popular)
- **ID**: `world-a-plus`
- **Slug**: `world-a-plus`
- **Name**: WORLD A+
- **Price**: ฿3,490
- **Duration**: Up to 3 hours
- **Category**: combined
- **Image**: Unsplash adventure/jungle placeholder
- **Includes Meal**: Yes
- **Includes Transfer**: Yes
- **Stats**:
  - 32 Platform
  - 16 Ziplines
  - 5 Sky Bridge
  - 3 Abseil Point
  - 1 Dual Zipline
  - 1 Roller Zipline
  - 1 Sky Walk
- **Featured**: Yes
- **Border**: Golden animated
- **Background**: Deep blue (#2000f0 + royal blue)

---

### World B+
- **ID**: `world-b-plus`
- **Slug**: `world-b-plus`
- **Name**: WORLD B+
- **Price**: ฿2,900
- **Duration**: Up to 2.5 hours
- **Category**: combined
- **Includes Meal**: Yes
- **Includes Transfer**: Yes
- **Stats**:
  - 32 Platform
  - 16 Ziplines
  - 5 Sky Bridge
  - 3 Abseil Point
  - 1 Dual Zipline
- **Stats Display**: 2 rows
- **Border**: Golden animated
- **Background**: Dark mint

---

### World C+
- **ID**: `world-c-plus`
- **Slug**: `world-c-plus`
- **Name**: WORLD C+
- **Price**: ฿2,490
- **Duration**: Up to 2 hours
- **Category**: combined
- **Includes Meal**: Yes
- **Includes Transfer**: Yes
- **Stats**:
  - 10 Platform
  - 4 Ziplines
  - 1 Spiral Staircase
  - 2 Abseil Point
  - 1 Roller Zipline
  - 1 Sky Walk
- **Border**: Golden animated
- **Background**: Purple

---

### World D+
- **ID**: `world-d-plus`
- **Slug**: `world-d-plus`
- **Name**: WORLD D+
- **Price**: ฿1,990
- **Duration**: Up to 1.5 hours
- **Category**: combined
- **Includes Meal**: Yes
- **Includes Transfer**: Yes
- **Stats**:
  - 2 Total Activities
  - 1 Roller Zipline
  - 1 Sky Walk
  - 800 Metres Roller Zipline
  - 300 Metres Sky Walk
- **Stats Display**: 1 row (first 4 stats only, or adjust as needed)
- **Border**: Golden animated
- **Background**: Blue-green (#1a237e + #1b5e20)

---

### 32 Platform Zipline
- **ID**: `zipline-32`
- **Slug**: `zipline-32`
- **Name**: 32 PLATFORM ZIPLINE
- **Price**: ฿2,900
- **Duration**: Up to 2.5 hours
- **Category**: zipline
- **Includes Meal**: No
- **Includes Transfer**: Yes
- **Stats**:
  - 32 Platform
  - 16 Ziplines
  - 5 Sky Bridge
  - 3 Abseil Point
  - 1 Dual Zipline
- **Border**: Silver animated
- **Background**: Turquoise mint + royal blue

---

### 18 Platform Zipline
- **ID**: `zipline-18`
- **Slug**: `zipline-18`
- **Name**: 18 PLATFORM ZIPLINE
- **Price**: ฿2,200
- **Duration**: Up to 1.5 hours
- **Category**: zipline
- **Includes Meal**: No
- **Includes Transfer**: Yes
- **Stats**:
  - 18 Platform
  - 9 Ziplines
  - 2 Sky Bridge
  - 3 Abseil Point
  - 1 Dual Zipline
- **Border**: Silver animated
- **Background**: Turquoise mint + royal blue

---

### 10 Platform Zipline
- **ID**: `zipline-10`
- **Slug**: `zipline-10`
- **Name**: 10 PLATFORM ZIPLINE
- **Price**: ฿1,500
- **Duration**: Up to 1 hour
- **Category**: zipline
- **Includes Meal**: No
- **Includes Transfer**: Yes
- **Stats**:
  - 10 Platform
  - 4 Ziplines
  - 1 Spiral Staircase
  - 2 Abseil Point
- **Stats Display**: 1 row
- **Border**: Silver animated
- **Background**: Turquoise mint + royal blue

---

### Roller Zipline
- **ID**: `roller-zipline`
- **Slug**: `roller-zipline`
- **Name**: ROLLER ZIPLINE
- **Price**: ฿1,000
- **Duration**: 30 minutes
- **Category**: roller
- **Includes Meal**: No
- **Includes Transfer**: No
- **Stats**: None (or minimal - don't show stats grid)
- **Border**: Silver animated
- **Background**: Turquoise mint + royal blue

---

### Skywalk
- **ID**: `skywalk`
- **Slug**: `skywalk`
- **Name**: SKYWALK
- **Price**: ฿500
- **Duration**: 30 minutes
- **Category**: skywalk
- **Includes Meal**: No
- **Includes Transfer**: No
- **Stats**: None (don't show stats grid)
- **Border**: Silver animated
- **Background**: Turquoise mint + royal blue

---

### Slingshot
- **ID**: `slingshot`
- **Slug**: `slingshot`
- **Name**: SLINGSHOT
- **Price**: ฿350
- **Duration**: 15 minutes
- **Category**: slingshot
- **Includes Meal**: No
- **Includes Transfer**: No
- **Stats**: None (don't show stats grid)
- **Border**: Silver animated
- **Background**: Turquoise mint + royal blue

---

### Slingshot+
- **ID**: `slingshot-plus`
- **Slug**: `slingshot-plus`
- **Name**: SLINGSHOT+
- **Price**: ฿500
- **Duration**: 20 minutes
- **Category**: slingshot
- **Includes Meal**: No
- **Includes Transfer**: No
- **Stats**: None (don't show stats grid)
- **Border**: Silver animated
- **Background**: Turquoise mint + royal blue

---

## Package Display Order on Homepage

### Featured (Horizontal Card - Top)
1. World A+

### Main Grid (3 columns)
1. World C+
2. World D+
3. World B+
4. 32 Platform Zipline
5. 18 Platform Zipline
6. 10 Platform Zipline

### Three Column Section
1. Roller Zipline
2. Skywalk
3. Slingshot
4. Slingshot+

---

## TypeScript Interface

```typescript
interface PackageStats {
  platforms?: number;
  ziplines?: number;
  skyBridge?: number;
  abseilPoints?: number;
  dualZipline?: number;
  spiralStaircase?: number;
  rollerZipline?: number;
  skyWalk?: number;
  totalActivities?: number;
  rollerZiplineMetres?: number;
  skyWalkMetres?: number;
}

interface Package {
  id: string;
  slug: string;
  name: string;
  description: string;
  shortDescription: string;
  price: number;
  duration: string;
  category: 'combined' | 'zipline' | 'roller' | 'skywalk' | 'slingshot';
  image: string;
  gallery: string[];
  features: string[];
  included: string[];
  requirements: string[];
  featured: boolean;
  popular: boolean;
  stats?: PackageStats;
  includesMeal?: boolean;
  includesTransfer?: boolean;
}
```
