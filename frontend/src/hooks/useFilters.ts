import { useState } from 'react';
import { Filters } from '@/types';

export const useFilters = (onFilterChange: (filters: Filters) => void) => {
  const [filters, setFilters] = useState<Filters>({
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
    is_agent: false,
    sort_by: 'price_asc'
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    
    setFilters(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const preparedFilters: Filters = { ...filters };
    
    Object.keys(preparedFilters).forEach(key => {
      const k = key as keyof Filters;
      if (preparedFilters[k] === '' || preparedFilters[k] === false) {
        delete preparedFilters[k];
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
      is_agent: false,
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