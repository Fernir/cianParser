import { useState, useEffect } from 'react';
import { getApartments } from '../services/api';

export const useApartments = (initialParams = {}) => {
  const [apartments, setApartments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    pages: 1,
    total: 0,
    per_page: 12
  });
  const [params, setParams] = useState(initialParams);

  useEffect(() => {
    fetchApartments();
  }, [params.page, params]);

  const fetchApartments = async () => {
    setLoading(true);
    try {
      const data = await getApartments(params);
      setApartments(data.items);
      setPagination({
        page: data.page,
        pages: data.pages,
        total: data.total,
        per_page: data.per_page
      });
      setError(null);
    } catch (err) {
      setError('Не удалось загрузить квартиры');
    } finally {
      setLoading(false);
    }
  };

  const updateParams = (newParams) => {
    setParams(prev => ({
      ...prev,
      ...newParams,
      page: newParams.page || 1
    }));
  };

  const goToPage = (page) => {
    setParams(prev => ({ ...prev, page }));
  };

  return {
    apartments,
    loading,
    error,
    pagination,
    params,
    updateParams,
    goToPage,
    refetch: fetchApartments
  };
};