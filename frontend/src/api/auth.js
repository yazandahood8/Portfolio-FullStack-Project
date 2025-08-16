// src/api/auth.js
import client from './client';

export const register = async ({ full_name, email, password, phone, location, profile_image_url, about, bio }) => {
  const res = await client.post('/auth/register', {
    full_name,
    email,
    password,
    phone,
    location,
    profile_image_url,
   
    about,
    bio
  });
  return res.data;
};

export const login = async ({ email, password }) => {
  const res = await client.post('/auth/login', { email, password });
  return res.data;
};

export const refreshToken = async (token) => {
  const res = await client.post('/auth/refresh', { token });
  return res.data;
};

export const logout = async (token) => {
  const res = await client.post('/auth/logout', { token });
  return res.data;
};
