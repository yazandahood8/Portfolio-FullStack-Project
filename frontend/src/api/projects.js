// src/api/projects.js
import client from './client';

export const fetchProjects = async (userId) => {
  const res = await client.get(`/users/${userId}/projects`);
  return res.data;
};

export const fetchProject = async (userId, projectId) => {
  const res = await client.get(`/users/${userId}/projects/${projectId}`);
  return res.data;
};

export const createProject = async (userId, projectData) => {
  const res = await client.post(`/users/${userId}/projects`, projectData);
  return res.data;
};

export const updateProject = async (userId, projectId, projectData) => {
  const res = await client.put(`/users/${userId}/projects/${projectId}`, projectData);
  return res.data;
};

export const deleteProject = async (userId, projectId) => {
  const res = await client.delete(`/users/${userId}/projects/${projectId}`);
  return res.data;
};
