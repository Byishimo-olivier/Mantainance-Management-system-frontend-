import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import backgroundVideo from "../assets/136906-765457769_small.mp4";
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
    <div className="glass-theme-blue min-h-screen text-white overflow-hidden relative" style={{ fontFamily: "'DM Sans', 'Segoe UI', system-ui, sans-serif" }}>
      <div className="video-background-container">
        <video autoPlay loop muted playsInline className="video-background text-transparent">
          <source src={backgroundVideo} type="video/mp4" />
        </video>
      </div>
      <div className="relative z-10 min-h-screen p-8 overflow-y-auto">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-10">
          <h1 className="text-4xl font-black tracking-tight">{t("admin.title")}</h1>
          <div className="flex items-center gap-3 glass-surface px-4 py-2 rounded-full border border-white/20">
            <span className="text-xs font-bold text-white/60 uppercase tracking-widest">{t("language.label")}</span>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="bg-transparent text-sm font-bold text-white focus:outline-none appearance-none cursor-pointer"
            >
              <option value="en" className="text-slate-900">{t("language.english")}</option>
              <option value="fr" className="text-slate-900">{t("language.french")}</option>
              <option value="rw" className="text-slate-900">{t("language.kinyarwanda")}</option>
            </select>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          <div className="glass-surface-strong rounded-3xl p-8 border border-white/20 shadow-2xl transition-all hover:scale-[1.02] group">
            <h2 className="font-extrabold text-white/70 uppercase tracking-widest text-sm mb-3">{t("admin.activeJobs")}</h2>
            <div className="text-6xl font-black text-white tracking-tighter mb-6">{jobs.length}</div>
            <button className="flex items-center gap-2 text-blue-300 font-bold hover:text-blue-200 transition-colors uppercase text-xs tracking-widest" onClick={() => navigate("/manager-issues")}>
              {t("admin.viewAllJobs")} →
            </button>
          </div>
          <div className="glass-surface-strong rounded-3xl p-8 border border-white/20 shadow-2xl transition-all hover:scale-[1.02] group">
            <h2 className="font-extrabold text-white/70 uppercase tracking-widest text-sm mb-3">{t("admin.technicianPerformance")}</h2>
            <div className="text-6xl font-black text-white tracking-tighter mb-6">{technicians.length}</div>
            <button className="flex items-center gap-2 text-blue-300 font-bold hover:text-blue-200 transition-colors uppercase text-xs tracking-widest" onClick={() => navigate("/technician-management")}>
              {t("admin.viewTechnicians")} →
            </button>
          </div>
          <div className="glass-surface-strong rounded-3xl p-8 border border-white/20 shadow-2xl transition-all hover:scale-[1.02] group">
            <h2 className="font-extrabold text-white/70 uppercase tracking-widest text-sm mb-3">{t("admin.inventoryStatus")}</h2>
            <div className="text-6xl font-black text-white tracking-tighter mb-6">{inventory.length}</div>
            <button className="flex items-center gap-2 text-blue-300 font-bold hover:text-blue-200 transition-colors uppercase text-xs tracking-widest" onClick={() => navigate("/inventory")}>
              {t("admin.viewInventory")} →
            </button>
          </div>
          <div className="glass-surface-strong rounded-3xl p-8 border border-white/20 shadow-2xl transition-all hover:scale-[1.02] group">
            <h2 className="font-extrabold text-white/70 uppercase tracking-widest text-sm mb-3">Financial Summary</h2>
            <div className="space-y-3 mb-6">
              <div className="flex justify-between items-center text-sm">
                <span className="text-white/60">Expenses</span>
                <span className="font-black text-rose-300">{finances.expenses} RWF</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-white/60">Income</span>
                <span className="font-black text-emerald-300">{finances.income} RWF</span>
              </div>
              <div className="pt-3 border-t border-white/10 flex justify-between items-center">
                <span className="text-white font-bold">Profit</span>
                <span className="text-2xl font-black text-blue-300">{finances.profit} RWF</span>
              </div>
            </div>
            <button className="flex items-center gap-2 text-blue-300 font-bold hover:text-blue-200 transition-colors uppercase text-xs tracking-widest" onClick={() => navigate("/finances")}>View Financials →</button>
          </div>
          <div className="glass-surface-strong rounded-3xl p-8 border border-white/20 shadow-2xl transition-all hover:scale-[1.02] group">
            <h2 className="font-extrabold text-white/70 uppercase tracking-widest text-sm mb-3">Subscription Revenue</h2>
            <div className="text-6xl font-black text-white tracking-tighter mb-6">{subscriptions.length}</div>
            <button className="flex items-center gap-2 text-blue-300 font-bold hover:text-blue-200 transition-colors uppercase text-xs tracking-widest" onClick={() => navigate("/subscriptions")}>View Subscriptions →</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
