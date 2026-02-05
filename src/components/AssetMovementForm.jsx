import React, { useState } from 'react';

const AssetMovementForm = ({ onSubmit }) => {
  const [location, setLocation] = useState('');
  const [gps, setGps] = useState({ latitude: '', longitude: '' });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ location, gps });
    setLocation('');
    setGps({ latitude: '', longitude: '' });
  };

  return (
    <form onSubmit={handleSubmit} className="asset-movement-form">
      <h2>Move Asset</h2>
      <div>
        <label>New Location:</label>
        <input
          type="text"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder="Enter new location"
          required
        />
      </div>
      <div>
        <label>GPS Coordinates:</label>
        <input
          type="text"
          value={gps.latitude}
          onChange={(e) => setGps({ ...gps, latitude: e.target.value })}
          placeholder="Latitude"
          required
        />
        <input
          type="text"
          value={gps.longitude}
          onChange={(e) => setGps({ ...gps, longitude: e.target.value })}
          placeholder="Longitude"
          required
        />
      </div>
      <button type="submit">Submit</button>
    </form>
  );
};

export default AssetMovementForm;
