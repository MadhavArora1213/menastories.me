import React, { useState, useEffect } from "react";
import { useTheme } from "../context/ThemeContext";
import { useToast } from "../../context/ToastContext";
import { eventService } from "../services/eventService";

const slugify = (text) =>
  text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\w\-]+/g, "")
    .replace(/\-\-+/g, "-")
    .replace(/^-+/, "")
    .replace(/-+$/, "");

const EventForm = ({
  initialData = null,
  onSubmit,
  isEdit = false,
  loading = false
}) => {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const { showSuccess, showError } = useToast();

  // Utility function to safely format dates for datetime-local input
  const safeDateFormat = (dateValue) => {
    if (!dateValue) return "";
    try {
      const date = new Date(dateValue);
      if (isNaN(date.getTime())) return "";
      return date.toISOString().slice(0, 16);
    } catch (error) {
      return "";
    }
  };

  // Utility function to safely handle numeric values
  const safeNumericValue = (value) => {
    if (value === null || value === undefined || value === "") return "";
    if (typeof value === 'number' && isNaN(value)) return "";
    return value;
  };

  const [formData, setFormData] = useState({
    title: (initialData && initialData.title) || "",
    slug: (initialData && initialData.slug) || "",
    description: (initialData && initialData.description) || "",
    shortDescription: (initialData && initialData.shortDescription) || "",
    eventType: (initialData && initialData.eventType) || "conference",
    category: (initialData && initialData.category) || "business",
    status: (initialData && initialData.status) || "draft",
    startDate: safeDateFormat(initialData && initialData.startDate),
    endDate: safeDateFormat(initialData && initialData.endDate),
    timezone: (initialData && initialData.timezone) || "UTC",
    isVirtual: (initialData && initialData.isVirtual) || false,
    isHybrid: (initialData && initialData.isHybrid) || false,
    capacity: safeNumericValue(initialData && initialData.capacity),
    registrationDeadline: safeDateFormat(initialData && initialData.registrationDeadline),
    price: safeNumericValue(initialData && initialData.price),
    currency: (initialData && initialData.currency) || "USD",
    isFeatured: (initialData && initialData.isFeatured) || false,
    isPublic: (initialData && initialData.isPublic !== undefined) ? initialData.isPublic : true,
    allowRegistration: (initialData && initialData.allowRegistration !== undefined) ? initialData.allowRegistration : true,
    requireRegistration: (initialData && initialData.requireRegistration) || false,
    seoTitle: (initialData && initialData.seoTitle) || "",
    seoDescription: (initialData && initialData.seoDescription) || "",
    // Venue information
    venueName: (initialData && initialData.venue && initialData.venue.name) || "",
    venueAddress: (initialData && initialData.venue && initialData.venue.address) || "",
    venueCity: (initialData && initialData.venue && initialData.venue.city) || "",
    venueCountry: (initialData && initialData.venue && initialData.venue.country) || "",
    // Virtual details
    virtualPlatform: (initialData && initialData.virtualDetails && initialData.virtualDetails.platform) || "",
    virtualMeetingLink: (initialData && initialData.virtualDetails && initialData.virtualDetails.meetingLink) || "",
    virtualAccessCode: (initialData && initialData.virtualDetails && initialData.virtualDetails.accessCode) || "",
    // Contact info
    contactEmail: (initialData && initialData.contactInfo && initialData.contactInfo.email) || "",
    contactPhone: (initialData && initialData.contactInfo && initialData.contactInfo.phone) || "",
    organizer: (initialData && initialData.contactInfo && initialData.contactInfo.organizer) || "",
    // Social links
    website: (initialData && initialData.socialLinks && initialData.socialLinks.website) || "",
    facebook: (initialData && initialData.socialLinks && initialData.socialLinks.facebook) || "",
    twitter: (initialData && initialData.socialLinks && initialData.socialLinks.twitter) || "",
    instagram: (initialData && initialData.socialLinks && initialData.socialLinks.instagram) || "",
    linkedin: (initialData && initialData.socialLinks && initialData.socialLinks.linkedin) || ""
  });

  const [errors, setErrors] = useState({});
  const [tags, setTags] = useState(initialData.tags || []);
  const [newTag, setNewTag] = useState("");

  useEffect(() => {
    if (initialData && (initialData.title || initialData.id)) {
      const newFormData = {
        title: (initialData.title) || "",
        slug: (initialData.slug) || "",
        description: (initialData.description) || "",
        shortDescription: (initialData.shortDescription) || "",
        eventType: (initialData.eventType) || "conference",
        category: (initialData.category) || "business",
        status: (initialData.status) || "draft",
        startDate: safeDateFormat(initialData.startDate),
        endDate: safeDateFormat(initialData.endDate),
        timezone: (initialData.timezone) || "UTC",
        isVirtual: (initialData.isVirtual) || false,
        isHybrid: (initialData.isHybrid) || false,
        capacity: safeNumericValue(initialData.capacity),
        registrationDeadline: safeDateFormat(initialData.registrationDeadline),
        price: safeNumericValue(initialData.price),
        currency: (initialData.currency) || "USD",
        isFeatured: (initialData.isFeatured) || false,
        isPublic: (initialData.isPublic !== undefined) ? initialData.isPublic : true,
        allowRegistration: (initialData.allowRegistration !== undefined) ? initialData.allowRegistration : true,
        requireRegistration: (initialData.requireRegistration) || false,
        seoTitle: (initialData.seoTitle) || "",
        seoDescription: (initialData.seoDescription) || "",
        // Venue information
        venueName: (initialData.venue && initialData.venue.name) || "",
        venueAddress: (initialData.venue && initialData.venue.address) || "",
        venueCity: (initialData.venue && initialData.venue.city) || "",
        venueCountry: (initialData.venue && initialData.venue.country) || "",
        // Virtual details
        virtualPlatform: (initialData.virtualDetails && initialData.virtualDetails.platform) || "",
        virtualMeetingLink: (initialData.virtualDetails && initialData.virtualDetails.meetingLink) || "",
        virtualAccessCode: (initialData.virtualDetails && initialData.virtualDetails.accessCode) || "",
        // Contact info
        contactEmail: (initialData.contactInfo && initialData.contactInfo.email) || "",
        contactPhone: (initialData.contactInfo && initialData.contactInfo.phone) || "",
        organizer: (initialData.contactInfo && initialData.contactInfo.organizer) || "",
        // Social links
        website: (initialData.socialLinks && initialData.socialLinks.website) || "",
        facebook: (initialData.socialLinks && initialData.socialLinks.facebook) || "",
        twitter: (initialData.socialLinks && initialData.socialLinks.twitter) || "",
        instagram: (initialData.socialLinks && initialData.socialLinks.instagram) || "",
        linkedin: (initialData.socialLinks && initialData.socialLinks.linkedin) || ""
      };
      setFormData(newFormData);
      setTags((initialData.tags) || []);
    }
  }, [initialData]);

  const handleTitleChange = (e) => {
    const title = e.target.value;
    setFormData(prev => ({ ...prev, title }));

    // Auto-generate slug
    if (title && !isEdit) {
      const slug = slugify(title);
      setFormData(prev => ({ ...prev, slug }));
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  const addTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags(prev => [...prev, newTag.trim()]);
      setNewTag("");
    }
  };

  const removeTag = (tagToRemove) => {
    setTags(prev => prev.filter(tag => tag !== tagToRemove));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = "Event title is required";
    } else if (formData.title.trim().length < 3) {
      newErrors.title = "Event title must be at least 3 characters";
    } else if (formData.title.trim().length > 200) {
      newErrors.title = "Event title must be less than 200 characters";
    }

    if (!formData.slug.trim()) {
      newErrors.slug = "Event slug is required";
    } else if (!/^[a-z0-9-]+$/.test(formData.slug.trim())) {
      newErrors.slug = "Slug can only contain lowercase letters, numbers, and hyphens";
    }

    if (!formData.startDate) {
      newErrors.startDate = "Start date is required";
    }

    if (!formData.endDate) {
      newErrors.endDate = "End date is required";
    } else if (formData.startDate && formData.endDate < formData.startDate) {
      newErrors.endDate = "End date must be after start date";
    }

    if (formData.capacity && (isNaN(formData.capacity) || formData.capacity < 1)) {
      newErrors.capacity = "Capacity must be a positive number";
    }

    if (formData.price && (isNaN(formData.price) || formData.price < 0)) {
      newErrors.price = "Price must be a non-negative number";
    }

    if (formData.contactEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.contactEmail)) {
      newErrors.contactEmail = "Please enter a valid email address";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (validateForm()) {
      try {
        // Prepare venue data
        const venue = formData.venueName || formData.venueAddress || formData.venueCity || formData.venueCountry ? {
          name: formData.venueName,
          address: formData.venueAddress,
          city: formData.venueCity,
          country: formData.venueCountry
        } : {};

        // Prepare virtual details
        const virtualDetails = formData.virtualPlatform || formData.virtualMeetingLink || formData.virtualAccessCode ? {
          platform: formData.virtualPlatform,
          meetingLink: formData.virtualMeetingLink,
          accessCode: formData.virtualAccessCode
        } : {};

        // Prepare contact info
        const contactInfo = formData.contactEmail || formData.contactPhone || formData.organizer ? {
          email: formData.contactEmail,
          phone: formData.contactPhone,
          organizer: formData.organizer
        } : {};

        // Prepare social links
        const socialLinks = formData.website || formData.facebook || formData.twitter || formData.instagram || formData.linkedin ? {
          website: formData.website,
          facebook: formData.facebook,
          twitter: formData.twitter,
          instagram: formData.instagram,
          linkedin: formData.linkedin
        } : {};

        const submitData = {
          title: formData.title,
          slug: formData.slug,
          description: formData.description,
          shortDescription: formData.shortDescription,
          eventType: formData.eventType,
          category: formData.category,
          status: formData.status,
          startDate: formData.startDate,
          endDate: formData.endDate,
          timezone: formData.timezone,
          venue,
          isVirtual: formData.isVirtual,
          virtualDetails,
          isHybrid: formData.isHybrid,
          capacity: formData.capacity && !isNaN(formData.capacity) ? parseInt(formData.capacity) : null,
          registrationDeadline: formData.registrationDeadline || null,
          price: formData.price && !isNaN(formData.price) ? parseFloat(formData.price) : null,
          currency: formData.currency,
          tags,
          socialLinks,
          contactInfo,
          isFeatured: formData.isFeatured,
          isPublic: formData.isPublic,
          allowRegistration: formData.allowRegistration,
          requireRegistration: formData.requireRegistration,
          seoTitle: formData.seoTitle,
          seoDescription: formData.seoDescription
        };

        await onSubmit(submitData);
      } catch (error) {
        console.error('Form submission error:', error);
        showError(error.response?.data?.message || error.message || 'An error occurred while saving the event.');
      }
    }
  };

  const textMain = isDark ? "text-white" : "text-black";
  const subText = isDark ? "text-gray-300" : "text-gray-600";
  const errorText = "text-red-500";
  const labelClass = `block text-sm font-medium mb-2 ${textMain}`;
  const inputBaseClass = `w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition ${isDark ? "bg-gray-800 text-white border-gray-600 placeholder-gray-400" : "bg-white text-black border-gray-300 placeholder-gray-500"}`;
  const errorClass = `border-red-500 focus:ring-red-500`;

  const eventTypes = [
    'conference', 'seminar', 'workshop', 'networking', 'trade_show', 'award_show',
    'concert', 'festival', 'exhibition', 'charity_gala', 'masterclass', 'fashion_show',
    'wellness_event', 'food_festival', 'travel_expo', 'cultural_event', 'community_event', 'fundraiser'
  ];

  const categories = [
    'business', 'entertainment', 'cultural', 'social', 'educational', 'fashion',
    'lifestyle', 'technology', 'health', 'sports'
  ];

  const statuses = ['draft', 'published', 'cancelled', 'postponed', 'completed'];

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Basic Information */}
      <div className="space-y-6">
        <h3 className={`text-lg font-semibold ${textMain}`}>Basic Information</h3>

        {/* Title */}
        <div>
          <label htmlFor="title" className={labelClass}>
            Event Title *
          </label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleTitleChange}
            className={`${inputBaseClass} ${errors.title ? errorClass : ""}`}
            placeholder="Enter event title"
            disabled={loading}
          />
          {errors.title && <p className={`mt-1 text-sm ${errorText}`}>{errors.title}</p>}
        </div>

        {/* Slug */}
        <div>
          <label htmlFor="slug" className={labelClass}>
            Event Slug *
          </label>
          <input
            type="text"
            id="slug"
            name="slug"
            value={formData.slug}
            onChange={handleInputChange}
            className={`${inputBaseClass} ${errors.slug ? errorClass : ""} ${isEdit ? "" : "bg-gray-100 dark:bg-gray-800"}`}
            placeholder="Auto-generated from title"
            disabled={loading || !isEdit}
            readOnly={!isEdit}
          />
          {errors.slug && <p className={`mt-1 text-sm ${errorText}`}>{errors.slug}</p>}
          <p className={`mt-1 text-xs ${subText}`}>{!isEdit ? "Auto-generated from event title" : "URL-friendly identifier"}</p>
        </div>

        {/* Description */}
        <div>
          <label htmlFor="description" className={labelClass}>
            Description
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            rows="4"
            className={`${inputBaseClass} ${errors.description ? errorClass : ""}`}
            placeholder="Enter event description"
            disabled={loading}
          />
        </div>

        {/* Short Description */}
        <div>
          <label htmlFor="shortDescription" className={labelClass}>
            Short Description
          </label>
          <textarea
            id="shortDescription"
            name="shortDescription"
            value={formData.shortDescription}
            onChange={handleInputChange}
            rows="2"
            className={`${inputBaseClass} ${errors.shortDescription ? errorClass : ""}`}
            placeholder="Brief summary for listings"
            disabled={loading}
          />
          <p className={`mt-1 text-xs ${subText}`}>{(formData.shortDescription || "").length}/300 characters</p>
        </div>
      </div>

      {/* Event Details */}
      <div className="space-y-6">
        <h3 className={`text-lg font-semibold ${textMain}`}>Event Details</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Event Type */}
          <div>
            <label htmlFor="eventType" className={labelClass}>
              Event Type *
            </label>
            <select
              id="eventType"
              name="eventType"
              value={formData.eventType}
              onChange={handleInputChange}
              className={`${inputBaseClass} ${errors.eventType ? errorClass : ""}`}
              disabled={loading}
            >
              {eventTypes.map(type => (
                <option key={type} value={type}>
                  {type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </option>
              ))}
            </select>
          </div>

          {/* Category */}
          <div>
            <label htmlFor="category" className={labelClass}>
              Category *
            </label>
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleInputChange}
              className={`${inputBaseClass} ${errors.category ? errorClass : ""}`}
              disabled={loading}
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>
                  {cat.charAt(0).toUpperCase() + cat.slice(1)}
                </option>
              ))}
            </select>
          </div>

          {/* Status */}
          <div>
            <label htmlFor="status" className={labelClass}>
              Status *
            </label>
            <select
              id="status"
              name="status"
              value={formData.status}
              onChange={handleInputChange}
              className={`${inputBaseClass} ${errors.status ? errorClass : ""}`}
              disabled={loading}
            >
              {statuses.map(status => (
                <option key={status} value={status}>
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </option>
              ))}
            </select>
          </div>

          {/* Timezone */}
          <div>
            <label htmlFor="timezone" className={labelClass}>
              Timezone
            </label>
            <select
              id="timezone"
              name="timezone"
              value={formData.timezone}
              onChange={handleInputChange}
              className={`${inputBaseClass} ${errors.timezone ? errorClass : ""}`}
              disabled={loading}
            >
              <option value="UTC">UTC</option>
              <option value="America/New_York">Eastern Time</option>
              <option value="America/Chicago">Central Time</option>
              <option value="America/Denver">Mountain Time</option>
              <option value="America/Los_Angeles">Pacific Time</option>
              <option value="Europe/London">London</option>
              <option value="Europe/Paris">Paris</option>
              <option value="Asia/Dubai">Dubai</option>
              <option value="Asia/Kolkata">India</option>
              <option value="Asia/Tokyo">Tokyo</option>
              <option value="Australia/Sydney">Sydney</option>
            </select>
          </div>
        </div>

        {/* Dates */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="startDate" className={labelClass}>
              Start Date & Time *
            </label>
            <input
              type="datetime-local"
              id="startDate"
              name="startDate"
              value={formData.startDate}
              onChange={handleInputChange}
              className={`${inputBaseClass} ${errors.startDate ? errorClass : ""}`}
              disabled={loading}
            />
            {errors.startDate && <p className={`mt-1 text-sm ${errorText}`}>{errors.startDate}</p>}
          </div>

          <div>
            <label htmlFor="endDate" className={labelClass}>
              End Date & Time *
            </label>
            <input
              type="datetime-local"
              id="endDate"
              name="endDate"
              value={formData.endDate}
              onChange={handleInputChange}
              className={`${inputBaseClass} ${errors.endDate ? errorClass : ""}`}
              disabled={loading}
            />
            {errors.endDate && <p className={`mt-1 text-sm ${errorText}`}>{errors.endDate}</p>}
          </div>
        </div>
      </div>

      {/* Venue & Virtual Details */}
      <div className="space-y-6">
        <h3 className={`text-lg font-semibold ${textMain}`}>Venue & Access</h3>

        {/* Virtual/Hybrid Options */}
        <div className="space-y-4">
          <div className="flex items-center space-x-6">
            <label className={`flex items-center ${textMain}`}>
              <input
                type="checkbox"
                name="isVirtual"
                checked={formData.isVirtual}
                onChange={handleInputChange}
                className="mr-2"
                disabled={loading}
              />
              Virtual Event
            </label>
            <label className={`flex items-center ${textMain}`}>
              <input
                type="checkbox"
                name="isHybrid"
                checked={formData.isHybrid}
                onChange={handleInputChange}
                className="mr-2"
                disabled={loading}
              />
              Hybrid Event
            </label>
          </div>
        </div>

        {/* Venue Information */}
        {!formData.isVirtual && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="venueName" className={labelClass}>
                Venue Name
              </label>
              <input
                type="text"
                id="venueName"
                name="venueName"
                value={formData.venueName}
                onChange={handleInputChange}
                className={inputBaseClass}
                placeholder="Venue name"
                disabled={loading}
              />
            </div>
            <div>
              <label htmlFor="venueAddress" className={labelClass}>
                Address
              </label>
              <input
                type="text"
                id="venueAddress"
                name="venueAddress"
                value={formData.venueAddress}
                onChange={handleInputChange}
                className={inputBaseClass}
                placeholder="Street address"
                disabled={loading}
              />
            </div>
            <div>
              <label htmlFor="venueCity" className={labelClass}>
                City
              </label>
              <input
                type="text"
                id="venueCity"
                name="venueCity"
                value={formData.venueCity}
                onChange={handleInputChange}
                className={inputBaseClass}
                placeholder="City"
                disabled={loading}
              />
            </div>
            <div>
              <label htmlFor="venueCountry" className={labelClass}>
                Country
              </label>
              <input
                type="text"
                id="venueCountry"
                name="venueCountry"
                value={formData.venueCountry}
                onChange={handleInputChange}
                className={inputBaseClass}
                placeholder="Country"
                disabled={loading}
              />
            </div>
          </div>
        )}

        {/* Virtual Details */}
        {formData.isVirtual && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label htmlFor="virtualPlatform" className={labelClass}>
                Platform
              </label>
              <select
                id="virtualPlatform"
                name="virtualPlatform"
                value={formData.virtualPlatform}
                onChange={handleInputChange}
                className={inputBaseClass}
                disabled={loading}
              >
                <option value="">Select Platform</option>
                <option value="zoom">Zoom</option>
                <option value="teams">Microsoft Teams</option>
                <option value="meet">Google Meet</option>
                <option value="webex">Webex</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label htmlFor="virtualMeetingLink" className={labelClass}>
                Meeting Link
              </label>
              <input
                type="url"
                id="virtualMeetingLink"
                name="virtualMeetingLink"
                value={formData.virtualMeetingLink}
                onChange={handleInputChange}
                className={inputBaseClass}
                placeholder="https://..."
                disabled={loading}
              />
            </div>
            <div>
              <label htmlFor="virtualAccessCode" className={labelClass}>
                Access Code
              </label>
              <input
                type="text"
                id="virtualAccessCode"
                name="virtualAccessCode"
                value={formData.virtualAccessCode}
                onChange={handleInputChange}
                className={inputBaseClass}
                placeholder="Meeting password"
                disabled={loading}
              />
            </div>
          </div>
        )}
      </div>

      {/* Registration & Pricing */}
      <div className="space-y-6">
        <h3 className={`text-lg font-semibold ${textMain}`}>Registration & Pricing</h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label htmlFor="capacity" className={labelClass}>
              Capacity
            </label>
            <input
              type="number"
              id="capacity"
              name="capacity"
              value={formData.capacity}
              onChange={handleInputChange}
              className={`${inputBaseClass} ${errors.capacity ? errorClass : ""}`}
              placeholder="0"
              min="1"
              disabled={loading}
            />
            {errors.capacity && <p className={`mt-1 text-sm ${errorText}`}>{errors.capacity}</p>}
          </div>

          <div>
            <label htmlFor="price" className={labelClass}>
              Price
            </label>
            <input
              type="number"
              id="price"
              name="price"
              value={formData.price}
              onChange={handleInputChange}
              className={`${inputBaseClass} ${errors.price ? errorClass : ""}`}
              placeholder="0.00"
              min="0"
              step="0.01"
              disabled={loading}
            />
            {errors.price && <p className={`mt-1 text-sm ${errorText}`}>{errors.price}</p>}
          </div>

          <div>
            <label htmlFor="currency" className={labelClass}>
              Currency
            </label>
            <select
              id="currency"
              name="currency"
              value={formData.currency}
              onChange={handleInputChange}
              className={inputBaseClass}
              disabled={loading}
            >
              <option value="USD">USD ($)</option>
              <option value="EUR">EUR (€)</option>
              <option value="GBP">GBP (£)</option>
              <option value="AED">AED (د.إ)</option>
              <option value="INR">INR (₹)</option>
            </select>
          </div>
        </div>

        <div>
          <label htmlFor="registrationDeadline" className={labelClass}>
            Registration Deadline
          </label>
          <input
            type="datetime-local"
            id="registrationDeadline"
            name="registrationDeadline"
            value={formData.registrationDeadline}
            onChange={handleInputChange}
            className={inputBaseClass}
            disabled={loading}
          />
        </div>

        {/* Registration Settings */}
        <div className="space-y-4">
          <div className="flex items-center space-x-6">
            <label className={`flex items-center ${textMain}`}>
              <input
                type="checkbox"
                name="allowRegistration"
                checked={formData.allowRegistration}
                onChange={handleInputChange}
                className="mr-2"
                disabled={loading}
              />
              Allow Registration
            </label>
            <label className={`flex items-center ${textMain}`}>
              <input
                type="checkbox"
                name="requireRegistration"
                checked={formData.requireRegistration}
                onChange={handleInputChange}
                className="mr-2"
                disabled={loading}
              />
              Require Registration
            </label>
          </div>
        </div>
      </div>

      {/* Tags */}
      <div className="space-y-6">
        <h3 className={`text-lg font-semibold ${textMain}`}>Tags</h3>

        <div>
          <label className={labelClass}>
            Event Tags
          </label>
          <div className="flex gap-2 mb-3">
            <input
              type="text"
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
              className={`${inputBaseClass} flex-1`}
              placeholder="Add a tag"
              disabled={loading}
            />
            <button
              type="button"
              onClick={addTag}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                isDark ? "bg-blue-600 hover:bg-blue-700 text-white" : "bg-blue-500 hover:bg-blue-600 text-white"
              }`}
              disabled={loading || !newTag.trim()}
            >
              Add
            </button>
          </div>

          <div className="flex flex-wrap gap-2">
            {tags.map((tag, index) => (
              <span
                key={index}
                className={`inline-flex items-center px-3 py-1 rounded-full text-sm ${
                  isDark ? "bg-blue-500/20 text-blue-400" : "bg-blue-100 text-blue-800"
                }`}
              >
                {tag}
                <button
                  type="button"
                  onClick={() => removeTag(tag)}
                  className={`ml-2 ${isDark ? "text-blue-400 hover:text-blue-300" : "text-blue-600 hover:text-blue-800"}`}
                  disabled={loading}
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Contact Information */}
      <div className="space-y-6">
        <h3 className={`text-lg font-semibold ${textMain}`}>Contact Information</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="contactEmail" className={labelClass}>
              Contact Email
            </label>
            <input
              type="email"
              id="contactEmail"
              name="contactEmail"
              value={formData.contactEmail}
              onChange={handleInputChange}
              className={`${inputBaseClass} ${errors.contactEmail ? errorClass : ""}`}
              placeholder="contact@example.com"
              disabled={loading}
            />
            {errors.contactEmail && <p className={`mt-1 text-sm ${errorText}`}>{errors.contactEmail}</p>}
          </div>

          <div>
            <label htmlFor="contactPhone" className={labelClass}>
              Contact Phone
            </label>
            <input
              type="tel"
              id="contactPhone"
              name="contactPhone"
              value={formData.contactPhone}
              onChange={handleInputChange}
              className={inputBaseClass}
              placeholder="+1 (555) 123-4567"
              disabled={loading}
            />
          </div>

          <div className="md:col-span-2">
            <label htmlFor="organizer" className={labelClass}>
              Organizer
            </label>
            <input
              type="text"
              id="organizer"
              name="organizer"
              value={formData.organizer}
              onChange={handleInputChange}
              className={inputBaseClass}
              placeholder="Organization or person name"
              disabled={loading}
            />
          </div>
        </div>
      </div>

      {/* Social Links */}
      <div className="space-y-6">
        <h3 className={`text-lg font-semibold ${textMain}`}>Social Links</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="website" className={labelClass}>
              Website
            </label>
            <input
              type="url"
              id="website"
              name="website"
              value={formData.website}
              onChange={handleInputChange}
              className={inputBaseClass}
              placeholder="https://example.com"
              disabled={loading}
            />
          </div>

          <div>
            <label htmlFor="facebook" className={labelClass}>
              Facebook
            </label>
            <input
              type="url"
              id="facebook"
              name="facebook"
              value={formData.facebook}
              onChange={handleInputChange}
              className={inputBaseClass}
              placeholder="https://facebook.com/page"
              disabled={loading}
            />
          </div>

          <div>
            <label htmlFor="twitter" className={labelClass}>
              Twitter
            </label>
            <input
              type="url"
              id="twitter"
              name="twitter"
              value={formData.twitter}
              onChange={handleInputChange}
              className={inputBaseClass}
              placeholder="https://twitter.com/handle"
              disabled={loading}
            />
          </div>

          <div>
            <label htmlFor="instagram" className={labelClass}>
              Instagram
            </label>
            <input
              type="url"
              id="instagram"
              name="instagram"
              value={formData.instagram}
              onChange={handleInputChange}
              className={inputBaseClass}
              placeholder="https://instagram.com/handle"
              disabled={loading}
            />
          </div>

          <div>
            <label htmlFor="linkedin" className={labelClass}>
              LinkedIn
            </label>
            <input
              type="url"
              id="linkedin"
              name="linkedin"
              value={formData.linkedin}
              onChange={handleInputChange}
              className={inputBaseClass}
              placeholder="https://linkedin.com/company/page"
              disabled={loading}
            />
          </div>
        </div>
      </div>

      {/* SEO Settings */}
      <div className="space-y-6">
        <h3 className={`text-lg font-semibold ${textMain}`}>SEO Settings</h3>

        <div>
          <label htmlFor="seoTitle" className={labelClass}>
            SEO Title
          </label>
          <input
            type="text"
            id="seoTitle"
            name="seoTitle"
            value={formData.seoTitle}
            onChange={handleInputChange}
            className={inputBaseClass}
            placeholder="SEO title for search engines"
            maxLength="60"
            disabled={loading}
          />
          <p className={`mt-1 text-xs ${subText}`}>{(formData.seoTitle || "").length}/60 characters</p>
        </div>

        <div>
          <label htmlFor="seoDescription" className={labelClass}>
            SEO Description
          </label>
          <textarea
            id="seoDescription"
            name="seoDescription"
            value={formData.seoDescription}
            onChange={handleInputChange}
            rows="2"
            className={inputBaseClass}
            placeholder="SEO description for search engines"
            maxLength="160"
            disabled={loading}
          />
          <p className={`mt-1 text-xs ${subText}`}>{(formData.seoDescription || "").length}/160 characters</p>
        </div>
      </div>

      {/* Settings */}
      <div className="space-y-6">
        <h3 className={`text-lg font-semibold ${textMain}`}>Settings</h3>

        <div className="space-y-4">
          <label className={`flex items-center ${textMain}`}>
            <input
              type="checkbox"
              name="isFeatured"
              checked={formData.isFeatured}
              onChange={handleInputChange}
              className="mr-2"
              disabled={loading}
            />
            Featured Event
          </label>

          <label className={`flex items-center ${textMain}`}>
            <input
              type="checkbox"
              name="isPublic"
              checked={formData.isPublic}
              onChange={handleInputChange}
              className="mr-2"
              disabled={loading}
            />
            Public Event
          </label>
        </div>
      </div>

      {/* Submit Button */}
      <div className="pt-6">
        <button
          type="submit"
          disabled={loading}
          className={`w-full py-3 px-6 rounded-lg font-bold text-lg transition-all duration-200 ${
            loading
              ? "opacity-50 cursor-not-allowed"
              : "hover:scale-105 active:scale-95"
          } ${
            isDark
              ? "bg-white text-black hover:bg-gray-200"
              : "bg-black text-white hover:bg-gray-900"
          }`}
        >
          {loading ? (
            <div className="flex items-center justify-center gap-2">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-current"></div>
              {isEdit ? "Updating..." : "Creating..."}
            </div>
          ) : (
            <div className="flex items-center justify-center gap-2">
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                {isEdit ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 4v16m8-8H4"
                  />
                )}
              </svg>
              {isEdit ? "Update Event" : "Create Event"}
            </div>
          )}
        </button>
      </div>
    </form>
  );
};

export default EventForm;