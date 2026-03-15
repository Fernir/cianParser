import React from 'react';
import './ApartmentMeta.css';

const ApartmentMeta = ({ apartment }) => {
  const formatDate = (date) => {
    if (!date) return '—';
    return new Date(date).toLocaleDateString('ru-RU');
  };

  return (
    <div className="meta-block">
      <div className="meta-item">
        <span className="meta-label">ID:</span>
        <span className="meta-value">{apartment.cian_id || apartment.id}</span>
      </div>
      <div className="meta-item">
        <span className="meta-label">Опубликовано:</span>
        <span className="meta-value">{formatDate(apartment.published_date)}</span>
      </div>
      <div className="meta-item">
        <span className="meta-label">Обновлено:</span>
        <span className="meta-value">{formatDate(apartment.last_check_date)}</span>
      </div>
      {apartment.views_count > 0 && (
        <div className="meta-item">
          <span className="meta-label">Просмотров:</span>
          <span className="meta-value">{apartment.views_count}</span>
        </div>
      )}
    </div>
  );
};

export default ApartmentMeta;