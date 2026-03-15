"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Filters } from "@/types";
import styles from "../assets/styles/Filters.module.css";

interface FiltersClientProps {
  initialFilters: Partial<Filters>;
}

export default function FiltersClient({
  initialFilters = {},
}: FiltersClientProps) {
  const router = useRouter();

  const [filters, setFilters] = useState<Partial<Filters>>({
    min_price: initialFilters.min_price || "",
    max_price: initialFilters.max_price || "",
    rooms: initialFilters.rooms || "",
    district: initialFilters.district || "",
    underground: initialFilters.underground || "",
    min_area: initialFilters.min_area || "",
    max_area: initialFilters.max_area || "",
    author_type: initialFilters.author_type || "",
    has_photo: initialFilters.has_photo || false,
    is_owner: initialFilters.is_owner || false,
    sort_by: initialFilters.sort_by || "price_asc",
  });

  const [activeTab, setActiveTab] = useState<string>(
    initialFilters.rooms || "all",
  );
  const [expanded, setExpanded] = useState<boolean>(false);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    setFilters((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleTabClick = (tab: string) => {
    setActiveTab(tab);
    setFilters((prev) => ({
      ...prev,
      rooms: tab === "all" ? "" : tab,
    }));
  };

  const applyFilters = () => {
    const params = new URLSearchParams();

    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== "" && value !== false) {
        params.append(key, String(value));
      }
    });

    router.push(`/?${params.toString()}`);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    applyFilters();
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
      sort_by: "price_asc",
    });
    setActiveTab("all");
    router.push("/");
  };

  return (
    <form onSubmit={handleSubmit} className={styles.filters}>
      <div className={styles.filterGroup}>
        <label>Цена, ₽/мес</label>
        <div className={styles.filterInputs}>
          <input
            type="number"
            name="min_price"
            value={String(filters.min_price || "")}
            onChange={handleInputChange}
            placeholder="от"
            min="0"
            className={styles.filterInput}
          />
          <span className={styles.filterSeparator}>—</span>
          <input
            type="number"
            name="max_price"
            value={String(filters.max_price || "")}
            onChange={handleInputChange}
            placeholder="до"
            min="0"
            className={styles.filterInput}
          />
        </div>
      </div>

      <div className={styles.filterGroup}>
        <label>Комнатность</label>
        <div className={styles.roomTabs}>
          {["all", "1", "2", "3", "4"].map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => handleTabClick(tab)}
              className={`${styles.roomTab} ${activeTab === tab ? styles.active : ""}`}
            >
              {tab === "all" ? "Все" : tab === "4" ? "4+" : tab}
            </button>
          ))}
        </div>
      </div>

      <div className={styles.filterGroup}>
        <label>Район</label>
        <input
          type="text"
          name="district"
          value={String(filters.district || "")}
          onChange={handleInputChange}
          placeholder="Например, ЦАО"
          className={styles.filterInput}
        />
      </div>

      <div className={styles.filterGroup}>
        <label>Метро</label>
        <input
          type="text"
          name="underground"
          value={String(filters.underground || "")}
          onChange={handleInputChange}
          placeholder="Станция метро"
          className={styles.filterInput}
        />
      </div>

      <button
        type="button"
        className={styles.expandButton}
        onClick={() => setExpanded(!expanded)}
      >
        {expanded ? "▲ Свернуть" : "▼ Расширенный поиск"}
      </button>

      {expanded && (
        <>
          <div className={styles.filterGroup}>
            <label>Площадь, м²</label>
            <div className={styles.filterInputs}>
              <input
                type="number"
                name="min_area"
                value={String(filters.min_area || "")}
                onChange={handleInputChange}
                placeholder="от"
                min="0"
                step="1"
                className={styles.filterInput}
              />
              <span className={styles.filterSeparator}>—</span>
              <input
                type="number"
                name="max_area"
                value={String(filters.max_area || "")}
                onChange={handleInputChange}
                placeholder="до"
                min="0"
                step="1"
                className={styles.filterInput}
              />
            </div>
          </div>

          <div className={styles.filterGroup}>
            <label>Тип продавца</label>
            <select
              name="author_type"
              value={String(filters.author_type || "")}
              onChange={handleInputChange}
              className={styles.filterSelect}
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
              value={String(filters.sort_by || "price_asc")}
              onChange={handleInputChange}
              className={styles.filterSelect}
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
                onChange={handleInputChange}
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
                onChange={handleInputChange}
              />
              <span className={styles.checkboxCustom}></span>
              Только собственники
            </label>
          </div>
        </>
      )}

      <div className={styles.buttonGroup}>
        <button type="submit" className={styles.applyButton}>
          Применить
        </button>
        <button
          type="button"
          onClick={handleReset}
          className={styles.resetButton}
        >
          Сбросить
        </button>
      </div>
    </form>
  );
}
