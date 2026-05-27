import client from './client';
import { ENDPOINTS } from '../constants/api';

export async function connectRobot(payload) {
  const { data } = await client.post(ENDPOINTS.robot.connect, payload);
  return data;
}

export async function disconnectRobot() {
  const { data } = await client.post(ENDPOINTS.robot.disconnect);
  return data;
}

export async function moveRobot(direction) {
  const { data } = await client.post(ENDPOINTS.robot.move, { direction });
  return data;
}

export async function stopRobot() {
  const { data } = await client.post(ENDPOINTS.robot.stop);
  return data;
}

export async function standUpRobot() {
  const { data } = await client.post(ENDPOINTS.robot.standup);
  return data;
}

export async function sitDownRobot() {
  const { data } = await client.post(ENDPOINTS.robot.sitdown);
  return data;
}

export async function getRobotStatus() {
  const { data } = await client.get(ENDPOINTS.robot.status);
  return data;
}
