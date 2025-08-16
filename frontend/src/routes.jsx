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

export default function AppRoutes() {
    return (
        <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/" element={<HomePage />} />

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
                path="/cv/:userId"
                element={
                    <ProtectedRoute>
                        <CVPage />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/projects/:userId"
                element={
                    <ProtectedRoute>
                        <ProjectsPage />
                    </ProtectedRoute>
                }
            />
            <Route path="projects/:userId/:projectId" element={<ProjectDetailPage />} />

             <Route
                path="/blog-posts/:userId"
                element={
                    <ProtectedRoute>
                        <BlogsPage />
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

            {/* catch-all */}
            <Route path="*" element={<Navigate to="/" replace />} />
            <Route
                path="/users/:userId"
                element={
                    <ProtectedRoute>
                        <UserDetailPage />
                    </ProtectedRoute>
                } />
        </Routes>
    );
}


