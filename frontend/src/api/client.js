// src/api/client.js
import axios from 'axios';

//const baseURL = 'http://localhost:3000/api/v1';
const baseURL = 'https://portfolio-backend-ujap.onrender.com';

const client = axios.create({
  baseURL,
});

client.interceptors.request.use(config => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
console.log('👉 API base URL:', baseURL);

export default client;
