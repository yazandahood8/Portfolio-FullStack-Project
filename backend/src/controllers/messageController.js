import * as Message from '../models/messageModel.js';

const badReq = (res, msg) => res.status(400).json({ error: msg });

export async function createMessage(req, res) {
  try {
    const { name, email, subject, message } = req.body || {};
    if (!name || !email || !message) {
      return badReq(res, 'name, email, and message are required');
    }
    const row = await Message.create({ name, email, subject, message });
    return res.status(201).json({ message: 'Message received', data: row });
  } catch (err) {
    console.error('createMessage error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

export async function getMessages(req, res) {
  try {
    const data = await Message.findAll({
      page: req.query.page,
      limit: req.query.limit,
    });
    return res.json(data);
  } catch (err) {
    console.error('getMessages error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

export async function getMessageById(req, res) {
  try {
    const row = await Message.findById(req.params.id);
    if (!row) return res.status(404).json({ error: 'Not found' });
    return res.json(row);
  } catch (err) {
    console.error('getMessageById error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

export async function markRead(req, res) {
  try {
    const row = await Message.markRead(req.params.id);
    if (!row) return res.status(404).json({ error: 'Not found' });
    return res.json(row);
  } catch (err) {
    console.error('markRead error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

export async function deleteMessage(req, res) {
  try {
    const row = await Message.remove(req.params.id);
    if (!row) return res.status(404).json({ error: 'Not found' });
    return res.json({ message: 'Deleted', id: row.id });
  } catch (err) {
    console.error('deleteMessage error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
