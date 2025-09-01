import client from './client';

export const fetchCertifications = (userId) =>
  client.get(`/api/v1/users/${userId}/certifications`);

export const createCertification = (userId, data) =>
  client.post(`/api/v1/users/${userId}/certifications`, data);

export const updateCertification = (userId, certId, data) =>
  client.put(`/api/v1/users/${userId}/certifications/${certId}`, data);

export const deleteCertification = (userId, certId) =>
  client.delete(`/api/v1/users/${userId}/certifications/${certId}`);
