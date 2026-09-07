import axios from 'axios';

// Base URL: in dev, Vite proxies /api/v1 -> http://localhost:5000/api/v1
const API_BASE = '/api/v1';

export const apiClient = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Request interceptor: attach auth token
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('zsyiogpt_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor: graceful fallback
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    // If unauthorized, could clear or refresh guest session
    if (error.response && error.response.status === 401) {
      console.warn('[API Client] Unauthorized request - checking guest fallback');
    }
    return Promise.reject(error);
  }
);

// Retrieve existing authenticated user session
export async function initializeAuth() {
  const existingToken = localStorage.getItem('zsyiogpt_token');
  const existingUser = localStorage.getItem('zsyiogpt_user');

  if (existingToken && existingUser) {
    try {
      const parsed = JSON.parse(existingUser);
      if (parsed && parsed.role !== 'guest') {
        return parsed;
      }
    } catch {
      // ignore
    }
  }

  // Clear any residual guest tokens
  localStorage.removeItem('zsyiogpt_token');
  localStorage.removeItem('zsyiogpt_user');
  return null;
}
