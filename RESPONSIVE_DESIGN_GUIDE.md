# Responsive Design Guide - MMS Frontend

## Overview
This guide explains how to use the responsive design system implemented in your application. The system uses Tailwind CSS with custom breakpoints optimized for mobile-first design.

## Breakpoints

| Class | Size | Device Type |
|-------|------|------------|
| `xs` | 320px | Extra small phones |
| `sm` | 640px | Small phones |
| `md` | 768px | Tablets |
| `lg` | 1024px | Small laptops |
| `xl` | 1280px | Desktops |
| `2xl` | 1536px | Large screens |

## Core Responsive Utilities

### 1. **Responsive Containers & Padding**

```jsx
// Container with responsive horizontal padding
<div className="responsive-container">
  Content here
</div>

// Responsive padding on all sides
<div className="responsive-padding">
  Content here
</div>

// Responsive gaps between children
<div className="responsive-gap">
  {children}
</div>
```

**Usage Example:**
```jsx
// Padding scales: 12px (mobile) → 40px (xl)
<section className="responsive-container">
  <div className="responsive-gap flex flex-col">
    {/* Gap scales: 8px → 32px */}
  </div>
</section>
```

---

### 2. **Responsive Typography**

Four heading levels + two text levels:

```jsx
// Extra large heading (24px → 48px)
<h1 className="responsive-heading-xl">Main Title</h1>

// Large heading (20px → 40px)
<h2 className="responsive-heading-lg">Section Title</h2>

// Medium heading (18px → 32px)
<h3 className="responsive-heading-md">Subsection</h3>

// Small heading (14px → 24px)
<h4 className="responsive-heading-sm">Detail Title</h4>

// Base text (14px → 18px)
<p className="responsive-text-base">Regular paragraph text</p>

// Small text (10px → 14px)
<p className="responsive-text-sm">Helper or caption text</p>

// Label text (10px → 14px, uppercase, bold)
<label className="responsive-text-label">Form Label</label>
```

**Mobile → Desktop Scaling:**
```
responsive-heading-xl: text-2xl → text-6xl
responsive-heading-lg: text-xl → text-5xl
responsive-heading-md: text-lg → text-4xl
responsive-heading-sm: text-base → text-2xl
responsive-text-base: text-xs → text-lg
responsive-text-sm: text-2xs → text-base
```

---

### 3. **Responsive Buttons**

```jsx
// Standard button (12px → 16px text, 6px → 12px padding)
<button className="responsive-btn bg-blue-600 text-white">
  Click me
</button>

// Large button (14px → 18px text, 8px → 16px padding)
<button className="responsive-btn-lg bg-emerald-600 text-white">
  Important Action
</button>
```

---

### 4. **Responsive Cards**

```jsx
// Standard card with padding
<div className="responsive-card glass-surface rounded-lg">
  Card content
</div>

// Compact card for dense layouts
<div className="responsive-card-compact bg-white shadow">
  Compact content
</div>
```

**Padding Scaling:**
```
responsive-card: 12px → 32px
responsive-card-compact: 8px → 16px
```

---

### 5. **Responsive Grids**

```jsx
// 2-column grid: 1 col (mobile) → 2 cols (md)
<div className="responsive-grid-2">
  <Card>1</Card>
  <Card>2</Card>
</div>

// 3-column grid: 1 → 2 (md) → 3 (lg) → 4 (lg)
<div className="responsive-grid-3">
  <Card>1</Card>
  <Card>2</Card>
  <Card>3</Card>
</div>

// Auto-layout: 1 → 2 (sm) → 3 (lg) → 4 (xl)
<div className="responsive-grid-auto">
  {cards.map(card => <Card key={card.id} />)}
</div>
```

**Gap Scaling:**
```
All grids: gap-2 (xs) → gap-8 (lg)
```

---

### 6. **Responsive Icons**

```jsx
import { Bell, Settings, Heart } from 'lucide-react';

// Small icon (16px → 24px)
<Bell className="responsive-icon-sm" />

// Medium icon (20px → 40px)
<Settings className="responsive-icon-md" />

// Large icon (24px → 64px)
<Heart className="responsive-icon-lg" />
```

---

### 7. **Responsive Flex Layouts**

```jsx
// Column layout on mobile, auto-wraps/rows on larger screens
<div className="responsive-flex-row">
  <div>Item 1</div>
  <div>Item 2</div>
</div>

// Always column with responsive gaps
<div className="responsive-flex-col">
  <Item />
  <Item />
</div>
```

---

## Real-World Examples

### Dashboard Card
```jsx
<div className="responsive-card glass-surface-strong rounded-xl xs:rounded-2xl sm:rounded-3xl">
  <h2 className="responsive-text-label mb-2 xs:mb-3 sm:mb-4">
    Active Jobs
  </h2>
  <div className="text-4xl xs:text-5xl sm:text-6xl font-black">42</div>
  <button className="responsive-btn mt-4 xs:mt-6">View Jobs</button>
</div>
```

### Responsive Header
```jsx
<header className="flex flex-col xs:flex-row xs:items-center xs:justify-between responsive-gap responsive-container">
  <h1 className="responsive-heading-xl">Dashboard</h1>
  <nav className="responsive-text-base flex gap-2 xs:gap-4">
    <a href="/home">Home</a>
    <a href="/settings">Settings</a>
  </nav>
</header>
```

### Mobile-Friendly Table/List
```jsx
<div className="responsive-container">
  <div className="responsive-grid-2 md:responsive-grid-3">
    {items.map(item => (
      <div key={item.id} className="responsive-card bg-white shadow">
        <h3 className="responsive-heading-sm">{item.name}</h3>
        <p className="responsive-text-sm mt-2 text-gray-600">{item.description}</p>
        <button className="responsive-btn-lg mt-4">Action</button>
      </div>
    ))}
  </div>
</div>
```

---

## Manual Responsive Classes (Tailwind)

For granular control, you can also use Tailwind's responsive prefixes:

```jsx
// Font sizes
<h2 className="text-2xl xs:text-3xl sm:text-4xl md:text-5xl lg:text-6xl">
  Responsive Title
</h2>

// Padding
<div className="p-2 xs:p-3 sm:p-4 md:p-6 lg:p-8">
  Responsive Padding
</div>

// Display
<div className="block xs:hidden sm:block md:flex">
  Show on XS, hide on SM, show again on MD as flex
</div>

// Grid columns
<div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 lg:grid-cols-4">
  {items.map(item => <Card key={item.id} />)}
</div>
```

---

## Best Practices

### 1. **Mobile-First Approach**
Always start with mobile styles, then add larger breakpoints:

```jsx
// ✅ GOOD
<div className="text-sm md:text-base lg:text-lg">
  Text that scales up
</div>

// ❌ AVOID
<div className="text-lg md:text-base lg:text-sm">
  Text that scales down (confusing)
</div>
```

### 2. **Use Utility Classes Over Raw Tailwind**
Prefer the responsive utilities for consistency:

```jsx
// ✅ PREFER
<button className="responsive-btn">Action</button>

// ✅ ALSO FINE
<button className="px-3 xs:px-4 sm:px-6 py-2 xs:py-2.5 sm:py-3 text-xs xs:text-sm sm:text-base">
  Action
</button>

// ❌ INCONSISTENT
<button className="px-6 py-3 text-base">
  Action (only desktop size)
</button>
```

### 3. **Icons Should Scale**
Always pair icons with their appropriate class:

```jsx
// ✅ GOOD
<Bell className="responsive-icon-md text-indigo-600" />

// ❌ AVOID
<Bell className="w-4 h-4" /> {/* Too small on desktop */}
```

### 4. **Test Responsive Breakpoints**
Test at real device sizes:
- **Mobile**: 320px (XS) and 375px (XS+)
- **Tablet**: 768px (MD) and 900px (MD+)
- **Desktop**: 1024px (LG), 1280px (XL), 1536px (2XL)

### 5. **Hidden Content on Mobile**
Hide less important elements on small screens:

```jsx
<div>
  <h2 className="responsive-heading-md">Title</h2>
  <p className="responsive-text-base hidden md:block">
    Long description (hide on mobile to save space)
  </p>
  <p className="responsive-text-sm md:hidden">
    Short description (show only on mobile)
  </p>
</div>
```

---

## Common Issues & Solutions

### Issue: Text too large on desktop
**Solution:** Use responsive heading classes instead of fixed sizes
```jsx
// Before (fixed size)
<h1 className="text-6xl">Title</h1>

// After (responsive)
<h1 className="responsive-heading-xl">Title</h1>
```

### Issue: Layout breaks on tablet
**Solution:** Test all breakpoints, not just mobile and desktop
```jsx
<div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
  {items}
</div>
```

### Issue: Icons too small on mobile
**Solution:** Use responsive icon classes
```jsx
// Before
<Bell className="w-8 h-8" />

// After
<Bell className="responsive-icon-md" />
```

---

## Files Modified

1. **tailwind.config.js** - Added custom screens, typography, and spacing
2. **src/index.css** - Added responsive utility classes
3. **src/components/AdminDashboard.jsx** - Updated with responsive utilities
4. **src/components/Header.jsx** - Updated with responsive utilities
5. **src/components/ManagerDashboard.jsx** - Recommended updates (future)

---

## Next Steps

1. **Update all dashboard components** to use responsive utilities
2. **Test on real devices** at all breakpoints
3. **Add responsive styles** to forms and input components
4. **Create responsive modal system** for mobile
5. **Optimize images** for different breakpoints (future enhancement)

---

## Support

For questions on specific breakpoints or utilities, refer to:
- Tailwind CSS: https://tailwindcss.com/docs/responsive-design
- Lucide Icons: https://lucide.dev/ (all icons scale with size classes)
