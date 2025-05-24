import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import api from '../../services/apiClient';

interface MakeCallFormProps {
  scenarioId: string;
  onSuccess?: () => void;
}

export const MakeCallForm: React.FC<MakeCallFormProps> = ({ scenarioId, onSuccess }) => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const formatPhoneNumber = (value: string) => {
    // Remove all non-digits
    const digits = value.replace(/\D/g, '');
    
    // Format as (XXX) XXX-XXXX
    if (digits.length <= 3) {
      return digits;
    } else if (digits.length <= 6) {
      return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
    } else {
      return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6, 10)}`;
    }
  };

  const handlePhoneNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneNumber(e.target.value);
    setPhoneNumber(formatted);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Remove all non-digits for API call
      const cleanPhoneNumber = phoneNumber.replace(/\D/g, '');
      
      if (cleanPhoneNumber.length !== 10) {
        throw new Error('Please enter a valid 10-digit phone number');
      }

      await api.calls.makeCall(cleanPhoneNumber, scenarioId);
      toast.success('Call initiated successfully!');
      setPhoneNumber('');
      onSuccess?.();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to initiate call');
      console.error('Make call error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <label 
          htmlFor="phoneNumber" 
          className="block text-sm font-medium text-gray-700 dark:text-gray-200"
        >
          Phone Number
        </label>
        <input
          id="phoneNumber"
          type="tel"
          value={phoneNumber}
          onChange={handlePhoneNumberChange}
          placeholder="(555) 555-5555"
          className="block w-full rounded-md border-gray-300 shadow-sm 
                   focus:border-blue-500 focus:ring-blue-500 
                   dark:bg-gray-700 dark:border-gray-600 dark:text-white
                   disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={isLoading}
          required
        />
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Enter a 10-digit US phone number
        </p>
      </div>

      <button
        type="submit"
        disabled={isLoading || phoneNumber.replace(/\D/g, '').length !== 10}
        className="w-full flex justify-center py-2 px-4 border border-transparent 
                 rounded-md shadow-sm text-sm font-medium text-white 
                 bg-blue-600 hover:bg-blue-700 focus:outline-none 
                 focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
                 disabled:opacity-50 disabled:cursor-not-allowed
                 transition-colors duration-200"
      >
        {isLoading ? (
          <span className="flex items-center">
            <svg 
              className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" 
              xmlns="http://www.w3.org/2000/svg" 
              fill="none" 
              viewBox="0 0 24 24"
            >
              <circle 
                className="opacity-25" 
                cx="12" 
                cy="12" 
                r="10" 
                stroke="currentColor" 
                strokeWidth="4"
              />
              <path 
                className="opacity-75" 
                fill="currentColor" 
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            Initiating Call...
          </span>
        ) : (
          'Make Call'
        )}
      </button>
    </form>
  );
}; 