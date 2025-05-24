import React, { useState } from 'react';
import { useUpdateUserName } from '../../hooks/useUpdateUserName';
import { toast } from 'react-hot-toast';

export const UpdateNameForm: React.FC = () => {
  const [name, setName] = useState('');
  const { updateName, isLoading, error } = useUpdateUserName();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Client-side validation
    if (!name || name.trim().length === 0) {
      toast.error('Please enter a valid name');
      return;
    }

    try {
      await updateName(name.trim());
      setName(''); // Clear form after success
    } catch (err) {
      // Error is handled by the hook
      console.error('Failed to update name:', err);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 w-full max-w-md">
      <div className="flex flex-col">
        <label 
          htmlFor="nameInput" 
          className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300"
        >
          Update Your Name
        </label>
        <input
          id="nameInput"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
          placeholder="Enter your name"
          disabled={isLoading}
          minLength={1}
          maxLength={50}
          required
          autoComplete="off"
        />
        {error && (
          <p className="mt-2 text-sm text-red-600 dark:text-red-400">{error}</p>
        )}
      </div>

      <button
        type="submit"
        disabled={isLoading || !name.trim()}
        className={`
          w-full px-4 py-2 text-sm font-medium text-white 
          bg-blue-600 rounded-md shadow-sm
          hover:bg-blue-700 focus:outline-none focus:ring-2 
          focus:ring-offset-2 focus:ring-blue-500
          disabled:opacity-50 disabled:cursor-not-allowed
          transition-colors duration-200
        `}
      >
        {isLoading ? 'Updating...' : 'Update Name'}
      </button>
    </form>
  );
}; 