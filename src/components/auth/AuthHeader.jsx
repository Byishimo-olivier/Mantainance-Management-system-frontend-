import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

export default function AuthHeader() {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const location = useLocation();
  const [user, setUser] = useState(null);

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
                  <div className="mega-chip">CMMS</div>
                  <div className="mega-chip">Nova</div>
                  <div className="mega-chip">Learn</div>
                  <div className="mega-chip">Safety</div>
                  <div className="mega-chip">Studio</div>
                  <div className="mega-chip">Providers</div>
                  <div className="mega-chip">Edge Sensors</div>
                  <div className="mega-chip">Lattice</div>
                  <div className="mega-chip">Fleet</div>
                  <div className="mega-chip">Intelligence</div>
                </div>
              </div>
              <div className="mega-divider" />
              <div className="mega-section">
                <div className="mega-title">Features</div>
                <div className="mega-list-grid">
                  <div className="mega-item">
                    <div className="mega-item-title">Work Orders</div>
                    <div className="mega-item-text">Manage requests and work orders in real-time.</div>
                  </div>
                  <div className="mega-item">
                    <div className="mega-item-title">Asset Management</div>
                    <div className="mega-item-text">Maximize asset uptime and reliability.</div>
                  </div>
                  <div className="mega-item">
                    <div className="mega-item-title">Safety & Compliance</div>
                    <div className="mega-item-text">Audit trails and regulatory compliance.</div>
                  </div>
                  <div className="mega-item">
                    <div className="mega-item-title">Preventive Maintenance</div>
                    <div className="mega-item-text">Reduce downtime with proactive service.</div>
                  </div>
                  <div className="mega-item">
                    <div className="mega-item-title">Parts & Inventory</div>
                    <div className="mega-item-text">Streamline parts tracking and purchasing.</div>
                  </div>
                  <div className="mega-item">
                    <div className="mega-item-title">Integrations</div>
                    <div className="mega-item-text">Unified maintenance operations.</div>
                  </div>
                  <div className="mega-item">
                    <div className="mega-item-title">Analytics & Reporting</div>
                    <div className="mega-item-text">Customizable reports and dashboards.</div>
                  </div>
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
                  <div className="mega-chip">Maintenance</div>
                  <div className="mega-chip">Operations</div>
                  <div className="mega-chip">Reliability</div>
                </div>
              </div>
              <div className="mega-divider" />
              <div className="mega-section">
                <div className="mega-title">By Industry</div>
                <div className="mega-list-grid">
                  <div className="mega-item">Manufacturing & Plants</div>
                  <div className="mega-item">Facility Management</div>
                  <div className="mega-item">Energy & Utilities</div>
                  <div className="mega-item">Food & Beverage Manufacturing</div>
                  <div className="mega-item">Healthcare</div>
                  <div className="mega-item">Fleet Management</div>
                  <div className="mega-item">Property Management</div>
                  <div className="mega-item">Farming & Agriculture</div>
                  <div className="mega-item">Schools & Higher Education</div>
                  <div className="mega-item">Government & Public Works</div>
                  <div className="mega-item">Churches & Non-Profits</div>
                  <div className="mega-item">Restaurants</div>
                  <div className="mega-item">Gym & Fitness</div>
                  <div className="mega-item">Hospitality</div>
                </div>
              </div>
            </div>
          </details>

          <details className="nav-details">
            <summary className="nav-trigger">Resources</summary>
            <div className="mega-menu mega-menu--resources">
              <div className="mega-section">
                <div className="mega-title">Connect</div>
                <div className="mega-list-grid mega-list-grid--compact">
                  <div className="mega-item">
                    <div className="mega-item-title">Product Releases</div>
                    <div className="mega-item-text">Product launches and release highlights.</div>
                  </div>
                  <div className="mega-item">
                    <div className="mega-item-title">Support Center</div>
                    <div className="mega-item-text">Training and live support.</div>
                  </div>
                  <div className="mega-item">
                    <div className="mega-item-title">Partnerships</div>
                    <div className="mega-item-text">Consulting adoption services.</div>
                  </div>
                  <div className="mega-item">
                    <div className="mega-item-title">Reviews</div>
                    <div className="mega-item-text">What customers are saying.</div>
                  </div>
                  <div className="mega-item">
                    <div className="mega-item-title">Webinars & Events</div>
                    <div className="mega-item-text">Webinars and upcoming events.</div>
                  </div>
                  <div className="mega-item">
                    <div className="mega-item-title">Customer Stories</div>
                    <div className="mega-item-text">Proven maintenance wins.</div>
                  </div>
                  <div className="mega-item">
                    <div className="mega-item-title">Customer Success</div>
                    <div className="mega-item-text">Implementation and training.</div>
                  </div>
                </div>
              </div>
              <div className="mega-divider" />
              <div className="mega-section">
                <div className="mega-title">Learn</div>
                <div className="mega-list-grid mega-list-grid--compact">
                  <div className="mega-item">Asset Operations Resource Hub</div>
                  <div className="mega-item">Blog</div>
                  <div className="mega-item">Courses</div>
                  <div className="mega-item">Learning Center</div>
                </div>
              </div>
              <div className="mega-divider" />
              <div className="mega-section">
                <div className="mega-title">Asset Operations Tools</div>
                <div className="mega-list-grid mega-list-grid--compact">
                  <div className="mega-item">ROI Calculator</div>
                  <div className="mega-item">Maintenance Calculator</div>
                  <div className="mega-item">QR Generator</div>
                  <div className="mega-item">Checklist Generator</div>
                  <div className="mega-item">Ask Anything</div>
                  <div className="mega-item">AI Assessments</div>
                </div>
              </div>
            </div>
          </details>

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
