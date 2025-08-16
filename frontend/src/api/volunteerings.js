import client from './client';

export const fetchVolunteerings = (userId) =>
  client.get(`/users/${userId}/volunteerings`);

export const createVolunteering = (userId, data) =>
  client.post(`/users/${userId}/volunteerings`, data);

export const updateVolunteering = (userId, volId, data) =>
  client.put(`/users/${userId}/volunteerings/${volId}`, data);

export const deleteVolunteering = (userId, volId) =>
  client.delete(`/users/${userId}/volunteerings/${volId}`);
