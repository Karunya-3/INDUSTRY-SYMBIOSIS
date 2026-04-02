import React, { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { useAuth } from '../../context/AuthContext';
import { useResources } from '../../context/ResourceContext';
import { searchService } from '../../services/search';
import ResourceList from './components/ResourceList';
import api from '../../services/api';

const DashboardHome = () => {
  const { user } = useAuth();
  const { resources } = useResources();
  const [dashboardMatches, setDashboardMatches] = useState([]);
  const [stats, setStats] = useState({
    total_matches: 0,
    resources_count: 0,
    top_score: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const data = await searchService.getDashboardMatches();
      setDashboardMatches(data.matches);
      setStats(data.stats);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const wasteCount = resources.filter(r => r.resource_type === 'waste').length;
  const resourceCount = resources.filter(r => r.resource_type === 'resource').length;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-2">Welcome, {user?.company_name}!</h3>
          <p className="text-gray-600">Your dashboard is ready. Start exploring symbiosis opportunities.</p>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-2">Your Resources</h3>
          <div className="space-y-2">
            <p className="text-gray-600">Waste Outputs: {wasteCount}</p>
            <p className="text-gray-600">Resource Inputs: {resourceCount}</p>
            <p className="text-gray-600">Total Listings: {resources.length}</p>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-2">Match Statistics</h3>
          <div className="space-y-2">
            <p className="text-gray-600">Total Matches: {stats.total_matches}</p>
            <p className="text-gray-600">Highest Score: {stats.top_score}%</p>
            <p className="text-gray-600">Active Resources: {resources.filter(r => r.status === 'active').length}</p>
          </div>
        </div>
      </div>

      {/* Top Matches Preview */}
      {dashboardMatches.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-bold mb-4">Top Matches for You</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {dashboardMatches.slice(0, 4).map((match, index) => (
              <div key={index} className="bg-white rounded-lg shadow p-4">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-semibold">{match.resource?.title}</h3>
                    <p className="text-sm text-gray-600">{match.resource?.company_name}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-green-600">{Math.round(match.score)}%</div>
                    <div className="text-xs text-gray-500">Match Score</div>
                  </div>
                </div>
                <p className="text-sm text-gray-500 mt-2">
                  {match.source_resource?.resource_type === 'waste' ? 'Your waste matches with:' : 'Your need matches with:'}
                </p>
                <button 
                  onClick={() => window.location.href = `/dashboard/matches?resource=${match.source_resource?._id}`}
                  className="mt-3 text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  View Details →
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-3">Getting Started</h3>
          <ul className="space-y-2 text-gray-600">
            <li>✓ Complete your profile</li>
            <li>{resources.length === 0 ? '○' : '✓'} Create your first listing</li>
            <li>{dashboardMatches.length === 0 ? '○' : '✓'} Explore matches</li>
          </ul>
          {resources.length === 0 && (
            <button 
              onClick={() => document.querySelector('[data-add-resource]')?.click()}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
            >
              Create Your First Listing
            </button>
          )}
        </div>
        
        <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-3">Quick Tip</h3>
          <p className="text-gray-700 mb-3">
            Our AI-powered search understands natural language. Try describing what you have or need in everyday terms!
          </p>
          <p className="text-sm text-gray-600 italic">
            Example: "I have excess heat from our manufacturing process" or "Looking for metal scrap for recycling"
          </p>
        </div>
      </div>
    </div>
  );
};

const Profile = () => {
  const { user, setUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    company_name: user?.company_name || '',
    email: user?.email || '',
    industry: user?.industry || '',
    location: user?.location || ''
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await api.put('/users/profile', formData);
      setUser(response.data.user);
      setIsEditing(false);
      alert('Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile:', error);
      alert(error.response?.data?.error || 'Failed to update profile.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      company_name: user?.company_name || '',
      email: user?.email || '',
      industry: user?.industry || '',
      location: user?.location || ''
    });
    setIsEditing(false);
  };

  if (!user) {
    return <div className="flex justify-center items-center h-64">Loading...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">My Profile</h1>
        {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Edit Profile
          </button>
        )}
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        {!isEditing ? (
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-500">Company Name</label>
              <p className="text-lg">{user.company_name || 'Not specified'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Email</label>
              <p className="text-lg">{user.email}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">User Type</label>
              <p className="text-lg capitalize">{user.user_type}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Industry</label>
              <p className="text-lg">{user.industry || 'Not specified'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Location</label>
              <p className="text-lg">{user.location || 'Not specified'}</p>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Company Name
              </label>
              <input
                type="text"
                name="company_name"
                value={formData.company_name}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Industry
              </label>
              <input
                type="text"
                name="industry"
                value={formData.industry}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Location
              </label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex space-x-3 pt-4">
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
              >
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
              <button
                type="button"
                onClick={handleCancel}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

const Matches = () => {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Your Matches</h1>
      <div className="bg-white rounded-lg shadow p-6">
        <p className="text-gray-600">Use the search page to find matches for your resources!</p>
        <button 
          onClick={() => window.location.href = '/dashboard/search'}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Go to Search
        </button>
      </div>
    </div>
  );
};

const Messages = () => {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Messages</h1>
      <div className="bg-white rounded-lg shadow p-6">
        <p className="text-gray-600">No messages yet. Start matching to connect with potential partners!</p>
      </div>
    </div>
  );
};

const Dashboard = () => {
  return (
    <DashboardLayout>
      <Routes>
        <Route path="/" element={<DashboardHome />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/matches" element={<Matches />} />
        <Route path="/listings" element={<ResourceList />} />
        <Route path="/messages" element={<Messages />} />
        <Route path="/search" element={<SearchMatches />} />
      </Routes>
    </DashboardLayout>
  );
};

// Import SearchMatches at the top
import SearchMatches from '../SearchMatches/index';

export default Dashboard;