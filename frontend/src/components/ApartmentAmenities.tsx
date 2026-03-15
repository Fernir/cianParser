"use client";

import React from "react";
import styles from "../assets/styles/ApartmentAmenities.module.css";

interface ApartmentAmenitiesProps {
  amenities?: string[];
}

const ApartmentAmenities: React.FC<ApartmentAmenitiesProps> = ({
  amenities,
}) => {
  if (!amenities || amenities.length === 0) return null;

  const icons: Record<string, string> = {
    wifi: "📶",
    tv: "📺",
    fridge: "🧊",
    washer: "🧺",
    conditioner: "❄️",
    dishwasher: "🍽️",
    internet: "🌐",
    balcony: "🏞️",
    parking: "🅿️",
    elevator: "🛗",
    furniture: "🪑",
    kitchen: "🍳",
  };

  return (
    <div className={styles.amenitiesBlock}>
      <h3 className={styles.amenitiesTitle}>Удобства</h3>
      <div className={styles.amenitiesGrid}>
        {amenities.map((item, index) => {
          const key = item.toLowerCase();
          return (
            <div key={index} className={styles.amenityItem}>
              <span className={styles.amenityIcon}>{icons[key] || "✓"}</span>
              <span className={styles.amenityName}>{item}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ApartmentAmenities;
