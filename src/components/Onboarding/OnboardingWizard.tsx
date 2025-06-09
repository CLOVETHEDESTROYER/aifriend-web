import React, { useState, useCallback } from 'react';
import { BusinessProfile, BusinessType, BusinessSize } from '../../types/business';
import { BusinessTypeStep } from './BusinessTypeStep';
import { BusinessDetailsStep } from './BusinessDetailsStep';
import { CallVolumeStep } from './CallVolumeStep';
import { PainPointsStep } from './PainPointsStep';
import { ReviewStep } from './ReviewStep';
import { PageContainer } from '../Layout/PageContainer';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

interface OnboardingWizardProps {
  onComplete: (profile: BusinessProfile) => void;
  onSkip?: () => void;
}

type OnboardingStepType = 'business_type' | 'business_details' | 'call_volume' | 'pain_points' | 'review';

const STEPS: Array<{ id: OnboardingStepType; title: string; description: string }> = [
  {
    id: 'business_type',
    title: 'Business Type',
    description: 'Tell us about your industry'
  },
  {
    id: 'business_details',
    title: 'Business Details',
    description: 'Company size and location'
  },
  {
    id: 'call_volume',
    title: 'Call Volume',
    description: 'Current call patterns'
  },
  {
    id: 'pain_points',
    title: 'Challenges & Goals',
    description: 'What problems can we solve?'
  },
  {
    id: 'review',
    title: 'Review & Calculate',
    description: 'See your potential ROI'
  }
];

export const OnboardingWizard: React.FC<OnboardingWizardProps> = ({ onComplete, onSkip }) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [businessProfile, setBusinessProfile] = useState<Partial<BusinessProfile>>({
    painPoints: [],
    goals: [],
    isOnboardingComplete: false
  });

  const currentStep = STEPS[currentStepIndex];
  const isFirstStep = currentStepIndex === 0;
  const isLastStep = currentStepIndex === STEPS.length - 1;

  const updateProfile = useCallback((updates: Partial<BusinessProfile>) => {
    setBusinessProfile(prev => ({ ...prev, ...updates }));
  }, []);

  const goToNextStep = useCallback(() => {
    if (currentStepIndex < STEPS.length - 1) {
      setCurrentStepIndex(prev => prev + 1);
    }
  }, [currentStepIndex]);

  const goToPreviousStep = useCallback(() => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(prev => prev - 1);
    }
  }, [currentStepIndex]);

  const handleComplete = useCallback(() => {
    const completeProfile: BusinessProfile = {
      businessType: businessProfile.businessType!,
      businessName: businessProfile.businessName!,
      businessSize: businessProfile.businessSize!,
      location: businessProfile.location!,
      currentCallVolume: businessProfile.currentCallVolume!,
      averageServiceValue: businessProfile.averageServiceValue!,
      currentBookingMethod: businessProfile.currentBookingMethod!,
      painPoints: businessProfile.painPoints || [],
      goals: businessProfile.goals || [],
      isOnboardingComplete: true,
      onboardingCompletedAt: new Date()
    };
    
    onComplete(completeProfile);
  }, [businessProfile, onComplete]);

  const isStepValid = (): boolean => {
    switch (currentStep.id) {
      case 'business_type':
        return !!businessProfile.businessType;
      case 'business_details':
        return !!(businessProfile.businessName && businessProfile.businessSize && businessProfile.location?.state);
      case 'call_volume':
        return !!(businessProfile.currentCallVolume?.daily && businessProfile.averageServiceValue);
      case 'pain_points':
        return true; // Optional step
      case 'review':
        return true;
      default:
        return false;
    }
  };

  const renderCurrentStep = () => {
    switch (currentStep.id) {
      case 'business_type':
        return (
          <BusinessTypeStep
            selectedType={businessProfile.businessType}
            onSelect={(type: BusinessType) => updateProfile({ businessType: type })}
          />
        );
      case 'business_details':
        return (
          <BusinessDetailsStep
            businessName={businessProfile.businessName || ''}
            businessSize={businessProfile.businessSize}
            location={businessProfile.location}
            onUpdate={updateProfile}
          />
        );
      case 'call_volume':
        return (
          <CallVolumeStep
            callVolume={businessProfile.currentCallVolume}
            serviceValue={businessProfile.averageServiceValue}
            bookingMethod={businessProfile.currentBookingMethod}
            businessType={businessProfile.businessType}
            onUpdate={updateProfile}
          />
        );
      case 'pain_points':
        return (
          <PainPointsStep
            businessType={businessProfile.businessType}
            selectedPainPoints={businessProfile.painPoints || []}
            selectedGoals={businessProfile.goals || []}
            onUpdate={updateProfile}
          />
        );
      case 'review':
        return (
          <ReviewStep
            businessProfile={businessProfile as BusinessProfile}
            onComplete={handleComplete}
          />
        );
      default:
        return null;
    }
  };

  return (
    <PageContainer>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Welcome to AI Voice Assistant
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Let's customize your experience and calculate your potential ROI
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            {STEPS.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div
                  className={`flex items-center justify-center w-10 h-10 rounded-full border-2 text-sm font-medium ${
                    index < currentStepIndex
                      ? 'bg-green-500 border-green-500 text-white'
                      : index === currentStepIndex
                      ? 'bg-blue-500 border-blue-500 text-white'
                      : 'bg-gray-100 border-gray-300 text-gray-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-400'
                  }`}
                >
                  {index < currentStepIndex ? '✓' : index + 1}
                </div>
                {index < STEPS.length - 1 && (
                  <div
                    className={`w-16 h-0.5 ml-4 ${
                      index < currentStepIndex ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
          
          <div className="text-center">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              {currentStep.title}
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {currentStep.description}
            </p>
          </div>
        </div>

        {/* Step Content */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-8 mb-8">
          {renderCurrentStep()}
        </div>

        {/* Navigation */}
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            {!isFirstStep && (
              <button
                onClick={goToPreviousStep}
                className="flex items-center gap-2 px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                <ChevronLeftIcon className="h-4 w-4" />
                Previous
              </button>
            )}
            
            {onSkip && isFirstStep && (
              <button
                onClick={onSkip}
                className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
              >
                Skip onboarding
              </button>
            )}
          </div>

          <div className="flex items-center gap-4">
            {!isLastStep ? (
              <button
                onClick={goToNextStep}
                disabled={!isStepValid()}
                className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Next
                <ChevronRightIcon className="h-4 w-4" />
              </button>
            ) : (
              <button
                onClick={handleComplete}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                Complete Setup
              </button>
            )}
          </div>
        </div>
      </div>
    </PageContainer>
  );
}; 