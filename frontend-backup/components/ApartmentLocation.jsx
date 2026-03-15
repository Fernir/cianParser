import React from 'react';
import './ApartmentLocation.css';

const ApartmentLocation = ({ apartment }) => {
  const address = [
    apartment.district,
    apartment.street,
    apartment.house_number
  ].filter(Boolean).join(', ');

  return (
    <div className="location-block">
      {address && (
        <div className="address-line">
          <span className="location-icon">📍</span>
          <span>{address}</span>
        </div>
      )}
      
      {apartment.underground && (
        <div className="metro-line">
          <span className="location-icon">🚇</span>
          <span>
            {apartment.underground}
            {apartment.underground_time && ` · ${apartment.underground_time}`}
          </span>
        </div>
      )}
    </div>
  );
};

export default ApartmentLocation;