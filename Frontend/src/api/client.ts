import axios, { AxiosError } from 'axios';
import type { ApiError } from './types';

const baseURL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000';

export const apiClient = axios.create({
  baseURL,
  timeout: 60000,
  headers: { 'Content-Type': 'application/json' },
});

/** Extract a human-friendly message from an axios error. */
export function extractErrorMessage(error: unknown): string {
  const axiosError = error as AxiosError<ApiError>;
  if (axiosError?.response?.data?.error?.message) {
    return axiosError.response.data.error.message;
  }
  if (axiosError?.message) {
    return axiosError.message;
  }
  return 'An unexpected error occurred.';
}
