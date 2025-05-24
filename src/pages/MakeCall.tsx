import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import { useScenarios } from '../context/ScenarioContext';
import { Card } from '../components/common/Card';
import { Input } from '../components/common/Input';
import { Button } from '../components/common/Button';
import api from '../services/apiClient';
import { PageContainer } from '../components/Layout/PageContainer';

export const MakeCall: React.FC = () => {
  const { scenarios } = useScenarios();
  const [selectedScenarioId, setSelectedScenarioId] = useState<string>('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedScenarioId) {
      toast.error('Please select a scenario');
      return;
    }

    const cleanPhoneNumber = phoneNumber.replace(/\D/g, '');
    if (cleanPhoneNumber.length !== 10) {
      toast.error('Please enter a valid 10-digit phone number');
      return;
    }

    setIsLoading(true);
    try {
      await api.scenarios.makeCustomCall(cleanPhoneNumber, selectedScenarioId);
      toast.success('Call initiated successfully!');
      setPhoneNumber('');
      setSelectedScenarioId('');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to initiate call');
      console.error('Error making call:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <PageContainer className="max-w-md mx-auto">
      <div className="space-y-8">
        <div className="border-b border-gray-200 dark:border-gray-700 pb-5">
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
            Make a Call
          </h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Select Scenario
            </label>
            <select
              value={selectedScenarioId}
              onChange={(e) => setSelectedScenarioId(e.target.value)}
              className="w-full rounded-md border-gray-300 dark:border-gray-600
                bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                focus:ring-2 focus:ring-gray-400 dark:focus:ring-gray-500"
              required
            >
              <option value="">Select a scenario</option>
              {scenarios.map((scenario) => (
                <option key={scenario.id} value={scenario.id}>
                  {scenario.persona}
                </option>
              ))}
            </select>
          </div>

          <Input
            label="Phone Number"
            type="tel"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            placeholder="(123) 456-7890"
            required
          />

          <Button
            type="submit"
            disabled={isLoading || !selectedScenarioId || !phoneNumber}
            className="w-full"
          >
            {isLoading ? 'Initiating Call...' : 'Make Call'}
          </Button>
        </form>
      </div>
    </PageContainer>
  );
}; 