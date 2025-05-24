import React from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useScenarios } from '../../context/ScenarioContext';
import { UpdateNameForm } from '../../components/User/UpdateNameForm';
import { CustomCallForm } from '../../components/Call/CustomCallForm';
import { SavedPromptsList } from '../../components/Scenarios/SavedPromptsList';
import { SavedPrompt } from '../../types/call';
import { PageContainer } from '../../components/Layout/PageContainer';

export const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const { refreshScenarios } = useScenarios();

  const handleSelectPrompt = (prompt: SavedPrompt) => {
    // Handle selecting a saved prompt for making a call
    console.log('Selected prompt:', prompt);
  };

  return (
    <PageContainer>
      <div className="space-y-8">
        <div className="border-b border-gray-200 dark:border-gray-700 pb-5">
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
            Dashboard
          </h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Quick Actions */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              Quick Actions
            </h2>
            {/* Add quick action buttons */}
          </div>

          {/* Recent Activity */}
          <div className="md:col-span-2 bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              Recent Activity
            </h2>
            {/* Add activity list */}
          </div>
        </div>
      </div>
    </PageContainer>
  );
}; 