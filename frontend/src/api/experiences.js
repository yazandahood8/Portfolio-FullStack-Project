// src/api/experiences.js
import client from './client';

export const fetchExperiences = async (userId) => {
  const res = await client.get(`/api/v1/users/${userId}/experiences`);
  return res.data;
};

export const fetchExperience = async (userId, expId) => {
  const res = await client.get(`/api/v1/users/${userId}/experiences/${expId}`);
  return res.data;
};

export const createExperience = async (userId, expData) => {
  const res = await client.post(`/api/v1/users/${userId}/experiences`, expData);
  return res.data;
};

export const updateExperience = async (userId, expId, expData) => {
  const res = await client.put(`/api/v1/users/${userId}/experiences/${expId}`, expData);
  return res.data;
};

export const deleteExperience = async (userId, expId) => {
  const res = await client.delete(`/api/v1/users/${userId}/experiences/${expId}`);
  return res.data;
};
