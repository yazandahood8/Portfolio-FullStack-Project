// src/pages/LoginPage.jsx
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthForm from '../../components/AuthForm/AuthForm';
import './LoginPage.css';

export default function LoginPage() {
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      navigate('/'); // redirect to home if already logged in
    }
  }, [navigate]);

  return (
    <div className="login-bg min-h-screen flex-center">
      <div className="login-glass-card">
        <AuthForm mode="login" />
      </div>
    </div>
  );
}
