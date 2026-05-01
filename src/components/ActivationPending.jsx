import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';

export default function ActivationPending() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const email = searchParams.get('email') || '';
  const companyName = searchParams.get('companyName') || '';
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes countdown

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleBackToLogin = () => {
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-indigo-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-lg shadow-lg p-8">
          {/* Success Icon */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
              <svg className="w-8 h-8 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              Account Created!
            </h1>
            <p className="text-gray-600 text-lg">
              Welcome, <span className="font-semibold">{companyName}</span>
            </p>
          </div>

          {/* Main Message */}
          <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              Check Your Email
            </h2>
            <p className="text-gray-700 mb-4">
              We've sent an activation link to:
            </p>
            <div className="bg-white border border-blue-300 rounded p-3 mb-4">
              <p className="text-center font-mono text-blue-600 break-all">
                {email}
              </p>
            </div>
            <p className="text-gray-600 text-sm">
              Click the link in the email to activate your account.
            </p>
          </div>

          {/* Next Steps */}
          <div className="bg-gray-50 rounded-lg p-6 mb-6">
            <h3 className="font-semibold text-gray-800 mb-4">
              What to do next:
            </h3>
            <ol className="space-y-3 text-sm text-gray-700">
              <li className="flex items-start">
                <span className="inline-flex items-center justify-center w-6 h-6 bg-blue-600 text-white rounded-full text-xs font-bold mr-3 flex-shrink-0">
                  1
                </span>
                <span>Go to your email inbox (check spam folder if needed)</span>
              </li>
              <li className="flex items-start">
                <span className="inline-flex items-center justify-center w-6 h-6 bg-blue-600 text-white rounded-full text-xs font-bold mr-3 flex-shrink-0">
                  2
                </span>
                <span>Click the activation link in the email</span>
              </li>
              <li className="flex items-start">
                <span className="inline-flex items-center justify-center w-6 h-6 bg-blue-600 text-white rounded-full text-xs font-bold mr-3 flex-shrink-0">
                  3
                </span>
                <span>Your account will be activated after email verification</span>
              </li>
              <li className="flex items-start">
                <span className="inline-flex items-center justify-center w-6 h-6 bg-blue-600 text-white rounded-full text-xs font-bold mr-3 flex-shrink-0">
                  4
                </span>
                <span>Log in with your credentials to access the system</span>
              </li>
              <li className="flex items-start">
                <span className="inline-flex items-center justify-center w-6 h-6 bg-blue-600 text-white rounded-full text-xs font-bold mr-3 flex-shrink-0">
                  5
                </span>
                <span>Start managing your maintenance from the dashboard</span>
              </li>
            </ol>
          </div>

          {/* Important Info */}
          <div className="bg-amber-50 border border-amber-300 rounded-lg p-4 mb-6">
            <div className="flex items-start">
              <svg className="w-5 h-5 text-amber-600 mt-0.5 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <div>
                <p className="font-semibold text-amber-900 mb-1">
                  Activation Link Expires
                </p>
                <p className="text-amber-800 text-sm">
                  Your activation link will expire in 24 hours. Please complete the activation process promptly.
                </p>
              </div>
            </div>
          </div>

          {/* Didn't receive email */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <p className="text-sm text-gray-700 mb-3">
              Didn't receive the email?
            </p>
            <ul className="text-sm text-gray-600 space-y-2">
              <li>• Check your spam or promotions folder</li>
              <li>• Make sure you entered the correct email address <strong>{email}</strong></li>
              <li>• Contact support if you continue to have issues</li>
            </ul>
          </div>

          {/* Back to Login */}
          <button
            onClick={handleBackToLogin}
            className="w-full py-3 px-4 rounded-lg font-semibold text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 transition-colors"
          >
            Back to Login
          </button>

          {/* Footer Info */}
          <p className="text-center text-xs text-gray-500 mt-4">
            Don't have access to this email? <a href="/register" className="text-blue-600 hover:underline">Sign up with a different email</a>
          </p>
        </div>

        {/* Additional Security Info */}
        <div className="mt-6 bg-white rounded-lg shadow p-4 border border-gray-200">
          <h3 className="font-semibold text-gray-800 mb-2 flex items-center">
            <svg className="w-5 h-5 text-green-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5.293 9.293a1 1 0 011.414 0L10 12.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
            Why Two Steps?
          </h3>
          <p className="text-sm text-gray-600">
            We require email verification to ensure account security and prevent fraud. This protects your account and our system.
          </p>
        </div>
      </div>
    </div>
  );
}
