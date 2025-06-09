import React from 'react';
import { useNavigate } from 'react-router-dom';
import { OnboardingWizard } from '../components/Onboarding/OnboardingWizard';
import { useBusinessProfile } from '../context/BusinessProfileContext';
import { BusinessProfile } from '../types/business';
import { toast } from 'react-hot-toast';

export const Onboarding: React.FC = () => {
  const navigate = useNavigate();
  const { setBusinessProfile } = useBusinessProfile();

  const handleComplete = (profile: BusinessProfile) => {
    setBusinessProfile(profile);
    toast.success('Onboarding completed! Welcome to AI Voice Assistant.');
    navigate('/dashboard');
  };

  const handleSkip = () => {
    navigate('/dashboard');
  };

  return (
    <OnboardingWizard 
      onComplete={handleComplete} 
      onSkip={handleSkip}
    />
  );
}; 