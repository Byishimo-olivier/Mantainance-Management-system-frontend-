import React, { useEffect, useState } from 'react';
import subscriptionAPI from '../api/subscription';

/**
 * TrialBanner Component
 * Designed to match the user's reference image:
 * - Rounded blue background
 * - White text
 * - "Upgrade" button (White background, blue text)
 */
const TrialBanner = () => {
    const [trialStatus, setTrialStatus] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchTrialStatus();
        const interval = setInterval(fetchTrialStatus, 60000);
        return () => clearInterval(interval);
    }, []);

    const fetchTrialStatus = async () => {
        try {
            const response = await subscriptionAPI.getTrialStatus();
            if (response?.data) {
                setTrialStatus(response.data);
            }
        } catch (err) {
            console.error('Failed to fetch trial status:', err);
        } finally {
            setLoading(false);
        }
    };

    if (loading || !trialStatus?.isInTrial) {
        return null;
    }

    const daysRemaining = trialStatus.daysRemaining || 0;
    const planName = trialStatus.planName || 'Enterprise';

    return (
        <div 
            className="mb-8 p-6 rounded-[28px] bg-[#3C5BDC] text-white shadow-xl flex flex-col items-start gap-1 max-w-[340px] border border-white/10"
            style={{ fontFamily: 'Inter, system-ui, sans-serif' }}
        >
            <h3 className="text-[22px] font-bold tracking-tight">Your trial ends in {daysRemaining} days</h3>
            <p className="text-[17px] opacity-90 mb-4 font-medium">You're on {planName}.</p>
            <a 
                href="/subscription"
                className="w-full bg-white text-[#3C5BDC] py-3.5 rounded-[18px] text-[17px] font-bold text-center shadow-lg hover:bg-white/95 transition-all active:scale-[0.98]"
            >
                Upgrade
            </a>
        </div>
    );
};

export default TrialBanner;
