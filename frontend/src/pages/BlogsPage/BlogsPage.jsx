import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import client from '../../api/client';
import useAuth from '../../hooks/useAuth';
import './BlogsPage.scss';

export default function BlogsPage() {
  const { user, isAuthenticated } = useAuth();
  const [posts, setPosts] = useState([]);
  const [authorsById, setAuthorsById] = useState({});
  const [likeCounts, setLikeCounts] = useState({});
  const [commentCounts, setCommentCounts] = useState({});
  const [userLiked, setUserLiked] = useState({});
  const [deleteId, setDeleteId] = useState(null);

  const [openCommentPostId, setOpenCommentPostId] = useState(null);
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState('');
  const [loading, setLoading] = useState(true);
  const [commentLoading, setCommentLoading] = useState(false);
const FALLBACK_USER_ID = 'c05a246c-8751-47ca-af16-ae92d1dff4e8';
const ownerId = user?.id || FALLBACK_USER_ID;
  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const { data } = await client.get('/api/v1/blog-posts/all');
        const allPosts = Array.isArray(data?.data) ? data.data : [];
        setPosts(allPosts);

        const userIds = [...new Set(allPosts.map(p => p.user_id))];
        const authorPromises = userIds.map(uid => client.get(`/api/v1/users/${uid}`));
        const authorResponses = await Promise.all(authorPromises);
        const authorData = Object.fromEntries(
          authorResponses.map((res, i) => [userIds[i], res.data])
        );
        setAuthorsById(authorData);

        const likeCommentUserData = await Promise.all(allPosts.map(async (post) => {
          const [likeRes, commentRes, likedRes] = await Promise.all([
            client.get(`/api/v1/blog-posts/${post.id}/likes/count`),
            client.get(`/api/v1/blog-posts/${post.id}/comments/count`),
            isAuthenticated ? client.get(`/api/v1/blog-posts/${post.id}/likes/me`) : Promise.resolve({ data: { data: {} } })
          ]);
          return {
            id: post.id,
            likes: likeRes.data?.data?.count || 0,
            comments: commentRes.data?.data?.count || 0,
            liked: likedRes.data?.data?.liked || false
          };
        }));
        setLikeCounts(Object.fromEntries(likeCommentUserData.map(p => [p.id, p.likes])));
        setCommentCounts(Object.fromEntries(likeCommentUserData.map(p => [p.id, p.comments])));
        setUserLiked(Object.fromEntries(likeCommentUserData.map(p => [p.id, p.liked])));
      } catch (err) {
        setPosts([]);
      }
      setLoading(false);
    })();
    // eslint-disable-next-line
  }, [isAuthenticated]);

  const confirmDelete = id => setDeleteId(id);
  const cancelDelete = () => setDeleteId(null);

  const doDelete = async () => {
    if (!user) return;
    await client.delete(`/api/v1/users/${user.id}/blog-posts/${deleteId}`);
    setPosts(posts.filter(p => p.id !== deleteId));
    setDeleteId(null);
  };

  const handleLike = async (postId) => {
    if (!isAuthenticated) return;
    const liked = userLiked[postId];
    const endpoint = `/api/v1/blog-posts/${postId}/likes`;
    liked ? await client.delete(endpoint) : await client.post(endpoint);
    setUserLiked(prev => ({ ...prev, [postId]: !liked }));
    setLikeCounts(prev => ({ ...prev, [postId]: (prev[postId] || 0) + (liked ? -1 : 1) }));
  };

  const openComments = async (postId) => {
    setOpenCommentPostId(postId);
    setCommentLoading(true);
    try {
      const res = await client.get(`/api/v1/blog-posts/${postId}/comments`);
      const data = Array.isArray(res.data?.data) ? res.data.data : [];
      setComments(data);

      const commenterIds = [...new Set(data.map(c => c.user_id))];
      const newAuthors = await Promise.all(commenterIds.map(id =>
        !authorsById[id] ? client.get(`/api/v1/users/${id}`) : null
      ));
      newAuthors.forEach((res, i) => {
        if (res) {
          setAuthorsById(prev => ({ ...prev, [commenterIds[i]]: res.data }));
        }
      });
    } catch {
      setComments([]);
    }
    setCommentLoading(false);
  };

  const closeComments = () => {
    setOpenCommentPostId(null);
    setComments([]);
    setCommentText('');
  };

  const postComment = async () => {
    if (!isAuthenticated || !commentText.trim()) return;
    await client.post(`/api/v1/blog-posts/${openCommentPostId}/comments`, {
      text: commentText,
      author_name: user.full_name,
      user_id: user.id
    });
    setCommentText('');
    await openComments(openCommentPostId);
    setCommentCounts(prev => ({
      ...prev,
      [openCommentPostId]: (prev[openCommentPostId] || 0) + 1
    }));
  };

  return (
    <div className="l-feed container py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="c-feed__title">Blog Feed</h1>
        {isAuthenticated && (
          <Link to="/blog-posts/new" className="btn btn-primary">New Post</Link>
        )}
      </div>

      {loading ? (
        <div className="text-center">Loading blogs…</div>
      ) : posts.length === 0 ? (
        <div>No blog posts yet.</div>
      ) : (
        <ul className="c-feed-list">
          {posts.map(post => {
            const author = authorsById[post.user_id]?.data || {};
            return (
              <li className="c-feed-card" key={post.id}>
                <div className="card-body">
                  <div className="d-flex align-items-center mb-3">
                    <img
                      src={author.profile_image_url || "/profile.jpg"}
                      alt={author.full_name || "User"}
                      className="c-feed-card__avatar"
                    />
                    <div className="ms-3">
                      <div className="fw-semibold">{author.full_name || "Anonymous"}</div>
                      <small className="text-muted">{post.published_at?.slice(0, 10)}</small>
                    </div>
                  </div>
                  <h5 className="card-title">
                    
                    <Link
                   to={`/blog-posts/${ownerId}/${post.id}`}
  className="text-decoration-none"
>
  {post.title}
                    </Link>
                  </h5>
                  <div className="text-muted">@{post.slug}</div>
                  {post.excerpt && <p className="mt-2">{post.excerpt}</p>}
                  {post.cover_image_url && (
                    <img
                      className="img-fluid rounded mt-3"
                      src={post.cover_image_url.startsWith('http') ? post.cover_image_url : `http://localhost:3000${post.cover_image_url}`}
                      alt={post.title}
                    />
                  )}
                </div>
                <div className="card-footer d-flex justify-content-between align-items-center">
                  <div>
                    <button
                      className={`btn btn-sm ${userLiked[post.id] ? 'btn-danger' : 'btn-outline-secondary'}`}
                      onClick={() => handleLike(post.id)}
                    >
                      ❤️ {likeCounts[post.id] || 0}
                    </button>
                    <button
                      className="btn btn-sm btn-outline-secondary ms-2"
                      onClick={() => openComments(post.id)}
                    >
                      💬 {commentCounts[post.id] || 0}
                    </button>
                  </div>
                  {isAuthenticated && user?.id === post.user_id && (
                    <div>
                      <Link to={`/blog-posts/${post.id}/edit`} className="btn btn-sm btn-warning me-2">Edit</Link>
                      <button className="btn btn-sm btn-danger" onClick={() => confirmDelete(post.id)}>Delete</button>
                    </div>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {openCommentPostId && (
        <div className="c-modal show" onClick={closeComments}>
          <div className="c-modal__content" onClick={e => e.stopPropagation()}>
            <h5 className="mb-3 text-primary">Comments</h5>
            {commentLoading ? (
              <p>Loading…</p>
            ) : (
              <ul className="list-unstyled">
                {comments.length === 0 && <li>No comments yet.</li>}
                {comments.map(c => {
                  const commenter = authorsById[c.user_id]?.data || {};
                  return (
                    <li className="mb-2 d-flex align-items-start" key={c.id}>
                      <img
                        src={commenter.profile_image_url || "/profile.jpg"}
                        alt={commenter.full_name || "User"}
                        className="rounded-circle me-2"
                        style={{ width: 32, height: 32 }}
                      />
                      <div>
                        <strong>{commenter.full_name || c.author_name}</strong><br />
                        <span>{c.text}</span>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
            {isAuthenticated && (
              <div className="d-flex mt-3">
                <input
                  type="text"
                  className="form-control me-2"
                  value={commentText}
                  onChange={e => setCommentText(e.target.value)}
                  placeholder="Write a comment…"
                  onKeyDown={e => e.key === 'Enter' && postComment()}
                />
                <button className="btn btn-success" onClick={postComment}>Send</button>
              </div>
            )}
            <div className="text-end mt-3">
              <button className="btn btn-outline-secondary" onClick={closeComments}>Close</button>
            </div>
          </div>
        </div>
      )}

      {deleteId && (
        <div className="c-modal show" onClick={cancelDelete}>
          <div className="c-modal__content" onClick={e => e.stopPropagation()}>
            <p>Are you sure you want to delete this blog post?</p>
            <div className="d-flex justify-content-end gap-2 mt-3">
              <button className="btn btn-secondary" onClick={cancelDelete}>Cancel</button>
              <button className="btn btn-danger" onClick={doDelete}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
