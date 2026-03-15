"use client";

import React from "react";
import { Apartment } from "@/types";
import styles from "../assets/styles/ApartmentSpecs.module.css";

interface ApartmentSpecsProps {
  apartment: Apartment;
}

const ApartmentSpecs: React.FC<ApartmentSpecsProps> = ({ apartment }) => {
  const specs = [
    { label: "Комнат", value: apartment.rooms_count, icon: "🛏️" },
    {
      label: "Общая площадь",
      value: apartment.total_meters ? `${apartment.total_meters} м²` : null,
      icon: "📐",
    },
    {
      label: "Жилая площадь",
      value: apartment.living_meters ? `${apartment.living_meters} м²` : null,
      icon: "🛋️",
    },
    {
      label: "Кухня",
      value: apartment.kitchen_meters ? `${apartment.kitchen_meters} м²` : null,
      icon: "🍳",
    },
    {
      label: "Этаж",
      value: apartment.floor
        ? `${apartment.floor}/${apartment.floors_count}`
        : null,
      icon: "🏢",
    },
    {
      label: "Спален",
      value: apartment.bedrooms_count ? `${apartment.bedrooms_count}` : null,
      icon: "🛏️",
    },
  ].filter((s) => s.value);

  return (
    <div className={styles.specsGrid}>
      {specs.map((spec, index) => (
        <div key={index} className={styles.specCard}>
          <span className={styles.specIcon}>{spec.icon}</span>
          <div className={styles.specInfo}>
            <span className={styles.specLabel}>{spec.label}</span>
            <span className={styles.specValue}>{spec.value}</span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ApartmentSpecs;
