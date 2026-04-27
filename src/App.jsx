import React, { useState } from 'react'; // Deployment trigger commit
import { Routes, Route, useNavigate, Navigate } from 'react-router-dom';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import SsoLogin from './components/auth/SsoLogin';
import ForgotPassword from './components/auth/ForgotPassword';
import ResetPassword from './components/auth/ResetPassword';
import AcceptInvite from './components/auth/AcceptInvite';
import Activation from './components/Activation';
import ActivationPending from './components/ActivationPending';
import Dashboard from './Dashboard';
import Pricing from './components/Pricing';
import Subscribe from './components/Subscribe';
import PaymentSelection from './components/PaymentSelection';
import PaymentConfirmation from './components/PaymentConfirmation';
import SubscriptionPlan from './components/SubscriptionPlan';
import LandingPage from './components/LandingPage';
import AllIssues from './components/AllIssues';
import NewIssue from './components/NewIssue';
import WorkOrder from './components/WorkOrder';
import ManagerDashboard from './components/ManagerDashboard';
import ClientDashboard from './components/ClientDashboard';
import Analytics from './components/Analytics';
import TechnicianManagement from './components/TechnicianManagement';
import TechnicianDashboard from './components/TechnicianDashboard';
import Technicianissue from './components/ManagementIssues';
import ManagementIssues from './components/ManagementIssues';
import PropertiesPage from './components/PropertiesPage';
import PropertyPublicView from './components/PropertyPublicView';
import PropertiesCards from './components/PropertiesCards';
import PropertyDetails from './components/PropertyDetails';
import PublicRequestForm from './components/PublicRequestForm';
import PublicPurchaseOrder from './components/PublicPurchaseOrder';

import RequestsPage from './components/RequestsPage';

import Feedback from './components/Feedback';
import ManagerFeedback from './components/ManagerFeedback';
import AdminChat from './components/AdminChat';
import AIChatbot from './components/AIChatbot';
import { LanguageProvider } from './i18n/LanguageContext';

// Product Pages
import CMSSProduct from './components/products/CMSSProduct';
import IntelligenceProduct from './components/products/IntelligenceProduct';
import StudioProduct from './components/products/StudioProduct';
import SafetyProduct from './components/products/SafetyProduct';
import ProvidersProduct from './components/products/ProvidersProduct';
import EdgeSensorsProduct from './components/products/EdgeSensorsProduct';
import LatticeProduct from './components/products/LatticeProduct';
import FleetProduct from './components/products/FleetProduct';
import LearnProduct from './components/products/LearnProduct';

// Feature Pages
import WorkOrdersFeature from './components/features/WorkOrdersFeature';
import AssetManagementFeature from './components/features/AssetManagementFeature';
import SafetyComplianceFeature from './components/features/SafetyComplianceFeature';
import PreventiveMaintenanceFeature from './components/features/PreventiveMaintenanceFeature';
import PartsInventoryFeature from './components/features/PartsInventoryFeature';
import IntegrationsFeature from './components/features/IntegrationsFeature';
import AnalyticsReportingFeature from './components/features/AnalyticsReportingFeature';

// Resource Pages
import ResourcesHub from './components/resources/ResourcesHub';
import MaintenanceTrackingResource from './components/resources/MaintenanceTrackingResource';
import WorkOrderManagementResource from './components/resources/WorkOrderManagementResource';
import IntuitivePricingResource from './components/resources/IntuitivePricingResource';
import ChecklistGeneratorResource from './components/resources/ChecklistGeneratorResource';
import AskAnythingResource from './components/resources/AskAnythingResource';
import AIAssessmentsResource from './components/resources/AIAssessmentsResource';
import ProductReleasesResource from './components/resources/ProductReleasesResource';
import SupportCenterResource from './components/resources/SupportCenterResource';
import PartnershipsResource from './components/resources/PartnershipsResource';
import ReviewsResource from './components/resources/ReviewsResource';
import WebinarsEventsResource from './components/resources/WebinarsEventsResource';
import CustomerStoriesResource from './components/resources/CustomerStoriesResource';
import CustomerSuccessResource from './components/resources/CustomerSuccessResource';
import BlogResource from './components/resources/BlogResource';
import CoursesResource from './components/resources/CoursesResource';
import LearningCenterResource from './components/resources/LearningCenterResource';
import ROICalculatorResource from './components/resources/ROICalculatorResource';
import MaintenanceCalculatorResource from './components/resources/MaintenanceCalculatorResource';
import QRGeneratorResource from './components/resources/QRGeneratorResource';

// Solution Pages - Role-Based
import MaintenanceSolution from './components/solutions/MaintenanceSolution';
import OperationsSolution from './components/solutions/OperationsSolution';
import ReliabilitySolution from './components/solutions/ReliabilitySolution';

// Solution Pages - Industry-Based
import ManufacturingPlantsSolution from './components/solutions/industries/ManufacturingPlantsSolution';
import FacilityManagementSolution from './components/solutions/industries/FacilityManagementSolution';
import EnergyUtilitiesSolution from './components/solutions/industries/EnergyUtilitiesSolution';
import FoodBeverageSolution from './components/solutions/industries/FoodBeverageSolution';
import HealthcareSolution from './components/solutions/industries/HealthcareSolution';
import FleetManagementSolution from './components/solutions/industries/FleetManagementSolution';
import PropertyManagementSolution from './components/solutions/industries/PropertyManagementSolution';
import FarmingSolution from './components/solutions/industries/FarmingSolution';
import SchoolsEducationSolution from './components/solutions/industries/SchoolsEducationSolution';
import GovernmentPublicWorksSolution from './components/solutions/industries/GovernmentPublicWorksSolution';
import ChurchesNonProfitsSolution from './components/solutions/industries/ChurchesNonProfitsSolution';
import RestaurantsSolution from './components/solutions/industries/RestaurantsSolution';
import GymFitnessSolution from './components/solutions/industries/GymFitnessSolution';
import HospitalitySolution from './components/solutions/industries/HospitalitySolution';
import MarketingPageTemplate from './components/marketing/MarketingPageTemplate';
import { generatedFooterPages } from './data/footerNavigation';
import LegalDocumentPage from './components/legal/LegalDocumentPage';
import SitemapPage from './components/legal/SitemapPage';
import { legalDocuments, sitemapSections } from './data/legalPages';

import useTrialStatus from './hooks/useTrialStatus';
import useCompanySubscription from './hooks/useCompanySubscription';

const getHomeRouteForRole = (role) => {
  const normalizedRole = String(role || '').trim().toLowerCase();
  if (normalizedRole === 'superadmin' || normalizedRole === 'super-admin') return '/manager-dashboard';
  if (normalizedRole === 'admin' || normalizedRole === 'manager') return '/dashboard';
  if (normalizedRole === 'technician') return '/technician-dashboard';
  return '/dashboard';
};

import Footer from './components/Footer';
import { useLocation } from 'react-router-dom';

function ScrollToTop() {
  const location = useLocation();

  React.useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  }, [location.pathname]);

  return null;
}

function SubscriptionGuard({ auth, onLogin, children }) {
  const normalizedRole = String(auth?.user?.role || '').toLowerCase();
  const isSuperAdmin = normalizedRole === 'superadmin' || normalizedRole === 'super-admin';
  const { isInTrial, loading: trialLoading } = useTrialStatus();
  const { hasActive: hasActiveCompanySubscription, loading: subscriptionLoading } = useCompanySubscription();
  const privateRouteLoading = trialLoading || subscriptionLoading;
  const requiresSubscription = !privateRouteLoading && !isInTrial && !hasActiveCompanySubscription;

  if (!auth) return <Login onLogin={onLogin} />;
  if (isSuperAdmin) return children;

  if (privateRouteLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center">
          <div className="inline-flex items-center justify-center mb-4">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
          </div>
          <p className="text-gray-600">Checking subscription access...</p>
        </div>
      </div>
    );
  }

  if (requiresSubscription) return <Navigate to="/subscription" replace />;

  return children;
}

function App() {
  const [auth, setAuth] = useState(() => {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    return token && user ? { token, user: JSON.parse(user) } : null;
  });
  const [issues, setIssues] = useState([]); // State for issues, required by ManagementIssues
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogin = (token, user) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    setAuth({ token, user });
    navigate(getHomeRouteForRole(user?.role));
  };

  // Hide footer on dashboard and private pages
  const hideFooterRoutes = [
    '/dashboard', 
    '/manager-dashboard', 
    '/technician-dashboard', 
    '/admin-dashboard',
    '/analytics',
    '/manager-issues',
    '/technicians',
    '/feedback',
    '/manager-feedback',
    '/subscription',
    '/payment-selection',
    '/payment-confirmation'
  ];
  const shouldHideFooter = hideFooterRoutes.some(route => location.pathname.startsWith(route));
  const renderPrivateRoute = (element) => {
    return (
      <SubscriptionGuard auth={auth} onLogin={handleLogin}>
        {element}
      </SubscriptionGuard>
    );
  };

  return (
    <LanguageProvider>
      <ScrollToTop />
      <div className="glass-app glass-theme-blue">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/dashboard" element={renderPrivateRoute(<Dashboard user={auth?.user} />)} />
          <Route path="/login" element={<Login onLogin={handleLogin} />} />
          <Route path="/sso-login" element={<SsoLogin />} />
          <Route path="/register" element={<Register />} />
          <Route path="/activate/:token" element={<Activation />} />
          <Route path="/activation-pending" element={<ActivationPending />} />
          <Route path="/accept-invite" element={<AcceptInvite />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/subscribe" element={<Subscribe />} />
          <Route path="/payment-selection" element={<PaymentSelection />} />
          <Route path="/payment-confirmation" element={<PaymentConfirmation />} />
          <Route path="/subscription" element={auth ? (
            ['superadmin', 'super-admin'].includes(String(auth?.user?.role || '').toLowerCase())
              ? <Navigate to={getHomeRouteForRole(auth.user?.role)} replace />
              : <SubscriptionPlan userId={auth.user?.id} />
          ) : <Subscribe />} />
          <Route path="/dashboard" element={renderPrivateRoute(<Dashboard user={auth?.user} />)} />
          <Route path="/dashboard/:view" element={renderPrivateRoute(<Dashboard user={auth?.user} />)} />
          <Route path="/issues" element={renderPrivateRoute(<AllIssues />)} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />
          <Route path="/new-issue" element={<NewIssue />} />
          <Route path="/requests" element={renderPrivateRoute(<RequestsPage />)} />
          <Route path="/admin-dashboard" element={auth ? <Navigate to={getHomeRouteForRole(auth.user?.role)} replace /> : <Login onLogin={handleLogin} />} />
          <Route path="/manager-dashboard" element={renderPrivateRoute(
            (String(auth?.user?.role || '').toLowerCase() === 'superadmin' || String(auth?.user?.role || '').toLowerCase() === 'super-admin')
              ? <ManagerDashboard />
              : <Navigate to={getHomeRouteForRole(auth?.user?.role)} replace />
          )} />
          <Route path="/analytics" element={renderPrivateRoute(<Analytics />)} />
          <Route path="/technicians" element={renderPrivateRoute(<TechnicianManagement />)} />
          <Route path="/technician-dashboard" element={renderPrivateRoute(<TechnicianDashboard />)} />
          <Route path="/manager-issues" element={renderPrivateRoute(<ManagementIssues issues={issues} setIssues={setIssues} />)} />
          <Route path="/properties" element={<PropertiesPage />} />
          <Route path="/properties-cards" element={<PropertiesCards />} />
          <Route path="/property-details/:id" element={<PropertyDetails />} />
          <Route path="/property/:id" element={<PropertyPublicView />} />
          <Route path="/property/:id" element={<PropertyPublicView />} />
          <Route path="/public-request/:companySlug" element={<PublicRequestForm />} />
          <Route path="/public-purchase-order/:token" element={<PublicPurchaseOrder />} />
          <Route path="/feedback" element={<Feedback />} />
          <Route path="/manager-feedback" element={renderPrivateRoute(<ManagerFeedback />)} />
          <Route path="/admin-chat" element={renderPrivateRoute(auth?.user?.role === 'superadmin' ? <AdminChat /> : <Navigate to={getHomeRouteForRole(auth?.user?.role)} replace />)} />

          {/* Product Pages */}
          <Route path="/product/cmms" element={<CMSSProduct />} />
          <Route path="/product/intelligence" element={<IntelligenceProduct />} />
          <Route path="/product/studio" element={<StudioProduct />} />
          <Route path="/product/safety" element={<SafetyProduct />} />
          <Route path="/product/providers" element={<ProvidersProduct />} />
          <Route path="/product/edge-sensors" element={<EdgeSensorsProduct />} />
          <Route path="/product/lattice" element={<LatticeProduct />} />
          <Route path="/product/fleet" element={<FleetProduct />} />
          <Route path="/product/learn" element={<LearnProduct />} />

          {/* Feature Pages */}
          <Route path="/feature/work-orders" element={<WorkOrdersFeature />} />
          <Route path="/feature/asset-management" element={<AssetManagementFeature />} />
          <Route path="/feature/safety-compliance" element={<SafetyComplianceFeature />} />
          <Route path="/feature/preventive-maintenance" element={<PreventiveMaintenanceFeature />} />
          <Route path="/feature/parts-inventory" element={<PartsInventoryFeature />} />
          <Route path="/feature/integrations" element={<IntegrationsFeature />} />
          <Route path="/feature/analytics-reporting" element={<AnalyticsReportingFeature />} />

          {/* Solution Pages - Role-Based */}
          <Route path="/solution/maintenance" element={<MaintenanceSolution />} />
          <Route path="/solution/operations" element={<OperationsSolution />} />
          <Route path="/solution/reliability" element={<ReliabilitySolution />} />

          {/* Solution Pages - Industry-Based */}
          <Route path="/solution/industry/manufacturing-plants" element={<ManufacturingPlantsSolution />} />
          <Route path="/solution/industry/facility-management" element={<FacilityManagementSolution />} />
          <Route path="/solution/industry/energy-utilities" element={<EnergyUtilitiesSolution />} />
          <Route path="/solution/industry/food-beverage" element={<FoodBeverageSolution />} />
          <Route path="/solution/industry/healthcare" element={<HealthcareSolution />} />
          <Route path="/solution/industry/fleet-management" element={<FleetManagementSolution />} />
          <Route path="/solution/industry/property-management" element={<PropertyManagementSolution />} />
          <Route path="/solution/industry/farming" element={<FarmingSolution />} />
          <Route path="/solution/industry/schools-education" element={<SchoolsEducationSolution />} />
          <Route path="/solution/industry/government-public-works" element={<GovernmentPublicWorksSolution />} />
          <Route path="/solution/industry/churches-nonprofits" element={<ChurchesNonProfitsSolution />} />
          <Route path="/solution/industry/restaurants" element={<RestaurantsSolution />} />
          <Route path="/solution/industry/gym-fitness" element={<GymFitnessSolution />} />
          <Route path="/solution/industry/hospitality" element={<HospitalitySolution />} />

          {/* Resource Pages */}
          <Route path="/resources" element={<ResourcesHub />} />
          <Route path="/resource/maintenance-tracking" element={<MaintenanceTrackingResource />} />
          <Route path="/resource/work-order-management" element={<WorkOrderManagementResource />} />
          <Route path="/resource/intuitive-pricing" element={<IntuitivePricingResource />} />
          <Route path="/resource/checklist-generator" element={<ChecklistGeneratorResource />} />
          <Route path="/resource/ask-anything" element={<AskAnythingResource />} />
          <Route path="/resource/ai-assessments" element={<AIAssessmentsResource />} />
          <Route path="/resource/product-releases" element={<ProductReleasesResource />} />
          <Route path="/resource/support-center" element={<SupportCenterResource />} />
          <Route path="/resource/partnerships" element={<PartnershipsResource />} />
          <Route path="/resource/reviews" element={<ReviewsResource />} />
          <Route path="/resource/webinars-events" element={<WebinarsEventsResource />} />
          <Route path="/resource/customer-stories" element={<CustomerStoriesResource />} />
          <Route path="/resource/customer-success" element={<CustomerSuccessResource />} />
          <Route path="/resource/blog" element={<BlogResource />} />
          <Route path="/resource/courses" element={<CoursesResource />} />
          <Route path="/resource/learning-center" element={<LearningCenterResource />} />
          <Route path="/resource/roi-calculator" element={<ROICalculatorResource />} />
          <Route path="/resource/maintenance-calculator" element={<MaintenanceCalculatorResource />} />
          <Route path="/resource/qr-generator" element={<QRGeneratorResource />} />
          <Route path="/cookie-settings" element={<LegalDocumentPage document={legalDocuments.cookieSettings} />} />
          <Route path="/privacy-policy" element={<LegalDocumentPage document={legalDocuments.privacyPolicy} />} />
          <Route path="/terms-of-use" element={<LegalDocumentPage document={legalDocuments.termsOfUse} />} />
          <Route path="/sitemap" element={<SitemapPage sections={sitemapSections} />} />
          {generatedFooterPages.map((page) => (
            <Route
              key={page.path}
              path={page.path}
              element={<MarketingPageTemplate page={page} />}
            />
          ))}
        </Routes>
        {!shouldHideFooter && <Footer />}
        {/* Only show AIChatbot on authenticated/internal app routes, not on landing page or public pages */}
        {auth && (
          location.pathname.includes('/dashboard') || 
          location.pathname.includes('/technician-dashboard') || 
          location.pathname.includes('/manager-dashboard') ||
          location.pathname.includes('/issues') ||
          location.pathname.includes('/requests') ||
          location.pathname.includes('/subscription')
        ) && <AIChatbot />}
      </div>
    </LanguageProvider>
  );
}

export default App;
