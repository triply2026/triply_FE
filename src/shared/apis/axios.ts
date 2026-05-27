import axios from 'axios';
import { useAuthStore } from '@stores/auth-store';
import { useUIStore } from '@stores/ui-store';

const API_BASE_URL = import.meta.env.PROD ? (import.meta.env.VITE_API_BASE_URL ?? '') : '';

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
  withCredentials: true,
});

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (axios.isAxiosError(error) && error.response) {
      const { status, data } = error.response;

      if (status === 401) {
        useAuthStore.getState().logout(false);
        useUIStore.getState().openLoginRequiredModal('세션이 만료되었습니다. 다시 로그인해주세요.');
        return Promise.reject(new ApiError(status, '세션이 만료되었습니다. 다시 로그인해주세요.'));
      }

      const message = (data as { message?: string; error?: string })?.message
        ?? (data as { message?: string; error?: string })?.error
        ?? '요청에 실패했습니다.';
      return Promise.reject(new ApiError(status, message));
    }
    return Promise.reject(error);
  },
);

export class ApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

export default axiosInstance;