// src/context/AuthContext.jsx
import React, { createContext, useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';
import { register as apiRegister, login as apiLogin, logout as apiLogout } from '../api/auth';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [accessToken, setAccessToken] = useState(
    () => localStorage.getItem('accessToken')
  );

  // whenever token changes, persist and derive user
  useEffect(() => {
    if (accessToken) {
      localStorage.setItem('accessToken', accessToken);
      try {
        const { id } = jwtDecode(accessToken);
        setUser({ id });
      } catch {
        setUser(null);
      }
    } else {
      localStorage.removeItem('accessToken');
      setUser(null);
    }
  }, [accessToken]);

  const register = async (formData) => {
    const { data } = await apiRegister(formData);
    setAccessToken(data.accessToken);
    return data;
  };

  const login = async ({ email, password }) => {
    const { data } = await apiLogin({ email, password });
    setAccessToken(data.accessToken);
    return data;
  };

  const logout = async () => {
    // call backend to invalidate refresh token if you want:
    await apiLogout(localStorage.getItem('refreshToken'));
    setAccessToken(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        accessToken,
        register,
        login,
        logout,
        isAuthenticated: Boolean(user),
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
