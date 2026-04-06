import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="footer-container">
        {/* Top Section: Newsletter & Connect */}
        <div className="footer-top">
          <div className="footer-newsletter">
            <h3>Sign up for newsletter!</h3>
            <p>Our weekly newsletter full of inspiration, podcasts, trends & news.</p>
            <form className="footer-newsletter-form">
              <label htmlFor="newsletter-email">Email Address*</label>
              <div className="footer-newsletter-input-group">
                <input 
                  type="email" 
                  id="newsletter-email" 
                  className="footer-newsletter-input" 
                  placeholder="you@example.com"
                  required 
                />
                <button type="submit" className="footer-newsletter-submit">Subscribe</button>
              </div>
            </form>
          </div>

          <div className="footer-links-grid">
            <div className="footer-links-column">
              <h4>Support</h4>
              <ul>
                <li><Link to="/resource/support-center">Get Help</Link></li>
                <li><Link to="/resource/courses">Tutorials</Link></li>
                <li><Link to="/resource/customer-success">Team Training</Link></li>
                <li><a href="#">API Docs</a></li>
                <li><Link to="/resource/learning-center">Free Courses</Link></li>
                <li><a href="#">Sub-Processors</a></li>
                <li><a href="#">Privacy</a></li>
              </ul>
            </div>
            <div className="footer-links-column">
              <h4>Company</h4>
              <ul>
                <li><Link to="/resource/customer-stories">About us</Link></li>
                <li><Link to="/pricing">Pricing</Link></li>
                <li><a href="#">Careers</a></li>
                <li><a href="#">Press</a></li>
                <li><Link to="/resource/blog">Blog</Link></li>
                <li><Link to="/resource/partnerships">Partnerships</Link></li>
                <li><a href="#">Ambassador Policy</a></li>
                <li><a href="#">Contact</a></li>
              </ul>
            </div>
            <div className="footer-links-column">
              <h4>Contact</h4>
              <div className="footer-contact-info">
                <div className="footer-contact-item">+250 785 230 859</div>
                <div className="footer-contact-item">+250 783 227 490</div>
                <div className="footer-contact-item"><a href="#">Schedule a Tour</a></div>
                <div className="footer-contact-item" style={{ marginTop: '12px', fontSize: '13px' }}>
                 Kigali, Rwanda<br />
                 1234 Maintenance St.<br />
                </div>
              </div>
            </div>
            <div className="footer-links-column">
              <h4>Connect with us</h4>
              <ul>
                <li><a href="#">Apple App Store</a></li>
                <li><a href="#">Google Play</a></li>
                <li><a href="#">LinkedIn</a></li>
                <li><a href="#">Twitter</a></li>
              </ul>
            </div>
          </div>
        </div>

        {/* Categories Grid */}
        <div className="footer-main-grid">
          <div className="footer-links-column">
            <h4>Products</h4>
            <ul>
              <li><Link to="/product/cmms">CMMS</Link></li>
              <li><Link to="/product/safety">Safety</Link></li>
              <li><Link to="/product/edge-sensors">Edge Sensors</Link></li>
              <li><Link to="/product/fleet">Fleet</Link></li>
              <li><Link to="/product/nova">Nova</Link></li>
              <li><Link to="/product/studio">Studio</Link></li>
              <li><Link to="/product/lattice">Lattice</Link></li>
              <li><Link to="/product/intelligence">Intelligence</Link></li>
              <li><Link to="/product/learn">Learn</Link></li>
              <li><Link to="/product/providers">Providers</Link></li>
            </ul>
          </div>

          <div className="footer-links-column">
            <h4>Solutions</h4>
            <ul>
              <li><Link to="/solution/maintenance">Asset Operations Management (AOM)</Link></li>
              <li><Link to="/product/cmms">CMMS</Link></li>
              <li><a href="#">Enterprise Asset Management (EAM)</a></li>
              <li><a href="#">Asset Performance Management (APM)</a></li>
              <li><a href="#">DataHub (Data Asset Platform)</a></li>
              <li><a href="#">DataHub Demo</a></li>
            </ul>
          </div>

          <div className="footer-links-column">
            <h4>Roles</h4>
            <ul>
              <li><Link to="/solution/maintenance">Maintenance</Link></li>
              <li><Link to="/solution/operations">Operations</Link></li>
              <li><Link to="/solution/reliability">Reliability</Link></li>
            </ul>
            <h4 style={{ marginTop: '32px' }}>Industries</h4>
            <ul>
              <li><Link to="/solution/industry/manufacturing-plants">Manufacturing & Plants</Link></li>
              <li><Link to="/solution/industry/food-beverage">Food & Beverage</Link></li>
              <li><Link to="/solution/industry/energy-utilities">Energy & Utilities</Link></li>
              <li><Link to="/solution/industry/government-public-works">Government & Public Works</Link></li>
              <li><Link to="/solution/industry/schools-education">School and Higher Education</Link></li>
              <li><Link to="/solution/industry/gym-fitness">Gym & Fitness</Link></li>
              <li><Link to="/solution/industry/farming">Farming/Agriculture</Link></li>
              <li><Link to="/solution/industry/restaurants">Restaurants</Link></li>
              <li><Link to="/solution/industry/hospitality">Hospitality</Link></li>
              <li><Link to="/solution/industry/healthcare">Healthcare</Link></li>
              <li><Link to="/solution/industry/facility-management">Facilities</Link></li>
              <li><Link to="/solution/industry/property-management">Property</Link></li>
              <li><Link to="/solution/industry/building-mgmt">Building</Link></li>
            </ul>
          </div>

          <div className="footer-links-column">
            <h4>Capabilities</h4>
            <ul>
              <li><Link to="/feature/work-orders">Work Order Management</Link></li>
              <li><Link to="/feature/parts-inventory">Parts & Inventory</Link></li>
              <li><Link to="/feature/safety-compliance">Safety & Compliance</Link></li>
              <li><Link to="/feature/asset-management">Asset Management</Link></li>
              <li><Link to="/feature/preventive-maintenance">Preventive Maintenance</Link></li>
              <li><Link to="/feature/analytics-reporting">Analytics & Reporting</Link></li>
              <li><Link to="/requests">Request Management</Link></li>
              <li><Link to="/product/edge-sensors">Edge</Link></li>
            </ul>
          </div>

          <div className="footer-links-column">
            <h4>Resources</h4>
            <ul>
              <li><Link to="/resources">Asset Operations Resource Hub</Link></li>
              <li><Link to="/resource/blog">Blog</Link></li>
              <li><Link to="/resource/learning-center">Learning Center</Link></li>
              <li><a href="#">What is Asset Operations?</a></li>
              <li><a href="#">What is EAM?</a></li>
              <li><a href="#">What is Inventory Mgmt?</a></li>
              <li><a href="#">What is PM?</a></li>
              <li><a href="#">What is a Work Order?</a></li>
              <li><a href="#">What is CMMS software?</a></li>
            </ul>
          </div>

          <div className="footer-links-column">
            <h4>Free Tools</h4>
            <ul>
              <li><Link to="/resource/roi-calculator">ROI Calculator</Link></li>
              <li><Link to="/resource/maintenance-calculator">Maintenance Calculators</Link></li>
              <li><Link to="/resource/qr-generator">QR Code Generator</Link></li>
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="footer-bottom">
          <div className="footer-copyright">
            © {currentYear}, FixNest Technologies, Inc.
          </div>
          <div className="footer-legal-links">
            <a href="#">Cookie Settings</a>
            <a href="#">Sitemap</a>
            <a href="#">Privacy Policy</a>
            <a href="#">Terms of Use</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
