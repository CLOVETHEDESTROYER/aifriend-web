import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import api from '../../services/apiClient';
import { useScenarios } from '../../context/ScenarioContext';
import { CustomScenarioResponse } from '../../types/call';

interface CustomCallFormData {
  persona: string;
  prompt: string;
  voice_type: string;
  temperature: number;
}

const VOICE_TYPES = [
  'aggressive_male',
  'concerned_female',
  'elderly_female',
  'professional_neutral'
];

export const CustomCallForm: React.FC<{ 
  onSuccess: (response: CustomScenarioResponse) => void 
}> = ({ onSuccess }) => {
  const { addScenario } = useScenarios();
  const [formData, setFormData] = useState<CustomCallFormData>({
    persona: '',
    prompt: '',
    voice_type: VOICE_TYPES[0],
    temperature: 0.7
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate minimum lengths
    if (formData.persona.length < 10) {
      toast.error('Persona must be at least 10 characters long');
      return;
    }
    
    if (formData.prompt.length < 10) {
      toast.error('Prompt must be at least 10 characters long');
      return;
    }

    setIsLoading(true);

    try {
      const response = await api.scenarios.create(formData);
      toast.success(response.message || 'Custom scenario created successfully!');
      
      // Add the new scenario to context
      addScenario({
        id: response.scenario_id,
        ...formData
      });

      // Reset form
      setFormData({
        persona: '',
        prompt: '',
        voice_type: VOICE_TYPES[0],
        temperature: 0.7
      });
      onSuccess(response);
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error('Failed to create custom scenario');
      }
      console.error('Error creating custom scenario:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label htmlFor="persona" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Persona Description (min. 10 characters)
        </label>
        <textarea
          id="persona"
          value={formData.persona}
          onChange={(e) => setFormData(prev => ({ ...prev, persona: e.target.value }))}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          placeholder="Describe the AI's persona in detail..."
          required
          minLength={10}
          rows={3}
        />
        <p className="mt-1 text-sm text-gray-500">
          {formData.persona.length}/1000 characters
        </p>
      </div>

      <div>
        <label htmlFor="prompt" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Initial Prompt (min. 10 characters)
        </label>
        <textarea
          id="prompt"
          value={formData.prompt}
          onChange={(e) => setFormData(prev => ({ ...prev, prompt: e.target.value }))}
          rows={4}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          placeholder="Enter the initial conversation prompt..."
          required
          minLength={10}
        />
        <p className="mt-1 text-sm text-gray-500">
          {formData.prompt.length}/1000 characters
        </p>
      </div>

      <div>
        <label htmlFor="voice_type" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Voice Type
        </label>
        <select
          id="voice_type"
          value={formData.voice_type}
          onChange={(e) => setFormData(prev => ({ ...prev, voice_type: e.target.value }))}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
        >
          {VOICE_TYPES.map(voice => (
            <option key={voice} value={voice}>
              {voice.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="temperature" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Temperature ({formData.temperature})
        </label>
        <input
          type="range"
          id="temperature"
          min="0"
          max="1"
          step="0.1"
          value={formData.temperature}
          onChange={(e) => setFormData(prev => ({ ...prev, temperature: parseFloat(e.target.value) }))}
          className="mt-1 block w-full"
        />
      </div>

      <button
        type="submit"
        disabled={isLoading || formData.persona.length < 10 || formData.prompt.length < 10}
        className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
          isLoading ? 'opacity-50 cursor-not-allowed' : ''
        }`}
      >
        {isLoading ? 'Creating...' : 'Create Custom Call'}
      </button>
    </form>
  );
}; 