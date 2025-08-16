// src/components/AuthForm.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import './AuthForm.css';

export default function AuthForm({ mode }) {
  const isRegister = mode === 'register';
  const { register, login } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    full_name: '',
    email: '',
    password: ''
  });
  const [error, setError] = useState('');

  const handleChange = e => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    try {
      if (isRegister) {
        await register(form);
      } else {
        await login({ email: form.email, password: form.password });
      }
      // Go to user's detail or homepage after auth
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="auth-form-glass">
      <h2 className="auth-form-title">{isRegister ? 'Register' : 'Login'}</h2>

      {isRegister && (
        <div className="auth-form-group">
          <input
            name="full_name"
            value={form.full_name}
            onChange={handleChange}
            required
            className="auth-form-input"
            autoComplete="name"
            id="auth-fullname"
          />
          <label htmlFor="auth-fullname" className="auth-form-label">Full Name</label>
        </div>
      )}

      <div className="auth-form-group">
        <input
          name="email"
          type="email"
          value={form.email}
          onChange={handleChange}
          required
          className="auth-form-input"
          autoComplete="email"
          id="auth-email"
        />
        <label htmlFor="auth-email" className="auth-form-label">Email</label>
      </div>

      <div className="auth-form-group">
        <input
          name="password"
          type="password"
          value={form.password}
          onChange={handleChange}
          required
          className="auth-form-input"
          autoComplete={isRegister ? "new-password" : "current-password"}
          id="auth-password"
        />
        <label htmlFor="auth-password" className="auth-form-label">Password</label>
      </div>

      {error && <p className="auth-form-error">{error}</p>}

      <button
        type="submit"
        className="auth-form-btn"
      >
        {isRegister ? 'Sign Up' : 'Sign In'}
      </button>
    </form>
  );
}
