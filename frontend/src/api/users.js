// src/api/users.js
import client from './client';

export const fetchUsers = async (filters = {}) => {
  const res = await client.get('/api/v1/users', { params: filters });
  return res.data;
};

export const fetchUser = async (id) => {
  const res = await client.get(`/api/v1/users/${id}`);
  return res.data;
};

export const updateUser = async (id, userData) => {
  const res = await client.put(`/api/v1/users/${id}`, userData);
  return res.data;
};

export const deleteUser = async (id) => {
  const res = await client.delete(`/api/v1/users/${id}`);
  return res.data;
};
