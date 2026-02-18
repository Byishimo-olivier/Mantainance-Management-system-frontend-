import React from 'react';

const AssetDetails = ({ asset }) => {
  if (!asset) return <p>Loading asset details...</p>;

  return (
    <div className="asset-details">
      <h2>Asset Details</h2>
      <p><strong>Name:</strong> {asset.name}</p>
      <p><strong>Type:</strong> {asset.assetType}</p>
      <p><strong>Location:</strong> {asset.location}</p>
      <p><strong>GPS Coordinates:</strong> {asset.gps?.latitude}, {asset.gps?.longitude}</p>
      <p><strong>Purchase Cost:</strong> ${asset.purchaseCost}</p>
      <p><strong>Current Value:</strong> ${asset.currentValue}</p>
      <p><strong>Depreciation Rate:</strong> {asset.depreciationRate}%</p>
      <p><strong>Warranty:</strong> {asset.warranty}</p>
      <p><strong>Vendor:</strong> {asset.vendor}</p>
      <p><strong>Status:</strong> {asset.status}</p>
      <p><strong>Serial Number:</strong> {asset.serialNumber}</p>
      <p><strong>Documents:</strong></p>
      <ul>
        {asset.documents?.map((doc, index) => (
          <li key={index}><a href={doc.url} target="_blank" rel="noopener noreferrer">{doc.name}</a></li>
        ))}
      </ul>
    </div>
  );
};

export default AssetDetails;