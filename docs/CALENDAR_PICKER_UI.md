# Calendar Picker UI Component

A custom month-view calendar component for date selection with availability states.

## Preview

```
┌─────────────────────────────────────────┐
│  ←       March 2026        →            │
├─────────────────────────────────────────┤
│  Sun  Mon  Tue  Wed  Thu  Fri  Sat      │
│                                          │
│   1    2    3    4    5    6    7       │
│   8    9   10   11   12   13   14       │
│  15   16   17   18   19   20   21       │
│  22   23   24   25   26   27   28       │
│  29   30   31                           │
│                                          │
│      ● Available    ● Selected          │
└─────────────────────────────────────────┘
```

---

## Component Structure

```
CalendarPicker
├── Container (rounded card with border)
├── Header
│   ├── Previous Month Button (←)
│   ├── Month/Year Title
│   └── Next Month Button (→)
├── Weekday Headers Row
├── Calendar Grid (7 columns)
│   ├── Empty cells (before month start)
│   └── Day cells (buttons)
└── Legend
    ├── Available indicator
    └── Selected indicator
```

---

## Styling Specifications

### Container

| Property | Value |
|----------|-------|
| Background | `#FFFFFF` (white) |
| Border | `3px solid #0d2842` (dark navy) |
| Border Radius | `12px` (rounded-xl) |
| Padding | `16px` (p-4) |
| Shadow | None |
| Width | Auto (fits content, ~340px typical) |

```css
.calendar-container {
  background: #FFFFFF;
  border: 3px solid #0d2842;
  border-radius: 12px;
  padding: 16px;
  box-shadow: none;
}
```

---

### Header Section

| Element | Style |
|---------|-------|
| Layout | Flexbox, space-between, center aligned |
| Margin Bottom | `24px` (mb-6) |

#### Navigation Buttons (← →)
| Property | Value |
|----------|-------|
| Padding | `8px` (p-2) |
| Border Radius | `8px` (rounded-lg) |
| Background | Transparent |
| Hover Background | `#F3F4F6` (gray-100) |
| Transition | `colors` |

#### Icon
| Property | Value |
|----------|-------|
| Size | `20px × 20px` (h-5 w-5) |
| Color | `#4B5563` (gray-600) |
| Icon | ChevronLeft / ChevronRight |

#### Month/Year Title
| Property | Value |
|----------|-------|
| Font Size | `18px` (text-lg) |
| Font Weight | `600` (semibold) |
| Color | `#111827` (gray-900) |
| Format | "MMMM yyyy" (e.g., "March 2026") |

---

### Weekday Headers Row

| Property | Value |
|----------|-------|
| Layout | CSS Grid, 7 columns |
| Gap | `4px` (gap-1) |
| Text Align | Center |
| Margin Bottom | `8px` (mb-2) |

#### Individual Weekday Label
| Property | Value |
|----------|-------|
| Font Size | `14px` (text-sm) |
| Font Weight | `500` (medium) |
| Color | `#6B7280` (gray-500) |
| Padding Y | `8px` (py-2) |
| Labels | Sun, Mon, Tue, Wed, Thu, Fri, Sat |

---

### Calendar Grid

| Property | Value |
|----------|-------|
| Layout | CSS Grid, 7 columns |
| Gap | `4px` (gap-1) |

#### Empty Cells (Before Month Start)
| Property | Value |
|----------|-------|
| Height | `40px` (h-10) |
| Content | Empty |

#### Day Cell Container
| Property | Value |
|----------|-------|
| Display | Flex |
| Align/Justify | Center |

---

### Day Button States

All day buttons share these base styles:

| Property | Value |
|----------|-------|
| Width | `40px` (w-10) |
| Height | `40px` (h-10) |
| Display | Flex, center, center |
| Border Radius | `50%` (rounded-full) |
| Font Size | `14px` (text-sm) |
| Font Weight | `500` (medium) |
| Transition | All properties |

#### State: Available (Future dates with availability)
| Property | Value |
|----------|-------|
| Background | `#DCFCE7` (green-100) |
| Text Color | `#15803D` (green-700) |
| Hover Background | `#BBF7D0` (green-200) |
| Cursor | Pointer |

```css
.day-available {
  background: #DCFCE7;
  color: #15803D;
  cursor: pointer;
}
.day-available:hover {
  background: #BBF7D0;
}
```

#### State: Selected
| Property | Value |
|----------|-------|
| Background | `#008EE6` (custom blue) |
| Text Color | `#FFFFFF` (white) |
| Cursor | Pointer |

```css
.day-selected {
  background: #008EE6;
  color: #FFFFFF;
}
```

#### State: Today (not selected)
| Property | Value |
|----------|-------|
| Ring | `2px solid #3B82F6` (blue-500) |
| Ring Offset | `2px` |
| Other styles | Based on availability state |

```css
.day-today {
  box-shadow: 0 0 0 2px #FFFFFF, 0 0 0 4px #3B82F6;
}
```

#### State: Past / Unavailable
| Property | Value |
|----------|-------|
| Text Color | `#D1D5DB` (gray-300) |
| Cursor | Not-allowed |
| Background | Transparent |

```css
.day-unavailable {
  color: #D1D5DB;
  cursor: not-allowed;
}
```

#### State: Outside Current Month
| Property | Value |
|----------|-------|
| Text Color | `#D1D5DB` (gray-300) |
| Background | Transparent |

---

### Legend Section

| Property | Value |
|----------|-------|
| Margin Top | `24px` (mt-6) |
| Layout | Flex, center, center |
| Gap | `24px` (gap-6) |
| Font Size | `14px` (text-sm) |

#### Legend Item
| Property | Value |
|----------|-------|
| Layout | Flex, center aligned |
| Gap | `8px` (gap-2) |

#### Legend Dot - Available
| Property | Value |
|----------|-------|
| Size | `12px × 12px` (h-3 w-3) |
| Border Radius | `50%` (rounded-full) |
| Background | `#DCFCE7` (green-100) |
| Border | `1px solid #BBF7D0` (green-200) |

#### Legend Dot - Selected
| Property | Value |
|----------|-------|
| Size | `12px × 12px` (h-3 w-3) |
| Border Radius | `50%` (rounded-full) |
| Background | `#008EE6` (custom blue) |

#### Legend Text
| Property | Value |
|----------|-------|
| Color | `#4B5563` (gray-600) |

---

## Color Palette

| Name | Hex | Usage |
|------|-----|-------|
| Container Border | `#0d2842` | Dark navy border |
| Selected Blue | `#008EE6` | Selected date background |
| Available Green BG | `#DCFCE7` | Available date background |
| Available Green Text | `#15803D` | Available date text |
| Available Green Hover | `#BBF7D0` | Available date hover |
| Today Ring | `#3B82F6` | Today outline |
| Gray 900 | `#111827` | Month title text |
| Gray 600 | `#4B5563` | Icons, legend text |
| Gray 500 | `#6B7280` | Weekday headers |
| Gray 300 | `#D1D5DB` | Disabled/past dates |
| Gray 100 | `#F3F4F6` | Button hover |
| White | `#FFFFFF` | Background, selected text |

---

## Dimensions Summary

| Element | Size |
|---------|------|
| Container Padding | 16px |
| Container Border | 3px |
| Container Border Radius | 12px |
| Navigation Button Padding | 8px |
| Navigation Icon | 20px × 20px |
| Day Cell | 40px × 40px |
| Grid Gap | 4px |
| Legend Dot | 12px × 12px |

---

## Typography

| Element | Size | Weight | Color |
|---------|------|--------|-------|
| Month Title | 18px | 600 | #111827 |
| Weekday Headers | 14px | 500 | #6B7280 |
| Day Numbers | 14px | 500 | varies |
| Legend Text | 14px | 400 | #4B5563 |

---

## Responsive Behavior

The calendar maintains a fixed width based on the 7-column grid with 40px cells and 4px gaps:
- Minimum width: ~310px (7 × 40px + 6 × 4px + 32px padding)
- Typical width: ~340px

---

## HTML Structure Example

```html
<div class="calendar-container">
  <!-- Header -->
  <div class="calendar-header">
    <button class="nav-button">
      <svg><!-- ChevronLeft icon --></svg>
    </button>
    <h3 class="month-title">March 2026</h3>
    <button class="nav-button">
      <svg><!-- ChevronRight icon --></svg>
    </button>
  </div>

  <!-- Weekday Headers -->
  <div class="weekday-headers">
    <div>Sun</div>
    <div>Mon</div>
    <div>Tue</div>
    <div>Wed</div>
    <div>Thu</div>
    <div>Fri</div>
    <div>Sat</div>
  </div>

  <!-- Calendar Grid -->
  <div class="calendar-grid">
    <!-- Empty cells for alignment -->
    <div class="empty-cell"></div>
    <!-- ... more empty cells based on month start day -->
    
    <!-- Day buttons -->
    <div class="day-cell">
      <button class="day-button day-available">1</button>
    </div>
    <div class="day-cell">
      <button class="day-button day-selected">2</button>
    </div>
    <!-- ... more days -->
  </div>

  <!-- Legend -->
  <div class="legend">
    <div class="legend-item">
      <span class="legend-dot legend-available"></span>
      <span>Available</span>
    </div>
    <div class="legend-item">
      <span class="legend-dot legend-selected"></span>
      <span>Selected</span>
    </div>
  </div>
</div>
```

---

## Tailwind CSS Classes Reference

```
Container:      rounded-xl bg-white p-4 border-[3px] border-[#0d2842] shadow-none
Header:         mb-6 flex items-center justify-between
Nav Button:     rounded-lg p-2 hover:bg-gray-100 transition-colors
Nav Icon:       h-5 w-5 text-gray-600
Month Title:    text-lg font-semibold text-gray-900
Weekdays Row:   mb-2 grid grid-cols-7 gap-1 text-center text-sm font-medium text-gray-500
Weekday Cell:   py-2
Calendar Grid:  grid grid-cols-7 gap-1
Empty Cell:     h-10
Day Container:  flex items-center justify-center
Day Button:     w-10 h-10 flex items-center justify-center rounded-full text-sm font-medium transition-all
Day Available:  bg-green-100 text-green-700 hover:bg-green-200 cursor-pointer
Day Selected:   text-white (+ inline style: background-color: #008EE6)
Day Past:       text-gray-300 cursor-not-allowed
Day Today:      ring-2 ring-offset-2 ring-blue-500
Legend:         mt-6 flex items-center justify-center gap-6 text-sm
Legend Item:    flex items-center gap-2
Legend Dot:     h-3 w-3 rounded-full
Legend Text:    text-gray-600
```

---

## Notes for Implementation

1. **Grid Alignment**: The calendar uses CSS Grid with 7 columns. Empty cells before the first day ensure proper weekday alignment.

2. **Date Formatting**: Month/year displayed as "MMMM yyyy" format (full month name + 4-digit year).

3. **Day Numbers**: Display just the day number (1-31), not padded.

4. **Accessibility**: Day buttons should be actual `<button>` elements with `disabled` attribute for unavailable dates.

5. **Today Indicator**: Uses a ring/outline effect, not background color, so it's visible regardless of availability state.

6. **Custom Blue**: The selected state uses `#008EE6` which is not a standard Tailwind color - use inline style or custom config.

7. **Border Color**: `#0d2842` is a custom dark navy - use inline style or custom config.
