import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [technicians, setTechnicians] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [finances, setFinances] = useState({ expenses: 0, income: 0, profit: 0 });
  const [subscriptions, setSubscriptions] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;
    axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    axios.get("http://localhost:5000/api/issues").then(res => setJobs(res.data));
    axios.get("http://localhost:5000/api/technicians").then(res => setTechnicians(res.data));
    axios.get("http://localhost:5000/api/materials").then(res => setInventory(res.data));
    axios.get("http://localhost:5000/api/finances/summary").then(res => setFinances(res.data));
    axios.get("http://localhost:5000/api/subscriptions").then(res => setSubscriptions(res.data));
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="font-semibold text-lg mb-2">Active Jobs</h2>
          <div className="text-3xl font-bold">{jobs.length}</div>
          <button className="mt-3 text-indigo-600 hover:underline" onClick={() => navigate("/manager-issues")}>View All Jobs</button>
        </div>
        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="font-semibold text-lg mb-2">Technician Performance</h2>
          <div className="text-3xl font-bold">{technicians.length}</div>
          <button className="mt-3 text-indigo-600 hover:underline" onClick={() => navigate("/technician-management")}>View Technicians</button>
        </div>
        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="font-semibold text-lg mb-2">Inventory Status</h2>
          <div className="text-3xl font-bold">{inventory.length}</div>
          <button className="mt-3 text-indigo-600 hover:underline" onClick={() => navigate("/inventory")}>View Inventory</button>
        </div>
        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="font-semibold text-lg mb-2">Financial Summary</h2>
          <div className="mb-1">Expenses: <span className="font-bold text-red-600">{finances.expenses} RWF</span></div>
          <div className="mb-1">Income: <span className="font-bold text-green-600">{finances.income} RWF</span></div>
          <div>Profit: <span className="font-bold text-blue-600">{finances.profit} RWF</span></div>
          <button className="mt-3 text-indigo-600 hover:underline" onClick={() => navigate("/finances")}>View Financials</button>
        </div>
        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="font-semibold text-lg mb-2">Subscription Revenue</h2>
          <div className="text-3xl font-bold">{subscriptions.length}</div>
          <button className="mt-3 text-indigo-600 hover:underline" onClick={() => navigate("/subscriptions")}>View Subscriptions</button>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
