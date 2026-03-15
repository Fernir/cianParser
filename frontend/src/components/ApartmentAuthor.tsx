"use client";

import React from "react";
import { Apartment } from "@/types";
import styles from "../assets/styles/ApartmentAuthor.module.css";

interface ApartmentAuthorProps {
  apartment: Apartment;
}

const ApartmentAuthor: React.FC<ApartmentAuthorProps> = ({ apartment }) => {
  const getAuthorIcon = () => {
    if (apartment.is_owner) return "👤";
    if (apartment.is_agent) return "🏢";
    if (apartment.is_builder) return "🏗️";
    return apartment.author_type === "Собственник" ? "👤" : "🏢";
  };

  const getAuthorTypeText = () => {
    if (apartment.is_owner) return "Собственник";
    if (apartment.is_agent) return "Агентство";
    if (apartment.is_builder) return "Застройщик";
    return apartment.author_type || "Не указан";
  };

  if (
    !apartment.author &&
    !apartment.author_type &&
    !apartment.is_owner &&
    !apartment.is_agent &&
    !apartment.is_builder
  ) {
    return null;
  }

  return (
    <div className={styles.authorBlock}>
      <div className={styles.authorAvatar}>{getAuthorIcon()}</div>
      <div className={styles.authorInfo}>
        <div className={styles.authorName}>
          {apartment.author || "Не указан"}
        </div>
        <div className={styles.authorType}>{getAuthorTypeText()}</div>
        {apartment.author_rating && (
          <div className={styles.authorRating}>
            ⭐ {apartment.author_rating}
          </div>
        )}
        {apartment.author_deals_count && apartment.author_deals_count > 0 && (
          <div className={styles.authorStats}>
            Сделок: {apartment.author_deals_count}
          </div>
        )}
      </div>
    </div>
  );
};

export default ApartmentAuthor;
