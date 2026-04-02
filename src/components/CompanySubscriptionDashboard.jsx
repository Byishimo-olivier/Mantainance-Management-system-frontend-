import React, { useState, useEffect } from 'react';
import useCompanySubscription from '../hooks/useCompanySubscription';
import subscriptionAPI from '../api/subscription';
import { Calendar, Users, Package, CheckCircle, AlertCircle, Clock, DollarSign, TrendingUp } from 'lucide-react';

export default function CompanySubscriptionDashboard() {
  const { hasActive, subscription, company, teamMembers, isAdmin, loading, error } = useCompanySubscription();
  const [stats, setStats] = useState(null);

  useEffect(() => {
    if (company && subscription) {
      // Calculate stats
      setStats({
        daysRemaining: subscription.endDate ? Math.max(0, Math.ceil((new Date(subscription.endDate) - new Date()) / (1000 * 60 * 60 * 24))) : 'Unlimited',
        membersUsed: teamMembers.length,
        memberLimit: company.maxUsers || teamMembers.length + 5,
        planName: subscription.plan?.charAt(0).toUpperCase() + subscription.plan?.slice(1) || 'Basic'
      });
    }
  }, [subscription, company, teamMembers]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="spinner mb-4"></div>
          <p className="text-gray-600">Loading subscription information...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <div className="flex items-center gap-2 text-red-700 font-semibold mb-2">
          <AlertCircle size={20} />
          Error Loading Subscription
        </div>
        <p className="text-red-600 text-sm">{error}</p>
      </div>
    );
  }

  if (!hasActive || !subscription || !company) {
    return (
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <div className="flex items-center gap-2 text-blue-700 font-semibold mb-2">
          <AlertCircle size={20} />
          No Active Subscription
        </div>
        <p className="text-blue-600 text-sm mb-4">Your company currently doesn't have an active subscription. Visit the pricing page to get started.</p>
        <a href="/pricing" className="inline-block bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700">
          View Plans
        </a>
      </div>
    );
  }

  const utilizationPercentage = stats ? Math.round((stats.membersUsed / stats.memberLimit) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg p-8">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold mb-2">{company.name}</h1>
            <p className="text-blue-100">Company Subscription Dashboard</p>
          </div>
          {hasActive && (
            <div className="bg-green-500/20 border border-green-400 text-green-100 px-4 py-2 rounded-lg flex items-center gap-2">
              <CheckCircle size={18} />
              Active
            </div>
          )}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Plan */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-600 font-medium">Current Plan</span>
            <Package size={20} className="text-blue-600" />
          </div>
          <p className="text-2xl font-bold text-gray-900 capitalize">{stats?.planName}</p>
          <p className="text-xs text-gray-500 mt-2">
            Billing: <span className="capitalize">{subscription.billingCycle}</span>
          </p>
        </div>

        {/* Days Remaining */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-600 font-medium">Days Remaining</span>
            <Clock size={20} className="text-orange-600" />
          </div>
          <p className="text-2xl font-bold text-gray-900">{stats?.daysRemaining}</p>
          <p className="text-xs text-gray-500 mt-2">
            {subscription.endDate && `Until ${new Date(subscription.endDate).toLocaleDateString()}`}
          </p>
        </div>

        {/* Team Members */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-600 font-medium">Team Members</span>
            <Users size={20} className="text-purple-600" />
          </div>
          <p className="text-2xl font-bold text-gray-900">{stats?.membersUsed}/{stats?.memberLimit}</p>
          <div className="w-full bg-gray-200 rounded-full h-1.5 mt-3">
            <div
              className="bg-gradient-to-r from-purple-600 to-purple-400 h-1.5 rounded-full transition-all"
              style={{ width: `${utilizationPercentage}%` }}
            />
          </div>
        </div>

        {/* Amount */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-600 font-medium">Amount</span>
            <DollarSign size={20} className="text-green-600" />
          </div>
          <p className="text-2xl font-bold text-gray-900">${subscription.amount || '—'}</p>
          <p className="text-xs text-gray-500 mt-2">{subscription.currency || 'USD'}</p>
        </div>
      </div>

      {/* Subscription Details */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Subscription Details</h2>
        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="text-sm text-gray-600 font-medium block mb-1">Status</label>
            <div className="flex items-center gap-2">
              <CheckCircle size={18} className={subscription.status === 'active' ? 'text-green-600' : 'text-gray-400'} />
              <span className="capitalize font-semibold text-gray-900">{subscription.status}</span>
            </div>
          </div>
          <div>
            <label className="text-sm text-gray-600 font-medium block mb-1">Payment Status</label>
            <span className="capitalize font-semibold text-gray-900">{subscription.paymentStatus}</span>
          </div>
          <div>
            <label className="text-sm text-gray-600 font-medium block mb-1">Start Date</label>
            <p className="text-gray-900">{subscription.startDate ? new Date(subscription.startDate).toLocaleDateString() : '—'}</p>
          </div>
          <div>
            <label className="text-sm text-gray-600 font-medium block mb-1">End Date</label>
            <p className="text-gray-900">{subscription.endDate ? new Date(subscription.endDate).toLocaleDateString() : 'No end date'}</p>
          </div>
        </div>
      </div>

      {/* Team Members */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
        <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Users size={20} className="text-blue-600" />
          Team Members ({teamMembers.length})
        </h2>
        
        {teamMembers.length === 0 ? (
          <p className="text-gray-500 py-8 text-center">No team members yet</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Name</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Email</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Role</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Status</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Company Admin</th>
                </tr>
              </thead>
              <tbody>
                {teamMembers.map((member, idx) => (
                  <tr key={member.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4 font-medium text-gray-900">{member.name}</td>
                    <td className="py-3 px-4 text-gray-600">{member.email}</td>
                    <td className="py-3 px-4">
                      <span className="capitalize inline-block bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-xs font-medium">
                        {member.role}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="inline-block bg-green-50 text-green-700 px-3 py-1 rounded-full text-xs font-medium">
                        Active
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      {member.isCompanyAdmin ? (
                        <CheckCircle size={18} className="text-blue-600" />
                      ) : (
                        <div size={18} className="text-gray-300">—</div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Admin Actions */}
      {isAdmin && (
        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Admin Actions</h2>
          <div className="flex gap-3">
            <button className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors">
              Manage Team
            </button>
            <button className="bg-gray-100 text-gray-900 px-4 py-2 rounded-lg font-medium hover:bg-gray-200 transition-colors">
              Change Plan
            </button>
            <button className="bg-gray-100 text-gray-900 px-4 py-2 rounded-lg font-medium hover:bg-gray-200 transition-colors">
              Payment History
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
