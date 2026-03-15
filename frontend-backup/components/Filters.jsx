import React, { useState } from "react";
import "../assets/styles/Filters.css";

const Filters = ({ onFilterChange }) => {
  const [filters, setFilters] = useState({
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

  const [expanded, setExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState("all");

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Подготавливаем фильтры для отправки
    const preparedFilters = { ...filters };

    // Удаляем пустые значения
    Object.keys(preparedFilters).forEach((key) => {
      if (preparedFilters[key] === "" || preparedFilters[key] === false) {
        delete preparedFilters[key];
      }
    });

    // Добавляем фильтр по комнатам из табов
    if (activeTab !== "all") {
      if (activeTab === "4") {
        // Для 4+ комнат отправляем 4,5,6...
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
      sort_by: "price_asc",
    });
    setActiveTab("all");
    onFilterChange({});
  };

  return (
    <div className="filters-wrapper">
      <div className="filters-header">
        <h2 className="filters-title">
          <span className="title-icon">🔍</span>
          Поиск квартир
        </h2>
        <button
          className={`expand-btn ${expanded ? "active" : ""}`}
          onClick={() => setExpanded(!expanded)}
        >
          {expanded ? "▲ Свернуть" : "▼ Расширенный поиск"}
        </button>
      </div>

      <form onSubmit={handleSubmit} className="filters-form">
        {/* Табы с количеством комнат */}
        <div className="rooms-tabs">
          <button
            type="button"
            className={`tab-btn ${activeTab === "all" ? "active" : ""}`}
            onClick={() => setActiveTab("all")}
          >
            Все
          </button>
          <button
            type="button"
            className={`tab-btn ${activeTab === "1" ? "active" : ""}`}
            onClick={() => setActiveTab("1")}
          >
            1 комната
          </button>
          <button
            type="button"
            className={`tab-btn ${activeTab === "2" ? "active" : ""}`}
            onClick={() => setActiveTab("2")}
          >
            2 комнаты
          </button>
          <button
            type="button"
            className={`tab-btn ${activeTab === "3" ? "active" : ""}`}
            onClick={() => setActiveTab("3")}
          >
            3 комнаты
          </button>
          <button
            type="button"
            className={`tab-btn ${activeTab === "4" ? "active" : ""}`}
            onClick={() => setActiveTab("4")}
          >
            4+ комнаты
          </button>
        </div>

        {/* Основные фильтры */}
        <div className="filters-grid">
          <div className="filter-group price-range">
            <label>Цена, ₽/мес</label>
            <div className="range-inputs">
              <input
                type="number"
                name="min_price"
                value={filters.min_price}
                onChange={handleChange}
                placeholder="от"
                min="0"
              />
              <span className="range-separator">—</span>
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

          <div className="filter-group area-range">
            <label>Площадь, м²</label>
            <div className="range-inputs">
              <input
                type="number"
                name="min_area"
                value={filters.min_area}
                onChange={handleChange}
                placeholder="от"
                min="0"
              />
              <span className="range-separator">—</span>
              <input
                type="number"
                name="max_area"
                value={filters.max_area}
                onChange={handleChange}
                placeholder="до"
                min="0"
              />
            </div>
          </div>

          <div className="filter-group">
            <label>Район</label>
            <input
              type="text"
              name="district"
              value={filters.district}
              onChange={handleChange}
              placeholder="Например, ЦАО"
              className="text-input"
            />
          </div>

          <div className="filter-group">
            <label>Метро</label>
            <input
              type="text"
              name="underground"
              value={filters.underground}
              onChange={handleChange}
              placeholder="Станция метро"
              className="text-input"
            />
          </div>
        </div>

        {/* Расширенные фильтры */}
        {expanded && (
          <div className="expanded-filters">
            <h3 className="expanded-title">Дополнительные параметры</h3>

            <div className="expanded-grid">
              <div className="filter-group">
                <label>Тип продавца</label>
                <select
                  name="author_type"
                  value={filters.author_type}
                  onChange={handleChange}
                  className="select-input"
                >
                  <option value="">Любой</option>
                  <option value="Собственник">Собственник</option>
                  <option value="Агентство">Агентство</option>
                </select>
              </div>

              <div className="filter-group">
                <label>Сортировка</label>
                <select
                  name="sort_by"
                  value={filters.sort_by}
                  onChange={handleChange}
                  className="select-input"
                >
                  <option value="price_asc">Сначала дешевле</option>
                  <option value="price_desc">Сначала дороже</option>
                  <option value="area_desc">По площади</option>
                  <option value="date_desc">По дате</option>
                </select>
              </div>

              <div className="checkbox-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    name="has_photo"
                    checked={filters.has_photo}
                    onChange={handleChange}
                  />
                  <span className="checkbox-custom"></span>
                  Только с фото
                </label>
              </div>

              <div className="checkbox-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    name="is_owner"
                    checked={filters.is_owner}
                    onChange={handleChange}
                  />
                  <span className="checkbox-custom"></span>
                  Без посредников
                </label>
              </div>
            </div>
          </div>
        )}

        {/* Кнопки действий */}
        <div className="filters-actions">
          <button type="submit" className="apply-btn">
            <span className="btn-icon">✓</span>
            Применить фильтры
          </button>
          <button type="button" onClick={handleReset} className="reset-btn">
            <span className="btn-icon">↺</span>
            Сбросить
          </button>
        </div>
      </form>

      {/* Активные фильтры */}
      {Object.keys(filters).some(
        (key) =>
          filters[key] && (key !== "sort_by" || filters[key] !== "price_asc"),
      ) && (
        <div className="active-filters">
          <span className="active-filters-title">Активные фильтры:</span>
          <div className="filter-tags">
            {filters.min_price && (
              <span className="filter-tag">
                от {filters.min_price} ₽
                <button
                  onClick={() => setFilters({ ...filters, min_price: "" })}
                >
                  ×
                </button>
              </span>
            )}
            {filters.max_price && (
              <span className="filter-tag">
                до {filters.max_price} ₽
                <button
                  onClick={() => setFilters({ ...filters, max_price: "" })}
                >
                  ×
                </button>
              </span>
            )}
            {activeTab !== "all" && (
              <span className="filter-tag">
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
              <span className="filter-tag">
                {filters.district}
                <button
                  onClick={() => setFilters({ ...filters, district: "" })}
                >
                  ×
                </button>
              </span>
            )}
            {filters.underground && (
              <span className="filter-tag">
                м. {filters.underground}
                <button
                  onClick={() => setFilters({ ...filters, underground: "" })}
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
