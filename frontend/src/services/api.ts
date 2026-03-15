import { Apartment, PaginatedResponse, Filters } from '@/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

const removeEmptyParams = (params: Record<string, any>): Record<string, any> => {
  const cleaned: Record<string, any> = {};
  Object.keys(params).forEach(key => {
    const value = params[key];
    if (value !== '' && value !== null && value !== undefined) {
      cleaned[key] = value;
    }
  });
  return cleaned;
};

// Для серверных компонентов (использует fetch напрямую)
export async function getApartments(params: Filters = {}): Promise<PaginatedResponse> {
  const cleanedParams = removeEmptyParams(params);
  const queryString = new URLSearchParams(cleanedParams).toString();
  
  const response = await fetch(`${API_BASE_URL}/apartments/?${queryString}`, {
    headers: {
      'Content-Type': 'application/json',
    },
    cache: 'no-store',
  });
  
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  
  return response.json();
}

export async function getApartmentById(id: string | number): Promise<Apartment> {
  const response = await fetch(`${API_BASE_URL}/apartments/${id}`, {
    headers: {
      'Content-Type': 'application/json',
    },
    cache: 'no-store',
  });
  
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  
  return response.json();
}