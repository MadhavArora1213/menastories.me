import React, { useState, useEffect } from "react";
import { useTheme } from "../context/ThemeContext";
import { useToast } from "../../context/ToastContext";
import { useNavigate, useParams } from "react-router-dom";
import { eventService } from "../services/eventService";
import EventForm from "../Components/EventForm";

const UpdateEvent = () => {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const { showSuccess, showError } = useToast();
  const navigate = useNavigate();
  const { id } = useParams();

  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  // Utility function to safely render values
  const safeValue = (value, fallback = 'N/A') => {
    if (value === null || value === undefined) return fallback;
    if (typeof value === 'number' && isNaN(value)) return fallback;
    if (typeof value === 'string' && value.trim() === '') return fallback;
    return value;
  };

  // Utility function to safely format dates
  const safeDate = (dateValue, fallback = 'Not set') => {
    if (!dateValue) return fallback;
    try {
      const date = new Date(dateValue);
      if (isNaN(date.getTime())) return fallback;
      return date.toLocaleDateString();
    } catch (error) {
      return fallback;
    }
  };

  useEffect(() => {
    const loadEvent = async () => {
      try {
        if (!event && id) {
          console.log('Loading event with ID:', id);
          const response = await eventService.getEvent(id);
          console.log('Event API response:', response);

          // Handle different response formats
          let eventData = null;
          if (response && typeof response === 'object') {
            if (response.data && response.data.event) {
              eventData = response.data.event;
            } else if (response.data) {
              eventData = response.data;
            } else if (response.event) {
              eventData = response.event;
            } else {
              eventData = response;
            }
          }

          // Validate event data
          if (eventData && eventData.id) {
            console.log('Setting event data:', eventData);
            setEvent(eventData);
          } else {
            console.error('Invalid event data received:', eventData);
            showError('Invalid event data received');
            navigate("/admin/events");
          }
        }
      } catch (error) {
        console.error('Failed to load event:', error);
        console.error('Error details:', error.response?.data || error.message);
        showError(error.response?.data?.message || error.message || 'Failed to load event');
        navigate("/admin/events");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      loadEvent();
    }
  }, [id, event, navigate, showError]);

  const handleSubmit = async (formData) => {
    try {
      setUpdating(true);
      await eventService.updateEvent(id, formData);
      showSuccess("Event updated successfully!");
      navigate("/admin/events");
    } catch (error) {
      console.error('Failed to update event:', error);
      showError(error.response?.data?.message || error.message || 'Failed to update event');
    } finally {
      setUpdating(false);
    }
  };

  const cardBg = isDark ? "bg-black border border-white/10" : "bg-white border border-black/10";
  const textMain = isDark ? "text-white" : "text-black";
  const subText = isDark ? "text-gray-300" : "text-gray-600";

  if (loading) {
    return (
      <div className={`min-h-screen ${isDark ? "bg-black" : "bg-white"} py-12 px-2 flex items-center justify-center`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-white mx-auto mb-4"></div>
          <p className={`text-xl ${textMain}`}>Loading event...</p>
        </div>
      </div>
    );
  }

  if (!event || !event.id) {
    return (
      <div className={`min-h-screen ${isDark ? "bg-black" : "bg-white"} py-12 px-2 flex items-center justify-center`}>
        <div className="text-center">
          <svg className={`w-16 h-16 mx-auto mb-4 ${subText}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <h3 className={`text-xl font-semibold mb-2 ${textMain}`}>Event not found</h3>
          <p className={`text-sm ${subText} mb-4`}>The event you're looking for doesn't exist or has been deleted.</p>
          <button
            onClick={() => navigate("/admin/events")}
            className={`px-6 py-3 rounded-lg font-medium transition ${isDark ? "bg-white text-black hover:bg-gray-200" : "bg-black text-white hover:bg-gray-900"}`}
          >
            Back to Events
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${isDark ? "bg-black" : "bg-white"} py-12 px-2 flex items-center justify-center transition-colors duration-300`}>
      <div className={`w-full max-w-6xl ${cardBg} rounded-2xl p-8 md:p-12`}>
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
          <div>
            <h2 className={`text-3xl md:text-4xl font-extrabold mb-2 ${textMain}`}>
              Update Event
            </h2>
            <p className={`text-base ${subText}`}>
              Modify the details of "{safeValue(event?.title, 'Loading...')}".
            </p>
          </div>
          <div className="flex-shrink-0">
            <span className={`inline-block ${isDark ? "bg-blue-500/20 text-blue-400" : "bg-blue-100 text-blue-800"} px-4 py-2 rounded-lg font-semibold`}>
              <svg className="inline w-6 h-6 mr-1" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Edit Mode
            </span>
          </div>
        </div>

        {/* Current Info */}
        <div className={`p-4 rounded-lg mb-6 ${isDark ? "bg-gray-800/50" : "bg-gray-50"} border ${isDark ? "border-white/10" : "border-gray-200"}`}>
          <h3 className={`font-semibold mb-2 ${textMain}`}>Current Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <span className={`font-medium ${subText}`}>Title:</span>
              <span className={`ml-2 ${textMain}`}>{safeValue(event.title)}</span>
            </div>
            <div>
              <span className={`font-medium ${subText}`}>Status:</span>
              <span className={`ml-2 ${safeValue(event.status) === 'published' ? 'text-green-500' : safeValue(event.status) === 'draft' ? 'text-yellow-500' : 'text-red-500'}`}>
                {safeValue(event.status)?.charAt(0).toUpperCase() + safeValue(event.status)?.slice(1)}
              </span>
            </div>
            <div>
              <span className={`font-medium ${subText}`}>Type:</span>
              <span className={`ml-2 ${textMain}`}>{safeValue(event.eventType)?.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}</span>
            </div>
            <div>
              <span className={`font-medium ${subText}`}>Category:</span>
              <span className={`ml-2 ${textMain}`}>{safeValue(event.category)?.charAt(0).toUpperCase() + safeValue(event.category)?.slice(1)}</span>
            </div>
            <div>
              <span className={`font-medium ${subText}`}>Start Date:</span>
              <span className={`ml-2 ${textMain}`}>{safeDate(event.startDate)}</span>
            </div>
            <div>
              <span className={`font-medium ${subText}`}>Capacity:</span>
              <span className={`ml-2 ${textMain}`}>
                {event.capacity && !isNaN(event.capacity) ? event.capacity : 'Unlimited'}
              </span>
            </div>
          </div>
        </div>

        {/* Form */}
        <div className={`rounded-xl p-6 md:p-8 ${isDark ? "bg-gray-800/50" : "bg-gray-50"} border ${isDark ? "border-white/10" : "border-gray-200"}`}>
          {event && event.id && (
            <EventForm
              initialData={event}
              onSubmit={handleSubmit}
              isEdit={true}
              loading={updating}
            />
          )}
        </div>

        {/* Help Text */}
        <div className="mt-8">
          <div className={`p-4 rounded-lg ${isDark ? "bg-amber-500/10 border border-amber-500/20" : "bg-amber-50 border border-amber-200"}`}>
            <div className="flex items-start gap-3">
              <svg className={`w-5 h-5 mt-0.5 ${isDark ? "text-amber-400" : "text-amber-600"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              <div>
                <h4 className={`font-semibold mb-1 ${textMain}`}>Update Considerations</h4>
                <ul className={`text-sm ${subText} space-y-1`}>
                  <li>• Changing dates may affect existing registrations</li>
                  <li>• Updating capacity may impact registration availability</li>
                  <li>• Status changes will immediately affect event visibility</li>
                  <li>• Price changes only affect future registrations</li>
                  <li>• Consider notifying attendees of significant changes</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="mt-8 flex justify-between">
          <button
            onClick={() => navigate("/admin/events")}
            className={`px-6 py-3 rounded-lg font-medium transition ${
              isDark
                ? "bg-gray-700 text-white hover:bg-gray-600"
                : "bg-gray-200 text-gray-900 hover:bg-gray-300"
            }`}
          >
            ← Back to Events
          </button>
          <div className="flex gap-3">
            <button
              onClick={() => navigate(`/admin/events/delete/${id}`)}
              className={`px-6 py-3 rounded-lg font-medium transition ${
                isDark
                  ? "bg-red-600 text-white hover:bg-red-700"
                  : "bg-red-500 text-white hover:bg-red-600"
              }`}
            >
              Delete Event
            </button>
            <button
              onClick={() => navigate("/admin/categories")}
              className={`px-6 py-3 rounded-lg font-medium transition ${
                isDark
                  ? "bg-blue-600 text-white hover:bg-blue-700"
                  : "bg-blue-500 text-white hover:bg-blue-600"
              }`}
            >
              Manage Categories →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UpdateEvent;