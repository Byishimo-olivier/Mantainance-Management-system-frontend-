import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle2, ArrowRight, Shield, Zap, Layout, Globe, Truck, GraduationCap, Building2, Factory, Utensils, Lightbulb } from 'lucide-react';
import AuthHeader from './auth/AuthHeader';
import subscriptionAPI from '../api/subscription';
import api from '../api/axios';
import ThierryImage from '../assets/Thierry.jpeg';
import OlivierImage from '../assets/Byishimo.jpeg';

const products = [
  {
    name: 'CMMS',
    label: 'CMMS',
    image: 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=800&q=80',
    icon: <Layout className="w-5 h-5" />,
    description: 'Mobile-first maintenance management that turns reactive firefighting into proactive operations.',
    details: 'Create work orders in seconds, automate PMs, and give your team real-time visibility from any device. Includes inventory tracking, labor costing, and digital checklists.'
  },
  {
    name: 'FixNest Intelligence',
    label: 'Intelligence',
    image: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800&q=80',
    icon: <Zap className="w-5 h-5" />,
    description: 'Embedded AI tools that eliminate busywork and surface insights your team would never find manually.',
    details: 'From smart scheduling to predictive recommendations, Intelligence helps you work faster and smarter without extra setup. Features AI-powered triage and automated incident root cause analysis.'
  },
  {
    name: 'Studio',
    label: 'Studio',
    image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&q=80',
    icon: <Building2 className="w-5 h-5" />,
    description: 'Custom app platform that lets anyone on your team build exactly the tools they need.',
    details: 'Install from 30+ ready-made apps or build your own with no code. All running on your existing data, permissions, and security. No IT intervention required.'
  },
  {
    name: 'Safety',
    label: 'Safety',
    image: 'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=800&q=80',
    icon: <Shield className="w-5 h-5" />,
    description: 'Environment, Health, & Safety Software. Capture safety events in seconds with voice-to-text.',
    details: 'Automated OSHA logs, AI-powered CAPAs, and instant audit trails. Scan QR codes for instant safety reporting without requiring an account.'
  },
  {
    name: 'Providers',
    label: 'Providers',
    image: 'https://images.unsplash.com/photo-1521791136064-7986c2959443?w=800&q=80',
    icon: <Globe className="w-5 h-5" />,
    description: 'Vendor and contractor management integrated with your maintenance workflow.',
    details: 'Track contracts, performance, and communications all in one place. Streamline invoicing and external work order dispatching.'
  },
  {
    name: 'Edge Sensors',
    label: 'Edge Sensors',
    image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&q=80',
    icon: <Zap className="w-5 h-5" />,
    description: 'Wireless IoT sensors that monitor your assets 24/7 and automatically create work orders.',
    details: 'Monitor temperature, vibration, and energy usage. Install in hours and start receiving predictive alerts before failures occur.'
  },
  {
    name: 'Lattice',
    label: 'Lattice',
    image: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc48?w=800&q=80',
    icon: <Layout className="w-5 h-5" />,
    description: 'Data integration layer that unifies maintenance, safety, and asset information.',
    details: 'Connect your ERP, PLC, and third-party tools into one unified data foundation for your entire operation.'
  },
  {
    name: 'Fleet',
    label: 'Fleet',
    image: 'https://images.unsplash.com/photo-1519003722824-194d4455a60c?w=800&q=80',
    icon: <Truck className="w-5 h-5" />,
    description: 'Vehicle maintenance management that connects telematics data to work orders.',
    details: 'Instant VIN lookup, digital DOT inspections, and fuel tracking. Automate PM schedules based on real-time mileage and engine hours.'
  },
  {
    name: 'Learn',
    label: 'Learn',
    image: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=800&q=80',
    icon: <GraduationCap className="w-5 h-5" />,
    description: 'Learning Management Software. Enable your frontline team to access job-relevant training.',
    details: 'Track certifications, prove compliance, and deploy mobile micro-learning modules that technicians can complete in the field.'
  }
];

const industries = [
  {
    name: 'Manufacturing & Plants',
    image: 'https://images.unsplash.com/photo-1565373679107-344d3c173348?w=800&q=80',
    icon: <Factory className="w-5 h-5" />,
    description: 'Reduce unplanned downtime and optimize OEE with predictive maintenance.',
    details: 'Connect shop-floor data to work orders. Monitor assembly lines 24/7 and manage spare parts inventory across multiple plants.'
  },
  {
    name: 'Food & Beverage',
    image: 'https://images.unsplash.com/photo-1556761175-5973bc0f22b8?w=800&q=80',
    icon: <Utensils className="w-5 h-5" />,
    description: 'Streamline food safety compliance and sanitation specialized workflows.',
    details: 'Automated compliance logging, sanitation schedule tracking, and chilled storage monitoring to ensure regulatory standards are met every day.'
  },
  {
    name: 'Energy & Utilities',
    image: 'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=800&q=80',
    icon: <Lightbulb className="w-5 h-5" />,
    description: 'Maintain critical infrastructure with field-ready mobile tools and GIS.',
    details: 'Remote asset monitoring, substation inspections, and grid reliability tracking. Empower field crews with offline-capable mobile access.'
  },
  {
    name: 'Government & Public Works',
    image: 'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?w=800&q=80',
    icon: <Building2 className="w-5 h-5" />,
    description: 'Public-facing request portals and infrastructure lifecycle management.',
    details: 'Allow citizens to report issues via QR codes. Manage public assets, parks, and city buildings with transparent audit trails and budget oversight.'
  }
];

// Plan descriptions and features (static content)
const planMetadata = {
  basic: {
    displayName: 'Basic',
    description: 'Small teams or single-site operations getting off spreadsheets and paper for the first time.',
    features: ['Unlimited work orders', 'Unlimited locations', 'Over AI'],
    cta: 'Try for free'
  },
  premium: {
    displayName: 'Premium',
    badge: 'Custom Quote',
    description: 'Growing maintenance teams ready to move from reactive to preventive maintenance.',
    features: [
      'Daily Reporting & Insights',
      'PM scheduling',
      'Custom checklists',
      'Parts & inventory with costing',
      'Time & labor tracking',
      '30-day analytics history'
    ],
    cta: 'Request Quotation',
    isPremium: true
  },
  professional: {
    displayName: 'Professional',
    badge: 'Most Popular',
    description: 'Departments managing multiple asset types, needing field mobility and deeper analytics.',
    features: [
      'Mobile offline mode',
      'External request portal',
      'Full analytics history',
      'Asset lifecycle tracking',
      'Signature capture for compliance'
    ],
    cta: 'Schedule a Demo'
  },
  enterprise: {
    displayName: 'Enterprise',
    description: 'Multi-site organizations needing automation, integrations, and governance controls.',
    features: [
      'Multi-site module support',
      'Workflow automation',
      'Reliability & downtime tracking',
      'PO management',
      'API & custom integrations',
      'SSO & custom roles',
      'Custom dashboards'
    ],
    cta: 'Schedule a Demo'
  }
};

const LandingPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [pricing, setPricing] = useState(null);
  const [currency, setCurrency] = useState('USD');
  const [changingCurrency, setChangingCurrency] = useState(false);

  const currencySymbols = {
    'USD': '$',
    'RWF': 'FRw'
  };

  // Scroll to team section if navigation state indicates it
  useEffect(() => {
    if (location.state?.scrollToTeam) {
      setTimeout(() => {
        const teamSection = document.querySelector('[data-section="team"]');
        if (teamSection) {
          teamSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 300);
    }
  }, [location]);

  // Product navigation mapping
  const productRoutes = {
    'CMMS': () => navigate('/product/cmms'),
    'FixNest Intelligence': () => navigate('/product/intelligence'),
    'Studio': () => navigate('/product/studio'),
    'Safety': () => navigate('/product/safety'),
    'Providers': () => navigate('/product/providers'),
    'Edge Sensors': () => navigate('/product/edge-sensors'),
    'Lattice': () => navigate('/product/lattice'),
    'Fleet': () => navigate('/product/fleet'),
    'Learn': () => navigate('/product/learn')
  };

  const handleProductClick = (productName) => {
    const handler = productRoutes[productName];
    if (handler) {
      handler();
    }
  };

  const [selectedItem, setSelectedItem] = useState(null);

  const fetchPricingData = async () => {
    try {
      const response = await subscriptionAPI.getPricing();
      setPricing(response.data?.pricing || response.pricing);
      setCurrency(response.data?.currency || 'USD');
    } catch (err) {
      console.error('Error fetching pricing:', err);
    }
  };

  const handleCurrencyChange = async (newCurrency) => {
    if (changingCurrency) return;
    
    try {
      setChangingCurrency(true);
      const payload = {
        platform: {
          subscriptionCurrency: newCurrency
        }
      };
      await api.put('/api/system-settings', payload);
      setCurrency(newCurrency);
      await fetchPricingData();
    } catch (err) {
      console.error('Error updating currency:', err);
      alert('Failed to change currency: ' + (err.response?.data?.error || err.message));
    } finally {
      setChangingCurrency(false);
    }
  };

  const handleUpgrade = (planKey) => {
    window.location.href = `/subscription?plan=${planKey}&currency=${currency}`;
  };

  useEffect(() => {
    fetchPricingData();
  }, []);

  const pricingPlans = pricing 
    ? ['basic', 'professional', 'enterprise', 'premium']
        .filter(planKey => pricing[planKey])
        .map(planKey => {
          const planPrices = pricing[planKey];
          const metadata = planMetadata[planKey] || {};
          const monthlyPrice = planPrices.monthly;
          const symbol = currencySymbols[currency] || '$';
          
          return {
            key: planKey,
            name: metadata.displayName || planKey,
            price: monthlyPrice ? `${symbol}${monthlyPrice}` : 'Request a Quote',
            period: monthlyPrice ? '/user/mo' : '',
            badge: metadata.badge,
            description: metadata.description,
            features: metadata.features || [],
            cta: metadata.cta
          };
        })
    : [];

  return (
    <div className="landing-page">
      <AuthHeader />

      <section className="landing-hero">
        <div className="landing-hero-content">
          <div className="landing-kicker">THE OPERATING SYSTEM FOR MAINTENANCE</div>
          <h1 className="landing-title">Fixnest CMMS: The Intelligent Maintenance Platform</h1>
          <p className="landing-subtitle">
            For every asset. Every property. Any scale.
          </p>
          <p style={{ fontSize: '18px', color: '#64748b', marginTop: '16px', maxWidth: '600px', lineHeight: '1.7' }}>
            Maintenance today is fragmented — spread across emails, spreadsheets, WhatsApp, and disconnected tools. Fixnest centralizes it all, transforming reactive firefighting into intelligent, predictable operations.
          </p>
          <div className="landing-cta-row">
            <a className="landing-cta" href="/register">Start a Free Trial</a>
            <a className="landing-cta landing-cta--ghost" href="/pricing">Request a Demo</a>
          </div>
        </div>
        <div className="landing-hero-media">
          <div className="hero-photo group">
            <img 
              src="https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=1200&q=80" 
              alt="Industrial Maintenance" 
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-tr from-slate-900/40 to-transparent" />
            <div className="hero-card hero-card--task">
              <div className="hero-card-title">Seasonal Electrical Connection Audit</div>
              <div className="hero-card-meta">Open · 1 hour</div>
            </div>
            <div className="hero-card hero-card--metrics">
              <div className="hero-card-title">Completion Rate</div>
              <div className="hero-card-metric">84% Completed</div>
              <div className="hero-card-graph" />
            </div>
          </div>
        </div>
      </section>

      <section className="landing-logos">
        <div className="landing-logos-title">TRUSTED BY 4,000+ BUSINESSES</div>
        {/* <div className="landing-logos-row">
          <div className="logo-pill">Unilever</div>
          <div className="logo-pill">Pepsi</div>
          <div className="logo-pill">Chevron</div>
          <div className="logo-pill">Caterpillar</div>
          <div className="logo-pill">Shell</div>
          <div className="logo-pill">Yamaha</div>
          <div className="logo-pill">Stratasys</div>
        </div> */}
      </section>

      {/* The Problem Section */}
      <section className="landing-section" style={{ backgroundColor: '#fff', padding: '80px 24px' }}>
        <div className="max-w-6xl mx-auto">
          <div style={{ textAlign: 'center', marginBottom: '60px' }}>
            <h2 className="text-4xl font-bold text-slate-900 mb-4">The Problem With Maintenance Today</h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              Maintenance is not lacking effort — it is lacking structure. Here's what's holding you back:
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            {[
              { icon: '💬', title: 'Scattered Communication', desc: 'Lost service requests across emails, texts, and messages' },
              { icon: '🗂️', title: 'No Single Source', desc: 'Asset and maintenance data trapped in spreadsheets' },
              { icon: '🔥', title: 'Reactive Firefighting', desc: 'Always responding to emergencies, never preventing them' },
              { icon: '👁️', title: 'Limited Visibility', desc: 'Leadership has no real-time insights into operations' },
              { icon: '📈', title: 'Growing Inefficiency', desc: 'Problems multiply as you scale' }
            ].map((item, idx) => (
              <motion.div 
                key={idx}
                whileHover={{ y: -8 }}
                className="p-6 bg-gradient-to-br from-red-50 to-orange-50 border border-red-200 rounded-2xl text-center hover:shadow-lg transition-shadow"
              >
                <div style={{ fontSize: '40px', marginBottom: '12px' }}>{item.icon}</div>
                <h3 className="font-bold text-slate-900 mb-2 text-lg">{item.title}</h3>
                <p className="text-sm text-slate-600">{item.desc}</p>
              </motion.div>
            ))}
          </div>

          <div style={{ marginTop: '40px', textAlign: 'center' }}>
            <p style={{ fontSize: '18px', color: '#64748b', fontStyle: 'italic' }}>
              The result? Poor visibility. Rising costs. Reactive operations. <span style={{ fontWeight: 'bold', color: '#dc2626' }}>But it doesn't have to be this way.</span>
            </p>
          </div>
        </div>
      </section>

      {/* The Opportunity Section */}
      <section className="landing-section" style={{ 
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        padding: '80px 24px',
        color: '#fff'
      }}>
        <div className="max-w-6xl mx-auto">
          <div style={{ textAlign: 'center', marginBottom: '60px' }}>
            <h2 className="text-4xl font-bold mb-4">The Transformation Happens Here</h2>
            <p className="text-xl text-blue-100 max-w-3xl mx-auto">
              When maintenance is managed through a centralized CMMS, everything changes:
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { number: '1️⃣', word: 'Predictable', desc: 'Scheduled, planned operations instead of surprises' },
              { number: '2️⃣', word: 'Measurable', desc: 'Real-time metrics and clear performance indicators' },
              { number: '3️⃣', word: 'Scalable', desc: 'Grow without losing control or visibility' },
              { number: '4️⃣', word: 'Strategic', desc: 'Data-driven decisions that drive business value' }
            ].map((item, idx) => (
              <motion.div 
                key={idx}
                whileHover={{ scale: 1.05 }}
                className="p-8 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 text-center hover:bg-white/20 transition-all"
              >
                <div style={{ fontSize: '48px', marginBottom: '12px' }}>{item.number}</div>
                <h3 className="font-bold text-2xl mb-2">{item.word}</h3>
                <p className="text-blue-100 text-sm">{item.desc}</p>
              </motion.div>
            ))}
          </div>

          <div style={{ 
            marginTop: '60px', 
            textAlign: 'center', 
            padding: '40px 32px',
            backgroundColor: 'rgba(255,255,255,0.1)',
            borderRadius: '20px',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255,255,255,0.2)'
          }}>
            <p className="text-2xl font-bold">This is where Fixnest delivers real transformation</p>
          </div>
        </div>
      </section>

      {/* Fixnest Solution Section */}
      <section className="landing-section" style={{ backgroundColor: '#fff', padding: '80px 24px' }}>
        <div className="max-w-6xl mx-auto">
          <div style={{ textAlign: 'center', marginBottom: '60px' }}>
            <div className="landing-kicker">OUR SOLUTION</div>
            <h2 className="text-4xl font-bold text-slate-900 mb-4">The Fixnest CMMS Platform</h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              A modern, intelligent system designed to centralize and optimize maintenance operations across any environment
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            <div>
              <h3 className="text-2xl font-bold text-slate-900 mb-6">Built For Everyone</h3>
              <div className="space-y-4">
                {[
                  { icon: '🏥', text: 'Hospitals' },
                  { icon: '🎓', text: 'Universities' },
                  { icon: '🏢', text: 'Commercial Buildings' },
                  { icon: '🏘️', text: 'Residential Portfolios' },
                  { icon: '🏭', text: 'Industrial Facilities' }
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center gap-4 p-4 bg-gradient-to-r from-indigo-50 to-blue-50 rounded-xl border border-indigo-100">
                    <span style={{ fontSize: '28px' }}>{item.icon}</span>
                    <span className="font-semibold text-slate-900">{item.text}</span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-2xl font-bold text-slate-900 mb-6">Why Choose Fixnest</h3>
              <ul className="space-y-3">
                {[
                  '✅ Adapts to your specific operations',
                  '✅ Scales with your growth',
                  '✅ Mobile-first field execution',
                  '✅ Real-time visibility and control',
                  '✅ Integrated with your existing tools'
                ].map((item, idx) => (
                  <li key={idx} className="text-lg text-slate-700 flex items-center gap-3">
                    <span className="text-green-600 text-xl">{item.split(' ')[0]}</span>
                    {item.substring(3)}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Capabilities Section */}
      <section className="landing-section" style={{ backgroundColor: '#f8fafc', padding: '80px 24px' }}>
        <div className="max-w-6xl mx-auto">
          <div style={{ textAlign: 'center', marginBottom: '60px' }}>
            <h2 className="text-4xl font-bold text-slate-900 mb-4">What Fixnest CMMS Enables</h2>
            <p className="text-xl text-slate-600">Everything you need for complete maintenance excellence</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: '🏠', title: 'Universal Property Management', desc: 'Manage all your properties in one unified platform' },
              { icon: '👀', title: 'Complete Asset Visibility', desc: 'Know the status of every asset in real-time' },
              { icon: '📈', title: 'Scalable Operations', desc: 'Grow without losing control or efficiency' },
              { icon: '📋', title: 'Centralized Work Orders', desc: 'Create, assign, and track all maintenance work' },
              { icon: '🔄', title: 'Asset Lifecycle Tracking', desc: 'Monitor assets from purchase to replacement' },
              { icon: '🛡️', title: 'Preventive & Predictive', desc: 'Prevent failures before they happen' },
              { icon: '📊', title: 'Real-Time Dashboards', desc: 'Beautiful analytics and actionable insights' },
              { icon: '📱', title: 'Mobile-First Execution', desc: 'Technicians work efficiently from anywhere' }
            ].map((cap, idx) => (
              <motion.div
                key={idx}
                whileHover={{ y: -12 }}
                className="p-6 bg-white rounded-2xl shadow-md hover:shadow-2xl transition-shadow border border-slate-100"
              >
                <div style={{ fontSize: '36px', marginBottom: '12px' }}>{cap.icon}</div>
                <h3 className="font-bold text-slate-900 mb-2 text-lg">{cap.title}</h3>
                <p className="text-slate-600 text-sm">{cap.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Business Impact Section */}
      <section className="landing-section" style={{ 
        background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
        padding: '80px 24px',
        color: '#fff'
      }}>
        <div className="max-w-6xl mx-auto">
          <div style={{ textAlign: 'center', marginBottom: '60px' }}>
            <h2 className="text-4xl font-bold mb-4">Real Business Impact</h2>
            <p className="text-xl text-emerald-100 max-w-3xl mx-auto">
              With Fixnest CMMS, organizations achieve measurable results
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            {[
              { metric: '⬇️', value: 'Reduce Downtime', desc: 'Minimize operational disruptions' },
              { metric: '💰', value: 'Lower Costs', desc: 'Proactive planning saves money' },
              { metric: '⏱️', value: 'Extend Lifespan', desc: 'Assets last longer with care' },
              { metric: '👥', value: 'Better Coordination', desc: 'Teams work together seamlessly' },
              { metric: '🎯', value: 'Data-Driven', desc: 'Make smarter decisions' }
            ].map((item, idx) => (
              <motion.div
                key={idx}
                whileHover={{ scale: 1.05 }}
                className="p-6 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 text-center hover:bg-white/20 transition-all"
              >
                <div style={{ fontSize: '40px', marginBottom: '12px' }}>{item.metric}</div>
                <h3 className="font-bold text-lg mb-2">{item.value}</h3>
                <p className="text-emerald-100 text-sm">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Fixnest is Different */}
      <section className="landing-section" style={{ backgroundColor: '#fff', padding: '80px 24px' }}>
        <div className="max-w-4xl mx-auto">
          <div style={{ textAlign: 'center', marginBottom: '60px' }}>
            <h2 className="text-4xl font-bold text-slate-900 mb-4">Beyond Traditional CMMS</h2>
            <p className="text-xl text-slate-600">
              Fixnest is not just another CMMS. Here's what makes it different:
            </p>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
          >
            {[
              {
                icon: '🎯',
                old: 'Just tracking work',
                new: 'Driving strategy',
              },
              {
                icon: '💾',
                old: 'Just storing data',
                new: 'Generating insights',
              },
              {
                icon: '🔧',
                old: 'Just managing tasks',
                new: 'Transforming operations',
              }
            ].map((item, idx) => (
              <div key={idx} className="p-8 border-2 border-slate-200 rounded-2xl hover:border-indigo-500 transition-colors">
                <div style={{ fontSize: '48px', marginBottom: '20px' }}>{item.icon}</div>
                <div className="space-y-4">
                  <div className="text-red-600 line-through text-lg">{item.old}</div>
                  <div className="flex items-center gap-2">
                    <ArrowRight className="w-5 h-5 text-green-600" />
                    <span className="text-green-600 font-bold text-lg">{item.new}</span>
                  </div>
                </div>
              </div>
            ))}
          </motion.div>

          <div style={{ 
            marginTop: '60px', 
            padding: '40px',
            backgroundColor: 'linear-gradient(135deg, #667eea15 0%, #764ba215 100%)',
            border: '2px solid #667eea',
            borderRadius: '20px',
            textAlign: 'center'
          }}>
            <h3 className="text-2xl font-bold text-slate-900 mb-2">Fixnest becomes the operating system for maintenance excellence.</h3>
            <p className="text-slate-700 text-lg">One platform. Total visibility. Smarter maintenance at any scale.</p>
          </div>
        </div>
      </section>

      <section className="landing-section landing-products">
        <div className="landing-section-header">
          <div className="landing-section-title">Our Products</div>
          <a className="landing-section-cta" href="/pricing">Request a Demo</a>
        </div>
        <div className="product-grid">
          {products.map((product) => (
            <motion.article 
              key={product.name} 
              className="product-card group cursor-pointer"
              whileHover={{ y: -8, transition: { duration: 0.2 } }}
              onClick={() => setSelectedItem(product)}
            >
              <div className="product-image-container mb-4 overflow-hidden rounded-xl h-40">
                <img 
                  src={product.image} 
                  alt={product.name} 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
              </div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-indigo-600">{product.icon}</span>
                <div className="product-label">{product.label}</div>
              </div>
              <h3 className="product-title">{product.name}</h3>
              <p className="product-description line-clamp-3">{product.description}</p>
              <button 
                className="product-link mt-4 flex items-center gap-2 group-hover:gap-3 transition-all" 
                type="button"
                style={{ cursor: 'pointer' }}
              >
                Expansion Details <ArrowRight className="w-4 h-4" />
              </button>
            </motion.article>
          ))}
        </div>
      </section>

      <section className="landing-section landing-industries">
        <div className="landing-section-header">
          <div className="landing-section-title">Industries We Serve</div>
          <p className="text-gray-500 max-w-lg">Scalable solutions tailored for specialized operations across various sectors.</p>
        </div>
        <div className="industry-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {industries.map((industry) => (
            <motion.div 
              key={industry.name}
              className="industry-card relative rounded-2xl overflow-hidden h-72 cursor-pointer group"
              whileHover={{ scale: 1.02 }}
              onClick={() => setSelectedItem(industry)}
            >
              <img 
                src={industry.image} 
                alt={industry.name} 
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent" />
              <div className="absolute bottom-0 left-0 p-6 w-full">
                <div className="flex items-center gap-2 text-indigo-400 mb-2">
                  {industry.icon}
                </div>
                <h3 className="text-white font-bold text-xl mb-2">{industry.name}</h3>
                <p className="text-slate-300 text-sm line-clamp-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  {industry.description}
                </p>
                <div className="mt-3 flex items-center gap-2 text-white text-xs font-bold uppercase tracking-wider">
                  View Expansion <ArrowRight className="w-3 h-3" />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Expansion Detail Modal/Overlay */}
      <AnimatePresence>
        {selectedItem && (
          <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 sm:p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedItem(null)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
            />
            <motion.div 
              layoutId={selectedItem.name}
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row"
            >
              <div className="w-full md:w-1/2 h-64 md:h-auto relative">
                <img src={selectedItem.image} alt={selectedItem.name} className="w-full h-full object-cover" />
                <div className="absolute top-4 left-4 p-2 bg-white/20 backdrop-blur-xl rounded-xl text-white">
                  {selectedItem.icon}
                </div>
              </div>
              <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col">
                <button 
                  onClick={() => setSelectedItem(null)}
                  className="absolute top-6 right-6 p-2 hover:bg-slate-100 rounded-full transition-colors"
                >
                  <X className="w-6 h-6 text-slate-400" />
                </button>
                <div className="text-indigo-600 font-bold tracking-widest text-xs uppercase mb-2">
                  {selectedItem.label || 'Industry Solution'}
                </div>
                <h2 className="text-3xl font-bold text-slate-900 mb-4">{selectedItem.name}</h2>
                <p className="text-lg text-slate-600 font-medium mb-6 leading-relaxed">
                  {selectedItem.description}
                </p>
                <div className="bg-slate-50 p-6 rounded-2xl mb-8">
                  <h4 className="text-slate-900 font-bold mb-3 flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-green-500" /> Key Capabilities
                  </h4>
                  <p className="text-slate-600 leading-relaxed">
                    {selectedItem.details}
                  </p>
                </div>
                <div className="mt-auto pt-6 border-t border-slate-100 flex items-center gap-4">
                  <button 
                    onClick={() => {
                      setSelectedItem(null);
                      if (selectedItem.label) handleProductClick(selectedItem.name);
                    }}
                    className="px-6 py-3 bg-indigo-600 text-white rounded-full font-bold hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200"
                  >
                    Learn More
                  </button>
                  <button 
                    onClick={() => setSelectedItem(null)}
                    className="px-6 py-3 border border-slate-200 text-slate-600 rounded-full font-bold hover:bg-slate-50 transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {pricingPlans.length > 0 && (
        <section className="landing-section landing-pricing">
          <div className="landing-section-header">
            <div>
              <div className="landing-kicker">FixNestPRICING</div>
              <div className="landing-section-title">Plans for Every Team</div>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button 
                onClick={() => handleCurrencyChange('USD')}
                disabled={changingCurrency}
                style={{ 
                  padding: '8px 16px', 
                  borderRadius: '6px',
                  border: currency === 'USD' ? '2px solid #0066cc' : '1px solid #ddd',
                  backgroundColor: currency === 'USD' ? '#f0f8ff' : '#fff',
                  color: currency === 'USD' ? '#0066cc' : '#333',
                  fontWeight: currency === 'USD' ? '600' : '500',
                  cursor: changingCurrency ? 'not-allowed' : 'pointer',
                  opacity: changingCurrency ? 0.6 : 1,
                  fontSize: '14px'
                }}
              >
                USD ($)
              </button>
              <button 
                onClick={() => handleCurrencyChange('RWF')}
                disabled={changingCurrency}
                style={{ 
                  padding: '8px 16px', 
                  borderRadius: '6px',
                  border: currency === 'RWF' ? '2px solid #0066cc' : '1px solid #ddd',
                  backgroundColor: currency === 'RWF' ? '#f0f8ff' : '#fff',
                  color: currency === 'RWF' ? '#0066cc' : '#333',
                  fontWeight: currency === 'RWF' ? '600' : '500',
                  cursor: changingCurrency ? 'not-allowed' : 'pointer',
                  opacity: changingCurrency ? 0.6 : 1,
                  fontSize: '14px'
                }}
              >
                RWF (FRw)
              </button>
            </div>
          </div>
          <div className="pricing-grid">
            {pricingPlans.map((plan) => (
              <article
                key={plan.key}
                className={`pricing-card${plan.badge ? ' pricing-card--featured' : ''}${plan.key === 'premium' ? ' pricing-card--premium' : ''}`}
                style={plan.key === 'premium' ? {
                  borderColor: '#9333ea',
                  backgroundColor: '#faf5ff',
                  position: 'relative',
                  transform: 'scale(1.02)'
                } : {}}
              >
                {plan.badge ? <div className="pricing-badge" style={plan.key === 'premium' ? {
                  backgroundColor: '#9333ea',
                  color: '#fff'
                } : {}}>{plan.badge}</div> : null}
                <div className="pricing-name" style={plan.key === 'premium' ? { color: '#9333ea' } : {}}>{plan.name}</div>
                <div className="pricing-price">
                  {plan.key === 'premium' ? (
                    <span style={{ color: '#9333ea', fontSize: '24px', fontWeight: 'bold' }}>Custom Pricing</span>
                  ) : (
                    <>
                      {plan.price}
                      {plan.period ? <span className="pricing-period">{plan.period}</span> : null}
                    </>
                  )}
                </div>
                <p className="pricing-description">{plan.description}</p>
                <div className="pricing-feature-list">
                  {plan.features.map((feature) => (
                    <div key={feature} className="pricing-feature">
                      <span className="pricing-check" aria-hidden="true" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
                <button 
                  className="pricing-cta" 
                  type="button"
                  onClick={() => handleUpgrade(plan.key)}
                  style={plan.key === 'premium' ? {
                    cursor: 'pointer',
                    backgroundColor: '#9333ea',
                    color: '#fff'
                  } : { cursor: 'pointer' }}
                >
                  {plan.cta}
                </button>
                <div className="pricing-note">No Credit Card Required.</div>
              </article>
            ))}
          </div>
        </section>
      )}

      <section className="landing-section landing-features">
        <div className="landing-section-header">
          <div className="landing-section-title">Core Features</div>
          <p style={{ marginTop: '8px', fontSize: '16px', color: '#666' }}>Everything you need for complete maintenance management</p>
        </div>
        <div className="features-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px', marginTop: '40px' }}>
          <div className="feature-card" style={{ padding: '24px', border: '1px solid #e0e0e0', borderRadius: '8px', backgroundColor: '#fafafa' }}>
            <h3 style={{ marginBottom: '12px', fontSize: '18px', fontWeight: '600' }}>Work Orders</h3>
            <p style={{ color: '#666', lineHeight: '1.6' }}>Manage requests and work orders in real-time. Create, assign, and track maintenance tasks from any device with complete visibility.</p>
          </div>
          <div className="feature-card" style={{ padding: '24px', border: '1px solid #e0e0e0', borderRadius: '8px', backgroundColor: '#fafafa' }}>
            <h3 style={{ marginBottom: '12px', fontSize: '18px', fontWeight: '600' }}>Asset Management</h3>
            <p style={{ color: '#666', lineHeight: '1.6' }}>Maximize asset uptime and reliability. Track asset lifecycle, maintenance history, and performance metrics in one centralized location.</p>
          </div>
          <div className="feature-card" style={{ padding: '24px', border: '1px solid #e0e0e0', borderRadius: '8px', backgroundColor: '#fafafa' }}>
            <h3 style={{ marginBottom: '12px', fontSize: '18px', fontWeight: '600' }}>Safety & Compliance</h3>
            <p style={{ color: '#666', lineHeight: '1.6' }}>Audit trails and regulatory compliance. Automated documentation and reporting to help you maintain standards and reduce risk.</p>
          </div>
          <div className="feature-card" style={{ padding: '24px', border: '1px solid #e0e0e0', borderRadius: '8px', backgroundColor: '#fafafa' }}>
            <h3 style={{ marginBottom: '12px', fontSize: '18px', fontWeight: '600' }}>Preventive Maintenance</h3>
            <p style={{ color: '#666', lineHeight: '1.6' }}>Reduce downtime with proactive service. AI-powered scheduling automatically creates preventive maintenance tasks based on usage and best practices.</p>
          </div>
          <div className="feature-card" style={{ padding: '24px', border: '1px solid #e0e0e0', borderRadius: '8px', backgroundColor: '#fafafa' }}>
            <h3 style={{ marginBottom: '12px', fontSize: '18px', fontWeight: '600' }}>Parts & Inventory</h3>
            <p style={{ color: '#666', lineHeight: '1.6' }}>Streamline parts tracking and purchasing. Manage stock levels, automate reorders, and reduce supply chain delays.</p>
          </div>
          <div className="feature-card" style={{ padding: '24px', border: '1px solid #e0e0e0', borderRadius: '8px', backgroundColor: '#fafafa' }}>
            <h3 style={{ marginBottom: '12px', fontSize: '18px', fontWeight: '600' }}>Analytics & Reporting</h3>
            <p style={{ color: '#666', lineHeight: '1.6' }}>Customizable reports and dashboards with deep insights. Track KPIs, identify trends, and make data-driven maintenance decisions.</p>
          </div>
          <div className="feature-card" style={{ padding: '24px', border: '1px solid #e0e0e0', borderRadius: '8px', backgroundColor: '#fafafa' }}>
            <h3 style={{ marginBottom: '12px', fontSize: '18px', fontWeight: '600' }}>Integrations</h3>
            <p style={{ color: '#666', lineHeight: '1.6' }}>Unified maintenance operations. Connect with ERPs, sensors, IoT devices, and other systems for seamless data flow.</p>
          </div>
        </div>
      </section>

      <section className="landing-section landing-integrations">
        <div className="integration-card">
          <div className="integration-text">
            <div className="landing-kicker">INTEGRATIONS</div>
            <h2>Connects to what you already use.</h2>
            <p>
              Plug into your ERP, sensors, and other systems without disruption. One data foundation
              across everything.
            </p>
          </div>
          <div className="integration-visual">
            <div className="integration-node">CMMS</div>
            <div className="integration-node">Fleet</div>
            <div className="integration-node">Edge Sensors</div>
            <div className="integration-node">Safety</div>
            <div className="integration-node">Learn</div>
            <div className="integration-node">Lattice</div>
            <div className="integration-core">Over Agent</div>
          </div>
        </div>
      </section>

      <section className="landing-section landing-ai">
        <div className="ai-panel">
          <div className="ai-text">
            <h2>Automate the tedious. Accelerate the complex.</h2>
            <p>
              Give your team AI that does real work. Over handles routine tasks and surfaces insights
              that used to take hours.
            </p>
            <div className="ai-cta-row">
              <a className="landing-cta" href="/register">Start a Free Trial</a>
              <a className="landing-cta landing-cta--ghost" href="/pricing">Request a Demo</a>
            </div>
          </div>
          <div className="ai-visual">
            <div className="ai-orb">Hi</div>
            <div className="ai-chat">
              <div className="ai-chat-title">How can I help?</div>
              <div className="ai-input">Create a dashboard to display analytics...</div>
              <div className="ai-actions">
                <span className="ai-chip" />
                <span className="ai-chip" />
                <span className="ai-chip ai-chip--send" />
              </div>
            </div>
          </div>
        </div>
        <div className="ai-cards">
          <div className="ai-card">
            <h3>Easily Complete Work Orders from Anywhere</h3>
            <p>
              Create work orders in seconds with photos, checklists, and real-time updates from any device.
              Technicians close work on the spot, reducing admin time and improving response speed.
            </p>
          </div>
          <div className="ai-card">
            <h3>Stay Ahead of Breakdowns with Automated PMs</h3>
            <p>
              Shift from reactive firefighting to proactive planning with automated schedules based on actual usage.
              Smart scheduling keeps assets running longer and minimizes downtime.
            </p>
          </div>
          <div className="ai-card">
            <h3>Turn Safety Events into Preventive Action</h3>
            <p>
              Report safety events from any device - just scan a QR code, no downloads or logins needed.
              AI turns incidents into preventive actions so small issues do not become big problems.
            </p>
          </div>
        </div>
      </section>

      <section className="landing-section landing-cta-hero relative overflow-hidden rounded-[40px] h-[500px] mb-24">
        <img 
          src="https://images.unsplash.com/photo-1552664730-d307ca884978?w=1200&q=80" 
          alt="Team Collaboration" 
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-slate-900/80 to-slate-900/40" />
        <div className="relative z-10 h-full flex flex-col justify-center px-12 md:px-24 max-w-4xl">
          <div className="landing-kicker text-indigo-400 mb-4">DRIVE EFFICIENCY TODAY</div>
          <h2 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
            Stop reacting. <br />
            Start predicting.
          </h2>
          <p className="text-xl text-slate-300 mb-8 max-w-xl">
            Join 4,000+ businesses that have transformed their maintenance operations from reactive firefighting to intelligent asset management.
          </p>
          <div className="landing-cta-row">
            <a className="landing-cta px-10 py-4 text-lg" href="/register">Start Your Free Trial</a>
            <a className="landing-cta landing-cta--ghost px-10 py-4 text-lg border-white/20 text-white" href="/pricing">Schedule a Tour</a>
          </div>
        </div>
      </section>

      <section className="landing-section landing-proof">
        <div className="landing-proof-content">
          <div className="landing-section-title">Leading the Way to a Better Future for Maintenance and Reliability</div>
          <p>
            Your asset and equipment data does not belong in a silo. Fixnest makes it simple to see where everything
            stands, all in one place. That means less guesswork and more time to focus on what matters.
          </p>
          <div className="landing-cta-row">
            <a className="landing-cta" href="/register">Start a Free Trial</a>
            <a className="landing-cta landing-cta--ghost" href="/pricing">Request a Demo</a>
          </div>
          <div className="landing-badges">
            <span className="badge-pill">IDC CMMS Leader 2021</span>
            <span className="badge-pill">Gartner Peer Insights</span>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="landing-section" data-section="team" style={{ backgroundColor: '#fff', padding: '80px 24px' }}>
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <div className="landing-kicker">OUR TEAM</div>
            <h2 className="text-4xl font-bold text-slate-900 mb-4">The Minds Behind Fixnest</h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              A dedicated team of innovators and professionals committed to transforming maintenance management.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Team Member 1 - Thierry */}
            <motion.div 
              whileHover={{ y: -8 }}
              className="bg-slate-50 rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-shadow"
            >
              <div className="h-48 bg-gray-200 relative overflow-hidden">
                <img 
                  src={ThierryImage} 
                  alt="Ndagano Thierry" 
                  className="w-full h-full object-cover object-top hover:scale-110 transition-transform duration-300"
                />
              </div>
              <div className="p-6 text-center">
                <h3 className="text-2xl font-bold text-slate-900 mb-1">Ndagano Thierry</h3>
                <p className="text-indigo-600 font-semibold mb-3">Leadership</p>
                <p className="text-slate-600 text-sm">Visionary leader driving the strategic direction and mission of Fixnest CMMS.</p>
              </div>
            </motion.div>

            {/* Team Member 2 - Olivier */}
            <motion.div 
              whileHover={{ y: -8 }}
              className="bg-slate-50 rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-shadow"
            >
              <div className="h-48 bg-gray-200 relative overflow-hidden">
                <img 
                  src={OlivierImage} 
                  alt="Byishimo Olivier" 
                  className="w-full h-full object-cover object-top hover:scale-110 transition-transform duration-300"
                />
              </div>
              <div className="p-6 text-center">
                <h3 className="text-2xl font-bold text-slate-900 mb-1">Byishimo Olivier</h3>
                <p className="text-purple-600 font-semibold mb-3">Software Developer</p>
                <p className="text-slate-600 text-sm">Expert software engineer building the robust technical foundation of Fixnest.</p>
              </div>
            </motion.div>

            {/* Team Member 3 */}
            <motion.div 
              whileHover={{ y: -8 }}
              className="bg-slate-50 rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-shadow"
            >
              <div className="h-48 bg-gradient-to-br from-pink-400 to-pink-600 flex items-center justify-center">
                <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center text-2xl font-bold text-pink-600">
                  BS
                </div>
              </div>
              <div className="p-6 text-center">
                <h3 className="text-2xl font-bold text-slate-900 mb-1">BYARUHANGA SHEMA</h3>
                <p className="text-pink-600 font-semibold mb-3">Social Media Manager</p>
                <p className="text-slate-600 text-sm">Building our online presence and connecting with the Fixnest community globally.</p>
              </div>
            </motion.div>

            {/* Team Member 4 */}
            <motion.div 
              whileHover={{ y: -8 }}
              className="bg-slate-50 rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-shadow"
            >
              <div className="h-48 bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center">
                <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center text-2xl font-bold text-green-600">
                  RK
                </div>
              </div>
              <div className="p-6 text-center">
                <h3 className="text-2xl font-bold text-slate-900 mb-1">Ruzibiza Kellia</h3>
                <p className="text-green-600 font-semibold mb-3">Developer</p>
                <p className="text-slate-600 text-sm">Talented developer contributing to the innovation and scalability of our platform.</p>
              </div>
            </motion.div>

            {/* Team Member 5 */}
            <motion.div 
              whileHover={{ y: -8 }}
              className="bg-slate-50 rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-shadow"
            >
              <div className="h-48 bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center">
                <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center text-2xl font-bold text-amber-600">
                  HK
                </div>
              </div>
              <div className="p-6 text-center">
                <h3 className="text-2xl font-bold text-slate-900 mb-1">Hannah Kamanzi</h3>
                <p className="text-amber-600 font-semibold mb-3">Partnership Manager</p>
                <p className="text-slate-600 text-sm">Building strategic partnerships to expand Fixnest's reach and impact globally.</p>
              </div>
            </motion.div>
          </div>

          <div className="mt-16 text-center p-8 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl border border-indigo-200">
            <h3 className="text-2xl font-bold text-slate-900 mb-2">Join Our Growing Team</h3>
            <p className="text-slate-600 mb-6">We're always looking for talented individuals passionate about revolutionizing maintenance management.</p>
            <a href="/careers" className="inline-block px-8 py-3 bg-indigo-600 text-white rounded-full font-bold hover:bg-indigo-700 transition-colors">
              View Open Positions
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
