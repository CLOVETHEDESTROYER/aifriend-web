import React from 'react';
import { Header } from './Header';
import { useAuth } from '../../hooks/useAuth';

export const MainLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  
  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark">
      <Header isAuthenticated={isAuthenticated} />
      <main className="pt-28 px-4 sm:px-6 lg:px-8 pb-12 max-w-7xl mx-auto">
        {children}
      </main>
    </div>
  );
}; 