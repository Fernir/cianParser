"use client";

import React from "react";
import { Apartment } from "@/types";
import styles from "../assets/styles/ApartmentTerms.module.css";

interface ApartmentTermsProps {
  apartment: Apartment;
}

const ApartmentTerms: React.FC<ApartmentTermsProps> = ({ apartment }) => {
  const formatPrice = (p?: number | null) => {
    if (!p) return null;
    return new Intl.NumberFormat("ru-RU").format(p);
  };

  const terms = [
    {
      label: "Залог",
      value: apartment.deposit ? `${formatPrice(apartment.deposit)} ₽` : null,
    },
    {
      label: "Комиссия",
      value: apartment.commission || null,
    },
    {
      label: "Предоплата",
      value: apartment.prepayment || null,
    },
    {
      label: "Срок аренды",
      value: apartment.lease_term || null,
    },
  ].filter((t) => t.value);

  if (terms.length === 0) return null;

  return (
    <div className={styles.termsBlock}>
      <h3 className={styles.termsTitle}>Условия аренды</h3>
      <div className={styles.termsList}>
        {terms.map((term, index) => (
          <div key={index} className={styles.termItem}>
            <span className={styles.termLabel}>{term.label}</span>
            <span className={styles.termValue}>{term.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ApartmentTerms;
