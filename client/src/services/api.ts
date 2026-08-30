import axios from 'axios';
import { getAuthToken, removeAuthToken } from '../utils/secureStorage';

// Get API base URL from env or fallback to relative /api
const getApiBaseUrl = (): string => {
  const envUrl = import.meta.env.VITE_API_URL;
  if (envUrl && envUrl.trim() !== '') return envUrl;
  return '/api';
};

export const api = axios.create({
  baseURL: getApiBaseUrl(),
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to attach JWT token from secure session storage
api.interceptors.request.use(
  config => {
    const token = getAuthToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

// Response interceptor for consistent error extraction and handling 401
api.interceptors.response.use(
  response => response,
  error => {
    const message =
      error.response?.data?.message ||
      error.message ||
      'An unexpected network error occurred';
      
    // If token expired/invalid, clear session token securely
    if (error.response?.status === 401 && !error.config.url?.includes('/auth/login')) {
      removeAuthToken();
    }

    return Promise.reject(new Error(message));
  }
);

export default api;
