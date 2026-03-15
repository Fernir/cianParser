"use client";

import React, { useEffect, useState } from "react";
import { useTheme } from "@/context/ThemeContext";
import styles from "../assets/styles/ThemeToggle.module.css";

const ThemeToggle: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div
        className={styles.toggle}
        style={{ width: "56px", height: "28px" }}
      />
    );
  }

  return (
    <button
      onClick={toggleTheme}
      className={styles.toggle}
      aria-label="Переключить тему"
    >
      <div className={`${styles.track} ${theme === "dark" ? styles.dark : ""}`}>
        <div className={styles.icons}>
          <span className={styles.sun}>☀️</span>
          <span className={styles.moon}>🌙</span>
        </div>
        <div
          className={`${styles.thumb} ${theme === "dark" ? styles.dark : ""}`}
        />
      </div>
    </button>
  );
};

export default ThemeToggle;
