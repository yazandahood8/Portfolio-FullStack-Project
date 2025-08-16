import client from './client';

export const fetchCertifications = (userId) =>
  client.get(`/users/${userId}/certifications`);

export const createCertification = (userId, data) =>
  client.post(`/users/${userId}/certifications`, data);

export const updateCertification = (userId, certId, data) =>
  client.put(`/users/${userId}/certifications/${certId}`, data);

export const deleteCertification = (userId, certId) =>
  client.delete(`/users/${userId}/certifications/${certId}`);
