import { useState, useEffect } from 'react';
import { getApartments } from '@/services/api';
import { Apartment, Filters, PaginatedResponse } from '@/types';

interface UseApartmentsReturn {
  apartments: Apartment[];
  loading: boolean;
  error: string | null;
  pagination: {
    page: number;
    pages: number;
    total: number;
    per_page: number;
  };
  params: Filters & { page?: number; per_page?: number };
  updateParams: (newParams: Filters) => void;
  goToPage: (page: number) => void;
  refetch: () => Promise<void>;
}

export const useApartments = (initialParams: Filters = {}): UseApartmentsReturn => {
  const [apartments, setApartments] = useState<Apartment[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    pages: 1,
    total: 0,
    per_page: 12
  });
  const [params, setParams] = useState<Filters & { page?: number; per_page?: number }>({
    page: 1,
    per_page: 12,
    ...initialParams
  });

  const fetchApartments = async () => {
    setLoading(true);
    try {
      const data: PaginatedResponse = await getApartments(params);
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
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApartments();
  }, [params]);

  const updateParams = (newParams: Filters) => {
    setParams(prev => ({ ...prev, ...newParams, page: 1 }));
  };

  const goToPage = (page: number) => {
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