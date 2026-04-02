import React, { useState, useEffect } from 'react';
import SearchFilters from './components/SearchFilters';
import ResultsGrid from './components/ResultsGrid';
import { searchService } from '../../services/search';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const SearchMatches = () => {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    resource_type: '',
    category: '',
    max_distance: 100,
    min_score: 0
  });
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [searchPerformed, setSearchPerformed] = useState(false);

  // Single auth check - trust AuthContext as source of truth
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      console.log('User not authenticated, redirecting to login...');
      navigate('/login', { replace: true });
    }
  }, [isAuthenticated, authLoading, navigate]);

  // Load matches if resource ID is provided in URL params
  useEffect(() => {
    const resourceId = searchParams.get('resource');
    if (resourceId && isAuthenticated) {
      loadMatchesForResource(resourceId);
    }
  }, [searchParams, isAuthenticated]);

  const loadMatchesForResource = async (resourceId) => {
    try {
      setLoading(true);
      const data = await searchService.findMatchesForResource(resourceId);
      setMatches(data.matches);
      setTotal(data.total);
      setSearchPerformed(true);
    } catch (error) {
      console.error('Error loading matches:', error);
      if (error.response?.status === 401) {
        navigate('/login', { replace: true });
      } else {
        alert(error.error || 'Failed to load matches');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      alert('Please enter a search query');
      return;
    }

    try {
      setLoading(true);
      const data = await searchService.search(searchQuery, filters);
      setMatches(data.matches);
      setTotal(data.total);
      setSearchPerformed(true);
    } catch (error) {
      console.error('Error searching:', error);
      if (error.response?.status === 401) {
        navigate('/login', { replace: true });
      } else {
        alert(error.error || 'Search failed');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    if (searchPerformed && searchQuery) {
      handleSearch();
    }
  };

  // Show loading while AuthContext is initializing
  if (authLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  // Don't render if not authenticated (redirect will fire from useEffect)
  if (!isAuthenticated) {
    return null;
  }

  return (
    
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Find Matches</h1>

        {/* Search Bar */}
        <div className="mb-8">
          <div className="flex space-x-4">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="Describe what you're looking for... (e.g., 'I need waste heat for heating' or 'Looking for metal scrap')"
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={handleSearch}
              disabled={loading}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Searching...' : 'Search'}
            </button>
          </div>
          <p className="text-sm text-gray-500 mt-2">
            Our AI understands natural language - try describing what you need or have in everyday terms!
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar */}
          <div className="lg:w-80">
            <SearchFilters filters={filters} onFilterChange={handleFilterChange} />
          </div>

          {/* Results */}
          <div className="flex-1">
            <ResultsGrid
              matches={matches}
              loading={loading}
              total={total}
              searchPerformed={searchPerformed}
            />
          </div>
        </div>
      </div>
    
  );
};

export default SearchMatches;