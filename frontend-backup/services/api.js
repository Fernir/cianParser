import axios from 'axios';
import { API_CONFIG, API_ENDPOINTS } from './config';

const api = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Функция для удаления пустых параметров
const removeEmptyParams = (params) => {
  const cleanedParams = {};
  Object.keys(params).forEach(key => {
    const value = params[key];
    if (value !== '' && value !== null && value !== undefined) {
      cleanedParams[key] = value;
    }
  });
  return cleanedParams;
};

export const getApartments = async (params) => {
  try {
    const cleanedParams = removeEmptyParams(params);
    console.log('🚀 Sending request with params:', cleanedParams);
    
    const response = await api.get(API_ENDPOINTS.APARTMENTS, { 
      params: cleanedParams 
    });
    
    return response.data;
  } catch (error) {
    console.error('❌ Error details:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
      config: error.config,
      params: error.config?.params
    });
    throw error;
  }
};

export const getApartmentById = async (id) => {
  try {
    const response = await api.get(API_ENDPOINTS.APARTMENT_DETAIL(id));
    return response.data;
  } catch (error) {
    console.error(`Error fetching apartment ${id}:`, error);
    throw error;
  }
};

export const getStatistics = async () => {
  try {
    const response = await api.get(API_ENDPOINTS.STATISTICS);
    return response.data;
  } catch (error) {
    console.error('Error fetching statistics:', error);
    throw error;
  }
};