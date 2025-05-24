import React from 'react';
import { PageContainer } from '../components/Layout/PageContainer';
import { CustomCallForm } from '../components/Call/CustomCallForm';
import { ScenarioList } from '../components/Scenarios/ScenarioList';
import { useScenarios } from '../context/ScenarioContext';

export const Scenarios: React.FC = () => {
  const { refreshScenarios } = useScenarios();

  return (
    <PageContainer>
      <div className="space-y-8">
        <div className="border-b border-border-light dark:border-border-dark px-6 pb-6 pt-4">
          <h1 className="text-2xl font-semibold text-text-light dark:text-text-dark">
            Custom Scenarios
          </h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 px-6">
          <div className="card">
            <h2 className="text-lg font-medium text-text-light dark:text-text-dark mb-4">
              Create New Scenario
            </h2>
            <CustomCallForm onSuccess={refreshScenarios} />
          </div>

          <div className="card">
            <h2 className="text-lg font-medium text-text-light dark:text-text-dark mb-4">
              Your Scenarios
            </h2>
            <ScenarioList />
          </div>
        </div>
      </div>
    </PageContainer>
  );
}; 