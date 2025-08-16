// src/pages/RegisterPage.jsx
import React from 'react';
import AuthForm from '../../components/AuthForm/AuthForm';
import './RegisterPage.css';

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <AuthForm mode="register" />
    </div>
  );
}
