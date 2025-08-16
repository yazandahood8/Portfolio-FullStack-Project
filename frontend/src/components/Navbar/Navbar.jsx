// src/components/Navbar.jsx
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import './Navbar.css';

export default function Navbar() {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <nav className="navbar glassy-navbar">
      <div className="nav-content">
        <div className="nav-links">
          <Link to="/" className="brand">
            <span className="brand-glow">Portfolio </span>
          </Link>
          {isAuthenticated && (
            <>
                      <Link to="/" className="nav-item">Home</Link>

              <Link to={`/users/${user.id}`} className="nav-item">Details</Link>
              <Link to={`/cv/${user.id}`} className="nav-item">CV</Link>
              <Link to={`/projects/${user.id}`} className="nav-item">Projects</Link>
              <Link to={`/blog-posts/${user.id}`}className="nav-item">Blog</Link>
              <Link to={`/assistant/${user.id}`}className="nav-item">Assistants</Link>

              <Link to="/contact" className="nav-item">Contact</Link>
              <Link to="/edit-profile" className="nav-item">Edit Profile</Link>
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
