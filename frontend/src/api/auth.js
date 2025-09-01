// src/api/auth.js
import client from './client';
const API = 'https://portfolio-backend-ujap.onrender.com';

export const register = async ({ full_name, email, password, phone, location, profile_image_url, about, bio }) => {
  const res = await fetch(`${API}/api/v1/auth/register`, {
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
  const res = await client.post('${API}/api/v1//auth/login', { email, password });
  return res.data;
};

export const refreshToken = async (token) => {
  const res = await client.post('${API}/api/v1//auth/refresh', { token });
  return res.data;
};

export const logout = async (token) => {
  const res = await client.post('${API}/api/v1//auth/logout', { token });
  return res.data;
};
