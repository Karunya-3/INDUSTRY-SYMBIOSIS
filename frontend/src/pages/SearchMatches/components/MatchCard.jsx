import React from 'react';
import MatchScoreGauge from './MatchScoreGauge';
import { RESOURCE_CATEGORIES } from '../../../constants/categories';

const MatchCard = ({ match }) => {
  const resource = match.resource || match;
  const category = RESOURCE_CATEGORIES.find(c => c.value === resource.category);

  return (
    <div className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow p-6">
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center space-x-2">
          <span className="text-2xl">{category?.icon || '📦'}</span>
          <span className="px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
            {resource.resource_type === 'waste' ? 'Waste Output' : 'Resource Input'}
          </span>
        </div>
        <MatchScoreGauge score={match.score} />
      </div>

      <h3 className="text-xl font-semibold mb-2">{resource.title}</h3>
      <p className="text-gray-600 mb-2">{resource.company_name}</p>
      <p className="text-gray-500 text-sm mb-4">{resource.description}</p>

      {/* Specifications */}
      {Object.keys(resource.specifications || {}).length > 0 && (
        <div className="mb-4">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Specifications:</h4>
          <div className="flex flex-wrap gap-2">
            {Object.entries(resource.specifications).slice(0, 3).map(([key, value]) => (
              <span key={key} className="text-xs bg-gray-100 px-2 py-1 rounded">
                {key}: {value}
              </span>
            ))}
            {Object.keys(resource.specifications).length > 3 && (
              <span className="text-xs text-gray-500">
                +{Object.keys(resource.specifications).length - 3} more
              </span>
            )}
          </div>
        </div>
      )}

      {/* Quantity and Location */}
      <div className="flex justify-between items-center text-sm text-gray-500 mt-4 pt-4 border-t">
        <div>
          {resource.quantity && resource.unit && (
            <span>Quantity: {resource.quantity} {resource.unit}</span>
          )}
        </div>
        <div className="flex items-center">
          <span className="mr-1">📍</span>
          {resource.location}
        </div>
      </div>

      {/* Actions */}
      <div className="mt-4">
        <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          Contact {resource.company_name}
        </button>
      </div>
    </div>
  );
};

export default MatchCard;