import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  helperText,
  className = '',
  ...props
}) => {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          {label}
        </label>
      )}
      <input
        className={`
          w-full rounded-md border-gray-300 dark:border-gray-600
          bg-white dark:bg-gray-700
          text-gray-900 dark:text-white
          focus:ring-2 focus:ring-gray-400 dark:focus:ring-gray-500
          focus:border-transparent
          placeholder:text-gray-400 dark:placeholder:text-gray-500
          disabled:bg-gray-50 dark:disabled:bg-gray-800
          disabled:text-gray-500 dark:disabled:text-gray-400
          disabled:cursor-not-allowed
          ${error ? 'border-error focus:ring-error/50' : ''}
          ${className}
        `}
        {...props}
      />
      {(error || helperText) && (
        <p className={`mt-1 text-sm ${error ? 'text-error' : 'text-gray-500 dark:text-gray-400'}`}>
          {error || helperText}
        </p>
      )}
    </div>
  );
}; 