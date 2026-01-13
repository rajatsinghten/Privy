import axios from 'axios';

// Base API client configuration
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000',
  headers: {
    'Content-Type': 'application/json',
  },
});

// JWT interceptor stub
apiClient.interceptors.request.use(
  (config) => {
    // TODO: Retrieve token from storage and attach to headers
    const token = null; // Placeholder: localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor stub
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // TODO: Handle 401 unauthorized, token refresh, etc.
    return Promise.reject(error);
  }
);

export default apiClient;
