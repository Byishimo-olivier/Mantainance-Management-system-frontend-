import React from 'react';
import { GoogleMap, Marker, useLoadScript } from '@react-google-maps/api';

const mapContainerStyle = {
  width: '100%',
  height: '400px',
};

const center = {
  lat: 0,
  lng: 0,
};

const AssetMapView = ({ assets }) => {
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY,
  });

  if (loadError) return <p>Error loading maps</p>;
  if (!isLoaded) return <p>Loading maps...</p>;

  return (
    <div className="asset-map-view">
      <h2>Asset Map View</h2>
      <GoogleMap mapContainerStyle={mapContainerStyle} zoom={2} center={center}>
        {assets.map((asset) => (
          <Marker
            key={asset.id}
            position={{ lat: asset.gps.latitude, lng: asset.gps.longitude }}
            title={asset.name}
          />
        ))}
      </GoogleMap>
    </div>
  );
};

export default AssetMapView;
