import React from 'react';
import { RESOURCE_TYPES, RESOURCE_CATEGORIES } from '../../../constants/categories';

const SearchFilters = ({ filters, onFilterChange }) => {
  const handleChange = (key, value) => {
    onFilterChange({
      ...filters,
      [key]: value
    });
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold mb-4">Filters</h3>

      {/* Resource Type */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Resource Type
        </label>
        <select
          value={filters.resource_type}
          onChange={(e) => handleChange('resource_type', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All Types</option>
          {RESOURCE_TYPES.map(type => (
            <option key={type.value} value={type.value}>{type.label}</option>
          ))}
        </select>
      </div>

      {/* Category */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Category
        </label>
        <select
          value={filters.category}
          onChange={(e) => handleChange('category', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All Categories</option>
          {RESOURCE_CATEGORIES.map(cat => (
            <option key={cat.value} value={cat.value}>
              {cat.icon} {cat.label}
            </option>
          ))}
        </select>
      </div>

      {/* Max Distance */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Max Distance: {filters.max_distance} km
        </label>
        <input
          type="range"
          min="0"
          max="500"
          step="10"
          value={filters.max_distance}
          onChange={(e) => handleChange('max_distance', parseInt(e.target.value))}
          className="w-full"
        />
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>0 km</span>
          <span>100 km</span>
          <span>200 km</span>
          <span>300 km</span>
          <span>400 km</span>
          <span>500 km</span>
        </div>
      </div>

      {/* Minimum Score */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Minimum Match Score: {filters.min_score}%
        </label>
        <input
          type="range"
          min="0"
          max="100"
          step="5"
          value={filters.min_score}
          onChange={(e) => handleChange('min_score', parseInt(e.target.value))}
          className="w-full"
        />
      </div>

      {/* Reset Filters */}
      <button
        onClick={() => {
          onFilterChange({
            resource_type: '',
            category: '',
            max_distance: 100,
            min_score: 0
          });
        }}
        className="w-full px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
      >
        Reset Filters
      </button>
    </div>
  );
};

export default SearchFilters;