export const BASE_URL =
  process.env.EXPO_PUBLIC_API_BASE_URL ?? 'http://localhost:8000';

export const ENDPOINTS = {
  auth: {
    login: '/auth/login',
    register: '/auth/register',
  },
  robot: {
    connect: '/robot/connect',
    disconnect: '/robot/disconnect',
    move: '/robot/move',
    stop: '/robot/stop',
    standup: '/robot/standup',
    sitdown: '/robot/sitdown',
    status: '/robot/status',
  },
  actions: {
    list: '/actions',
    execute: (id) => `/actions/${id}`,
  },
  history: {
    list: '/history',
    create: '/history',
  },
};
