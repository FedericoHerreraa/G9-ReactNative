
export const BASE_URL =
  process.env.EXPO_PUBLIC_API_BASE_URL ?? 'http://localhost:8000';

export const ENDPOINTS = {
  auth: {
    register: '/auth/register',
    login: '/auth/token',
  },
  connection: {
    connect: '/connect',
    disconnect: '/disconnect',
    status: '/status',
  },
  motion: {
    move: '/move',
    stop: '/stop',
    standup: '/standup',
    sitdown: '/sitdown',
    damp: '/damp',
    handstand: '/handstand',
    freebound: '/freebound',
    freeavoid: '/freeavoid',
    walkupright: '/walkupright',
    crossstep: '/crossstep',
    freejump: '/freejump',
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
