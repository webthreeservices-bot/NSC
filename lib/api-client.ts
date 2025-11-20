import axios, { AxiosInstance, AxiosRequestConfig, AxiosError } from 'axios';
import { 
  getTokenFromStorage, 
  getRefreshTokenFromStorage,
  setTokenToStorage,
  setRefreshTokenToStorage,
  removeTokenFromStorage
} from './auth';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '/api';

class ApiClient {
  private client: AxiosInstance;
  private isRefreshing = false;
  private failedQueue: Array<{
    resolve: (value?: any) => void;
    reject: (reason?: any) => void;
  }> = [];

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.client.interceptors.request.use((config) => {
      const token = getTokenFromStorage();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    this.client.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };

        // If error is 401 and we haven't retried yet
        if (error.response?.status === 401 && !originalRequest._retry) {
          if (this.isRefreshing) {
            // If already refreshing, queue this request
            return new Promise((resolve, reject) => {
              this.failedQueue.push({ resolve, reject });
            }).then(() => {
              return this.client(originalRequest);
            }).catch((err) => {
              return Promise.reject(err);
            });
          }

          originalRequest._retry = true;
          this.isRefreshing = true;

          try {
            const refreshToken = getRefreshTokenFromStorage();
            
            if (!refreshToken) {
              throw new Error('No refresh token available');
            }

            const response = await axios.post('/api/auth/refresh', {
              refreshToken,
            });

            const { token, refreshToken: newRefreshToken } = response.data;

            setTokenToStorage(token);
            setRefreshTokenToStorage(newRefreshToken);

            // Update the authorization header
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
            }

            // Process failed queue
            this.failedQueue.forEach(({ resolve }) => resolve());
            this.failedQueue = [];

            return this.client(originalRequest);
          } catch (refreshError) {
            // Failed to refresh token
            this.failedQueue.forEach(({ reject }) => reject(refreshError));
            this.failedQueue = [];
            
            removeTokenFromStorage();
            
            if (typeof window !== 'undefined') {
              // Check if current path is admin
              const isAdminPath = window.location.pathname.startsWith('/admin');
              window.location.href = isAdminPath ? '/admin/admin-login' : '/login';
            }
            
            return Promise.reject(refreshError);
          } finally {
            this.isRefreshing = false;
          }
        }

        // Handle 403 Forbidden (expired/invalid token)
        if (error.response?.status === 403) {
          removeTokenFromStorage();
          
          if (typeof window !== 'undefined') {
            const isAdminPath = window.location.pathname.startsWith('/admin');
            window.location.href = isAdminPath ? '/admin/admin-login' : '/login';
          }
        }

        return Promise.reject(error);
      }
    );
  }

  // Default generic to `any` so callers that don't provide a generic won't
  // receive `unknown` and cause downstream property access errors.
  async get<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.get<T>(url, config);
    return response.data;
  }

  async post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.post<T>(url, data, config);
    return response.data;
  }

  async put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.put<T>(url, data, config);
    return response.data;
  }

  async delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.delete<T>(url, config);
    return response.data;
  }
}

export const apiClient = new ApiClient();
