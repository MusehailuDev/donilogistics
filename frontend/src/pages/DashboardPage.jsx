import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { LogOut, User, Settings } from 'lucide-react';
import Logo from '../components/Logo';

const DashboardPage = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Logo size="md" />
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <User className="w-5 h-5 text-gray-400" />
                <span className="text-gray-700">{user.username || 'User'}</span>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
              >
                <LogOut className="w-5 h-5" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Welcome to Doni Logistics Dashboard
            </h1>
            <p className="text-gray-600 mb-8">
              Your logistics management platform is ready. This is a placeholder dashboard.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              <div className="card">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Shipments</h3>
                <p className="text-gray-600">Manage and track your shipments</p>
              </div>
              <div className="card">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Vehicles</h3>
                <p className="text-gray-600">Monitor your fleet and maintenance</p>
              </div>
              <div className="card">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Analytics</h3>
                <p className="text-gray-600">View reports and insights</p>
              </div>
            </div>

            {user.userRole === 'SUPER_ADMIN' && (
              <div className="mt-8">
                <Link to="/admin" className="btn-primary">Go to Super Admin Panel</Link>
              </div>
            )}

            {user.userRole === 'ORGANIZATION_ADMIN' && (
              <div className="mt-6">
                <Link to="/org/users" className="btn-secondary">Manage Organization Users</Link>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default DashboardPage;
