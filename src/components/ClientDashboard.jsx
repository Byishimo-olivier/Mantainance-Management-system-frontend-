
import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const statusCards = [
  {
    label: "Pending",
    colorClass: "text-yellow-700",
    bgClass: "bg-yellow-100 border-yellow-100",
    icon: (
      <svg width="36" height="36" viewBox="0 0 24 24" fill="none">
        <rect x="4" y="4" width="16" height="16" rx="8" fill="#fde68a" />
        <path d="M12 8v4l3 3" stroke="#b45309" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="12" cy="12" r="9" stroke="#fde68a" strokeWidth="2" />
      </svg>
    ),
  },
  {
    label: "In Progress",
    colorClass: "text-blue-700",
    bgClass: "bg-blue-100 border-blue-100",
    icon: (
      <svg width="36" height="36" viewBox="0 0 24 24" fill="none">
        <rect x="4" y="4" width="16" height="16" rx="8" fill="#dbeafe" />
        <path d="M12 8v4l3 3" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="12" cy="12" r="9" stroke="#dbeafe" strokeWidth="2" />
      </svg>
    ),
  },
  {
    label: "Completed",
    colorClass: "text-green-700",
    bgClass: "bg-green-100 border-green-100",
    icon: (
      <svg width="36" height="36" viewBox="0 0 24 24" fill="none">
        <rect x="4" y="4" width="16" height="16" rx="8" fill="#d1fae5" />
        <path d="M9 12l2 2 4-4" stroke="#059669" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="12" cy="12" r="9" stroke="#d1fae5" strokeWidth="2" />
      </svg>
    ),
  },
  {
    label: "Overdue",
    colorClass: "text-red-700",
    bgClass: "bg-red-100 border-red-100",
    icon: (
      <svg width="36" height="36" viewBox="0 0 24 24" fill="none">
        <rect x="4" y="4" width="16" height="16" rx="8" fill="#fee2e2" />
        <path d="M15 9l-6 6M9 9l6 6" stroke="#dc2626" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="12" cy="12" r="9" stroke="#fee2e2" strokeWidth="2" />
      </svg>
    ),
  },
];

function ClientDashboard() {
	// State declarations
	const [activeTab, setActiveTab] = useState('dashboard');
	const [properties, setProperties] = useState([]);
	const [assets, setAssets] = useState([]);
	const [internalTechnicians, setInternalTechnicians] = useState([]);
	const [maintenanceTemplates, setMaintenanceTemplates] = useState([]);
	const [maintenanceSchedules, setMaintenanceSchedules] = useState([]);
	const [editingProperty, setEditingProperty] = useState(null);
	const [propertyForm, setPropertyForm] = useState({ name: '', type: '', address: '' });
	const [editingAsset, setEditingAsset] = useState(null);
	const [assetForm, setAssetForm] = useState({ name: '', type: '', description: '', propertyId: '' });
	const [editingTech, setEditingTech] = useState(null);
	const [techForm, setTechForm] = useState({ name: '', email: '', phone: '', specialization: [], rating: 0, completed: 0, propertyId: '' });
	const [editingTemplate, setEditingTemplate] = useState(null);
	const [templateForm, setTemplateForm] = useState({ name: '', type: '', frequency: '' });
	const [editingSchedule, setEditingSchedule] = useState(null);
	const [scheduleForm, setScheduleForm] = useState({ name: '', status: '', nextDate: '', technicianId: '' });
	const [issues, setIssues] = useState([]);
	const [allIssues, setAllIssues] = useState([]);
	const [statusCounts, setStatusCounts] = useState({
		Pending: 0,
		"In Progress": 0,
		Completed: 0,
		Overdue: 0,
	});
	const [feedbacks, setFeedbacks] = useState([]);
	const [userName, setUserName] = useState("");
	const navigate = useNavigate();

	useEffect(() => {
		const storedUser = localStorage.getItem("user");
		const token = localStorage.getItem("token");
		if (!storedUser || !token) {
			navigate("/login");
			return;
		}
		const userObj = JSON.parse(storedUser);
		setUserName(userObj.name || "");
		axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
		async function fetchIssues() {
			try {
				const res = await axios.get('http://localhost:5000/api/issues');
				setIssues(res.data || []);
				setAllIssues(res.data || []);
				const counts = { Pending: 0, "In Progress": 0, Completed: 0, Overdue: 0 };
				(res.data || []).forEach(issue => {
					const status = issue.status.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase()).replace('Complete', 'Completed');
					if (counts[status] !== undefined) counts[status]++;
				});
				setStatusCounts(counts);
			} catch (err) {
				setIssues([]);
				setStatusCounts({
					Pending: 0,
					"In Progress": 0,
					Completed: 0,
					Overdue: 0,
				});
			}
		}
		// Fetch new entities
		async function fetchEntities() {
			try {
				const propRes = await axios.get('http://localhost:5000/api/properties').catch(() => ({ data: [] }));
				setProperties(propRes.data || []);
			} catch (err) {
				setProperties([]);
			}
			try {
				const assetRes = await axios.get('http://localhost:5000/api/assets').catch(() => ({ data: [] }));
				setAssets(assetRes.data || []);
			} catch (err) {
				setAssets([]);
			}
			try {
				const techRes = await axios.get('http://localhost:5000/api/internal-technicians').catch(() => ({ data: [] }));
				setInternalTechnicians(techRes.data || []);
			} catch (err) {
				setInternalTechnicians([]);
			}
			try {
				const tmplRes = await axios.get('http://localhost:5000/api/maintenance-templates').catch(() => ({ data: [] }));
				setMaintenanceTemplates(tmplRes.data || []);
			} catch (err) {
				setMaintenanceTemplates([]);
			}
			try {
				const schedRes = await axios.get('http://localhost:5000/api/maintenance-schedules').catch(() => ({ data: [] }));
				setMaintenanceSchedules(schedRes.data || []);
			} catch (err) {
				setMaintenanceSchedules([]);
			}
		}
		fetchIssues();
		fetchEntities();
	}, [navigate]);

	useEffect(() => {
		if (activeTab === 'feedback') {
			const allFeedbacks = allIssues.filter(issue => issue.afterImage || issue.address);
			setFeedbacks(allFeedbacks);
		}
	}, [activeTab, allIssues]);

	const handleLogout = () => {
		localStorage.removeItem("token");
		localStorage.removeItem("user");
		navigate("/login", { replace: true });
		window.location.reload();
	};
	return (
		<div className="min-h-screen bg-gray-50">
			{/* Navbar */}
			<nav className="flex items-center justify-between bg-white shadow px-4 md:px-8 h-16">
				<div className="flex items-center gap-3">
					<span className="bg-indigo-600 rounded-xl p-1 flex items-center justify-center">
						<svg width="36" height="36" viewBox="0 0 24 24" fill="none">
							<rect x="2" y="2" width="20" height="20" rx="6" fill="#6366f1" />
							<rect x="6" y="6" width="12" height="6" rx="2" fill="#a5b4fc" />
						</svg>
					</span>
					<div className="flex flex-col ml-1">
						<span className="text-lg font-bold text-gray-900">Fixnest</span>
						<span className="text-sm text-gray-500">{userName}</span>
					</div>
				</div>
				<div className="flex gap-3">
					<button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-100 text-indigo-700 font-semibold" disabled>
						<svg width="18" height="18" viewBox="0 0 24 24" fill="none">
							<rect x="3" y="3" width="18" height="18" rx="4" fill="#ede9fe" />
							<rect x="7" y="7" width="4" height="4" rx="1" fill="#8b5cf6" />
							<rect x="13" y="7" width="4" height="4" rx="1" fill="#8b5cf6" />
							<rect x="7" y="13" width="4" height="4" rx="1" fill="#8b5cf6" />
							<rect x="13" y="13" width="4" height="4" rx="1" fill="#8b5cf6" />
						</svg>{" "}
						Dashboard
					</button>
					<button className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-gray-100 font-semibold" onClick={() => navigate("/issues")}>
						<svg width="18" height="18" viewBox="0 0 24 24" fill="none">
							<rect x="3" y="3" width="18" height="18" rx="4" fill="#f3f4f6" />
							<rect x="7" y="7" width="10" height="10" rx="2" fill="#6366f1" />
						</svg>{" "}
						All Issues
					</button>
					<button className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-gray-100 font-semibold" onClick={() => navigate("/new-issue")}>
						<svg width="18" height="18" viewBox="0 0 24 24" fill="none">
							<circle cx="12" cy="12" r="9" fill="#fef9c3" />
							<path d="M12 8v4l3 3" stroke="#b45309" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
						</svg>{" "}
						New Issue
					</button>
					<button className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-green-100 font-semibold text-green-700 border border-green-200" onClick={() => navigate("/feedback")}>
						<svg width="18" height="18" viewBox="0 0 24 24" fill="none">
							<path d="M2 12a10 10 0 1 0 20 0A10 10 0 0 0 2 12Zm6-1 2 2 4-4" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
						</svg>{" "}
						Feedback
					</button>
				</div>
				<div className="flex items-center gap-2">
					<button className="bg-gray-100 rounded-lg px-2 py-1 flex items-center justify-center">
						<svg width="20" height="20" viewBox="0 0 24 24" fill="none">
							<circle cx="12" cy="12" r="10" fill="#f3f4f6" />
							<path d="M8 12h8" stroke="#222" strokeWidth="2" strokeLinecap="round" />
						</svg>
					</button>
					<button className="px-4 py-2 rounded-lg bg-gray-100 font-semibold" onClick={handleLogout}>
						Logout
					</button>
				</div>
			</nav>
			{/* Content */}
			<div className="max-w-6xl mx-auto px-2 md:px-4 pt-6 md:pt-8 w-full">
				{/* Modern Welcome Card */}
				<div className="mb-8">
					<div className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-3xl shadow-lg p-8 flex flex-col md:flex-row items-center justify-between text-white">
						<div>
							<h1 className="text-2xl md:text-3xl font-extrabold mb-2">
								Welcome back, {userName}!
							</h1>
							<p className="text-lg md:text-xl font-medium opacity-90">
								We're glad to see you again. Here's a quick overview of your
								recent activity.
							</p>
						</div>
						<div className="hidden md:block">
							<svg width="80" height="80" viewBox="0 0 24 24" fill="none" className="drop-shadow-lg">
								<circle cx="12" cy="12" r="10" fill="#fff" fillOpacity="0.15" />
								<path d="M12 8v4l3 3" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
								<circle cx="12" cy="12" r="9" stroke="#fff" strokeWidth="2" />
							</svg>
						</div>
					</div>
				</div>
				<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-6 md:mb-8">
					{statusCards.map((card) => (
						<div className={`rounded-2xl border-2 shadow flex flex-col gap-2 md:gap-3 p-4 md:p-6 ${card.bgClass}`} key={card.label}>
							<div className={`text-base md:text-lg font-semibold mb-1 md:mb-2 ${card.colorClass}`}>
								{card.label}
							</div>
							<div className="flex items-center justify-between">
								<span className={`text-xl md:text-3xl font-bold ${card.colorClass}`}>
									{statusCounts[card.label] || 0}
								</span>
								<span>{card.icon}</span>
							</div>
						</div>
					))}
				</div>
				{/* Tabbed interface for new features */}
				<div className="mb-8">
					<div className="flex gap-2 mb-4">
						<button className={`px-4 py-2 rounded-lg font-semibold ${activeTab === 'dashboard' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-700'}`} onClick={() => setActiveTab('dashboard')}>Dashboard</button>
						<button className={`px-4 py-2 rounded-lg font-semibold ${activeTab === 'properties' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-700'}`} onClick={() => setActiveTab('properties')}>Properties</button>
						<button className={`px-4 py-2 rounded-lg font-semibold ${activeTab === 'assets' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-700'}`} onClick={() => setActiveTab('assets')}>Assets</button>
						<button className={`px-4 py-2 rounded-lg font-semibold ${activeTab === 'internalTechnicians' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-700'}`} onClick={() => setActiveTab('internalTechnicians')}>Internal Technicians</button>
						<button className={`px-4 py-2 rounded-lg font-semibold ${activeTab === 'maintenanceTemplates' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-700'}`} onClick={() => setActiveTab('maintenanceTemplates')}>Maintenance Templates</button>
						<button className={`px-4 py-2 rounded-lg font-semibold ${activeTab === 'maintenanceSchedules' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-700'}`} onClick={() => setActiveTab('maintenanceSchedules')}>Maintenance Schedules</button>
					</div>
					{/* Tab content */}
					{activeTab === 'dashboard' && (
						<>
							{/* Redesigned Recent Issues Section */}
							<div className="bg-white rounded-3xl shadow-lg p-0 mb-8 w-full border border-gray-100">
								<div className="flex flex-col md:flex-row items-start md:items-center justify-between px-8 pt-8 pb-4 gap-2">
									<span className="text-2xl font-bold text-gray-900 flex items-center gap-2">
										<svg width="28" height="28" viewBox="0 0 24 24" fill="none">
											<rect x="2" y="2" width="20" height="20" rx="6" fill="#6366f1" />
											<rect x="6" y="6" width="12" height="6" rx="2" fill="#a5b4fc" />
										</svg>
										Recent Issues
									</span>
									<a href="#" className="text-indigo-600 font-semibold hover:underline text-base" onClick={(e) => { e.preventDefault(); navigate("/issues"); }}>
										View All Issues →
									</a>
								</div>
								<div className="divide-y divide-gray-100">
									{issues && issues.length > 0 ? (
										issues.slice(0, 5).map((issue, idx) => (
											<div key={issue.id || idx} className="flex flex-col md:flex-row items-start justify-between py-6 px-8 bg-gradient-to-r from-gray-50 via-white to-gray-100 hover:shadow-md transition rounded-2xl mb-2">
												<div className="flex-1">
													<div className="text-lg font-semibold text-gray-800 mb-1 flex items-center gap-2">
														<span className="inline-block w-2 h-2 rounded-full bg-indigo-400"></span>
														{issue.title}
													</div>
													<div className="text-gray-500 mb-2 text-sm">
														{issue.location}
													</div>
													{(issue.photo || issue.image) ? (
														<div className="mb-2">
															<img src={(() => {
																const img = issue.photo || issue.image;
																if (!img) return '/default-issue.png';
																return img.startsWith('http') ? img : `http://localhost:5000/uploads/${img.replace(/^\/uploads\//, '')}`;
															})()} alt="Issue" className="h-24 w-auto rounded-lg border border-gray-200 shadow-sm" onError={(e) => { e.target.src = "/default-issue.png"; }} />
														</div>
													) : null}
													<div className="flex gap-2 mb-1 flex-wrap">
														{Array.isArray(issue.tags) && issue.tags.filter(tag => tag !== "PENDING" && tag !== "IN PROGRESS" && tag !== "COMPLETE" && tag !== "OVERDUE").map((tag, i) => {
															let label = tag.label || tag;
															let colorClass = label === "URGENT" ? "bg-red-100 text-red-700" : "bg-gray-100 text-gray-700";
															return <span className={`rounded-md px-2 py-1 text-xs font-medium ${colorClass}`} key={i}>{label}</span>;
														})}
														{issue.status && (
															<span className={`rounded-md px-2 py-1 text-xs font-semibold ${issue.status === "IN PROGRESS" ? "bg-blue-100 text-blue-700" : issue.status === "PENDING" ? "bg-yellow-100 text-yellow-700" : issue.status === "COMPLETE" ? "bg-green-100 text-green-700" : issue.status === "OVERDUE" ? "bg-red-100 text-red-700" : "bg-gray-100 text-gray-700"}`}>
																{issue.status.replace("_", " ")}
															</span>
														)}
													</div>
												</div>
												<div className="flex flex-col items-end min-w-[70px] md:min-w-[90px] gap-1 mt-2 md:mt-0">
													<span className="flex items-center gap-1 text-yellow-700 text-xs md:text-base font-medium">
														<svg width="18" height="18" viewBox="0 0 24 24" fill="none">
															<path d="M12 8v4l3 3" stroke="#b45309" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
															<circle cx="12" cy="12" r="9" stroke="#fbbf24" strokeWidth="2" />
														</svg>{" "}
														{issue.time}
													</span>
													{issue.overdue && <span className="text-red-600 text-xs md:text-sm font-semibold">overdue</span>}
												</div>
											</div>
										))
									) : (
										<div className="text-gray-400 py-8 text-center text-lg font-medium">
											No recent issues found.
										</div>
									)}
								</div>
							</div>
						</>
					)}
					{activeTab === 'properties' && (
						<div className="bg-white rounded-2xl shadow p-6">
							<h2 className="text-xl font-bold mb-4">Properties</h2>
							{/* Create Property Form */}
							<form className="mb-4 flex flex-col md:flex-row gap-2" onSubmit={async e => {
								e.preventDefault();
								try {
									if (editingProperty) {
										await axios.put(`http://localhost:5000/api/properties/${editingProperty._id || editingProperty.id}`, propertyForm);
										setEditingProperty(null);
									} else {
										await axios.post('http://localhost:5000/api/properties', propertyForm);
									}
									setPropertyForm({ name: '', type: '', address: '' });
									const res = await axios.get('http://localhost:5000/api/properties');
									setProperties(res.data || []);
								} catch (err) {
									console.error('Error saving property:', err);
									alert('Failed to save property. Please try again.');
								}
							}}>
								<input className="border rounded px-2 py-1" required placeholder="Name" value={propertyForm.name} onChange={e => setPropertyForm(f => ({ ...f, name: e.target.value }))} />
								<input className="border rounded px-2 py-1" required placeholder="Type" value={propertyForm.type} onChange={e => setPropertyForm(f => ({ ...f, type: e.target.value }))} />
								<input className="border rounded px-2 py-1" required placeholder="Address" value={propertyForm.address} onChange={e => setPropertyForm(f => ({ ...f, address: e.target.value }))} />
								<button className="bg-indigo-600 text-white px-4 py-1 rounded" type="submit">{editingProperty ? 'Update' : 'Add'}</button>
								{editingProperty && <button className="bg-gray-300 px-2 py-1 rounded" type="button" onClick={() => { setEditingProperty(null); setPropertyForm({ name: '', type: '', address: '' }); }}>Cancel</button>}
							</form>
							<ul>
								{properties.length === 0 && <li className="text-gray-400">No properties found.</li>}
								{properties.map((p) => (
									<li key={p.id || p._id} className="mb-2 border-b pb-2 flex justify-between items-center">
										<div>
											<span className="font-semibold">{p.name}</span> <span className="text-gray-500">({p.type})</span>
											<div className="text-sm text-gray-600">{p.address}</div>
										</div>
										<div className="flex gap-2">
											<button className="text-blue-600" onClick={() => { setEditingProperty(p); setPropertyForm({ name: p.name, type: p.type, address: p.address }); }}>Edit</button>
											<button className="text-red-600" onClick={async () => {
												try {
													await axios.delete(`http://localhost:5000/api/properties/${p._id || p.id}`);
													setProperties(properties.filter(x => (x._id || x.id) !== (p._id || p.id)));
												} catch (err) {
													console.error('Error deleting property:', err);
													alert('Failed to delete property. Please try again.');
												}
											}}>Delete</button>
										</div>
									</li>
								))}
							</ul>
						</div>
					)}
					{activeTab === 'assets' && (
						<div className="bg-white rounded-2xl shadow p-6">
							<h2 className="text-xl font-bold mb-4">Assets</h2>
							{/* Create Asset Form */}
							<form className="mb-4 flex flex-col md:flex-row gap-2" onSubmit={async e => {
								e.preventDefault();
								try {
									if (editingAsset) {
										await axios.put(`http://localhost:5000/api/assets/${editingAsset._id || editingAsset.id}`, assetForm);
										setEditingAsset(null);
									} else {
										await axios.post('http://localhost:5000/api/assets', assetForm);
									}
									setAssetForm({ name: '', type: '', description: '', propertyId: '' });
									const res = await axios.get('http://localhost:5000/api/assets');
									setAssets(res.data || []);
								} catch (err) {
									console.error('Error saving asset:', err);
									alert('Failed to save asset. Please try again.');
								}
							}}>
								<input className="border rounded px-2 py-1" required placeholder="Name" value={assetForm.name} onChange={e => setAssetForm(f => ({ ...f, name: e.target.value }))} />
								<input className="border rounded px-2 py-1" required placeholder="Type" value={assetForm.type} onChange={e => setAssetForm(f => ({ ...f, type: e.target.value }))} />
								<input className="border rounded px-2 py-1" placeholder="Description" value={assetForm.description} onChange={e => setAssetForm(f => ({ ...f, description: e.target.value }))} />
								<select className="border rounded px-2 py-1" required value={assetForm.propertyId} onChange={e => setAssetForm(f => ({ ...f, propertyId: e.target.value }))}>
									<option value="">Select Company</option>
									{properties.map(p => <option key={p.id || p._id} value={p.id || p._id}>{p.name}</option>)}
								</select>
								<button className="bg-indigo-600 text-white px-4 py-1 rounded" type="submit">{editingAsset ? 'Update' : 'Add'}</button>
								{editingAsset && <button className="bg-gray-300 px-2 py-1 rounded" type="button" onClick={() => { setEditingAsset(null); setAssetForm({ name: '', type: '', description: '', propertyId: '' }); }}>Cancel</button>}
							</form>
							<ul>
								{assets.length === 0 && <li className="text-gray-400">No assets found.</li>}
								{assets.map((a) => (
									<li key={a.id || a._id} className="mb-2 border-b pb-2 flex justify-between items-center">
										<div>
											<span className="font-semibold">{a.name}</span> <span className="text-gray-500">({a.type})</span>
											<div className="text-sm text-gray-600">{a.description}</div>
											<div className="text-sm text-gray-600">Property: {a.property ? a.property.name : 'N/A'}</div>
										</div>
										<div className="flex gap-2">
											<button className="text-blue-600" onClick={() => { setEditingAsset(a); setAssetForm({ name: a.name, type: a.type, description: a.description || '', propertyId: a.propertyId }); }}>Edit</button>
											<button className="text-red-600" onClick={async () => {
												try {
													await axios.delete(`http://localhost:5000/api/assets/${a._id || a.id}`);
													setAssets(assets.filter(x => (x._id || x.id) !== (a._id || a.id)));
												} catch (err) {
													console.error('Error deleting asset:', err);
													alert('Failed to delete asset. Please try again.');
												}
											}}>Delete</button>
										</div>
									</li>
								))}
							</ul>
						</div>
					)}
					{activeTab === 'internalTechnicians' && (
						<div className="bg-white rounded-2xl shadow p-6">
							<h2 className="text-xl font-bold mb-4">Internal Technicians</h2>
							{/* Create Technician Form */}
							<form className="mb-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2" onSubmit={async e => {
								e.preventDefault();
								try {
									const data = { ...techForm, specialization: techForm.specialization.filter(s => s.trim()) };
									if (editingTech) {
										await axios.put(`http://localhost:5000/api/internal-technicians/${editingTech._id || editingTech.id}`, data);
										setEditingTech(null);
									} else {
										await axios.post('http://localhost:5000/api/internal-technicians', data);
									}
									setTechForm({ name: '', email: '', phone: '', specialization: [], rating: 0, completed: 0, propertyId: '' });
									const res = await axios.get('http://localhost:5000/api/internal-technicians');
									setInternalTechnicians(res.data || []);
								} catch (err) {
									console.error('Error saving technician:', err);
									alert('Failed to save technician. Please try again.');
								}
							}}>
								<input className="border rounded px-2 py-1" required placeholder="Name" value={techForm.name} onChange={e => setTechForm(f => ({ ...f, name: e.target.value }))} />
								<input className="border rounded px-2 py-1" placeholder="Email" value={techForm.email} onChange={e => setTechForm(f => ({ ...f, email: e.target.value }))} />
								<input className="border rounded px-2 py-1" required placeholder="Phone" value={techForm.phone} onChange={e => setTechForm(f => ({ ...f, phone: e.target.value }))} />
								<input className="border rounded px-2 py-1" placeholder="Specialization (comma-separated)" value={techForm.specialization.join(', ')} onChange={e => setTechForm(f => ({ ...f, specialization: e.target.value.split(',').map(s => s.trim()) }))} />
								<input className="border rounded px-2 py-1" type="number" step="0.1" placeholder="Rating" value={techForm.rating} onChange={e => setTechForm(f => ({ ...f, rating: parseFloat(e.target.value) || 0 }))} />
								<input className="border rounded px-2 py-1" type="number" placeholder="Completed" value={techForm.completed} onChange={e => setTechForm(f => ({ ...f, completed: parseInt(e.target.value) || 0 }))} />
								<select className="border rounded px-2 py-1 col-span-1 md:col-span-2 lg:col-span-3" required value={techForm.propertyId} onChange={e => setTechForm(f => ({ ...f, propertyId: e.target.value }))}>
									<option value="">Select Property</option>
									{properties.map(p => <option key={p.id || p._id} value={p.id || p._id}>{p.name}</option>)}
								</select>
								<div className="col-span-1 md:col-span-2 lg:col-span-3 flex gap-2">
									<button className="bg-indigo-600 text-white px-4 py-1 rounded" type="submit">{editingTech ? 'Update' : 'Add'}</button>
									{editingTech && <button className="bg-gray-300 px-2 py-1 rounded" type="button" onClick={() => { setEditingTech(null); setTechForm({ name: '', email: '', phone: '', specialization: [], rating: 0, completed: 0, propertyId: '' }); }}>Cancel</button>}
								</div>
							</form>
							<ul>
								{internalTechnicians.length === 0 && <li className="text-gray-400">No internal technicians found.</li>}
								{internalTechnicians.map((t) => (
									<li key={t.id || t._id} className="mb-2 border-b pb-2 flex justify-between items-center">
										<div>
											<span className="font-semibold">{t.name}</span> <span className="text-gray-500">({Array.isArray(t.specialization) ? t.specialization.join(', ') : t.specialty || 'N/A'})</span>
											<div className="text-sm text-gray-600">Email: {t.email || 'N/A'}</div>
											<div className="text-sm text-gray-600">Phone: {t.phone}</div>
											<div className="text-sm text-gray-600">Rating: {t.rating || 0}, Completed: {t.completed || 0}</div>
											<div className="text-sm text-gray-600">Property: {t.property ? t.property.name : 'N/A'}</div>
										</div>
										<div className="flex gap-2">
											<button className="text-blue-600" onClick={() => { setEditingTech(t); setTechForm({ name: t.name, email: t.email || '', phone: t.phone, specialization: Array.isArray(t.specialization) ? t.specialization : (t.specialty ? [t.specialty] : []), rating: t.rating || 0, completed: t.completed || 0, propertyId: t.propertyId }); }}>Edit</button>
											<button className="text-red-600" onClick={async () => {
												try {
													await axios.delete(`http://localhost:5000/api/internal-technicians/${t._id || t.id}`);
													setInternalTechnicians(internalTechnicians.filter(x => (x._id || x.id) !== (t._id || t.id)));
												} catch (err) {
													console.error('Error deleting technician:', err);
													alert('Failed to delete technician. Please try again.');
												}
											}}>Delete</button>
										</div>
									</li>
								))}
							</ul>
						</div>
					)}
					{activeTab === 'maintenanceTemplates' && (
						<div className="bg-white rounded-2xl shadow p-6">
							<h2 className="text-xl font-bold mb-4">Maintenance Templates</h2>
							{/* Create Template Form */}
							<form className="mb-4 flex flex-col md:flex-row gap-2" onSubmit={async e => {
								e.preventDefault();
								try {
									if (editingTemplate) {
										await axios.put(`http://localhost:5000/api/maintenance-templates/${editingTemplate._id || editingTemplate.id}`, templateForm);
										setEditingTemplate(null);
									} else {
										await axios.post('http://localhost:5000/api/maintenance-templates', templateForm);
									}
									setTemplateForm({ name: '', type: '', frequency: '' });
									const res = await axios.get('http://localhost:5000/api/maintenance-templates');
									setMaintenanceTemplates(res.data || []);
								} catch (err) {
									console.error('Error saving template:', err);
									alert('Failed to save template. Please try again.');
								}
							}}>
								<input className="border rounded px-2 py-1" required placeholder="Name" value={templateForm.name} onChange={e => setTemplateForm(f => ({ ...f, name: e.target.value }))} />
								<input className="border rounded px-2 py-1" required placeholder="Type" value={templateForm.type} onChange={e => setTemplateForm(f => ({ ...f, type: e.target.value }))} />
								<input className="border rounded px-2 py-1" required placeholder="Frequency" value={templateForm.frequency} onChange={e => setTemplateForm(f => ({ ...f, frequency: e.target.value }))} />
								<button className="bg-indigo-600 text-white px-4 py-1 rounded" type="submit">{editingTemplate ? 'Update' : 'Add'}</button>
								{editingTemplate && <button className="bg-gray-300 px-2 py-1 rounded" type="button" onClick={() => { setEditingTemplate(null); setTemplateForm({ name: '', type: '', frequency: '' }); }}>Cancel</button>}
							</form>
							<ul>
								{maintenanceTemplates.length === 0 && <li className="text-gray-400">No templates found.</li>}
								{maintenanceTemplates.map((m) => (
									<li key={m.id || m._id} className="mb-2 border-b pb-2 flex justify-between items-center">
										<div>
											<span className="font-semibold">{m.name}</span> <span className="text-gray-500">({m.type})</span>
											<div className="text-sm text-gray-600">Frequency: {m.frequency}</div>
										</div>
										<div className="flex gap-2">
											<button className="text-blue-600" onClick={() => { setEditingTemplate(m); setTemplateForm({ name: m.name, type: m.type, frequency: m.frequency }); }}>Edit</button>
											<button className="text-red-600" onClick={async () => {
												try {
													await axios.delete(`http://localhost:5000/api/maintenance-templates/${m._id || m.id}`);
													setMaintenanceTemplates(maintenanceTemplates.filter(x => (x._id || x.id) !== (m._id || m.id)));
												} catch (err) {
													console.error('Error deleting template:', err);
													alert('Failed to delete template. Please try again.');
												}
											}}>Delete</button>
										</div>
									</li>
								))}
							</ul>
						</div>
					)}
					{activeTab === 'maintenanceSchedules' && (
						<div className="bg-white rounded-2xl shadow p-6">
							<h2 className="text-xl font-bold mb-4">Maintenance Schedules</h2>
							{/* Create Schedule Form */}
							<form className="mb-4 flex flex-col md:flex-row gap-2" onSubmit={async e => {
								e.preventDefault();
								try {
									const data = { name: scheduleForm.name, status: scheduleForm.status, nextDate: scheduleForm.nextDate };
									if (scheduleForm.technicianId) data.technicianId = scheduleForm.technicianId;
									if (editingSchedule) {
										await axios.put(`http://localhost:5000/api/maintenance-schedules/${editingSchedule._id || editingSchedule.id}`, data);
										setEditingSchedule(null);
									} else {
										await axios.post('http://localhost:5000/api/maintenance-schedules', data);
									}
									setScheduleForm({ name: '', status: '', nextDate: '', technicianId: '' });
									const res = await axios.get('http://localhost:5000/api/maintenance-schedules');
									setMaintenanceSchedules(res.data || []);
								} catch (err) {
									console.error('Error saving schedule:', err);
									alert('Failed to save schedule. Please try again.');
								}
							}}>
								<input className="border rounded px-2 py-1" required placeholder="Name" value={scheduleForm.name} onChange={e => setScheduleForm(f => ({ ...f, name: e.target.value }))} />
								<input className="border rounded px-2 py-1" required placeholder="Status" value={scheduleForm.status} onChange={e => setScheduleForm(f => ({ ...f, status: e.target.value }))} />
								<input className="border rounded px-2 py-1" required placeholder="Next Date" value={scheduleForm.nextDate} onChange={e => setScheduleForm(f => ({ ...f, nextDate: e.target.value }))} type="date" />
								<select className="border rounded px-2 py-1" value={scheduleForm.technicianId} onChange={e => setScheduleForm(f => ({ ...f, technicianId: e.target.value }))}>
									<option value="">Select Technician (Optional)</option>
									{internalTechnicians.map(t => <option key={t.id || t._id} value={t.id || t._id}>{t.name}</option>)}
								</select>
								<button className="bg-indigo-600 text-white px-4 py-1 rounded" type="submit">{editingSchedule ? 'Update' : 'Add'}</button>
								{editingSchedule && <button className="bg-gray-300 px-2 py-1 rounded" type="button" onClick={() => { setEditingSchedule(null); setScheduleForm({ name: '', status: '', nextDate: '', technicianId: '' }); }}>Cancel</button>}
							</form>
							<ul>
								{maintenanceSchedules.length === 0 && <li className="text-gray-400">No schedules found.</li>}
								{maintenanceSchedules.map((s) => (
									<li key={s.id || s._id} className="mb-2 border-b pb-2 flex justify-between items-center">
										<div>
											<span className="font-semibold">{s.name || s._id}</span> <span className="text-gray-500">({s.status})</span>
											<div className="text-sm text-gray-600">Next: {s.nextDate}</div>
											<div className="text-sm text-gray-600">Technician: {s.technician ? s.technician.name : 'Unassigned'}</div>
										</div>
										<div className="flex gap-2">
											<button className="text-blue-600" onClick={() => { setEditingSchedule(s); setScheduleForm({ name: s.name, status: s.status, nextDate: s.nextDate ? s.nextDate.split('T')[0] : '', technicianId: s.technicianId || '' }); }}>Edit</button>
											<button className="text-red-600" onClick={async () => {
												try {
													await axios.delete(`http://localhost:5000/api/maintenance-schedules/${s._id || s.id}`);
													setMaintenanceSchedules(maintenanceSchedules.filter(x => (x._id || x.id) !== (s._id || s.id)));
												} catch (err) {
													console.error('Error deleting schedule:', err);
													alert('Failed to delete schedule. Please try again.');
												}
											}}>Delete</button>
										</div>
									</li>
								))}
							</ul>
						</div>
					)}
				</div>
				{/* ...existing dashboard content (status cards, recent issues)... */}
			</div>
		</div>
	);
}

export default ClientDashboard;


