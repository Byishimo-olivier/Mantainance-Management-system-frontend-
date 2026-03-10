import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import { useLanguage, useTranslation } from "../i18n/LanguageContext";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { language, setLanguage } = useLanguage();
  const { t } = useTranslation();
  const [jobs, setJobs] = useState([]);
  const [technicians, setTechnicians] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [finances, setFinances] = useState({ expenses: 0, income: 0, profit: 0 });
  const [subscriptions, setSubscriptions] = useState([]);

  useEffect(() => {
    // Auth token is handled by the api interceptor in ../api/axios.js
    api.get("/api/issues").then(res => setJobs(res.data));
    api.get("/api/technicians").then(res => setTechnicians(res.data));
    api.get("/api/materials").then(res => setInventory(res.data));
    api.get("/api/finances/summary").then(res => setFinances(res.data));
    api.get("/api/subscriptions").then(res => setSubscriptions(res.data));
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-6">
        <h1 className="text-2xl font-bold">{t("admin.title")}</h1>
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-gray-500">{t("language.label")}</span>
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="text-xs border border-gray-200 rounded-lg px-2 py-1 bg-white text-gray-700"
          >
            <option value="en">{t("language.english")}</option>
            <option value="fr">{t("language.french")}</option>
            <option value="rw">{t("language.kinyarwanda")}</option>
          </select>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="font-semibold text-lg mb-2">{t("admin.activeJobs")}</h2>
          <div className="text-3xl font-bold">{jobs.length}</div>
          <button className="mt-3 text-indigo-600 hover:underline" onClick={() => navigate("/manager-issues")}>{t("admin.viewAllJobs")}</button>
        </div>
        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="font-semibold text-lg mb-2">{t("admin.technicianPerformance")}</h2>
          <div className="text-3xl font-bold">{technicians.length}</div>
          <button className="mt-3 text-indigo-600 hover:underline" onClick={() => navigate("/technician-management")}>{t("admin.viewTechnicians")}</button>
        </div>
        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="font-semibold text-lg mb-2">{t("admin.inventoryStatus")}</h2>
          <div className="text-3xl font-bold">{inventory.length}</div>
          <button className="mt-3 text-indigo-600 hover:underline" onClick={() => navigate("/inventory")}>{t("admin.viewInventory")}</button>
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
