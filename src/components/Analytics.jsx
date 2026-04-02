import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";

export default function Analytics() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('90days');
  const [spendTrendData, setSpendTrendData] = useState([]);
  const [costTypeFilter, setCostTypeFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [metrics, setMetrics] = useState({
    totalIssues: 0,
    completedIssues: 0,
    completionRate: 0,
    avgResponseHrs: 0,
    avgCycleHrs: 0,
    backlog: 0,
    topTechnician: null,
    topLocations: [],
    upcomingPreventive: [],
    totalAssetCost: 0,
    avgAssetCost: 0,
    materialReqCount: 0,
    assetWithMostDowntime: null,
    utilizationByLocation: [],
    utilizationByCategory: [],
    laborCost: 0,
    partsCost: 0,
    otherCost: 0,
    totalCost: 0,
    reactiveCost: 0,
    preventiveCost: 0,
    costByAsset: [],
    costByCategory: [],
    costByLocation: [],
  });

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login', { replace: true });
    window.location.reload();
  };

  useEffect(() => {
    let mounted = true;
    async function fetchAll() {
      try {
        setLoading(true);
        const [issuesRes, assetsRes, techRes, propsRes, schedulesRes, materialReqRes] = await Promise.all([
          api.get('/api/issues'),
          api.get('/api/assets'),
          api.get('/api/technicians'),
          api.get('/api/properties'),
          api.get('/api/maintenance-schedules'),
          api.get('/api/material-requests'),
        ]);

        const issues = (issuesRes && issuesRes.data) || [];
        const assets = (assetsRes && assetsRes.data) || [];
        const techs = (techRes && techRes.data) || [];
        const schedules = (schedulesRes && schedulesRes.data) || [];
        const materialReqs = (materialReqRes && materialReqRes.data) || [];

        // Derived metrics
        const totalIssues = issues.length;
        const completedIssues = issues.filter(i => i.status && String(i.status).toLowerCase().includes('complete')).length;
        const completionRate = totalIssues ? (completedIssues / totalIssues) * 100 : 0;

        // Top technicians by completed issues
        const techCounts = {};
        issues.filter(i => i.status && String(i.status).toLowerCase().includes('complete')).forEach(i => {
          const techId = i.assignedTo || (Array.isArray(i.assignees) && i.assignees.length ? i.assignees[0].id : null);
          if (!techId) return;
          techCounts[techId] = (techCounts[techId] || 0) + 1;
        });
        const topTechId = Object.keys(techCounts).sort((a,b) => techCounts[b]-techCounts[a])[0] || null;
        const topTechnician = topTechId ? (techs.find(t => t.id === topTechId || t._id === topTechId) || { id: topTechId, completed: techCounts[topTechId] }) : null;

        // Top locations
        const locCounts = {};
        issues.forEach(i => {
          const loc = i.location || i.address || i.propertyId || 'Unknown';
          locCounts[loc] = (locCounts[loc] || 0) + 1;
        });
        const topLocations = Object.entries(locCounts).sort((a,b)=>b[1]-a[1]).slice(0,5).map(([loc,count])=>({ location: loc, count }));

        // Response time (hrs) - approximate as avg time to first update for non-pending issues
        const responseTimes = issues.filter(i => i.status && !String(i.status).toLowerCase().includes('pending') && i.createdAt && i.updatedAt)
          .map(i => (new Date(i.updatedAt) - new Date(i.createdAt)) / 3600000);
        const avgResponseHrs = responseTimes.length ? (responseTimes.reduce((a,b)=>a+b,0)/responseTimes.length) : 0;

        // Cycle time (hrs) - completed issues createdAt -> updatedAt
        const cycleTimes = issues.filter(i => i.status && String(i.status).toLowerCase().includes('complete') && i.createdAt && i.updatedAt)
          .map(i => (new Date(i.updatedAt) - new Date(i.createdAt)) / 3600000);
        const avgCycleHrs = cycleTimes.length ? (cycleTimes.reduce((a,b)=>a+b,0)/cycleTimes.length) : 0;

        // Backlog (pending)
        const backlog = issues.filter(i => !i.status || String(i.status).toLowerCase().includes('pending')).length;

        // Upcoming preventive maintenance (from schedules)
        const upcomingPreventive = (schedules || []).filter(s => s && s.nextDate && new Date(s.nextDate) > new Date()).slice(0,10);

        // Cost overview: approximate using asset purchaseCost and materialRequests (fallbacks)
        const assetCosts = assets.map(a => Number(a.purchaseCost || 0)).filter(c => !isNaN(c));
        const totalAssetCost = assetCosts.reduce((a,b)=>a+b,0);
        const avgAssetCost = assetCosts.length ? totalAssetCost/assetCosts.length : 0;
        const materialReqCount = materialReqs.length;

        // Asset downtime approx: sum of fixTime (if numeric minutes) per asset
        const assetDowntimeMap = {};
        issues.forEach(i => {
          if (!i.assetId) return;
          const ft = Number(i.fixTime || i.time || 0);
          const hours = ft ? (ft / 60) : 0;
          assetDowntimeMap[i.assetId] = (assetDowntimeMap[i.assetId] || 0) + hours;
        });
        const assetDowntimes = Object.entries(assetDowntimeMap).map(([assetId, hrs])=>({ assetId, hrs })).sort((a,b)=>b.hrs-a.hrs);
        const assetWithMostDowntime = assetDowntimes[0] || null;

        // Utilization by location and category (approx): percent of assets without open issues
        const openAssetIds = new Set(issues.filter(i => !i.status || !String(i.status).toLowerCase().includes('complete')).map(i=>i.assetId).filter(Boolean));
        const assetsByLocation = {};
        const assetsByCategory = {};
        assets.forEach(a => {
          const loc = (a.location && (a.location.building || a.location.room || a.location.floor)) || a.propertyId || 'Unknown';
          assetsByLocation[loc] = assetsByLocation[loc] || { total:0, free:0 };
          assetsByLocation[loc].total += 1;
          if (!openAssetIds.has(a.id) && !openAssetIds.has(a._id)) assetsByLocation[loc].free += 1;

          const cat = a.type || 'Unknown';
          assetsByCategory[cat] = assetsByCategory[cat] || { total:0, free:0 };
          assetsByCategory[cat].total += 1;
          if (!openAssetIds.has(a.id) && !openAssetIds.has(a._id)) assetsByCategory[cat].free += 1;
        });

        const utilizationByLocation = Object.entries(assetsByLocation).map(([loc,vals])=>({ location: loc, utilization: vals.total ? Math.round((vals.free/vals.total)*100) : 0 }));
        const utilizationByCategory = Object.entries(assetsByCategory).map(([cat,vals])=>({ category: cat, utilization: vals.total ? Math.round((vals.free/vals.total)*100) : 0 }));

        // Calculate cost breakdowns
        const laborCost = assets.reduce((sum, a) => sum + Number(a.laborCost || 0), 0);
        const partsCost = assets.reduce((sum, a) => sum + Number(a.partsCost || a.purchaseCost || 0), 0);
        const otherCost = assets.reduce((sum, a) => sum + Number(a.otherCost || 0), 0);
        const totalCost = laborCost + partsCost + otherCost;

        // Cost by type (reactive vs preventive)
        const reactiveCost = issues.filter(i => i.category && String(i.category).toLowerCase().includes('reactive')).reduce((sum, i) => sum + Number(i.cost || 0), 0);
        const preventiveCost = issues.filter(i => i.category && String(i.category).toLowerCase().includes('preventive')).reduce((sum, i) => sum + Number(i.cost || 0), 0);

        // Cost by asset (top 5)
        const costByAsset = assets.map(a => ({ asset: a.name || a.id, cost: Number(a.purchaseCost || 0) + Number(a.laborCost || 0) + Number(a.partsCost || 0) }))
          .sort((a, b) => b.cost - a.cost).slice(0, 5);

        // Cost by category (top 5)
        const costByCategory = issues.reduce((acc, i) => {
          const cat = i.category || 'Other';
          const itemCost = Number(i.cost || 0);
          const existing = acc.find(x => x.category === cat);
          if (existing) existing.cost += itemCost;
          else acc.push({ category: cat, cost: itemCost });
          return acc;
        }, []).sort((a, b) => b.cost - a.cost).slice(0, 5);

        // Cost by location (top 5)
        const costByLocation = assets.reduce((acc, a) => {
          const loc = (a.location && (a.location.building || a.location.room || a.location.floor)) || a.propertyId || 'Unknown';
          const itemCost = Number(a.purchaseCost || 0);
          const existing = acc.find(x => x.location === loc);
          if (existing) existing.cost += itemCost;
          else acc.push({ location: loc, cost: itemCost });
          return acc;
        }, []).sort((a, b) => b.cost - a.cost).slice(0, 5);

        // Generate spend trend data (weekly grouping for last 90 days)
        const getDaysAgo = (days) => {
          const d = new Date();
          d.setDate(d.getDate() - days);
          return d;
        };
        const startDate = getDaysAgo(90);
        const trendMap = {};
        
        issues.forEach(i => {
          if (!i.createdAt || !i.cost) return;
          const issueDate = new Date(i.createdAt);
          if (issueDate < startDate) return;
          
          const weekStart = new Date(issueDate);
          weekStart.setDate(weekStart.getDate() - weekStart.getDay());
          const weekKey = weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
          
          trendMap[weekKey] = (trendMap[weekKey] || 0) + Number(i.cost || 0);
        });

        // Convert trend map to array and sort by date
        const trendData = Object.entries(trendMap).map(([date, cost]) => ({ date, cost }));
        
        if (!mounted) return;
        setSpendTrendData(trendData);
        setMetrics({
          totalIssues,
          completedIssues,
          completionRate: Math.round(completionRate),
          topTechnician,
          topLocations,
          avgResponseHrs: Number(avgResponseHrs.toFixed(2)),
          avgCycleHrs: Number(avgCycleHrs.toFixed(2)),
          backlog,
          upcomingPreventive,
          totalAssetCost,
          avgAssetCost: Number(avgAssetCost.toFixed(2)),
          materialReqCount,
          assetWithMostDowntime,
          utilizationByLocation,
          utilizationByCategory,
          laborCost,
          partsCost,
          otherCost,
          totalCost,
          reactiveCost,
          preventiveCost,
          costByAsset,
          costByCategory,
          costByLocation,
        });
      } catch (e) {
        console.error('[Analytics] failed to fetch metrics', e);
      } finally {
        if (mounted) setLoading(false);
      }
    }
    fetchAll();
    return () => { mounted = false; };
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 pb-8">
      {/* Navbar */}
      <nav className="flex items-center justify-between bg-white shadow px-4 md:px-8 h-16">
        <div className="flex items-center gap-3">
          <span className="bg-indigo-600 rounded-xl p-1 flex items-center justify-center">
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none"><rect x="2" y="2" width="20" height="20" rx="6" fill="#6366f1"/><rect x="6" y="6" width="12" height="6" rx="2" fill="#a5b4fc"/></svg>
          </span>
          <div className="flex flex-col ml-1">
            <span className="text-lg font-bold text-gray-900">PropCare</span>
            <span className="text-sm text-gray-500">Alice Kayitesi</span>
          </div>
        </div>
        <div className="flex gap-2 md:gap-3">
          <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-100 text-indigo-700 font-semibold" onClick={() => navigate('/manager-dashboard')}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><rect x="3" y="3" width="18" height="18" rx="4" fill="#ede9fe"/><rect x="7" y="7" width="4" height="4" rx="1" fill="#8b5cf6"/><rect x="13" y="7" width="4" height="4" rx="1" fill="#8b5cf6"/><rect x="7" y="13" width="4" height="4" rx="1" fill="#8b5cf6"/><rect x="13" y="13" width="4" height="4" rx="1" fill="#8b5cf6"/></svg> Dashboard
          </button>
          <button className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-gray-100 font-semibold" onClick={() => navigate('/manager-issues')}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><rect x="3" y="3" width="18" height="18" rx="4" fill="#f3f4f6"/><rect x="7" y="7" width="10" height="10" rx="2" fill="#6366f1"/></svg> All Issues
          </button>
          <button className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-gray-100 font-semibold" onClick={() => navigate('/analytics')}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><rect x="3" y="3" width="18" height="18" rx="4" fill="#f3f4f6"/><rect x="7" y="7" width="10" height="10" rx="2" fill="#6366f1"/></svg> Analytics
          </button>
          <button className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-gray-100 font-semibold" onClick={() => navigate('/technicians')}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><rect x="3" y="3" width="18" height="18" rx="4" fill="#f3f4f6"/><rect x="7" y="7" width="10" height="10" rx="2" fill="#6366f1"/></svg> Technicians
          </button>
        </div>
        <div className="flex items-center gap-2">
          <button className="bg-gray-100 rounded-lg px-2 py-1 flex items-center justify-center">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" fill="#f3f4f6"/><path d="M8 12h8" stroke="#222" strokeWidth="2" strokeLinecap="round"/></svg>
          </button>
          <button className="px-4 py-2 rounded-lg bg-gray-100 font-semibold" onClick={handleLogout}>Logout</button>
        </div>
      </nav>
      <div className="px-4 md:px-8 py-6">
        <div className="flex justify-between items-center mb-8 gap-6">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold">Cost of Maintenance</h1>
            <p className="text-gray-500 mt-1">Company-scoped analytics for your maintenance operations.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-6 mb-8">
          <div className="flex flex-col gap-6">

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl shadow p-6 flex flex-col items-start">
            <span className="text-gray-500 mb-1">Avg Response Time</span>
            <span className="text-3xl font-bold">{loading ? '—' : metrics.avgResponseHrs} </span>
          <span className="text-gray-400 text-sm">hrs (approx)</span>
        </div>
        <div className="bg-white rounded-xl shadow p-6 flex flex-col items-start">
          <span className="text-gray-500 mb-1">Total Issues</span>
          <span className="text-3xl font-bold">{loading ? '—' : metrics.totalIssues}</span>
          <span className="text-gray-400 text-sm">issues</span>
        </div>
        <div className="bg-white rounded-xl shadow p-6 flex flex-col items-start">
          <span className="text-gray-500 mb-1">Completion Rate</span>
          <span className="text-3xl font-bold">{loading ? '—' : metrics.completionRate}%</span>
          <span className="text-gray-400 text-sm">{loading ? '' : `${metrics.completedIssues} / ${metrics.totalIssues}`}</span>
        </div>
        <div className="bg-white rounded-xl shadow p-6 flex flex-col items-start">
          <span className="text-gray-500 mb-1">Backlog</span>
          <span className="text-3xl font-bold text-red-600">{loading ? '—' : metrics.backlog}</span>
          <span className="text-gray-400 text-sm">pending</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow p-6">
          <div className="font-semibold mb-4">Top Locations (by requests)</div>
          <ul className="space-y-2">
            {(metrics.topLocations || []).length === 0 && <li className="text-sm text-gray-500">No location data</li>}
            {(metrics.topLocations || []).map((l, idx) => (
              <li key={idx} className="flex justify-between">
                <span>{l.location}</span>
                <span className="font-semibold">{l.count}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-white rounded-xl shadow p-6">
          <div className="font-semibold mb-4">Top Technician (completed)</div>
          {metrics.topTechnician ? (
            <div>
              <div className="text-lg font-bold">{metrics.topTechnician.name || metrics.topTechnician.id}</div>
              <div className="text-sm text-gray-500">Completed: {metrics.topTechnician.completed || metrics.topTechnician.completed}</div>
            </div>
          ) : (
            <div className="text-sm text-gray-500">No technician data</div>
          )}
        </div>
      </div>
          </div>

          <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden h-fit">
            <div className="py-2">
              <div className="px-4 py-3 text-sm font-medium text-gray-700">
                Date Range
              </div>
              {['7days', '30days', '90days', 'all'].map((range) => (
                <button
                  key={range}
                  onClick={() => setDateRange(range)}
                  className={`w-full text-left px-4 py-3 text-sm font-medium transition-colors ${
                    dateRange === range
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {range === '7days' ? 'Last 7 Days' : range === '30days' ? 'Last 30 Days' : range === '90days' ? 'Last 90 Days' : 'All Time'}
                </button>
              ))}
              <div className="border-t border-gray-200" />
              <div className="px-4 py-3 text-sm font-medium text-gray-700">
                Cost Type
              </div>
              {['all', 'reactive', 'preventive'].map((type) => (
                <button
                  key={type}
                  onClick={() => setCostTypeFilter(type)}
                  className={`w-full text-left px-4 py-3 text-sm font-medium transition-colors ${
                    costTypeFilter === type
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {type === 'all' ? 'All Cost Types' : type === 'reactive' ? 'Reactive Only' : 'Preventive Only'}
                </button>
              ))}
              <div className="border-t border-gray-200" />
              <div className="px-4 py-3 text-sm font-medium text-gray-700">
                Category
              </div>
              {['all', 'labor', 'parts', 'other'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategoryFilter(cat)}
                  className={`w-full text-left px-4 py-3 text-sm font-medium transition-colors ${
                    categoryFilter === cat
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {cat === 'all' ? 'All Categories' : cat.charAt(0).toUpperCase() + cat.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow p-6">
          <div className="font-semibold mb-4">Maintenance Cost Overview</div>
          <div className="text-sm text-gray-700">Total asset purchase cost: <span className="font-semibold">{loading ? '—' : `${metrics.totalAssetCost.toFixed(0)} RWF`}</span></div>
          <div className="text-sm text-gray-700">Average asset cost: <span className="font-semibold">{loading ? '—' : `${metrics.avgAssetCost.toFixed(0)} RWF`}</span></div>
          <div className="text-sm text-gray-700">Material requests: <span className="font-semibold">{loading ? '—' : metrics.materialReqCount}</span></div>
        </div>

        <div className="bg-white rounded-xl shadow p-6">
          <div className="font-semibold mb-4">Asset Downtime & Utilization</div>
          <div className="text-sm text-gray-700">Most downtime asset: <span className="font-semibold">{metrics.assetWithMostDowntime ? metrics.assetWithMostDowntime.assetId + ` (${metrics.assetWithMostDowntime.hrs.toFixed(1)} hrs)` : '—'}</span></div>
          <div className="mt-3">
            <div className="text-sm font-semibold mb-2">Utilization by Location</div>
            {(metrics.utilizationByLocation || []).slice(0,6).map((u, i) => (
              <div key={i} className="flex justify-between text-sm py-1">
                <span className="truncate">{u.location}</span>
                <span className="font-semibold">{u.utilization}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow p-6">
        <div className="font-semibold mb-4">Upcoming Preventive Work Orders</div>
        {(metrics.upcomingPreventive || []).length === 0 ? (
          <div className="text-sm text-gray-500">No upcoming preventive schedules</div>
        ) : (
          <ul className="space-y-2">
            {metrics.upcomingPreventive.map((s, i) => (
              <li key={i} className="flex justify-between">
                <span className="truncate">{s.name || s.title || `Schedule ${s.id || i}`}</span>
                <span className="text-sm text-gray-500">{s.nextDate ? new Date(s.nextDate).toLocaleString() : '—'}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Cost Breakdown Section */}
      <div className="bg-white rounded-xl shadow p-6 mb-8">
        <div className="font-semibold text-lg mb-4">Cost Breakdown Analysis</div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-green-50 rounded-lg p-6 border border-green-200">
            <div className="text-sm text-green-600 uppercase tracking-wider font-bold">Labor Cost</div>
            <div className="text-2xl font-bold text-green-700 mt-2">{loading ? '—' : `${metrics.laborCost.toLocaleString()} RWF`}</div>
          </div>
          <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
            <div className="text-sm text-blue-600 uppercase tracking-wider font-bold">Parts Cost</div>
            <div className="text-2xl font-bold text-blue-700 mt-2">{loading ? '—' : `${metrics.partsCost.toLocaleString()} RWF`}</div>
          </div>
          <div className="bg-yellow-50 rounded-lg p-6 border border-yellow-200">
            <div className="text-sm text-yellow-600 uppercase tracking-wider font-bold">Other Cost</div>
            <div className="text-2xl font-bold text-yellow-700 mt-2">{loading ? '—' : `${metrics.otherCost.toLocaleString()} RWF`}</div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
            <div className="text-sm text-gray-600 uppercase tracking-wider font-bold">Total Cost</div>
            <div className="text-2xl font-bold text-gray-900 mt-2">{loading ? '—' : `${metrics.totalCost.toLocaleString()} RWF`}</div>
          </div>
          <div className="bg-green-100 rounded-lg p-6 border border-green-300">
            <div className="text-sm text-green-700 uppercase tracking-wider font-bold">Reactive Cost</div>
            <div className="text-2xl font-bold text-green-800 mt-2">{loading ? '—' : `${metrics.reactiveCost.toLocaleString()} RWF`}</div>
          </div>
          <div className="bg-blue-100 rounded-lg p-6 border border-blue-300">
            <div className="text-sm text-blue-700 uppercase tracking-wider font-bold">Preventive Cost</div>
            <div className="text-2xl font-bold text-blue-800 mt-2">{loading ? '—' : `${metrics.preventiveCost.toLocaleString()} RWF`}</div>
          </div>
        </div>
      </div>

      {/* Cost Distribution Tables */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow p-6">
          <div className="font-semibold mb-4">Cost by Asset (Top 5)</div>
          {(metrics.costByAsset || []).length === 0 ? (
            <div className="text-sm text-gray-500">No asset cost data</div>
          ) : (
            <ul className="space-y-3">
              {metrics.costByAsset.map((item, idx) => (
                <li key={idx} className="flex justify-between items-center border-b pb-2">
                  <span className="truncate text-gray-700 text-sm">{item.asset}</span>
                  <span className="font-semibold text-gray-900 whitespace-nowrap ml-2">{item.cost.toLocaleString()} RWF</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="bg-white rounded-xl shadow p-6">
          <div className="font-semibold mb-4">Cost by Category (Top 5)</div>
          {(metrics.costByCategory || []).length === 0 ? (
            <div className="text-sm text-gray-500">No category cost data</div>
          ) : (
            <ul className="space-y-3">
              {metrics.costByCategory.map((item, idx) => (
                <li key={idx} className="flex justify-between items-center border-b pb-2">
                  <span className="truncate text-gray-700 text-sm">{item.category}</span>
                  <span className="font-semibold text-gray-900 whitespace-nowrap ml-2">{item.cost.toLocaleString()} RWF</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="bg-white rounded-xl shadow p-6">
          <div className="font-semibold mb-4">Cost by Location (Top 5)</div>
          {(metrics.costByLocation || []).length === 0 ? (
            <div className="text-sm text-gray-500">No location cost data</div>
          ) : (
            <ul className="space-y-3">
              {metrics.costByLocation.map((item, idx) => (
                <li key={idx} className="flex justify-between items-center border-b pb-2">
                  <span className="truncate text-gray-700 text-sm">{item.location}</span>
                  <span className="font-semibold text-gray-900 whitespace-nowrap ml-2">{item.cost.toLocaleString()} RWF</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
      </div>
    </div>
  );
}
