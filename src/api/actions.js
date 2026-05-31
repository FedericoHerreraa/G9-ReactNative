import client from './client';
import { ENDPOINTS } from '../constants/api';

export async function getActions() {
  const { data } = await client.get(ENDPOINTS.actions.list);
  return data;
}

export async function postAction(actionName) {
  const { data } = await client.post(ENDPOINTS.actions.execute(actionName));
  return data;
}
