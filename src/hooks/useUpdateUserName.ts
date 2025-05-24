import { useState } from 'react';
import { toast } from 'react-hot-toast';
import api from '../services/apiClient';
import axios from 'axios';
import { useAuth } from './useAuth';

export const useUpdateUserName = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { updateProfile } = useAuth();

  const updateName = async (name: string) => {
    try {
      setIsLoading(true);
      setError(null);
      
      if (!name || name.trim().length === 0) {
        throw new Error('Name cannot be empty');
      }

      await api.user.updateName(name.trim());
      
      // Update the user profile in the auth store
      await updateProfile();
      
      toast.success('Name updated successfully');
    } catch (err) {
      let errorMessage = 'Failed to update name';
      
      if (axios.isAxiosError(err) && err.response) {
        // Log the full error response for debugging
        console.error('Update name error:', {
          status: err.response.status,
          data: err.response.data,
        });
        
        // Try to extract a meaningful error message
        errorMessage = err.response.data?.detail 
          || err.response.data?.message 
          || errorMessage;
      } else if (err instanceof Error) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
      toast.error(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    updateName,
    isLoading,
    error
  };
}; 