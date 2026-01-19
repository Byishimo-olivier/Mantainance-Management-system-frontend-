import React, { useEffect, useState } from "react";
import axios from "axios";
// EvidenceUploadForm replaced by inline forms below

// BEFORE EVIDENCE FORM
function BeforeEvidenceForm({ issueId, onSuccess }) {
  const [beforeImage, setBeforeImage] = React.useState(null);
  const [address, setAddress] = React.useState("");
  const [completionDate, setCompletionDate] = React.useState(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });
  const [completionTime, setCompletionTime] = React.useState(() => {
    const now = new Date();
    return now.toTimeString().slice(0,5); // 'HH:MM'
  });
  const [loading, setLoading] = React.useState(false);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setBeforeImage(e.target.files[0]);
    }
  };

  const handleDateChange = (e) => {
    setCompletionDate(e.target.value);
  };

  const handleTimeChange = (e) => {
    setCompletionTime(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData();
    formData.append("address", address);
    if (beforeImage) formData.append("beforeImage", beforeImage);
    if (completionDate) formData.append("completionDate", completionDate);
    if (completionTime) formData.append("completionTime", completionTime);
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `http://localhost:5000/api/issues/${issueId}/evidence/before`,
        formData,
        { headers: { Authorization: `Bearer ${token}`, "Content-Type": "multipart/form-data" } }
      );
      setAddress("");
      // removed setFixTime
      setBeforeImage(null);
      setCompletionDate(new Date().toISOString().split('T')[0]);
      setCompletionTime(new Date().toTimeString().slice(0,5));
      if (onSuccess) onSuccess();
      alert("BEFORE evidence submitted. Status set to In Progress.");
    } catch (err) {
      alert("Failed to upload BEFORE evidence");
    }
    setLoading(false);
  };

  return (
    <form className="bg-white rounded-xl shadow p-6 max-w-lg mx-auto" onSubmit={handleSubmit}>
      <h2 className="font-semibold text-lg mb-4">Address Issue & Upload BEFORE Evidence</h2>
      <div className="mb-4">
        <label className="block text-gray-700 mb-1">How did you address the issue?</label>
        <textarea
          className="w-full border rounded px-3 py-2"
          value={address}
          onChange={e => setAddress(e.target.value)}
          required
        />
      </div>
      <div className="mb-4">
        <label className="block text-gray-700 mb-1">Upload BEFORE image</label>
        <input type="file" accept="image/*" onChange={handleFileChange} required />
      </div>
      <div className="mb-4">
        <label className="block text-gray-700 mb-1">Estimated Completion Date</label>
        <input type="date" className="w-full border rounded px-3 py-2" value={completionDate} onChange={handleDateChange} required />
      </div>
      <div className="mb-4">
        <label className="block text-gray-700 mb-1">Estimated Completion Time</label>
        <input type="time" className="w-full border rounded px-3 py-2" value={completionTime} onChange={handleTimeChange} required />
      </div>
      <button
        type="submit"
        className="bg-indigo-600 text-white px-6 py-2 rounded font-semibold hover:bg-indigo-700"
        disabled={loading}
      >
        {loading ? "Uploading..." : "Submit BEFORE Evidence"}
      </button>
    </form>
  );
}

function AfterEvidenceForm({ issueId, onSuccess }) {
  const [afterImage, setAfterImage] = React.useState(null);
  const [loading, setLoading] = React.useState(false);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setAfterImage(e.target.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData();
    if (afterImage) formData.append("afterImage", afterImage);
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `http://localhost:5000/api/issues/${issueId}/evidence/after`,
        formData,
        { headers: { Authorization: `Bearer ${token}`, "Content-Type": "multipart/form-data" } }
      );
      setAfterImage(null);
      if (onSuccess) onSuccess();
      alert("AFTER evidence submitted. Status set to Complete.");
    } catch (err) {
      alert("Failed to upload AFTER evidence");
    }
    setLoading(false);
  };

  return (
    <form className="bg-white rounded-xl shadow p-6 max-w-lg mx-auto" onSubmit={handleSubmit}>
      <h2 className="font-semibold text-lg mb-4">Upload AFTER Evidence</h2>
      <div className="mb-4">
        <label className="block text-gray-700 mb-1">Upload AFTER image</label>
        <input type="file" accept="image/*" onChange={handleFileChange} required />
      </div>
      <button
        type="submit"
        className="bg-green-600 text-white px-6 py-2 rounded font-semibold hover:bg-green-700"
        // AFTER EVIDENCE FORM
        disabled={loading}
      >
        {loading ? "Uploading..." : "Submit AFTER Evidence"}
      </button>
    </form>
  );
}

const TechnicianDashboard = () => {
  const [jobs, setJobs] = useState([]);
  const [materialRequests, setMaterialRequests] = useState([]);
  const [user, setUser] = useState({ name: "", id: "" });
  const [showBeforeForm, setShowBeforeForm] = useState({});
  const [showAfterForm, setShowAfterForm] = useState({});
  const handleBeforeSuccess = (jobId) => {
    setShowBeforeForm((prev) => ({ ...prev, [jobId]: false }));
    // Optionally refresh jobs/status here
  };

  const handleAfterSuccess = (jobId) => {
    setShowAfterForm((prev) => ({ ...prev, [jobId]: false }));
    // Optionally refresh jobs/status here
  };

  const toggleBeforeForm = (jobId) => {
    setShowBeforeForm((prev) => ({ ...prev, [jobId]: !prev[jobId] }));
  };

  const toggleAfterForm = (jobId) => {
    setShowAfterForm((prev) => ({ ...prev, [jobId]: !prev[jobId] }));
  };

  useEffect(() => {
    const userStr = localStorage.getItem("user");
    if (userStr) {
      const u = JSON.parse(userStr);
      setUser(u);
      const token = localStorage.getItem("token");
      const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
      axios.get(`http://localhost:5000/api/issues/assigned/${u._id || u.id}`, config)
        .then(res => setJobs(res.data));
      axios.get(`http://localhost:5000/api/material-requests/tech/${u._id || u.id}`, config)
        .then(res => setMaterialRequests(res.data));
    }
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <h1 className="text-2xl font-bold mb-6">Technician Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="font-semibold text-lg mb-2">Assigned Jobs</h2>
          <div className="text-3xl font-bold">{jobs.length}</div>
          <ul className="mt-3 text-sm">
            {jobs.map(job => (
              <li key={job.id || job._id} className="mb-4 border-b pb-2">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                  <div>
                    <span className="font-semibold">{job.title}</span> <span className="text-xs text-gray-400">({(job.status === 'COMPLETE' || job.status === 'COMPLETED') ? 'Complete' : (job.status || 'Pending')})</span>
                  </div>
                  {/* BEFORE FORM BUTTON */}
                  {(!job.status || job.status.toUpperCase() === 'PENDING') && (
                    <button
                      className="mt-2 md:mt-0 bg-indigo-500 text-white px-3 py-1 rounded text-xs hover:bg-indigo-600"
                      onClick={() => toggleBeforeForm(job.id || job._id)}
                    >
                      {showBeforeForm[job.id || job._id] ? 'Cancel' : 'Submit BEFORE Evidence'}
                    </button>
                  )}
                  {/* AFTER FORM BUTTON */}
                  {job.status && job.status.toUpperCase() === 'IN PROGRESS' && (
                    <button
                      className="mt-2 md:mt-0 bg-green-500 text-white px-3 py-1 rounded text-xs hover:bg-green-600"
                      onClick={() => toggleAfterForm(job.id || job._id)}
                    >
                      {showAfterForm[job.id || job._id] ? 'Cancel' : 'Submit AFTER Evidence'}
                    </button>
                  )}
                </div>
                {/* BEFORE FORM */}
                {showBeforeForm[job.id || job._id] && (
                  <div className="mt-3">
                    <BeforeEvidenceForm
                      issueId={job.id || job._id}
                      onSuccess={() => handleBeforeSuccess(job.id || job._id)}
                    />
                  </div>
                )}
                {/* AFTER FORM */}
                {showAfterForm[job.id || job._id] && (
                  <div className="mt-3">
                    <AfterEvidenceForm
                      issueId={job.id || job._id}
                      onSuccess={() => handleAfterSuccess(job.id || job._id)}
                    />
                  </div>
                )}
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="font-semibold text-lg mb-2">Material Requests</h2>
          <div className="text-3xl font-bold">{materialRequests.length}</div>
          <ul className="mt-3 text-sm">
            {materialRequests.slice(0, 5).map(req => (
              <li key={req.id} className="mb-1">{req.status} - {req.requestId}</li>
            ))}
          </ul>
        </div>
      </div>
      <div className="bg-white rounded-xl shadow p-6 mb-8">
        <h2 className="font-semibold text-lg mb-2">Work History</h2>
        <ul className="text-sm">
          {jobs.slice(0, 10).map(job => (
            <li key={job.id || job._id} className="mb-1">{job.title} - {(job.status === 'COMPLETE' || job.status === 'COMPLETED') ? 'Complete' : (job.status || 'Pending')}</li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default TechnicianDashboard;
