import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

export default function AuthHeader() {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  // Product-to-tab mapping
  const productNavigation = {
    'CMMS': () => navigate('/product/cmms'),
    'Over': () => navigate('/product/cmms'),
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

  const handleTeamClick = () => {
    if (location.pathname === '/') {
      // Already on landing page, scroll to team section
      setTimeout(() => {
        const teamSection = document.querySelector('[data-section="team"]');
        if (teamSection) {
          teamSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
    } else {
      // Navigate to landing page, then scroll
      navigate('/', { state: { scrollToTeam: true } });
    }
  };

  return (
    <header className="auth-site-header">
      <div className="auth-nav">
        <Link to="/" className="auth-logo">
          Fixnest
        </Link>

        <nav className="auth-nav-links" aria-label="Primary">
          <details className="nav-details">
            <summary className="nav-trigger">Product</summary>
            <div className="mega-menu mega-menu--product">
              <div className="mega-section">
                <div className="mega-title">Products</div>
                <div className="mega-chip-grid">
                  <button type="button" className="mega-chip" onClick={() => productNavigation['CMMS']()}>CMMS</button>
                  <button type="button" className="mega-chip" onClick={() => productNavigation['Over']()}>Over</button>
                  <button type="button" className="mega-chip" onClick={() => productNavigation['Learn']()}>Learn</button>
                  <button type="button" className="mega-chip" onClick={() => productNavigation['Safety']()}>Safety</button>
                  <button type="button" className="mega-chip" onClick={() => productNavigation['Providers']()}>Providers</button>
                  <button type="button" className="mega-chip" onClick={() => productNavigation['Lattice']()}>Lattice</button>
                  <button type="button" className="mega-chip" onClick={() => productNavigation['Fleet']()}>Fleet</button>
                  <button type="button" className="mega-chip" onClick={() => productNavigation['Intelligence']()}>Intelligence</button>
                </div>
              </div>
              <div className="mega-divider" />
              <div className="mega-section">
                <div className="mega-title">Features</div>
                <div className="mega-list-grid">
                  <button type="button" className="mega-item" onClick={() => featureNavigation['Work Orders']()} style={{ background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }}>
                    <div className="mega-item-title">Work Orders</div>
                    <div className="mega-item-text">Manage requests and work orders in real-time.</div>
                  </button>
                  <button type="button" className="mega-item" onClick={() => featureNavigation['Asset Management']()} style={{ background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }}>
                    <div className="mega-item-title">Asset Management</div>
                    <div className="mega-item-text">Maximize asset uptime and reliability.</div>
                  </button>
                  <button type="button" className="mega-item" onClick={() => featureNavigation['Safety & Compliance']()} style={{ background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }}>
                    <div className="mega-item-title">Safety & Compliance</div>
                    <div className="mega-item-text">Audit trails and regulatory compliance.</div>
                  </button>
                  <button type="button" className="mega-item" onClick={() => featureNavigation['Preventive Maintenance']()} style={{ background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }}>
                    <div className="mega-item-title">Preventive Maintenance</div>
                    <div className="mega-item-text">Reduce downtime with proactive service.</div>
                  </button>
                  <button type="button" className="mega-item" onClick={() => featureNavigation['Parts & Inventory']()} style={{ background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }}>
                    <div className="mega-item-title">Parts & Inventory</div>
                    <div className="mega-item-text">Streamline parts tracking and purchasing.</div>
                  </button>
                  <button type="button" className="mega-item" onClick={() => featureNavigation['Integrations']()} style={{ background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }}>
                    <div className="mega-item-title">Integrations</div>
                    <div className="mega-item-text">Unified maintenance operations.</div>
                  </button>
                  <button type="button" className="mega-item" onClick={() => featureNavigation['Analytics & Reporting']()} style={{ background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }}>
                    <div className="mega-item-title">Analytics & Reporting</div>
                    <div className="mega-item-text">Customizable reports and dashboards.</div>
                  </button>
                </div>
              </div>
            </div>
          </details>

          <details className="nav-details">
            <summary className="nav-trigger">Solutions</summary>
            <div className="mega-menu mega-menu--solutions">
              <div className="mega-section">
                <div className="mega-title">By Role</div>
                <div className="mega-chip-grid">
                  <button type="button" className="mega-chip" onClick={() => solutionNavigation['Maintenance']()}>Maintenance</button>
                  <button type="button" className="mega-chip" onClick={() => solutionNavigation['Operations']()}>Operations</button>
                  <button type="button" className="mega-chip" onClick={() => solutionNavigation['Reliability']()}>Reliability</button>
                </div>
              </div>
              <div className="mega-divider" />
              <div className="mega-section">
                <div className="mega-title">By Industry</div>
                <div className="mega-list-grid">
                  <button type="button" className="mega-item" onClick={() => solutionNavigation['Manufacturing & Plants']()} style={{ background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }}>
                    <div className="mega-item-title">Manufacturing & Plants</div>
                  </button>
                  <button type="button" className="mega-item" onClick={() => solutionNavigation['Facility Management']()} style={{ background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }}>
                    <div className="mega-item-title">Facility Management</div>
                  </button>
                  <button type="button" className="mega-item" onClick={() => solutionNavigation['Energy & Utilities']()} style={{ background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }}>
                    <div className="mega-item-title">Energy & Utilities</div>
                  </button>
                  <button type="button" className="mega-item" onClick={() => solutionNavigation['Food & Beverage Manufacturing']()} style={{ background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }}>
                    <div className="mega-item-title">Food & Beverage Manufacturing</div>
                  </button>
                  <button type="button" className="mega-item" onClick={() => solutionNavigation['Healthcare']()} style={{ background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }}>
                    <div className="mega-item-title">Healthcare</div>
                  </button>
                  <button type="button" className="mega-item" onClick={() => solutionNavigation['Fleet Management']()} style={{ background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }}>
                    <div className="mega-item-title">Fleet Management</div>
                  </button>
                  <button type="button" className="mega-item" onClick={() => solutionNavigation['Property Management']()} style={{ background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }}>
                    <div className="mega-item-title">Property Management</div>
                  </button>
                  <button type="button" className="mega-item" onClick={() => solutionNavigation['Farming & Agriculture']()} style={{ background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }}>
                    <div className="mega-item-title">Farming & Agriculture</div>
                  </button>
                  <button type="button" className="mega-item" onClick={() => solutionNavigation['Schools & Higher Education']()} style={{ background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }}>
                    <div className="mega-item-title">Schools & Higher Education</div>
                  </button>
                  <button type="button" className="mega-item" onClick={() => solutionNavigation['Government & Public Works']()} style={{ background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }}>
                    <div className="mega-item-title">Government & Public Works</div>
                  </button>
                  <button type="button" className="mega-item" onClick={() => solutionNavigation['Churches & Non-Profits']()} style={{ background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }}>
                    <div className="mega-item-title">Churches & Non-Profits</div>
                  </button>
                  <button type="button" className="mega-item" onClick={() => solutionNavigation['Restaurants']()} style={{ background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }}>
                    <div className="mega-item-title">Restaurants</div>
                  </button>
                  <button type="button" className="mega-item" onClick={() => solutionNavigation['Gym & Fitness']()} style={{ background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }}>
                    <div className="mega-item-title">Gym & Fitness</div>
                  </button>
                  <button type="button" className="mega-item" onClick={() => solutionNavigation['Hospitality']()} style={{ background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }}>
                    <div className="mega-item-title">Hospitality</div>
                  </button>
                </div>
              </div>
            </div>
          </details>

          <details className="nav-details">
            <summary className="nav-trigger">Resources</summary>
            <div className="mega-menu mega-menu--resources">
              <div className="mega-section" style={{ marginBottom: '16px' }}>
                <button type="button" className="mega-item" onClick={() => navigate('/resources')} style={{ background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', fontSize: '18px', fontWeight: '600', color: '#2563EB' }}>
                  📚 View All Resources →
                </button>
              </div>
              <div className="mega-divider" />
              <div className="mega-section">
                <div className="mega-title">Connect</div>
                <div className="mega-list-grid mega-list-grid--compact">
                  <button type="button" className="mega-item" onClick={() => resourceNavigation['Product Releases']()} style={{ background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }}>
                    <div className="mega-item-title">Product Releases</div>
                    <div className="mega-item-text">Product launches and release highlights.</div>
                  </button>
                  <button type="button" className="mega-item" onClick={() => resourceNavigation['Support Center']()} style={{ background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }}>
                    <div className="mega-item-title">Support Center</div>
                    <div className="mega-item-text">Training and live support.</div>
                  </button>
                  <button type="button" className="mega-item" onClick={() => resourceNavigation['Partnerships']()} style={{ background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }}>
                    <div className="mega-item-title">Partnerships</div>
                    <div className="mega-item-text">Consulting adoption services.</div>
                  </button>
                  <button type="button" className="mega-item" onClick={() => resourceNavigation['Reviews']()} style={{ background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }}>
                    <div className="mega-item-title">Reviews</div>
                    <div className="mega-item-text">What customers are saying.</div>
                  </button>
                  <button type="button" className="mega-item" onClick={() => resourceNavigation['Webinars & Events']()} style={{ background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }}>
                    <div className="mega-item-title">Webinars & Events</div>
                    <div className="mega-item-text">Webinars and upcoming events.</div>
                  </button>
                  <button type="button" className="mega-item" onClick={() => resourceNavigation['Customer Stories']()} style={{ background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }}>
                    <div className="mega-item-title">Customer Stories</div>
                    <div className="mega-item-text">Proven maintenance wins.</div>
                  </button>
                  <button type="button" className="mega-item" onClick={() => resourceNavigation['Customer Success']()} style={{ background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }}>
                    <div className="mega-item-title">Customer Success</div>
                    <div className="mega-item-text">Implementation and training.</div>
                  </button>
                </div>
              </div>
              <div className="mega-divider" />
              <div className="mega-section">
                <div className="mega-title">Learn</div>
                <div className="mega-list-grid mega-list-grid--compact">
                  <button type="button" className="mega-item" onClick={() => resourceNavigation['Asset Operations Resource Hub']()} style={{ background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }}>
                    Asset Operations Resource Hub
                  </button>
                  <button type="button" className="mega-item" onClick={() => resourceNavigation['Blog']()} style={{ background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }}>
                    Blog
                  </button>
                  <button type="button" className="mega-item" onClick={() => resourceNavigation['Courses']()} style={{ background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }}>
                    Courses
                  </button>
                  <button type="button" className="mega-item" onClick={() => resourceNavigation['Learning Center']()} style={{ background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }}>
                    Learning Center
                  </button>
                </div>
              </div>
              <div className="mega-divider" />
              <div className="mega-section">
                <div className="mega-title">Asset Operations Tools</div>
                <div className="mega-list-grid mega-list-grid--compact">
                  <button type="button" className="mega-item" onClick={() => resourceNavigation['ROI Calculator']()} style={{ background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }}>
                    ROI Calculator
                  </button>
                  <button type="button" className="mega-item" onClick={() => resourceNavigation['Maintenance Calculator']()} style={{ background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }}>
                    Maintenance Calculator
                  </button>
                  <button type="button" className="mega-item" onClick={() => resourceNavigation['QR Generator']()} style={{ background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }}>
                    QR Generator
                  </button>
                  <button type="button" className="mega-item" onClick={() => resourceNavigation['Checklist Generator']()} style={{ background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }}>
                    Checklist Generator
                  </button>
                  <button type="button" className="mega-item" onClick={() => resourceNavigation['Ask Anything']()} style={{ background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }}>
                    Ask Anything
                  </button>
                  <button type="button" className="mega-item" onClick={() => resourceNavigation['AI Assessments']()} style={{ background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }}>
                    AI Assessments
                  </button>
                </div>
              </div>
            </div>
          </details>

          <button type="button" className="nav-link" onClick={handleTeamClick} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 'inherit', color: 'inherit', textDecoration: 'inherit' }}>Team</button>
          <Link to="/pricing" className="nav-link">Pricing</Link>
        </nav>

        <div className="auth-nav-actions">
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
          {user && location.pathname !== '/subscription' && (
            <Link to="/subscription" className="nav-link nav-link--upgrade" style={{ color: '#0F172A', fontWeight: 600 }}>Upgrade</Link>
          )}
          <Link to="/login" className="nav-link">Log in</Link>
          <Link to="/register" className="auth-cta">Start a Free Trial</Link>
        </div>
      </div>

      {isSearchOpen ? (
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
                <button type="button" className="search-link">
                  <span>Maintenance Management</span>
                  <span className="search-arrow">&gt;</span>
                </button>
                <button type="button" className="search-link">
                  <span>Enterprise Asset Management</span>
                  <span className="search-arrow">&gt;</span>
                </button>
                <button type="button" className="search-link">
                  <span>Edge</span>
                  <span className="search-arrow">&gt;</span>
                </button>
              </div>
              <div className="search-group">
                <div className="search-group-title">
                  <span className="search-icon-chip search-icon-chip--blue">R</span>
                  Role
                </div>
                <button type="button" className="search-link">
                  <span>Maintenance</span>
                  <span className="search-arrow">&gt;</span>
                </button>
                <button type="button" className="search-link">
                  <span>Operations</span>
                  <span className="search-arrow">&gt;</span>
                </button>
                <button type="button" className="search-link">
                  <span>Reliability</span>
                  <span className="search-arrow">&gt;</span>
                </button>
              </div>
              <div className="search-group">
                <div className="search-group-title">
                  <span className="search-icon-chip search-icon-chip--blue">R</span>
                  Resources
                </div>
                <button type="button" className="search-link">
                  <span>Checklist Generator</span>
                  <span className="search-arrow">&gt;</span>
                </button>
                <button type="button" className="search-link">
                  <span>Learning Center</span>
                  <span className="search-arrow">&gt;</span>
                </button>
                <button type="button" className="search-link">
                  <span>Blog</span>
                  <span className="search-arrow">&gt;</span>
                </button>
              </div>
              <div className="search-group">
                <div className="search-group-title">
                  <span className="search-icon-chip search-icon-chip--red">C</span>
                  Company
                </div>
                <button type="button" className="search-link">
                  <span>Pricing</span>
                  <span className="search-arrow">&gt;</span>
                </button>
                <button type="button" className="search-link">
                  <span>Reviews</span>
                  <span className="search-arrow">&gt;</span>
                </button>
                <button type="button" className="search-link">
                  <span>Customer Stories</span>
                  <span className="search-arrow">›</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </header>
  );
}
