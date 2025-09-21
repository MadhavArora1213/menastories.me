import React, { useState, useEffect } from 'react';
import { eventService } from '../../services/eventService';
import { format, formatDistanceToNow } from 'date-fns';
import EventRegistration from './EventRegistration';
import EventGallery from './EventGallery';
import EventUpdates from './EventUpdates';
import EventSpeakers from './EventSpeakers';
import EventSchedule from './EventSchedule';

const EventDetails = ({
  eventId,
  event: initialEvent,
  onRegister,
  onBack,
  showRegistration = true,
  showGallery = true,
  showUpdates = true,
  showSpeakers = true,
  showSchedule = true,
  className = ''
}) => {
  const [event, setEvent] = useState(initialEvent);
  const [loading, setLoading] = useState(!initialEvent);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [userRegistration, setUserRegistration] = useState(null);
  const [isRegistered, setIsRegistered] = useState(false);

  useEffect(() => {
    if (!initialEvent && eventId) {
      loadEvent();
    }
  }, [eventId, initialEvent]);

  useEffect(() => {
    if (event) {
      checkUserRegistration();
    }
  }, [event]);

  const loadEvent = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await eventService.getEventById(eventId);
      setEvent(response.event);
    } catch (err) {
      console.error('Failed to load event:', err);
      setError('Failed to load event details');
    } finally {
      setLoading(false);
    }
  };

  const checkUserRegistration = async () => {
    try {
      // Check if user is registered for this event
      const registrations = await eventService.getUserRegistrations();
      const registration = registrations.find(reg => reg.eventId === event.id);
      if (registration) {
        setUserRegistration(registration);
        setIsRegistered(true);
      }
    } catch (err) {
      console.error('Failed to check registration:', err);
    }
  };

  const handleRegistrationSuccess = (registration) => {
    setUserRegistration(registration);
    setIsRegistered(true);
    if (onRegister) {
      onRegister(registration);
    }
  };

  const getEventStatus = () => {
    if (!event) return null;

    const now = new Date();
    const startDate = new Date(event.startDate);
    const endDate = new Date(event.endDate);

    if (now < startDate) return { status: 'upcoming', color: 'blue', text: 'Upcoming' };
    if (now >= startDate && now <= endDate) return { status: 'ongoing', color: 'green', text: 'Live Now' };
    if (now > endDate) return { status: 'completed', color: 'gray', text: 'Completed' };

    return { status: 'unknown', color: 'gray', text: 'Unknown' };
  };

  const getEventTypeInfo = (type) => {
    const typeInfo = {
      conference: { icon: '🎤', color: 'bg-blue-100 text-blue-800' },
      seminar: { icon: '📚', color: 'bg-green-100 text-green-800' },
      workshop: { icon: '🔧', color: 'bg-orange-100 text-orange-800' },
      networking: { icon: '🤝', color: 'bg-purple-100 text-purple-800' },
      trade_show: { icon: '🏪', color: 'bg-indigo-100 text-indigo-800' },
      award_show: { icon: '🏆', color: 'bg-yellow-100 text-yellow-800' },
      concert: { icon: '🎵', color: 'bg-pink-100 text-pink-800' },
      festival: { icon: '🎪', color: 'bg-red-100 text-red-800' },
      exhibition: { icon: '🎨', color: 'bg-teal-100 text-teal-800' },
      charity_gala: { icon: '💝', color: 'bg-rose-100 text-rose-800' }
    };
    return typeInfo[type] || { icon: '📅', color: 'bg-gray-100 text-gray-800' };
  };

  const renderEventHeader = () => {
    if (!event) return null;

    const status = getEventStatus();
    const typeInfo = getEventTypeInfo(event.eventType);

    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        {/* Event Banner */}
        {event.mediaAssets?.banner && (
          <div className="relative h-64 bg-gray-200 dark:bg-gray-700">
            <img
              src={event.mediaAssets.banner}
              alt={event.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black bg-opacity-30" />
            <div className="absolute bottom-4 left-4 right-4">
              <div className="flex items-center space-x-2">
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${typeInfo.color}`}>
                  {typeInfo.icon} {event.eventType.replace('_', ' ').toUpperCase()}
                </span>
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-${status.color}-100 text-${status.color}-800`}>
                  {status.text}
                </span>
                {event.isVirtual && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                    🌐 Virtual Event
                  </span>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Event Info */}
        <div className="p-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                {event.title}
              </h1>

              {event.shortDescription && (
                <p className="text-lg text-gray-600 dark:text-gray-400 mb-4">
                  {event.shortDescription}
                </p>
              )}

              {/* Date and Time */}
              <div className="flex items-center space-x-6 mb-4">
                <div className="flex items-center space-x-2">
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span className="text-gray-900 dark:text-white">
                    {format(new Date(event.startDate), 'EEEE, MMMM d, yyyy')}
                  </span>
                </div>

                <div className="flex items-center space-x-2">
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-gray-900 dark:text-white">
                    {format(new Date(event.startDate), 'h:mm a')} - {format(new Date(event.endDate), 'h:mm a')}
                  </span>
                </div>
              </div>

              {/* Venue */}
              {event.venue?.name && (
                <div className="flex items-center space-x-2 mb-4">
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span className="text-gray-900 dark:text-white">
                    {event.venue.name}
                    {event.venue.address && `, ${event.venue.address}`}
                  </span>
                </div>
              )}

              {/* Registration Status */}
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  <span className="text-gray-600 dark:text-gray-400">
                    {event.registrationCount || 0} registered
                  </span>
                </div>

                {event.capacity && (
                  <div className="flex items-center space-x-2">
                    <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-gray-600 dark:text-gray-400">
                      {event.capacity - (event.registrationCount || 0)} spots left
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Registration Button */}
            {showRegistration && (
              <div className="ml-6">
                {isRegistered ? (
                  <div className="bg-green-100 dark:bg-green-900 border border-green-200 dark:border-green-800 rounded-lg p-4">
                    <div className="flex items-center space-x-2">
                      <svg className="h-5 w-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="text-green-800 dark:text-green-200 font-medium">
                        You're registered!
                      </span>
                    </div>
                    {userRegistration?.ticketId && (
                      <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                        Ticket: {userRegistration.ticketId}
                      </p>
                    )}
                  </div>
                ) : (
                  <EventRegistration
                    event={event}
                    onSuccess={handleRegistrationSuccess}
                    compact={true}
                  />
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderTabNavigation = () => {
    const tabs = [
      { id: 'overview', label: 'Overview', icon: '📋' },
      { id: 'schedule', label: 'Schedule', icon: '📅' },
      { id: 'speakers', label: 'Speakers', icon: '🎤' },
      { id: 'gallery', label: 'Gallery', icon: '📸' },
      { id: 'updates', label: 'Updates', icon: '🔔' }
    ];

    return (
      <div className="border-b border-gray-200 dark:border-gray-700 mb-6">
        <nav className="flex space-x-8">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </nav>
      </div>
    );
  };

  const renderTabContent = () => {
    if (!event) return null;

    switch (activeTab) {
      case 'overview':
        return (
          <div className="space-y-6">
            {/* Description */}
            {event.description && (
              <div className="bg-white dark:bg-gray-800 rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                  About This Event
                </h3>
                <div className="prose dark:prose-invert max-w-none">
                  {event.description.split('\n').map((paragraph, index) => (
                    <p key={index} className="mb-4 text-gray-700 dark:text-gray-300">
                      {paragraph}
                    </p>
                  ))}
                </div>
              </div>
            )}

            {/* Agenda Preview */}
            {event.agenda && event.agenda.length > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                  Agenda Highlights
                </h3>
                <div className="space-y-3">
                  {event.agenda.slice(0, 5).map((item, index) => (
                    <div key={index} className="flex items-start space-x-3">
                      <div className="flex-shrink-0 w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-white">
                          {item.title}
                        </h4>
                        {item.description && (
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            {item.description}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                  {event.agenda.length > 5 && (
                    <button
                      onClick={() => setActiveTab('schedule')}
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                      View full schedule →
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Speakers Preview */}
            {event.speakers && event.speakers.length > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                  Featured Speakers
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {event.speakers.slice(0, 6).map((speaker, index) => (
                    <div key={index} className="flex items-center space-x-3">
                      {speaker.photo ? (
                        <img
                          src={speaker.photo}
                          alt={speaker.name}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-10 h-10 bg-gray-200 dark:bg-gray-600 rounded-full flex items-center justify-center">
                          <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                            {speaker.name.charAt(0)}
                          </span>
                        </div>
                      )}
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-white">
                          {speaker.name}
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {speaker.title}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
                {event.speakers.length > 6 && (
                  <button
                    onClick={() => setActiveTab('speakers')}
                    className="mt-4 text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    View all speakers →
                  </button>
                )}
              </div>
            )}
          </div>
        );

      case 'schedule':
        return showSchedule ? <EventSchedule event={event} /> : null;

      case 'speakers':
        return showSpeakers ? <EventSpeakers event={event} /> : null;

      case 'gallery':
        return showGallery ? <EventGallery eventId={event.id} /> : null;

      case 'updates':
        return showUpdates ? <EventUpdates eventId={event.id} /> : null;

      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
        <div className="text-center">
          <svg className="mx-auto h-12 w-12 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-red-800 dark:text-red-200">Error</h3>
          <p className="mt-1 text-sm text-red-700 dark:text-red-300">{error}</p>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="text-center py-12">
        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">Event not found</h3>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          The event you're looking for doesn't exist or has been removed.
        </p>
      </div>
    );
  }

  return (
    <div className={`event-details ${className}`}>
      {/* Back Button */}
      {onBack && (
        <button
          onClick={onBack}
          className="flex items-center space-x-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-6"
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          <span>Back to events</span>
        </button>
      )}

      {renderEventHeader()}
      {renderTabNavigation()}
      {renderTabContent()}
    </div>
  );
};

export default EventDetails;