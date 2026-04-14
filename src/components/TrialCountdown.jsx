import React, { useEffect, useState } from 'react';
import subscriptionAPI from '../api/subscription';

/**
 * TrialCountdown Component
 * Displays the remaining days of free trial period
 * Shows warning when trial is ending soon (< 2 days)
 */
const TrialCountdown = () => {
  const [trialStatus, setTrialStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchTrialStatus();
    // Refresh trial status every 30 seconds for live countdown
    const interval = setInterval(fetchTrialStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchTrialStatus = async () => {
    try {
      const response = await subscriptionAPI.getTrialStatus();
      if (response?.data) {
        setTrialStatus(response.data);
        setError(null);
      }
    } catch (err) {
      console.error('Failed to fetch trial status:', err);
      // Don't set error for failed API calls - just continue
    } finally {
      setLoading(false);
    }
  };

  // Don't show while loading initially
  if (loading && !trialStatus) {
    return null;
  }

  // Don't show if not in trial or no data
  if (!trialStatus?.isInTrial) {
    return null;
  }

  const daysRemaining = trialStatus.daysRemaining || 0;
  const isEnding = daysRemaining <= 2;
  const isLastDay = daysRemaining === 1;
  const isExpired = daysRemaining <= 0;

  if (isExpired) {
    return null; // Modal will handle expired state
  }

  return (
    <div
      className={`fixed top-4 right-4 p-4 rounded-lg shadow-lg z-50 animate-fade-in ${
        isLastDay ? 'bg-red-50 border-2 border-red-500' : isEnding ? 'bg-yellow-50 border-2 border-yellow-500' : 'bg-blue-50 border-2 border-blue-500'
      }`}
    >
      <div className='flex items-center justify-between gap-4'>
        <div className='flex-1'>
          <h4 className={`font-semibold mb-1 ${isLastDay ? 'text-red-800' : isEnding ? 'text-yellow-800' : 'text-blue-800'}`}>
            {isLastDay ? '⏰ Final Day!' : isEnding ? '⚠️ Trial Ending Soon' : '📅 Free Trial Active'}
          </h4>
          <p className={`text-sm ${isLastDay ? 'text-red-700' : isEnding ? 'text-yellow-700' : 'text-blue-700'}`}>
            {daysRemaining} {daysRemaining === 1 ? 'day' : 'days'} remaining
          </p>
          {isEnding && (
            <p className='text-xs opacity-75 mt-1'>Upgrade now to avoid interruption</p>
          )}
        </div>
        <a
          href='/subscription'
          className={`px-3 py-2 rounded font-medium text-white text-sm whitespace-nowrap ${
            isLastDay ? 'bg-red-600 hover:bg-red-700' : isEnding ? 'bg-yellow-600 hover:bg-yellow-700' : 'bg-blue-600 hover:bg-blue-700'
          } transition-colors`}
        >
          Upgrade Now
        </a>
      </div>
    </div>
  );
};

export default TrialCountdown;
