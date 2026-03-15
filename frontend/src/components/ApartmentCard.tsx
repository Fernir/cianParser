"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Apartment } from "@/types";
import styles from "../assets/styles/ApartmentCard.module.css";

interface ApartmentCardProps {
  apartment: Apartment;
}

const ApartmentCard: React.FC<ApartmentCardProps> = ({ apartment }) => {
  const mainPhoto = apartment.main_photo
    ? `http://localhost:8000${apartment.main_photo}`
    : apartment.photo_paths
      ? `http://localhost:8000${apartment.photo_paths.split(",")[0]}`
      : "/placeholder.jpg";

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("ru-RU").format(price);
  };

  const formatDate = (dateString?: string | null) => {
    if (!dateString) return "Дата неизвестна";
    return new Date(dateString).toLocaleDateString("ru-RU", {
      day: "numeric",
      month: "short",
    });
  };

  const getAuthorBadge = () => {
    if (apartment.is_owner) return { text: "Собственник", class: styles.owner };
    if (apartment.is_agent) return { text: "Агентство", class: styles.agency };
    if (apartment.is_builder)
      return { text: "Застройщик", class: styles.builder };
    if (apartment.author_type)
      return {
        text: apartment.author_type,
        class:
          apartment.author_type === "Собственник"
            ? styles.owner
            : styles.agency,
      };
    return null;
  };

  const authorBadge = getAuthorBadge();

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

  const formatMetro = () => {
    if (!apartment.underground) return null;

    let metroText = apartment.underground;
    if (apartment.underground_time) {
      const timeMatch = apartment.underground_time.match(/(\d+)/);
      if (timeMatch) {
        metroText += ` · ${timeMatch[0]} мин`;
      }
    }
    return metroText;
  };

  const getPhotoCount = () => {
    if (apartment.photo_count) return apartment.photo_count;
    if (apartment.photo_paths) return apartment.photo_paths.split(",").length;
    return 0;
  };

  return (
    <Link href={`/apartment/${apartment.id}`} className={styles.apartmentCard}>
      <div className={styles.cardImage}>
        <img
          src={mainPhoto}
          alt={`Квартира ${apartment.rooms_count} комн.`}
          loading="lazy"
        />

        {getPhotoCount() > 0 && (
          <div className={styles.photoCount}>📸 {getPhotoCount()}</div>
        )}

        {apartment.is_urgent && (
          <span className={`${styles.badge} ${styles.urgent}`}>Срочно</span>
        )}
        {apartment.is_special && (
          <span className={`${styles.badge} ${styles.special}`}>
            Спецпредложение
          </span>
        )}
      </div>

      <div className={styles.cardContent}>
        <div className={styles.cardHeader}>
          <div className={styles.cardPrice}>
            {formatPrice(apartment.price)} ₽/мес
          </div>
          {apartment.price_per_meter && apartment.price_per_meter > 0 && (
            <div className={styles.pricePerMeter}>
              {formatPrice(apartment.price_per_meter)} ₽/м²
            </div>
          )}
        </div>

        <div className={styles.cardTitle}>
          {apartment.rooms_count}-комнатная квартира
          {apartment.total_meters && `, ${apartment.total_meters} м²`}
        </div>

        <div className={styles.cardAddress}>
          <span className={styles.addressIcon}>📍</span>
          <span className={styles.addressText}>{formatAddress()}</span>
        </div>

        {formatMetro() && (
          <div className={styles.cardMetro}>
            <span className={styles.metroIcon}>🚇</span>
            <span className={styles.metroText}>{formatMetro()}</span>
            {apartment.underground_line && (
              <span
                className={styles.metroLine}
                style={{ backgroundColor: `#${apartment.underground_line}` }}
              />
            )}
          </div>
        )}

        <div className={styles.cardDetails}>
          {apartment.floor && apartment.floors_count && (
            <span className={styles.detailItem}>
              <span className={styles.detailIcon}>🏢</span>
              {apartment.floor}/{apartment.floors_count} эт.
            </span>
          )}
          {apartment.living_meters && (
            <span className={styles.detailItem}>
              <span className={styles.detailIcon}>🛋️</span>
              Жилая {apartment.living_meters} м²
            </span>
          )}
          {apartment.kitchen_meters && (
            <span className={styles.detailItem}>
              <span className={styles.detailIcon}>🍳</span>
              Кухня {apartment.kitchen_meters} м²
            </span>
          )}
        </div>

        {apartment.amenities && apartment.amenities.length > 0 && (
          <div className={styles.cardAmenities}>
            {apartment.amenities.slice(0, 3).map((amenity, index) => {
              let shortName = amenity;
              if (amenity.length > 12) {
                shortName = amenity.substring(0, 10) + "…";
              }
              return (
                <span key={index} className={styles.amenityTag} title={amenity}>
                  {shortName}
                </span>
              );
            })}
            {apartment.amenities.length > 3 && (
              <span
                className={`${styles.amenityTag} ${styles.more}`}
                title={`Ещё ${apartment.amenities.length - 3}`}
              >
                +{apartment.amenities.length - 3}
              </span>
            )}
          </div>
        )}

        <div className={styles.cardFooter}>
          <div className={styles.cardDate}>
            <span className={styles.dateIcon}>📅</span>
            {formatDate(apartment.parsed_date)}
          </div>
          {authorBadge && (
            <span className={`${styles.authorBadge} ${authorBadge.class}`}>
              {authorBadge.text}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
};

export default ApartmentCard;
