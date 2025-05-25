import React, { createContext, useContext, useState, useCallback } from 'react';
import api from '../services/apiClient';
import { toast } from 'react-hot-toast';

interface Scenario {
  id: string;
  persona: string;
  prompt: string;
  voice_type: string;
  temperature: number;
}

interface ScenarioContextType {
  scenarios: Scenario[];
  addScenario: (scenario: Scenario) => void;
  error: Error | null;
  isLoading: boolean;
  refreshScenarios: () => Promise<void>;
}

const ScenarioContext = createContext<ScenarioContextType | undefined>(undefined);

export const ScenarioProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [error, setError] = useState<Error | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const addScenario = useCallback((newScenario: Scenario) => {
    setScenarios(prev => [...prev, newScenario]);
  }, []);

  const refreshScenarios = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await api.scenarios.list();
      setScenarios(response);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to fetch scenarios';
      setError(new Error(message));
      // Only show toast error if it's not a 401 error
      if (!(error instanceof Error && error.message.includes('401'))) {
        toast.error(message);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  return (
    <ScenarioContext.Provider 
      value={{ 
        scenarios, 
        addScenario, 
        error, 
        isLoading, 
        refreshScenarios 
      }}
    >
      {children}
    </ScenarioContext.Provider>
  );
};

export const useScenarios = () => {
  const context = useContext(ScenarioContext);
  if (context === undefined) {
    throw new Error('useScenarios must be used within a ScenarioProvider');
  }
  return context;
}; 