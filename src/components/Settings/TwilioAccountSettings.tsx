import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { PhoneIcon, PlusIcon, TrashIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import api from '../../services/apiClient';

interface PhoneNumber {
  sid: string;
  phoneNumber: string;
  friendlyName: string;
  capabilities: {
    voice: boolean;
    sms: boolean;
  };
  dateCreated: string;
}

interface TwilioAccount {
  accountSid: string;
  balance: string;
  status: string;
  phoneNumbers: PhoneNumber[];
}

export const TwilioAccountSettings: React.FC = () => {
  const [account, setAccount] = useState<TwilioAccount | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProvisioning, setIsProvisioning] = useState(false);
  const [areaCode, setAreaCode] = useState('');

  useEffect(() => {
    loadTwilioAccount();
  }, []);

  const loadTwilioAccount = async () => {
    try {
      setIsLoading(true);
      const accountData = await api.calls.getTwilioAccount();
      const phoneNumbers = await api.calls.getUserPhoneNumbers();
      
      setAccount({
        ...accountData,
        phoneNumbers: phoneNumbers || []
      });
    } catch (error) {
      console.error('Error loading Twilio account:', error);
      toast.error('Failed to load Twilio account information');
    } finally {
      setIsLoading(false);
    }
  };

  const handleProvisionNumber = async () => {
    try {
      setIsProvisioning(true);
      const result = await api.calls.provisionPhoneNumber(areaCode || undefined);
      
      if (result.phoneNumber) {
        toast.success(`Phone number ${result.phoneNumber} provisioned successfully!`);
        setAreaCode('');
        await loadTwilioAccount(); // Refresh the list
      } else {
        throw new Error('No phone number returned');
      }
    } catch (error) {
      console.error('Error provisioning phone number:', error);
      toast.error('Failed to provision phone number. Please try again.');
    } finally {
      setIsProvisioning(false);
    }
  };

  const handleReleaseNumber = async (phoneNumber: string) => {
    if (!confirm(`Are you sure you want to release ${phoneNumber}? This action cannot be undone.`)) {
      return;
    }

    try {
      await api.calls.releasePhoneNumber(phoneNumber);
      toast.success(`Phone number ${phoneNumber} released successfully`);
      await loadTwilioAccount(); // Refresh the list
    } catch (error) {
      console.error('Error releasing phone number:', error);
      toast.error('Failed to release phone number');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <ArrowPathIcon className="h-8 w-8 animate-spin text-gray-400" />
        <span className="ml-2 text-gray-500">Loading Twilio account...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="border-b border-gray-200 dark:border-gray-700 pb-4">
        <h2 className="text-lg font-medium text-gray-900 dark:text-white">
          Twilio Account Settings
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Manage your phone numbers and account information
        </p>
      </div>

      {/* Account Information */}
      {account && (
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
          <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
            Account Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <span className="text-gray-500 dark:text-gray-400">Account SID:</span>
              <p className="font-mono text-xs mt-1">{account.accountSid}</p>
            </div>
            <div>
              <span className="text-gray-500 dark:text-gray-400">Balance:</span>
              <p className="font-medium mt-1">${account.balance}</p>
            </div>
            <div>
              <span className="text-gray-500 dark:text-gray-400">Status:</span>
              <p className={`font-medium mt-1 ${
                account.status === 'active' ? 'text-green-600' : 'text-red-600'
              }`}>
                {account.status}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Provision New Phone Number */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
        <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
          Provision New Phone Number
        </h3>
        <div className="flex items-center space-x-3">
          <div className="flex-1">
            <input
              type="text"
              value={areaCode}
              onChange={(e) => setAreaCode(e.target.value.replace(/\D/g, '').slice(0, 3))}
              placeholder="Area code (optional)"
              className="block w-full rounded-md border-gray-300 dark:border-gray-600 
                       bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                       focus:ring-2 focus:ring-blue-500 text-sm"
            />
            <p className="text-xs text-gray-500 mt-1">
              Leave empty for any available number
            </p>
          </div>
          <button
            onClick={handleProvisionNumber}
            disabled={isProvisioning}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md 
                     hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed
                     transition-colors text-sm"
          >
            {isProvisioning ? (
              <ArrowPathIcon className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <PlusIcon className="h-4 w-4 mr-2" />
            )}
            {isProvisioning ? 'Provisioning...' : 'Get Number'}
          </button>
        </div>
      </div>

      {/* Current Phone Numbers */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
        <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-sm font-medium text-gray-900 dark:text-white">
            Your Phone Numbers
          </h3>
        </div>
        
        {account?.phoneNumbers && account.phoneNumbers.length > 0 ? (
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {account.phoneNumbers.map((number) => (
              <div key={number.sid} className="px-4 py-4 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <PhoneIcon className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {number.phoneNumber}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {number.friendlyName || 'No name set'}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <div className="flex space-x-2">
                    {number.capabilities.voice && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs 
                                     bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                        Voice
                      </span>
                    )}
                    {number.capabilities.sms && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs 
                                     bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                        SMS
                      </span>
                    )}
                  </div>
                  
                  <button
                    onClick={() => handleReleaseNumber(number.phoneNumber)}
                    className="p-1 text-red-500 hover:text-red-700 transition-colors"
                    title="Release this phone number"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
            <PhoneIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No phone numbers provisioned</p>
            <p className="text-sm">Provision a number to start making calls</p>
          </div>
        )}
      </div>

      {/* Refresh Button */}
      <div className="flex justify-center">
        <button
          onClick={loadTwilioAccount}
          disabled={isLoading}
          className="flex items-center px-4 py-2 text-sm text-gray-600 dark:text-gray-400 
                   hover:text-gray-900 dark:hover:text-white transition-colors"
        >
          <ArrowPathIcon className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh Account
        </button>
      </div>
    </div>
  );
}; 