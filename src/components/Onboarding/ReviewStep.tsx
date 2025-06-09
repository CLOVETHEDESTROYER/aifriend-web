import React from 'react';
import { BusinessProfile } from '../../types/business';
import { INDUSTRY_DATA, calculateROI } from '../../utils/industryData';
import { 
  ClockIcon, 
  CurrencyDollarIcon, 
  ArrowTrendingUpIcon,
  BuildingOfficeIcon,
  MapPinIcon,
  PhoneIcon,
  CheckCircleIcon 
} from '@heroicons/react/24/outline';

interface ReviewStepProps {
  businessProfile: BusinessProfile;
  onComplete: () => void;
}

export const ReviewStep: React.FC<ReviewStepProps> = ({ businessProfile, onComplete }) => {
  const industryData = INDUSTRY_DATA[businessProfile.businessType];
  
  const roi = calculateROI(
    businessProfile.businessType,
    businessProfile.businessSize,
    businessProfile.currentCallVolume.daily,
    businessProfile.location.state,
    businessProfile.averageServiceValue
  );

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatTime = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
          Your Business Profile & ROI Calculation
        </h3>
        <p className="text-gray-600 dark:text-gray-400">
          Review your information and see the potential impact of AI voice assistance
        </p>
      </div>

      {/* Business Summary */}
      <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-6">
        <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
          <BuildingOfficeIcon className="h-5 w-5 mr-2" />
          Business Summary
        </h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <div className="text-sm text-gray-500 dark:text-gray-400">Business Name</div>
            <div className="font-medium text-gray-900 dark:text-white">{businessProfile.businessName}</div>
          </div>
          <div>
            <div className="text-sm text-gray-500 dark:text-gray-400">Industry</div>
            <div className="font-medium text-gray-900 dark:text-white flex items-center">
              <span className="mr-2">{industryData.icon}</span>
              {industryData.name}
            </div>
          </div>
          <div>
            <div className="text-sm text-gray-500 dark:text-gray-400">Team Size</div>
            <div className="font-medium text-gray-900 dark:text-white">{businessProfile.businessSize} employees</div>
          </div>
          <div>
            <div className="text-sm text-gray-500 dark:text-gray-400">Location</div>
            <div className="font-medium text-gray-900 dark:text-white flex items-center">
              <MapPinIcon className="h-4 w-4 mr-1" />
              {businessProfile.location.state}
            </div>
          </div>
        </div>
      </div>

      {/* Current Call Volume */}
      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6">
        <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
          <PhoneIcon className="h-5 w-5 mr-2" />
          Current Call Patterns
        </h4>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <div className="text-2xl font-bold text-blue-600">{businessProfile.currentCallVolume.daily}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Calls per day</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-blue-600">{businessProfile.currentCallVolume.monthly}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Calls per month</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-blue-600">{formatCurrency(businessProfile.averageServiceValue)}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Average service value</div>
          </div>
        </div>
      </div>

      {/* ROI Calculation */}
      {roi && (
        <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-6">
          <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-6 flex items-center">
            <ArrowTrendingUpIcon className="h-5 w-5 mr-2" />
            Your Projected ROI with AI Voice Assistant
          </h4>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="text-center">
              <div className="flex items-center justify-center w-16 h-16 bg-green-100 dark:bg-green-900/40 rounded-full mx-auto mb-3">
                <ClockIcon className="h-8 w-8 text-green-600" />
              </div>
              <div className="text-2xl font-bold text-green-600 mb-1">
                {formatTime(roi.timeSavedPerMonth)}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Time saved per month</div>
              <div className="text-xs text-green-700 dark:text-green-300 mt-1">
                ≈ {Math.round(roi.timeSavedPerMonth / 480)} work days saved
              </div>
            </div>

            <div className="text-center">
              <div className="flex items-center justify-center w-16 h-16 bg-yellow-100 dark:bg-yellow-900/40 rounded-full mx-auto mb-3">
                <CurrencyDollarIcon className="h-8 w-8 text-yellow-600" />
              </div>
              <div className="text-2xl font-bold text-yellow-600 mb-1">
                {formatCurrency(roi.costSavingsPerMonth)}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Cost savings per month</div>
              <div className="text-xs text-yellow-700 dark:text-yellow-300 mt-1">
                Labor cost reduction
              </div>
            </div>

            <div className="text-center">
              <div className="flex items-center justify-center w-16 h-16 bg-purple-100 dark:bg-purple-900/40 rounded-full mx-auto mb-3">
                <ArrowTrendingUpIcon className="h-8 w-8 text-purple-600" />
              </div>
              <div className="text-2xl font-bold text-purple-600 mb-1">
                {formatCurrency(roi.revenueProtectedPerMonth)}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Revenue protected per month</div>
              <div className="text-xs text-purple-700 dark:text-purple-300 mt-1">
                From improved conversions
              </div>
            </div>
          </div>

          <div className="border-t border-green-200 dark:border-green-800 pt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-lg font-semibold text-gray-900 dark:text-white">Total Monthly ROI</div>
                <div className="text-3xl font-bold text-green-600">{formatCurrency(roi.totalROIPerMonth)}</div>
              </div>
              <div>
                <div className="text-lg font-semibold text-gray-900 dark:text-white">Yearly ROI</div>
                <div className="text-3xl font-bold text-green-600">{Math.round(roi.yearlyROI)}%</div>
              </div>
              <div>
                <div className="text-lg font-semibold text-gray-900 dark:text-white">Payback Period</div>
                <div className="text-3xl font-bold text-green-600">{Math.round(roi.paybackPeriod)} months</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Selected Goals & Pain Points */}
      {(businessProfile.painPoints.length > 0 || businessProfile.goals.length > 0) && (
        <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-6">
          <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
            <CheckCircleIcon className="h-5 w-5 mr-2" />
            Your Focus Areas
          </h4>
          
          {businessProfile.painPoints.length > 0 && (
            <div className="mb-4">
              <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Challenges to Address:</h5>
              <div className="flex flex-wrap gap-2">
                {businessProfile.painPoints.map((point, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200 text-sm rounded-full"
                  >
                    {point}
                  </span>
                ))}
              </div>
            </div>
          )}

          {businessProfile.goals.length > 0 && (
            <div>
              <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Goals to Achieve:</h5>
              <div className="flex flex-wrap gap-2">
                {businessProfile.goals.map((goal, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 text-sm rounded-full"
                  >
                    {goal}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Call to Action */}
      <div className="text-center bg-gradient-to-r from-blue-50 to-green-50 dark:from-blue-900/20 dark:to-green-900/20 rounded-lg p-8">
        <h4 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          Ready to transform your business?
        </h4>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Based on your profile, AI voice assistance could save you significant time and money while improving customer experience.
        </p>
        
        <div className="flex items-center justify-center space-x-4">
          <button
            onClick={onComplete}
            className="px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
          >
            Complete Setup & Get Started
          </button>
        </div>
        
        <div className="mt-4 text-sm text-gray-500 dark:text-gray-400">
          * ROI calculations are estimates based on industry data and your business profile
        </div>
      </div>
    </div>
  );
}; 