import React, { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { Header } from './components/Layout/Header';
import { Dashboard } from './features/Dashboard/Dashboard';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { MakeCall } from './pages/MakeCall';
import { Scenarios } from './pages/Scenarios';
import { CallInterface } from './features/Call/CallInterface';
import { AuthProvider } from './context/AuthContext';
import { ScenarioProvider } from './context/ScenarioContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { MainLayout } from './components/Layout/MainLayout';
import { CallNotes } from './pages/CallNotes';

function AppContent() {
  return (
    <MainLayout>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Navigate to="/dashboard" replace />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/make-call"
          element={
            <ProtectedRoute>
              <MakeCall />
            </ProtectedRoute>
          }
        />
        <Route
          path="/scenarios"
          element={
            <ProtectedRoute>
              <Scenarios />
            </ProtectedRoute>
          }
        />
        <Route
          path="/call-notes"
          element={
            <ProtectedRoute>
              <CallNotes />
            </ProtectedRoute>
          }
        />
      </Routes>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 5000,
          style: {
            background: '#333',
            color: '#fff',
          },
        }}
      />
    </MainLayout>
  );
}

function App() {
  useEffect(() => {
    // Check for dark mode preference
    const isDarkMode = localStorage.getItem('darkMode') === 'dark' ||
      (!localStorage.getItem('darkMode') && 
       window.matchMedia('(prefers-color-scheme: dark)').matches);
    
    document.documentElement.classList.toggle('dark', isDarkMode);
  }, []);

  return (
    <AuthProvider>
      <ScenarioProvider>
        <AppContent />
      </ScenarioProvider>
    </AuthProvider>
  );
}

export default App;
