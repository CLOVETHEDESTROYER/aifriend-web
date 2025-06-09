import React from 'react';
import { BusinessSize, BusinessProfile } from '../../types/business';
import { LOCATION_WAGE_DATA, getStatesByRegion } from '../../utils/industryData';

interface BusinessDetailsStepProps {
  businessName: string;
  businessSize?: BusinessSize;
  location?: BusinessProfile['location'];
  onUpdate: (updates: Partial<BusinessProfile>) => void;
}

const BUSINESS_SIZES: Array<{ value: BusinessSize; label: string; description: string }> = [
  { value: '1-5', label: '1-5 employees', description: 'Small team, owner-operated' },
  { value: '6-15', label: '6-15 employees', description: 'Growing small business' },
  { value: '16-30', label: '16-30 employees', description: 'Medium business' },
  { value: '31-50', label: '31-50 employees', description: 'Established business' },
  { value: '51-100', label: '51-100 employees', description: 'Large business' },
  { value: '100+', label: '100+ employees', description: 'Enterprise business' }
];

export const BusinessDetailsStep: React.FC<BusinessDetailsStepProps> = ({
  businessName,
  businessSize,
  location,
  onUpdate
}) => {
  const statesByRegion = getStatesByRegion();

  const handleNameChange = (name: string) => {
    onUpdate({ businessName: name });
  };

  const handleSizeChange = (size: BusinessSize) => {
    onUpdate({ businessSize: size });
  };

  const handleStateChange = (state: string) => {
    const locationData = LOCATION_WAGE_DATA[state];
    if (locationData) {
      onUpdate({
        location: {
          state,
          region: locationData.region
        }
      });
    }
  };

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          Tell us about your business
        </h3>
        <p className="text-gray-600 dark:text-gray-400">
          This helps us calculate accurate cost savings for your area
        </p>
      </div>

      {/* Business Name */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Business Name
        </label>
        <input
          type="text"
          value={businessName}
          onChange={(e) => handleNameChange(e.target.value)}
          placeholder="Enter your business name"
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
        />
      </div>

      {/* Business Size */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
          How many employees do you have?
        </label>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {BUSINESS_SIZES.map((size) => (
            <button
              key={size.value}
              onClick={() => handleSizeChange(size.value)}
              className={`p-4 rounded-lg border-2 text-left transition-all ${
                businessSize === size.value
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
              }`}
            >
              <div className="font-semibold text-gray-900 dark:text-white">
                {size.label}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {size.description}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Location */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
          What state is your business located in?
        </label>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
          We use this to calculate accurate labor costs and ROI for your area
        </p>
        
        <div className="space-y-4">
          {Object.entries(statesByRegion).map(([region, states]) => (
            <div key={region}>
              <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 capitalize">
                {region.replace('_', ' ')} Region
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {states.map((state) => (
                  <button
                    key={state}
                    onClick={() => handleStateChange(state)}
                    className={`px-3 py-2 text-sm rounded border transition-colors ${
                      location?.state === state
                        ? 'border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300'
                        : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500 text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    {state}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        {location?.state && (
          <div className="mt-4 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
            <div className="text-sm text-green-800 dark:text-green-200">
              <strong>{location.state}</strong> - Average hourly wage: ${LOCATION_WAGE_DATA[location.state].avgHourlyWage}/hr
              <br />
              Cost of living multiplier: {LOCATION_WAGE_DATA[location.state].costOfLiving}x
            </div>
          </div>
        )}
      </div>
    </div>
  );
}; 