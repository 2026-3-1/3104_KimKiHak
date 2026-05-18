import axios from 'axios';
import { STORAGE_KEYS } from '../../constants';

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3000';

export const http = axios.create({
  baseURL: apiBaseUrl,
  timeout: 10000,
});

http.interceptors.request.use((config) => {
  const savedAuth = localStorage.getItem(STORAGE_KEYS.AUTH);
  if (!savedAuth) {
    return config;
  }

  try {
    const parsed = JSON.parse(savedAuth) as { accessToken?: string };
    if (parsed.accessToken) {
      config.headers = config.headers ?? {};
      config.headers.Authorization = `Bearer ${parsed.accessToken}`;
    }
  } catch {
    localStorage.removeItem(STORAGE_KEYS.AUTH);
  }

  return config;
});
