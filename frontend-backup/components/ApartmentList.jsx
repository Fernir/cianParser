import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { getApartments } from '../services/api';
import ApartmentCard from './ApartmentCard';
import Pagination from './Pagination';
import Filters from './Filters';
import Loader from './Loader';
import { useApartments } from '../hooks/useApartments';
import '../assets/styles/ApartmentList.css';

// Ленивая загрузка для карточек за пределами экрана
const ApartmentList = () => {
  const {
    apartments,
    loading,
    error,
    pagination,
    updateParams,
    goToPage,
    refetch
  } = useApartments({ page: 1, per_page: 12 });

  const [visible, setVisible] = useState({});

  const handleFilterChange = (newFilters) => {
    updateParams({ ...newFilters, page: 1 });
    // Сбрасываем видимость при смене фильтров
    setVisible({});
  };

  // Используем useCallback для оптимизации
  const handleImageVisible = useCallback((id) => {
    setVisible(prev => ({ ...prev, [id]: true }));
  }, []);

  if (loading && apartments.length === 0) {
    return <Loader />;
  }

  if (error) {
    return (
      <div className="error-container">
        <h3>😕 Ошибка</h3>
        <p>{error}</p>
        <button onClick={refetch} className="retry-btn">
          Попробовать снова
        </button>
      </div>
    );
  }

  return (
    <div className="apartment-list-container">
      <div className="container">
        <div className="list-header">
          <h1>Аренда квартир в Москве</h1>
          <p className="subtitle">Найдено {pagination.total} квартир</p>
        </div>
        
        <Filters onFilterChange={handleFilterChange} />
        
        {apartments.length === 0 ? (
          <div className="no-results">
            <h3>😕 Квартиры не найдены</h3>
            <p>Попробуйте изменить параметры фильтрации</p>
          </div>
        ) : (
          <>
            <div className="apartment-grid">
              {apartments.map(apt => (
                <div key={apt.id} className="grid-item">
                  <ApartmentCard 
                    apartment={apt} 
                    isVisible={visible[apt.id]}
                    onVisible={handleImageVisible}
                  />
                </div>
              ))}
            </div>
            
            <Pagination
              currentPage={pagination.page}
              totalPages={pagination.pages}
              onPageChange={goToPage}
            />
            
            <div className="results-info">
              Показано {apartments.length} из {pagination.total} квартир
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ApartmentList;