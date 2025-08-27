// src/components/Navbar.jsx
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import './Navbar.css';

export default function Navbar() {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Public owner id (env → fallback)
  let PUBLIC_OWNER_ID = 'c05a246c-8751-47ca-af16-ae92d1dff4e8';
  try {
    if (import.meta?.env?.VITE_OWNER_ID) PUBLIC_OWNER_ID = import.meta.env.VITE_OWNER_ID;
    if (process?.env?.REACT_APP_OWNER_ID) PUBLIC_OWNER_ID = process.env.REACT_APP_OWNER_ID;
  } catch {}
  const ownerId = user?.id || PUBLIC_OWNER_ID;

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <nav className="navbar glassy-navbar">
      <div className="nav-content">
        <div className="nav-links">
          <Link to="/" className="brand">
            <span className="brand-glow">Portfolio</span>
          </Link>

          {/* Public (read-only) */}
          <Link to="/" className="nav-item">Home</Link>
          {ownerId && (
            <>
              <Link to={`/users/${ownerId}`} className="nav-item">Details</Link>
              <Link to={`/cv/${ownerId}`} className="nav-item">CV</Link>
              <Link to={`/projects/${ownerId}`} className="nav-item">Projects</Link>
              <Link to={`/blog-posts/${ownerId}`} className="nav-item">Blog</Link>
            </>
          )}
          <Link to="/contact" className="nav-item">Contact</Link>

          {/* Protected (write/admin) */}
          {isAuthenticated && user?.id && (
            <>
              <Link to={`/assistant/${user.id}`} className="nav-item">Assistants</Link>
              <Link to="/edit-profile" className="nav-item">Edit Profile</Link>
                <Link to="/admin/messages" className="nav-item">Messages</Link>

            </>
          )}
        </div>

        <div className="auth-actions">
          {isAuthenticated ? (
            <button className="logout-btn nav-item" onClick={handleLogout}>Logout</button>
          ) : (
            <>
              <Link to="/login" className="nav-item">Login</Link>
              <Link to="/register" className="nav-item">Register</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
