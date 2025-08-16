// src/api/skills.js
import client from './client';

export const fetchSkills = async (userId) => {
  const res = await client.get(`/users/${userId}/skills`);
  return res.data;
};

export const fetchSkill = async (userId, skillId) => {
  const res = await client.get(`/users/${userId}/skills/${skillId}`);
  return res.data;
};

export const createSkill = async (userId, skillData) => {
  const res = await client.post(`/users/${userId}/skills`, skillData);
  return res.data;
};

export const updateSkill = async (userId, skillId, skillData) => {
    const payload = {
    skill_name: skillData.skill_name,
    level: skillData.level,
    category: skillData.category,
  };
  const res = await client.put(`/users/${userId}/skills/${skillId}`, payload);
  return res.data;
};

export const deleteSkill = async (userId, skillId) => {
  const res = await client.delete(`/users/${userId}/skills/${skillId}`);
  return res.data;
};
