import { useEffect, useState, useCallback } from 'react';
import subscriptionAPI from '../api/subscription';

let companySubscriptionCache = null;
let companySubscriptionPendingPromise = null;

export const clearCompanySubscriptionCache = () => {
  companySubscriptionCache = null;
  companySubscriptionPendingPromise = null;
};

/**
 * Hook to check user's company subscription status
 */
export const useCompanySubscription = () => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') || '' : '';
  const cacheKey = token ? token.slice(-16) : '';
  const cachedForUser = companySubscriptionCache?.cacheKey === cacheKey ? companySubscriptionCache : null;
  const [subscription, setSubscription] = useState(cachedForUser?.subscription || null);
  const [hasActive, setHasActive] = useState(cachedForUser?.hasActive || false);
  const [company, setCompany] = useState(cachedForUser?.company || null);
  const [teamMembers, setTeamMembers] = useState(cachedForUser?.teamMembers || []);
  const [isAdmin, setIsAdmin] = useState(cachedForUser?.isAdmin || false);
  const [loading, setLoading] = useState(!cachedForUser);
  const [error, setError] = useState(null);

  const checkSubscription = useCallback(async () => {
    try {
      setLoading(true);
      if (!companySubscriptionPendingPromise) {
        companySubscriptionPendingPromise = subscriptionAPI.getCompanySubscriptionStatus();
      }

      const response = await companySubscriptionPendingPromise;
      
      if (response?.data) {
        const data = response.data;
        companySubscriptionCache = {
          cacheKey,
          hasActive: data.hasActiveSubscription || false,
          subscription: data.subscription || null,
          company: data.company || null,
          teamMembers: data.teamMembers || [],
          isAdmin: data.isCompanyAdmin || false,
        };
        
        // Log subscription status for debugging
        console.log('Company subscription status:', {
          hasActive: data.hasActiveSubscription,
          subscriptionStatus: data.subscription?.status,
        });
        
        setHasActive(data.hasActiveSubscription || false);
        setSubscription(data.subscription);
        setCompany(data.company);
        setTeamMembers(data.teamMembers || []);
        setIsAdmin(data.isCompanyAdmin || false);
      }
    } catch (err) {
      console.error('Error checking subscription:', err);
      setError(err.message);
      setHasActive(false);
      clearCompanySubscriptionCache();
    } finally {
      companySubscriptionPendingPromise = null;
      setLoading(false);
    }
  }, [cacheKey]);

  useEffect(() => {
    if (!companySubscriptionCache || companySubscriptionCache.cacheKey !== cacheKey) {
      checkSubscription();
      return;
    }

    setHasActive(companySubscriptionCache.hasActive || false);
    setSubscription(companySubscriptionCache.subscription || null);
    setCompany(companySubscriptionCache.company || null);
    setTeamMembers(companySubscriptionCache.teamMembers || []);
    setIsAdmin(companySubscriptionCache.isAdmin || false);
    setLoading(false);
  }, [checkSubscription, cacheKey]);

  return {
    hasActive,
    subscription,
    company,
    teamMembers,
    isAdmin,
    loading,
    error,
    refresh: checkSubscription,
  };
};

export default useCompanySubscription;
