import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import {
  X, CheckCircle2, ArrowRight, Layout, Globe, Truck, GraduationCap, Building2, Factory, HeartPulse, Lightbulb,
  MessagesSquare, Database, Flame, EyeOff, TrendingUp, Home, Eye, RefreshCcw, ShieldCheck, LayoutDashboard,
  Smartphone, ClipboardList, TrendingDown, Wallet, Timer, Users, Target, Wrench, School, Building, Warehouse,
  Layers, Plug, ChevronLeft, ChevronRight,
} from 'lucide-react';
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

const heroSlides = [
  {
    kicker: 'Fixnest CMMS',
    title: 'Maintenance, organized.',
    text: 'One platform for requests, work orders, preventive maintenance and assets, so every property runs on plan instead of on emergencies.',
    image: 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?auto=format&fit=crop&w=1920&q=80',
  },
  {
    kicker: 'Preventive Maintenance',
    title: 'Fix it before it breaks.',
    text: 'Schedule recurring service, get reminders before work is due, and cut unplanned downtime across every site.',
    image: 'https://images.unsplash.com/photo-1567789884554-0b844b597180?auto=format&fit=crop&w=1920&q=80',
  },
  {
    kicker: 'Assets & Reporting',
    title: 'Every asset, one clear view.',
    text: 'Track the full history of each asset and turn work order data into reports your team can act on.',
    image: 'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?auto=format&fit=crop&w=1920&q=80',
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
    features: ['Unlimited Work order', 'Request'],
    cta: 'Try for free'
  },
  premium: {
    displayName: 'Premium',
    badge: 'Custom Quote',
    description: 'Growing maintenance teams ready to move from reactive to preventive maintenance.',
    features: ['Unlimited work Order', 'Requests', 'Asset', 'Location', 'PM', 'Analytics', 'Material Request', 'Purchase Order'],
    cta: 'Request Quotation',
    isPremium: true
  },
  professional: {
    displayName: 'Professional',
    badge: 'Most Popular',
    description: 'Departments managing multiple asset types, needing field mobility and deeper analytics.',
    features: ['Unlimited work Order', 'Requests', 'Asset', 'Location', 'PM'],
    cta: 'Schedule a Demo'
  },
  enterprise: {
    displayName: 'Enterprise',
    description: 'Multi-site organizations needing automation, integrations, and governance controls.',
    features: ['Unlimited work Order', 'Requests', 'Asset', 'Location', 'PM', 'Analytics', 'Material Request'],
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

const problemItems = [
  { icon: MessagesSquare, title: 'Scattered Communication', desc: 'Lost service requests across emails, texts, and messages' },
  { icon: Database, title: 'No Single Source', desc: 'Asset and maintenance data trapped in spreadsheets' },
  { icon: Flame, title: 'Reactive Firefighting', desc: 'Always responding to emergencies, never preventing them' },
  { icon: EyeOff, title: 'Limited Visibility', desc: 'Leadership has no real-time view of operations' },
  { icon: TrendingUp, title: 'Growing Inefficiency', desc: 'Problems multiply as you scale' },
];

const transformationItems = [
  { word: 'Predictable', desc: 'Scheduled, planned operations instead of surprises' },
  { word: 'Measurable', desc: 'Real-time metrics and clear performance indicators' },
  { word: 'Scalable', desc: 'Grow without losing control or visibility' },
  { word: 'Strategic', desc: 'Data-driven decisions that drive business value' },
];

const audienceItems = [
  { icon: HeartPulse, text: 'Hospitals' },
  { icon: School, text: 'Universities' },
  { icon: Building, text: 'Commercial Buildings' },
  { icon: Home, text: 'Residential Portfolios' },
  { icon: Warehouse, text: 'Industrial Facilities' },
];

const capabilityItems = [
  { icon: Building2, title: 'Universal Property Management', desc: 'Manage all your properties in one unified platform' },
  { icon: Eye, title: 'Complete Asset Visibility', desc: 'Know the status of every asset in real-time' },
  { icon: Layers, title: 'Scalable Operations', desc: 'Grow without losing control or efficiency' },
  { icon: ClipboardList, title: 'Centralized Work Orders', desc: 'Create, assign, and track all maintenance work' },
  { icon: RefreshCcw, title: 'Asset Lifecycle Tracking', desc: 'Monitor assets from purchase to replacement' },
  { icon: ShieldCheck, title: 'Preventive Maintenance', desc: 'Prevent failures before they happen' },
  { icon: LayoutDashboard, title: 'Real-Time Dashboards', desc: 'Clear analytics your team can act on' },
  { icon: Smartphone, title: 'Mobile-First Execution', desc: 'Technicians work efficiently from anywhere' },
];

const impactItems = [
  { icon: TrendingDown, value: 'Reduce Downtime', desc: 'Minimize operational disruptions' },
  { icon: Wallet, value: 'Lower Costs', desc: 'Proactive planning saves money' },
  { icon: Timer, value: 'Extend Lifespan', desc: 'Assets last longer with care' },
  { icon: Users, value: 'Better Coordination', desc: 'Teams work together seamlessly' },
  { icon: Target, value: 'Data-Driven', desc: 'Make better-informed decisions' },
];

const differenceItems = [
  { icon: Target, old: 'Just tracking work', new: 'Driving strategy' },
  { icon: Database, old: 'Just storing data', new: 'Generating insights' },
  { icon: Wrench, old: 'Just managing tasks', new: 'Transforming operations' },
];

const coreFeatures = [
  { title: 'Work Orders', desc: 'Manage requests and work orders in real-time. Create, assign, and track maintenance tasks from any device with complete visibility.' },
  { title: 'Asset Management', desc: 'Maximize asset uptime and reliability. Track asset lifecycle, maintenance history, and performance metrics in one centralized location.' },
  { title: 'Safety & Compliance', desc: 'Audit trails and regulatory compliance. Automated documentation and reporting to help you maintain standards and reduce risk.' },
  { title: 'Preventive Maintenance', desc: 'Reduce downtime with proactive service. Recurring schedules create preventive maintenance tasks based on usage and best practices.' },
  { title: 'Parts & Inventory', desc: 'Streamline parts tracking and purchasing. Manage stock levels, automate reorders, and reduce supply chain delays.' },
  { title: 'Analytics & Reporting', desc: 'Customizable reports and dashboards. Track KPIs, identify trends, and make data-driven maintenance decisions.' },
  { title: 'Integrations', desc: 'Unified maintenance operations. Connect with ERPs, sensors, IoT devices, and other systems for seamless data flow.' },
];

const highlightCards = [
  {
    title: 'Easily Complete Work Orders from Anywhere',
    desc: 'Create work orders in seconds with photos, checklists, and real-time updates from any device. Technicians close work on the spot, reducing admin time and improving response speed.',
  },
  {
    title: 'Stay Ahead of Breakdowns with Automated PMs',
    desc: 'Shift from reactive firefighting to proactive planning with recurring schedules based on actual usage. Assets run longer and downtime drops.',
  },
  {
    title: 'Turn Safety Events into Preventive Action',
    desc: 'Report safety events from any device - just scan a QR code, no downloads or logins needed. Every incident becomes a tracked corrective action so small issues do not become big problems.',
  },
];

const easeOut = [0.22, 1, 0.36, 1];

const LandingPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const prefersReducedMotion = useReducedMotion();


  // Scroll-reveal for sections and staggered cards; disabled when the
  // visitor prefers reduced motion.
  const reveal = prefersReducedMotion ? {} : {
    initial: { opacity: 0, y: 12 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, amount: 0.12 },
    transition: { duration: 0.4, ease: easeOut },
  };
  const stagger = prefersReducedMotion ? {} : {
    initial: 'hidden',
    whileInView: 'show',
    viewport: { once: true, amount: 0.15 },
    variants: { hidden: {}, show: { transition: { staggerChildren: 0.04 } } },
  };
  const staggerItem = prefersReducedMotion ? {} : {
    variants: {
      hidden: { opacity: 0 },
      show: { opacity: 1, transition: { duration: 0.3, ease: easeOut } },
    },
  };
  // Hero slider: advances every 7s; manual navigation restarts the timer.
  const [heroIndex, setHeroIndex] = useState(0);
  const showHeroSlide = (index) => setHeroIndex((index + heroSlides.length) % heroSlides.length);
  useEffect(() => {
    if (prefersReducedMotion) return undefined;
    const timer = setTimeout(() => setHeroIndex((current) => (current + 1) % heroSlides.length), 7000);
    return () => clearTimeout(timer);
  }, [heroIndex, prefersReducedMotion]);

  const [pricing, setPricing] = useState(null);
  const [currency, setCurrency] = useState('USD');
  const [changingCurrency, setChangingCurrency] = useState(false);
  const [activeDemoIndex, setActiveDemoIndex] = useState(0);
  const [isLiveDemoOpen, setIsLiveDemoOpen] = useState(false);
  const [isLiveDemoStarted, setIsLiveDemoStarted] = useState(false);
  const [demoDirection, setDemoDirection] = useState(1);

  const activeDemo = liveDemoSteps[activeDemoIndex];
  const activeDemoMotion = liveDemoCardMotion[activeDemo.cardPosition] || liveDemoCardMotion['right-center'];
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
    <div className="landing-page landing-glass">

      <AuthHeader transparent />

      {/* Hero: full-screen image slider with dark overlay */}
      <section className="ol-hero" aria-roledescription="carousel" aria-label="Fixnest highlights">
        {heroSlides.map((slide, index) => (
          <div
            key={slide.title}
            className={`ol-hero-slide${index === heroIndex ? ' is-active' : ''}`}
            style={{ backgroundImage: `url(${slide.image})` }}
            aria-hidden={index !== heroIndex}
          />
        ))}
        <div className="ol-hero-overlay" aria-hidden="true" />

        <div className="ol-hero-content" key={heroIndex}>
          <div className="ol-hero-kicker">{heroSlides[heroIndex].kicker}</div>
          <h1 className="ol-hero-title">{heroSlides[heroIndex].title}</h1>
          <p className="ol-hero-text">{heroSlides[heroIndex].text}</p>
          <div className="ol-hero-actions">
            <a className="ol-btn ol-btn--gold" href="/register">Start a Free Trial</a>
            <a className="ol-btn ol-btn--outline-light" href="/request-demo">Request a Demo</a>
          </div>
        </div>

        <button type="button" className="ol-hero-arrow ol-hero-arrow--prev" aria-label="Previous slide" onClick={() => showHeroSlide(heroIndex - 1)}>
          <ChevronLeft className="h-10 w-10" />
        </button>
        <button type="button" className="ol-hero-arrow ol-hero-arrow--next" aria-label="Next slide" onClick={() => showHeroSlide(heroIndex + 1)}>
          <ChevronRight className="h-10 w-10" />
        </button>

        <div className="ol-hero-dots">
          {heroSlides.map((slide, index) => (
            <button
              key={slide.title}
              type="button"
              className={`ol-hero-dot${index === heroIndex ? ' is-active' : ''}`}
              aria-label={`Show slide ${index + 1}`}
              aria-current={index === heroIndex}
              onClick={() => showHeroSlide(index)}
            />
          ))}
        </div>
      </section>

      <motion.section className="landing-live-demo-section" {...reveal}>
        <div className="landing-live-demo-wrap">
          <div className="landing-live-demo-preview">
            <div className="landing-live-demo-screen">
              <img
                src={WorkOrderScreenshot}
                alt="Fixnest live demo preview"
                className="landing-live-demo-screen-image"
              />
              <div className="landing-live-demo-screen-overlay" />
              <div className="landing-live-demo-screen-anchor">
              <motion.div
                className="landing-live-demo-screen-card"
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
          </div>

          <div className="landing-live-demo-copy">
            <div className="landing-kicker">Product Tour</div>
            <h2>From work orders to asset insight</h2>
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
      </motion.section>

      <section className="landing-section glass-panel glass-panel--roomy">
        <div className="max-w-7xl mx-auto">
          {platformScreenshots.map((screen, index) => (
            <motion.div
              key={screen.title}
              {...reveal}
              className={`grid items-center gap-14 py-16 lg:grid-cols-[1fr_1.08fr] ${index !== 0 ? 'border-t border-white/70' : ''}`}
            >
              <div className={screen.reverse ? 'lg:order-2 max-w-[620px]' : 'max-w-[620px]'}>
                <div
                  className="glass-chip"
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
                  className="mt-10 inline-flex items-center gap-3 text-[1.05rem] font-semibold glass-link"
                  style={{ color: screen.accent }}
                >
                  {screen.linkLabel}
                  <ArrowRight className="h-5 w-5" />
                </a>
              </div>

              <div className={screen.reverse ? 'lg:order-1' : ''}>
                <motion.div
                  className="glass-frame"
                  transition={{ type: 'spring', stiffness: 200, damping: 20 }}
                >
                  <img
                    src={screen.image}
                    alt={screen.title}
                    className="w-full rounded-[22px] object-cover object-top"
                  />
                </motion.div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      <motion.section className="landing-logos" {...reveal}>
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
            <div className="logo-pill" aria-hidden="true">FOHBOH STUDIO</div>
            <div className="logo-pill" aria-hidden="true">OVRENTALS</div>
            <div className="logo-pill" aria-hidden="true">Chevron</div>
            <div className="logo-pill" aria-hidden="true">Caterpillar</div>
            <div className="logo-pill" aria-hidden="true">Shell</div>
            <div className="logo-pill" aria-hidden="true">Yamaha</div>
            <div className="logo-pill" aria-hidden="true">Stratasys</div>
          </div>
        </div>
      </motion.section>

      {/* The Problem Section */}
      <motion.section className="landing-section glass-panel" {...reveal}>
        <div className="max-w-6xl mx-auto">
          <div className="glass-section-head">
            <div className="glass-pill glass-pill--danger"><span className="glass-pill-dot" />THE PROBLEM</div>
            <h2 className="text-4xl font-bold text-slate-900 mb-4">The Problem With Maintenance Today</h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              Maintenance is not lacking effort — it is lacking structure. Here's what's holding you back:
            </p>
          </div>

          <motion.div {...stagger} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            {problemItems.map(({ icon: Icon, title, desc }) => (
              <motion.div
                key={title}
                {...staggerItem}
                className="glass-card glass-card--center"
              >
                <div className="glass-icon glass-icon--danger"><Icon className="h-6 w-6" /></div>
                <h3 className="font-bold text-slate-900 mb-2 text-lg">{title}</h3>
                <p className="text-sm text-slate-600">{desc}</p>
              </motion.div>
            ))}
          </motion.div>

          <div style={{ marginTop: '40px', textAlign: 'center' }}>
            <p style={{ fontSize: '18px', color: '#475569', fontStyle: 'italic' }}>
              The result? Poor visibility. Rising costs. Reactive operations. <span style={{ fontWeight: 'bold', color: '#dc2626' }}>But it doesn't have to be this way.</span>
            </p>
          </div>
        </div>
      </motion.section>

      {/* The Opportunity Section */}
      <motion.section className="landing-section glass-panel glass-panel--dark" {...reveal}>
        <div className="max-w-6xl mx-auto relative">
          <div className="glass-section-head">
            <h2 className="text-4xl font-bold mb-4 text-white">The Transformation Happens Here</h2>
            <p className="text-xl text-slate-300 max-w-3xl mx-auto">
              When maintenance is managed through a centralized CMMS, everything changes:
            </p>
          </div>

          <motion.div {...stagger} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {transformationItems.map((item, idx) => (
              <motion.div
                key={item.word}
                {...staggerItem}
                className="glass-card glass-card--on-dark glass-card--center"
              >
                <div className="glass-number">{String(idx + 1).padStart(2, '0')}</div>
                <h3 className="font-bold text-2xl mb-2 text-white">{item.word}</h3>
                <p className="text-slate-300 text-sm">{item.desc}</p>
              </motion.div>
            ))}
          </motion.div>

          <div className="glass-banner">
            <p className="text-2xl font-bold text-white">This is where Fixnest delivers real transformation</p>
          </div>
        </div>
      </motion.section>

      {/* Fixnest Solution Section */}
      <motion.section className="landing-section glass-panel" {...reveal}>
        <div className="max-w-6xl mx-auto">
          <div className="glass-section-head">
            <div className="glass-pill"><span className="glass-pill-dot" />OUR SOLUTION</div>
            <h2 className="text-4xl font-bold text-slate-900 mb-4">The Fixnest CMMS Platform</h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              A modern, unified system designed to centralize and optimize maintenance operations across any environment
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-2xl font-bold text-slate-900 mb-6">Built For Everyone</h3>
              <motion.div {...stagger} className="space-y-4">
                {audienceItems.map(({ icon: Icon, text }) => (
                  <motion.div key={text} {...staggerItem} className="glass-row">
                    <span className="glass-icon glass-icon--sm"><Icon className="h-5 w-5" /></span>
                    <span className="font-semibold text-slate-900">{text}</span>
                  </motion.div>
                ))}
              </motion.div>
            </div>

            <div>
              <h3 className="text-2xl font-bold text-slate-900 mb-6">Why Choose Fixnest</h3>
              <motion.ul {...stagger} className="space-y-3">
                {[
                  'Adapts to your specific operations',
                  'Scales with your growth',
                  'Mobile-first field execution',
                  'Real-time visibility and control',
                  'Integrated with your existing tools'
                ].map((item) => (
                  <motion.li key={item} {...staggerItem} className="glass-row text-lg text-slate-700">
                    <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600" />
                    {item}
                  </motion.li>
                ))}
              </motion.ul>
            </div>
          </div>
        </div>
      </motion.section>

      {/* Capabilities Section */}
      <motion.section className="landing-section glass-panel" {...reveal}>
        <div className="max-w-6xl mx-auto">
          <div className="glass-section-head">
            <h2 className="text-4xl font-bold text-slate-900 mb-4">What Fixnest CMMS Enables</h2>
            <p className="text-xl text-slate-600">Everything you need for complete maintenance excellence</p>
          </div>

          <motion.div {...stagger} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {capabilityItems.map(({ icon: Icon, title, desc }) => (
              <motion.div
                key={title}
                {...staggerItem}
                className="glass-card"
              >
                <div className="glass-icon"><Icon className="h-6 w-6" /></div>
                <h3 className="font-bold text-slate-900 mb-2 text-lg">{title}</h3>
                <p className="text-slate-600 text-sm">{desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </motion.section>

      {/* Business Impact Section */}
      <motion.section className="landing-section glass-panel glass-panel--dark glass-panel--teal" {...reveal}>
        <div className="max-w-6xl mx-auto relative">
          <div className="glass-section-head">
            <h2 className="text-4xl font-bold mb-4 text-white">Real Business Impact</h2>
            <p className="text-xl text-slate-300 max-w-3xl mx-auto">
              With Fixnest CMMS, organizations achieve measurable results
            </p>
          </div>

          <motion.div {...stagger} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            {impactItems.map(({ icon: Icon, value, desc }) => (
              <motion.div
                key={value}
                {...staggerItem}
                className="glass-card glass-card--on-dark glass-card--center"
              >
                <div className="glass-icon glass-icon--on-dark"><Icon className="h-6 w-6" /></div>
                <h3 className="font-bold text-lg mb-2 text-white">{value}</h3>
                <p className="text-slate-300 text-sm">{desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </motion.section>

      {/* Why Fixnest is Different */}
      <motion.section className="landing-section glass-panel" {...reveal}>
        <div className="max-w-4xl mx-auto">
          <div className="glass-section-head">
            <h2 className="text-4xl font-bold text-slate-900 mb-4">Beyond Traditional CMMS</h2>
            <p className="text-xl text-slate-600">
              Fixnest is not just another CMMS. Here's what makes it different:
            </p>
          </div>

          <motion.div {...stagger} className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {differenceItems.map(({ icon: Icon, old, new: next }) => (
              <motion.div key={next} {...staggerItem} className="glass-card">
                <div className="glass-icon"><Icon className="h-6 w-6" /></div>
                <div className="space-y-4">
                  <div className="text-slate-400 line-through text-lg">{old}</div>
                  <div className="flex items-center gap-2">
                    <ArrowRight className="w-5 h-5 text-emerald-600" />
                    <span className="text-emerald-700 font-bold text-lg">{next}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>

          <div className="glass-callout">
            <h3 className="text-2xl font-bold text-slate-900 mb-2">Fixnest becomes the operating system for maintenance excellence.</h3>
            <p className="text-slate-700 text-lg">One platform. Total visibility. Better maintenance at any scale.</p>
          </div>
        </div>
      </motion.section>

      <motion.section className="landing-section landing-products" {...reveal}>
        <div className="landing-section-header">
          <div className="landing-section-title">Our Products</div>
          <a className="landing-section-cta glass-button" href="/request-demo">Request a Demo</a>
        </div>
        <motion.div {...stagger} className="product-grid">
          {products.map((product) => (
            <motion.article
              key={product.name}
              {...staggerItem}
              className="product-card glass-card group cursor-pointer"
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
                <span className="text-[var(--brand-amber)]">{product.icon}</span>
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
        </motion.div>
      </motion.section>

      <motion.section className="landing-section landing-industries" {...reveal}>
        <div className="landing-section-header">
          <div className="landing-section-title">Industries We Serve</div>
          <p className="text-slate-600 max-w-lg">Scalable solutions tailored for specialized operations across various sectors.</p>
        </div>
        <motion.div {...stagger} className="industry-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {industries.map((industry) => (
            <motion.div
              key={industry.name}
              {...staggerItem}
              className="industry-card relative rounded-2xl overflow-hidden h-72 cursor-pointer group"
              onClick={() => handleIndustryClick(industry)}
            >
              <img
                src={industry.image}
                alt={industry.name}
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
              />
              <div className="industry-glass-caption">
                <div className="flex items-center gap-2 text-amber-300 mb-2">
                  {industry.icon}
                </div>
                <h3 className="text-white font-bold text-xl mb-2">{industry.name}</h3>
                <p className="text-slate-200 text-sm line-clamp-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  {industry.description}
                </p>
                <div className="mt-3 flex items-center gap-2 text-white text-xs font-bold uppercase tracking-wider">
                  View Expansion <ArrowRight className="w-3 h-3" />
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </motion.section>

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
              className="relative w-full max-w-4xl glass-modal rounded-3xl overflow-hidden flex flex-col md:flex-row"
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
                <div className="text-[var(--brand-amber)] font-bold tracking-widest text-xs uppercase mb-2">
                  {selectedItem.label || 'Industry Solution'}
                </div>
                <h2 className="text-3xl font-bold text-slate-900 mb-4">{selectedItem.name}</h2>
                <p className="text-lg text-slate-600 font-medium mb-6 leading-relaxed">
                  {selectedItem.description}
                </p>
                <div className="glass-inset p-6 rounded-2xl mb-8">
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
                    className="landing-cta px-6 py-3 font-bold"
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
        <motion.section className="landing-section landing-pricing glass-panel" {...reveal}>
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
                  border: currency === 'USD' ? '2px solid #0066cc' : '1px solid rgba(255,255,255,0.8)',
                  backgroundColor: currency === 'USD' ? 'rgba(240,248,255,0.85)' : 'rgba(255,255,255,0.55)',
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
                  border: currency === 'RWF' ? '2px solid #0066cc' : '1px solid rgba(255,255,255,0.8)',
                  backgroundColor: currency === 'RWF' ? 'rgba(240,248,255,0.85)' : 'rgba(255,255,255,0.55)',
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
                  backgroundColor: 'rgba(250,245,255,0.7)',
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
        </motion.section>
      )}

      <motion.section className="landing-section landing-features glass-panel" {...reveal}>
        <div className="landing-section-header">
          <div>
            <div className="landing-section-title">Core Features</div>
            <p style={{ marginTop: '8px', fontSize: '16px', color: '#475569' }}>Everything you need for complete maintenance management</p>
          </div>
        </div>
        <motion.div {...stagger} className="features-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(300px, 100%), 1fr))', gap: '24px', marginTop: '16px' }}>
          {coreFeatures.map((feature) => (
            <motion.div
              key={feature.title}
              {...staggerItem}
              className="feature-card glass-card"
            >
              <h3 style={{ marginBottom: '12px', fontSize: '18px', fontWeight: '600' }}>{feature.title}</h3>
              <p style={{ color: '#475569', lineHeight: '1.6' }}>{feature.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </motion.section>

      <motion.section className="landing-section landing-integrations" {...reveal}>
        <div className="integration-card glass-panel">
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
            <div className="integration-node">ERP</div>
            <div className="integration-core"><Plug className="h-4 w-4" /> Fixnest Platform</div>
          </div>
        </div>
      </motion.section>

      <motion.section className="landing-section landing-highlights" {...reveal}>
        <motion.div {...stagger} className="highlight-cards">
          {highlightCards.map((card) => (
            <motion.div
              key={card.title}
              {...staggerItem}
              className="glass-card"
            >
              <h3 className="text-xl font-bold text-slate-900 mb-3">{card.title}</h3>
              <p className="text-slate-600 leading-relaxed">{card.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </motion.section>

      <motion.section className="landing-section landing-cta-hero relative overflow-hidden rounded-[40px] min-h-[500px] mb-24" {...reveal}>
        <img
          src="https://images.unsplash.com/photo-1552664730-d307ca884978?w=1200&q=80"
          alt="Team Collaboration"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-900/80 via-slate-900/40 to-transparent" />
        <div className="relative z-10 flex min-h-[500px] items-center px-6 py-10 md:px-16">
          <div className="glass-cta-card">
            <div className="landing-kicker mb-4" style={{ color: '#fdba74' }}>DRIVE EFFICIENCY TODAY</div>
            <h2 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
              Stop reacting. <br />
              Start planning.
            </h2>
            <p className="text-xl text-slate-200 mb-8 max-w-xl">
              Join 4,000+ businesses that have transformed their maintenance operations from reactive firefighting to proactive asset management.
            </p>
            <div className="landing-cta-row">
              <a className="landing-cta px-10 py-4 text-lg" href="/register">Start Your Free Trial</a>
              <a className="landing-cta landing-cta--ghost-dark px-10 py-4 text-lg" href="/request-demo">Schedule a Tour</a>
            </div>
          </div>
        </div>
      </motion.section>

      <motion.section className="landing-section landing-proof glass-panel" {...reveal}>
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
        </div>
      </motion.section>

      {/* Team Section */}
      <motion.section className="landing-section glass-panel" data-section="team" {...reveal}>
        <div className="max-w-5xl mx-auto">
          <div className="glass-section-head">
            <div className="glass-pill"><span className="glass-pill-dot" />OUR TEAM</div>
            <h2 className="text-4xl font-bold text-slate-900 mb-4">The Minds Behind Fixnest</h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              A dedicated team of innovators and professionals committed to transforming maintenance management.
            </p>
          </div>

          <motion.div {...stagger} className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {teamMembers.map((member) => (
              <motion.div
                key={member.name}
                {...staggerItem}
                className="glass-card glass-card--flush"
              >
                {member.image ? (
                  <div className="relative h-64 overflow-hidden bg-white/40">
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
          </motion.div>

          <div className="glass-callout mt-16">
            <h3 className="text-2xl font-bold text-slate-900 mb-2">Join Our Growing Team</h3>
            <p className="text-slate-600 mb-6">We're always looking for talented individuals passionate about revolutionizing maintenance management.</p>
            <a href="/careers" className="landing-cta inline-block">
              View Open Positions
            </a>
          </div>
        </div>
      </motion.section>

      {/* Contact Widget */}
      <ContactWidget />
    </div>
  );
};

export default LandingPage;
