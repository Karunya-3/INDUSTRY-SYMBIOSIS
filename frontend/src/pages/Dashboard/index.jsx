import React, { useState } from 'react'; // Add useState import
import { Routes, Route } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

const DashboardHome = () => {
  const { user } = useAuth();
  
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-2">Welcome, {user?.company_name}!</h3>
          <p className="text-gray-600">Your dashboard is ready. Start exploring symbiosis opportunities.</p>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-2">Quick Stats</h3>
          <div className="space-y-2">
            <p className="text-gray-600">Matches: 0</p>
            <p className="text-gray-600">Listings: 0</p>
            <p className="text-gray-600">Messages: 0</p>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-2">Getting Started</h3>
          <ul className="space-y-2 text-gray-600">
            <li>✓ Complete your profile</li>
            <li>○ Create your first listing</li>
            <li>○ Explore matches</li>
          </ul>
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
    // Reset form data to current user data
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
          // View Mode
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
          // Edit Mode
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
        <p className="text-gray-600">No matches found yet. Start creating listings to get matched!</p>
      </div>
    </div>
  );
};

const Listings = () => {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">My Listings</h1>
      <div className="bg-white rounded-lg shadow p-6">
        <p className="text-gray-600">You haven't created any listings yet.</p>
        <button className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Create New Listing</button>
      </div>
    </div>
  );
};

const Messages = () => {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Messages</h1>
      <div className="bg-white rounded-lg shadow p-6">
        <p className="text-gray-600">No messages yet.</p>
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
        <Route path="/listings" element={<Listings />} />
        <Route path="/messages" element={<Messages />} />
      </Routes>
    </DashboardLayout>
  );
};

export default Dashboard;