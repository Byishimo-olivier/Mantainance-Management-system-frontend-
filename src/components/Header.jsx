import React, { useState, useRef, useEffect } from "react";
import { Search, ChevronDown, Menu, X } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

/**
 * Professional Navigation Header
 * Props:
 * - logo: Logo component or image
 * - navigation: [{ label, href, submenu: [...] }]
 * - onLogin: Callback for login action
 * - onSignUp: Callback for signup action
 * - user: Current user object (if logged in)
 * - onLogout: Callback for logout
 */
export default function Header({ 
  logo, 
  navigation = [], 
  onLogin, 
  onSignUp, 
  user, 
  onLogout,
  className = "" 
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpenDropdown(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    if (onLogout) onLogout();
    navigate("/");
  };

  return (
    <header className={`sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-200/40 ${className}`}>
      <div className="responsive-container py-3 xs:py-4 md:py-5">
        <div className="flex items-center justify-between gap-4 xs:gap-6 md:gap-8">
          
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 flex-shrink-0">
            {logo ? (
              logo
            ) : (
              <div className="flex items-center justify-center w-8 xs:w-10 h-8 xs:h-10 bg-gradient-to-br from-indigo-600 to-indigo-700 rounded-lg">
                <svg className="w-5 xs:w-6 h-5 xs:h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                </svg>
              </div>
            )}
            <span className="hidden xs:inline font-bold text-gray-900 text-sm md:text-base">FIXNEST</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-2 flex-1 justify-center">
            {navigation.map((item, idx) => (
              <div key={idx} className="relative group">
                <button
                  onClick={() => setOpenDropdown(openDropdown === idx ? null : idx)}
                  className="px-3 lg:px-4 py-2 text-sm lg:text-base font-medium text-gray-700 hover:text-indigo-600 transition-colors flex items-center gap-1 group"
                >
                  {item.label}
                  {item.submenu && (
                    <ChevronDown className="w-3.5 h-3.5 lg:w-4 lg:h-4 transition-transform group-hover:rotate-180" />
                  )}
                </button>

                {item.submenu && openDropdown === idx && (
                  <div className="absolute top-full left-0 mt-0 w-48 bg-white border border-gray-200 rounded-lg shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200" ref={dropdownRef}>
                    {item.submenu.map((subitem, sidx) => (
                      <Link
                        key={sidx}
                        to={subitem.href}
                        className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 transition-colors border-b border-gray-100 last:border-b-0"
                      >
                        {subitem.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </nav>

          {/* Right Section */}
          <div className="flex items-center gap-2 xs:gap-3 md:gap-4">
            {/* Search */}
            <div className="hidden sm:flex items-center">
              <button
                onClick={() => setSearchOpen(!searchOpen)}
                className="p-2 text-gray-500 hover:text-indigo-600 transition-colors"
              >
                <Search className="w-5 h-5" />
              </button>
            </div>

            {/* Auth or User Menu */}
            {!user ? (
              <>
                <button
                  onClick={onLogin}
                  className="hidden xs:block px-3 xs:px-4 py-1.5 xs:py-2 text-xs xs:text-sm font-medium text-gray-700 hover:text-indigo-600 transition-colors"
                >
                  Log in
                </button>
                <button
                  onClick={onSignUp}
                  className="px-4 xs:px-6 py-1.5 xs:py-2 xs:py-2.5 text-xs xs:text-sm font-bold text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 rounded-full transition-all hover:shadow-lg hover:shadow-blue-200"
                >
                  Start Free Trial
                </button>
              </>
            ) : (
              <div className="flex items-center gap-2 xs:gap-3">
                <span className="hidden xs:inline text-xs xs:text-sm text-gray-700 font-medium px-2">{user.name}</span>
                <button
                  onClick={handleLogout}
                  className="px-3 xs:px-4 py-1.5 xs:py-2 text-xs xs:text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Logout
                </button>
              </div>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              {mobileMenuOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <nav className="md:hidden mt-4 pb-4 border-t border-gray-200 pt-4 space-y-1 animate-in fade-in slide-in-from-top-2 duration-200">
            {navigation.map((item, idx) => (
              <div key={idx}>
                <button
                  onClick={() => setOpenDropdown(openDropdown === idx ? null : idx)}
                  className="w-full text-left px-4 py-2.5 text-sm font-medium text-gray-700 hover:text-indigo-600 hover:bg-gray-50 rounded-lg transition-colors flex items-center justify-between"
                >
                  {item.label}
                  {item.submenu && (
                    <ChevronDown className={`w-4 h-4 transition-transform ${openDropdown === idx ? "rotate-180" : ""}`} />
                  )}
                </button>
                {item.submenu && openDropdown === idx && (
                  <div className="pl-4 space-y-1 mt-1">
                    {item.submenu.map((subitem, sidx) => (
                      <Link
                        key={sidx}
                        to={subitem.href}
                        className="block px-4 py-2 text-xs text-gray-600 hover:text-indigo-600 hover:bg-gray-50 rounded-lg transition-colors"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        {subitem.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </nav>
        )}

        {/* Search Bar (Mobile & Desktop) */}
        {searchOpen && (
          <div className="mt-3 pb-3 animate-in fade-in slide-in-from-top-2 duration-200">
            <input
              type="text"
              placeholder="Search..."
              className="w-full px-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100"
              autoFocus
            />
          </div>
        )}
      </div>
    </header>
  );
}

