import React, { useState, useEffect, useCallback } from 'react';
import eventService from '../../services/eventService';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths } from 'date-fns';

const EventCalendar = ({
  onEventClick,
  onDateClick,
  selectedDate,
  events = [],
  viewMode = 'month', // 'month', 'week', 'day'
  showFilters = true,
  className = ''
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [calendarEvents, setCalendarEvents] = useState(events);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    category: 'all',
    eventType: 'all',
    isVirtual: 'all'
  });
  const [availableCategories, setAvailableCategories] = useState([]);
  const [availableEventTypes, setAvailableEventTypes] = useState([]);

  useEffect(() => {
    loadEventsForMonth();
  }, [currentDate, filters]);

  // Fetch available categories and event types
  useEffect(() => {
    const fetchFilterData = async () => {
      try {
        const [categoriesResponse, typesResponse] = await Promise.all([
          eventService.getEventCategories(),
          eventService.getEventTypes()
        ]);

        if (categoriesResponse.categories) {
          setAvailableCategories(categoriesResponse.categories);
        }
        if (typesResponse.eventTypes) {
          setAvailableEventTypes(typesResponse.eventTypes);
        }
      } catch (error) {
        console.warn('Could not fetch filter data:', error);
      }
    };

    fetchFilterData();
  }, []);

  const loadEventsForMonth = async () => {
    try {
      setLoading(true);
      const startDate = startOfMonth(currentDate);
      const endDate = endOfMonth(currentDate);

      // Build query parameters based on filters
      const params = {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString()
      };

      // Only add filters if they're not 'all'
      if (filters.category !== 'all') {
        params.category = filters.category;
      }
      if (filters.eventType !== 'all') {
        params.eventType = filters.eventType;
      }
      if (filters.isVirtual !== 'all') {
        params.isVirtual = filters.isVirtual === 'true';
      }

      const response = await eventService.getEventCalendar(params);
      setCalendarEvents(response.events || []);
    } catch (error) {
      console.error('Failed to load calendar events:', error);
      setCalendarEvents([]);
    } finally {
      setLoading(false);
    }
  };

  const getEventsForDate = (date) => {
    return calendarEvents.filter(event => {
      const eventDate = new Date(event.startDate);
      return isSameDay(eventDate, date);
    });
  };

  const navigateMonth = (direction) => {
    if (direction === 'prev') {
      setCurrentDate(prev => subMonths(prev, 1));
    } else {
      setCurrentDate(prev => addMonths(prev, 1));
    }
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const handleDateClick = (date) => {
    if (onDateClick) {
      onDateClick(date);
    }
  };

  const handleEventClick = (event, e) => {
    e.stopPropagation();
    if (onEventClick) {
      onEventClick(event);
    }
  };

  const renderCalendarHeader = () => (
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center space-x-4">
        <button
          onClick={() => navigateMonth('prev')}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
        >
          <svg className="h-5 w-5 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          {format(currentDate, 'MMMM yyyy')}
        </h2>

        <button
          onClick={() => navigateMonth('next')}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
        >
          <svg className="h-5 w-5 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      <div className="flex items-center space-x-2">
        <button
          onClick={goToToday}
          className="px-3 py-1 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Today
        </button>
      </div>
    </div>
  );

  const renderFilters = () => {
    if (!showFilters) return null;

    return (
      <div className="flex flex-wrap gap-4 mb-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Category
          </label>
          <select
            value={filters.category}
            onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Categories</option>
            {availableCategories.map(category => (
              <option key={category.category} value={category.category}>
                {category.category.charAt(0).toUpperCase() + category.category.slice(1)} ({category.count})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Event Type
          </label>
          <select
            value={filters.eventType}
            onChange={(e) => setFilters(prev => ({ ...prev, eventType: e.target.value }))}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Types</option>
            {availableEventTypes.map(eventType => (
              <option key={eventType.eventType} value={eventType.eventType}>
                {eventType.eventType.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())} ({eventType.count})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Format
          </label>
          <select
            value={filters.isVirtual}
            onChange={(e) => setFilters(prev => ({ ...prev, isVirtual: e.target.value }))}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Formats</option>
            <option value="false">In-Person</option>
            <option value="true">Virtual</option>
          </select>
        </div>
      </div>
    );
  };

  const renderCalendarGrid = () => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const calendarDays = eachDayOfInterval({ start: monthStart, end: monthEnd });

    const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        {/* Week header */}
        <div className="grid grid-cols-7 bg-gray-50 dark:bg-gray-700">
          {weekDays.map(day => (
            <div key={day} className="p-3 text-center text-sm font-medium text-gray-700 dark:text-gray-300">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7">
          {calendarDays.map((day, index) => {
            const dayEvents = getEventsForDate(day);
            const isCurrentMonth = isSameMonth(day, currentDate);
            const isToday = isSameDay(day, new Date());
            const isSelected = selectedDate && isSameDay(day, selectedDate);

            return (
              <div
                key={index}
                onClick={() => handleDateClick(day)}
                className={`
                  min-h-24 p-2 border-r border-b border-gray-200 dark:border-gray-600 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors
                  ${!isCurrentMonth ? 'bg-gray-50 dark:bg-gray-800 text-gray-400' : 'text-gray-900 dark:text-white'}
                  ${isToday ? 'bg-blue-50 dark:bg-blue-900/20' : ''}
                  ${isSelected ? 'bg-blue-100 dark:bg-blue-900/40' : ''}
                `}
              >
                <div className="text-sm font-medium mb-1">
                  {format(day, 'd')}
                </div>

                {/* Events for this day */}
                <div className="space-y-1">
                  {dayEvents.slice(0, 3).map((event, eventIndex) => (
                    <div
                      key={event.id}
                      onClick={(e) => handleEventClick(event, e)}
                      className="text-xs p-1 rounded bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 truncate cursor-pointer hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors"
                      title={event.title}
                    >
                      {event.title}
                    </div>
                  ))}

                  {dayEvents.length > 3 && (
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      +{dayEvents.length - 3} more
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderEventList = () => {
    const today = new Date();
    const upcomingEvents = calendarEvents.filter(event => new Date(event.startDate) >= today);

    return (
      <div className="mt-6">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
          Upcoming Events ({upcomingEvents.length})
        </h3>

        <div className="space-y-3">
          {upcomingEvents.slice(0, 10).map(event => (
            <div
              key={event.id}
              onClick={() => handleEventClick(event)}
              className="flex items-center space-x-4 p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:shadow-md transition-shadow cursor-pointer"
            >
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                  <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
                    {format(new Date(event.startDate), 'MMM d')}
                  </span>
                </div>
              </div>

              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-medium text-gray-900 dark:text-white truncate">
                  {event.title}
                </h4>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {format(new Date(event.startDate), 'EEEE, MMMM d, yyyy')} at {format(new Date(event.startDate), 'h:mm a')}
                </p>
                {event.venue?.name && (
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    📍 {event.venue.name}
                  </p>
                )}
              </div>

              <div className="flex-shrink-0">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  event.isVirtual
                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                    : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                }`}>
                  {event.isVirtual ? 'Virtual' : 'In-Person'}
                </span>
              </div>
            </div>
          ))}

          {upcomingEvents.length === 0 && (
            <div className="text-center py-8">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No upcoming events</h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Check back later for new events.
              </p>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className={`event-calendar ${className}`}>
      {renderCalendarHeader()}
      {renderFilters()}

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
        </div>
      ) : (
        <>
          {renderCalendarGrid()}
          {renderEventList()}
        </>
      )}
    </div>
  );
};

export default EventCalendar;