import client from './client';
import { ENDPOINTS } from '../constants/api';

export async function login(identifier, password) {
  const { data } = await client.post(ENDPOINTS.auth.login, { identifier, password });
  return data;
}

export async function register(username, email, password) {
  const { data } = await client.post(ENDPOINTS.auth.register, { username, email, password });
  return data;
}
