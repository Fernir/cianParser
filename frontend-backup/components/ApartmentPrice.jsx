import React from 'react';
import './ApartmentPrice.css';

const ApartmentPrice = ({ price, pricePerMeter }) => {
  const formatPrice = (p) => {
    return new Intl.NumberFormat('ru-RU').format(p);
  };

  return (
    <div className="price-block">
      <div className="main-price">{formatPrice(price)} ₽/мес</div>
      {pricePerMeter > 0 && (
        <div className="price-per-meter">
          {formatPrice(pricePerMeter)} ₽/м² в месяц
        </div>
      )}
    </div>
  );
};

export default ApartmentPrice;