import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useBusinessProfile } from '../../context/BusinessProfileContext';
import { useAuth } from '../../hooks/useAuth';

interface OnboardingCheckProps {
  children: React.ReactNode;
}

export const OnboardingCheck: React.FC<OnboardingCheckProps> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isOnboardingComplete } = useBusinessProfile();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    // Only redirect if user is authenticated and not already on onboarding page
    if (isAuthenticated && !isOnboardingComplete && location.pathname !== '/onboarding') {
      navigate('/onboarding');
    }
  }, [isAuthenticated, isOnboardingComplete, location.pathname, navigate]);

  // If not authenticated or on onboarding page, render children
  if (!isAuthenticated || location.pathname === '/onboarding') {
    return <>{children}</>;
  }

  // If onboarding is not complete and we're not on the onboarding page, don't render anything
  // (the useEffect will handle the redirect)
  if (!isOnboardingComplete) {
    return null;
  }

  // Onboarding is complete, render children
  return <>{children}</>;
}; 