import React from 'react';
import { Link } from 'react-router-dom';
import { RegisterForm } from '../features/Auth/RegisterForm';
import { PageContainer } from '../components/Layout/PageContainer';

export const Register: React.FC = () => {
  return (
    <PageContainer className="max-w-md mx-auto pt-8">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
          Create Your Account
        </h1>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          Join us and start making AI voice calls
        </p>
      </div>

      <RegisterForm />

      <div className="mt-6 text-center text-sm">
        <span className="text-gray-600 dark:text-gray-400">
          Already have an account?{' '}
        </span>
        <Link
          to="/login"
          className="font-medium text-accent-success hover:text-accent-success/90"
        >
          Sign in
        </Link>
      </div>
    </PageContainer>
  );
}; 