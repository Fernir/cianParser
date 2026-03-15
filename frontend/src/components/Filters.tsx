"use client";

import React, { useState } from "react";
import { Filters as FilterType } from "@/types";
import styles from "../assets/styles/Filters.module.css";

interface FiltersProps {
  onFilterChange: (filters: FilterType) => void;
}

const Filters: React.FC<FiltersProps> = ({ onFilterChange }) => {
  const [filters, setFilters] = useState<FilterType>({
    min_price: "",
    max_price: "",
    rooms: "",
    district: "",
    underground: "",
    min_area: "",
    max_area: "",
    author_type: "",
    has_photo: false,
    is_owner: false,
    is_agent: false,
    sort_by: "price_asc",
  });

  const [expanded, setExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState("all");

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    setFilters((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const preparedFilters: FilterType = { ...filters };

    // Удаляем пустые значения
    Object.keys(preparedFilters).forEach((key) => {
      const k = key as keyof FilterType;
      if (preparedFilters[k] === "" || preparedFilters[k] === false) {
        delete preparedFilters[k];
      }
    });

    // Добавляем фильтр по комнатам из табов
    if (activeTab !== "all") {
      if (activeTab === "4") {
        preparedFilters.rooms = "4,5,6";
      } else {
        preparedFilters.rooms = activeTab;
      }
    }

    onFilterChange(preparedFilters);
  };

  const handleReset = () => {
    setFilters({
      min_price: "",
      max_price: "",
      rooms: "",
      district: "",
      underground: "",
      min_area: "",
      max_area: "",
      author_type: "",
      has_photo: false,
      is_owner: false,
      is_agent: false,
      sort_by: "price_asc",
    });
    setActiveTab("all");
    onFilterChange({});
  };

  // Функция для удаления конкретного фильтра
  const removeFilter = (key: keyof FilterType) => {
    setFilters((prev) => ({ ...prev, [key]: "" }));
  };

  return (
    <div className={styles.filtersWrapper}>
      <div className={styles.filtersHeader}>
        <h2 className={styles.filtersTitle}>
          <span className={styles.titleIcon}>🔍</span>
          Поиск квартир
        </h2>
        <button
          className={`${styles.expandBtn} ${expanded ? styles.active : ""}`}
          onClick={() => setExpanded(!expanded)}
        >
          {expanded ? "▲ Свернуть" : "▼ Расширенный поиск"}
        </button>
      </div>

      <form onSubmit={handleSubmit} className={styles.filtersForm}>
        {/* Табы с количеством комнат */}
        <div className={styles.roomsTabs}>
          <button
            type="button"
            className={`${styles.tabBtn} ${activeTab === "all" ? styles.active : ""}`}
            onClick={() => setActiveTab("all")}
          >
            Все
          </button>
          <button
            type="button"
            className={`${styles.tabBtn} ${activeTab === "1" ? styles.active : ""}`}
            onClick={() => setActiveTab("1")}
          >
            1 комната
          </button>
          <button
            type="button"
            className={`${styles.tabBtn} ${activeTab === "2" ? styles.active : ""}`}
            onClick={() => setActiveTab("2")}
          >
            2 комнаты
          </button>
          <button
            type="button"
            className={`${styles.tabBtn} ${activeTab === "3" ? styles.active : ""}`}
            onClick={() => setActiveTab("3")}
          >
            3 комнаты
          </button>
          <button
            type="button"
            className={`${styles.tabBtn} ${activeTab === "4" ? styles.active : ""}`}
            onClick={() => setActiveTab("4")}
          >
            4+ комнаты
          </button>
        </div>

        {/* Основные фильтры */}
        <div className={styles.filtersGrid}>
          <div className={`${styles.filterGroup} ${styles.priceRange}`}>
            <label>Цена, ₽/мес</label>
            <div className={styles.rangeInputs}>
              <input
                type="number"
                name="min_price"
                value={filters.min_price}
                onChange={handleChange}
                placeholder="от"
                min="0"
              />
              <span className={styles.rangeSeparator}>—</span>
              <input
                type="number"
                name="max_price"
                value={filters.max_price}
                onChange={handleChange}
                placeholder="до"
                min="0"
              />
            </div>
          </div>

          <div className={`${styles.filterGroup} ${styles.areaRange}`}>
            <label>Площадь, м²</label>
            <div className={styles.rangeInputs}>
              <input
                type="number"
                name="min_area"
                value={filters.min_area}
                onChange={handleChange}
                placeholder="от"
                min="0"
                step="1"
              />
              <span className={styles.rangeSeparator}>—</span>
              <input
                type="number"
                name="max_area"
                value={filters.max_area}
                onChange={handleChange}
                placeholder="до"
                min="0"
                step="1"
              />
            </div>
          </div>

          <div className={styles.filterGroup}>
            <label>Район</label>
            <input
              type="text"
              name="district"
              value={filters.district}
              onChange={handleChange}
              placeholder="Например, ЦАО"
              className={styles.textInput}
            />
          </div>

          <div className={styles.filterGroup}>
            <label>Метро</label>
            <input
              type="text"
              name="underground"
              value={filters.underground}
              onChange={handleChange}
              placeholder="Станция метро"
              className={styles.textInput}
            />
          </div>
        </div>

        {/* Расширенные фильтры */}
        {expanded && (
          <div className={styles.expandedFilters}>
            <h3 className={styles.expandedTitle}>Дополнительные параметры</h3>

            <div className={styles.expandedGrid}>
              <div className={styles.filterGroup}>
                <label>Тип продавца</label>
                <select
                  name="author_type"
                  value={filters.author_type}
                  onChange={handleChange}
                  className={styles.selectInput}
                >
                  <option value="">Любой</option>
                  <option value="Собственник">Собственник</option>
                  <option value="Агентство">Агентство</option>
                </select>
              </div>

              <div className={styles.filterGroup}>
                <label>Сортировка</label>
                <select
                  name="sort_by"
                  value={filters.sort_by}
                  onChange={handleChange}
                  className={styles.selectInput}
                >
                  <option value="price_asc">Сначала дешевле</option>
                  <option value="price_desc">Сначала дороже</option>
                  <option value="area_desc">По площади</option>
                  <option value="date_desc">По дате</option>
                </select>
              </div>

              <div className={styles.checkboxGroup}>
                <label className={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    name="has_photo"
                    checked={filters.has_photo || false}
                    onChange={handleChange}
                  />
                  <span className={styles.checkboxCustom}></span>
                  Только с фото
                </label>
              </div>

              <div className={styles.checkboxGroup}>
                <label className={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    name="is_owner"
                    checked={filters.is_owner || false}
                    onChange={handleChange}
                  />
                  <span className={styles.checkboxCustom}></span>
                  Только собственники
                </label>
              </div>
            </div>
          </div>
        )}

        {/* Кнопки действий */}
        <div className={styles.filtersActions}>
          <button type="submit" className={styles.applyBtn}>
            <span className={styles.btnIcon}>✓</span>
            Применить фильтры
          </button>
          <button
            type="button"
            onClick={handleReset}
            className={styles.resetBtn}
          >
            <span className={styles.btnIcon}>↺</span>
            Сбросить
          </button>
        </div>
      </form>

      {/* Активные фильтры */}
      {Object.keys(filters).some((key) => {
        const k = key as keyof FilterType;
        return filters[k] && (k !== "sort_by" || filters[k] !== "price_asc");
      }) && (
        <div className={styles.activeFilters}>
          <span className={styles.activeFiltersTitle}>Активные фильтры:</span>
          <div className={styles.filterTags}>
            {filters.min_price && (
              <span className={styles.filterTag}>
                от {filters.min_price} ₽
                <button
                  onClick={() => setFilters({ ...filters, min_price: "" })}
                >
                  ×
                </button>
              </span>
            )}
            {filters.max_price && (
              <span className={styles.filterTag}>
                до {filters.max_price} ₽
                <button
                  onClick={() => setFilters({ ...filters, max_price: "" })}
                >
                  ×
                </button>
              </span>
            )}
            {activeTab !== "all" && (
              <span className={styles.filterTag}>
                {activeTab === "1"
                  ? "1 комната"
                  : activeTab === "2"
                    ? "2 комнаты"
                    : activeTab === "3"
                      ? "3 комнаты"
                      : "4+ комнат"}
                <button onClick={() => setActiveTab("all")}>×</button>
              </span>
            )}
            {filters.district && (
              <span className={styles.filterTag}>
                {filters.district}
                <button
                  onClick={() => setFilters({ ...filters, district: "" })}
                >
                  ×
                </button>
              </span>
            )}
            {filters.underground && (
              <span className={styles.filterTag}>
                м. {filters.underground}
                <button
                  onClick={() => setFilters({ ...filters, underground: "" })}
                >
                  ×
                </button>
              </span>
            )}
            {filters.has_photo && (
              <span className={styles.filterTag}>
                С фото
                <button
                  onClick={() => setFilters({ ...filters, has_photo: false })}
                >
                  ×
                </button>
              </span>
            )}
            {filters.is_owner && (
              <span className={styles.filterTag}>
                Собственник
                <button
                  onClick={() => setFilters({ ...filters, is_owner: false })}
                >
                  ×
                </button>
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Filters;
