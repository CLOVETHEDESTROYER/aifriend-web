import React, { createContext, useContext, useState, useCallback } from 'react';
import { BusinessProfile } from '../types/business';

interface BusinessProfileContextType {
  businessProfile: BusinessProfile | null;
  setBusinessProfile: (profile: BusinessProfile) => void;
  updateBusinessProfile: (updates: Partial<BusinessProfile>) => void;
  clearBusinessProfile: () => void;
  isOnboardingComplete: boolean;
}

const BusinessProfileContext = createContext<BusinessProfileContextType | undefined>(undefined);

export const BusinessProfileProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [businessProfile, setBusinessProfileState] = useState<BusinessProfile | null>(() => {
    // Try to load from localStorage on initialization
    const stored = localStorage.getItem('businessProfile');
    return stored ? JSON.parse(stored) : null;
  });

  const setBusinessProfile = useCallback((profile: BusinessProfile) => {
    setBusinessProfileState(profile);
    localStorage.setItem('businessProfile', JSON.stringify(profile));
  }, []);

  const updateBusinessProfile = useCallback((updates: Partial<BusinessProfile>) => {
    setBusinessProfileState(prev => {
      if (!prev) return null;
      const updated = { ...prev, ...updates };
      localStorage.setItem('businessProfile', JSON.stringify(updated));
      return updated;
    });
  }, []);

  const clearBusinessProfile = useCallback(() => {
    setBusinessProfileState(null);
    localStorage.removeItem('businessProfile');
  }, []);

  const isOnboardingComplete = businessProfile?.isOnboardingComplete ?? false;

  return (
    <BusinessProfileContext.Provider value={{
      businessProfile,
      setBusinessProfile,
      updateBusinessProfile,
      clearBusinessProfile,
      isOnboardingComplete
    }}>
      {children}
    </BusinessProfileContext.Provider>
  );
};

export const useBusinessProfile = () => {
  const context = useContext(BusinessProfileContext);
  if (context === undefined) {
    throw new Error('useBusinessProfile must be used within a BusinessProfileProvider');
  }
  return context;
}; 