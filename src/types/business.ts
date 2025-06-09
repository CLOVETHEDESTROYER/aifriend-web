// Business Profile Types for Onboarding System
export type BusinessType = 
  | 'medical_practice'      // Doctors, dentists, specialists
  | 'legal_services'        // Law firms, attorneys  
  | 'home_services'         // HVAC, plumbing, electrical
  | 'professional_services' // Accounting, consulting
  | 'real_estate'           // Realtors, property management
  | 'insurance_agency'      // Insurance brokers
  | 'marketing_agency'      // Digital marketing, advertising
  | 'automotive_services'   // Auto repair, dealerships
  | 'beauty_wellness'       // Salons, spas, fitness
  | 'financial_services';   // Financial advisors, wealth mgmt

export type BusinessSize = 
  | '1-5' 
  | '6-15' 
  | '16-30' 
  | '31-50' 
  | '51-100' 
  | '100+';

export type USRegion = 'northeast' | 'southeast' | 'midwest' | 'southwest' | 'west';

export interface BusinessProfile {
  businessType: BusinessType;
  businessName: string;
  businessSize: BusinessSize;
  location: {
    state: string;
    region: USRegion;
  };
  currentCallVolume: {
    daily: number;
    monthly: number;
  };
  averageServiceValue: number;
  currentBookingMethod: 'phone_only' | 'online_only' | 'both' | 'in_person';
  painPoints: string[];
  goals: string[];
  isOnboardingComplete: boolean;
  onboardingCompletedAt?: Date;
}

export interface IndustryData {
  type: BusinessType;
  name: string;
  description: string;
  icon: string;
  averageServiceValue: {
    low: number;
    mid: number;
    high: number;
  };
  timeSavingsPerCall: {
    appointment_booking: number;
    follow_up: number;
    qualification: number;
    customer_service: number;
  };
  commonPainPoints: string[];
  keyMetrics: {
    missedCallCost: number;
    avgHourlyRate: number;
    conversionRate: number;
  };
}

export interface LocationWageData {
  avgHourlyWage: number;
  region: USRegion;
  costOfLiving: number; // multiplier
}

export interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  isCompleted: boolean;
  isActive: boolean;
}

export interface ROICalculation {
  timeSavedPerMonth: number; // minutes
  costSavingsPerMonth: number; // dollars
  revenueProtectedPerMonth: number; // dollars
  totalROIPerMonth: number; // dollars
  paybackPeriod: number; // months
  yearlyROI: number; // percentage
} 