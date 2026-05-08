import React from 'react';
import { Link } from 'react-router-dom';
import { MessageCircle } from 'lucide-react';
import './Footer.css';
import { footerMainSections } from '../data/footerNavigation';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="footer-container">
      
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
                <li><Link to="/privacy-policy">Privacy</Link></li>
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
                <div className="footer-contact-item"><a href="tel:+250785230859">+250 785 230 859</a></div>
                <div className="footer-contact-item footer-contact-item--whatsapp">
                  <a href="https://wa.me/250785230859" target="_blank" rel="noreferrer">
                    <MessageCircle size={16} />
                    <span>Text us on WhatsApp</span>
                  </a>
                </div>
                <div className="footer-contact-item"><a href="tel:+250783227490">+250 783 227 490</a></div>
                <div className="footer-contact-item footer-contact-item--whatsapp">
                  <a href="https://wa.me/250783227490" target="_blank" rel="noreferrer">
                    <MessageCircle size={16} />
                    <span>WhatsApp support</span>
                  </a>
                </div>
                <div className="footer-contact-item"><Link to="/request-demo">Schedule a Tour</Link></div>
                <div className="footer-contact-item" style={{ marginTop: '12px', fontSize: '13px' }}>
              Norrsken House Kigali<br />
               1 KN 78 St, Kigali<br />
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
          {footerMainSections.map((section) => (
            <div className="footer-links-column" key={section.title}>
              <h4>{section.title}</h4>
              <ul>
                {section.links.map((link) => (
                  <li key={link.to}>
                    <Link to={link.to}>{link.label}</Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Section */}
        <div className="footer-bottom">
          <div className="footer-copyright">
            © {currentYear}, FixNest Technologies, Inc.
          </div>
          <div className="footer-legal-links">
            <Link to="/cookie-settings">Cookie Settings</Link>
            <Link to="/sitemap">Sitemap</Link>
            <Link to="/privacy-policy">Privacy Policy</Link>
            <Link to="/terms-of-use">Terms of Use</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
