// src/routes.jsx
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import CVPage from './pages/CVPage/CVPage';
import LoginPage from './pages/LoginPage/LoginPage';
import RegisterPage from './pages/RegisterPage/RegisterPage';
import HomePage from './pages/HomePage/HomePage';
import UserDetailPage from './pages/UserDetailPage/UserDetailPage';
import ProjectsPage from './pages/ProjectsPage/ProjectsPage';
import EditProfilePage from './pages/EditProfilePage/EditProfilePage';
import BlogsPage from './pages/BlogsPage/BlogsPage';
import BlogEditorPage from './pages/BlogEditorPage/BlogEditorPage';
import ProjectDetailPage from './pages/ProjectDetailPage/ProjectDetailPage';
import AssistantPage from './pages/AssistantPage/AssistantPage';
import ContactPage from './pages/ContactPage/ContactPage';
import BlogPostDetailPage from './pages/BlogPostDetailPage/BlogPostDetailPage';
import MessagesPage from './pages/MessagesPage/MessagesPage';

export default function AppRoutes() {
  return (
    <Routes>
      {/* Auth */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* Public (read-only) */}
      <Route path="/" element={<HomePage />} />
      <Route path="/contact" element={<ContactPage />} />
      <Route path="/users/:userId" element={<UserDetailPage />} />
      <Route path="/cv/:userId" element={<CVPage />} />
      <Route path="/projects/:userId" element={<ProjectsPage />} />
      <Route path="/projects/:userId/:projectId" element={<ProjectDetailPage />} />
      <Route path="/blog-posts/:userId" element={<BlogsPage />} />
<Route path="/blog-posts/:userId/:postId" element={<BlogPostDetailPage />} />
<Route path="/blog-posts/:postId" element={<BlogPostDetailPage />} />

      {/* Protected (write/admin) */}

      <Route
  path="/admin/messages"
  element={
    <ProtectedRoute>
      <MessagesPage />
    </ProtectedRoute>
  }
/>
      <Route
        path="/edit-profile"
        element={
          <ProtectedRoute>
            <EditProfilePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/assistant/:userId"
        element={
          <ProtectedRoute>
            <AssistantPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/blog-posts/new"
        element={
          <ProtectedRoute>
            <BlogEditorPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/blog-posts/:userId/:blogId/edit"
        element={
          <ProtectedRoute>
            <BlogEditorPage />
          </ProtectedRoute>
        }
      />

      {/* catch-all LAST */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
