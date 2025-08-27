// src/pages/MessagesPage/MessagesPage.jsx
import React, { useEffect, useMemo, useState } from 'react';
import { fetchMessages, markMessageRead, deleteMessage } from '../../api/messages';
import useAuth from '../../hooks/useAuth';
import './MessagesPage.scss';

function fmtDate(ts) {
  try {
    return new Date(ts).toLocaleString();
  } catch {
    return ts || '';
  }
}

export default function MessagesPage() {
  const { isAuthenticated, user } = useAuth();
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');

  const [openId, setOpenId] = useState(null); // modal: which message is open
  const openMsg = useMemo(() => items.find(m => m.id === openId), [items, openId]);

  // Only show if logged in; optionally gate to admin in UI
  const isAdmin = (user?.role === 'admin');

  useEffect(() => {
    let alive = true;
    (async () => {
      if (!isAuthenticated) return;
      setLoading(true);
      setErr('');
      try {
        const { data } = await fetchMessages(page, limit);
        if (!alive) return;
        setItems(Array.isArray(data?.items) ? data.items : []);
        setTotal(Number(data?.total || 0));
      } catch (e) {
        if (alive) setErr(e?.response?.data?.error || 'Failed to load messages.');
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, [isAuthenticated, page, limit]);

  const pages = Math.max(1, Math.ceil(total / limit));

  const onOpen = async (id) => {
    setOpenId(id);
    try {
      // mark read if unread
      const msg = items.find(m => m.id === id);
      if (msg && !msg.read) {
        const { data } = await markMessageRead(id);
        setItems(prev => prev.map(m => (m.id === id ? data : m)));
      }
    } catch { /* ignore UI errors */ }
  };

  const onDelete = async (id) => {
    if (!window.confirm('Delete this message?')) return;
    try {
      await deleteMessage(id);
      setItems(prev => prev.filter(m => m.id !== id));
      setTotal(t => Math.max(0, t - 1));
      if (openId === id) setOpenId(null);
    } catch {
      alert('Failed to delete.');
    }
  };

  if (!isAuthenticated) {
    return (
      <main className="messages-wrap container py-4">
        <p className="text-danger">You must be logged in to view messages.</p>
      </main>
    );
  }

  return (
    <main className="messages-wrap container py-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h1 className="fw-bold m-0">Inbox</h1>
        {!isAdmin && (
          <span className="badge bg-secondary">User</span>
        )}
      </div>

      {err && <div className="alert alert-danger">{err}</div>}
      {loading ? (
        <div>Loading…</div>
      ) : items.length === 0 ? (
        <div className="text-muted">No messages yet.</div>
      ) : (
        <div className="table-responsive">
          <table className="table align-middle messages-table">
            <thead>
              <tr>
                <th>Status</th>
                <th>From</th>
                <th>Email</th>
                <th>Subject</th>
                <th>Received</th>
                <th className="text-end">Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map(msg => (
                <tr key={msg.id} className={msg.read ? '' : 'unread'}>
                  <td>
                    {msg.read ? (
                      <span className="badge bg-light text-dark">Read</span>
                    ) : (
                      <span className="badge bg-primary">New</span>
                    )}
                  </td>
                  <td className="fw-semibold">{msg.name}</td>
                  <td><a href={`mailto:${msg.email}`}>{msg.email}</a></td>
                  <td className="subject-cell">{msg.subject || <em>(no subject)</em>}</td>
                  <td className="text-nowrap">{fmtDate(msg.created_at || msg.createdAt)}</td>
                  <td className="text-end">
                    <button className="btn btn-sm btn-outline-primary me-2" onClick={() => onOpen(msg.id)}>
                      Open
                    </button>
                    <button className="btn btn-sm btn-outline-danger" onClick={() => onDelete(msg.id)}>
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pagination */}
          <div className="d-flex justify-content-between align-items-center mt-3">
            <div className="text-muted small">
              Showing {(page - 1) * limit + 1}–{Math.min(page * limit, total)} of {total}
            </div>
            <div className="btn-group">
              <button
                className="btn btn-outline-secondary"
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page <= 1}
              >
                ‹ Prev
              </button>
              <span className="btn btn-outline-secondary disabled">
                Page {page} / {pages}
              </span>
              <button
                className="btn btn-outline-secondary"
                onClick={() => setPage(p => Math.min(pages, p + 1))}
                disabled={page >= pages}
              >
                Next ›
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal */}
      {openMsg && (
        <div className="msg-modal" onClick={() => setOpenId(null)} role="dialog" aria-modal="true">
          <div className="msg-modal__content" onClick={(e) => e.stopPropagation()}>
            <div className="d-flex justify-content-between align-items-start">
              <h5 className="m-0">{openMsg.subject || '(no subject)'}</h5>
              <button className="btn-close" onClick={() => setOpenId(null)} aria-label="Close" />
            </div>
            <div className="text-muted small mt-1">
              From <strong>{openMsg.name}</strong> &lt;<a href={`mailto:${openMsg.email}`}>{openMsg.email}</a>&gt;
              <span className="ms-2">• {fmtDate(openMsg.created_at || openMsg.createdAt)}</span>
            </div>
            <hr />
            <div className="msg-body">
              {openMsg.message || <em>(empty)</em>}
            </div>
            <div className="text-end mt-3">
              <button className="btn btn-outline-danger" onClick={() => onDelete(openMsg.id)}>Delete</button>
              <button className="btn btn-primary ms-2" onClick={() => setOpenId(null)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
