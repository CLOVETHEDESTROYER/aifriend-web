import React, { useState } from 'react';
import api from '../../services/apiClient';
import toast from 'react-hot-toast';

interface MakeCustomCallFormProps {
  scenarioId: string;
  onSuccess?: () => void;
}

export const MakeCustomCallForm: React.FC<MakeCustomCallFormProps> = ({
  scenarioId,
  onSuccess
}) => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Remove any non-numeric characters from phone number
      const cleanPhoneNumber = phoneNumber.replace(/\D/g, '');
      
      if (cleanPhoneNumber.length !== 10) {
        throw new Error('Please enter a valid 10-digit phone number');
      }

      await api.scenarios.makeCustomCall(cleanPhoneNumber, scenarioId);
      toast.success('Call initiated successfully!');
      setPhoneNumber('');
      onSuccess?.();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to initiate call');
      console.error('Error making custom call:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mt-4">
      <div className="flex flex-col space-y-2">
        <label htmlFor="phoneNumber" className="text-sm font-medium text-gray-700 dark:text-gray-200">
          Phone Number
        </label>
        <input
          type="tel"
          id="phoneNumber"
          value={phoneNumber}
          onChange={(e) => setPhoneNumber(e.target.value)}
          placeholder="(555) 555-5555"
          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          required
        />
      </div>
      <button
        type="submit"
        disabled={isLoading || !phoneNumber}
        className="mt-4 w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? 'Initiating Call...' : 'Start Call'}
      </button>
    </form>
  );
}; 