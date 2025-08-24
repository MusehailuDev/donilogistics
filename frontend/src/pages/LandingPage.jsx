import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Logo from '../components/Logo';

const LandingPage = () => {
  const navigate = useNavigate();
  const [trackingNumber, setTrackingNumber] = useState('');

  const handleTrackingSubmit = (e) => {
    e.preventDefault();
    if (trackingNumber.trim()) {
      navigate(`/track/${encodeURIComponent(trackingNumber.trim())}`);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="sticky top-0 z-50">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <div className="mt-4 rounded-2xl border border-white/20 bg-white/60 backdrop-blur-xl shadow-lg shadow-blue-500/10">
            <div className="flex justify-between items-center h-20 px-6">
              <Logo size="xl" />
              <div className="flex items-center space-x-4">
                <Link to="/login" className="text-gray-700 hover:text-gray-900 px-4 py-2 rounded-md text-sm font-medium">
                  Login
                </Link>
                <Link to="/register" className="bg-doni-blue/90 hover:bg-doni-blue text-white px-5 py-2.5 rounded-xl text-sm font-semibold shadow shadow-blue-500/30">
                  Get Started
                </Link>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-doni-blue to-blue-800 text-white py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-5xl md:text-7xl font-extrabold mb-8 drop-shadow-[0_2px_8px_rgba(0,0,0,0.35)]">
              Modern Logistics
              <br />
              <span className="text-blue-200">for the Digital Age</span>
            </h1>
            <p className="text-xl md:text-2xl text-blue-100 mb-10 max-w-3xl mx-auto">
              Streamline your supply chain with our comprehensive logistics platform. 
              Track shipments, manage warehouses, and optimize routes with real-time data.
            </p>
            
            {/* Tracking Search */}
            <div className="max-w-xl mx-auto mb-10">
              <form onSubmit={handleTrackingSubmit} className="flex gap-2">
                <input
                  type="text"
                  placeholder="Enter tracking number"
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value)}
                  className="flex-1 px-5 py-4 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-4 focus:ring-white/50 shadow-sm"
                />
                <button
                  type="submit"
                  className="bg-doni-orange hover:bg-orange-600 text-white px-8 py-4 rounded-xl font-semibold transition-colors shadow shadow-orange-400/30"
                >
                  Track
                </button>
              </form>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                          <Link to="/register" className="bg-doni-orange hover:bg-orange-600 text-white px-10 py-4 rounded-xl text-lg font-semibold transition-colors shadow shadow-orange-400/30">
              Start Free Trial
            </Link>
            <Link to="/ai-dashboard" className="bg-purple-600 hover:bg-purple-700 text-white px-10 py-4 rounded-xl text-lg font-semibold transition-colors shadow shadow-purple-400/30">
              Try AI Features
            </Link>
            <Link to="/login" className="border-2 border-white text-white hover:bg-white hover:text-doni-blue px-10 py-4 rounded-xl text-lg font-semibold transition-colors backdrop-blur-sm bg-white/10">
              Sign In
            </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Everything you need for modern logistics
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              From shipment tracking to warehouse management, we provide the tools you need to optimize your logistics operations.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white rounded-xl shadow-lg p-8">
              <div className="w-12 h-12 bg-doni-blue rounded-lg flex items-center justify-center mb-6">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-1.447-.894L15 4m0 13V4m-6 3l6-3" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Real-time Tracking</h3>
              <p className="text-gray-600">
                Track shipments in real-time with GPS integration and automated status updates. 
                Provide customers with accurate delivery estimates and notifications.
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-8">
              <div className="w-12 h-12 bg-doni-orange rounded-lg flex items-center justify-center mb-6">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Warehouse Management</h3>
              <p className="text-gray-600">
                Manage multiple warehouses with inventory tracking, capacity planning, 
                and automated reorder notifications. Optimize storage and reduce costs.
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-8">
              <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center mb-6">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-1.447-.894L15 4m0 13V4m-6 3l6-3" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Route Optimization</h3>
              <p className="text-gray-600">
                Optimize delivery routes with AI-powered algorithms. Reduce fuel costs, 
                improve delivery times, and enhance customer satisfaction.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-doni-blue">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to transform your logistics?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Join thousands of companies that trust Doni Logistics to streamline their operations.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register" className="bg-doni-orange hover:bg-orange-600 text-white px-8 py-3 rounded-lg text-lg font-semibold transition-colors">
              Get Started Free
            </Link>
            <Link to="/login" className="border-2 border-white text-white hover:bg-white hover:text-doni-blue px-8 py-3 rounded-lg text-lg font-semibold transition-colors">
              Sign In
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-950 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              {/* Footer logo white variant */}
              <img src={process.env.PUBLIC_URL + '/doni-logo-alt.png'} alt="Doni Logistics" className="h-10 w-auto invert brightness-0" />
              <p className="mt-4 text-gray-400">
                Modern logistics solutions for the digital age.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Product</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">Features</a></li>
                <li><a href="#" className="hover:text-white">Pricing</a></li>
                <li><a href="#" className="hover:text-white">API</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">About</a></li>
                <li><a href="#" className="hover:text-white">Blog</a></li>
                <li><a href="#" className="hover:text-white">Careers</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">Help Center</a></li>
                <li><a href="#" className="hover:text-white">Contact</a></li>
                <li><a href="#" className="hover:text-white">Status</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 Doni Logistics. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
