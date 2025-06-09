import React from 'react';
import { BusinessType, BusinessProfile } from '../../types/business';
import { INDUSTRY_DATA } from '../../utils/industryData';

interface PainPointsStepProps {
  businessType?: BusinessType;
  selectedPainPoints: string[];
  selectedGoals: string[];
  onUpdate: (updates: Partial<BusinessProfile>) => void;
}

const COMMON_GOALS = [
  'Increase conversion rates',
  'Reduce staff workload',
  'Improve customer experience',
  'Capture after-hours calls',
  'Scale without hiring',
  'Reduce missed opportunities',
  'Improve response times',
  'Better call documentation',
  'Consistent service quality',
  'Free up time for higher-value work'
];

export const PainPointsStep: React.FC<PainPointsStepProps> = ({
  businessType,
  selectedPainPoints,
  selectedGoals,
  onUpdate
}) => {
  const industryData = businessType ? INDUSTRY_DATA[businessType] : null;
  const industryPainPoints = industryData?.commonPainPoints || [];

  const handlePainPointToggle = (painPoint: string) => {
    const newPainPoints = selectedPainPoints.includes(painPoint)
      ? selectedPainPoints.filter(p => p !== painPoint)
      : [...selectedPainPoints, painPoint];
    
    onUpdate({ painPoints: newPainPoints });
  };

  const handleGoalToggle = (goal: string) => {
    const newGoals = selectedGoals.includes(goal)
      ? selectedGoals.filter(g => g !== goal)
      : [...selectedGoals, goal];
    
    onUpdate({ goals: newGoals });
  };

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          What challenges can we help solve?
        </h3>
        <p className="text-gray-600 dark:text-gray-400">
          Select the pain points and goals that matter most to your business
        </p>
      </div>

      {/* Industry-Specific Pain Points */}
      {industryPainPoints.length > 0 && (
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
            Common challenges in {industryData?.name}:
          </label>
          <div className="space-y-3">
            {industryPainPoints.map((painPoint, index) => (
              <label
                key={index}
                className="flex items-start space-x-3 p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={selectedPainPoints.includes(painPoint)}
                  onChange={() => handlePainPointToggle(painPoint)}
                  className="mt-1 h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  {painPoint}
                </span>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Goals Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
          What are your main goals with AI voice assistance?
        </label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {COMMON_GOALS.map((goal) => (
            <label
              key={goal}
              className="flex items-center space-x-3 p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer"
            >
              <input
                type="checkbox"
                checked={selectedGoals.includes(goal)}
                onChange={() => handleGoalToggle(goal)}
                className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">
                {goal}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Summary */}
      {(selectedPainPoints.length > 0 || selectedGoals.length > 0) && (
        <div className="p-6 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
          <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-3">
            Your Business Focus:
          </h4>
          
          {selectedPainPoints.length > 0 && (
            <div className="mb-4">
              <h5 className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-2">
                Challenges to Address:
              </h5>
              <div className="flex flex-wrap gap-2">
                {selectedPainPoints.map((point, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200 text-xs rounded"
                  >
                    {point}
                  </span>
                ))}
              </div>
            </div>
          )}

          {selectedGoals.length > 0 && (
            <div>
              <h5 className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-2">
                Goals to Achieve:
              </h5>
              <div className="flex flex-wrap gap-2">
                {selectedGoals.map((goal, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 text-xs rounded"
                  >
                    {goal}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <div className="text-center text-sm text-gray-500 dark:text-gray-400">
        Don't worry if you're not sure - you can always update these preferences later
      </div>
    </div>
  );
}; 