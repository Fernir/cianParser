import React from 'react';
import './ApartmentAuthor.css';

const ApartmentAuthor = ({ apartment }) => {
  const getAuthorIcon = () => {
    if (apartment.is_owner) return '👤';
    if (apartment.is_agent) return '🏢';
    if (apartment.is_builder) return '🏗️';
    return apartment.author_type === 'Собственник' ? '👤' : '🏢';
  };

  if (!apartment.author && !apartment.author_type) return null;

  return (
    <div className="author-block">
      <div className="author-avatar">{getAuthorIcon()}</div>
      <div className="author-info">
        <div className="author-name">{apartment.author || 'Не указан'}</div>
        <div className="author-type">{apartment.author_type}</div>
        {apartment.author_rating && (
          <div className="author-rating">⭐ {apartment.author_rating}</div>
        )}
      </div>
    </div>
  );
};

export default ApartmentAuthor;