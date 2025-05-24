import React, { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import { TrashIcon } from '@heroicons/react/24/outline';
import { api } from '../../services/apiClient';

interface Prompt {
  id: string;
  persona: string;
  prompt: string;
  voice_type: string;
  temperature: number;
}

interface SavedPromptsListProps {
  onSelectPrompt?: (prompt: Prompt) => void;
}

export const SavedPromptsList: React.FC<SavedPromptsListProps> = ({ onSelectPrompt }) => {
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadPrompts = async () => {
    try {
      // Use the list function we defined in apiClient
      const response = await api.scenarios.list();
      setPrompts(response);
      setError(null);
    } catch (err) {
      console.error('Error loading prompts:', err);
      setError(err instanceof Error ? err.message : 'Failed to load prompts');
      toast.error('Failed to load saved prompts');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await api.scenarios.deletePrompt(id);
      toast.success('Prompt deleted successfully');
      setPrompts(prompts.filter(prompt => prompt.id !== id));
    } catch (error) {
      toast.error('Failed to delete prompt');
      console.error('Error deleting prompt:', error);
    }
  };

  useEffect(() => {
    loadPrompts();
  }, []);

  if (loading) {
    return <div className="text-center py-4">Loading saved prompts...</div>;
  }

  if (error) {
    return (
      <div className="text-center py-4 text-red-600">
        Error loading prompts: {error}
      </div>
    );
  }

  if (prompts.length === 0) {
    return (
      <div className="text-center py-4 text-gray-500">
        No saved prompts found. Create a new one to get started!
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {prompts.map((prompt) => (
        <div
          key={prompt.id}
          className="border rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer"
          onClick={() => onSelectPrompt?.(prompt)}
        >
          <h3 className="font-medium text-gray-900 dark:text-white">
            {prompt.persona}
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {prompt.prompt.substring(0, 100)}...
          </p>
          <div className="mt-2 flex items-center text-sm text-gray-500 dark:text-gray-400">
            <span className="mr-3">Voice: {prompt.voice_type}</span>
            <span>Temperature: {prompt.temperature}</span>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleDelete(prompt.id);
            }}
            className="ml-4 p-2 text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-colors"
          >
            <TrashIcon className="h-5 w-5" />
          </button>
        </div>
      ))}
    </div>
  );
}; 