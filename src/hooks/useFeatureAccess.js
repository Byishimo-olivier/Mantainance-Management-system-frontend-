import { useState, useEffect, useCallback } from 'react';
import subscriptionAPI from '../api/subscription';

/**
 * Hook to check if user has access to specific features
 * Accounts for both trial status and subscription plan
 */
export const useFeatureAccess = () => {
  const [accessibleFeatures, setAccessibleFeatures] = useState([]);
  const [subscriptionInfo, setSubscriptionInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAccessibleFeatures = useCallback(async () => {
    try {
      setLoading(true);
      
      // Get subscription info (plan + features)
      const infoResponse = await subscriptionAPI.getUserSubscriptionInfo?.().catch(() => null);
      if (infoResponse?.data) {
        setSubscriptionInfo(infoResponse.data);
        setAccessibleFeatures(infoResponse.data.features || []);
      }
      
      // Fallback: get features list
      const featuresResponse = await subscriptionAPI.getAccessibleFeatures?.().catch(() => null);
      if (featuresResponse?.data?.features) {
        setAccessibleFeatures(featuresResponse.data.features);
      }
      
      setError(null);
    } catch (err) {
      console.error('Error fetching accessible features:', err);
      setError(err.message || 'Failed to fetch accessible features');
      setAccessibleFeatures([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAccessibleFeatures();
  }, [fetchAccessibleFeatures]);

  /**
   * Check if user has access to a specific feature
   */
  const hasFeature = useCallback((featureName) => {
    if (!featureName) return false;
    return accessibleFeatures.includes(featureName);
  }, [accessibleFeatures]);

  /**
   * Check if user is in trial (has access to all features)
   */
  const isInTrial = useCallback(() => {
    return subscriptionInfo?.isTrialPeriod === true;
  }, [subscriptionInfo]);

  /**
   * Get user's subscription plan
   */
  const getPlan = useCallback(() => {
    return subscriptionInfo?.plan || 'none';
  }, [subscriptionInfo]);

  return {
    accessibleFeatures,
    subscriptionInfo,
    loading,
    error,
    hasFeature,
    isInTrial,
    getPlan,
    refetch: fetchAccessibleFeatures,
  };
};

/**
 * Feature name constants for easier usage
 */
export const FEATURES = {
  UNLIMITED_WORK_ORDERS: 'unlimited_work_orders',
  REQUESTS: 'requests',
  ASSET_TRACKING: 'asset_tracking',
  LOCATION_MANAGEMENT: 'location_management',
  PREVENTIVE_MAINTENANCE: 'preventive_maintenance',
  ADVANCED_AI: 'advanced_ai',
  ANALYTICS: 'analytics',
  MATERIAL_REQUESTS: 'material_requests',
  PURCHASE_ORDER: 'purchase_order',
};

export default useFeatureAccess;
