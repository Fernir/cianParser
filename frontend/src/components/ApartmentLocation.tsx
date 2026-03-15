"use client";

import React from "react";
import { Apartment } from "@/types";
import styles from "../assets/styles/ApartmentLocation.module.css";

interface ApartmentLocationProps {
  apartment: Apartment;
}

const ApartmentLocation: React.FC<ApartmentLocationProps> = ({ apartment }) => {
  const formatAddress = () => {
    const parts = [];
    if (apartment.district) parts.push(apartment.district);
    if (apartment.street) {
      let street = apartment.street;
      if (apartment.house_number) street += `, ${apartment.house_number}`;
      parts.push(street);
    }
    return parts.join(" · ");
  };

  const formatMetroTime = () => {
    if (!apartment.underground_time) return null;
    const match = apartment.underground_time.match(/(\d+)/);
    return match ? `${match[0]} мин` : apartment.underground_time;
  };

  const address = formatAddress();

  return (
    <div className={styles.locationCard}>
      {/* Адрес */}
      <div className={styles.addressRow}>
        <span className={styles.icon}>📍</span>
        <span className={styles.addressText}>
          {address || "Адрес не указан"}
        </span>
      </div>

      {/* Метро */}
      {apartment.underground && (
        <div className={styles.metroRow}>
          <span className={styles.icon}>🚇</span>
          <span className={styles.metroText}>
            {apartment.underground}
            {apartment.underground_line && (
              <span
                className={styles.metroLine}
                style={{ backgroundColor: `#${apartment.underground_line}` }}
              />
            )}
          </span>
          {formatMetroTime() && (
            <span className={styles.metroTime}>{formatMetroTime()}</span>
          )}
        </div>
      )}
    </div>
  );
};

export default ApartmentLocation;
