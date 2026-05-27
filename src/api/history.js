import client from './client';
import { ENDPOINTS } from '../constants/api';

export async function getHistory() {
  const { data } = await client.get(ENDPOINTS.history.list);
  return data;
}

export async function postCommand(command) {
  const { data } = await client.post(ENDPOINTS.history.create, command);
  return data;
}
