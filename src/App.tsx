import React, { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { Header } from './components/Layout/Header';
import { Dashboard } from './features/Dashboard/Dashboard';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Onboarding } from './pages/Onboarding';
import { MakeCall } from './pages/MakeCall';
import { Scenarios } from './pages/Scenarios';
import { CallInterface } from './features/Call/CallInterface';
import { AuthProvider } from './context/AuthContext';
import { BusinessProfileProvider } from './context/BusinessProfileContext';
import { ScenarioProvider } from './context/ScenarioContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { OnboardingCheck } from './components/Onboarding/OnboardingCheck';
import { MainLayout } from './components/Layout/MainLayout';
import { CallNotes } from './pages/CallNotes';
import { ScheduledMeetings } from './pages/ScheduledMeetings';

function AppContent() {
  return (
    <MainLayout>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/onboarding"
          element={
            <ProtectedRoute>
              <Onboarding />
            </ProtectedRoute>
          }
        />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <OnboardingCheck>
                <Navigate to="/dashboard" replace />
              </OnboardingCheck>
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <OnboardingCheck>
                <Dashboard />
              </OnboardingCheck>
            </ProtectedRoute>
          }
        />
        <Route
          path="/make-call"
          element={
            <ProtectedRoute>
              <OnboardingCheck>
                <MakeCall />
              </OnboardingCheck>
            </ProtectedRoute>
          }
        />
        <Route
          path="/scenarios"
          element={
            <ProtectedRoute>
              <OnboardingCheck>
                <Scenarios />
              </OnboardingCheck>
            </ProtectedRoute>
          }
        />
        <Route
          path="/call-notes"
          element={
            <ProtectedRoute>
              <OnboardingCheck>
                <CallNotes />
              </OnboardingCheck>
            </ProtectedRoute>
          }
        />
        <Route
          path="/scheduled-meetings"
          element={
            <ProtectedRoute>
              <OnboardingCheck>
                <ScheduledMeetings />
              </OnboardingCheck>
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
      <BusinessProfileProvider>
        <ScenarioProvider>
          <AppContent />
        </ScenarioProvider>
      </BusinessProfileProvider>
    </AuthProvider>
  );
}

export default App;
