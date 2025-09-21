import React, { useState, useEffect } from 'react';
import { searchService } from '../../services/searchService';

const FilterSidebar = ({ filters, onFilterChange, isVisible, onClose }) => {
  const [availableFilters, setAvailableFilters] = useState({
    contentType: [],
    personality: [],
    industry: [],
    demographic: [],
    geographic: [],
    occasion: [],
    categories: [],
    authors: [],
    tags: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAvailableFilters();
  }, []);

  const loadAvailableFilters = async () => {
    try {
      const response = await searchService.getFilters();
      if (response.success) {
        setAvailableFilters(response.filters);
      }
    } catch (error) {
      console.error('Failed to load filters:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (filterKey, value) => {
    const newFilters = { ...filters };
    
    if (filterKey === 'tags') {
      const currentTags = Array.isArray(filters.tags) ? filters.tags : [];
      if (currentTags.includes(value)) {
        newFilters.tags = currentTags.filter(tag => tag !== value);
      } else {
        newFilters.tags = [...currentTags, value];
      }
    } else {
      newFilters[filterKey] = value;
    }
    
    onFilterChange(newFilters);
  };

  const handleDateChange = (dateType, value) => {
    const newFilters = { ...filters, [dateType]: value };
    onFilterChange(newFilters);
  };

  const FilterSection = ({ title, children, defaultOpen = false }) => {
    const [isOpen, setIsOpen] = useState(defaultOpen);

    return (
      <div className="border-b border-gray-200 dark:border-gray-700 pb-4 mb-4">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center justify-between w-full text-left font-semibold text-gray-900 dark:text-white py-2"
        >
          <span>{title}</span>
          <svg
            className={`h-5 w-5 transform transition-transform ${isOpen ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        {isOpen && <div className="mt-2 space-y-2">{children}</div>}
      </div>
    );
  };

  const CheckboxFilter = ({ value, checked, onChange, label }) => (
    <label className="flex items-center space-x-2 cursor-pointer">
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
      />
      <span className="text-sm text-black dark:text-gray-300">{label}</span>
    </label>
  );

  const SelectFilter = ({ value, onChange, options, placeholder }) => (
    <select
      value={value}
      onChange={onChange}
      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
    >
      <option value="">{placeholder}</option>
      {options.map((option) => (
        <option key={option.value || option.id || option} value={option.value || option.id || option}>
          {option.label || option.name || option}
        </option>
      ))}
    </select>
  );

  if (loading) {
    return (
      <div className={`${isVisible ? 'block' : 'hidden'} lg:block w-full lg:w-80`}>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-6 bg-gray-200 dark:bg-gray-600 rounded w-3/4"></div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-5/6"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Mobile Overlay */}
      {isVisible && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}
      
      <div className={`
        ${isVisible ? 'translate-x-0' : '-translate-x-full'} 
        lg:translate-x-0 fixed lg:static inset-y-0 left-0 z-50 lg:z-auto
        w-80 lg:w-80 transform transition-transform duration-300 ease-in-out
      `}>
        <div className="h-full lg:h-auto bg-white dark:bg-gray-800 rounded-none lg:rounded-lg shadow-lg lg:shadow-sm border-r lg:border border-gray-200 dark:border-gray-700">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 lg:border-b-0">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Filters</h3>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md lg:hidden"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="p-4 h-full lg:h-auto overflow-y-auto">
            {/* Content Type Filter */}
            <FilterSection title="Content Type" defaultOpen>
              {availableFilters.contentType?.map((type) => (
                <CheckboxFilter
                  key={type}
                  value={type}
                  checked={filters.contentType === type}
                  onChange={(e) => handleFilterChange('contentType', e.target.checked ? type : '')}
                  label={type}
                />
              ))}
            </FilterSection>

            {/* Geographic Filter */}
            <FilterSection title="Location">
              <SelectFilter
                value={filters.geographic}
                onChange={(e) => handleFilterChange('geographic', e.target.value)}
                options={availableFilters.geographic?.map(geo => ({ value: geo, label: geo }))}
                placeholder="Select location"
              />
            </FilterSection>

            {/* Industry Filter */}
            <FilterSection title="Industry">
              <SelectFilter
                value={filters.industry}
                onChange={(e) => handleFilterChange('industry', e.target.value)}
                options={availableFilters.industry?.map(ind => ({ value: ind, label: ind }))}
                placeholder="Select industry"
              />
            </FilterSection>

            {/* Personality Filter */}
            <FilterSection title="Personality">
              <SelectFilter
                value={filters.personality}
                onChange={(e) => handleFilterChange('personality', e.target.value)}
                options={availableFilters.personality?.map(per => ({ value: per, label: per }))}
                placeholder="Select personality type"
              />
            </FilterSection>

            {/* Demographic Filter */}
            <FilterSection title="Demographic">
              <SelectFilter
                value={filters.demographic}
                onChange={(e) => handleFilterChange('demographic', e.target.value)}
                options={availableFilters.demographic?.map(dem => ({ value: dem, label: dem }))}
                placeholder="Select demographic"
              />
            </FilterSection>

            {/* Occasion Filter */}
            <FilterSection title="Occasion">
              <SelectFilter
                value={filters.occasion}
                onChange={(e) => handleFilterChange('occasion', e.target.value)}
                options={availableFilters.occasion?.map(occ => ({ value: occ, label: occ }))}
                placeholder="Select occasion"
              />
            </FilterSection>

            {/* Category Filter */}
            <FilterSection title="Category">
              <SelectFilter
                value={filters.category}
                onChange={(e) => handleFilterChange('category', e.target.value)}
                options={availableFilters.categories}
                placeholder="Select category"
              />
            </FilterSection>

            {/* Author Filter */}
            <FilterSection title="Author">
              <SelectFilter
                value={filters.author}
                onChange={(e) => handleFilterChange('author', e.target.value)}
                options={availableFilters.authors}
                placeholder="Select author"
              />
            </FilterSection>

            {/* Tags Filter */}
            <FilterSection title="Tags">
              <div className="max-h-40 overflow-y-auto space-y-2">
                {availableFilters.tags?.slice(0, 20).map((tag) => (
                  <CheckboxFilter
                    key={tag.id}
                    value={tag.slug}
                    checked={Array.isArray(filters.tags) ? filters.tags.includes(tag.slug) : false}
                    onChange={() => handleFilterChange('tags', tag.slug)}
                    label={tag.name}
                  />
                ))}
              </div>
            </FilterSection>

            {/* Date Range Filter */}
            <FilterSection title="Date Range">
              <div className="space-y-2">
                <div>
                  <label className="block text-sm font-medium text-black dark:text-gray-300 mb-1">
                    From
                  </label>
                  <input
                    type="date"
                    value={filters.dateFrom}
                    onChange={(e) => handleDateChange('dateFrom', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-black dark:text-gray-300 mb-1">
                    To
                  </label>
                  <input
                    type="date"
                    value={filters.dateTo}
                    onChange={(e) => handleDateChange('dateTo', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                  />
                </div>
              </div>
            </FilterSection>

            {/* Reading Time Filter */}
            <FilterSection title="Reading Time">
              <SelectFilter
                value={filters.readingTime}
                onChange={(e) => handleFilterChange('readingTime', e.target.value)}
                options={[
                  { value: '0-2', label: 'Quick read (0-2 min)' },
                  { value: '3-5', label: 'Short read (3-5 min)' },
                  { value: '6-10', label: 'Medium read (6-10 min)' },
                  { value: '11-999', label: 'Long read (10+ min)' }
                ]}
                placeholder="Select reading time"
              />
            </FilterSection>

            {/* Featured Filter */}
            <FilterSection title="Featured">
              <CheckboxFilter
                checked={filters.featured === 'true'}
                onChange={(e) => handleFilterChange('featured', e.target.checked ? 'true' : '')}
                label="Featured articles only"
              />
            </FilterSection>
          </div>
        </div>
      </div>
    </>
  );
};

export default FilterSidebar;