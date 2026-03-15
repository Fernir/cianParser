export const API_CONFIG = {
  BASE_URL: 'http://localhost:8000/api',
  TIMEOUT: 10000,
  DEFAULT_PAGE_SIZE: 12
};

export const API_ENDPOINTS = {
  APARTMENTS: '/apartments',
  APARTMENT_DETAIL: (id: string | number) => `/apartments/${id}`,
  STATISTICS: '/apartments/stats/overview'
};