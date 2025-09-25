import React, { useState } from "react";
import { useTheme } from "../context/ThemeContext";
import { useToast } from "../../context/ToastContext";
import { useNavigate } from "react-router-dom";
import { eventService } from "../services/eventService";
import EventForm from "../Components/EventForm";

const CreateEvent = () => {
  const { theme } = useTheme();
  const { showSuccess, showError } = useToast();
  const navigate = useNavigate();

  const [creating, setCreating] = useState(false);

  const handleSubmit = async (formData) => {
    try {
      setCreating(true);
      await eventService.createEvent(formData);
      showSuccess("Event created successfully!");
      navigate("/admin/events");
    } catch (error) {
      console.error('Failed to create event:', error);
      showError(error.response?.data?.message || error.message || 'Failed to create event');
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="min-h-screen bg-primary-bg py-12 px-2 flex items-center justify-center transition-colors duration-300">
      <div className="w-full max-w-6xl bg-primary-bg border border-primary-border rounded-2xl p-8 md:p-12 shadow-lg">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
          <div>
            <h2 className="text-3xl md:text-4xl font-extrabold mb-2 text-primary-text">
              Create New Event
            </h2>
            <p className="text-base text-primary-text-secondary">
              Add a new event to your system.
            </p>
          </div>
          <div className="flex-shrink-0">
            <span className="inline-block bg-green-500/20 text-green-400 px-4 py-2 rounded-lg font-semibold">
              <svg className="inline w-6 h-6 mr-1" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M12 4v16m8-8H4" />
              </svg>
              Create Mode
            </span>
          </div>
        </div>

        {/* Guidelines */}
        <div className="p-4 rounded-lg mb-6 bg-blue-500/10 border border-blue-500/20">
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 mt-0.5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <h4 className="font-semibold mb-1 text-primary-text">Event Creation Guidelines</h4>
              <ul className="text-sm text-primary-text-secondary space-y-1">
                <li>• Choose a clear, descriptive title that reflects the event's purpose</li>
                <li>• Set appropriate dates and times in the correct timezone</li>
                <li>• Consider capacity limits and registration requirements</li>
                <li>• Add detailed descriptions and relevant tags for better discoverability</li>
                <li>• Configure pricing and ticket types if applicable</li>
                <li>• Set up contact information for attendees to reach organizers</li>
                <li>• Review all settings before publishing the event</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="rounded-xl p-6 md:p-8 bg-primary-bg-secondary border border-primary-border-secondary shadow-lg hover:shadow-xl transition-all duration-200">
          <EventForm
            initialData={{}}
            onSubmit={handleSubmit}
            isEdit={false}
            loading={creating}
          />
        </div>

        {/* Tips */}
        <div className="mt-8">
          <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/20">
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 mt-0.5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <h4 className="font-semibold mb-1 text-primary-text">Pro Tips</h4>
                <ul className="text-sm text-primary-text-secondary space-y-1">
                  <li>• Use featured events sparingly to highlight important occasions</li>
                  <li>• Virtual events can reach a global audience without venue constraints</li>
                  <li>• Hybrid events combine the best of both physical and virtual attendance</li>
                  <li>• Set registration deadlines to create urgency and manage capacity</li>
                  <li>• Use tags to improve event discoverability and categorization</li>
                  <li>• Consider SEO settings for better search engine visibility</li>
                  <li>• Test all links and contact information before publishing</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="mt-8 flex justify-between">
          <button
            onClick={() => navigate("/admin/events")}
            className="px-6 py-3 rounded-lg font-medium transition bg-primary-bg-secondary border border-primary-border-secondary text-primary-text hover:bg-primary-bg hover:border-primary-border"
          >
            ← Back to Events
          </button>
          <div className="flex gap-3">
            <button
              onClick={() => navigate("/admin/categories")}
              className="px-6 py-3 rounded-lg font-medium transition bg-blue-500 text-white hover:bg-blue-600"
            >
              Manage Categories →
            </button>
            <button
              onClick={() => navigate("/admin/tags")}
              className="px-6 py-3 rounded-lg font-medium transition bg-purple-500 text-white hover:bg-purple-600"
            >
              Manage Tags →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateEvent;