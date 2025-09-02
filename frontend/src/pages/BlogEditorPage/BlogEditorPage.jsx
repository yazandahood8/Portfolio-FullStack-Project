// src/pages/BlogEditorPage.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import client from '../../api/client';
import useAuth from '../../hooks/useAuth';
import './BlogEditorPage.css'; // reuse the same styles

// Minimal slugify helper
const slugify = str =>
  str
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');

export default function BlogEditorPage() {
  const { user, isAuthenticated } = useAuth();
  const { blogId } = useParams(); // blogId is "new" or existing id
  const [form, setForm] = useState({
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    cover_image_url: '',
    published_at: ''
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(Boolean(blogId && blogId !== "new"));

  const navigate = useNavigate();
  const fileInput = useRef();

  // Load for editing
  useEffect(() => {
    if (!isAuthenticated || !user?.id) return;
    if (blogId && blogId !== "new") {
      (async () => {
        setLoading(true);
        try {
          const { data } = await client.get(`/api/v1/users/${user.id}/blog-posts/${blogId}`);
          setForm({
            ...data,
            published_at: data.published_at?.substring(0, 10) || ''
          });
          setImagePreview(data.cover_image_url || '');
        } catch (err) {
          setError('Failed to load blog post.');
        }
        setLoading(false);
      })();
    }
  }, [user, isAuthenticated, blogId]);

  // Clean up image preview URL
  useEffect(() => () => { if (imagePreview?.startsWith('blob:')) URL.revokeObjectURL(imagePreview); }, [imagePreview]);

  // Form handlers
  const handleChange = e => {
    let { name, value } = e.target;
    if (name === 'title') {
      setForm(f => ({
        ...f,
        title: value,
        slug: f.id ? f.slug : slugify(value)
      }));
    } else {
      setForm(f => ({ ...f, [name]: value }));
    }
  };

  const handleImageChange = e => {
    const file = e.target.files[0];
    if (file) {
      if (imagePreview && imagePreview.startsWith('blob:')) URL.revokeObjectURL(imagePreview);
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  // Upload image file (optional)
  const uploadImageIfNeeded = async () => {
    if (!imageFile) return form.cover_image_url; // not changed
    // You must have an endpoint like /users/:userId/blog-posts/upload-image (POST, FormData)
    const fd = new FormData();
    fd.append('image', imageFile);
    const { data } = await client.post(`/api/v1/users/${user.id}/blog-posts/upload-image`, fd, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return data.url || data.cover_image_url; // backend should return uploaded url
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    try {
      let cover_image_url = await uploadImageIfNeeded();
      const payload = {
        ...form,
        slug: slugify(form.slug || form.title),
        cover_image_url
      };
      if (blogId && blogId !== "new") {
        await client.put(`/api/v1/users/${user.id}/blog-posts/${blogId}`, payload);
      } else {
        await client.post(`/api/v1/users/${user.id}/blog-posts`, payload);
      }
      navigate('/blog-posts');
    } catch (err) {
      setError(err.response?.data?.message || 'Save failed');
    }
  };

  if (!isAuthenticated) return <div className="p-6">Please log in.</div>;
  if (loading) return <div className="p-6">Loading editor…</div>;

 return (
  <div className="blog-edit-bg">
    <div className="blog-editor-glass-card">
      <h1 className="blog-editor-title">
        {blogId === "new" ? "Create Blog Post" : "Edit Blog Post"}
      </h1>
      <form onSubmit={handleSubmit} className="blog-form">
        <div className="form-group">
          <input
            name="title"
            value={form.title}
            onChange={handleChange}
            required
            className="form-input"
            id="title"
            autoComplete="off"
          />
          <label htmlFor="title" className="form-label">Title</label>
        </div>
        <div className="form-group">
          <input
            name="slug"
            value={form.slug}
            onChange={handleChange}
            pattern="^[a-z0-9]+(?:-[a-z0-9]+)*$"
            required
            className="form-input"
            id="slug"
            autoComplete="off"
          />
          <label htmlFor="slug" className="form-label">Slug</label>
        </div>
        <div className="form-group">
          <input
            name="excerpt"
            value={form.excerpt}
            onChange={handleChange}
            className="form-input"
            id="excerpt"
            autoComplete="off"
          />
          <label htmlFor="excerpt" className="form-label">Excerpt</label>
        </div>
        <div className="form-group">
          <label className="form-label">Cover Image</label>
          <div className="cover-image-input-row">
            <input
              type="file"
              accept="image/*"
              ref={fileInput}
              style={{ display: 'none' }}
              onChange={handleImageChange}
            />
            <button type="button" className="add-btn" onClick={() => fileInput.current.click()}>
              Choose Image
            </button>
            {imagePreview && (
              <img
                src={imagePreview}
                alt="Cover Preview"
                className="cover-image-preview"
              />
            )}
          </div>
        </div>
        <div className="form-group">
          <textarea
            name="content"
            value={form.content}
            onChange={handleChange}
            rows={7}
            required
            className="form-input"
            id="content"
            style={{ minHeight: 100 }}
          />
          <label htmlFor="content" className="form-label">Content (Markdown)</label>
        </div>
        <div className="form-group">
          <input
            name="published_at"
            type="date"
            value={form.published_at}
            onChange={handleChange}
            className="form-input"
            id="published_at"
          />
          <label htmlFor="published_at" className="form-label">Published At</label>
        </div>
        {error && <div className="blog-editor-error">{error}</div>}
        <div className="modal-actions">
          <button type="button" className="btn-cancel" onClick={() => navigate('/blog-posts')}>Cancel</button>
          <button type="submit" className="btn-submit">{blogId === "new" ? 'Create' : 'Save'}</button>
        </div>
        <div className="blog-preview">
          <b>Preview:</b>
          <div className="blog-preview-box">
            {form.content || 'Nothing to preview…'}
          </div>
        </div>
      </form>
    </div>
  </div>
);

}
