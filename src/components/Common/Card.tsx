import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export const Card: React.FC<CardProps> = ({ children, className = '', onClick }) => {
  return (
    <div
      className={`
        bg-white dark:bg-gray-800
        border border-gray-200 dark:border-gray-700
        rounded-lg shadow-sm
        p-6
        ${onClick ? 'cursor-pointer hover:border-gray-300 dark:hover:border-gray-600' : ''}
        ${className}
      `}
      onClick={onClick}
    >
      {children}
    </div>
  );
}; 