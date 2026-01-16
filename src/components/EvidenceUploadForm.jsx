import React, { useState } from "react";
import axios from "axios";

const EvidenceUploadForm = ({ issueId, onSuccess }) => {
  const [beforeImage, setBeforeImage] = useState(null);
  const [afterImage, setAfterImage] = useState(null);
  const [address, setAddress] = useState("");
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e, setter) => {
    if (e.target.files && e.target.files[0]) {
      setter(e.target.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData();
    formData.append("address", address);
    if (beforeImage) formData.append("beforeImage", beforeImage);
    if (afterImage) formData.append("afterImage", afterImage);
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `http://localhost:5000/api/issues/${issueId}/evidence`,
        formData,
        { headers: { Authorization: `Bearer ${token}`, "Content-Type": "multipart/form-data" } }
      );
      setAddress("");
      setBeforeImage(null);
      setAfterImage(null);
      if (onSuccess) onSuccess();
      alert("Evidence uploaded successfully!");
    } catch (err) {
      alert("Failed to upload evidence");
    }
    setLoading(false);
  };

  return (
    <form className="bg-white rounded-xl shadow p-6 max-w-lg mx-auto" onSubmit={handleSubmit}>
      <h2 className="font-semibold text-lg mb-4">Address Issue & Upload Evidence</h2>
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
        <input type="file" accept="image/*" onChange={e => handleFileChange(e, setBeforeImage)} required />
      </div>
      <div className="mb-4">
        <label className="block text-gray-700 mb-1">Upload AFTER image</label>
        <input type="file" accept="image/*" onChange={e => handleFileChange(e, setAfterImage)} required />
      </div>
      <button
        type="submit"
        className="bg-indigo-600 text-white px-6 py-2 rounded font-semibold hover:bg-indigo-700"
        disabled={loading}
      >
        {loading ? "Uploading..." : "Submit Evidence"}
      </button>
    </form>
  );
};

export default EvidenceUploadForm;
