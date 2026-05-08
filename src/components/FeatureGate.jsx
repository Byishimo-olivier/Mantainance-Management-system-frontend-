import React from 'react';
import { Lock } from 'lucide-react';
import { useFeatureAccess, FEATURES } from '../hooks/useFeatureAccess';

/**
 * FeatureGate Component
 * Wraps content and shows upgrade message if user doesn't have access
 * 
 * Usage:
 * <FeatureGate feature={FEATURES.ANALYTICS}>
 *   <AnalyticsComponent />
 * </FeatureGate>
 */
export const FeatureGate = ({ 
  feature, 
  children, 
  fallback = null,
  showUpgradeMessage = true 
}) => {
  const { hasFeature, loading, subscriptionInfo } = useFeatureAccess();

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-blue-600"></div>
      </div>
    );
  }

  if (!hasFeature(feature)) {
    return fallback || (showUpgradeMessage ? (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
        <Lock className="h-12 w-12 mx-auto mb-4 text-gray-400" />
        <h3 className="text-lg font-semibold text-gray-800 mb-2">
          Feature Locked
        </h3>
        <p className="text-gray-600 mb-4">
          This feature is not available in your {subscriptionInfo?.plan} plan.
        </p>
        <a
          href="/pricing"
          className="inline-block bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Upgrade Plan
        </a>
      </div>
    ) : null);
  }

  return children;
};

/**
 * FeatureAccessBadge Component
 * Shows which plan has access to a feature
 */
export const FeatureAccessBadge = ({ feature, planName = null }) => {
  const { hasFeature } = useFeatureAccess();
  const hasAccess = hasFeature(feature);

  return (
    <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${
      hasAccess 
        ? 'bg-green-100 text-green-800' 
        : 'bg-gray-100 text-gray-600'
    }`}>
      {hasAccess ? '✓ Included' : '✗ Not included'}
    </span>
  );
};

/**
 * RestrictedFeature Component
 * Shows a placeholder with lock icon for restricted features
 */
export const RestrictedFeature = ({ 
  feature, 
  title = 'Feature Locked',
  description = 'Upgrade to access this feature'
}) => {
  const { hasFeature } = useFeatureAccess();

  if (hasFeature(feature)) {
    return null; // Don't show if user has access
  }

  return (
    <div className="relative opacity-50 pointer-events-none">
      <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-50 rounded-lg z-10">
        <div className="text-center">
          <Lock className="h-8 w-8 mx-auto text-gray-400 mb-2" />
          <p className="text-sm font-medium text-gray-600">{title}</p>
        </div>
      </div>
    </div>
  );
};

export default FeatureGate;
