"use client";

import React from "react";
import Link from "next/link";
import styles from "./page.module.css";

export default function AboutPage() {
  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <Link href="/" className={styles.backLink}>
          ← На главную
        </Link>

        <h1 className={styles.title}>О проекте</h1>

        <div className={styles.card}>
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Что это такое?</h2>
            <p className={styles.text}>
              Данный проект представляет собой парсер квартир с сайта CIAN.ru.
              Мы собираем информацию о квартирах в аренду и предоставляем
              удобный интерфейс для поиска с расширенными фильтрами.
            </p>
          </section>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Как это работает</h2>
            <ol className={styles.list}>
              <li>Парсер собирает данные с CIAN.ru каждые 6 часов</li>
              <li>Информация сохраняется в базу данных SQLite</li>
              <li>
                Вы можете фильтровать и просматривать актуальные предложения
              </li>
              <li>Все фотографии сохраняются локально для быстрого доступа</li>
            </ol>
          </section>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Технологии</h2>
            <div className={styles.techGrid}>
              <div className={styles.techItem}>
                <span className={styles.techIcon}>🐍</span>
                <span className={styles.techName}>Python + FastAPI</span>
              </div>
              <div className={styles.techItem}>
                <span className={styles.techIcon}>⚛️</span>
                <span className={styles.techName}>React + Next.js</span>
              </div>
              <div className={styles.techItem}>
                <span className={styles.techIcon}>🗄️</span>
                <span className={styles.techName}>SQLite</span>
              </div>
              <div className={styles.techItem}>
                <span className={styles.techIcon}>🕷️</span>
                <span className={styles.techName}>BeautifulSoup4</span>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
