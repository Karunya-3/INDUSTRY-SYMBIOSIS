import React from 'react';
import MatchCard from './MatchCard';
import Loader from '../../../components/common/Loader';

const ResultsGrid = ({ matches, loading, total, searchPerformed }) => {
  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <Loader />
      </div>
    );
  }

  if (!searchPerformed) {
    return (
      <div className="flex flex-col items-center justify-center h-96 text-center">
        <div className="text-6xl mb-4">🔍</div>
        <h3 className="text-xl font-semibold mb-2">Start Searching</h3>
        <p className="text-gray-500">
          Describe what you're looking for or what you have to find the perfect match
        </p>
      </div>
    );
  }

  if (matches.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-96 text-center">
        <div className="text-6xl mb-4">😕</div>
        <h3 className="text-xl font-semibold mb-2">No Matches Found</h3>
        <p className="text-gray-500 mb-4">
          We couldn't find any matches for your search. Try adjusting your filters or using different keywords.
        </p>
        <p className="text-sm text-gray-400">
          Tip: Try describing your needs in simpler terms or expand your search radius
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-4 text-gray-600">
        Found {total} potential matches
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {matches.map((match, index) => (
          <MatchCard key={index} match={match} />
        ))}
      </div>
    </div>
  );
};

export default ResultsGrid;