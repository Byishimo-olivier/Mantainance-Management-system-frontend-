import React, { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import api from "../api/axios";

const getStringValue = (value, fallback = "") => {
  if (typeof value === "string") return value;
  if (value && typeof value === "object") {
    return value.name || value.title || value.email || value.id || fallback;
  }
  return fallback;
};

export default function Feedback() {
  const [searchParams] = useSearchParams();
  const issueId = searchParams.get("issueId") || "";
  const [issue, setIssue] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    email: "",
    rating: 0,
    message: "",
  });

  useEffect(() => {
    let isActive = true;

    const loadIssue = async () => {
      if (!issueId) {
        setLoading(false);
        return;
      }
      try {
        const res = await api.get(`/api/issues/${issueId}`);
        if (!isActive) return;
        setIssue(res?.data || null);
      } catch (err) {
        if (!isActive) return;
        setIssue(null);
      } finally {
        if (isActive) setLoading(false);
      }
    };

    loadIssue();
    return () => {
      isActive = false;
    };
  }, [issueId]);

  const title = useMemo(() => {
    return issue?.title || issue?.name || "Work Order";
  }, [issue]);

  const canSubmit = Boolean(issueId && form.email.trim() && form.message.trim() && form.rating > 0 && !submitting);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!canSubmit) return;

    setSubmitting(true);
    try {
      const technicianId = getStringValue(issue?.assignedTo) || getStringValue(issue?.assignedTechnician) || "unassigned";
      const technicianName =
        getStringValue(issue?.assignedToName) ||
        getStringValue(issue?.assignedTo) ||
        getStringValue(issue?.assignedTechnicianName) ||
        "Technician";
      const clientId = getStringValue(issue?.userId) || getStringValue(issue?.requestorId) || form.email.trim().toLowerCase();
      const clientName = form.email.trim();
      const message = `Rating: ${form.rating}/5\nEmail: ${form.email.trim()}\n\n${form.message.trim()}`;

      await api.post("/api/feedback", {
        issueId,
        technicianId,
        clientId,
        technicianName,
        clientName,
        issueTitle: title,
        message,
      });

      setSubmitted(true);
      alert("Feedback submitted successfully.");
    } catch (err) {
      alert(err?.response?.data?.error || err?.response?.data?.message || err?.message || "Failed to submit feedback.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 px-4 py-10">
      <div className="mx-auto max-w-[540px] rounded-[28px] border border-slate-200 bg-white px-8 py-10 shadow-xl">
        {loading ? (
          <div className="py-20 text-center text-gray-500">Loading feedback form...</div>
        ) : !issueId || !issue ? (
          <div className="py-12 text-center">
            <h1 className="text-3xl font-bold text-slate-900">Feedback Form</h1>
            <p className="mt-4 text-base text-gray-500">This feedback link is invalid or the work order was not found.</p>
          </div>
        ) : submitted ? (
          <div className="py-12 text-center">
            <h1 className="text-3xl font-bold text-slate-900">Thank you</h1>
            <p className="mt-4 text-base text-gray-600">Your feedback for this work order has been saved.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="text-center">
              <h1 className="text-[22px] font-bold text-slate-900">We&apos;d love your feedback!</h1>
              <p className="mt-6 text-[18px] text-slate-800">How did we do on the job?</p>
              <p className="mt-5 text-[16px] text-gray-500">{title}</p>
            </div>

            <div className="mt-8 flex items-center justify-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setForm((prev) => ({ ...prev, rating: star }))}
                  className={`text-[42px] leading-none ${star <= form.rating ? "text-amber-400" : "text-slate-300"}`}
                  aria-label={`Rate ${star} stars`}
                >
                  ★
                </button>
              ))}
            </div>

            <div className="mt-8 space-y-5">
              <input
                type="email"
                value={form.email}
                onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
                placeholder="Your email"
                className="w-full rounded-xl border border-slate-300 px-4 py-3 text-[16px] outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />

              <textarea
                value={form.message}
                onChange={(event) => setForm((prev) => ({ ...prev, message: event.target.value }))}
                placeholder="Tell us what you thought..."
                rows={6}
                className="w-full rounded-xl border border-slate-300 px-4 py-3 text-[16px] outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <div className="mt-6 flex justify-end">
              <button
                type="submit"
                disabled={!canSubmit}
                className="rounded-xl bg-slate-900 px-6 py-3 text-[16px] font-semibold text-white disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-500"
              >
                {submitting ? "Submitting..." : "Submit"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
