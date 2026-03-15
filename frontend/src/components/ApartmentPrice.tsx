"use client";

import React from "react";
import styles from "../assets/styles/ApartmentPrice.module.css";

interface ApartmentPriceProps {
  price: number;
  pricePerMeter?: number | null;
}

const ApartmentPrice: React.FC<ApartmentPriceProps> = ({
  price,
  pricePerMeter,
}) => {
  const formatPrice = (p: number) => {
    return new Intl.NumberFormat("ru-RU").format(p);
  };

  return (
    <div className={styles.priceBlock}>
      <div className={styles.mainPrice}>{formatPrice(price)} ₽/мес</div>
      {pricePerMeter && pricePerMeter > 0 && (
        <div className={styles.pricePerMeter}>
          {formatPrice(pricePerMeter)} ₽/м² в месяц
        </div>
      )}
    </div>
  );
};

export default ApartmentPrice;
