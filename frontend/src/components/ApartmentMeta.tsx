"use client";

import React from "react";
import { Apartment } from "@/types";
import styles from "../assets/styles/ApartmentMeta.module.css";

interface ApartmentMetaProps {
  apartment: Apartment;
}

const ApartmentMeta: React.FC<ApartmentMetaProps> = ({ apartment }) => {
  const formatDate = (date?: string | null) => {
    if (!date) return "—";
    return new Date(date).toLocaleDateString("ru-RU", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  return (
    <div className={styles.metaBlock}>
      <div className={styles.metaItem}>
        <span className={styles.metaLabel}>ID:</span>
        <span className={styles.metaValue}>
          {apartment.cian_id || apartment.id}
        </span>
      </div>
      {apartment.published_date && (
        <div className={styles.metaItem}>
          <span className={styles.metaLabel}>Опубликовано:</span>
          <span className={styles.metaValue}>
            {formatDate(apartment.published_date)}
          </span>
        </div>
      )}
      <div className={styles.metaItem}>
        <span className={styles.metaLabel}>Обновлено:</span>
        <span className={styles.metaValue}>
          {formatDate(apartment.last_check_date)}
        </span>
      </div>
      {apartment.views_count && apartment.views_count > 0 && (
        <div className={styles.metaItem}>
          <span className={styles.metaLabel}>Просмотров:</span>
          <span className={styles.metaValue}>{apartment.views_count}</span>
        </div>
      )}
    </div>
  );
};

export default ApartmentMeta;
