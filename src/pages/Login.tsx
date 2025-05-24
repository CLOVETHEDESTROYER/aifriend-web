import React from 'react';
import { Link } from 'react-router-dom';
import { LoginForm } from '../features/Auth/LoginForm';
import { PageContainer } from '../components/Layout/PageContainer';

export const Login: React.FC = () => {
  return (
    <PageContainer className="max-w-md mx-auto pt-8">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
          Welcome Back
        </h1>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          Sign in to your account
        </p>
      </div>

      <LoginForm />

      <div className="mt-6 text-center text-sm">
        <span className="text-gray-600 dark:text-gray-400">
          Don't have an account?{' '}
        </span>
        <Link
          to="/register"
          className="font-medium text-accent-success hover:text-accent-success/90"
        >
          Sign up
        </Link>
      </div>
    </PageContainer>
  );
}; 