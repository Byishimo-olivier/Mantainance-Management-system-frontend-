import React, { useEffect, useState } from "react";
import axios from "axios";

// AFTER EVIDENCE FORM WITH COMPLETION DETAILS
function AfterEvidenceForm({ issueId, onSuccess }) {
  const [afterImage, setAfterImage] = React.useState(null);
  const [completionDetails, setCompletionDetails] = React.useState("");
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
    formData.append("address", completionDetails); // Add completion details
    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        `http://localhost:5000/api/issues/${issueId}/evidence/after`,
        formData,
        { headers: { Authorization: `Bearer ${token}`, "Content-Type": "multipart/form-data" } }
      );
      setAfterImage(null);
      setCompletionDetails("");
      if (onSuccess) onSuccess();
      alert("AFTER evidence submitted. Status set to Complete.");
      console.log("AFTER evidence response:", response.data);
    } catch (err) {
      console.error("AFTER evidence error:", err.response?.data || err.message);
      alert(`Failed to upload AFTER evidence: ${err.response?.data?.error || err.message}`);
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
      <div className="mb-4">
        <label className="block text-gray-700 mb-1">Completion Details</label>
        <textarea
          className="w-full border rounded px-3 py-2"
          rows="3"
          value={completionDetails}
          onChange={(e) => setCompletionDetails(e.target.value)}
          placeholder="Describe how you completed this work..."
          required
        />
      </div>
      <button
        type="submit"
        className="bg-green-600 text-white px-6 py-2 rounded font-semibold hover:bg-green-700"
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
  const [showAfterForm, setShowAfterForm] = useState({});
  const [selectedJob, setSelectedJob] = useState(null);
  const handleAfterSuccess = (jobId) => {
    setShowAfterForm((prev) => ({ ...prev, [jobId]: false }));
    // Refresh jobs to show new status
    const userStr = localStorage.getItem("user");
    if (userStr) {
      const u = JSON.parse(userStr);
      const token = localStorage.getItem("token");
      const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
      axios.get(`http://localhost:5000/api/issues/assigned/${u._id || u.id}`, config)
        .then(res => setJobs(res.data));
    }
  };

  const handleStartWork = async (jobId) => {
    try {
      const token = localStorage.getItem("token");
      const config = { headers: { Authorization: `Bearer ${token}` } };
      
      // Change status to IN PROGRESS
      await axios.put(`http://localhost:5000/api/issues/${jobId}`, {
        status: 'IN PROGRESS'
      }, config);
      
      // Refresh jobs to show new status
      const userStr = localStorage.getItem("user");
      if (userStr) {
        const u = JSON.parse(userStr);
        const token = localStorage.getItem("token");
        const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
        axios.get(`http://localhost:5000/api/issues/assigned/${u._id || u.id}`, config)
          .then(res => setJobs(res.data));
      }
      
      alert('Work started! Status set to In Progress.');
    } catch (error) {
      console.error("Start work error:", error);
      alert('Failed to start work');
    }
  };

  const toggleAfterForm = (jobId) => {
    setShowAfterForm((prev) => ({ ...prev, [jobId]: !prev[jobId] }));
  };

  const handleViewJob = (job) => {
    console.log('Viewing job:', job); // Debug log to see all fields
    setSelectedJob(job);
  };

  const isOverdue = (dueDate) => {
    if (!dueDate) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Set to start of day
    const due = new Date(dueDate);
    return due < today;
  };

  const getJobStatus = (job) => {
    // Check if job is overdue first
    if (isOverdue(job.dueDate)) {
      return 'OVERDUE';
    }
    return job.status || 'PENDING';
  };

  const handleImageClick = (imageSrc, title) => {
    // Open image in new tab for larger view
    window.open(`http://localhost:5000${imageSrc}`, '_blank');
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
                  {/* BEFORE Photo Display */}
                  {(job.beforePhoto || job.photo || job.image) ? (
                    <div className="flex-shrink-0 w-full md:w-24 flex items-center justify-center mb-3 md:mb-0">
                      <img
                        src={`http://localhost:5000${job.beforePhoto || job.photo || job.image}`}
                        alt="Issue"
                        className="w-20 h-20 object-cover rounded-lg shadow border cursor-pointer hover:opacity-80 transition"
                        onClick={() => handleImageClick(job.beforePhoto || job.photo || job.image, job.title)}
                        title="Click to view larger image"
                      />
                    </div>
                  ) : null}
                  <div className="flex-1">
                    <span className="font-semibold">{job.title}</span> 
                    <span className="text-xs text-gray-400 ml-2">
                      ({(getJobStatus(job) === 'COMPLETE' || getJobStatus(job) === 'COMPLETED') ? 'Complete' : getJobStatus(job)})
                    </span>
                    <span className="text-xs text-gray-400 ml-2">
                      Priority: {job.priority || 'MEDIUM'}
                    </span>
                    {job.dueDate && (
                      <span className="text-xs text-gray-400 ml-2">
                        Due: {new Date(job.dueDate).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                  <div className="flex gap-2 mt-2 md:mt-0">
                    <button
                      onClick={() => handleViewJob(job)}
                      className="px-2 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600"
                    >
                      View
                    </button>
                    {/* START WORK BUTTON - Only for PENDING issues */}
                    {getJobStatus(job) === 'PENDING' && (
                      <button
                        className="px-2 py-1 bg-orange-500 text-white text-xs rounded hover:bg-orange-600"
                        onClick={() => handleStartWork(job.id || job._id)}
                      >
                        Start Work
                      </button>
                    )}
                    {/* COMPLETE WORK BUTTON - Only for IN PROGRESS issues */}
                    {getJobStatus(job) === 'IN PROGRESS' && (
                      <button
                        className="px-2 py-1 bg-green-500 text-white text-xs rounded hover:bg-green-600"
                        onClick={() => toggleAfterForm(job.id || job._id)}
                      >
                        {showAfterForm[job.id || job._id] ? 'Cancel' : 'Complete Work'}
                      </button>
                    )}
                  </div>
                </div>
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
      
      {/* Issue Details Modal - View Only */}
      {selectedJob && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-xl font-bold">Issue Details</h2>
                <button
                  onClick={() => setSelectedJob(null)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>
              
              {/* View Mode Only */}
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-gray-700">Title</h3>
                  <p className="text-gray-900">{selectedJob.title}</p>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-700">Description</h3>
                  <p className="text-gray-900">{selectedJob.description}</p>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-700">Location</h3>
                  <p className="text-gray-900">{selectedJob.location}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="font-semibold text-gray-700">Status</h3>
                    <span className={`inline-block px-2 py-1 rounded text-xs font-semibold ${
                      getJobStatus(selectedJob) === 'IN PROGRESS' ? 'bg-blue-100 text-blue-700' :
                      getJobStatus(selectedJob) === 'PENDING' ? 'bg-yellow-100 text-yellow-700' :
                      (getJobStatus(selectedJob) === 'COMPLETE' || getJobStatus(selectedJob) === 'COMPLETED') ? 'bg-green-100 text-green-700' :
                      getJobStatus(selectedJob) === 'OVERDUE' ? 'bg-red-100 text-red-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {(getJobStatus(selectedJob) === 'COMPLETE' || getJobStatus(selectedJob) === 'COMPLETED') ? 'Complete' : getJobStatus(selectedJob)?.replace('_', ' ') || 'Pending'}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-700">Priority</h3>
                    <span className={`inline-block px-2 py-1 rounded text-xs font-semibold ${
                      selectedJob.priority === 'HIGH' ? 'bg-red-100 text-red-700' :
                      selectedJob.priority === 'MEDIUM' ? 'bg-yellow-100 text-yellow-700' :
                      selectedJob.priority === 'LOW' ? 'bg-gray-100 text-gray-700' :
                      'bg-purple-100 text-purple-700'
                    }`}>
                      {selectedJob.priority || 'MEDIUM'}
                    </span>
                  </div>
                </div>
                
                {/* Evidence Display */}
                <div className="border-t pt-4">
                  <h3 className="font-semibold text-gray-700 mb-2">Evidence</h3>
                  <div className="space-y-3">
                    {/* BEFORE Photo - Always show in evidence section */}
                    {(selectedJob.beforePhoto || selectedJob.photo || selectedJob.image) && (
                      <div>
                        <h4 className="text-sm font-medium text-gray-600">Before (Client Photo)</h4>
                        <img 
                          src={`http://localhost:5000${selectedJob.beforePhoto || selectedJob.photo || selectedJob.image}`} 
                          alt="Before" 
                          className="w-32 h-32 object-cover rounded border cursor-pointer hover:opacity-80 transition"
                          onClick={() => handleImageClick(selectedJob.beforePhoto || selectedJob.photo || selectedJob.image, selectedJob.title)}
                          title="Click to view larger image"
                        />
                      </div>
                    )}
                    {selectedJob.evidence?.afterImage && (
                      <div>
                        <h4 className="text-sm font-medium text-gray-600">After</h4>
                        <img 
                          src={`http://localhost:5000${selectedJob.evidence.afterImage}`} 
                          alt="After" 
                          className="w-32 h-32 object-cover rounded border cursor-pointer hover:opacity-80 transition"
                          onClick={() => handleImageClick(selectedJob.evidence.afterImage, `${selectedJob.title} - After`)}
                          title="Click to view larger image"
                        />
                      </div>
                    )}
                    {selectedJob.evidence?.address && (
                      <div>
                        <h4 className="text-sm font-medium text-gray-600">Completion Details</h4>
                        <p className="text-sm text-gray-900">{selectedJob.evidence.address}</p>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex gap-2 pt-4">
                  <button
                    onClick={() => setSelectedJob(null)}
                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TechnicianDashboard;
