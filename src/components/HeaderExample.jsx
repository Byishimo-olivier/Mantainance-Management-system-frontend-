import React, { useState, useEffect } from 'react';
import Header from './Header';
import { useNavigate } from 'react-router-dom';

/**
 * Header Example Component
 * Shows how to implement the new professional navigation header
 * Use this as a template for your pages
 */
export default function HeaderExample() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  // Check if user is logged in from localStorage
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        console.error('Failed to parse user:', e);
      }
    }
  }, []);

  // Navigation menu structure
  const navigationMenu = [
    {
      label: "Product",
      href: "/products",
      submenu: [
        { label: "CMSS", href: "/products/cmss" },
        { label: "Intelligence", href: "/products/intelligence" },
        { label: "Studio", href: "/products/studio" },
        { label: "Safety", href: "/products/safety" },
        { label: "Providers", href: "/products/providers" },
        { label: "Edge Sensors", href: "/products/edge-sensors" },
        { label: "Lattice", href: "/products/lattice" },
        { label: "Fleet", href: "/products/fleet" },
      ]
    },
    {
      label: "Solutions",
      href: "/solutions",
      submenu: [
        { label: "By Role", href: "/solutions" },
        { label: "Maintenance", href: "/solutions/maintenance" },
        { label: "Operations", href: "/solutions/operations" },
        { label: "Manufacturing", href: "/solutions/manufacturing" },
        { label: "Facility Management", href: "/solutions/facility" },
      ]
    },
    {
      label: "Resources",
      href: "/resources",
      submenu: [
        { label: "Support Center", href: "/resources/support" },
        { label: "Blog", href: "/resources/blog" },
        { label: "Webinars & Events", href: "/resources/webinars" },
        { label: "Customer Stories", href: "/resources/stories" },
        { label: "Reviews", href: "/resources/reviews" },
        { label: "Learning Center", href: "/resources/learning" },
      ]
    },
    { 
      label: "Team", 
      href: "/team",
      submenu: [
        { label: "About Us", href: "/team/about" },
        { label: "Careers", href: "/team/careers" },
        { label: "Contact", href: "/team/contact" },
      ]
    },
    { label: "Pricing", href: "/pricing" }
  ];

  // Handler for login button
  const handleLogin = () => {
    navigate('/login');
  };

  // Handler for sign up button
  const handleSignUp = () => {
    navigate('/register');
  };

  // Handler for logout
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    navigate('/');
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      {/* NEW PROFESSIONAL HEADER */}
      <Header
        navigation={navigationMenu}
        onLogin={handleLogin}
        onSignUp={handleSignUp}
        user={user}
        onLogout={handleLogout}
      />

      {/* Demo Content - Remove this and add your page content */}
      <div className="responsive-container py-12">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl md:text-5xl font-bold text-gray-900 mb-4">
            ✨ New Professional Header
          </h1>
          <p className="text-lg text-gray-600 mb-8">
            Your application now has a modern, professional navigation header that matches the FIXNEST design.
          </p>

          <div className="space-y-6">
            {/* Feature Cards */}
            <div className="grid md:grid-cols-2 gap-6">
              <FeatureCard
                title="📱 Fully Responsive"
                description="Mobile, tablet, and desktop optimized with hamburger menu on small screens"
              />
              <FeatureCard
                title="🎨 Professional Design"
                description="Clean, modern UI matching industry-standard navigation patterns"
              />
              <FeatureCard
                title="🔽 Dropdown Menus"
                description="Nested navigation with smooth animations and hover effects"
              />
              <FeatureCard
                title="🔍 Search Bar"
                description="Toggleable search functionality ready for integration"
              />
              <FeatureCard
                title="👤 Auth Support"
                description="Shows appropriate buttons based on login state"
              />
              <FeatureCard
                title="⚡ Performance"
                description="Lightweight, optimized with sticky behavior"
              />
            </div>

            {/* Implementation Guide */}
            <div className="bg-white rounded-xl shadow-lg p-6 md:p-8 border border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">🚀 How to Use</h2>
              
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">1. Import the Header</h3>
                  <code className="block bg-gray-100 p-3 rounded text-sm text-gray-700 overflow-x-auto">
                    import Header from './components/Header';
                  </code>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">2. Create Navigation Menu</h3>
                  <code className="block bg-gray-100 p-3 rounded text-sm text-gray-700 overflow-x-auto">
                    const navigation = [<br/>
&nbsp;&nbsp;{'{label: "Product", href: "/", submenu: [...]}'},<br/>
&nbsp;&nbsp;{'{label: "Solutions", href: "/solutions"}'},<br/>
                    ];
                  </code>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">3. Add to Your Page</h3>
                  <code className="block bg-gray-100 p-3 rounded text-sm text-gray-700 overflow-x-auto">
                    &lt;Header<br/>
&nbsp;&nbsp;navigation={'{navigationMenu}'}<br/>
&nbsp;&nbsp;onLogin={'{handleLogin}'}<br/>
&nbsp;&nbsp;onSignUp={'{handleSignUp}'}<br/>
&nbsp;&nbsp;user={'{user}'}<br/>
&nbsp;&nbsp;onLogout={'{handleLogout}'}<br/>
                    /&gt;
                  </code>
                </div>
              </div>
            </div>

            {/* Quick Reference */}
            <div className="bg-indigo-50 rounded-xl p-6 md:p-8 border border-indigo-200">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">📋 Props Reference</h2>
              
              <div className="space-y-3">
                <PropItem
                  name="navigation"
                  type="Array"
                  description="Menu items: [{label, href, submenu: [...]}]"
                />
                <PropItem
                  name="onLogin"
                  type="Function"
                  description="Callback when Login is clicked"
                />
                <PropItem
                  name="onSignUp"
                  type="Function"
                  description="Callback when Start Free Trial is clicked"
                />
                <PropItem
                  name="user"
                  type="Object"
                  description="Current user object. If null, shows login buttons"
                />
                <PropItem
                  name="onLogout"
                  type="Function"
                  description="Callback when Logout is clicked"
                />
              </div>
            </div>

            {/* Status Badge */}
            <div className="bg-green-50 rounded-xl p-6 border border-green-200">
              <p className="text-center text-green-800">
                <span className="font-bold">✅ Header is Ready!</span> 
                <br/> 
                Update your pages to use the new Header component.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Reusable Feature Card Component
function FeatureCard({ title, description }) {
  return (
    <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
      <h3 className="font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600 text-sm">{description}</p>
    </div>
  );
}

// Reusable Prop Info Component
function PropItem({ name, type, description }) {
  return (
    <div className="flex gap-4 text-sm">
      <code className="font-mono text-indigo-700 font-semibold flex-shrink-0">{name}</code>
      <div className="flex-1">
        <span className="text-gray-600">{description}</span>
        <br/>
        <span className="text-gray-400 text-xs">Type: {type}</span>
      </div>
    </div>
  );
}
