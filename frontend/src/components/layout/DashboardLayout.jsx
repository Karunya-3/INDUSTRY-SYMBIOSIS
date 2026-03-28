import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';

const DashboardLayout = ({ children }) => {
  const location = useLocation();
  
  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: '📊' },
    { name: 'My Profile', href: '/dashboard/profile', icon: '👤' },
    { name: 'Matches', href: '/dashboard/matches', icon: '🤝' },
    { name: 'Listings', href: '/dashboard/listings', icon: '📋' },
    { name: 'Messages', href: '/dashboard/messages', icon: '💬' },
  ];
  
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 bg-white shadow-md min-h-screen hidden md:block">
          <nav className="mt-8">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`
                    flex items-center px-6 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600
                    ${isActive ? 'bg-blue-50 text-blue-600 border-r-4 border-blue-600' : ''}
                  `}
                >
                  <span className="mr-3">{item.icon}</span>
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </aside>
        
        {/* Main Content */}
        <main className="flex-1 p-8">
          {children}
        </main>
      </div>
      <Footer />
    </div>
  );
};

export default DashboardLayout;