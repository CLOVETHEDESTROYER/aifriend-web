import React from 'react';

interface PageContainerProps {
  children: React.ReactNode;
  className?: string;
}

export const PageContainer: React.FC<PageContainerProps> = ({ children, className = '' }) => {
  return (
    <div className="px-4 py-6 sm:px-6 lg:px-8 max-w-content mx-auto">
      <div className={`bg-white dark:bg-gray-800 rounded-lg shadow ${className}`}>
        {children}
      </div>
    </div>
  );
}; 