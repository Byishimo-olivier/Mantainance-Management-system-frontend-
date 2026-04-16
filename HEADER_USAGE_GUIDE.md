# Professional Header Component - Usage Guide

## 🎯 Overview
Your new Header component is designed as a professional navigation bar matching the FIXNEST design. It includes:
- Logo/branding area
- Navigation menu with dropdowns
- Search functionality
- Authentication (Login/Register vs Logout)
- Mobile responsiveness

---

## 📝 Basic Usage

### Import the Header
```jsx
import Header from './components/Header';
```

### Use in Your App
```jsx
function App() {
  const [user, setUser] = useState(null);

  // Navigation menu structure
  const navigationMenu = [
    {
      label: "Product",
      href: "/products",
      submenu: [
        { label: "CMSS", href: "/products/cmss" },
        { label: "Intelligence", href: "/products/intelligence" },
        { label: "Studio", href: "/products/studio" }
      ]
    },
    {
      label: "Solutions",
      href: "/solutions",
      submenu: [
        { label: "Maintenance", href: "/solutions/maintenance" },
        { label: "Operations", href: "/solutions/operations" }
      ]
    },
    {
      label: "Resources",
      href: "/resources",
      submenu: [
        { label: "Blog", href: "/resources/blog" },
        { label: "Pricing", href: "/pricing" }
      ]
    },
    { label: "Team", href: "/team" },
    { label: "Pricing", href: "/pricing" }
  ];

  const handleLogin = () => {
    // Redirect to login page
    window.location.href = "/login";
  };

  const handleSignUp = () => {
    // Redirect to signup/trial page
    window.location.href = "/register";
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    window.location.href = "/";
  };

  return (
    <Header
      navigation={navigationMenu}
      onLogin={handleLogin}
      onSignUp={handleSignUp}
      user={user}
      onLogout={handleLogout}
    />
  );
}
```

---

## 🎨 Props Reference

| Prop | Type | Description |
|------|------|-------------|
| `navigation` | Array | Menu items with dropdowns: `[{ label, href, submenu: [...] }]` |
| `onLogin` | Function | Callback when "Log in" button is clicked |
| `onSignUp` | Function | Callback when "Start Free Trial" button is clicked |
| `user` | Object | Current user { name, ... }. If null, shows auth buttons |
| `onLogout` | Function | Callback when "Logout" button is clicked |
| `logo` | JSX/Element | Custom logo component (optional) |
| `className` | String | Additional CSS classes |

---

## 🖼️ Integration Example - Landing Page

```jsx
// LandingPage.jsx or similar
import React, { useState } from 'react';
import Header from './Header';
import { useAuth } from '../hooks/useAuth';

export default function LandingPage() {
  const { user, logout } = useAuth();

  const navMenu = [
    {
      label: "Product",
      href: "#",
      submenu: [
        { label: "CMSS", href: "/products/cmss" },
        { label: "Intelligence", href: "/products/intelligence" },
        { label: "Studio", href: "/products/studio" },
        { label: "Safety", href: "/products/safety" },
        { label: "Providers", href: "/products/providers" },
        { label: "Edge Sensors", href: "/products/edge-sensors" },
        { label: "Lattice", href: "/products/lattice" },
        { label: "Fleet", href: "/products/fleet" },
        { label: "Learn", href: "/products/learn" }
      ]
    },
    {
      label: "Solutions",
      href: "#",
      submenu: [
        { label: "By Role", href: "#", submenu: [
          { label: "Maintenance", href: "/solutions/maintenance" },
          { label: "Operations", href: "/solutions/operations" }
        ]},
        { label: "By Industry", href: "#", submenu: [
          { label: "Manufacturing", href: "/solutions/manufacturing" },
          { label: "Facility Management", href: "/solutions/facility" }
        ]}
      ]
    },
    {
      label: "Resources",
      href: "#",
      submenu: [
        { label: "Support", href: "/resources/support" },
        { label: "Blog", href: "/resources/blog" },
        { label: "Webinars", href: "/resources/webinars" },
        { label: "Reviews", href: "/resources/reviews" }
      ]
    },
    { label: "Team", href: "/team" },
    { label: "Pricing", href: "/pricing" }
  ];

  return (
    <div>
      <Header
        navigation={navMenu}
        onLogin={() => window.location.href = "/login"}
        onSignUp={() => window.location.href = "/register"}
        user={user}
        onLogout={logout}
      />
      
      {/* Rest of your landing page content */}
    </div>
  );
}
```

---

## 🔄 Integration with Dashboard

For dashboard pages (when user is authenticated), you might want a different header variant:

```jsx
// Dashboard.jsx
import Header from './Header';
import { useAuth } from '../hooks/useAuth';

export default function Dashboard({ user }) {
  const { logout } = useAuth();

  // Minimal dashboard navigation
  const dashboardNav = [
    { label: "Issues", href: "/issues" },
    { label: "Work Orders", href: "/work-orders" },
    { label: "Technicians", href: "/technicians" },
    { label: "Properties", href: "/properties" }
  ];

  return (
    <div>
      <Header
        navigation={dashboardNav}
        user={user}
        onLogout={logout}
      />
      {/* Dashboard content */}
    </div>
  );
}
```

---

## 🎯 Key Features Explained

### 1. **Navigation Dropdowns**
```jsx
{
  label: "Product",
  href: "/products",
  submenu: [
    { label: "CMSS", href: "/products/cmss" },
    { label: "Intelligence", href: "/products/intelligence" }
  ]
}
```
Dropdowns appear on hover (desktop) and click (mobile).

### 2. **Search Bar**
- Toggleable via Search icon
- Expands when clicked
- Mobile and desktop friendly

### 3. **Authentication States**

**Not Logged In:**
```
[Search] [Log in] [Start Free Trial]
```

**Logged In:**
```
[Search] [User Name] [Logout]
```

### 4. **Mobile Menu**
- Hamburger menu on screens smaller than `md` (768px)
- Responsive navigation
- Collapsible dropdowns

---

## 🚀 Advanced Setup

### Custom Logo Component
```jsx
const CustomLogo = () => (
  <div className="flex items-center gap-2">
    <img src="/logo.svg" alt="Logo" className="w-8 h-8" />
    <span className="font-bold text-sm">FIXNEST</span>
  </div>
);

<Header
  logo={<CustomLogo />}
  navigation={navMenu}
  // ... other props
/>
```

### Conditional Navigation
```jsx
const navigationMenu = user?.role === 'admin' 
  ? adminNavMenu 
  : publicNavMenu;

<Header navigation={navigationMenu} user={user} {...props} />
```

---

## ⚙️ Styling & Customization

The header uses Tailwind CSS classes. Key classes you can customize:

- **Header Background:** `bg-white/95 backdrop-blur-md`
- **Border:** `border-b border-gray-200/40`
- **Buttons:** `hover:text-indigo-600`, `bg-gradient-to-r from-blue-600 to-blue-700`
- **Mobile Breakpoint:** Uses `md:` (768px) for desktop/mobile switching

To modify colors, update the className in the component:
```jsx
// Change primary color from blue to purple
<button className="bg-gradient-to-r from-purple-600 to-purple-700">
  Start Free Trial
</button>
```

---

## 📱 Responsive Breakpoints

| Screen Size | Behavior |
|------------|----------|
| xs (0-640px) | Mobile menu, compact icons |
| sm (640px+) | Search visible |
| md (768px+) | Full desktop nav, dropdowns on hover |
| lg (1024px+) | Larger spacing and text |

---

## ✅ Checklist for Implementation

- [ ] Import Header component
- [ ] Create navigation menu structure
- [ ] Define `onLogin` callback
- [ ] Define `onSignUp` callback
- [ ] Define `onLogout` callback
- [ ] Pass authenticated user from your auth context/state
- [ ] Test on mobile devices
- [ ] Test dropdown functionality
- [ ] Update styling to match your brand colors

---

## 🐛 Common Issues

### Dropdowns not appearing?
Ensure `navigation` array has `submenu` property.

### Links not working?
Make sure you're using `react-router-dom` Link component (already imported).

### Mobile menu stuck?
Check z-index conflicts. Header uses `z-50`.

---

For more help, refer to the **Header.jsx** component code or update this guide!
