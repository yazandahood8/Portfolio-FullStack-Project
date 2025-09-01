import client from './client';

export const fetchVolunteerings = (userId) =>
  client.get(`/api/v1/users/${userId}/volunteerings`);

export const createVolunteering = (userId, data) =>
  client.post(`/api/v1/users/${userId}/volunteerings`, data);

export const updateVolunteering = (userId, volId, data) =>
  client.put(`/api/v1/users/${userId}/volunteerings/${volId}`, data);

export const deleteVolunteering = (userId, volId) =>
  client.delete(`/api/v1/users/${userId}/volunteerings/${volId}`);
