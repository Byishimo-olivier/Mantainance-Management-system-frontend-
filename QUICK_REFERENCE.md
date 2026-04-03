# Responsive Design - Quick Reference Card

## 🎯 Most Common Updates

### Font Sizes
```jsx
// Heading
<h1 className="responsive-heading-xl">Main Title</h1>
<h2 className="responsive-heading-lg">Section</h2>
<h3 className="responsive-heading-md">Subsection</h3>

// Text
<p className="responsive-text-base">Paragraph</p>
<p className="responsive-text-sm">Small text</p>
<label className="responsive-text-label">Label</label>
```

### Padding & Spacing
```jsx
// Container padding
<div className="responsive-container">Container</div>

// Card padding
<div className="responsive-card">Card content</div>

// Universal spacing
<div className="responsive-padding">All-around padding</div>

// Gap between items
<div className="responsive-gap flex flex-col">
  <Item />
  <Item />
</div>
```

### Icons
```jsx
// Small (newsletter, inline icons)
<Bell className="responsive-icon-sm" />

// Medium (action buttons, section icons)
<Settings className="responsive-icon-md" />

// Large (hero sections, highlights)
<Heart className="responsive-icon-lg" />
```

### Buttons
```jsx
// Normal button
<button className="responsive-btn bg-blue-600 text-white">
  Action
</button>

// Large button (hero, primary actions)
<button className="responsive-btn-lg bg-emerald-600 text-white">
  Important
</button>
```

### Grids
```jsx
// 2-column grid
<div className="responsive-grid-2">
  <Card />
  <Card />
</div>

// 3-4 column grid (responsive)
<div className="responsive-grid-3">
  <Card />
  <Card />
  <Card />
</div>

// Auto layout
<div className="responsive-grid-auto">
  {items.map(item => <Card key={item.id} />)}
</div>
```

### Flex Layouts
```jsx
// Column on mobile, row on larger screens
<div className="responsive-flex-row">
  <Item />
  <Item />
</div>

// Always column with spacing
<div className="responsive-flex-col">
  <Item />
  <Item />
</div>
```

---

## 📐 Breakpoint Reference

| Class | Width | Use Case |
|-------|-------|----------|
| `xs` | 320px | Tiny phones |
| `sm` | 640px | Regular phones |
| `md` | 768px | Tablets |
| `lg` | 1024px | Small laptops |
| `xl` | 1280px | Desktops |
| `2xl` | 1536px | Large screens |

### How to Use Breakpoints
```jsx
// Default = mobile, add breakpoint for larger screens
<div className="text-sm md:text-base lg:text-lg">
  Text size: 12px (default) → 14px (md) → 16px (lg)
</div>

// Combine with utilities
<div className="p-3 xs:p-4 sm:p-6 md:p-8">
  Padding scales from 12px to 32px
</div>

// Hide/show at breakpoints
<div className="hidden md:block">Show only on md and larger</div>
<div className="md:hidden">Hide on md and larger</div>
```

---

## 🔄 Common Conversions

### From Fixed Sizes to Responsive

**Typography:**
```
text-6xl → responsive-heading-xl (24px → 48px)
text-4xl → responsive-heading-lg (20px → 40px)
text-3xl → responsive-heading-md (18px → 32px)
text-xl  → responsive-heading-sm (14px → 24px)
text-base → responsive-text-base (12px → 18px)
text-sm  → responsive-text-sm (10px → 14px)
```

**Padding:**
```
p-8 → responsive-padding or p-3 xs:p-4 sm:p-6 md:p-8
px-4 py-3 → responsive-btn
p-6 → responsive-card-compact
```

**Icons:**
```
w-6 h-6    → responsive-icon-sm
w-8 h-8    → responsive-icon-md
w-12 h-12  → responsive-icon-lg
```

**Gap:**
```
gap-8 → responsive-gap
gap-6 → gap-2 xs:gap-3 sm:gap-4 md:gap-6
```

---

## ⚡ Pro Tips

### 1. Mobile-First Always
Write mobile first, add larger sizes:
```jsx
// ✅ Good
<h1 className="text-2xl md:text-4xl lg:text-6xl">Title</h1>

// ❌ Avoid
<h1 className="text-6xl md:text-4xl lg:text-2xl">Title</h1>
```

### 2. Use Utility Classes for Consistency
```jsx
// ✅ Preferred
<button className="responsive-btn">Action</button>

// ✅ Also OK
<button className="px-3 xs:px-4 sm:px-6 py-2 sm:py-3 text-xs sm:text-base">
  Action
</button>

// ❌ Avoid (inconsistent)
<button className="px-6 py-3 text-base">Action</button>
```

### 3. Test Actual Devices
Use Chrome DevTools device emulation to test:
- iPhone SE (375px)
- iPad (768px)
- MacBook (1440px)

### 4. Icons Should Have Purpose
```jsx
// ✅ Shown at all sizes
<Dialog.Trigger asChild>
  <Bell className="responsive-icon-md" />
</Dialog.Trigger>

// ⚠️ Only useful when large
<Bell className="responsive-icon-lg" />
```

### 5. Touch Targets on Mobile
```jsx
// ✅ Min 44px × 44px recommended
<button className="p-2.5 xs:p-3 sm:p-4">Tap me</button>

// ❌ Too small
<button className="p-1">Tap me</button>
```

---

## 🐛 Debugging Responsive Issues

### Issue: Text Too Large on Mobile
```jsx
// ❌ Wrong
<h1 className="text-5xl">Heading</h1>

// ✅ Fix
<h1 className="responsive-heading-md">Heading</h1>
// or
<h1 className="text-xl md:text-3xl lg:text-5xl">Heading</h1>
```

### Issue: Too Much Padding on Mobile
```jsx
// ❌ Wrong
<div className="p-8">Content</div>

// ✅ Fix
<div className="responsive-container">Content</div>
// or
<div className="p-3 xs:p-4 sm:p-6 md:p-8">Content</div>
```

### Issue: Icons Invisible on Mobile
```jsx
// ❌ Wrong (always 24px)
<Bell className="w-24 h-24" />

// ✅ Fix
<Bell className="responsive-icon-md" />
// or
<Bell className="w-4 xs:w-6 sm:w-8" />
```

### Issue: Layout Breaks at Tablet
```jsx
// ❌ Only md breakpoint
<div className="grid grid-cols-1 md:grid-cols-3">

// ✅ All breakpoints
<div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
```

---

## 🧪 Testing Checklist

- [ ] Test at 320px width (XS)
- [ ] Test at 375px width (typical phone)
- [ ] Test at 640px width (small tablet)
- [ ] Test at 768px width (full tablet)
- [ ] Test at 1024px width (laptop)
- [ ] Test at 1280px+ (desktop)
- [ ] Check landscape orientation
- [ ] Verify no horizontal scroll
- [ ] Check text readability
- [ ] Verify icons are visible
- [ ] Test form inputs with keyboard
- [ ] Test touch interactions (buttons, drag)

---

## 📚 Full Documentation

For comprehensive guide, see:
- **RESPONSIVE_DESIGN_GUIDE.md** - Full reference
- **COMPONENT_UPDATE_EXAMPLES.md** - Before/After examples
- **tailwind.config.js** - Custom configuration
- **src/index.css** - Utility class definitions

---

## 🚀 Get Started Now

1. **Pick a component** (e.g., Button, Card, Header)
2. **Find its file** in `src/components/`
3. **Apply responsive utilities** (use examples above)
4. **Test at breakpoints** (use Chrome DevTools)
5. **Repeat for next component**

### Example: Update a Button
```jsx
// Find this:
<button className="px-6 py-3 text-base">Click me</button>

// Replace with:
<button className="responsive-btn bg-blue-600 text-white">Click me</button>

// Or manual:
<button className="px-3 xs:px-4 sm:px-6 py-2 xs:py-2.5 sm:py-3 text-xs xs:text-sm sm:text-base">
  Click me
</button>
```

---

## ❓ Common Questions

**Q: Should I use utilities or write breakpoints manually?**
A: Use utilities when possible for consistency. Use manual when you need specific control.

**Q: What if content looks bad at a breakpoint?**
A: Add that breakpoint: `className="text-sm md:text-base lg:text-lg xl:text-xl"`

**Q: How do I hide content on mobile?**
A: Use `className="hidden md:block"` to hide on mobile, show on md+.

**Q: Can I use custom breakpoints?**
A: Yes, edit `tailwind.config.js` screens section.

**Q: Do icons really need to scale?**
A: Yes! 24px icon on mobile is huge. Scale based on context.

---

## 📱 Device Sizes to Test

```
XS: 320px (iPhone SE)
SM: 375px (iPhone 12)
MD: 640px (iPad Mini)
LG: 768px (iPad)
XL: 1024px (iPad Pro)
2XL: 1440px (MacBook)
```

Use Chrome DevTools → Toggle device toolbar → Select device.

---

**Last Updated:** April 2026
**Status:** ✅ Ready for Production
**Coverage:** All device types supported
