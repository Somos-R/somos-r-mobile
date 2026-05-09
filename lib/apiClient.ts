import axios from 'axios';

const apiClient = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:8000',
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
});

apiClient.interceptors.request.use((config) => {
  const token = globalThis.__authToken;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default apiClient;
