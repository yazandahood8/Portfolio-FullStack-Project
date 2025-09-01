// src/api/skills.js
import client from './client';

export const fetchSkills = async (userId) => {
  const res = await client.get(`/api/v1/users/${userId}/skills`);
  return res.data;
};

export const fetchSkill = async (userId, skillId) => {
  const res = await client.get(`/api/v1/users/${userId}/skills/${skillId}`);
  return res.data;
};

export const createSkill = async (userId, skillData) => {
  const res = await client.post(`/api/v1/users/${userId}/skills`, skillData);
  return res.data;
};

export const updateSkill = async (userId, skillId, skillData) => {
    const payload = {
    skill_name: skillData.skill_name,
    level: skillData.level,
    category: skillData.category,
  };
  const res = await client.put(`/api/v1/users/${userId}/skills/${skillId}`, payload);
  return res.data;
};

export const deleteSkill = async (userId, skillId) => {
  const res = await client.delete(`/api/v1/users/${userId}/skills/${skillId}`);
  return res.data;
};
