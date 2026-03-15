"use client";

import React from "react";
import ApartmentCard from "./ApartmentCard";
import Pagination from "./Pagination";
import Filters from "./Filters";
import Loader from "./Loader";
import { useApartments } from "@/hooks/useApartments";
import { Filters as FilterType } from "@/types";
import styles from "../assets/styles/ApartmentList.module.css";

interface ApartmentListProps {
  initialApartments?: any[];
}

const ApartmentList: React.FC<ApartmentListProps> = ({
  initialApartments = [],
}) => {
  const {
    apartments,
    loading,
    error,
    pagination,
    updateParams,
    goToPage,
    refetch,
  } = useApartments({ page: 1, per_page: 12 });

  const handleFilterChange = (newFilters: FilterType) => {
    updateParams({ ...newFilters, page: 1 });
  };

  if (loading && apartments.length === 0) {
    return <Loader />;
  }

  if (error) {
    return (
      <div className={styles.errorContainer}>
        <h3>😕 Ошибка</h3>
        <p>{error}</p>
        <button onClick={refetch} className={styles.retryBtn}>
          Попробовать снова
        </button>
      </div>
    );
  }

  return (
    <div className={styles.apartmentListContainer}>
      <div className="container">
        <h1>Аренда квартир в Москве</h1>
        <p className={styles.subtitle}>Найдено {pagination.total} квартир</p>

        <Filters onFilterChange={handleFilterChange} />

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
              onPageChange={goToPage}
            />

            <div className={styles.resultsInfo}>
              Показано {apartments.length} из {pagination.total} квартир
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ApartmentList;
