export const BASE_URL =
  process.env.EXPO_PUBLIC_API_BASE_URL ?? 'http://localhost:8000';

export const ENDPOINTS = {
  auth: {
    login: '/auth/token',
    register: '/auth/register',
  },
  robot: {
    connect: '/connect',
    disconnect: '/disconnect',
    move: '/move',
    stop: '/stop',
    standup: '/standup',
    sitdown: '/sitdown',
    status: '/status',
  },
  actions: {
    list: '/actions',
    execute: (name) => `/action/${name}`,
  },
  history: {
    list: '/history',
    create: '/history',
  },
};
