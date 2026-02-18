import React from 'react';

const SparePartsList = ({ spareParts }) => {
  if (!spareParts || spareParts.length === 0) {
    return <p>No spare parts available for this asset.</p>;
  }

  return (
    <div className="spare-parts-list">
      <h2>Spare Parts</h2>
      <ul>
        {spareParts.map((part, index) => (
          <li key={index}>
            <p><strong>Name:</strong> {part.name}</p>
            <p><strong>Quantity:</strong> {part.quantity}</p>
            <p><strong>Cost:</strong> ${part.cost}</p>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default SparePartsList;