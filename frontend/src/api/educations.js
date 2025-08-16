import client from './client';

// GET all
export const fetchEducations = (userId) =>
  client.get(`/users/${userId}/educations`);

// POST
export const createEducation = (userId, data) =>
  client.post(`/users/${userId}/educations`, data);

// PUT
export const updateEducation = (userId, eduId, data) =>
  client.put(`/users/${userId}/educations/${eduId}`, data);

// DELETE
export const deleteEducation = (userId, eduId) =>
  client.delete(`/users/${userId}/educations/${eduId}`);
