import client from './client';

// GET all
export const fetchEducations = (userId) =>
  client.get(`/api/v1/users/${userId}/educations`);

// POST
export const createEducation = (userId, data) =>
  client.post(`/api/v1/users/${userId}/educations`, data);

// PUT
export const updateEducation = (userId, eduId, data) =>
  client.put(`/api/v1/users/${userId}/educations/${eduId}`, data);

// DELETE
export const deleteEducation = (userId, eduId) =>
  client.delete(`/api/v1/users/${userId}/educations/${eduId}`);
