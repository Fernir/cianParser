"use client";

import React from "react";
import Link from "next/link";
import styles from "../assets/styles/Footer.module.css";

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className={styles.footer}>
      <div className="container">
        <div className={styles.footerBottom}>
          <p>© {currentYear} CIAN Parser. Все права защищены.</p>
          <div className={styles.footerBadges}>
            <span className={styles.ageBadge}>18+</span>
            <span className={styles.ageBadge}>CIAN</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
