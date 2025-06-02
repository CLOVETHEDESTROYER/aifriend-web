import React, { useState, useEffect } from 'react';
import { PageContainer } from '../components/Layout/PageContainer';
import api from '../services/apiClient';
import { toast } from 'react-hot-toast';
import { useLocation } from 'react-router-dom';
import { 
  CalendarIcon, 
  ClockIcon, 
  PhoneIcon, 
  UserGroupIcon,
  LinkIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ArrowPathIcon,
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

type CalendarView = 'month' | 'week' | 'day';

export const ScheduledMeetings: React.FC = () => {
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [loadingEvents, setLoadingEvents] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<CalendarView>('month');
  
  const location = useLocation();

  // Check if we're returning from OAuth callback
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const code = urlParams.get('code');
    const state = urlParams.get('state');
    
    if (code && state) {
      toast.success('Google Calendar authorization successful!');
      window.history.replaceState({}, document.title, location.pathname);
      setTimeout(async () => {
        await loadDataWithRetry();
      }, 2000);
    }
  }, [location]);

  const loadCalendarEvents = async () => {
    try {
      setLoadingEvents(true);
      const events = await api.calendar.getEvents(100);
      console.log('Calendar events loaded:', events);
      setCalendarEvents(events || []);
    } catch (error: any) {
      console.error('Error loading calendar events:', error);
      if (error.message === 'REAUTH_REQUIRED') {
        setIsConnected(false);
        toast.error('Please reconnect your Google Calendar');
      } else {
        toast.error('Failed to load calendar events');
      }
    } finally {
      setLoadingEvents(false);
    }
  };

  const loadDataWithRetry = async (retries = 3) => {
    try {
      setLoadingEvents(true);
      const hasCredentials = await api.calendar.checkCredentials();
      setIsConnected(hasCredentials);
      
      if (hasCredentials) {
        await loadCalendarEvents();
      }
    } catch (error: any) {
      console.error('Error loading calendar data:', error);
      if (retries > 0) {
        setTimeout(() => {
          loadDataWithRetry(retries - 1);
        }, 2000);
        return;
      }
      setIsConnected(false);
    } finally {
      setLoadingEvents(false);
    }
  };

  const handleReconnect = async () => {
    try {
      await api.calendar.authorize();
    } catch (error) {
      console.error('Error reconnecting:', error);
      toast.error('Failed to initiate reconnection');
    }
  };

  useEffect(() => {
    loadDataWithRetry();
  }, []);

  // Calendar utility functions
  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const getEventsForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return calendarEvents.filter(event => {
      const eventStart = event.start.dateTime || event.start.date;
      if (!eventStart) return false;
      const eventDate = new Date(eventStart).toISOString().split('T')[0];
      return eventDate === dateStr;
    });
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(newDate.getMonth() - 1);
      } else {
        newDate.setMonth(newDate.getMonth() + 1);
      }
      return newDate;
    });
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const formatEventTime = (event: CalendarEvent) => {
    const startTime = event.start.dateTime || event.start.date;
    if (!startTime) return '';
    
    const date = new Date(startTime);
    if (event.start.dateTime) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    return 'All day';
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  // Render calendar grid
  const renderCalendarGrid = () => {
    const daysInMonth = getDaysInMonth(currentDate);
    const firstDay = getFirstDayOfMonth(currentDate);
    const daysArray = [];

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      const prevDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), -firstDay + i + 1);
      const events = getEventsForDate(prevDate);
      daysArray.push(
        <div key={`prev-${i}`} className="h-32 border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 p-1">
          <div className="text-sm text-gray-400 mb-1">{prevDate.getDate()}</div>
          <div className="space-y-1">
            {events.slice(0, 2).map(event => (
              <div
                key={event.id}
                className="text-xs p-1 bg-gray-300 dark:bg-gray-600 rounded cursor-pointer hover:bg-gray-400 dark:hover:bg-gray-500 truncate"
                onClick={() => setSelectedEvent(event)}
                title={event.summary}
              >
                {event.summary}
              </div>
            ))}
            {events.length > 2 && (
              <div className="text-xs text-gray-500">+{events.length - 2} more</div>
            )}
          </div>
        </div>
      );
    }

    // Add days of the current month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
      const events = getEventsForDate(date);
      const isCurrentDay = isToday(date);
      
      daysArray.push(
        <div 
          key={day} 
          className={`h-32 border border-gray-200 dark:border-gray-700 p-1 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 ${
            isCurrentDay ? 'bg-blue-50 dark:bg-blue-900/20' : 'bg-white dark:bg-gray-900'
          }`}
        >
          <div className={`text-sm mb-1 ${
            isCurrentDay 
              ? 'font-bold text-blue-600 dark:text-blue-400' 
              : 'text-gray-900 dark:text-gray-100'
          }`}>
            {day}
          </div>
          <div className="space-y-1">
            {events.slice(0, 3).map(event => (
              <div
                key={event.id}
                className="text-xs p-1 bg-blue-500 text-white rounded cursor-pointer hover:bg-blue-600 truncate"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedEvent(event);
                }}
                title={`${formatEventTime(event)} ${event.summary}`}
              >
                <div className="flex items-center space-x-1">
                  <span className="font-medium">{formatEventTime(event)}</span>
                  <span className="truncate">{event.summary}</span>
                </div>
              </div>
            ))}
            {events.length > 3 && (
              <div className="text-xs text-gray-500 cursor-pointer" onClick={() => {
                // Show all events for this day
                toast.success(`${events.length} events on ${date.toLocaleDateString()}`);
              }}>
                +{events.length - 3} more
              </div>
            )}
          </div>
        </div>
      );
    }

    // Add days from next month to fill the grid
    const remainingCells = 42 - daysArray.length; // 6 rows * 7 days
    for (let i = 1; i <= remainingCells; i++) {
      const nextDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, i);
      const events = getEventsForDate(nextDate);
      daysArray.push(
        <div key={`next-${i}`} className="h-32 border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 p-1">
          <div className="text-sm text-gray-400 mb-1">{nextDate.getDate()}</div>
          <div className="space-y-1">
            {events.slice(0, 2).map(event => (
              <div
                key={event.id}
                className="text-xs p-1 bg-gray-300 dark:bg-gray-600 rounded cursor-pointer hover:bg-gray-400 dark:hover:bg-gray-500 truncate"
                onClick={() => setSelectedEvent(event)}
                title={event.summary}
              >
                {event.summary}
              </div>
            ))}
            {events.length > 2 && (
              <div className="text-xs text-gray-500">+{events.length - 2} more</div>
            )}
          </div>
        </div>
      );
    }

    return daysArray;
  };

  if (loadingEvents) {
    return (
      <PageContainer>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent"></div>
        </div>
      </PageContainer>
    );
  }

  if (!isConnected) {
    return (
      <PageContainer>
        <div className="border-b border-border-light dark:border-border-dark px-6 pb-6 pt-4">
          <h1 className="text-2xl font-semibold text-text-light dark:text-text-dark">
            Google Calendar
          </h1>
        </div>
        
        <div className="p-6">
          <div className="max-w-md mx-auto text-center">
            <CalendarIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-text-light dark:text-text-dark mb-2">
              Connect Your Google Calendar
            </h2>
            <p className="text-text-secondary dark:text-text-secondary-dark mb-6">
              Connect your Google Calendar to view and manage your events with AI-powered features.
            </p>
            <button
              onClick={handleReconnect}
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
      {/* Header */}
      <div className="border-b border-border-light dark:border-border-dark px-6 pb-4 pt-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-semibold text-text-light dark:text-text-dark">
              Calendar
            </h1>
            <button
              onClick={goToToday}
              className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              Today
            </button>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => {
                setIsRefreshing(true);
                loadDataWithRetry().finally(() => setIsRefreshing(false));
              }}
              disabled={isRefreshing}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors disabled:opacity-50"
            >
              <ArrowPathIcon className={`h-5 w-5 ${isRefreshing ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Bar */}
      <div className="border-b border-border-light dark:border-border-dark px-6 py-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1">
              <button
                onClick={() => navigateMonth('prev')}
                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <ChevronLeftIcon className="h-5 w-5" />
              </button>
              <button
                onClick={() => navigateMonth('next')}
                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <ChevronRightIcon className="h-5 w-5" />
              </button>
            </div>
            
            <h2 className="text-xl font-semibold text-text-light dark:text-text-dark">
              {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </h2>
          </div>

          <div className="flex items-center space-x-2">
            <div className="flex border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden">
              {(['month', 'week', 'day'] as CalendarView[]).map((viewType) => (
                <button
                  key={viewType}
                  onClick={() => setView(viewType)}
                  className={`px-3 py-1 text-sm capitalize transition-colors ${
                    view === viewType
                      ? 'bg-accent text-white'
                      : 'hover:bg-gray-50 dark:hover:bg-gray-800'
                  }`}
                >
                  {viewType}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="p-6">
        {/* Days of week header */}
        <div className="grid grid-cols-7 gap-0 mb-2">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="p-2 text-center text-sm font-medium text-gray-500 dark:text-gray-400">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7 gap-0 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
          {renderCalendarGrid()}
        </div>

        {/* Event count */}
        <div className="mt-4 text-center text-sm text-gray-500 dark:text-gray-400">
          Showing {calendarEvents.length} events
        </div>
      </div>

      {/* Event Detail Modal */}
      {selectedEvent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-lg max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-semibold text-text-light dark:text-text-dark">
                {selectedEvent.summary}
              </h3>
              <button
                onClick={() => setSelectedEvent(null)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center space-x-2 text-sm">
                <ClockIcon className="h-4 w-4 text-gray-500" />
                <span>
                  {new Date(selectedEvent.start.dateTime || selectedEvent.start.date || '').toLocaleDateString()} 
                  {selectedEvent.start.dateTime && (
                    <span className="ml-1">
                      {formatEventTime(selectedEvent)} - {
                        new Date(selectedEvent.end.dateTime || selectedEvent.end.date || '').toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                      }
                    </span>
                  )}
                </span>
              </div>

              {selectedEvent.attendees && selectedEvent.attendees.length > 0 && (
                <div className="flex items-center space-x-2 text-sm">
                  <UserGroupIcon className="h-4 w-4 text-gray-500" />
                  <span>{selectedEvent.attendees.length} attendees</span>
                </div>
              )}

              {selectedEvent.location && (
                <div className="flex items-center space-x-2 text-sm">
                  <span className="text-gray-500">📍</span>
                  <span>{selectedEvent.location}</span>
                </div>
              )}

              {selectedEvent.description && (
                <div className="text-sm">
                  <strong>Description:</strong>
                  <p className="mt-1 text-gray-600 dark:text-gray-400">{selectedEvent.description}</p>
                </div>
              )}

              <div className="flex space-x-3 pt-4">
                {selectedEvent.htmlLink && (
                  <a
                    href={selectedEvent.htmlLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center space-x-1 text-sm text-accent hover:text-accent-dark"
                  >
                    <LinkIcon className="h-4 w-4" />
                    <span>Open in Google Calendar</span>
                  </a>
                )}
                
                <button
                  onClick={() => {
                    // You can implement scheduling logic here
                    toast.success('AI call scheduling coming soon!');
                  }}
                  className="flex items-center space-x-1 text-sm text-accent hover:text-accent-dark"
                >
                  <PhoneIcon className="h-4 w-4" />
                  <span>Schedule AI Call</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </PageContainer>
  );
}; 