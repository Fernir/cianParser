import React from 'react';
import './ApartmentAmenities.css';

const ApartmentAmenities = ({ amenities }) => {
  if (!amenities || amenities.length === 0) return null;

  const icons = {
    'wifi': '📶',
    'tv': '📺',
    'fridge': '🧊',
    'washer': '🧺',
    'conditioner': '❄️',
    'dishwasher': '🍽️',
    'internet': '🌐',
    'balcony': '🏞️',
  };

  return (
    <div className="amenities-block">
      <h3>Удобства</h3>
      <div className="amenities-grid">
        {amenities.map((item, index) => (
          <div key={index} className="amenity-item">
            <span className="amenity-icon">{icons[item.toLowerCase()] || '✓'}</span>
            <span className="amenity-name">{item}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ApartmentAmenities;