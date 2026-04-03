# Component Update Template - Before & After

This file shows how to convert existing components to use responsive design.

---

## Example 1: Dashboard Card Component

### ❌ Before (Non-Responsive)
```jsx
export function DashboardCard({ title, value, icon: Icon, onClick }) {
  return (
    <div className="glass-surface-strong rounded-3xl p-8 border border-white/20 shadow-2xl">
      <h2 className="font-extrabold text-white/70 uppercase tracking-widest text-sm mb-3">
        {title}
      </h2>
      <div className="text-6xl font-black text-white tracking-tighter mb-6">
        {value}
      </div>
      {Icon && <Icon className="w-12 h-12 text-blue-300 mb-4" />}
      <button onClick={onClick} className="text-blue-300 font-bold hover:text-blue-200 uppercase text-xs">
        View Details →
      </button>
    </div>
  );
}
```

**Issues:**
- Text too large on mobile (text-6xl is 48px+)
- Fixed padding (p-8 = 32px too much for mobile)
- Icon size fixed (w-12 h-12)
- Button text too small relative to card

### ✅ After (Responsive)
```jsx
export function DashboardCard({ title, value, icon: Icon, onClick }) {
  return (
    <div className="glass-surface-strong rounded-xl xs:rounded-2xl sm:rounded-3xl responsive-card border border-white/20 shadow-2xl">
      <h2 className="responsive-text-label mb-2 xs:mb-3 sm:mb-4">
        {title}
      </h2>
      <div className="text-4xl xs:text-5xl sm:text-6xl font-black text-white tracking-tighter mb-4 xs:mb-6">
        {value}
      </div>
      {Icon && <Icon className="responsive-icon-md text-blue-300 mb-2 xs:mb-3 sm:mb-4" />}
      <button onClick={onClick} className="responsive-text-label text-blue-300 font-bold hover:text-blue-200">
        View Details →
      </button>
    </div>
  );
}
```

**Improvements:**
✓ Text scales from 16px (xs) to 48px (lg)
✓ Padding scales from 12px to 32px
✓ Icon scales from 20px to 40px
✓ Button text scales responsively
✓ Border radius adapts to screen size

---

## Example 2: Form Input Component

### ❌ Before (Non-Responsive)
```jsx
export function FormInput({ label, error, ...props }) {
  return (
    <div className="mb-6">
      <label className="block text-sm font-semibold text-gray-700 mb-2">
        {label}
      </label>
      <input
        className="w-full px-4 py-3 rounded-lg border border-gray-300 text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
        {...props}
      />
      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
    </div>
  );
}
```

**Issues:**
- Input too tall on mobile (py-3)
- Text too large (text-base fixed)
- Padding fixed (px-4)

### ✅ After (Responsive)
```jsx
export function FormInput({ label, error, ...props }) {
  return (
    <div className="mb-3 xs:mb-4 sm:mb-6">
      <label className="responsive-text-label text-gray-700 mb-1.5 xs:mb-2 block">
        {label}
      </label>
      <input
        className="w-full px-2.5 xs:px-3 sm:px-4 py-1.5 xs:py-2 sm:py-3 text-xs xs:text-sm sm:text-base rounded-md xs:rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
        {...props}
      />
      {error && <p className="responsive-text-sm text-red-500 mt-1">{error}</p>}
    </div>
  );
}
```

**Improvements:**
✓ Input height scales for thumbs vs mice
✓ Text size responsive
✓ Padding scales for touch targets
✓ Label and error text scale together

---

## Example 3: Stats Grid Component

### ❌ Before (Non-Responsive)
```jsx
export function StatsGrid({ stats }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {stats.map(stat => (
        <div key={stat.id} className="p-8 bg-white rounded-3xl shadow-lg">
          <h3 className="text-sm text-gray-500 uppercase tracking-widest font-semibold mb-3">
            {stat.label}
          </h3>
          <p className="text-5xl font-black text-blue-600 mb-6">
            {stat.value}
          </p>
          <p className="text-gray-600 text-sm">
            {stat.subtitle}
          </p>
        </div>
      ))}
    </div>
  );
}
```

**Issues:**
- Gap too wide on mobile (gap-8)
- Padding excessive on mobile (p-8)
- Text too large on mobile (text-5xl)
- Only 2 breakpoints (md, lg)

### ✅ After (Responsive)
```jsx
export function StatsGrid({ stats }) {
  return (
    <div className="responsive-grid-3">
      {stats.map(stat => (
        <div key={stat.id} className="responsive-card bg-white rounded-lg xs:rounded-xl sm:rounded-2xl shadow-lg hover:shadow-xl transition-shadow">
          <h3 className="responsive-text-label text-gray-500 mb-2 xs:mb-3 sm:mb-4">
            {stat.label}
          </h3>
          <p className="text-3xl xs:text-4xl sm:text-5xl font-black text-blue-600 mb-3 xs:mb-4 sm:mb-6">
            {stat.value}
          </p>
          <p className="responsive-text-sm text-gray-600">
            {stat.subtitle}
          </p>
        </div>
      ))}
    </div>
  );
}
```

**Improvements:**
✓ Gap scales from 8px to 24px
✓ Padding scales from 12px to 32px
✓ Numbers scale from 24px to 40px
✓ 6 responsive breakpoints (xs to 2xl)
✓ Added hover effect for interactivity

---

## Example 4: Data Table Component

### ❌ Before (Non-Responsive)
```jsx
export function DataTable({ columns, data }) {
  return (
    <div className="overflow-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-gray-100 border-b">
            {columns.map(col => (
              <th key={col} className="px-6 py-3 text-left font-semibold text-gray-700">
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, idx) => (
            <tr key={idx} className="border-b hover:bg-gray-50">
              {columns.map(col => (
                <td key={col} className="px-6 py-4 text-gray-800">
                  {row[col]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
```

**Issues:**
- Text size fixed (text-sm)
- Padding fixed (px-6 py-3)
- Hard to read on mobile
- No mobile optimization

### ✅ After (Responsive Card/Grid Layout)
```jsx
export function DataTable({ columns, data }) {
  return (
    <>
      {/* Desktop: Table view */}
      <div className="hidden md:block overflow-auto">
        <table className="w-full responsive-text-base">
          <thead>
            <tr className="bg-gray-100 border-b">
              {columns.map(col => (
                <th key={col} className="px-2 xs:px-3 sm:px-4 md:px-6 py-2 xs:py-2.5 sm:py-3 text-left font-semibold text-gray-700">
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, idx) => (
              <tr key={idx} className="border-b hover:bg-gray-50 transition-colors">
                {columns.map(col => (
                  <td key={col} className="px-2 xs:px-3 sm:px-4 md:px-6 py-2 xs:py-2.5 sm:py-3 text-gray-800">
                    {row[col]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile: Card layout */}
      <div className="md:hidden responsive-container">
        <div className="responsive-grid-2">
          {data.map((row, idx) => (
            <div key={idx} className="responsive-card bg-white rounded-lg shadow-md">
              {columns.map(col => (
                <div key={col} className="mb-2 last:mb-0">
                  <p className="responsive-text-label text-gray-600">{col}</p>
                  <p className="responsive-text-base text-gray-900 font-semibold mt-1">
                    {row[col]}
                  </p>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
```

**Improvements:**
✓ Tables hidden on mobile, card layout shown
✓ Padding scales appropriately
✓ Text scales from mobile to desktop
✓ Better for touch and small screens
✓ Maintains data visibility

---

## Example 5: Modal/Dialog Component

### ❌ Before (Non-Responsive)
```jsx
export function Modal({ title, children, onClose }) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-8 w-full max-w-2xl shadow-2xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold">{title}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="w-6 h-6" />
          </button>
        </div>
        <div className="max-h-[600px] overflow-auto">
          {children}
        </div>
      </div>
    </div>
  );
}
```

**Issues:**
- Dialog too wide on mobile (max-w-2xl still large)
- Padding excessive on mobile (p-8)
- Title too large (text-3xl)
- Icon size fixed

### ✅ After (Responsive)
```jsx
export function Modal({ title, children, onClose }) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-2 xs:p-4">
      <div className="bg-white rounded-lg xs:rounded-xl sm:rounded-2xl responsive-card w-full max-w-sm xs:max-w-md sm:max-w-2xl shadow-2xl">
        <div className="flex justify-between items-center mb-3 xs:mb-4 sm:mb-6">
          <h2 className="responsive-heading-md text-gray-900">{title}</h2>
          <button onClick={onClose} className="p-1 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md transition">
            <X className="responsive-icon-sm" />
          </button>
        </div>
        <div className="max-h-[50vh] xs:max-h-[60vh] sm:max-h-[600px] overflow-auto">
          {children}
        </div>
      </div>
    </div>
  );
}
```

**Improvements:**
✓ Modal width scales: sm → md → 2xl
✓ Padding scales from screen edge
✓ Title scales responsively
✓ Icon scales with context
✓ Max-height responsive
✓ Proper mobile safe area

---

## Quick Conversion Checklist

When updating any component:

- [ ] Replace fixed padding with responsive classes
  - `p-8` → `responsive-padding` or `p-3 xs:p-4 sm:p-6 md:p-8`

- [ ] Replace fixed font sizes
  - `text-3xl` → `responsive-heading-md`
  - `text-sm` → `responsive-text-sm`

- [ ] Replace fixed icon sizes
  - `w-6 h-6` → `responsive-icon-sm`
  - `w-12 h-12` → `responsive-icon-md`

- [ ] Update gaps in flex/grid
  - `gap-8` → `responsive-gap` or `gap-2 xs:gap-3 sm:gap-4 md:gap-6`

- [ ] Update border radius
  - `rounded-2xl` → `rounded-lg xs:rounded-xl sm:rounded-2xl`

- [ ] Test at multiple breakpoints
  - [ ] 320px (XS)
  - [ ] 375px (SM)
  - [ ] 640px (MD)
  - [ ] 768px (MD+)
  - [ ] 1024px (LG)

---

## Common Patterns

### Responsive Button with Icon
```jsx
<button className="flex items-center gap-1 xs:gap-2 sm:gap-3 responsive-btn bg-blue-600">
  <SomeIcon className="responsive-icon-sm" />
  <span>Action</span>
</button>
```

### Responsive Header Section
```jsx
<div className="responsive-container mb-6 xs:mb-8 sm:mb-10">
  <h1 className="responsive-heading-xl">Title</h1>
  <p className="responsive-text-base text-gray-600 mt-2 xs:mt-3">Subtitle</p>
</div>
```

### Responsive List
```jsx
<ul className="responsive-flex-col">
  {items.map(item => (
    <li key={item.id} className="responsive-card border">
      <h3 className="responsive-heading-sm">{item.name}</h3>
      <p className="responsive-text-sm mt-2">{item.description}</p>
    </li>
  ))}
</ul>
```

---

## Need Help?

Refer to the main guide: `RESPONSIVE_DESIGN_GUIDE.md`
