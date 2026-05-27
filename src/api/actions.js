import client from './client';
import { ENDPOINTS } from '../constants/api';

export async function getActions() {
  const { data } = await client.get(ENDPOINTS.actions.list);
  return data;
}

export async function postAction(actionId, payload = {}) {
  const { data } = await client.post(ENDPOINTS.actions.execute(actionId), payload);
  return data;
}
