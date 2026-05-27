import client from './client';
import { ENDPOINTS } from '../constants/api';

export async function login(email, password) {
  const { data } = await client.post(ENDPOINTS.auth.login, { email, password });
  return data;
}

export async function register(email, password, name) {
  const { data } = await client.post(ENDPOINTS.auth.register, {
    email,
    password,
    name,
  });
  return data;
}
