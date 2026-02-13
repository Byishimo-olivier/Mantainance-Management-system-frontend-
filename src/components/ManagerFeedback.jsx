import React, { useEffect, useState } from "react";
import api from "../api/axios";
import { getImageUrl } from '../utils/imageUrl';
import { useNavigate } from "react-router-dom";

export default function ManagerFeedback() {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }
    // Auth handled by interceptor
    async function fetchFeedbacks() {
      try {
        // Fetch all issues for the manager's company
        const res = await api.get("/api/issues");
        // Only show issues that have after evidence (completion details or afterImage)
        const feedbackIssues = (res.data || []).filter(issue => issue.status === 'COMPLETE' || issue.status === 'OVERDUE' || issue.afterImage || issue.address);
        setFeedbacks(feedbackIssues);
      } catch (err) {
        setFeedbacks([]);
      } finally {
        setLoading(false);
      }
    }
    fetchFeedbacks();
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 md:px-8">
      <div className="max-w-3xl mx-auto bg-white rounded-3xl shadow-lg p-8 border border-gray-100">
        <button
          className="mb-4 flex items-center gap-2 text-indigo-600 hover:text-indigo-800 font-semibold"
          onClick={() => navigate("/manager-dashboard")}
        >
          <svg width="22" height="22" fill="none" viewBox="0 0 24 24"><path d="M15 19l-7-7 7-7" stroke="#6366f1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
          Back to Dashboard
        </button>
        <h1 className="text-2xl md:text-3xl font-extrabold text-indigo-700 mb-6 flex items-center gap-2">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none"><path d="M2 12a10 10 0 1 0 20 0A10 10 0 0 0 2 12Zm6-1 2 2 4-4" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
          Technician Feedback
        </h1>
        {loading ? (
          <div className="text-gray-400 text-center py-8">Loading feedback...</div>
        ) : feedbacks.length === 0 ? (
          <div className="text-gray-400 text-center py-8">No feedback from technicians yet.</div>
        ) : (
          <ul className="space-y-6">
            {feedbacks.map((fb, idx) => (
              <li key={fb.id || idx} className="bg-gradient-to-r from-green-50 via-white to-gray-50 rounded-2xl p-6 shadow border border-green-100">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-lg font-semibold text-green-700">{fb.assignees && fb.assignees.length > 0 ? (fb.assignees[0].name || "Technician") : "Technician"}</span>
                  <span className="text-xs bg-green-100 text-green-700 rounded px-2 py-1 font-medium">{fb.updatedAt ? new Date(fb.updatedAt).toLocaleDateString() : ""}</span>
                </div>
                {getImageUrl(fb.afterImage) && (
                  <img
                    src={getImageUrl(fb.afterImage)}
                    alt="After evidence"
                    className="w-32 h-32 object-cover rounded mb-2 border"
                  />
                )}
                <div className="text-gray-700 text-base">
                  {fb.address ? fb.address : <span className="italic text-gray-400">No completion details provided.</span>}
                </div>
                <div className="text-xs text-gray-400 mt-2">Related Issue: {fb.title || fb._id || fb.id}</div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
