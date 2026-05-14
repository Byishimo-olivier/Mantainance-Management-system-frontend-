import React, { useEffect, useState, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import companyLogo from '../../assets/fixnest-brand-wordmark.png';

export default function AuthHeader() {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const dropdownRef = useRef(null);

  // Product-to-tab mapping
  const productNavigation = {
    'CMMS': () => navigate('/product/cmms'),
    'Intelligence': () => navigate('/product/intelligence'),
    'Learn': () => navigate('/product/learn'),
    'Safety': () => navigate('/product/safety'),
    'Providers': () => navigate('/product/providers'),
    'Lattice': () => navigate('/product/lattice'),
    'Fleet': () => navigate('/product/fleet'),
  };

  // Feature-to-tab mapping
  const featureNavigation = {
    'Work Orders': () => navigate('/feature/work-orders'),
    'Asset Management': () => navigate('/feature/asset-management'),
    'Safety & Compliance': () => navigate('/feature/safety-compliance'),
    'Preventive Maintenance': () => navigate('/feature/preventive-maintenance'),
    'Parts & Inventory': () => navigate('/feature/parts-inventory'),
    'Integrations': () => navigate('/feature/integrations'),
    'Analytics & Reporting': () => navigate('/feature/analytics-reporting'),
  };

  // Solution-to-tab mapping
  const solutionNavigation = {
    'Maintenance': () => navigate('/solution/maintenance'),
    'Operations': () => navigate('/solution/operations'),
    'Reliability': () => navigate('/solution/reliability'),
    'Manufacturing & Plants': () => navigate('/solution/industry/manufacturing-plants'),
    'Facility Management': () => navigate('/solution/industry/facility-management'),
    'Energy & Utilities': () => navigate('/solution/industry/energy-utilities'),
    'Food & Beverage Manufacturing': () => navigate('/solution/industry/food-beverage'),
    'Healthcare': () => navigate('/solution/industry/healthcare'),
    'Fleet Management': () => navigate('/solution/industry/fleet-management'),
    'Property Management': () => navigate('/solution/industry/property-management'),
    'Farming & Agriculture': () => navigate('/solution/industry/farming'),
    'Schools & Higher Education': () => navigate('/solution/industry/schools-education'),
    'Government & Public Works': () => navigate('/solution/industry/government-public-works'),
    'Churches & Non-Profits': () => navigate('/solution/industry/churches-nonprofits'),
    'Restaurants': () => navigate('/solution/industry/restaurants'),
    'Gym & Fitness': () => navigate('/solution/industry/gym-fitness'),
    'Hospitality': () => navigate('/solution/industry/hospitality'),
  };

  // Resource-to-tab mapping
  const resourceNavigation = {
    'Product Releases': () => navigate('/resource/product-releases'),
    'Support Center': () => navigate('/resource/support-center'),
    'Partnerships': () => navigate('/resource/partnerships'),
    'Reviews': () => navigate('/resource/reviews'),
    'Webinars & Events': () => navigate('/resource/webinars-events'),
    'Customer Stories': () => navigate('/resource/customer-stories'),
    'Customer Success': () => navigate('/resource/customer-success'),
    'Asset Operations Resource Hub': () => navigate('/resources'),
    'Blog': () => navigate('/resource/blog'),
    'Courses': () => navigate('/resource/courses'),
    'Learning Center': () => navigate('/resource/learning-center'),
    'ROI Calculator': () => navigate('/resource/roi-calculator'),
    'Maintenance Calculator': () => navigate('/resource/maintenance-calculator'),
    'QR Generator': () => navigate('/resource/qr-generator'),
    'Checklist Generator': () => navigate('/resource/checklist-generator'),
    'Ask Anything': () => navigate('/resource/ask-anything'),
    'AI Assessments': () => navigate('/resource/ai-assessments'),
  };

  useEffect(() => {
    try {
      const raw = localStorage.getItem('user');
      if (raw) setUser(JSON.parse(raw));
    } catch (e) {
      console.error('Failed to parse user from localStorage', e);
    }
  }, []);

  useEffect(() => {
    if (!isSearchOpen) return undefined;
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setIsSearchOpen(false);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isSearchOpen]);

  useEffect(() => {
    // Close mobile menu and dropdown when location changes
    setIsMobileMenuOpen(false);
    setActiveDropdown(null);
  }, [location]);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setActiveDropdown(null);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleTeamClick = () => {
    if (location.pathname === '/') {
      setTimeout(() => {
        const teamSection = document.querySelector('[data-section="team"]');
        if (teamSection) {
          teamSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
    } else {
      navigate('/', { state: { scrollToTeam: true } });
    }
  };

  const handleProductClick = (product) => {
    if (productNavigation[product]) {
      productNavigation[product]();
    }
    setActiveDropdown(null);
    setIsMobileMenuOpen(false);
  };

  const handleFeatureClick = (feature) => {
    if (featureNavigation[feature]) {
      featureNavigation[feature]();
    }
    setActiveDropdown(null);
    setIsMobileMenuOpen(false);
  };

  const handleSolutionClick = (solution) => {
    if (solutionNavigation[solution]) {
      solutionNavigation[solution]();
    }
    setActiveDropdown(null);
    setIsMobileMenuOpen(false);
  };

  const handleResourceClick = (resource) => {
    if (resourceNavigation[resource]) {
      resourceNavigation[resource]();
    }
    setActiveDropdown(null);
    setIsMobileMenuOpen(false);
  };

  return (
    <header className="auth-site-header">
      <div className="auth-nav">
        <Link to="/" className="auth-logo">
          <img src={companyLogo} alt="FixNest logo" className="auth-logo-img" />
        </Link>

        <nav className={`auth-nav-links ${isMobileMenuOpen ? 'mobile-open' : ''}`} aria-label="Primary">
          {/* Product Dropdown */}
          <details className="nav-details" open={activeDropdown === 'product'} onToggle={(e) => {
            if (e.target.open) {
              setActiveDropdown('product');
            } else if (activeDropdown === 'product') {
              setActiveDropdown(null);
            }
          }}>
            <summary className="nav-trigger" onClick={(e) => {
              e.preventDefault();
              setActiveDropdown(activeDropdown === 'product' ? null : 'product');
            }}>Product</summary>
            <div className="mega-menu mega-menu--product">
              <div className="mega-section">
                <div className="mega-title">Products</div>
                <div className="mega-chip-grid">
                  <button type="button" className="mega-chip" onClick={() => handleProductClick('CMMS')}>CMMS</button>
                  <button type="button" className="mega-chip" onClick={() => handleProductClick('Intelligence')}>Intelligence</button>
                  <button type="button" className="mega-chip" onClick={() => handleProductClick('Safety')}>Safety</button>
                  <button type="button" className="mega-chip" onClick={() => handleProductClick('Providers')}>Providers</button>
                  <button type="button" className="mega-chip" onClick={() => handleProductClick('Learn')}>Learn</button>
                  <button type="button" className="mega-chip" onClick={() => handleProductClick('Fleet')}>Fleet</button>
                </div>
              </div>
              <div className="mega-divider" />
              <div className="mega-section">
                <div className="mega-title">Features</div>
                <div className="mega-list-grid">
                  <button type="button" className="mega-item" onClick={() => handleFeatureClick('Work Orders')}>
                    <div className="mega-item-title">Work Orders</div>
                    <div className="mega-item-text">Manage requests and work orders in real-time.</div>
                  </button>
                  <button type="button" className="mega-item" onClick={() => handleFeatureClick('Asset Management')}>
                    <div className="mega-item-title">Asset Management</div>
                    <div className="mega-item-text">Maximize asset uptime and reliability.</div>
                  </button>
                  <button type="button" className="mega-item" onClick={() => handleFeatureClick('Safety & Compliance')}>
                    <div className="mega-item-title">Safety & Compliance</div>
                    <div className="mega-item-text">Audit trails and regulatory compliance.</div>
                  </button>
                  <button type="button" className="mega-item" onClick={() => handleFeatureClick('Preventive Maintenance')}>
                    <div className="mega-item-title">Preventive Maintenance</div>
                    <div className="mega-item-text">Reduce downtime with proactive service.</div>
                  </button>
                  <button type="button" className="mega-item" onClick={() => handleFeatureClick('Parts & Inventory')}>
                    <div className="mega-item-title">Parts & Inventory</div>
                    <div className="mega-item-text">Streamline parts tracking and purchasing.</div>
                  </button>
                  <button type="button" className="mega-item" onClick={() => handleFeatureClick('Integrations')}>
                    <div className="mega-item-title">Integrations</div>
                    <div className="mega-item-text">Unified maintenance operations.</div>
                  </button>
                  <button type="button" className="mega-item" onClick={() => handleFeatureClick('Analytics & Reporting')}>
                    <div className="mega-item-title">Analytics & Reporting</div>
                    <div className="mega-item-text">Customizable reports and dashboards.</div>
                  </button>
                </div>
              </div>
            </div>
          </details>

          {/* Solutions Dropdown */}
          <details className="nav-details" open={activeDropdown === 'solutions'} onToggle={(e) => {
            if (e.target.open) {
              setActiveDropdown('solutions');
            } else if (activeDropdown === 'solutions') {
              setActiveDropdown(null);
            }
          }}>
            <summary className="nav-trigger" onClick={(e) => {
              e.preventDefault();
              setActiveDropdown(activeDropdown === 'solutions' ? null : 'solutions');
            }}>Solutions</summary>
            <div className="mega-menu mega-menu--solutions">
              <div className="mega-section">
                <div className="mega-title">By Role</div>
                <div className="mega-chip-grid">
                  <button type="button" className="mega-chip" onClick={() => handleSolutionClick('Maintenance')}>Maintenance</button>
                  <button type="button" className="mega-chip" onClick={() => handleSolutionClick('Operations')}>Operations</button>
                  <button type="button" className="mega-chip" onClick={() => handleSolutionClick('Reliability')}>Reliability</button>
                </div>
              </div>
              <div className="mega-divider" />
              <div className="mega-section">
                <div className="mega-title">By Industry</div>
                <div className="mega-list-grid">
                  <button type="button" className="mega-item" onClick={() => handleSolutionClick('Manufacturing & Plants')}>
                    <div className="mega-item-title">Manufacturing & Plants</div>
                  </button>
                  <button type="button" className="mega-item" onClick={() => handleSolutionClick('Facility Management')}>
                    <div className="mega-item-title">Facility Management</div>
                  </button>
                  <button type="button" className="mega-item" onClick={() => handleSolutionClick('Energy & Utilities')}>
                    <div className="mega-item-title">Energy & Utilities</div>
                  </button>
                  <button type="button" className="mega-item" onClick={() => handleSolutionClick('Food & Beverage Manufacturing')}>
                    <div className="mega-item-title">Food & Beverage Manufacturing</div>
                  </button>
                  <button type="button" className="mega-item" onClick={() => handleSolutionClick('Healthcare')}>
                    <div className="mega-item-title">Healthcare</div>
                  </button>
                  <button type="button" className="mega-item" onClick={() => handleSolutionClick('Fleet Management')}>
                    <div className="mega-item-title">Fleet Management</div>
                  </button>
                  <button type="button" className="mega-item" onClick={() => handleSolutionClick('Property Management')}>
                    <div className="mega-item-title">Property Management</div>
                  </button>
                  <button type="button" className="mega-item" onClick={() => handleSolutionClick('Farming & Agriculture')}>
                    <div className="mega-item-title">Farming & Agriculture</div>
                  </button>
                  <button type="button" className="mega-item" onClick={() => handleSolutionClick('Schools & Higher Education')}>
                    <div className="mega-item-title">Schools & Higher Education</div>
                  </button>
                  <button type="button" className="mega-item" onClick={() => handleSolutionClick('Government & Public Works')}>
                    <div className="mega-item-title">Government & Public Works</div>
                  </button>
                  <button type="button" className="mega-item" onClick={() => handleSolutionClick('Churches & Non-Profits')}>
                    <div className="mega-item-title">Churches & Non-Profits</div>
                  </button>
                  <button type="button" className="mega-item" onClick={() => handleSolutionClick('Restaurants')}>
                    <div className="mega-item-title">Restaurants</div>
                  </button>
                  <button type="button" className="mega-item" onClick={() => handleSolutionClick('Gym & Fitness')}>
                    <div className="mega-item-title">Gym & Fitness</div>
                  </button>
                  <button type="button" className="mega-item" onClick={() => handleSolutionClick('Hospitality')}>
                    <div className="mega-item-title">Hospitality</div>
                  </button>
                </div>
              </div>
            </div>
          </details>

          {/* Resources Dropdown */}
          <details className="nav-details" open={activeDropdown === 'resources'} onToggle={(e) => {
            if (e.target.open) {
              setActiveDropdown('resources');
            } else if (activeDropdown === 'resources') {
              setActiveDropdown(null);
            }
          }}>
            <summary className="nav-trigger" onClick={(e) => {
              e.preventDefault();
              setActiveDropdown(activeDropdown === 'resources' ? null : 'resources');
            }}>Resources</summary>
            <div className="mega-menu mega-menu--resources">
              <div className="mega-section" style={{ marginBottom: '16px' }}>
                <button type="button" className="mega-item" onClick={() => handleResourceClick('Asset Operations Resource Hub')} style={{ fontSize: '18px', fontWeight: '600', color: '#FD8C04' }}>
                  📚 View All Resources →
                </button>
              </div>
              <div className="mega-divider" />
              <div className="mega-section">
                <div className="mega-title">Connect</div>
                <div className="mega-list-grid mega-list-grid--compact">
                  <button type="button" className="mega-item" onClick={() => handleResourceClick('Product Releases')}>
                    <div className="mega-item-title">Product Releases</div>
                    <div className="mega-item-text">Product launches and release highlights.</div>
                  </button>
                  <button type="button" className="mega-item" onClick={() => handleResourceClick('Support Center')}>
                    <div className="mega-item-title">Support Center</div>
                    <div className="mega-item-text">Training and live support.</div>
                  </button>
                  <button type="button" className="mega-item" onClick={() => handleResourceClick('Partnerships')}>
                    <div className="mega-item-title">Partnerships</div>
                    <div className="mega-item-text">Consulting adoption services.</div>
                  </button>
                  <button type="button" className="mega-item" onClick={() => handleResourceClick('Reviews')}>
                    <div className="mega-item-title">Reviews</div>
                    <div className="mega-item-text">What customers are saying.</div>
                  </button>
                  <button type="button" className="mega-item" onClick={() => handleResourceClick('Webinars & Events')}>
                    <div className="mega-item-title">Webinars & Events</div>
                    <div className="mega-item-text">Webinars and upcoming events.</div>
                  </button>
                  <button type="button" className="mega-item" onClick={() => handleResourceClick('Customer Stories')}>
                    <div className="mega-item-title">Customer Stories</div>
                    <div className="mega-item-text">Proven maintenance wins.</div>
                  </button>
                  <button type="button" className="mega-item" onClick={() => handleResourceClick('Customer Success')}>
                    <div className="mega-item-title">Customer Success</div>
                    <div className="mega-item-text">Implementation and training.</div>
                  </button>
                </div>
              </div>
              <div className="mega-divider" />
              <div className="mega-section">
                <div className="mega-title">Learn</div>
                <div className="mega-list-grid mega-list-grid--compact">
                  <button type="button" className="mega-item" onClick={() => handleResourceClick('Asset Operations Resource Hub')}>
                    Asset Operations Resource Hub
                  </button>
                  <button type="button" className="mega-item" onClick={() => handleResourceClick('Blog')}>
                    Blog
                  </button>
                  <button type="button" className="mega-item" onClick={() => handleResourceClick('Courses')}>
                    Courses
                  </button>
                  <button type="button" className="mega-item" onClick={() => handleResourceClick('Learning Center')}>
                    Learning Center
                  </button>
                </div>
              </div>
              <div className="mega-divider" />
              <div className="mega-section">
                <div className="mega-title">Asset Operations Tools</div>
                <div className="mega-list-grid mega-list-grid--compact">
                  <button type="button" className="mega-item" onClick={() => handleResourceClick('ROI Calculator')}>
                    ROI Calculator
                  </button>
                  <button type="button" className="mega-item" onClick={() => handleResourceClick('Maintenance Calculator')}>
                    Maintenance Calculator
                  </button>
                  <button type="button" className="mega-item" onClick={() => handleResourceClick('QR Generator')}>
                    QR Generator
                  </button>
                  <button type="button" className="mega-item" onClick={() => handleResourceClick('Checklist Generator')}>
                    Checklist Generator
                  </button>
                  <button type="button" className="mega-item" onClick={() => handleResourceClick('Ask Anything')}>
                    Ask Anything
                  </button>
                  <button type="button" className="mega-item" onClick={() => handleResourceClick('AI Assessments')}>
                    AI Assessments
                  </button>
                </div>
              </div>
            </div>
          </details>

          <button type="button" className="nav-link" onClick={handleTeamClick}>Team</button>
          <Link to="/pricing" className="nav-link">Pricing</Link>
        </nav>

        <div className="auth-nav-actions">
          <button
            type="button"
            className={`mobile-menu-toggle ${isMobileMenuOpen ? 'active' : ''}`}
            aria-label="Toggle mobile menu"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            <span></span>
            <span></span>
            <span></span>
          </button>
          <button
            type="button"
            className="nav-icon-btn nav-icon-btn--search"
            aria-label="Open search"
            aria-expanded={isSearchOpen}
            onClick={() => setIsSearchOpen(true)}
          >
            <span className="nav-search-icon" aria-hidden="true" />
            <span className="nav-search-label">Search</span>
          </button>
          {user && !['superadmin', 'super-admin'].includes(String(user?.role || '').toLowerCase()) && location.pathname !== '/subscription' && (
            <Link to="/subscription" className="nav-link nav-link--upgrade" style={{ color: '#0F172A', fontWeight: 600 }}>Upgrade</Link>
          )}
          <Link to="/login" className="nav-link">Log in</Link>
          <Link to="/request-demo" className="nav-link">Request Demo</Link>
          <Link to="/register" className="auth-cta">Start a Free Trial</Link>
        </div>
      </div>

      {/* Search Overlay */}
      {isSearchOpen && (
        <div
          className="auth-search-overlay"
          role="dialog"
          aria-modal="true"
          onClick={() => setIsSearchOpen(false)}
        >
          <div className="auth-search-panel" onClick={(event) => event.stopPropagation()}>
            <div className="auth-search-header">
              <div className="auth-search-title">
                <span className="nav-search-icon" aria-hidden="true" />
                <span>Search</span>
              </div>
              <button
                type="button"
                className="auth-search-esc"
                onClick={() => setIsSearchOpen(false)}
              >
                Esc
              </button>
            </div>
            <div className="auth-search-grid">
              <div className="search-group">
                <div className="search-group-title">
                  <span className="search-icon-chip search-icon-chip--blue">P</span>
                  Products
                </div>
                <button type="button" className="search-link" onClick={() => navigate('/product/cmms')}>
                  <span>Maintenance Management</span>
                  <span className="search-arrow">&gt;</span>
                </button>
                <button type="button" className="search-link" onClick={() => navigate('/product/intelligence')}>
                  <span>Enterprise Asset Management</span>
                  <span className="search-arrow">&gt;</span>
                </button>
                <button type="button" className="search-link" onClick={() => navigate('/product/safety')}>
                  <span>Edge</span>
                  <span className="search-arrow">&gt;</span>
                </button>
              </div>
              <div className="search-group">
                <div className="search-group-title">
                  <span className="search-icon-chip search-icon-chip--blue">R</span>
                  Role
                </div>
                <button type="button" className="search-link" onClick={() => navigate('/solution/maintenance')}>
                  <span>Maintenance</span>
                  <span className="search-arrow">&gt;</span>
                </button>
                <button type="button" className="search-link" onClick={() => navigate('/solution/operations')}>
                  <span>Operations</span>
                  <span className="search-arrow">&gt;</span>
                </button>
                <button type="button" className="search-link" onClick={() => navigate('/solution/reliability')}>
                  <span>Reliability</span>
                  <span className="search-arrow">&gt;</span>
                </button>
              </div>
              <div className="search-group">
                <div className="search-group-title">
                  <span className="search-icon-chip search-icon-chip--blue">R</span>
                  Resources
                </div>
                <button type="button" className="search-link" onClick={() => navigate('/resource/checklist-generator')}>
                  <span>Checklist Generator</span>
                  <span className="search-arrow">&gt;</span>
                </button>
                <button type="button" className="search-link" onClick={() => navigate('/resource/learning-center')}>
                  <span>Learning Center</span>
                  <span className="search-arrow">&gt;</span>
                </button>
                <button type="button" className="search-link" onClick={() => navigate('/resource/blog')}>
                  <span>Blog</span>
                  <span className="search-arrow">&gt;</span>
                </button>
              </div>
              <div className="search-group">
                <div className="search-group-title">
                  <span className="search-icon-chip search-icon-chip--red">C</span>
                  Company
                </div>
                <button type="button" className="search-link" onClick={() => navigate('/pricing')}>
                  <span>Pricing</span>
                  <span className="search-arrow">&gt;</span>
                </button>
                <button type="button" className="search-link" onClick={() => navigate('/resource/reviews')}>
                  <span>Reviews</span>
                  <span className="search-arrow">&gt;</span>
                </button>
                <button type="button" className="search-link" onClick={() => navigate('/resource/customer-stories')}>
                  <span>Customer Stories</span>
                  <span className="search-arrow">›</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
