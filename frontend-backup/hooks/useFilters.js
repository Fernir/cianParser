import { useState } from 'react';

export const useFilters = (onFilterChange) => {
  const [filters, setFilters] = useState({
    min_price: '',
    max_price: '',
    rooms: '',
    district: '',
    underground: '',
    min_area: '',
    max_area: '',
    author_type: '',
    has_photo: false,
    is_owner: false,
    sort_by: 'price_asc'
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Подготавливаем фильтры для отправки
    const preparedFilters = { ...filters };
    
    // Удаляем пустые значения
    Object.keys(preparedFilters).forEach(key => {
      if (preparedFilters[key] === '' || preparedFilters[key] === false) {
        delete preparedFilters[key];
      }
    });
    
    onFilterChange(preparedFilters);
  };

  const handleReset = () => {
    setFilters({
      min_price: '',
      max_price: '',
      rooms: '',
      district: '',
      underground: '',
      min_area: '',
      max_area: '',
      author_type: '',
      has_photo: false,
      is_owner: false,
      sort_by: 'price_asc'
    });
    onFilterChange({});
  };

  return {
    filters,
    handleChange,
    handleSubmit,
    handleReset
  };
};