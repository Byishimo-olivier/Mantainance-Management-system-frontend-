import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle2, ArrowRight, Zap, Layout, Globe, Truck, GraduationCap, Building2, Factory, HeartPulse, Lightbulb } from 'lucide-react';
import AuthHeader from './auth/AuthHeader';
import ContactWidget from './ContactWidget';
import subscriptionAPI from '../api/subscription';
import api from '../api/axios';
import ThierryImage from '../assets/Thierry.jpeg';
import OlivierImage from '../assets/olivier.jpeg';
import ShemaImage from '../assets/shema.jpeg';
import ChristianImage from '../assets/Mugisha king christian.jpeg';
import PatrickImage from '../assets/Mbabazi Patrick.jpeg';
import MirellieImage from '../assets/Umugwaneza mirellie.jpeg';
import LauretteImage from '../assets/Kazenga Laurette.jpeg';
import KelliaImage from '../assets/Kellia.jpeg';
import DashboardScreenshot from '../assets/Dashboard.png';
import RequestScreenshot from '../assets/Request.png';
import AssetScreenshot from '../assets/Asset55.png';
import AnalyticsScreenshot from '../assets/analytics.png';
import PMScreenshot from '../assets/PM.png';
import WorkOrderScreenshot from '../assets/Workorder4.png';
import ScheduleScreenshot from '../assets/schedule3.png';
import SignupScreenshot from '../assets/Signup.png';

const teamMembers = [
  {
    name: 'MBABAZI Patrick',
    role: 'Leadership',
    bio: 'Visionary leader driving the strategic direction and mission of Fixnest CMMS.',
    image: PatrickImage,
    accent: 'text-indigo-600',
  },
  // {
  //   name: 'Mbabazi Patrick',
  //   role: 'Operations Manager',
  //   bio: 'Keeps delivery moving smoothly across teams and helps translate field needs into reliable execution.',
  //   image: PatrickImage,
  //   accent: 'text-emerald-600',
  // },
  {
    name: 'Byishimo Olivier',
    role: 'Software Engineer',
    bio: 'Expert software engineer building the robust technical foundation of Fixnest.',
    image: OlivierImage,
    accent: 'text-purple-600',
  },
  {
    name: 'Kellia Ruzibiza',
    role: 'Software Developer',
    bio: 'Develops innovative features and maintains code quality, contributing to the technical excellence of Fixnest.',
    image: KelliaImage,
    accent: 'text-cyan-600',
  },
  {
    name: 'Byaruhanga Shema',
    role: 'Social Media Manager',
    bio: 'Building our online presence and connecting with the Fixnest community globally.',
    image: ShemaImage,
    accent: 'text-pink-600',
  },
  {
    name: 'Mugisha King Christian',
    role: 'Customer Support',
    bio: 'Supports customers closely, resolves issues quickly, and helps every client feel confident using Fixnest.',
    image: ChristianImage,
    accent: 'text-sky-600',
  },
  
  {
    name: 'Umugwaneza Mirellie',
    role: 'Innovation Lead',
    bio: 'Guides product innovation and turns operational ideas into practical tools teams can use every day.',
    image: MirellieImage,
    accent: 'text-rose-600',
  },
  {
    name: 'Kazenga Laurette',
    role: 'Finance',
    bio: 'Oversees financial operations and helps keep the business side of Fixnest disciplined and growth-ready.',
    image: LauretteImage,
    accent: 'text-amber-600',
  },
  
];

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
    name: 'Providers',
    label: 'Providers',
    image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&q=80',
    icon: <Globe className="w-5 h-5" />,
    description: 'Vendor and contractor management integrated with your maintenance workflow.',
    details: 'Track contracts, performance, and communications all in one place. Streamline invoicing and external work order dispatching.'
  },
  {
    name: 'Lattice',
    label: 'Lattice',
    image: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&q=80',
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
    image: 'https://images.unsplash.com/photo-1567789884554-0b844b597180?auto=format&fit=crop&w=900&q=80',
    icon: <Factory className="w-5 h-5" />,
    description: 'Reduce unplanned downtime and optimize OEE with predictive maintenance.',
    details: 'Connect shop-floor data to work orders. Monitor assembly lines 24/7 and manage spare parts inventory across multiple plants.',
    route: '/solution/industry/manufacturing-plants',
  },
  {
    name: 'Healthcare & Clinics',
    image: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=900&q=80',
    icon: <HeartPulse className="w-5 h-5" />,
    description: 'Keep critical medical facilities reliable with preventive maintenance and compliance tracking.',
    details: 'Manage generators, HVAC, lab equipment, and patient-facing spaces with scheduled inspections, asset histories, and fast-response work orders.',
    route: '/solution/industry/healthcare',
  },
  {
    name: 'Energy & Utilities',
    image: 'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=800&q=80',
    icon: <Lightbulb className="w-5 h-5" />,
    description: 'Maintain critical infrastructure with field-ready mobile tools and GIS.',
    details: 'Remote asset monitoring, substation inspections, and grid reliability tracking. Empower field crews with offline-capable mobile access.',
    route: '/solution/industry/energy-utilities',
  },
  {
    name: 'Government & Public Works',
    image: 'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?w=800&q=80',
    icon: <Building2 className="w-5 h-5" />,
    description: 'Public-facing request portals and infrastructure lifecycle management.',
    details: 'Allow citizens to report issues via QR codes. Manage public assets, parks, and city buildings with transparent audit trails and budget oversight.',
    route: '/solution/industry/government-public-works',
  }
];

// Plan descriptions and features (static content)
const planMetadata = {
  basic: {
    displayName: 'Basic',
    description: 'Small teams or single-site operations getting off spreadsheets and paper for the first time.',
    features: ['Unlimited Work order', 'Request', 'AI'],
    cta: 'Try for free'
  },
  premium: {
    displayName: 'Premium',
    badge: 'Custom Quote',
    description: 'Growing maintenance teams ready to move from reactive to preventive maintenance.',
    features: ['Unlimited work Order', 'Requests', 'Asset', 'Location', 'PM', 'Over AI', 'Analytics', 'Material Request', 'Purchase Order'],
    cta: 'Request Quotation',
    isPremium: true
  },
  professional: {
    displayName: 'Professional',
    badge: 'Most Popular',
    description: 'Departments managing multiple asset types, needing field mobility and deeper analytics.',
    features: ['Unlimited work Order', 'Requests', 'Asset', 'Location', 'PM', 'Over AI'],
    cta: 'Schedule a Demo'
  },
  enterprise: {
    displayName: 'Enterprise',
    description: 'Multi-site organizations needing automation, integrations, and governance controls.',
    features: ['Unlimited work Order', 'Requests', 'Asset', 'Location', 'PM', 'Over AI', 'Analytics', 'Material Request'],
    cta: 'Schedule a Demo'
  }
};

const platformScreenshots = [
  {
    eyebrow: 'Asset Management',
    title: 'Know every asset, everywhere',
    description: 'Track every asset from onboarding to retirement. Organize lifecycle details, ownership, categories, and images in one clean workspace.',
    bullets: [
      'Full lifecycle visibility in one place',
      'Custom asset records with photos and details',
      'Fast filtering by category, location, and status',
      'Simple view for client demos and operations reviews',
    ],
    linkLabel: 'Learn more about Asset Management',
    linkHref: '/feature/asset-management',
    image: AssetScreenshot,
    accent: '#FD8C04',
    reverse: false,
  },
  {
    eyebrow: 'Work Orders',
    title: 'From request to resolution, nothing gets lost',
    description: 'Create work orders in seconds with clear assignment, approval, attachments, and progress tracking so every team knows the next step.',
    bullets: [
      'Guided request-to-work-order process',
      'Assignment, approvals, and comments in one flow',
      'Attachments, notes, and history on every job',
      'Cleaner collaboration between clients and internal teams',
    ],
    linkLabel: 'Learn more about Work Orders',
    linkHref: '/feature/work-orders',
    image: WorkOrderScreenshot,
    accent: '#7c3aed',
    reverse: true,
  },
  {
    eyebrow: 'Preventive Maintenance',
    title: 'Plan ahead instead of reacting late',
    description: 'Automate routine maintenance schedules and keep teams aligned on upcoming service before downtime disrupts the operation.',
    bullets: [
      'Recurring PM scheduling built into the platform',
      'Track upcoming tasks before they become emergencies',
      'Support checklists, procedures, and recurring standards',
      'Show clients a clear reliability plan, not just repairs',
    ],
    linkLabel: 'Learn more about Preventive Maintenance',
    linkHref: '/feature/preventive-maintenance',
    image: ScheduleScreenshot,
    accent: '#0f766e',
    reverse: false,
  },
  {
    eyebrow: 'Analytics & Reports',
    title: 'Turn operational activity into clear decisions',
    description: 'Present live charts, KPI trends, and exportable reports that help clients understand value, cost, and performance at a glance.',
    bullets: [
      'Visual dashboards for quick executive review',
      'Professional reporting for meetings and client updates',
      'Track trends, workload, and performance over time',
      'Move from raw maintenance data to business insight',
    ],
    linkLabel: 'Learn more about Analytics',
    linkHref: '/feature/analytics-reporting',
    image: AnalyticsScreenshot,
    accent: '#ea580c',
    reverse: true,
  },
];

const liveDemoSteps = [
  {
    label: 'Signup',
    title: 'Start with a fast Fixnest signup',
    description: 'Create your workspace, add your company details, and get your maintenance team into one system from day one.',
    image: SignupScreenshot,
    accent: '#FD8C04',
    cardPosition: 'right-top',
    points: ['Create your account', 'Set up your workspace', 'Bring your team into one flow'],
  },
  {
    label: 'Requests',
    title: 'Capture every maintenance request clearly',
    description: 'Users can log a request with the issue, priority, and location so the team has everything needed before work begins.',
    image: RequestScreenshot,
    accent: '#0f766e',
    cardPosition: 'left-bottom',
    points: ['Centralized request intake', 'Priority and location details', 'Ready for approval and assignment'],
  },
  {
    label: 'Work Orders',
    title: 'Turn approved requests into work orders',
    description: 'Create, assign, and track work orders with one clean workflow so technicians always know what to do next.',
    image: WorkOrderScreenshot,
    accent: '#7c3aed',
    cardPosition: 'right-center',
    points: ['Convert requests into jobs', 'Assign the right technician', 'Track status from open to done'],
  },
  {
    label: 'PM',
    title: 'Build a preventive maintenance rhythm',
    description: 'Set recurring maintenance plans, attach procedures, and stay ahead of downtime before it becomes urgent.',
    image: PMScreenshot,
    accent: '#ea580c',
    cardPosition: 'center-top',
    points: ['Recurring PM schedules', 'Standard procedures and checklists', 'Less reactive maintenance'],
  },
  {
    label: 'Assets',
    title: 'Keep every asset organized in one place',
    description: 'Track asset history, ownership, condition, and service context so every maintenance decision has the full picture.',
    image: AssetScreenshot,
    accent: '#FD8C04',
    cardPosition: 'left-top',
    points: ['Asset history at a glance', 'Location and ownership tracking', 'Cleaner lifecycle visibility'],
  },
  {
    label: 'Analytics',
    title: 'Finish with reports your team can act on',
    description: 'Review workload, performance, and trends through dashboards that make operational decisions easier to explain.',
    image: AnalyticsScreenshot,
    accent: '#0f172a',
    cardPosition: 'center-bottom',
    points: ['Live KPI dashboards', 'Export-ready reporting', 'Clear performance visibility'],
  },
];

const liveDemoCardMotion = {
  'right-top': { initial: { opacity: 0, x: 48, y: -30, scale: 0.98 }, exit: { opacity: 0, x: 24, y: -18 } },
  'right-bottom': { initial: { opacity: 0, x: 40, y: 28, scale: 0.98 }, exit: { opacity: 0, x: 24, y: 18 } },
  'left-top': { initial: { opacity: 0, x: -48, y: -30, scale: 0.98 }, exit: { opacity: 0, x: -24, y: -18 } },
  'left-center': { initial: { opacity: 0, x: -40, y: 0, scale: 0.98 }, exit: { opacity: 0, x: -24, y: 0 } },
  'right-center': { initial: { opacity: 0, x: 40, y: 0, scale: 0.98 }, exit: { opacity: 0, x: 24, y: 0 } },
  'center-top': { initial: { opacity: 0, x: 0, y: -36, scale: 0.98 }, exit: { opacity: 0, x: 0, y: -18 } },
  'left-bottom': { initial: { opacity: 0, x: -40, y: 28, scale: 0.98 }, exit: { opacity: 0, x: -24, y: 18 } },
  'center-bottom': { initial: { opacity: 0, x: 0, y: 36, scale: 0.98 }, exit: { opacity: 0, x: 0, y: 18 } },
  intro: { initial: { opacity: 0, x: 0, y: -12, scale: 0.96 }, exit: { opacity: 0, x: 0, y: 12 } },
};

const landingAgentStarters = [
  'Show overdue work orders',
  'Build a PM schedule',
  'Summarize site performance',
];

const getLandingAgentReply = (message) => {
  const normalized = String(message || '').toLowerCase();

  if (normalized.includes('work order') || normalized.includes('request')) {
    return 'I can organize incoming requests by priority, assign the right technician, and surface stalled work orders that need attention.';
  }

  if (normalized.includes('pm') || normalized.includes('preventive') || normalized.includes('schedule')) {
    return 'I can turn recurring maintenance needs into a preventive schedule with due dates, owners, and reminders based on asset usage or calendar rules.';
  }

  if (normalized.includes('report') || normalized.includes('analytics') || normalized.includes('dashboard')) {
    return 'I can draft a dashboard view with MTTR, completion rates, asset downtime, and team workload so managers can review performance quickly.';
  }

  if (normalized.includes('safety') || normalized.includes('incident') || normalized.includes('compliance')) {
    return 'I can connect safety events to corrective actions, highlight recurring risks, and prepare a compliance-friendly summary for your team.';
  }

  if (normalized.includes('asset') || normalized.includes('inventory')) {
    return 'I can help structure assets, maintenance history, and parts visibility so teams always know what they own and what needs service next.';
  }

  return 'I can help with work orders, preventive maintenance, analytics, safety follow-up, and asset planning. Try asking for a dashboard, PM schedule, or overdue summary.';
};

const LandingPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [pricing, setPricing] = useState(null);
  const [currency, setCurrency] = useState('USD');
  const [changingCurrency, setChangingCurrency] = useState(false);
  const [activeDemoIndex, setActiveDemoIndex] = useState(0);
  const [isLiveDemoOpen, setIsLiveDemoOpen] = useState(false);
  const [isLiveDemoStarted, setIsLiveDemoStarted] = useState(false);
  const [demoDirection, setDemoDirection] = useState(1);

  const activeDemo = liveDemoSteps[activeDemoIndex];
  const activeDemoMotion = liveDemoCardMotion[activeDemo.cardPosition] || liveDemoCardMotion['right-center'];
  const nextDemo = liveDemoSteps[(activeDemoIndex + 1) % liveDemoSteps.length];
  const isLastDemoStep = activeDemoIndex === liveDemoSteps.length - 1;

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
    'Safety': () => navigate('/product/safety'),
    'Providers': () => navigate('/product/providers'),
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

  const handleIndustryClick = (industry) => {
    if (industry?.route) {
      navigate(industry.route);
      return;
    }
    setSelectedItem(industry);
  };

  const [selectedItem, setSelectedItem] = useState(null);
  const [agentPrompt, setAgentPrompt] = useState('Create a dashboard to display analytics...');
  const [agentSubmitting, setAgentSubmitting] = useState(false);
  const [agentConversation, setAgentConversation] = useState([
    {
      role: 'assistant',
      text: 'I can help you plan work orders, PM schedules, analytics, and safety follow-up.',
    },
  ]);

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

  const handleOpenLiveDemo = () => {
    setActiveDemoIndex(0);
    setDemoDirection(1);
    setIsLiveDemoStarted(false);
    setIsLiveDemoOpen(true);
  };

  const handleCloseLiveDemo = () => {
    setIsLiveDemoStarted(false);
    setIsLiveDemoOpen(false);
  };

  const handleStartLiveDemo = () => {
    setIsLiveDemoStarted(true);
  };

  const handleDemoNext = () => {
    if (isLastDemoStep) {
      setIsLiveDemoOpen(false);
      return;
    }

    setDemoDirection(1);
    setActiveDemoIndex((current) => (current + 1) % liveDemoSteps.length);
  };

  const handleDemoPrevious = () => {
    setDemoDirection(-1);
    setActiveDemoIndex((current) => (current === 0 ? 0 : current - 1));
  };

  const handleDemoStepSelect = (index) => {
    setDemoDirection(index >= activeDemoIndex ? 1 : -1);
    setActiveDemoIndex(index);
  };

  const handleLandingAgentSubmit = (event) => {
    event.preventDefault();
    const nextPrompt = agentPrompt.trim();
    if (!nextPrompt || agentSubmitting) return;

    const nextHistory = agentConversation.map((entry) => ({
      role: entry.role === 'user' ? 'user' : 'model',
      content: entry.text,
    }));

    setAgentConversation((current) => [...current, { role: 'user', text: nextPrompt }]);
    setAgentPrompt('');
    setAgentSubmitting(true);

    api.post('/api/ai/chat', {
      message: nextPrompt,
      history: nextHistory,
    }).then((response) => {
      const payload = response.data?.response;
      const responseText = typeof payload === 'string'
        ? payload
        : payload?.content || getLandingAgentReply(nextPrompt);

      setAgentConversation((current) => [
        ...current,
        { role: 'assistant', text: responseText },
      ]);
    }).catch((error) => {
      console.error('Landing agent error:', error);
      const fallbackText = getLandingAgentReply(nextPrompt);
      const errorMessage = error.response?.data?.message
        ? `${error.response.data.message} ${fallbackText}`
        : fallbackText;

      setAgentConversation((current) => [
        ...current,
        { role: 'assistant', text: errorMessage },
      ]);
    }).finally(() => {
      setAgentSubmitting(false);
    });
  };

  const handleLandingStarterClick = (starter) => {
    setAgentPrompt(starter);
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
            <a className="landing-cta landing-cta--ghost" href="/request-demo">Request a Demo</a>
          </div>
        </div>
        <div className="landing-hero-media hidden">
          <div className="live-demo-shell">
            <div className="hero-photo live-demo-stage" style={{ background: 'linear-gradient(145deg, #0f172a 0%, #1e293b 100%)', padding: '18px' }}>
              <div className="live-demo-topbar">
                <div className="live-demo-badge">Live Demo</div>
                <div className="live-demo-counter">
                  {String(activeDemoIndex + 1).padStart(2, '0')} / {String(liveDemoSteps.length).padStart(2, '0')}
                </div>
              </div>

              <div className="live-demo-progress" aria-label="Live demo steps">
                {liveDemoSteps.map((step, index) => (
                  <button
                    key={step.title}
                    type="button"
                    className={`live-demo-progress-step ${index === activeDemoIndex ? 'is-active' : ''}`}
                    onClick={() => handleDemoStepSelect(index)}
                    aria-label={`Show ${step.label}`}
                  >
                    <span
                      className="live-demo-progress-fill"
                      style={{
                        backgroundColor: step.accent,
                        transform: index <= activeDemoIndex ? 'scaleX(1)' : 'scaleX(0)',
                      }}
                    />
                  </button>
                ))}
              </div>

              <AnimatePresence mode="wait" initial={false}>
                <motion.img
                  key={activeDemo.title}
                  src={activeDemo.image}
                  alt={activeDemo.title}
                  className="live-demo-image"
                  initial={{ opacity: 0, scale: 1.04, y: 18 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.98, y: -16 }}
                  transition={{ duration: 0.55, ease: 'easeOut' }}
                />
              </AnimatePresence>

              <div className="absolute inset-0 bg-gradient-to-tr from-slate-950/45 via-transparent to-slate-900/10" />

              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={`${activeDemo.title}-card`}
                  className="live-demo-card"
                  initial={{ opacity: 0, y: 22 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 16 }}
                  transition={{ duration: 0.4, ease: 'easeOut' }}
                >
                  <div className="live-demo-card-label" style={{ color: activeDemo.accent }}>
                    {activeDemo.label}
                  </div>
                  <h3 className="live-demo-card-title">{activeDemo.title}</h3>
                  <p className="live-demo-card-description">{activeDemo.description}</p>

                  <div className="live-demo-point-list">
                    {activeDemo.points.map((point) => (
                      <div key={point} className="live-demo-point">
                        <CheckCircle2 className="h-4 w-4 shrink-0" style={{ color: activeDemo.accent }} />
                        <span>{point}</span>
                      </div>
                    ))}
                  </div>

                  <div className="live-demo-actions">
                    <button
                      type="button"
                      className="live-demo-next"
                      onClick={handleDemoNext}
                      style={{ backgroundColor: activeDemo.accent }}
                    >
                      <span>{isLastDemoStep ? 'Start free trial' : 'Next'}</span>
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  </div>

                  <p className="live-demo-next-label">
                    {isLastDemoStep ? 'Continue into Fixnest and launch your own workspace.' : `Next: ${nextDemo.label}`}
                  </p>
                </motion.div>
              </AnimatePresence>
            </div>

            <div className="live-demo-step-tabs">
              {liveDemoSteps.map((step, index) => (
                <button
                  key={step.label}
                  type="button"
                  className={`live-demo-step-tab ${index === activeDemoIndex ? 'is-active' : ''}`}
                  onClick={() => handleDemoStepSelect(index)}
                  style={index === activeDemoIndex ? { borderColor: step.accent, color: step.accent } : undefined}
                >
                  {step.label}
                </button>
              ))}
            </div>
          </div>
        </div>
        <div className="landing-hero-media">
          <div className="hero-photo group" style={{ background: 'linear-gradient(145deg, #0f172a 0%, #1e293b 100%)', padding: '18px' }}>
            <img 
              src={DashboardScreenshot}
              alt="Fixnest dashboard overview"
              className="w-full h-full rounded-[24px] object-cover object-top transition-transform duration-700 group-hover:scale-[1.02]"
            />
            <div className="absolute inset-0 bg-gradient-to-tr from-slate-900/40 to-transparent" />
            <div className="hero-card hero-card--task" style={{ width: '240px', padding: '10px', background: 'rgba(255,255,255,0.97)' }}>
              <img
                src={RequestScreenshot}
                alt="Request workflow preview"
                className="h-28 w-full rounded-2xl object-cover"
              />
              <div className="hero-card-title" style={{ marginTop: '10px' }}>Request to Approval Flow</div>
              <div className="hero-card-meta">Open · 1 hour</div>
            </div>
            <div className="hero-card hero-card--metrics" style={{ width: '240px', padding: '10px', background: 'rgba(15,23,42,0.92)', color: '#fff' }}>
              <img
                src={AnalyticsScreenshot}
                alt="Analytics preview"
                className="h-28 w-full rounded-2xl object-cover"
              />
              <div className="hero-card-title" style={{ marginTop: '10px', color: '#cbd5e1' }}>Analytics Snapshot</div>
              <div className="hero-card-metric">Live charts and export-ready reports</div>
            </div>
          </div>
        </div>
      </section>

      <section className="landing-live-demo-section">
        <div className="landing-live-demo-wrap">
          <div className="landing-live-demo-preview">
            <div className="landing-live-demo-screen">
              <img
                src={WorkOrderScreenshot}
                alt="Fixnest live demo preview"
                className="landing-live-demo-screen-image"
              />
              <div className="landing-live-demo-screen-overlay" />
              <motion.div
                className="landing-live-demo-screen-card"
                animate={{ y: [0, -6, 0], scale: [1, 1.01, 1] }}
                transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
              >
                <div className="landing-live-demo-screen-label">Fixnest Product Tour</div>
                <h3>See the workflow step by step</h3>
                <p>Open a guided demo that moves from signup to requests, work orders, PMs, assets, and reporting.</p>
                <button
                  type="button"
                  className="landing-live-demo-screen-button"
                  onClick={handleOpenLiveDemo}
                >
                  View a Live Demo
                </button>
              </motion.div>
            </div>
          </div>

          <div className="landing-live-demo-copy">
            <div className="landing-kicker">Product Tour</div>
            <h2>From work orders to asset intelligence</h2>
            <p>
              Show new users how Fixnest moves from request intake to work orders, preventive maintenance, asset tracking,
              and reporting with a guided walkthrough built from your real screenshots.
            </p>
            <button
              type="button"
              className="landing-live-demo-trigger"
              onClick={handleOpenLiveDemo}
            >
              View a Live Demo
            </button>
          </div>
        </div>
      </section>

      <section className="landing-section" style={{ backgroundColor: '#fff', padding: '24px 24px 84px' }}>
        <div className="max-w-7xl mx-auto">
          {platformScreenshots.map((screen, index) => (
            <div
              key={screen.title}
              className={`grid items-center gap-14 py-16 lg:grid-cols-[1fr_1.08fr] ${index !== 0 ? 'border-t border-slate-200' : ''}`}
            >
              <div className={screen.reverse ? 'lg:order-2 max-w-[620px]' : 'max-w-[620px]'}>
                <div
                  className="inline-flex items-center text-sm font-semibold tracking-normal"
                  style={{ color: screen.accent }}
                >
                  {screen.eyebrow}
                </div>
                <h2 className="mt-4 text-4xl font-bold leading-[1.06] tracking-tight text-slate-950 md:text-[3.5rem]">
                  {screen.title}
                </h2>
                <p className="mt-6 max-w-2xl text-[1.15rem] leading-10 text-slate-600">
                  {screen.description}
                </p>
                <div className="mt-9 space-y-5">
                  {screen.bullets.map((bullet) => (
                    <div key={bullet} className="flex items-start gap-3 text-[1.02rem] text-slate-900">
                      <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" style={{ color: screen.accent }} />
                      <span>{bullet}</span>
                    </div>
                  ))}
                </div>
                <a
                  href={screen.linkHref}
                  className="mt-10 inline-flex items-center gap-3 text-[1.05rem] font-semibold"
                  style={{ color: screen.accent }}
                >
                  {screen.linkLabel}
                  <ArrowRight className="h-5 w-5" />
                </a>
              </div>

              <div className={screen.reverse ? 'lg:order-1' : ''}>
                <div className="rounded-[28px] border border-slate-200 bg-white p-3 shadow-[0_24px_64px_rgba(15,23,42,0.10)]">
                  <img
                    src={screen.image}
                    alt={screen.title}
                    className="w-full rounded-[22px] object-cover object-top"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="landing-logos">
        <div className="landing-logos-title">TRUSTED BY 40+ BUSINESSES</div>
        <div className="logos-slider-wrapper">
          <div className="logos-slider">
            <div className="logo-pill">FOHBOH STUDIO</div>
            <div className="logo-pill">OVRENTALS</div>
            <div className="logo-pill">Chevron</div>
            <div className="logo-pill">Caterpillar</div>
            <div className="logo-pill">Shell</div>
            <div className="logo-pill">Yamaha</div>
            <div className="logo-pill">Stratasys</div>
            {/* Duplicate for seamless loop */}
            <div className="logo-pill">FOHBOH STUDIO</div>
            <div className="logo-pill">OVRENTALS</div>
            <div className="logo-pill">Chevron</div>
            <div className="logo-pill">Caterpillar</div>
            <div className="logo-pill">Shell</div>
            <div className="logo-pill">Yamaha</div>
            <div className="logo-pill">Stratasys</div>
          </div>
        </div>
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
                  'Adapts to your specific operations',
                  'Scales with your growth',
                  'Mobile-first field execution',
                  'Real-time visibility and control',
                  'Integrated with your existing tools'
                ].map((item, idx) => (
                  <li key={idx} className="text-lg text-slate-700 flex items-center gap-3">
                    <span className="text-green-600 text-xl">✅</span>
                    {item}
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
          <a className="landing-section-cta" href="/request-demo">Request a Demo</a>
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
              onClick={() => handleIndustryClick(industry)}
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

      <AnimatePresence>
        {isLiveDemoOpen && (
          <div className="live-demo-modal-backdrop">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="live-demo-modal-overlay"
              onClick={handleCloseLiveDemo}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.98, y: 10 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              className="live-demo-modal"
            >
              <button
                type="button"
                className="live-demo-modal-close"
                onClick={handleCloseLiveDemo}
                aria-label="Close live demo"
              >
                <X className="h-5 w-5" />
              </button>

              <AnimatePresence mode="sync" initial={false}>
                <motion.img
                  key={activeDemo.title}
                  custom={demoDirection}
                  src={activeDemo.image}
                  alt={activeDemo.title}
                  className="live-demo-modal-image"
                  initial={(direction) => ({ opacity: 0, x: direction * 36, scale: 1.02 })}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  exit={(direction) => ({ opacity: 0, x: direction * -24, scale: 1.01 })}
                  transition={{ duration: 0.42, ease: 'easeOut' }}
                />
              </AnimatePresence>

              <div className="live-demo-modal-video-wash" />
              <div className="live-demo-modal-film" />

              {!isLiveDemoStarted ? (
                <motion.div
                  key="live-demo-intro"
                  initial={liveDemoCardMotion.intro.initial}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={liveDemoCardMotion.intro.exit}
                  transition={{ duration: 0.3, ease: 'easeOut' }}
                  className="live-demo-modal-story-card live-demo-card-pos--center"
                >
                  <div className="live-demo-modal-story-title">Fixnest Product Tour</div>
                  <p className="live-demo-modal-story-copy">
                    See how a maintenance request moves from signup through requests, work orders, preventive maintenance,
                    asset tracking, and reporting.
                  </p>
                  <button
                    type="button"
                    className="live-demo-modal-start"
                    onClick={handleStartLiveDemo}
                  >
                    Get Started
                  </button>
                </motion.div>
              ) : (
                <motion.div
                  key={activeDemo.title}
                  initial={activeDemoMotion.initial}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={activeDemoMotion.exit}
                  transition={{ duration: 0.3, ease: 'easeOut' }}
                  className={`live-demo-modal-story-card live-demo-card-pos--${activeDemo.cardPosition}`}
                >
                  <div className="live-demo-modal-step">
                    {String(activeDemoIndex + 1).padStart(2, '0')} / {String(liveDemoSteps.length).padStart(2, '0')} · {activeDemo.label}
                  </div>
                  <h3>{activeDemo.title}</h3>
                  <p>{activeDemo.description}</p>

                  <div className="live-demo-modal-points">
                    {activeDemo.points.map((point) => (
                      <div key={point} className="live-demo-modal-point">
                        <CheckCircle2 className="h-4 w-4 shrink-0" style={{ color: activeDemo.accent }} />
                        <span>{point}</span>
                      </div>
                    ))}
                  </div>

                  <div className="live-demo-modal-progress">
                    {liveDemoSteps.map((step, index) => (
                      <button
                        key={step.label}
                        type="button"
                        className={`live-demo-modal-dot ${index === activeDemoIndex ? 'is-active' : ''}`}
                        style={index === activeDemoIndex ? { backgroundColor: step.accent } : undefined}
                        onClick={() => handleDemoStepSelect(index)}
                        aria-label={`Go to ${step.label}`}
                      />
                    ))}
                  </div>

                  <div className="live-demo-modal-actions">
                    <button
                      type="button"
                      className="live-demo-modal-secondary"
                      onClick={handleDemoPrevious}
                      disabled={activeDemoIndex === 0}
                    >
                      Previous
                    </button>
                    <button
                      type="button"
                      className="live-demo-modal-primary"
                      onClick={handleDemoNext}
                      style={{ backgroundColor: activeDemo.accent }}
                    >
                      {isLastDemoStep ? 'Finish Demo' : 'Next'}
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  </div>
                </motion.div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

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
              <a className="landing-cta landing-cta--ghost" href="/request-demo">Request a Demo</a>
            </div>
          </div>
          <div className="ai-visual">
            <div className="ai-orb">AI</div>
            <div className="ai-chat" id="landing-agent">
              <div className="ai-chat-title">How can I help?</div>
              <div className="ai-thread">
                {agentConversation.slice(-4).map((entry, index) => (
                  <div
                    key={`${entry.role}-${index}-${entry.text}`}
                    className={`ai-message ${entry.role === 'user' ? 'ai-message--user' : 'ai-message--assistant'}`}
                  >
                    {entry.text}
                  </div>
                ))}
              </div>
              {agentSubmitting ? <div className="ai-loading">Thinking...</div> : null}
              <div className="ai-starters">
                {landingAgentStarters.map((starter) => (
                  <button
                    key={starter}
                    type="button"
                    className="ai-starter"
                    onClick={() => handleLandingStarterClick(starter)}
                    disabled={agentSubmitting}
                  >
                    {starter}
                  </button>
                ))}
              </div>
              <form onSubmit={handleLandingAgentSubmit} className="ai-input-form">
                <input
                  className="ai-input"
                  value={agentPrompt}
                  onChange={(event) => setAgentPrompt(event.target.value)}
                  placeholder="Ask the agent to help with maintenance work..."
                  disabled={agentSubmitting}
                />
                <div className="ai-actions">
                  <button type="submit" className="ai-chip ai-chip--send" aria-label="Send prompt" disabled={agentSubmitting} />
                </div>
              </form>
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
            <a className="landing-cta landing-cta--ghost px-10 py-4 text-lg border-white/20 text-black" href="/request-demo">Schedule a Tour</a>
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
            <a className="landing-cta landing-cta--ghost" href="/request-demo">Request a Demo</a>
          </div>
          {/* <div className="landing-badges">
            <span className="badge-pill">IDC CMMS Leader 2021</span>
            <span className="badge-pill">Gartner Peer Insights</span>
          </div> */}
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

          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {teamMembers.map((member) => (
              <motion.div
                key={member.name}
                whileHover={{ y: -8 }}
                className="overflow-hidden rounded-2xl bg-slate-50 shadow-md transition-shadow hover:shadow-xl"
              >
                {member.image ? (
                  <div className="relative h-64 overflow-hidden bg-gray-200">
                    <img
                      src={member.image}
                      alt={member.name}
                      className="h-full w-full object-cover object-top transition-transform duration-300 hover:scale-110"
                    />
                  </div>
                ) : (
                  <div className={`flex h-64 items-center justify-center bg-gradient-to-br ${member.placeholder || 'from-slate-400 to-slate-600'}`}>
                    <div className="flex h-24 w-24 items-center justify-center rounded-full bg-white text-2xl font-bold text-slate-700">
                      {member.initials || 'TM'}
                    </div>
                  </div>
                )}
                <div className="p-6 text-center">
                  <h3 className="mb-1 text-2xl font-bold text-slate-900">{member.name}</h3>
                  <p className={`mb-3 font-semibold ${member.accent}`}>{member.role}</p>
                  <p className="text-sm text-slate-600">{member.bio}</p>
                </div>
              </motion.div>
            ))}
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

      {/* Contact Widget */}
      <ContactWidget />
    </div>
  );
};

export default LandingPage;
