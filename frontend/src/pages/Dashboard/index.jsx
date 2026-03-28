import React from 'react';
import { Routes, Route } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { useAuth } from '../../context/AuthContext';

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
  const { user } = useAuth();
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">My Profile</h1>
      <div className="bg-white rounded-lg shadow p-6">
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-500">Company Name</label>
            <p className="text-lg">{user?.company_name}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">Email</label>
            <p className="text-lg">{user?.email}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">User Type</label>
            <p className="text-lg capitalize">{user?.user_type}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">Industry</label>
            <p className="text-lg">{user?.industry}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">Location</label>
            <p className="text-lg">{user?.location}</p>
          </div>
        </div>
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
        <button className="mt-4 btn-primary">Create New Listing</button>
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