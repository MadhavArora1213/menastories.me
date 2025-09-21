import React, { useState, useEffect } from 'react';
import { eventService } from '../../services/eventService';
import { format } from 'date-fns';

const EventRegistration = ({
  event,
  onSuccess,
  onError,
  compact = false,
  className = ''
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [registrationData, setRegistrationData] = useState({
    ticketType: 'general',
    attendeeInfo: {
      name: '',
      email: '',
      phone: '',
      company: '',
      title: '',
      dietaryRestrictions: '',
      accessibilityNeeds: ''
    },
    customFields: {},
    marketingConsent: false,
    emailUpdates: true
  });

  const [availableTickets, setAvailableTickets] = useState([]);
  const [selectedTicket, setSelectedTicket] = useState(null);

  useEffect(() => {
    if (event?.ticketTypes) {
      setAvailableTickets(event.ticketTypes);
      if (event.ticketTypes.length > 0) {
        setSelectedTicket(event.ticketTypes[0]);
        setRegistrationData(prev => ({
          ...prev,
          ticketType: event.ticketTypes[0].id || 'general'
        }));
      }
    }
  }, [event]);

  const handleInputChange = (field, value) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setRegistrationData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setRegistrationData(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const handleTicketSelect = (ticket) => {
    setSelectedTicket(ticket);
    setRegistrationData(prev => ({
      ...prev,
      ticketType: ticket.id || 'general'
    }));
  };

  const validateForm = () => {
    const { attendeeInfo } = registrationData;

    if (!attendeeInfo.name.trim()) {
      setError('Please enter your full name');
      return false;
    }

    if (!attendeeInfo.email.trim()) {
      setError('Please enter your email address');
      return false;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(attendeeInfo.email)) {
      setError('Please enter a valid email address');
      return false;
    }

    if (selectedTicket?.price > 0 && !attendeeInfo.phone.trim()) {
      setError('Phone number is required for paid tickets');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      setLoading(true);
      setError(null);

      const registrationPayload = {
        eventId: event.id,
        ...registrationData
      };

      const response = await eventService.registerForEvent(registrationPayload);

      if (onSuccess) {
        onSuccess(response.registration);
      }
    } catch (err) {
      console.error('Registration failed:', err);
      const errorMessage = err.response?.data?.error || 'Registration failed. Please try again.';
      setError(errorMessage);
      if (onError) {
        onError(err);
      }
    } finally {
      setLoading(false);
    }
  };

  const getTicketPrice = (ticket) => {
    if (!ticket?.price || ticket.price === 0) return 'Free';
    return `$${ticket.price.toFixed(2)}`;
  };

  const getAvailableCapacity = () => {
    if (!event?.capacity) return null;
    return Math.max(0, event.capacity - (event.registrationCount || 0));
  };

  const isRegistrationOpen = () => {
    if (!event) return false;

    const now = new Date();
    const startDate = new Date(event.startDate);
    const deadline = event.registrationDeadline ? new Date(event.registrationDeadline) : null;

    return (
      event.allowRegistration &&
      event.status === 'published' &&
      now < startDate &&
      (!deadline || now <= deadline) &&
      (!event.capacity || getAvailableCapacity() > 0)
    );
  };

  const renderTicketSelection = () => {
    if (!availableTickets.length) return null;

    return (
      <div className="space-y-3">
        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Select Ticket Type
        </h4>
        <div className="space-y-2">
          {availableTickets.map((ticket, index) => (
            <div
              key={index}
              onClick={() => handleTicketSelect(ticket)}
              className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                selectedTicket?.id === ticket.id || (selectedTicket && selectedTicket.name === ticket.name)
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                  : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h5 className="font-medium text-gray-900 dark:text-white">
                    {ticket.name || 'General Admission'}
                  </h5>
                  {ticket.description && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {ticket.description}
                    </p>
                  )}
                </div>
                <div className="text-right">
                  <span className="text-lg font-semibold text-gray-900 dark:text-white">
                    {getTicketPrice(ticket)}
                  </span>
                  {ticket.quantity && (
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {ticket.quantity} available
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderRegistrationForm = () => (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Attendee Information */}
      <div className="space-y-4">
        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Attendee Information
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Full Name *
            </label>
            <input
              type="text"
              value={registrationData.attendeeInfo.name}
              onChange={(e) => handleInputChange('attendeeInfo.name', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="Enter your full name"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Email Address *
            </label>
            <input
              type="email"
              value={registrationData.attendeeInfo.email}
              onChange={(e) => handleInputChange('attendeeInfo.email', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="Enter your email"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Phone Number
            </label>
            <input
              type="tel"
              value={registrationData.attendeeInfo.phone}
              onChange={(e) => handleInputChange('attendeeInfo.phone', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="Enter your phone number"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Company
            </label>
            <input
              type="text"
              value={registrationData.attendeeInfo.company}
              onChange={(e) => handleInputChange('attendeeInfo.company', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="Enter your company"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Job Title
          </label>
          <input
            type="text"
            value={registrationData.attendeeInfo.title}
            onChange={(e) => handleInputChange('attendeeInfo.title', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            placeholder="Enter your job title"
          />
        </div>
      </div>

      {/* Event-Specific Fields */}
      {event?.eventType === 'conference' || event?.eventType === 'workshop' ? (
        <div className="space-y-4">
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Event Preferences
          </h4>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Dietary Restrictions
            </label>
            <select
              value={registrationData.attendeeInfo.dietaryRestrictions}
              onChange={(e) => handleInputChange('attendeeInfo.dietaryRestrictions', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="">No dietary restrictions</option>
              <option value="vegetarian">Vegetarian</option>
              <option value="vegan">Vegan</option>
              <option value="gluten-free">Gluten-free</option>
              <option value="halal">Halal</option>
              <option value="kosher">Kosher</option>
              <option value="other">Other (please specify)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Accessibility Needs
            </label>
            <textarea
              value={registrationData.attendeeInfo.accessibilityNeeds}
              onChange={(e) => handleInputChange('attendeeInfo.accessibilityNeeds', e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="Please describe any accessibility needs or accommodations required"
            />
          </div>
        </div>
      ) : null}

      {/* Communication Preferences */}
      <div className="space-y-3">
        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Communication Preferences
        </h4>

        <div className="flex items-center">
          <input
            type="checkbox"
            id="emailUpdates"
            checked={registrationData.emailUpdates}
            onChange={(e) => handleInputChange('emailUpdates', e.target.checked)}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label htmlFor="emailUpdates" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
            Send me email updates about this event
          </label>
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            id="marketingConsent"
            checked={registrationData.marketingConsent}
            onChange={(e) => handleInputChange('marketingConsent', e.target.checked)}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label htmlFor="marketingConsent" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
            I agree to receive marketing communications from the event organizers
          </label>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <div className="flex items-center">
            <svg className="h-5 w-5 text-red-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
          </div>
        </div>
      )}

      {/* Submit Button */}
      <button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
      >
        {loading ? (
          <>
            <svg className="animate-spin h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span>Processing...</span>
          </>
        ) : (
          <>
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>
              {selectedTicket?.price > 0 ? `Register & Pay ${getTicketPrice(selectedTicket)}` : 'Register for Free'}
            </span>
          </>
        )}
      </button>
    </form>
  );

  if (!event) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500 dark:text-gray-400">No event selected</p>
      </div>
    );
  }

  if (!isRegistrationOpen()) {
    return (
      <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 text-center">
        <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
          Registration Closed
        </h3>
        <p className="text-gray-600 dark:text-gray-400">
          Registration for this event is currently closed.
        </p>
      </div>
    );
  }

  if (compact) {
    return (
      <div className={`event-registration-compact ${className}`}>
        <button
          onClick={() => {/* Open full registration modal */}}
          className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>
            {selectedTicket?.price > 0 ? `Register - ${getTicketPrice(selectedTicket)}` : 'Register for Free'}
          </span>
        </button>

        {getAvailableCapacity() !== null && (
          <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-2">
            {getAvailableCapacity()} spots remaining
          </p>
        )}
      </div>
    );
  }

  return (
    <div className={`event-registration bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 ${className}`}>
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            Register for Event
          </h3>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            {format(new Date(event.startDate), 'MMM d, yyyy')}
          </div>
        </div>

        {renderTicketSelection()}
        {renderRegistrationForm()}
      </div>
    </div>
  );
};

export default EventRegistration;