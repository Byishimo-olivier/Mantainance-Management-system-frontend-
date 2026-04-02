import { useEffect, useState } from 'react';
import subscriptionAPI from '../api/subscription';

/**
 * Hook to check user's company subscription status
 */
export const useCompanySubscription = () => {
  const [subscription, setSubscription] = useState(null);
  const [hasActive, setHasActive] = useState(false);
  const [company, setCompany] = useState(null);
  const [teamMembers, setTeamMembers] = useState([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const checkSubscription = async () => {
      try {
        setLoading(true);
        const response = await subscriptionAPI.getCompanySubscriptionStatus();
        
        if (response?.data) {
          const data = response.data;
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
      } finally {
        setLoading(false);
      }
    };

    checkSubscription();
  }, []);

  return {
    hasActive,
    subscription,
    company,
    teamMembers,
    isAdmin,
    loading,
    error
  };
};

export default useCompanySubscription;
