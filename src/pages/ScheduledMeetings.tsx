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
  EyeIcon
} from '@heroicons/react/24/outline';

// Updated interface to match backend response
interface CalendarEvent {
  id: string;
  summary: string;
  description?: string;
  start: string;  // Direct string from backend
  end: string;    // Direct string from backend
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
  const [showAllEventsModal, setShowAllEventsModal] = useState<{date: Date, events: CalendarEvent[]} | null>(null);
  
  const location = useLocation();

  // Enhanced event click handler
  const handleEventClick = (event: CalendarEvent, source: string) => {
    console.log(`🔍 Event clicked from ${source}:`, {
      id: event.id,
      summary: event.summary,
      start: event.start,
      end: event.end
    });
    setSelectedEvent(event);
    toast.success(`Opening: ${event.summary}`, { duration: 2000 });
  };

  // Handle showing all events for a day
  const handleShowAllEvents = (date: Date, events: CalendarEvent[]) => {
    setShowAllEventsModal({ date, events });
  };

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

  // Debug selectedEvent changes
  useEffect(() => {
    if (selectedEvent) {
      console.log('🔍 Modal should open for:', selectedEvent.summary);
    } else {
      console.log('🔍 Modal closed');
    }
  }, [selectedEvent]);

  const loadCalendarEvents = async () => {
    try {
      setLoadingEvents(true);
      const events = await api.calendar.getEvents(100);
      console.log('Calendar events loaded:', events.length, 'events');
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

  // Helper functions
  const isAllDayEvent = (start: string) => {
    return !start.includes('T');
  };

  const getEventDate = (start: string) => {
    if (isAllDayEvent(start)) {
      return start;
    } else {
      return start.split('T')[0];
    }
  };

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const getEventsForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    const events = calendarEvents.filter(event => {
      const eventDate = getEventDate(event.start);
      return eventDate === dateStr;
    });
    return events.sort((a, b) => {
      if (isAllDayEvent(a.start) && !isAllDayEvent(b.start)) return -1;
      if (!isAllDayEvent(a.start) && isAllDayEvent(b.start)) return 1;
      return new Date(a.start).getTime() - new Date(b.start).getTime();
    });
  };

  const navigateDate = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (view === 'month') {
        newDate.setMonth(newDate.getMonth() + (direction === 'next' ? 1 : -1));
      } else if (view === 'week') {
        newDate.setDate(newDate.getDate() + (direction === 'next' ? 7 : -7));
      } else if (view === 'day') {
        newDate.setDate(newDate.getDate() + (direction === 'next' ? 1 : -1));
      }
      return newDate;
    });
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const goToJune2025 = () => {
    setCurrentDate(new Date(2025, 5, 1));
  };

  const formatEventTime = (event: CalendarEvent) => {
    if (isAllDayEvent(event.start)) {
      return 'All day';
    }
    const date = new Date(event.start);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const getViewTitle = () => {
    if (view === 'month') {
      return currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    } else if (view === 'week') {
      const startOfWeek = new Date(currentDate);
      startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);
      return `${startOfWeek.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${endOfWeek.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
    } else {
      return currentDate.toLocaleDateString('en-US', { 
        weekday: 'long', 
        month: 'long', 
        day: 'numeric', 
        year: 'numeric' 
      });
    }
  };

  // Day View Component
  const DayView = () => {
    const events = getEventsForDate(currentDate);
    const hours = Array.from({ length: 24 }, (_, i) => i);

    return (
      <div className="flex flex-col h-[600px]">
        <div className="text-center py-4 border-b bg-white dark:bg-gray-900">
          <h3 className="text-lg font-semibold">
            {currentDate.toLocaleDateString('en-US', { 
              weekday: 'long', 
              month: 'long', 
              day: 'numeric' 
            })}
          </h3>
          <p className="text-sm text-gray-500">{events.length} events</p>
        </div>
        
        <div className="flex-1 overflow-y-auto">
          {/* All-day events */}
          {events.filter(e => isAllDayEvent(e.start)).length > 0 && (
            <div className="p-4 border-b bg-gray-50 dark:bg-gray-800">
              <h4 className="font-medium mb-2">All Day</h4>
              <div className="space-y-2">
                {events.filter(e => isAllDayEvent(e.start)).map(event => (
                  <button
                    key={event.id}
                    onClick={() => handleEventClick(event, 'day-view-all-day')}
                    className="w-full text-left p-3 bg-green-500 hover:bg-green-600 text-white rounded transition-colors"
                  >
                    <div className="font-medium">{event.summary}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Hourly time slots with sticky time column */}
          <div className="relative">
            {hours.map(hour => {
              const hourEvents = events.filter(event => {
                if (isAllDayEvent(event.start)) return false;
                const eventHour = new Date(event.start).getHours();
                return eventHour === hour;
              });

              return (
                <div key={hour} className="flex border-b border-gray-200 dark:border-gray-700">
                  {/* Time column - simple, no sticky positioning */}
                  <div className="w-20 p-2 text-sm text-gray-500 bg-gray-50 dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex-shrink-0">
                    {hour === 0 ? '12 AM' : hour < 12 ? `${hour} AM` : hour === 12 ? '12 PM' : `${hour - 12} PM`}
                  </div>
                  {/* Events column */}
                  <div className="flex-1 min-h-[60px] p-2">
                    {hourEvents.map(event => (
                      <button
                        key={event.id}
                        onClick={() => handleEventClick(event, `day-view-${hour}h`)}
                        className="w-full text-left p-2 mb-1 bg-blue-500 hover:bg-blue-600 text-white rounded text-sm transition-colors"
                      >
                        <div className="font-medium">{formatEventTime(event)}</div>
                        <div>{event.summary}</div>
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  // Week View Component
  const WeekView = () => {
    const startOfWeek = new Date(currentDate);
    startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());
    
    const weekDays = Array.from({ length: 7 }, (_, i) => {
      const day = new Date(startOfWeek);
      day.setDate(startOfWeek.getDate() + i);
      return day;
    });

    return (
      <div className="h-full">
        {/* Week header */}
        <div className="grid grid-cols-8 border-b">
          <div className="p-2"></div>
          {weekDays.map(day => (
            <div key={day.toISOString()} className={`p-2 text-center border-l ${
              isToday(day) ? 'bg-blue-50 dark:bg-blue-900/20' : ''
            }`}>
              <div className="text-sm font-medium">
                {day.toLocaleDateString('en-US', { weekday: 'short' })}
              </div>
              <div className={`text-lg ${isToday(day) ? 'text-blue-600 font-bold' : ''}`}>
                {day.getDate()}
              </div>
            </div>
          ))}
        </div>

        {/* Week grid */}
        <div className="flex-1 overflow-y-auto">
          {Array.from({ length: 24 }, (_, hour) => (
            <div key={hour} className="grid grid-cols-8 border-b border-gray-200 dark:border-gray-700">
              <div className="p-2 text-sm text-gray-500 bg-gray-50 dark:bg-gray-800 border-r">
                {hour === 0 ? '12 AM' : hour < 12 ? `${hour} AM` : hour === 12 ? '12 PM' : `${hour - 12} PM`}
              </div>
              {weekDays.map(day => {
                const dayEvents = getEventsForDate(day).filter(event => {
                  if (isAllDayEvent(event.start)) return hour === 0; // Show all-day events in first hour
                  const eventHour = new Date(event.start).getHours();
                  return eventHour === hour;
                });

                return (
                  <div key={`${day.toISOString()}-${hour}`} className="min-h-[50px] p-1 border-l border-gray-200 dark:border-gray-700">
                    {dayEvents.map(event => (
                      <button
                        key={event.id}
                        onClick={() => handleEventClick(event, `week-view-${day.getDate()}-${hour}h`)}
                        className={`w-full text-left p-1 mb-1 rounded text-xs transition-colors ${
                          isAllDayEvent(event.start)
                            ? 'bg-green-500 hover:bg-green-600 text-white'
                            : 'bg-blue-500 hover:bg-blue-600 text-white'
                        }`}
                      >
                        <div className="truncate font-medium">
                          {isAllDayEvent(event.start) ? 'All day' : formatEventTime(event)}
                        </div>
                        <div className="truncate">{event.summary}</div>
                      </button>
                    ))}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Month View Component (Enhanced)
  const MonthView = () => {
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
          <div className="space-y-1 overflow-y-auto max-h-24">
            {events.slice(0, 3).map(event => (
              <button
                key={event.id}
                onClick={() => handleEventClick(event, `prev-month-${prevDate.getDate()}`)}
                className={`w-full text-left text-xs p-1 rounded transition-colors ${
                  isAllDayEvent(event.start)
                    ? 'bg-green-400 hover:bg-green-500 text-white'
                    : 'bg-blue-400 hover:bg-blue-500 text-white'
                }`}
              >
                <div className="truncate">{event.summary}</div>
              </button>
            ))}
            {events.length > 3 && (
              <div className="text-xs text-gray-500 p-1">+{events.length - 3} more</div>
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
          onClick={() => {
            setCurrentDate(date);
            setView('day');
          }}
        >
          <div className={`text-sm mb-1 font-medium flex justify-between items-center ${
            isCurrentDay 
              ? 'text-blue-600 dark:text-blue-400' 
              : 'text-gray-900 dark:text-gray-100'
          }`}>
            <span>{day}</span>
            {events.length > 0 && (
              <span className="text-xs bg-blue-500 text-white px-1 rounded">
                {events.length}
              </span>
            )}
          </div>
          
          <div className="space-y-1 overflow-y-auto max-h-20">
            {events.slice(0, 3).map((event) => (
              <button
                key={event.id}
                onClick={(e) => {
                  e.stopPropagation();
                  handleEventClick(event, `month-day-${day}`);
                }}
                className={`w-full text-left text-xs p-1 rounded transition-colors ${
                  isAllDayEvent(event.start)
                    ? 'bg-green-500 hover:bg-green-600 text-white'
                    : 'bg-blue-500 hover:bg-blue-600 text-white'
                }`}
              >
                <div className="truncate font-medium">{formatEventTime(event)}</div>
                <div className="truncate">{event.summary}</div>
              </button>
            ))}
            
            {events.length > 3 && (
              <div className="text-xs text-gray-500 p-1 text-center">
                +{events.length - 3} more
              </div>
            )}
          </div>
        </div>
      );
    }

    // Add days from next month to fill the grid
    const remainingCells = 42 - daysArray.length;
    for (let i = 1; i <= remainingCells; i++) {
      const nextDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, i);
      const events = getEventsForDate(nextDate);
      daysArray.push(
        <div key={`next-${i}`} className="h-32 border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 p-1">
          <div className="text-sm text-gray-400 mb-1">{nextDate.getDate()}</div>
          <div className="space-y-1 overflow-y-auto max-h-24">
            {events.slice(0, 3).map(event => (
              <button
                key={event.id}
                onClick={() => handleEventClick(event, `next-month-${nextDate.getDate()}`)}
                className={`w-full text-left text-xs p-1 rounded transition-colors ${
                  isAllDayEvent(event.start)
                    ? 'bg-green-400 hover:bg-green-500 text-white'
                    : 'bg-blue-400 hover:bg-blue-500 text-white'
                }`}
              >
                <div className="truncate">{event.summary}</div>
              </button>
            ))}
            {events.length > 3 && (
              <div className="text-xs text-gray-500 p-1">+{events.length - 3} more</div>
            )}
          </div>
        </div>
      );
    }

    return (
      <div className="h-full">
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
          {daysArray}
        </div>
      </div>
    );
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
            <button
              onClick={goToJune2025}
              className="px-3 py-1 text-sm border border-blue-300 dark:border-blue-600 rounded hover:bg-blue-50 dark:hover:bg-blue-800 transition-colors text-blue-600 dark:text-blue-400"
            >
              June 2025 (Events)
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
                onClick={() => navigateDate('prev')}
                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <ChevronLeftIcon className="h-5 w-5" />
              </button>
              <button
                onClick={() => navigateDate('next')}
                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <ChevronRightIcon className="h-5 w-5" />
              </button>
            </div>
            
            <h2 className="text-xl font-semibold text-text-light dark:text-text-dark">
              {getViewTitle()}
            </h2>
          </div>

          <div className="flex items-center space-x-2">
            {/* View Toggle */}
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
                      
            <div className="text-sm text-gray-500 dark:text-gray-400">
              {calendarEvents.length} events
                      </div>
                    </div>
                  </div>
                </div>

      {/* Calendar Content */}
      <div className="flex-1 p-6">
        {view === 'month' && <MonthView />}
        {view === 'week' && <WeekView />}
        {view === 'day' && <DayView />}
      </div>

      {/* Event Detail Modal */}
      {selectedEvent && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          onClick={() => {
            console.log('🔍 Modal backdrop clicked, closing modal');
            setSelectedEvent(null);
          }}
        >
          <div 
            className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-lg max-h-[80vh] overflow-y-auto shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-xl font-bold text-text-light dark:text-text-dark">
                {selectedEvent.summary}
            </h3>
              <button
                onClick={() => {
                  console.log('🔍 Close button clicked');
                  setSelectedEvent(null);
                }}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-2xl px-2 py-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center space-x-3 text-sm bg-gray-50 dark:bg-gray-700 p-3 rounded">
                <ClockIcon className="h-5 w-5 text-gray-500" />
                <div>
                  <div className="font-medium">
                    {new Date(selectedEvent.start).toLocaleDateString('en-US', { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </div>
                  <div className="text-gray-600 dark:text-gray-400">
                    {!isAllDayEvent(selectedEvent.start) ? (
                      `${formatEventTime(selectedEvent)} - ${
                        new Date(selectedEvent.end).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                      }`
                    ) : (
                      <span className="text-green-600 font-medium">All Day Event</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-3 text-sm">
                <span className="text-gray-500">🆔</span>
                <span className="font-mono text-xs bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                  {selectedEvent.id}
                </span>
              </div>

              {selectedEvent.location && selectedEvent.location !== '' && (
                <div className="flex items-center space-x-3 text-sm">
                  <span className="text-gray-500">📍</span>
                  <span>{selectedEvent.location}</span>
                </div>
              )}

              {selectedEvent.description && selectedEvent.description !== '' && (
                <div className="text-sm">
                  <strong className="block mb-2">Description:</strong>
                  <p className="text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-700 p-3 rounded">
                    {selectedEvent.description}
                  </p>
                </div>
              )}

              <div className="flex space-x-3 pt-4 border-t border-gray-200 dark:border-gray-600">
                <button
                  onClick={() => {
                    toast.success('AI call scheduling will be implemented soon!');
                  }}
                  className="flex items-center space-x-2 text-sm text-white bg-accent hover:bg-accent-dark px-4 py-2 rounded-lg transition-colors"
                >
                  <PhoneIcon className="h-4 w-4" />
                  <span>Schedule AI Call</span>
                </button>
                
                <button
                  onClick={() => {
                    console.log('🔍 Full event object:', selectedEvent);
                    toast.success('Event details logged to console');
                  }}
                  className="flex items-center space-x-2 text-sm text-gray-600 hover:text-gray-800 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 px-4 py-2 rounded-lg transition-colors"
                >
                  🔍 <span>Debug Info</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </PageContainer>
  );
}; 