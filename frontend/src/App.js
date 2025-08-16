// src/App.jsx
import React from 'react';
import Navbar from './components/Navbar/Navbar';
import AppRoutes from './routes';

export default function App() {
  return (
    <>
      <Navbar />
      <main className="container mx-auto p-4">
        <AppRoutes />
      </main>
    </>
  );
}
