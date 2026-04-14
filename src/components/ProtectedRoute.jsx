import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import useTrialStatus from '../hooks/useTrialStatus';
import TrialExpiredModal from './TrialExpiredModal';

/**
 * ProtectedRoute Component
 * Wraps routes that require active trial or paid subscription
 * Shows modal if trial has expired
 * 
 * Usage:
 *   <ProtectedRoute>
 *     <Dashboard />
 *   </ProtectedRoute>
 */
const ProtectedRoute = ({ children, showTrialExpiredModal = true }) => {
  const { hasExpired, isInTrial, loading } = useTrialStatus();
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    if (!loading && hasExpired && showTrialExpiredModal) {
      setShowModal(true);
    }
  }, [hasExpired, loading, showTrialExpiredModal]);

  if (loading) {
    return (
      <div className='flex items-center justify-center h-screen bg-gray-50'>
        <div className='text-center'>
          <div className='inline-flex items-center justify-center mb-4'>
            <div className='animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600'></div>
          </div>
          <p className='text-gray-600'>Checking access...</p>
        </div>
      </div>
    );
  }

  // Allow access if in active trial
  if (isInTrial) {
    return children;
  }

  // If trial has expired, show modal
  if (hasExpired) {
    return (
      <>
        {children}
        {showModal && <TrialExpiredModal onClose={() => setShowModal(true)} />}
      </>
    );
  }

  // Otherwise allow (user has paid subscription)
  return children;
};

export default ProtectedRoute;
