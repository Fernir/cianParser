"use client";

import React from "react";
import styles from "../assets/styles/Loader.module.css";

const Loader: React.FC = () => {
  return (
    <div className={styles.loadingContainer}>
      <div className={styles.loadingSpinner}></div>
      <p>Загрузка...</p>
    </div>
  );
};

export default Loader;
