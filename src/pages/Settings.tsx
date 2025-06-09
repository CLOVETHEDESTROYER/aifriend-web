import React, { useState } from 'react';
import { PageContainer } from '../components/Layout/PageContainer';
import { TwilioAccountSettings } from '../components/Settings/TwilioAccountSettings';
import { UpdateNameForm } from '../components/User/UpdateNameForm';
import { 
  CogIcon, 
  PhoneIcon, 
  UserIcon, 
  CalendarIcon 
} from '@heroicons/react/24/outline';

type SettingsTab = 'account' | 'twilio' | 'calendar';

const tabs: Array<{ id: SettingsTab; name: string; icon: React.ComponentType<any> }> = [
  { id: 'account', name: 'Account', icon: UserIcon },
  { id: 'twilio', name: 'Phone Numbers', icon: PhoneIcon },
  { id: 'calendar', name: 'Calendar', icon: CalendarIcon },
];

export const Settings: React.FC = () => {
  const [activeTab, setActiveTab] = useState<SettingsTab>('account');

  const renderTabContent = () => {
    switch (activeTab) {
      case 'account':
        return (
          <div className="space-y-6">
            <div className="border-b border-gray-200 dark:border-gray-700 pb-4">
              <h2 className="text-lg font-medium text-gray-900 dark:text-white">
                Account Settings
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Manage your account information and preferences
              </p>
            </div>
            
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
              <h3 className="text-base font-medium text-gray-900 dark:text-white mb-4">
                Update Profile
              </h3>
              <UpdateNameForm />
            </div>
          </div>
        );
      
      case 'twilio':
        return <TwilioAccountSettings />;
      
      case 'calendar':
        return (
          <div className="space-y-6">
            <div className="border-b border-gray-200 dark:border-gray-700 pb-4">
              <h2 className="text-lg font-medium text-gray-900 dark:text-white">
                Calendar Settings
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Manage your calendar connections and preferences
              </p>
            </div>
            
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
              <h3 className="text-base font-medium text-gray-900 dark:text-white mb-4">
                Google Calendar
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                Connect your Google Calendar to sync events and meetings
              </p>
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                Connect Google Calendar
              </button>
            </div>
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <PageContainer>
      <div className="space-y-8">
        {/* Header */}
        <div className="border-b border-gray-200 dark:border-gray-700 pb-5">
          <div className="flex items-center gap-3">
            <CogIcon className="h-8 w-8 text-gray-400" />
            <div>
              <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
                Settings
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Manage your account, integrations, and preferences
              </p>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="-mb-px flex space-x-8">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  {tab.name}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="min-h-[500px]">
          {renderTabContent()}
        </div>
      </div>
    </PageContainer>
  );
}; 