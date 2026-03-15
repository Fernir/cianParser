"use client";

import { useState } from "react";
import ApartmentCard from "./ApartmentCard";
import Pagination from "./Pagination";
import Filters from "./Filters";
import { Apartment, Filters as FilterType, PaginatedResponse } from "@/types";
import styles from "../assets/styles/ApartmentList.module.css";

interface ApartmentListClientProps {
  initialData: PaginatedResponse;
}

export default function ApartmentListClient({
  initialData,
}: ApartmentListClientProps) {
  const [apartments, setApartments] = useState<Apartment[]>(initialData.items);
  const [pagination, setPagination] = useState({
    page: initialData.page,
    pages: initialData.pages,
    total: initialData.total,
    per_page: initialData.per_page,
  });
  const [loading, setLoading] = useState(false);

  const fetchWithFilters = async (filters: FilterType) => {
    setLoading(true);
    try {
      const params = { ...filters, page: 1, per_page: 12 };
      const response = await fetch(
        `/api/proxy?${new URLSearchParams(params as any)}`,
      );
      const data = await response.json();

      setApartments(data.items);
      setPagination({
        page: data.page,
        pages: data.pages,
        total: data.total,
        per_page: data.per_page,
      });
    } catch (error) {
      console.error("Error fetching apartments:", error);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = async (page: number) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/proxy?page=${page}&per_page=12`);
      const data = await response.json();

      setApartments(data.items);
      setPagination({
        page: data.page,
        pages: data.pages,
        total: data.total,
        per_page: data.per_page,
      });
    } catch (error) {
      console.error("Error fetching apartments:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.apartmentListContainer}>
      <div className="container">
        <h1>Аренда квартир в Москве</h1>
        <p className={styles.subtitle}>Найдено {pagination.total} квартир</p>

        {/* Фильтр - будет работать с JS, без JS просто не будет интерактива */}
        <Filters onFilterChange={fetchWithFilters} />

        {/* Карточки - видны даже без JS, так как пришли с сервера */}
        {apartments.length === 0 ? (
          <div className={styles.noResults}>
            <h3>😕 Квартиры не найдены</h3>
            <p>Попробуйте изменить параметры фильтрации</p>
          </div>
        ) : (
          <>
            <div className={styles.apartmentGrid}>
              {apartments.map((apt) => (
                <ApartmentCard key={apt.id} apartment={apt} />
              ))}
            </div>

            <Pagination
              currentPage={pagination.page}
              totalPages={pagination.pages}
              onPageChange={handlePageChange}
            />

            <div className={styles.resultsInfo}>
              Показано {apartments.length} из {pagination.total} квартир
            </div>
          </>
        )}
      </div>
    </div>
  );
}
