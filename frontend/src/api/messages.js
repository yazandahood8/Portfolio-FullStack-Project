// src/api/messages.js
import client from './client';

// GET /api/v1/messages?page=&limit=
export const fetchMessages = (page = 1, limit = 20) =>
  client.get('/messages', { params: { page, limit } });

// PATCH /api/v1/messages/:id/read
export const markMessageRead = (id) =>
  client.patch(`/messages/${id}/read`);

// DELETE /api/v1/messages/:id
export const deleteMessage = (id) =>
  client.delete(`/messages/${id}`);
