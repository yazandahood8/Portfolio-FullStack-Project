// src/pages/BlogPostDetailPage/BlogPostDetailPage.jsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import client from '../../api/client';
import './BlogPostDetailPage.scss';
export default function BlogPostDetailPage() {
  const { userId, postId } = useParams();
  const effectivePostId = postId || userId; // supports /blog-posts/:postId OR /blog-posts/:userId/:postId
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [post, setPost] = useState(null);
  const [author, setAuthor] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let alive = true;
    (async () => {
      setLoading(true);
      setError('');
      try {
        // Public detail endpoint (see backend step)
        const { data } = await client.get(`/api/v1/blog-posts/${effectivePostId}`);
        const payload = data?.data || data || {};
        if (!alive) return;
        setPost(payload.post || payload);            // supports both shapes
        setAuthor(payload.author || null);
      } catch (e) {
        if (alive) setError('Not found.');
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, [effectivePostId]);

  if (loading) return <main className="container py-4">Loading…</main>;
  if (error || !post) return <main className="container py-4 text-danger">{error || 'Not found.'}</main>;

  return (
    <main className="container py-4 blogpost-detail">
      <button className="btn btn-link mb-3" onClick={() => navigate(-1)}>&larr; Back</button>

      <h1 className="fw-bold">{post.title}</h1>
      <div className="text-muted">
        {post.published_at ? new Date(post.published_at).toLocaleDateString() : 'Draft'}
        {post.slug ? <> · @{post.slug}</> : null}
      </div>

      {author && (
        <div className="d-flex align-items-center mt-2">
          <img src={author.profile_image_url || '/profile.jpg'} alt={author.full_name || 'User'} width={40} height={40} className="rounded-circle" />
          <div className="ms-2">
            <div className="fw-semibold">{author.full_name || 'Anonymous'}</div>
            {author.email && <small className="text-muted">{author.email}</small>}
          </div>
        </div>
      )}

      {post.cover_image_url && (
        <img className="img-fluid rounded shadow-sm my-3"
             src={post.cover_image_url.startsWith('http') ? post.cover_image_url : `http://localhost:3000${post.cover_image_url}`}
             alt={post.title} />
      )}

      {post.excerpt && <p className="lead">{post.excerpt}</p>}
      {post.content_html
        ? <article dangerouslySetInnerHTML={{ __html: post.content_html }} />
        : post.content
          ? <article><pre style={{ whiteSpace: 'pre-wrap' }}>{post.content}</pre></article>
          : post.body
            ? <article><pre style={{ whiteSpace: 'pre-wrap' }}>{post.body}</pre></article>
            : null}

      <hr className="my-4" />
      <Link to="/blog-posts" className="btn btn-outline-secondary">Back to Blog</Link>
    </main>
  );
}
