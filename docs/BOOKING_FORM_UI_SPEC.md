# Booking Form UI Specification

This document provides a complete specification for recreating the booking form UI used in the Hanuman World adventure booking experience. This form is designed for activity/experience booking with optional add-ons like private transfers.

---

## Overview

The booking form is a modern, mobile-responsive React component that guides users through selecting their activity date, time, number of guests, and optional add-ons. It features:

- Step-by-step numbered sections
- Real-time price calculation
- Pickup/transfer selection with hotel details
- Private transfer upgrade option
- Clean, professional UI with customizable brand colors

---

## Visual Design

### Container

The form is wrapped in a card container with:
- **Background**: White (`#ffffff`)
- **Border**: 2px solid with brand secondary color (default: `#02134f`)
- **Border radius**: `rounded-xl` on mobile, `rounded-2xl` on desktop
- **Shadow**: `shadow-[0_4px_24px_rgba(15,32,60,0.10)]`
- **Overflow**: Hidden (to clip child elements)

### Header Section

A colored header bar at the top displaying:
- **Background**: Brand secondary color (e.g., `#02134f`)
- **Border bottom**: 3px solid with same color
- **Padding**: `px-4 py-4` on mobile, `px-6 py-5` on desktop
- **Content**:
  - "BOOK YOUR EXPERIENCE" label (white, uppercase, small text)
  - Product name (white, bold, large)
  - "Includes Transfer" badge (if applicable)
  - Price: "from ฿X,XXX per person"

---

## Form Sections

The form is divided into numbered step sections. Each section has:

### Section Header Pattern

```
[Step Number Badge] [Icon] Section Title
```

- **Step Number Badge**: Small rounded square with brand accent color background
  - Size: `w-6 h-6` (mobile) / `w-7 h-7` (desktop)
  - Border radius: `rounded-lg`
  - Text: Bold, 10-12px, contrasting color (white or black based on accent brightness)
  
- **Icon**: Small Lucide icon, colored with accent color
- **Title**: Bold text, 14-15px, slate-800 color

### Section Dividers

Between sections, use a horizontal line:
- **Element**: `<div className="h-px mx-4 sm:mx-6 bg-slate-100" />`

---

## Section 1: Your Details (Contact Info)

> Note: This section is optional and can be hidden if contact info is collected at checkout.

### Fields

**Full Name**
- Label: "FULL NAME" (uppercase, 10-11px, slate-400, tracking-wider)
- Input: Text field with User icon on left
- Placeholder: "John Doe"
- Styling: `h-10 sm:h-11 bg-slate-50 border-slate-200 rounded-lg sm:rounded-xl`
- Icon: User (orange-400 color)
- Icon position: `left-3` with `pl-10 sm:pl-11` on input

**Email**
- Label: "EMAIL" (same style as above)
- Input: Email field with Mail icon on left
- Placeholder: "john@example.com"
- Same styling as Full Name

**Phone Number**
- Country selector with flag dropdown
- Phone input field
- Default country: Thailand (+66)

**Special Requests**
- Label: "SPECIAL REQUESTS"
- Textarea with MessageSquare icon
- Placeholder: "Any special requests..."
- Min height: 60px mobile, 72px desktop
- Resizable vertically

---

## Section 2: Select Date & Time

### Layout
- Two-column grid on desktop, single column on mobile
- Gap: `gap-3` mobile, `gap-4` desktop

### Date Picker Field
- Label: "Activity Date" (customizable)
- Calendar button that opens date picker popover
- Selected date displayed in format: "Thu, Feb 20, 2026"
- Calendar icon (slate-400)

### Time Slot Picker
Two variants available:

**Option A: Grid of Time Buttons**
- Horizontal scrollable row of time buttons
- Each button: `h-10 px-4 rounded-xl border-2`
- Unselected: `border-slate-200 bg-white text-slate-700`
- Selected: Border and background use accent color, text white or black based on contrast
- Disabled: `opacity-40 cursor-not-allowed`

**Option B: Dropdown Select**
- Standard select dropdown
- Placeholder: "Select time"

---

## Section 3: Number of Guests

### Person Counter Component

A single-row counter with:
- **Left side**: Label "Persons" and price subtitle "฿X,XXX per person"
- **Right side**: Minus button, count number, Plus button

**Buttons**
- Size: `h-9 w-9`
- Shape: `rounded-full`
- Border: `border border-slate-200`
- Icon: Minus/Plus at 4x4, strokeWidth 2.5
- Hover: `hover:bg-slate-100 hover:border-slate-300`
- Disabled: `opacity-30 cursor-not-allowed`

**Count Display**
- Width: `w-10`
- Font: Bold, 28px, slate-800
- Style: `tabular-nums` for consistent width

---

## Section 4: Transport Options

### Two Template Types

**TYPE_A: Includes Shared Transfer**

Users choose between:
1. "FREE Shared Round Trip Transfer" (default ON)
2. "Come Direct by Yourself"

**Pickup Toggle Card**
- Shape: `rounded-xl border-2 p-4`
- When ON (pickup):
  - Border and background: Accent color
  - Car icon in semi-transparent white box
  - Text: White
  - Switch: Orange/accent color
- When OFF (self-drive):
  - Border: 30% secondary color
  - Background: `#f8fafc`
  - Navigation icon
  - Text: Slate colors

**Hotel Details (when pickup is ON)**
- Two fields in a row: Hotel Name (75%), Room Number (25%)
- Optional "Add Google Map link" button/field
- Input styling: `bg-slate-50 border-slate-200 rounded-xl`

**Meeting Point (when self-drive)**
- Card with accent color border and 10% accent background
- MapPin icon, location name, address
- "Open in Google Maps" link

---

## Add-Ons Section

Displayed when pickup is enabled.

### Private Round-Trip Transfer Card

**Collapsed State**
- Shape: `rounded-xl border-2`
- Border: When off `border-[#02134f]/20`, when on `border-[#02134f]`
- Background: When off `bg-slate-50`, when on `bg-blue-50/30`

**Card Content**
- Left: Car icon in box, label "Private Round-Trip Transfer"
- Subtitle: "Max 10 passengers · +฿2,500"
- Right: Toggle switch
- Info tooltip explaining the service

**Expanded State (when enabled)**
Additional row for passenger count:
- Users icon in orange box
- Label: "Total Passengers"
- Subtitle shows: "X guests + Y additional · Max 10"
- Counter: Minus/Plus buttons with count in middle
- Min value: Number of guests (cannot go below)
- Max value: 10

### Non-Player Add-on

Shown only when Private Transfer is OFF.

- Same card styling as above
- Users icon in box
- Label: "Additional Non-Player"
- Subtitle: "Shared transfer only · +฿300/person"
- Counter for quantity

---

## Price Summary Section

### Container
- Shape: `rounded-xl sm:rounded-2xl border border-slate-100`
- Background: `linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)`
- Padding: `p-3 sm:p-4`

### Line Items
Each line shows:
- Left: Item description (slate-500 text, truncate)
- Right: Price (font-semibold, slate-700)
- Additional items (add-ons, upsells): Smaller text, "+฿X,XXX" format

### Total Row
- Border top: `border-t border-slate-200/80 pt-2 sm:pt-3`
- Left: "Total" label (font-medium, slate-400)
- Right: Total amount (text-xl sm:text-2xl font-extrabold, secondary color)

---

## Submit Button

- Width: Full width (`w-full`)
- Height: `h-11 sm:h-13`
- Border radius: `rounded-lg sm:rounded-xl`
- Background: Accent color
- Shadow: `shadow-lg hover:shadow-xl` with accent color glow
- Text: Bold, white or black based on accent brightness
- Content: "Proceed to Add-on & Checkout" with ArrowRight icon
- Loading state: Loader2 spinning icon with "Processing..."

### Trust Badges Below Button
- Centered row with two badges
- ShieldCheck icon + "Secure Payment"
- CalendarDays icon + "Instant Confirmation"
- Tiny text (10-11px), slate-400 color

---

## Color System

### Customizable Colors

| Variable | Default | Usage |
|----------|---------|-------|
| `accentColor` | `#f97316` (orange) | Buttons, badges, icons, active states |
| `secondaryColor` | `#02134f` (dark blue) | Header, totals, borders |

### Color Contrast Helper

Include a helper function to determine if accent color is light:

```
Light color → Use black text
Dark color → Use white text
```

Luminance threshold: 0.5

---

## Responsive Behavior

### Mobile (< 640px)
- Single column layouts
- Smaller padding: `px-4 py-4`
- Smaller text sizes
- Shorter button heights
- Touch-friendly tap targets (min 44px)

### Desktop (≥ 640px)
- Two-column grids where appropriate
- Larger padding: `px-6 py-5`
- Larger text and buttons
- More whitespace

---

## Animation

- **Section transitions**: `animate-in slide-in-from-top-2 duration-200`
- **Button hover**: Arrow icon `group-hover:translate-x-1 transition-transform`
- **Switch toggle**: Built-in Radix UI animation
- **Focus states**: Ring with accent color

---

## Form Validation

### Required Fields
- Activity Date (must select)
- Time Slot (must select if time slots available)
- Hotel Name (when pickup is enabled)

### Optional Fields
- Contact info (if collecting at checkout)
- Room Number
- Google Maps Link
- Special Requests

### Error Display
- Red border on invalid input
- Error message below field in red (text-xs text-red-500)

---

## Data Output

When form is submitted, the following data structure is produced:

```javascript
{
  // Customer Info (if collected)
  customerName: string,
  customerEmail: string,
  customerPhone: string,
  
  // Booking Details
  activityDate: string,      // "2026-02-20"
  timeSlot: string,          // "08:00"
  quantity: number,          // Number of guests
  
  // Pickup
  needPickup: boolean,
  hotelName: string,
  roomNumber: string,
  googleMapsLink: string,
  
  // Add-ons
  privateTransfer: boolean,
  privateTransferPassengers: number,
  privateTransferPrice: number,
  nonPlayerCount: number,
  nonPlayerPrice: number,
  
  // Totals
  addOnsTotal: number,
  totalWithAddOns: number,
  
  // Special Requests
  notes: string
}
```

---

## Dependencies

### Required Libraries
- React 18+
- Tailwind CSS
- Lucide React (icons)
- React Hook Form + Zod (validation)
- date-fns (date formatting)
- Radix UI (Switch, Popover components)

### Icons Used
- User, Mail, MessageSquare
- CalendarDays, Clock
- Users, Minus, Plus
- MapPin, Navigation, Car
- ShieldCheck, ArrowRight
- Loader2, Info

---

## Product-Specific Configuration

For Hanuman World:

```javascript
{
  productName: "World A+",
  pricePerPerson: 3490,
  accentColor: "#f97316",      // Orange
  secondaryColor: "#02134f",   // Dark Blue
  showPickup: true,
  showAddOns: true,
  bookingTemplateType: "TYPE_A",
  meetingPointName: "Hanuman World",
  meetingPointAddress: "105 Moo 4, Chaofa Road, Wichit, Muang, Phuket 83130",
  privateTransferPrice: 2500,
  nonPlayerPrice: 300,
  timeSlots: [
    { time: "08:00", available: true },
    { time: "09:00", available: true },
    { time: "10:00", available: true },
    // ... more slots
  ]
}
```

---

## Implementation Notes

1. **Form State Management**: Use React Hook Form for form state and validation
2. **Price Calculation**: Calculate in real-time as user changes quantity or toggles add-ons
3. **Conditional Rendering**: Show/hide sections based on props (showContactInfo, showPickup, etc.)
4. **Mobile First**: Design for mobile, enhance for desktop
5. **Accessibility**: Proper labels, focus states, keyboard navigation
6. **Performance**: Minimize re-renders, use memoization where appropriate

---

## Screenshot Reference

The header section displays:
```
┌─────────────────────────────────────────────┐
│  BOOK YOUR EXPERIENCE                       │
│  WORLD A+                                   │
│  Includes Transfer                          │
│  from ฿3,490 per person                     │
└─────────────────────────────────────────────┘
```

This design creates a premium, trustworthy booking experience suitable for adventure tourism, activities, and experiences.
