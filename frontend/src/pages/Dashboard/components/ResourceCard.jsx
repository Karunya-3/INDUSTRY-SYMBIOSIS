import React from 'react';
import { RESOURCE_CATEGORIES } from '../../../constants/categories';

const ResourceCard = ({ resource, onEdit, onDelete, onViewMatches }) => {
  const category = RESOURCE_CATEGORIES.find(c => c.value === resource.category);
  const statusColors = {
    active: 'bg-green-100 text-green-800',
    inactive: 'bg-gray-100 text-gray-800',
    matched: 'bg-blue-100 text-blue-800'
  };

  return (
    <div className="bg-white rounded-lg shadow hover:shadow-md transition-shadow p-6">
      <div className="flex justify-between items-start mb-4">
        <div>
          <div className="flex items-center space-x-2 mb-2">
            <span className="text-2xl">{category?.icon || '📦'}</span>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[resource.status]}`}>
              {resource.status}
            </span>
            <span className="px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
              {resource.resource_type === 'waste' ? 'Waste Output' : 'Resource Input'}
            </span>
          </div>
          <h3 className="text-lg font-semibold">{resource.title}</h3>
        </div>
      </div>

      <p className="text-gray-600 text-sm mb-4 line-clamp-2">{resource.description}</p>

      {/* Specifications */}
      {Object.keys(resource.specifications || {}).length > 0 && (
        <div className="mb-4">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Specifications:</h4>
          <div className="flex flex-wrap gap-2">
            {Object.entries(resource.specifications).map(([key, value]) => (
              <span key={key} className="text-xs bg-gray-100 px-2 py-1 rounded">
                {key}: {value}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Quantity and Unit */}
      {resource.quantity && resource.unit && (
        <div className="mb-4">
          <span className="text-sm text-gray-500">
            Quantity: {resource.quantity} {resource.unit}
          </span>
        </div>
      )}

      {/* Frequency */}
      {resource.frequency && (
        <div className="mb-4">
          <span className="text-sm text-gray-500">
            Frequency: {resource.frequency}
          </span>
        </div>
      )}

      {/* Actions */}
      <div className="flex space-x-2 pt-4 border-t">
        <button
          onClick={() => onViewMatches(resource)}
          className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
        >
          Find Matches
        </button>
        <button
          onClick={() => onEdit(resource)}
          className="px-3 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 text-sm"
        >
          Edit
        </button>
        <button
          onClick={() => onDelete(resource)}
          className="px-3 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 text-sm"
        >
          Delete
        </button>
      </div>
    </div>
  );
};

export default ResourceCard;