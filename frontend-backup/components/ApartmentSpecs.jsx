import React from 'react';
import './ApartmentSpecs.css';

const ApartmentSpecs = ({ apartment }) => {
  const specs = [
    { label: 'Комнат', value: apartment.rooms_count, icon: '🛏️' },
    { label: 'Общая площадь', value: apartment.total_meters ? `${apartment.total_meters} м²` : null, icon: '📐' },
    { label: 'Жилая площадь', value: apartment.living_meters ? `${apartment.living_meters} м²` : null, icon: '🛋️' },
    { label: 'Кухня', value: apartment.kitchen_meters ? `${apartment.kitchen_meters} м²` : null, icon: '🍳' },
    { label: 'Этаж', value: apartment.floor ? `${apartment.floor}/${apartment.floors_count}` : null, icon: '🏢' },
    { label: 'Спален', value: apartment.bedrooms_count, icon: '🛏️' },
  ].filter(s => s.value);

  return (
    <div className="specs-grid">
      {specs.map((spec, index) => (
        <div key={index} className="spec-card">
          <span className="spec-icon">{spec.icon}</span>
          <div className="spec-info">
            <span className="spec-label">{spec.label}</span>
            <span className="spec-value">{spec.value}</span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ApartmentSpecs;