import { BusinessType, IndustryData, LocationWageData, USRegion } from '../types/business';

// Top 10 Service Business Industries with Real Market Data
export const INDUSTRY_DATA: Record<BusinessType, IndustryData> = {
  medical_practice: {
    type: 'medical_practice',
    name: 'Medical Practice',
    description: 'Doctors, dentists, specialists, medical clinics',
    icon: '🏥',
    averageServiceValue: { low: 150, mid: 300, high: 500 },
    timeSavingsPerCall: {
      appointment_booking: 12, // minutes saved vs manual scheduling
      follow_up: 8,
      qualification: 15,
      customer_service: 10
    },
    commonPainPoints: [
      'Missed appointments cost $200+ each',
      'Staff spending 2+ hours daily on phone calls',
      'After-hours calls going to voicemail',
      'Double-booking and scheduling conflicts',
      'Insurance verification taking too long'
    ],
    keyMetrics: {
      missedCallCost: 250, // Average no-show cost
      avgHourlyRate: 35,   // Medical admin staff
      conversionRate: 0.85 // High conversion for medical
    }
  },

  legal_services: {
    type: 'legal_services',
    name: 'Legal Services',
    description: 'Law firms, attorneys, legal consultations',
    icon: '⚖️',
    averageServiceValue: { low: 250, mid: 500, high: 1000 },
    timeSavingsPerCall: {
      appointment_booking: 15,
      follow_up: 12,
      qualification: 20, // Legal qualification takes longer
      customer_service: 8
    },
    commonPainPoints: [
      'Potential clients calling outside business hours',
      'Initial consultations not being scheduled efficiently',
      'High value leads going to competitors',
      'Admin staff overwhelmed with intake calls',
      'Need to qualify legal matter urgency'
    ],
    keyMetrics: {
      missedCallCost: 400,
      avgHourlyRate: 45,
      conversionRate: 0.65
    }
  },

  home_services: {
    type: 'home_services',
    name: 'Home Services',
    description: 'HVAC, plumbing, electrical, landscaping, cleaning',
    icon: '🔧',
    averageServiceValue: { low: 120, mid: 250, high: 450 },
    timeSavingsPerCall: {
      appointment_booking: 10,
      follow_up: 6,
      qualification: 12,
      customer_service: 8
    },
    commonPainPoints: [
      'Emergency calls need immediate response',
      'Seasonal demand spikes overwhelming staff',
      'Customers calling multiple contractors',
      'Difficulty scheduling around availability',
      'Missed calls = lost business to competitors'
    ],
    keyMetrics: {
      missedCallCost: 180,
      avgHourlyRate: 28,
      conversionRate: 0.72
    }
  },

  professional_services: {
    type: 'professional_services',
    name: 'Professional Services',
    description: 'Accounting, consulting, business services',
    icon: '💼',
    averageServiceValue: { low: 200, mid: 400, high: 800 },
    timeSavingsPerCall: {
      appointment_booking: 12,
      follow_up: 10,
      qualification: 18,
      customer_service: 8
    },
    commonPainPoints: [
      'Client consultations difficult to schedule',
      'Tax season overwhelming phone volume',
      'Need to qualify business needs quickly',
      'Follow-up calls taking too much time',
      'Administrative tasks reducing billable hours'
    ],
    keyMetrics: {
      missedCallCost: 320,
      avgHourlyRate: 40,
      conversionRate: 0.68
    }
  },

  real_estate: {
    type: 'real_estate',
    name: 'Real Estate',
    description: 'Realtors, property management, real estate services',
    icon: '🏠',
    averageServiceValue: { low: 300, mid: 600, high: 1200 },
    timeSavingsPerCall: {
      appointment_booking: 8,  // Quick showing bookings
      follow_up: 12, // Important for lead nurturing
      qualification: 15,
      customer_service: 6
    },
    commonPainPoints: [
      'Showing requests need immediate response',
      'Lead follow-up is time consuming',
      'Weekend and evening calls common',
      'Competing agents responding faster',
      'Property inquiries require quick turnaround'
    ],
    keyMetrics: {
      missedCallCost: 500, // High commission potential
      avgHourlyRate: 32,
      conversionRate: 0.45 // Lower conversion but high value
    }
  },

  insurance_agency: {
    type: 'insurance_agency',
    name: 'Insurance Agency',
    description: 'Insurance brokers, agents, policy services',
    icon: '🛡️',
    averageServiceValue: { low: 150, mid: 300, high: 600 },
    timeSavingsPerCall: {
      appointment_booking: 10,
      follow_up: 15, // Important for insurance sales
      qualification: 20, // Complex needs assessment
      customer_service: 12
    },
    commonPainPoints: [
      'Quote requests need quick turnaround',
      'Policy renewals require follow-up',
      'Claims support calls are urgent',
      'Lead qualification takes significant time',
      'Compliance requirements for documentation'
    ],
    keyMetrics: {
      missedCallCost: 220,
      avgHourlyRate: 35,
      conversionRate: 0.55
    }
  },

  marketing_agency: {
    type: 'marketing_agency',
    name: 'Marketing Agency',
    description: 'Digital marketing, advertising, creative services',
    icon: '📈',
    averageServiceValue: { low: 250, mid: 500, high: 1000 },
    timeSavingsPerCall: {
      appointment_booking: 8,
      follow_up: 10,
      qualification: 15,
      customer_service: 6
    },
    commonPainPoints: [
      'New business inquiries need fast response',
      'Project scope calls take significant time',
      'Client check-ins reduce productive time',
      'Proposal requests require quick turnaround',
      'Creative briefings need detailed capture'
    ],
    keyMetrics: {
      missedCallCost: 350,
      avgHourlyRate: 42,
      conversionRate: 0.50
    }
  },

  automotive_services: {
    type: 'automotive_services',
    name: 'Automotive Services',
    description: 'Auto repair, dealerships, automotive services',
    icon: '🚗',
    averageServiceValue: { low: 100, mid: 200, high: 400 },
    timeSavingsPerCall: {
      appointment_booking: 8,
      follow_up: 6,
      qualification: 10,
      customer_service: 8
    },
    commonPainPoints: [
      'Service appointments need quick scheduling',
      'Emergency repairs require immediate response',
      'Parts availability inquiries are frequent',
      'Estimate requests take significant time',
      'Customer updates during service important'
    ],
    keyMetrics: {
      missedCallCost: 150,
      avgHourlyRate: 25,
      conversionRate: 0.75
    }
  },

  beauty_wellness: {
    type: 'beauty_wellness',
    name: 'Beauty & Wellness',
    description: 'Salons, spas, fitness centers, wellness services',
    icon: '💆',
    averageServiceValue: { low: 80, mid: 150, high: 300 },
    timeSavingsPerCall: {
      appointment_booking: 6, // Quick bookings
      follow_up: 8,
      qualification: 8,
      customer_service: 6
    },
    commonPainPoints: [
      'Last-minute cancellations costly',
      'Booking confirmations take staff time',
      'Package sales require follow-up',
      'Membership inquiries need qualification',
      'Special event bookings get complicated'
    ],
    keyMetrics: {
      missedCallCost: 120,
      avgHourlyRate: 22,
      conversionRate: 0.80
    }
  },

  financial_services: {
    type: 'financial_services',
    name: 'Financial Services',
    description: 'Financial advisors, wealth management, planning',
    icon: '💰',
    averageServiceValue: { low: 300, mid: 600, high: 1200 },
    timeSavingsPerCall: {
      appointment_booking: 12,
      follow_up: 15,
      qualification: 25, // Extensive financial qualification
      customer_service: 10
    },
    commonPainPoints: [
      'Complex financial consultations to schedule',
      'Compliance requirements for call documentation',
      'High net worth clients expect immediate response',
      'Market volatility drives urgent calls',
      'Retirement planning requires detailed discussions'
    ],
    keyMetrics: {
      missedCallCost: 600, // Very high potential value
      avgHourlyRate: 50,
      conversionRate: 0.40 // Lower conversion but very high value
    }
  }
};

// US State Wage Data (2024 estimates) - Based on Bureau of Labor Statistics
export const LOCATION_WAGE_DATA: Record<string, LocationWageData> = {
  // Northeast
  'Connecticut': { avgHourlyWage: 32, region: 'northeast', costOfLiving: 1.35 },
  'Maine': { avgHourlyWage: 26, region: 'northeast', costOfLiving: 1.10 },
  'Massachusetts': { avgHourlyWage: 34, region: 'northeast', costOfLiving: 1.40 },
  'New Hampshire': { avgHourlyWage: 28, region: 'northeast', costOfLiving: 1.15 },
  'New Jersey': { avgHourlyWage: 31, region: 'northeast', costOfLiving: 1.30 },
  'New York': { avgHourlyWage: 33, region: 'northeast', costOfLiving: 1.45 },
  'Pennsylvania': { avgHourlyWage: 27, region: 'northeast', costOfLiving: 1.05 },
  'Rhode Island': { avgHourlyWage: 29, region: 'northeast', costOfLiving: 1.20 },
  'Vermont': { avgHourlyWage: 27, region: 'northeast', costOfLiving: 1.15 },

  // Southeast  
  'Alabama': { avgHourlyWage: 22, region: 'southeast', costOfLiving: 0.85 },
  'Arkansas': { avgHourlyWage: 21, region: 'southeast', costOfLiving: 0.80 },
  'Delaware': { avgHourlyWage: 28, region: 'southeast', costOfLiving: 1.10 },
  'Florida': { avgHourlyWage: 25, region: 'southeast', costOfLiving: 1.00 },
  'Georgia': { avgHourlyWage: 24, region: 'southeast', costOfLiving: 0.95 },
  'Kentucky': { avgHourlyWage: 22, region: 'southeast', costOfLiving: 0.85 },
  'Louisiana': { avgHourlyWage: 23, region: 'southeast', costOfLiving: 0.90 },
  'Maryland': { avgHourlyWage: 30, region: 'southeast', costOfLiving: 1.25 },
  'Mississippi': { avgHourlyWage: 20, region: 'southeast', costOfLiving: 0.75 },
  'North Carolina': { avgHourlyWage: 24, region: 'southeast', costOfLiving: 0.95 },
  'South Carolina': { avgHourlyWage: 23, region: 'southeast', costOfLiving: 0.90 },
  'Tennessee': { avgHourlyWage: 23, region: 'southeast', costOfLiving: 0.90 },
  'Virginia': { avgHourlyWage: 28, region: 'southeast', costOfLiving: 1.15 },
  'West Virginia': { avgHourlyWage: 21, region: 'southeast', costOfLiving: 0.80 },

  // Midwest
  'Illinois': { avgHourlyWage: 28, region: 'midwest', costOfLiving: 1.10 },
  'Indiana': { avgHourlyWage: 23, region: 'midwest', costOfLiving: 0.90 },
  'Iowa': { avgHourlyWage: 24, region: 'midwest', costOfLiving: 0.90 },
  'Kansas': { avgHourlyWage: 23, region: 'midwest', costOfLiving: 0.85 },
  'Michigan': { avgHourlyWage: 25, region: 'midwest', costOfLiving: 0.95 },
  'Minnesota': { avgHourlyWage: 28, region: 'midwest', costOfLiving: 1.05 },
  'Missouri': { avgHourlyWage: 23, region: 'midwest', costOfLiving: 0.85 },
  'Nebraska': { avgHourlyWage: 24, region: 'midwest', costOfLiving: 0.90 },
  'North Dakota': { avgHourlyWage: 26, region: 'midwest', costOfLiving: 0.95 },
  'Ohio': { avgHourlyWage: 24, region: 'midwest', costOfLiving: 0.90 },
  'South Dakota': { avgHourlyWage: 23, region: 'midwest', costOfLiving: 0.85 },
  'Wisconsin': { avgHourlyWage: 25, region: 'midwest', costOfLiving: 0.95 },

  // Southwest
  'Arizona': { avgHourlyWage: 26, region: 'southwest', costOfLiving: 1.05 },
  'New Mexico': { avgHourlyWage: 23, region: 'southwest', costOfLiving: 0.90 },
  'Oklahoma': { avgHourlyWage: 22, region: 'southwest', costOfLiving: 0.85 },
  'Texas': { avgHourlyWage: 25, region: 'southwest', costOfLiving: 1.00 },

  // West
  'Alaska': { avgHourlyWage: 30, region: 'west', costOfLiving: 1.30 },
  'California': { avgHourlyWage: 35, region: 'west', costOfLiving: 1.50 },
  'Colorado': { avgHourlyWage: 29, region: 'west', costOfLiving: 1.20 },
  'Hawaii': { avgHourlyWage: 28, region: 'west', costOfLiving: 1.40 },
  'Idaho': { avgHourlyWage: 24, region: 'west', costOfLiving: 1.00 },
  'Montana': { avgHourlyWage: 24, region: 'west', costOfLiving: 1.05 },
  'Nevada': { avgHourlyWage: 27, region: 'west', costOfLiving: 1.10 },
  'Oregon': { avgHourlyWage: 29, region: 'west', costOfLiving: 1.25 },
  'Utah': { avgHourlyWage: 25, region: 'west', costOfLiving: 1.05 },
  'Washington': { avgHourlyWage: 32, region: 'west', costOfLiving: 1.30 },
  'Wyoming': { avgHourlyWage: 25, region: 'west', costOfLiving: 1.00 }
};

// Helper function to get state options grouped by region
export const getStatesByRegion = (): Record<USRegion, string[]> => {
  const statesByRegion: Record<USRegion, string[]> = {
    northeast: [],
    southeast: [],
    midwest: [],
    southwest: [],
    west: []
  };

  Object.entries(LOCATION_WAGE_DATA).forEach(([state, data]) => {
    statesByRegion[data.region].push(state);
  });

  return statesByRegion;
};

// Calculate ROI based on business profile
export const calculateROI = (
  businessType: BusinessType,
  businessSize: string,
  callVolume: number,
  state: string,
  serviceValue: number
) => {
  const industryData = INDUSTRY_DATA[businessType];
  const locationData = LOCATION_WAGE_DATA[state];
  
  if (!industryData || !locationData) {
    return null;
  }

  // Size multipliers for employee count
  const sizeMultipliers: Record<string, number> = {
    '1-5': 1,
    '6-15': 1.2,
    '16-30': 1.4,
    '31-50': 1.6,
    '51-100': 1.8,
    '100+': 2.0
  };

  const sizeMultiplier = sizeMultipliers[businessSize] || 1;
  const fullyLoadedHourlyRate = locationData.avgHourlyWage * locationData.costOfLiving * 1.4; // Benefits

  // Time savings per call (weighted average)
  const avgTimeSavingsPerCall = 
    (industryData.timeSavingsPerCall.appointment_booking * 0.4) +
    (industryData.timeSavingsPerCall.follow_up * 0.3) +
    (industryData.timeSavingsPerCall.qualification * 0.2) +
    (industryData.timeSavingsPerCall.customer_service * 0.1);

  // Monthly calculations
  const monthlyCallVolume = callVolume * 22; // business days
  const timeSavedPerMonth = monthlyCallVolume * avgTimeSavingsPerCall;
  const costSavingsPerMonth = (timeSavedPerMonth / 60) * fullyLoadedHourlyRate * sizeMultiplier;
  
  // Revenue protection (converted calls * service value * conversion rate)
  const convertedCalls = monthlyCallVolume * industryData.keyMetrics.conversionRate;
  const revenueProtectedPerMonth = convertedCalls * serviceValue * 0.15; // 15% AI conversion improvement

  const totalROIPerMonth = costSavingsPerMonth + revenueProtectedPerMonth;
  const assumedMonthlyCost = 200; // Platform cost assumption
  const yearlyROI = ((totalROIPerMonth - assumedMonthlyCost) * 12) / (assumedMonthlyCost * 12) * 100;

  return {
    timeSavedPerMonth,
    costSavingsPerMonth,
    revenueProtectedPerMonth,
    totalROIPerMonth,
    paybackPeriod: assumedMonthlyCost / (totalROIPerMonth - assumedMonthlyCost),
    yearlyROI
  };
}; 