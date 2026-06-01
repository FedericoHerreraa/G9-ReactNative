import client from './client';
import { ENDPOINTS } from '../constants/api';

const { connection, motion } = ENDPOINTS;

export async function connectRobot({ robot_type, network_interface }) {
  const body = { robot_type };
  if (network_interface?.trim()) {
    body.network_interface = network_interface.trim();
  }
  const { data } = await client.post(connection.connect, body);
  return data;
}

export async function disconnectRobot() {
  const { data } = await client.post(connection.disconnect);
  return data;
}

export async function getRobotStatus() {
  const { data } = await client.get(connection.status);
  return data;
}

export async function moveRobot({ vx, vy, vyaw }) {
  const { data } = await client.post(motion.move, { vx, vy, vyaw });
  return data;
}

export async function stopRobot() {
  const { data } = await client.post(motion.stop);
  return data;
}

export async function standUpRobot() {
  const { data } = await client.post(motion.standup);
  return data;
}

export async function sitDownRobot() {
  const { data } = await client.post(motion.sitdown);
  return data;
}

export async function dampRobot() {
  const { data } = await client.post(motion.damp);
  return data;
}

async function postToggle(endpoint, enable) {
  const { data } = await client.post(endpoint, { enable });
  return data;
}

export function handstandRobot(enable = true) {
  return postToggle(motion.handstand, enable);
}

export function freeBoundRobot(enable = true) {
  return postToggle(motion.freebound, enable);
}

export function freeAvoidRobot(enable = true) {
  return postToggle(motion.freeavoid, enable);
}

export function walkUprightRobot(enable = true) {
  return postToggle(motion.walkupright, enable);
}

export function crossStepRobot(enable = true) {
  return postToggle(motion.crossstep, enable);
}

export function freeJumpRobot(enable = true) {
  return postToggle(motion.freejump, enable);
}
