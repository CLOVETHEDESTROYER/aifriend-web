import React, { useState } from 'react';
import { BusinessType, BusinessProfile } from '../../types/business';
import { INDUSTRY_DATA } from '../../utils/industryData';

interface CallVolumeStepProps {
  callVolume?: BusinessProfile['currentCallVolume'];
  serviceValue?: number;
  bookingMethod?: BusinessProfile['currentBookingMethod'];
  businessType?: BusinessType;
  onUpdate: (updates: Partial<BusinessProfile>) => void;
}

const BOOKING_METHODS: Array<{
  value: BusinessProfile['currentBookingMethod'];
  label: string;
  description: string;
}> = [
  { value: 'phone_only', label: 'Phone Only', description: 'All bookings happen over the phone' },
  { value: 'online_only', label: 'Online Only', description: 'All bookings through website/app' },
  { value: 'both', label: 'Phone & Online', description: 'Mix of phone and online bookings' },
  { value: 'in_person', label: 'In-Person', description: 'Walk-ins and in-person bookings' }
];

export const CallVolumeStep: React.FC<CallVolumeStepProps> = ({
  callVolume,
  serviceValue,
  bookingMethod,
  businessType,
  onUpdate
}) => {
  const [dailyCalls, setDailyCalls] = useState(callVolume?.daily || 0);
  const [currentServiceValue, setCurrentServiceValue] = useState(serviceValue || 0);

  const industryData = businessType ? INDUSTRY_DATA[businessType] : null;

  const handleCallVolumeChange = (daily: number) => {
    setDailyCalls(daily);
    onUpdate({
      currentCallVolume: {
        daily,
        monthly: daily * 22 // business days
      }
    });
  };

  const handleServiceValueChange = (value: number) => {
    setCurrentServiceValue(value);
    onUpdate({ averageServiceValue: value });
  };

  const handleBookingMethodChange = (method: BusinessProfile['currentBookingMethod']) => {
    onUpdate({ currentBookingMethod: method });
  };

  const suggestedServiceValue = industryData?.averageServiceValue.mid || 250;

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          Tell us about your current call volume
        </h3>
        <p className="text-gray-600 dark:text-gray-400">
          This helps us calculate your potential time and cost savings
        </p>
      </div>

      {/* Daily Call Volume */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
          How many business calls do you receive per day on average?
        </label>
        <div className="space-y-4">
          <input
            type="number"
            value={dailyCalls || ''}
            onChange={(e) => handleCallVolumeChange(parseInt(e.target.value) || 0)}
            placeholder="Enter daily call volume"
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            min="0"
          />
          
          {/* Quick selection buttons */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[5, 10, 20, 50].map((volume) => (
              <button
                key={volume}
                onClick={() => handleCallVolumeChange(volume)}
                className={`px-4 py-2 rounded border transition-colors ${
                  dailyCalls === volume
                    ? 'border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300'
                    : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500 text-gray-700 dark:text-gray-300'
                }`}
              >
                {volume}/day
              </button>
            ))}
          </div>

          {dailyCalls > 0 && (
            <div className="text-sm text-gray-600 dark:text-gray-400">
              That's approximately <strong>{dailyCalls * 22} calls per month</strong>
            </div>
          )}
        </div>
      </div>

      {/* Average Service Value */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
          What's your average service value per customer?
        </label>
        {industryData && (
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            Typical for {industryData.name}: ${industryData.averageServiceValue.low} - ${industryData.averageServiceValue.high}
          </p>
        )}
        
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <span className="text-gray-700 dark:text-gray-300">$</span>
            <input
              type="number"
              value={currentServiceValue || ''}
              onChange={(e) => handleServiceValueChange(parseInt(e.target.value) || 0)}
              placeholder={`e.g., ${suggestedServiceValue}`}
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              min="0"
            />
          </div>

          {/* Quick selection buttons */}
          {industryData && (
            <div className="grid grid-cols-3 gap-3">
              <button
                onClick={() => handleServiceValueChange(industryData.averageServiceValue.low)}
                className={`px-4 py-2 rounded border transition-colors ${
                  currentServiceValue === industryData.averageServiceValue.low
                    ? 'border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300'
                    : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500 text-gray-700 dark:text-gray-300'
                }`}
              >
                ${industryData.averageServiceValue.low} (Low)
              </button>
              <button
                onClick={() => handleServiceValueChange(industryData.averageServiceValue.mid)}
                className={`px-4 py-2 rounded border transition-colors ${
                  currentServiceValue === industryData.averageServiceValue.mid
                    ? 'border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300'
                    : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500 text-gray-700 dark:text-gray-300'
                }`}
              >
                ${industryData.averageServiceValue.mid} (Avg)
              </button>
              <button
                onClick={() => handleServiceValueChange(industryData.averageServiceValue.high)}
                className={`px-4 py-2 rounded border transition-colors ${
                  currentServiceValue === industryData.averageServiceValue.high
                    ? 'border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300'
                    : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500 text-gray-700 dark:text-gray-300'
                }`}
              >
                ${industryData.averageServiceValue.high} (High)
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Current Booking Method */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
          How do customers currently book with you?
        </label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {BOOKING_METHODS.map((method) => (
            <button
              key={method.value}
              onClick={() => handleBookingMethodChange(method.value)}
              className={`p-4 rounded-lg border-2 text-left transition-all ${
                bookingMethod === method.value
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
              }`}
            >
              <div className="font-semibold text-gray-900 dark:text-white">
                {method.label}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {method.description}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Preview calculation */}
      {dailyCalls > 0 && currentServiceValue > 0 && industryData && (
        <div className="p-6 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
          <h4 className="font-semibold text-green-900 dark:text-green-100 mb-3">
            Quick ROI Preview:
          </h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <div className="text-green-800 dark:text-green-200">Monthly Calls:</div>
              <div className="font-semibold">{dailyCalls * 22}</div>
            </div>
            <div>
              <div className="text-green-800 dark:text-green-200">Potential Monthly Revenue:</div>
              <div className="font-semibold">${((dailyCalls * 22) * currentServiceValue * 0.15).toLocaleString()}</div>
            </div>
          </div>
          <div className="text-xs text-green-700 dark:text-green-300 mt-2">
            Based on 15% improvement in conversion rates with AI assistance
          </div>
        </div>
      )}
    </div>
  );
}; 