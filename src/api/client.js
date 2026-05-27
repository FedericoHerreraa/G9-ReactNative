import axios from 'axios';

import { BASE_URL } from '../constants/api';
import { clearSession, getToken } from '../utils/storage';
import { navigateToLogin } from '../navigation/navigationRef';

const client = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

let onUnauthorized = null;

export function setUnauthorizedHandler(handler) {
  onUnauthorized = handler;
}

client.interceptors.request.use(async (config) => {
  const token = await getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

client.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      await clearSession();
      onUnauthorized?.();
      navigateToLogin();
    }
    return Promise.reject(error);
  }
);

export default client;
