import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import eventService from '../services/eventService';
import EventSubmissionForm from '../Components/Events/EventSubmissionForm';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import SEO from '../Components/SEO';
import StructuredData from '../Components/StructuredData';

const EventsPage = () => {
  const { isAuthenticated } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');
  const [showTopEvents, setShowTopEvents] = useState(false);
  const [showMediaPartner, setShowMediaPartner] = useState(false);
  const [showDiscountCodes, setShowDiscountCodes] = useState(false);
  const [showPastEvents, setShowPastEvents] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());

  // State for fetched events
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [eventCategories, setEventCategories] = useState([]);
  const [eventTypes, setEventTypes] = useState([]);
  const [eventLocations, setEventLocations] = useState([]);
  const [lastRefresh, setLastRefresh] = useState(new Date());
  const [showRefreshMessage, setShowRefreshMessage] = useState(false);
  const [showSubmissionForm, setShowSubmissionForm] = useState(false);

  // Fetch events from database
  const fetchEvents = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch events from API
      const response = await eventService.getEvents({
        status: 'published',
        limit: 50
      });

      if (response.events && response.events.length > 0) {
        setEvents(response.events);
      } else {
        // Fallback to empty array if no events
        setEvents([]);
      }

    } catch (err) {
      console.error('Error fetching events:', err);
      setError('Failed to load events. Please try again later.');
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch filter options from backend
  const fetchFilterOptions = async () => {
    try {
      const [categoriesResponse, typesResponse, locationsResponse] = await Promise.all([
        eventService.getEventCategories(),
        eventService.getEventTypes(),
        eventService.getEventLocations()
      ]);

      if (categoriesResponse.categories) {
        setEventCategories(categoriesResponse.categories);
      }
      if (typesResponse.eventTypes) {
        setEventTypes(typesResponse.eventTypes);
      }
      if (locationsResponse.locations) {
        setEventLocations(locationsResponse.locations);
      }
    } catch (filterError) {
      console.warn('Could not fetch filter data:', filterError);
    }
  };

  // Refresh function to manually refresh data
  const refreshEvents = async () => {
    console.log('🔄 Refreshing events data...');
    setLastRefresh(new Date());
    await fetchEvents();
    setShowRefreshMessage(true);
    setTimeout(() => setShowRefreshMessage(false), 3000); // Hide after 3 seconds
  };

  useEffect(() => {
    fetchEvents();
    fetchFilterOptions();
  }, []);

  // Auto-refresh every 2 minutes to show new events
  useEffect(() => {
    const interval = setInterval(() => {
      console.log('🔄 Auto-refreshing events data...');
      fetchEvents();
      fetchFilterOptions();
    }, 2 * 60 * 1000); // 2 minutes

    return () => clearInterval(interval);
  }, []);

  // Industries from fetched data (keeping this for now as it's not in the backend endpoints)
  const industries = [...new Set(events.map(event => event.industry).filter(Boolean))];

  // Filter events
  const filteredEvents = events.filter(event => {
    const matchesSearch = event.title?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !selectedCategory || event.category === selectedCategory;

    // Location matching - check multiple fields
    const matchesLocation = !selectedLocation ||
      event.location === selectedLocation ||
      event.emirate === selectedLocation ||
      (event.venue && event.venue.city === selectedLocation) ||
      (event.venue && `${event.venue.city}, ${event.venue.country}` === selectedLocation);

    const matchesTopEvents = !showTopEvents || event.isFeatured;
    const matchesMediaPartner = !showMediaPartner || (event.mediaPartners && event.mediaPartners.trim() !== '');
    const matchesDiscountCodes = !showDiscountCodes || (event.eventRegistrationCharges && event.eventRegistrationCharges !== 'Free');

    return matchesSearch && matchesCategory && matchesLocation && matchesTopEvents && matchesMediaPartner && matchesDiscountCodes;
  });

  const topEvents = events.filter(event => event.isFeatured && event.status === 'published');

  const clearAllFilters = () => {
    setSearchTerm('');
    setSelectedCategory('');
    setSelectedLocation('');
    setShowTopEvents(false);
    setShowMediaPartner(false);
    setShowDiscountCodes(false);
    setShowPastEvents(false);
  };

  const formatDateRange = (startDate, endDate) => {
    if (!startDate || !endDate) return 'TBD';

    const start = new Date(startDate);
    const end = new Date(endDate);

    // Check for invalid dates
    if (isNaN(start.getTime()) || isNaN(end.getTime())) return 'TBD';

    if (start.toDateString() === end.toDateString()) {
      return start.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    }

    return `${start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${end.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
  };

  const getDaysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const navigateMonth = (direction) => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() + direction);
      return newDate;
    });
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      <SEO
        title="UAE Events Calendar 2025-2026"
        description="Complete UAE events calendar featuring exhibitions, conferences, and shows across Dubai, Abu Dhabi, and Sharjah. Connect with industry leaders and discover innovations at premier events in the region."
        keywords="UAE events, Dubai events, Abu Dhabi events, Sharjah events, exhibitions, conferences, shows, business events, cultural events, 2025 events, 2026 events"
        url="/events"
        type="website"
      />

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-[#162048] via-[#1a237e] to-[#283593] min-h-[500px] flex items-center overflow-hidden mt-32 max-[1280px]:mt-12 max-[570px]:mt-28">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-96 h-96 border border-white rounded-full transform translate-x-32 -translate-y-32"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 border border-white rounded-full transform -translate-x-16 translate-y-16"></div>
          <div className="absolute top-1/2 right-1/4 w-48 h-48 border border-white rounded-full"></div>
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl">
            <p className="text-white/80 text-lg mb-4 font-medium">
              IF AN INDUSTRY EVENT TAKES PLACE AND YOU'RE NOT ATTENDING, DID IT REALLY HAPPEN?
            </p>
            <h1 className="text-4xl md:text-6xl font-extrabold text-white mb-6 leading-tight">
              All UAE Events Calendar 2025 - 2026
            </h1>
            <p className="text-white/90 text-xl mb-8 max-w-3xl leading-relaxed">
              The 2025 UAE events calendar features exhibitions, conferences, and shows across Dubai, Abu Dhabi, and Sharjah. Connect with industry leaders, discover innovations, and expand your network at premier events in the region.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                to="/contact"
                className="bg-white text-[#162048] px-8 py-4 rounded-lg font-bold text-lg hover:bg-gray-100 transition-colors text-center"
              >
                Contact Us
              </Link>
              <button
                onClick={() => setShowSubmissionForm(true)}
                className="bg-[#162048] text-white px-8 py-4 rounded-lg font-bold text-lg hover:bg-[#1a1a1a] transition-colors text-center"
              >
                Submit Your Event
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          {/* Loading State */}
          {loading && (
            <div className="flex items-center justify-center py-20">
              <div className="animate-spin h-12 w-12 border-4 border-blue-500 border-t-transparent rounded-full"></div>
              <span className="ml-4 text-lg text-gray-600">Loading events...</span>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-8">
              <div className="flex items-center">
                <svg className="h-6 w-6 text-red-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
                <div>
                  <h3 className="text-sm font-medium text-red-800">Error Loading Events</h3>
                  <p className="text-sm text-red-700 mt-1">{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* Refresh Success Message */}
          {showRefreshMessage && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6 flex items-center">
              <svg className="h-5 w-5 text-green-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <h3 className="text-sm font-medium text-green-800">Events Updated!</h3>
                <p className="text-sm text-green-700">Latest events have been loaded from the database.</p>
              </div>
            </div>
          )}

          {/* Main Content Grid */}
          {!loading && !error && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

              {/* Left Sidebar - Filters */}
              <div className="lg:col-span-3">
                <div className="bg-white rounded-xl shadow-lg p-6 sticky top-4">
                  <h3 className="text-xl font-bold text-[#162048] mb-6">Filter Events</h3>

                  {/* Search */}
                  <div className="mb-6">
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="Event name"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#162048] focus:border-transparent"
                      />
                      <svg className="absolute right-3 top-3 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                      </svg>
                    </div>
                  </div>

                  {/* Category Dropdown */}
                  <div className="mb-6">
                    <select
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#162048] focus:border-transparent appearance-none bg-white"
                    >
                      <option value="">All Categories</option>
                      {eventCategories.map(category => (
                        <option key={category.category} value={category.category}>
                          {category.category.charAt(0).toUpperCase() + category.category.slice(1)} ({category.count})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Location Dropdown */}
                  <div className="mb-6">
                    <select
                      value={selectedLocation}
                      onChange={(e) => setSelectedLocation(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#162048] focus:border-transparent appearance-none bg-white"
                    >
                      <option value="">All Locations</option>
                      {eventLocations.map(location => (
                        <option key={location.location} value={location.location}>
                          {location.location} ({location.count})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Toggle Switches */}
                  <div className="space-y-4 mb-6">
                    <label className="flex items-center cursor-pointer">
                      <div className="relative">
                        <input
                          type="checkbox"
                          checked={showTopEvents}
                          onChange={(e) => setShowTopEvents(e.target.checked)}
                          className="sr-only"
                        />
                        <div className={`w-12 h-6 rounded-full transition-colors ${showTopEvents ? 'bg-[#162048]' : 'bg-gray-300'}`}>
                          <div className={`w-5 h-5 bg-white rounded-full shadow transform transition-transform ${showTopEvents ? 'translate-x-6' : 'translate-x-0.5'} mt-0.5`}></div>
                        </div>
                      </div>
                      <span className="ml-3 text-gray-700 font-medium">Featured Events</span>
                    </label>

                    <label className="flex items-center cursor-pointer">
                      <div className="relative">
                        <input
                          type="checkbox"
                          checked={showMediaPartner}
                          onChange={(e) => setShowMediaPartner(e.target.checked)}
                          className="sr-only"
                        />
                        <div className={`w-12 h-6 rounded-full transition-colors ${showMediaPartner ? 'bg-[#162048]' : 'bg-gray-300'}`}>
                          <div className={`w-5 h-5 bg-white rounded-full shadow transform transition-transform ${showMediaPartner ? 'translate-x-6' : 'translate-x-0.5'} mt-0.5`}></div>
                        </div>
                      </div>
                      <span className="ml-3 text-gray-700 font-medium">Media Partner</span>
                    </label>

                    <label className="flex items-center cursor-pointer">
                      <div className="relative">
                        <input
                          type="checkbox"
                          checked={showDiscountCodes}
                          onChange={(e) => setShowDiscountCodes(e.target.checked)}
                          className="sr-only"
                        />
                        <div className={`w-12 h-6 rounded-full transition-colors ${showDiscountCodes ? 'bg-[#162048]' : 'bg-gray-300'}`}>
                          <div className={`w-5 h-5 bg-white rounded-full shadow transform transition-transform ${showDiscountCodes ? 'translate-x-6' : 'translate-x-0.5'} mt-0.5`}></div>
                        </div>
                      </div>
                      <span className="ml-3 text-gray-700 font-medium">Paid Events</span>
                    </label>

                    <label className="flex items-center cursor-pointer">
                      <div className="relative">
                        <input
                          type="checkbox"
                          checked={showPastEvents}
                          onChange={(e) => setShowPastEvents(e.target.checked)}
                          className="sr-only"
                        />
                        <div className={`w-12 h-6 rounded-full transition-colors ${showPastEvents ? 'bg-[#162048]' : 'bg-gray-300'}`}>
                          <div className={`w-5 h-5 bg-white rounded-full shadow transform transition-transform ${showPastEvents ? 'translate-x-6' : 'translate-x-0.5'} mt-0.5`}></div>
                        </div>
                      </div>
                      <span className="ml-3 text-gray-700 font-medium">Show Past Events</span>
                    </label>
                  </div>

                  {/* Clear All Button */}
                  <button
                    onClick={clearAllFilters}
                    className="text-[#162048] font-medium hover:text-[#1a1a1a] transition-colors"
                  >
                    Clear All
                  </button>
                </div>
              </div>

              {/* Center Content - Events List */}
              <div className="lg:col-span-6">
                {/* Featured Event */}
                {filteredEvents.length > 0 && (
                  <div className="mb-8">
                    <h2 className="text-2xl font-bold text-[#162048] mb-6">Featured Upcoming UAE Event</h2>
                    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                      <div className="bg-gradient-to-r from-[#162048] to-[#1a237e] text-white p-6">
                        <div className="flex justify-between items-center">
                          <span className="text-lg font-bold">
                            {formatDateRange(filteredEvents[0]?.startDate, filteredEvents[0]?.endDate).toUpperCase()}
                          </span>
                          <span className="text-lg font-bold">
                            {(filteredEvents[0]?.location ||
                              filteredEvents[0]?.emirate ||
                              (filteredEvents[0]?.venue && filteredEvents[0]?.venue.city) ||
                              'TBD').toUpperCase()}
                          </span>
                        </div>
                      </div>
                      <div className="p-6">
                        <div className="flex flex-wrap gap-2 mb-4">
                          {(filteredEvents[0]?.tags || []).map((tag, index) => (
                            <span key={`${tag}-${index}`} className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm font-medium">
                              {tag}
                            </span>
                          ))}
                        </div>
                        <h3 className="text-2xl font-bold text-[#1a1a1a] mb-4">{filteredEvents[0]?.title || 'Event Title'}</h3>
                        <p className="text-gray-600 mb-4 leading-relaxed">
                          {filteredEvents[0]?.description || 'No description available.'}
                        </p>

                        {/* Event Details Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                          {/* Event Type & Category */}
                          <div className="flex items-center text-sm text-gray-600">
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path>
                            </svg>
                            <span>{filteredEvents[0]?.eventType?.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'N/A'} • {filteredEvents[0]?.category?.charAt(0).toUpperCase() + filteredEvents[0]?.category?.slice(1) || 'N/A'}</span>
                          </div>

                          {/* Capacity & Price */}
                          {(filteredEvents[0]?.capacity || filteredEvents[0]?.price) && (
                            <div className="flex items-center text-sm text-gray-600">
                              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"></path>
                              </svg>
                              <span>
                                {filteredEvents[0]?.capacity ? `Capacity: ${filteredEvents[0]?.capacity}` : ''}
                                {filteredEvents[0]?.capacity && filteredEvents[0]?.price ? ' • ' : ''}
                                {filteredEvents[0]?.price ? `${filteredEvents[0]?.currency || 'USD'} ${filteredEvents[0]?.price}` : ''}
                              </span>
                            </div>
                          )}

                          {/* Industry */}
                          {filteredEvents[0]?.industry && (
                            <div className="flex items-center text-sm text-gray-600">
                              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
                              </svg>
                              <span>{filteredEvents[0]?.industry.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</span>
                            </div>
                          )}

                          {/* Registration Deadline */}
                          {filteredEvents[0]?.registrationDeadline && (
                            <div className="flex items-center text-sm text-gray-600">
                              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                              </svg>
                              <span>Registration Deadline: {new Date(filteredEvents[0]?.registrationDeadline).toLocaleDateString()}</span>
                            </div>
                          )}
                        </div>

                        {/* Venue Information */}
                        {filteredEvents[0]?.venue && (filteredEvents[0]?.venue.name || filteredEvents[0]?.venue.address || filteredEvents[0]?.venue.city) && (
                          <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                            <h4 className="font-semibold text-[#162048] mb-2">Venue Information</h4>
                            <div className="text-sm text-gray-600 space-y-1">
                              {filteredEvents[0]?.venue.name && <p><strong>Name:</strong> {filteredEvents[0]?.venue.name}</p>}
                              {filteredEvents[0]?.venue.address && <p><strong>Address:</strong> {filteredEvents[0]?.venue.address}</p>}
                              {(filteredEvents[0]?.venue.city || filteredEvents[0]?.venue.country) && (
                                <p><strong>Location:</strong> {[filteredEvents[0]?.venue.city, filteredEvents[0]?.venue.country].filter(Boolean).join(', ')}</p>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Contact Information */}
                        {filteredEvents[0]?.contactInfo && (filteredEvents[0]?.contactInfo.email || filteredEvents[0]?.contactInfo.phone || filteredEvents[0]?.contactInfo.organizer) && (
                          <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                            <h4 className="font-semibold text-[#162048] mb-2">Contact Information</h4>
                            <div className="text-sm text-gray-600 space-y-1">
                              {filteredEvents[0]?.contactInfo.email && <p><strong>Email:</strong> {filteredEvents[0]?.contactInfo.email}</p>}
                              {filteredEvents[0]?.contactInfo.phone && <p><strong>Phone:</strong> {filteredEvents[0]?.contactInfo.phone}</p>}
                              {filteredEvents[0]?.contactInfo.organizer && <p><strong>Organizer:</strong> {filteredEvents[0]?.contactInfo.organizer}</p>}
                            </div>
                          </div>
                        )}

                        {/* Social Links */}
                        {filteredEvents[0]?.socialLinks && Object.values(filteredEvents[0]?.socialLinks).some(link => link) && (
                          <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                            <h4 className="font-semibold text-[#162048] mb-2">Social Links</h4>
                            <div className="flex flex-wrap gap-2">
                              {filteredEvents[0]?.socialLinks.website && (
                                <a href={filteredEvents[0]?.socialLinks.website} target="_blank" rel="noopener noreferrer"
                                   className="inline-flex items-center bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-medium hover:bg-blue-200 transition-colors">
                                  <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9v-9m0-9v9"></path>
                                  </svg>
                                  Website
                                </a>
                              )}
                              {filteredEvents[0]?.socialLinks.facebook && (
                                <a href={filteredEvents[0]?.socialLinks.facebook} target="_blank" rel="noopener noreferrer"
                                   className="inline-flex items-center bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-medium hover:bg-blue-700 transition-colors">
                                  <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                                  </svg>
                                  Facebook
                                </a>
                              )}
                              {filteredEvents[0]?.socialLinks.twitter && (
                                <a href={filteredEvents[0]?.socialLinks.twitter} target="_blank" rel="noopener noreferrer"
                                   className="inline-flex items-center bg-sky-500 text-white px-3 py-1 rounded-full text-xs font-medium hover:bg-sky-600 transition-colors">
                                  <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                                  </svg>
                                  Twitter
                                </a>
                              )}
                              {filteredEvents[0]?.socialLinks.instagram && (
                                <a href={filteredEvents[0]?.socialLinks.instagram} target="_blank" rel="noopener noreferrer"
                                   className="inline-flex items-center bg-pink-600 text-white px-3 py-1 rounded-full text-xs font-medium hover:bg-pink-700 transition-colors">
                                  <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M12.017 0C8.396 0 7.996.014 6.79.067 5.59.12 4.694.265 3.923.51c-.86.28-1.587.653-2.313 1.378S.78 3.05.5 3.91C.255 4.68.11 5.576.067 6.776.014 7.982 0 8.382 0 11.997s.014 4.015.067 5.22c.043 1.2.188 2.096.433 2.866.28.86.653 1.587 1.378 2.313.726.726 1.453 1.098 2.313 1.378.77.245 1.666.39 2.866.433C7.996 23.986 8.396 24 12.017 24s4.02-.014 5.226-.067c1.2-.043 2.096-.188 2.866-.433.86-.28 1.587-.653 2.313-1.378.726-.726 1.098-1.453 1.378-2.313.245-.77.39-1.666.433-2.866.053-1.206.067-1.606.067-5.22s-.014-4.015-.067-5.22c-.043-1.2-.188-2.096-.433-2.866-.28-.86-.653-1.587-1.378-2.313C20.734.78 20.007.407 19.247.127c-.77-.245-1.666-.39-2.866-.433C16.037.014 15.637 0 12.017 0zm0 2.226c3.537 0 3.957.013 5.355.066 1.276.05 1.976.218 2.433.365.913.294 1.565.683 2.257 1.375.692.692 1.081 1.344 1.375 2.257.147.457.315 1.157.365 2.433.053 1.398.066 1.818.066 5.355 0 3.537-.013 3.957-.066 5.355-.05 1.276-.218 1.976-.365 2.433-.294.913-.683 1.565-1.375 2.257-.692.692-1.344 1.081-2.257 1.375-.457.147-1.157.315-2.433.365-1.398.053-1.818.066-5.355.066-3.537 0-3.957-.013-5.355-.066-1.276-.05-1.976-.218-2.433-.365-.913-.294-1.565-.683-2.257-1.375-.692-.692-1.081-1.344-1.375-2.257-.147-.457-.315-1.157-.365-2.433-.053-1.398-.066-1.818-.066-5.355 0-3.537.013-3.957.066-5.355.05-1.276.218-1.976.365-2.433.294-.913.683-1.565 1.375-2.257.692-.692 1.344-1.081 2.257-1.375.457-.147 1.157-.315 2.433-.365 1.398-.053 1.818-.066 5.355-.066zm0 3.534a8.483 8.483 0 100 16.966 8.483 8.483 0 000-16.966zm0 2.226a6.257 6.257 0 110 12.514 6.257 6.257 0 010-12.514zm4.917-2.44a1.562 1.562 0 11-3.124 0 1.562 1.562 0 013.124 0z"/>
                                  </svg>
                                  Instagram
                                </a>
                              )}
                              {filteredEvents[0]?.socialLinks.linkedin && (
                                <a href={filteredEvents[0]?.socialLinks.linkedin} target="_blank" rel="noopener noreferrer"
                                   className="inline-flex items-center bg-blue-700 text-white px-3 py-1 rounded-full text-xs font-medium hover:bg-blue-800 transition-colors">
                                  <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                                  </svg>
                                  LinkedIn
                                </a>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Media Partners */}
                        {filteredEvents[0]?.mediaPartners && (
                          <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                            <h4 className="font-semibold text-[#162048] mb-2">Media Partners</h4>
                            <p className="text-sm text-gray-600">{filteredEvents[0]?.mediaPartners}</p>
                          </div>
                        )}

                        {/* Action Buttons */}
                        <div className="flex flex-wrap gap-3">
                          {filteredEvents[0]?.website && (
                            <a
                              href={filteredEvents[0]?.website}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center bg-[#162048] text-white px-6 py-3 rounded-lg font-bold hover:bg-[#1a1a1a] transition-colors"
                            >
                              VISIT WEBSITE
                              <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path>
                              </svg>
                            </a>
                          )}
                          {filteredEvents[0]?.eventRegistrationLink && (
                            <a
                              href={filteredEvents[0]?.eventRegistrationLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center bg-green-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-green-700 transition-colors"
                            >
                              REGISTER NOW
                              <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"></path>
                              </svg>
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* All Events */}
                <div className="mb-8">
                  <div className="flex justify-between items-center mb-6">
                    <div>
                      <h2 className="text-2xl font-bold text-[#162048]">All Events</h2>
                      <p className="text-sm text-gray-600 mt-1">
                        {events.length} events loaded • Last updated: {lastRefresh.toLocaleTimeString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      <button
                        onClick={refreshEvents}
                        disabled={loading}
                        className="flex items-center gap-2 bg-[#162048] text-white px-4 py-2 rounded-lg font-medium hover:bg-[#1a1a1a] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <svg className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
                        </svg>
                        {loading ? 'Refreshing...' : 'Refresh'}
                      </button>
                    </div>
                  </div>
                  <div className="space-y-6">
                    {filteredEvents.slice(1).map((event, index) => (
                      <div key={event.id || `event-${index}`} className="bg-white rounded-xl shadow-lg overflow-hidden">
                        <div className="bg-gradient-to-r from-[#162048] to-[#1a237e] text-white p-4">
                          <div className="flex justify-between items-center">
                            <span className="font-bold">
                              {formatDateRange(event.startDate, event.endDate).toUpperCase()}
                            </span>
                            <span className="font-bold">
                              {(event.location ||
                                event.emirate ||
                                (event.venue && event.venue.city) ||
                                'TBD').toUpperCase()}
                            </span>
                          </div>
                        </div>
                        <div className="p-6">
                          {/* Structured Data for Event */}
                          <StructuredData
                            type="event"
                            data={{
                              title: event.title,
                              description: event.description,
                              featuredImage: event.featuredImage || event.image,
                              startDate: event.startDate,
                              endDate: event.endDate,
                              location: event.location || event.emirate,
                              venue: event.venue,
                              price: event.eventRegistrationCharges,
                              currency: event.currency || 'AED',
                              registrationLink: event.eventRegistrationLink,
                              website: event.website,
                              organizer: event.organizer,
                              isVirtual: event.isVirtual || false,
                              status: event.status || 'published'
                            }}
                          />

                          <div className="flex flex-wrap gap-2 mb-3">
                            {(event.tags || []).map((tag, tagIndex) => (
                              <span key={`${tag}-${tagIndex}`} className="bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-xs font-medium">
                                {tag}
                              </span>
                            ))}
                          </div>
                          <h3 className="text-xl font-bold text-[#1a1a1a] mb-3">{event.title || 'Event Title'}</h3>
                          <p className="text-gray-600 mb-4 leading-relaxed">
                            {event.description || 'No description available.'}
                          </p>

                          {/* Event Details Grid */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            {/* Event Type & Category */}
                            <div className="flex items-center text-sm text-gray-600">
                              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path>
                              </svg>
                              <span>{event.eventType?.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'N/A'} • {event.category?.charAt(0).toUpperCase() + event.category?.slice(1) || 'N/A'}</span>
                            </div>

                            {/* Capacity & Price */}
                            {(event.capacity || event.price) && (
                              <div className="flex items-center text-sm text-gray-600">
                                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"></path>
                                </svg>
                                <span>
                                  {event.capacity ? `Capacity: ${event.capacity}` : ''}
                                  {event.capacity && event.price ? ' • ' : ''}
                                  {event.price ? `${event.currency || 'USD'} ${event.price}` : ''}
                                </span>
                              </div>
                            )}

                            {/* Industry */}
                            {event.industry && (
                              <div className="flex items-center text-sm text-gray-600">
                                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
                                </svg>
                                <span>{event.industry.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</span>
                              </div>
                            )}

                            {/* Registration Deadline */}
                            {event.registrationDeadline && (
                              <div className="flex items-center text-sm text-gray-600">
                                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                </svg>
                                <span>Registration Deadline: {new Date(event.registrationDeadline).toLocaleDateString()}</span>
                              </div>
                            )}
                          </div>

                          {/* Venue Information */}
                          {event.venue && (event.venue.name || event.venue.address || event.venue.city) && (
                            <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                              <h4 className="font-semibold text-[#162048] mb-2">Venue Information</h4>
                              <div className="text-sm text-gray-600 space-y-1">
                                {event.venue.name && <p><strong>Name:</strong> {event.venue.name}</p>}
                                {event.venue.address && <p><strong>Address:</strong> {event.venue.address}</p>}
                                {(event.venue.city || event.venue.country) && (
                                  <p><strong>Location:</strong> {[event.venue.city, event.venue.country].filter(Boolean).join(', ')}</p>
                                )}
                              </div>
                            </div>
                          )}

                          {/* Contact Information */}
                          {event.contactInfo && (event.contactInfo.email || event.contactInfo.phone || event.contactInfo.organizer) && (
                            <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                              <h4 className="font-semibold text-[#162048] mb-2">Contact Information</h4>
                              <div className="text-sm text-gray-600 space-y-1">
                                {event.contactInfo.email && <p><strong>Email:</strong> {event.contactInfo.email}</p>}
                                {event.contactInfo.phone && <p><strong>Phone:</strong> {event.contactInfo.phone}</p>}
                                {event.contactInfo.organizer && <p><strong>Organizer:</strong> {event.contactInfo.organizer}</p>}
                              </div>
                            </div>
                          )}

                          {/* Social Links */}
                          {event.socialLinks && Object.values(event.socialLinks).some(link => link) && (
                            <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                              <h4 className="font-semibold text-[#162048] mb-2">Social Links</h4>
                              <div className="flex flex-wrap gap-2">
                                {event.socialLinks.website && (
                                  <a href={event.socialLinks.website} target="_blank" rel="noopener noreferrer"
                                     className="inline-flex items-center bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-medium hover:bg-blue-200 transition-colors">
                                    <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9v-9m0-9v9"></path>
                                    </svg>
                                    Website
                                  </a>
                                )}
                                {event.socialLinks.facebook && (
                                  <a href={event.socialLinks.facebook} target="_blank" rel="noopener noreferrer"
                                     className="inline-flex items-center bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-medium hover:bg-blue-700 transition-colors">
                                    <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 24 24">
                                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                                    </svg>
                                    Facebook
                                  </a>
                                )}
                                {event.socialLinks.twitter && (
                                  <a href={event.socialLinks.twitter} target="_blank" rel="noopener noreferrer"
                                     className="inline-flex items-center bg-sky-500 text-white px-3 py-1 rounded-full text-xs font-medium hover:bg-sky-600 transition-colors">
                                    <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 24 24">
                                      <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                                    </svg>
                                    Twitter
                                  </a>
                                )}
                                {event.socialLinks.instagram && (
                                  <a href={event.socialLinks.instagram} target="_blank" rel="noopener noreferrer"
                                     className="inline-flex items-center bg-pink-600 text-white px-3 py-1 rounded-full text-xs font-medium hover:bg-pink-700 transition-colors">
                                    <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 24 24">
                                      <path d="M12.017 0C8.396 0 7.996.014 6.79.067 5.59.12 4.694.265 3.923.51c-.86.28-1.587.653-2.313 1.378S.78 3.05.5 3.91C.255 4.68.11 5.576.067 6.776.014 7.982 0 8.382 0 11.997s.014 4.015.067 5.22c.043 1.2.188 2.096.433 2.866.28.86.653 1.587 1.378 2.313.726.726 1.453 1.098 2.313 1.378.77.245 1.666.39 2.866.433C7.996 23.986 8.396 24 12.017 24s4.02-.014 5.226-.067c1.2-.043 2.096-.188 2.866-.433.86-.28 1.587-.653 2.313-1.378.726-.726 1.098-1.453 1.378-2.313.245-.77.39-1.666.433-2.866.053-1.206.067-1.606.067-5.22s-.014-4.015-.067-5.22c-.043-1.2-.188-2.096-.433-2.866-.28-.86-.653-1.587-1.378-2.313C20.734.78 20.007.407 19.247.127c-.77-.245-1.666-.39-2.866-.433C16.037.014 15.637 0 12.017 0zm0 2.226c3.537 0 3.957.013 5.355.066 1.276.05 1.976.218 2.433.365.913.294 1.565.683 2.257 1.375.692.692 1.081 1.344 1.375 2.257.147.457.315 1.157.365 2.433.053 1.398.066 1.818.066 5.355 0 3.537-.013 3.957-.066 5.355-.05 1.276-.218 1.976-.365 2.433-.294.913-.683 1.565-1.375 2.257-.692.692-1.344 1.081-2.257 1.375-.457.147-1.157.315-2.433.365-1.398.053-1.818.066-5.355.066-3.537 0-3.957-.013-5.355-.066-1.276-.05-1.976-.218-2.433-.365-.913-.294-1.565-.683-2.257-1.375-.692-.692-1.081-1.344-1.375-2.257-.147-.457-.315-1.157-.365-2.433-.053-1.398-.066-1.818-.066-5.355 0-3.537.013-3.957.066-5.355.05-1.276.218-1.976.365-2.433.294-.913.683-1.565 1.375-2.257.692-.692 1.344-1.081 2.257-1.375.457-.147 1.157-.315 2.433-.365 1.398-.053 1.818-.066 5.355-.066zm0 3.534a8.483 8.483 0 100 16.966 8.483 8.483 0 000-16.966zm0 2.226a6.257 6.257 0 110 12.514 6.257 6.257 0 010-12.514zm4.917-2.44a1.562 1.562 0 11-3.124 0 1.562 1.562 0 013.124 0z"/>
                                    </svg>
                                    Instagram
                                  </a>
                                )}
                                {event.socialLinks.linkedin && (
                                  <a href={event.socialLinks.linkedin} target="_blank" rel="noopener noreferrer"
                                     className="inline-flex items-center bg-blue-700 text-white px-3 py-1 rounded-full text-xs font-medium hover:bg-blue-800 transition-colors">
                                    <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 24 24">
                                      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                                    </svg>
                                    LinkedIn
                                  </a>
                                )}
                              </div>
                            </div>
                          )}

                          {/* Media Partners */}
                          {event.mediaPartners && (
                            <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                              <h4 className="font-semibold text-[#162048] mb-2">Media Partners</h4>
                              <p className="text-sm text-gray-600">{event.mediaPartners}</p>
                            </div>
                          )}

                          {/* Action Buttons */}
                          <div className="flex flex-wrap gap-3 justify-end">
                            {event.website && (
                              <a
                                href={event.website}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center bg-[#162048] text-white px-4 py-2 rounded-lg font-bold hover:bg-[#1a1a1a] transition-colors"
                              >
                                VISIT WEBSITE
                                <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path>
                                </svg>
                              </a>
                            )}
                            {event.eventRegistrationLink && (
                              <a
                                href={event.eventRegistrationLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center bg-green-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-green-700 transition-colors"
                              >
                                REGISTER NOW
                                <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"></path>
                                </svg>
                              </a>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Sidebar - Calendar and Top Events */}
              <div className="lg:col-span-3">
                <div className="space-y-6">
                  {/* Calendar Widget */}
                  <div className="bg-white rounded-xl shadow-lg p-6 sticky top-4">
                    <div className="flex justify-between items-center mb-4">
                      <button
                        onClick={() => navigateMonth(-1)}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path>
                        </svg>
                      </button>
                      <h3 className="text-lg font-bold text-[#162048]">
                        {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                      </h3>
                      <button
                        onClick={() => navigateMonth(1)}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
                        </svg>
                      </button>
                    </div>

                    <div className="grid grid-cols-7 gap-1 mb-2">
                      {[
                        { key: 'sun', label: 'S' },
                        { key: 'mon', label: 'M' },
                        { key: 'tue', label: 'T' },
                        { key: 'wed', label: 'W' },
                        { key: 'thu', label: 'T' },
                        { key: 'fri', label: 'F' },
                        { key: 'sat', label: 'S' }
                      ].map(day => (
                        <div key={day.key} className="text-center text-sm font-medium text-gray-500 py-2">
                          {day.label}
                        </div>
                      ))}
                    </div>

                    <div className="grid grid-cols-7 gap-1">
                      {Array.from({ length: getFirstDayOfMonth(currentDate) }, (_, i) => (
                        <div key={`empty-${i}`} className="h-8"></div>
                      ))}
                      {Array.from({ length: getDaysInMonth(currentDate) }, (_, i) => {
                        const day = i + 1;
                        const currentDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
                        const isToday = new Date().toDateString() === currentDay.toDateString();

                        // Check if this day has any events (published events only)
                        const dayEvents = events.filter(event => {
                          if (event.status !== 'published') return false;

                          const startDate = new Date(event.startDate);
                          const endDate = new Date(event.endDate);

                          // Handle invalid dates
                          if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) return false;

                          return currentDay >= startDate && currentDay <= endDate;
                        });

                        const hasEvent = dayEvents.length > 0;

                        return (
                          <div
                            key={`day-${day}`}
                            className={`h-8 flex items-center justify-center text-sm rounded-lg cursor-pointer transition-colors relative ${
                              hasEvent
                                ? 'bg-[#162048] text-white font-bold'
                                : isToday
                                ? 'bg-blue-100 text-blue-800 font-bold'
                                : 'hover:bg-gray-100 text-gray-700'
                            }`}
                            title={hasEvent ? `${dayEvents.length} event(s) on this day` : ''}
                          >
                            {day}
                            {hasEvent && dayEvents.length > 1 && (
                              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                                {dayEvents.length}
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    <button
                      onClick={goToToday}
                      className="w-full mt-4 text-[#162048] font-medium hover:text-[#1a1a1a] transition-colors"
                    >
                      Back to Today
                    </button>
                  </div>

                  {/* Top Events Sidebar */}
                  <div className="bg-white rounded-xl shadow-lg p-6">
                    <h3 className="text-lg font-bold text-[#162048] mb-4">Featured UAE Events</h3>
                    <div className="space-y-4">
                      {topEvents.length > 0 ? topEvents.map((event, index) => (
                        <div key={event.id || `top-event-${index}`} className="border-b border-gray-100 pb-4 last:border-b-0 last:pb-0">
                          <h4 className="font-bold text-[#1a1a1a] mb-2 hover:text-[#162048] cursor-pointer transition-colors">
                            {event.title || 'Event Title'}
                          </h4>
                          <div className="flex items-center text-sm text-gray-600 mb-1">
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                            </svg>
                            <span>{event.location || event.emirate || (event.venue && event.venue.city) || 'TBD'}</span>
                          </div>
                          <div className="flex items-center text-sm text-gray-600">
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                            </svg>
                            <span>{formatDateRange(event.startDate, event.endDate)}</span>
                          </div>
                        </div>
                      )) : (
                        <p className="text-gray-500 text-center py-4">No top events available</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Event Submission Modal */}
      {showSubmissionForm && (
        <EventSubmissionForm
          onClose={() => setShowSubmissionForm(false)}
          onSuccess={() => {
            setShowSubmissionForm(false);
            refreshEvents(); // Refresh the events list
          }}
          isAuthenticated={isAuthenticated}
        />
      )}

    </div>
  );
};

export default EventsPage;