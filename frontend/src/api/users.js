// src/api/users.js
import client from './client';

export const fetchUsers = async (filters = {}) => {
  const res = await client.get('/users', { params: filters });
  return res.data;
};

export const fetchUser = async (id) => {
  const res = await client.get(`/users/${id}`);
  return res.data;
};

export const updateUser = async (id, userData) => {
  const res = await client.put(`/users/${id}`, userData);
  return res.data;
};

export const deleteUser = async (id) => {
  const res = await client.delete(`/users/${id}`);
  return res.data;
};
