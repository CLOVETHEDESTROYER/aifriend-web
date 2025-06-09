import React from 'react';
import { BusinessType } from '../../types/business';
import { INDUSTRY_DATA } from '../../utils/industryData';

interface BusinessTypeStepProps {
  selectedType?: BusinessType;
  onSelect: (type: BusinessType) => void;
}

export const BusinessTypeStep: React.FC<BusinessTypeStepProps> = ({ selectedType, onSelect }) => {
  const industries = Object.values(INDUSTRY_DATA);

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          What type of business do you run?
        </h3>
        <p className="text-gray-600 dark:text-gray-400">
          We'll customize the experience based on your industry
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {industries.map((industry) => (
          <button
            key={industry.type}
            onClick={() => onSelect(industry.type)}
            className={`p-6 rounded-lg border-2 text-left transition-all hover:shadow-md ${
              selectedType === industry.type
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
            }`}
          >
            <div className="flex items-center mb-3">
              <span className="text-2xl mr-3">{industry.icon}</span>
              <h4 className="font-semibold text-gray-900 dark:text-white">
                {industry.name}
              </h4>
            </div>
            
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
              {industry.description}
            </p>
            
            <div className="text-xs text-gray-500 dark:text-gray-500">
              <div className="flex justify-between">
                <span>Avg Service Value:</span>
                <span>${industry.averageServiceValue.low}-${industry.averageServiceValue.high}</span>
              </div>
              <div className="flex justify-between mt-1">
                <span>Time Saved/Call:</span>
                <span>{Math.round(
                  (industry.timeSavingsPerCall.appointment_booking * 0.4) +
                  (industry.timeSavingsPerCall.follow_up * 0.3) +
                  (industry.timeSavingsPerCall.qualification * 0.2) +
                  (industry.timeSavingsPerCall.customer_service * 0.1)
                )}min</span>
              </div>
            </div>
          </button>
        ))}
      </div>

      {selectedType && (
        <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
          <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
            Common Challenges in {INDUSTRY_DATA[selectedType].name}:
          </h4>
          <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
            {INDUSTRY_DATA[selectedType].commonPainPoints.slice(0, 3).map((point, index) => (
              <li key={index} className="flex items-start">
                <span className="text-blue-500 mr-2">•</span>
                {point}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}; 