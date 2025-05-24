import React, { useEffect } from 'react';
import { useScenarios } from '../../context/ScenarioContext';
import { toast } from 'react-hot-toast';
import api from '../../services/apiClient';

interface ScenarioListProps {
  onSelect?: (scenarioId: string) => void;
}

export const ScenarioList: React.FC<ScenarioListProps> = ({ onSelect }) => {
  const { scenarios, error, isLoading, refreshScenarios } = useScenarios();

  useEffect(() => {
    refreshScenarios();
  }, [refreshScenarios]);

  const handleDelete = async (id: string) => {
    try {
      await api.scenarios.delete(id);
      toast.success('Scenario deleted successfully');
      refreshScenarios();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to delete scenario');
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-500 p-4 text-center">
        {error.message || 'An error occurred while loading scenarios'}
      </div>
    );
  }

  if (scenarios.length === 0) {
    return (
      <div className="text-gray-500 dark:text-gray-400 text-center p-4">
        No scenarios created yet. Create your first scenario to get started!
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {scenarios.map((scenario) => (
        <div
          key={scenario.id}
          className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 border border-gray-200 dark:border-gray-700"
        >
          <div className="flex justify-between items-start mb-2">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              {scenario.persona}
            </h3>
            <div className="flex space-x-2">
              <button
                onClick={() => onSelect?.(scenario.id)}
                className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 text-sm"
              >
                Use
              </button>
              <button
                onClick={() => handleDelete(scenario.id)}
                className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 text-sm"
              >
                Delete
              </button>
            </div>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
            {scenario.prompt}
          </p>
          <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
            <span>Voice: {scenario.voice_type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}</span>
            <span>Temperature: {scenario.temperature}</span>
          </div>
        </div>
      ))}
    </div>
  );
}; 