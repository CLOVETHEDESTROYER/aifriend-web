import React, { useState, useEffect } from 'react';
import { PageContainer } from '../components/Layout/PageContainer';
import api from '../services/apiClient';
import { toast } from 'react-hot-toast';
import { 
  CalendarIcon, 
  ClockIcon, 
  PhoneIcon, 
  UserGroupIcon,
  LinkIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';

interface CalendarEvent {
  id: string;
  summary: string;
  description?: string;
  start: {
    dateTime?: string;
    date?: string;
  };
  end: {
    dateTime?: string;
    date?: string;
  };
  attendees?: Array<{
    email: string;
    displayName?: string;
    responseStatus: string;
  }>;
  location?: string;
  htmlLink?: string;
  organizer?: {
    email: string;
    displayName?: string;
  };
}

interface CredentialsStatus {
  has_credentials: boolean;
  user_email?: string;
}

export const ScheduledMeetings: React.FC = () => {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [credentialsStatus, setCredentialsStatus] = useState<CredentialsStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [isSchedulingCall, setIsSchedulingCall] = useState(false);

  const checkCredentials = async () => {
    try {
      const status = await api.calendar.checkCredentials();
      setCredentialsStatus(status);
      return status.has_credentials;
    } catch (error) {
      console.error('Error checking credentials:', error);
      setCredentialsStatus({ has_credentials: false });
      return false;
    }
  };

  const fetchEvents = async () => {
    try {
      const eventsData = await api.calendar.getEvents();
      setEvents(eventsData);
    } catch (error) {
      console.error('Error fetching events:', error);
      toast.error('Failed to fetch calendar events');
    }
  };

  const loadData = async () => {
    setIsLoading(true);
    try {
      const hasCredentials = await checkCredentials();
      if (hasCredentials) {
        await fetchEvents();
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await fetchEvents();
      toast.success('Calendar events refreshed');
    } catch (error) {
      toast.error('Failed to refresh events');
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleAuthorize = async () => {
    try {
      await api.calendar.authorize();
    } catch (error) {
      console.error('Error authorizing:', error);
      toast.error('Failed to authorize Google Calendar. Please try again.');
    }
  };

  const handleRevokeAccess = async () => {
    try {
      await api.calendar.revokeAccess();
      setCredentialsStatus({ has_credentials: false });
      setEvents([]);
      toast.success('Google Calendar access revoked');
    } catch (error) {
      console.error('Error revoking access:', error);
      toast.error('Revoke access not available. Please re-authenticate to change permissions.');
    }
  };

  const scheduleCallForMeeting = async (event: CalendarEvent, phoneNumber: string) => {
    setIsSchedulingCall(true);
    try {
      // Ensure we have a valid date string
      const scheduledTime = event.start.dateTime || event.start.date;
      if (!scheduledTime) {
        toast.error('Event does not have a valid date/time');
        return;
      }

      const callData = {
        phone_number: phoneNumber,
        scheduled_time: scheduledTime,
        scenario: 'meeting_assistant' // You can customize this based on meeting type
      };

      await api.calls.scheduleCall(callData);
      toast.success(`Call scheduled for ${event.summary}`);
      setSelectedEvent(null);
    } catch (error) {
      console.error('Error scheduling call:', error);
      toast.error('Failed to schedule call');
    } finally {
      setIsSchedulingCall(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const formatDateTime = (dateTime: string | undefined, date: string | undefined) => {
    const eventDate = dateTime || date;
    if (!eventDate) return 'No date';
    
    const parsedDate = new Date(eventDate);
    if (dateTime) {
      return parsedDate.toLocaleString();
    } else {
      return parsedDate.toLocaleDateString();
    }
  };

  const isUpcoming = (event: CalendarEvent) => {
    const eventDate = new Date(event.start.dateTime || event.start.date || '');
    return eventDate > new Date();
  };

  const getEventStatus = (event: CalendarEvent) => {
    const now = new Date();
    const startTime = new Date(event.start.dateTime || event.start.date || '');
    const endTime = new Date(event.end.dateTime || event.end.date || '');
    
    if (now < startTime) return 'upcoming';
    if (now >= startTime && now <= endTime) return 'ongoing';
    return 'past';
  };

  if (isLoading) {
    return (
      <PageContainer>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent"></div>
        </div>
      </PageContainer>
    );
  }

  if (!credentialsStatus?.has_credentials) {
    return (
      <PageContainer>
        <div className="border-b border-border-light dark:border-border-dark px-6 pb-6 pt-4">
          <h1 className="text-2xl font-semibold text-text-light dark:text-text-dark">
            Scheduled Meetings
          </h1>
        </div>
        
        <div className="p-6">
          <div className="max-w-md mx-auto text-center">
            <CalendarIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-text-light dark:text-text-dark mb-2">
              Connect Your Google Calendar
            </h2>
            <p className="text-text-secondary dark:text-text-secondary-dark mb-6">
              Connect your Google Calendar to view upcoming meetings and schedule AI-powered calls for them.
            </p>
            <button
              onClick={handleAuthorize}
              className="bg-accent hover:bg-accent-dark text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              Connect Google Calendar
            </button>
          </div>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <div className="border-b border-border-light dark:border-border-dark px-6 pb-6 pt-4">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-semibold text-text-light dark:text-text-dark">
              Scheduled Meetings
            </h1>
            {credentialsStatus?.user_email && (
              <p className="text-sm text-text-secondary dark:text-text-secondary-dark mt-1">
                Connected as {credentialsStatus.user_email}
              </p>
            )}
          </div>
          <div className="flex space-x-2">
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors disabled:opacity-50"
            >
              <ArrowPathIcon className={`h-5 w-5 ${isRefreshing ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={handleRevokeAccess}
              className="px-4 py-2 text-sm text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 transition-colors"
            >
              Re-authenticate
            </button>
          </div>
        </div>
      </div>

      <div className="p-6">
        {events.length === 0 ? (
          <div className="text-center py-12">
            <CalendarIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-text-light dark:text-text-dark mb-2">
              No upcoming meetings
            </h3>
            <p className="text-text-secondary dark:text-text-secondary-dark">
              Your calendar is clear for now.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {events.map((event) => {
              const status = getEventStatus(event);
              const statusColors = {
                upcoming: 'border-l-blue-500 bg-blue-50 dark:bg-blue-900/20',
                ongoing: 'border-l-green-500 bg-green-50 dark:bg-green-900/20',
                past: 'border-l-gray-500 bg-gray-50 dark:bg-gray-900/20'
              };

              return (
                <div
                  key={event.id}
                  className={`border-l-4 ${statusColors[status]} border border-border-light dark:border-border-dark rounded-lg p-6`}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h3 className="text-lg font-semibold text-text-light dark:text-text-dark">
                          {event.summary}
                        </h3>
                        {status === 'ongoing' && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                            Live
                          </span>
                        )}
                      </div>
                      
                      <div className="flex items-center space-x-4 text-sm text-text-secondary dark:text-text-secondary-dark mb-3">
                        <div className="flex items-center space-x-1">
                          <ClockIcon className="h-4 w-4" />
                          <span>
                            {formatDateTime(event.start.dateTime, event.start.date)} - {formatDateTime(event.end.dateTime, event.end.date)}
                          </span>
                        </div>
                        
                        {event.attendees && (
                          <div className="flex items-center space-x-1">
                            <UserGroupIcon className="h-4 w-4" />
                            <span>{event.attendees.length} attendees</span>
                          </div>
                        )}
                      </div>

                      {event.description && (
                        <p className="text-sm text-text-secondary dark:text-text-secondary-dark mb-3 line-clamp-2">
                          {event.description}
                        </p>
                      )}

                      {event.location && (
                        <p className="text-sm text-text-secondary dark:text-text-secondary-dark mb-3">
                          📍 {event.location}
                        </p>
                      )}

                      <div className="flex items-center space-x-4">
                        {event.htmlLink && (
                          <a
                            href={event.htmlLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center space-x-1 text-sm text-accent hover:text-accent-dark transition-colors"
                          >
                            <LinkIcon className="h-4 w-4" />
                            <span>View in Calendar</span>
                          </a>
                        )}
                        
                        {isUpcoming(event) && (
                          <button
                            onClick={() => setSelectedEvent(event)}
                            className="inline-flex items-center space-x-1 text-sm text-accent hover:text-accent-dark transition-colors"
                          >
                            <PhoneIcon className="h-4 w-4" />
                            <span>Schedule AI Call</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Schedule Call Modal */}
      {selectedEvent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-text-light dark:text-text-dark mb-4">
              Schedule AI Call for Meeting
            </h3>
            
            <div className="mb-4">
              <p className="text-sm text-text-secondary dark:text-text-secondary-dark mb-2">
                Meeting: {selectedEvent.summary}
              </p>
              <p className="text-sm text-text-secondary dark:text-text-secondary-dark">
                Time: {formatDateTime(selectedEvent.start.dateTime, selectedEvent.start.date)}
              </p>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-text-light dark:text-text-dark mb-2">
                Phone Number
              </label>
              <input
                type="tel"
                placeholder="Enter phone number"
                className="w-full px-3 py-2 border border-border-light dark:border-border-dark rounded-lg bg-white dark:bg-gray-700 text-text-light dark:text-text-dark"
                id="phone-input"
              />
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => setSelectedEvent(null)}
                className="flex-1 px-4 py-2 text-sm font-medium text-text-secondary dark:text-text-secondary-dark border border-border-light dark:border-border-dark rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  const phoneInput = document.getElementById('phone-input') as HTMLInputElement;
                  if (phoneInput?.value) {
                    scheduleCallForMeeting(selectedEvent, phoneInput.value);
                  } else {
                    toast.error('Please enter a phone number');
                  }
                }}
                disabled={isSchedulingCall}
                className="flex-1 px-4 py-2 text-sm font-medium text-white bg-accent hover:bg-accent-dark rounded-lg transition-colors disabled:opacity-50"
              >
                {isSchedulingCall ? 'Scheduling...' : 'Schedule Call'}
              </button>
            </div>
          </div>
        </div>
      )}
    </PageContainer>
  );
}; 