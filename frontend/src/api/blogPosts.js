// src/api/blogPosts.js
import client from './client';

export const fetchBlogPosts = async (userId) => {
  const res = await client.get(`/api/v1/users/${userId}/blog-posts`);
  return res.data;
};

export const fetchBlogPost = async (userId, postId) => {
  const res = await client.get(`/api/v1/users/${userId}/blog-posts/${postId}`);
  return res.data;
};

export const createBlogPost = async (userId, postData) => {
  const res = await client.post(`/api/v1/users/${userId}/blog-posts`, postData);
  return res.data;
};

export const updateBlogPost = async (userId, postId, postData) => {
  const res = await client.put(`/api/v1/users/${userId}/blog-posts/${postId}`, postData);
  return res.data;
};

export const deleteBlogPost = async (userId, postId) => {
  const res = await client.delete(`/users/${userId}/blog-posts/${postId}`);
  return res.data;
};
