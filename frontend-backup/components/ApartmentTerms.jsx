import React from 'react';
import './ApartmentTerms.css';

const ApartmentTerms = ({ apartment }) => {
  const formatPrice = (p) => new Intl.NumberFormat('ru-RU').format(p);

  const terms = [
    { label: 'Залог', value: apartment.deposit ? `${formatPrice(apartment.deposit)} ₽` : null },
    { label: 'Комиссия', value: apartment.commission },
    { label: 'Предоплата', value: apartment.prepayment },
    { label: 'Срок аренды', value: apartment.lease_term },
  ].filter(t => t.value);

  if (terms.length === 0) return null;

  return (
    <div className="terms-block">
      <h3>Условия аренды</h3>
      <div className="terms-list">
        {terms.map((term, index) => (
          <div key={index} className="term-item">
            <span className="term-label">{term.label}</span>
            <span className="term-value">{term.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ApartmentTerms;