// src/api/auth.js
import client from './client';

export const register = async (payload) => {
  const { data } = await client.post('/api/v1/auth/register', payload);
  return data;
};

export const login = async ({ email, password }) => {
  const { data } = await client.post('/api/v1/auth/login', { email, password });
  return data;
};

export const refreshToken = async (token) => {
  const { data } = await client.post('/api/v1/auth/refresh', { token });
  return data;
};

export const logout = async (token) => {
  const { data } = await client.post('/api/v1/auth/logout', { token });
  return data;
};
