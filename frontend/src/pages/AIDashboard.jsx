import React, { useState } from 'react';
import { FaRobot, FaChartLine, FaRoute, FaComments, FaBrain, FaCog } from 'react-icons/fa';
import AITracking from '../components/AITracking';
import PredictiveAnalytics from '../components/PredictiveAnalytics';
import AIRouteOptimization from '../components/AIRouteOptimization';
import AIChatAssistant from '../components/AIChatAssistant';

const AIDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');

  const tabs = [
    {
      id: 'overview',
      name: 'AI Overview',
      icon: <FaBrain className="text-blue-500" />,
      description: 'AI-powered insights and predictions'
    },
    {
      id: 'tracking',
      name: 'Real-time Tracking',
      icon: <FaRoute className="text-green-500" />,
      description: 'AI-enhanced vehicle tracking with insights'
    },
    {
      id: 'analytics',
      name: 'Predictive Analytics',
      icon: <FaChartLine className="text-purple-500" />,
      description: 'Machine learning predictions and analysis'
    },
    {
      id: 'optimization',
      name: 'Route Optimization',
      icon: <FaCog className="text-orange-500" />,
      description: 'AI-powered route planning and optimization'
    },
    {
      id: 'assistant',
      name: 'AI Assistant',
      icon: <FaComments className="text-indigo-500" />,
      description: 'Intelligent logistics support chatbot'
    }
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'tracking':
        return (
          <div className="h-full">
            <AITracking />
          </div>
        );
      case 'analytics':
        return (
          <div className="h-full">
            <PredictiveAnalytics />
          </div>
        );
      case 'optimization':
        return (
          <div className="h-full">
            <AIRouteOptimization />
          </div>
        );
      case 'assistant':
        return (
          <div className="h-full">
            <AIChatAssistant />
          </div>
        );
      default:
        return <AIOverview />;
    }
  };

  const AIOverview = () => (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="text-center">
        <div className="flex items-center justify-center space-x-3 mb-4">
          <FaRobot className="text-4xl text-blue-600" />
          <h1 className="text-3xl font-bold text-gray-900">AI-Powered Logistics Platform</h1>
        </div>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Experience the future of logistics with our comprehensive AI suite. 
          From real-time tracking to predictive analytics, we're revolutionizing how you manage your fleet.
        </p>
      </div>

      {/* AI Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Real-time Tracking */}
        <div className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow cursor-pointer"
             onClick={() => setActiveTab('tracking')}>
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <FaRoute className="text-2xl text-green-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Real-time Tracking</h3>
              <p className="text-sm text-gray-600">AI-enhanced monitoring</p>
            </div>
          </div>
          <p className="text-gray-600 mb-4">
            Monitor your fleet in real-time with AI-powered insights including safety scores, 
            maintenance predictions, and route optimization suggestions.
          </p>
          <div className="flex items-center justify-between">
            <span className="text-sm text-green-600 font-medium">Live Updates</span>
            <span className="text-xs text-gray-500">Click to explore</span>
          </div>
        </div>

        {/* Predictive Analytics */}
        <div className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow cursor-pointer"
             onClick={() => setActiveTab('analytics')}>
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <FaChartLine className="text-2xl text-purple-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Predictive Analytics</h3>
              <p className="text-sm text-gray-600">ML-powered insights</p>
            </div>
          </div>
          <p className="text-gray-600 mb-4">
            Leverage machine learning to predict maintenance needs, optimize costs, 
            and improve safety with advanced analytics and forecasting.
          </p>
          <div className="flex items-center justify-between">
            <span className="text-sm text-purple-600 font-medium">95% Accuracy</span>
            <span className="text-xs text-gray-500">Click to explore</span>
          </div>
        </div>

        {/* Route Optimization */}
        <div className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow cursor-pointer"
             onClick={() => setActiveTab('optimization')}>
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <FaCog className="text-2xl text-orange-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Route Optimization</h3>
              <p className="text-sm text-gray-600">AI route planning</p>
            </div>
          </div>
          <p className="text-gray-600 mb-4">
            Optimize delivery routes using AI algorithms that consider traffic, weather, 
            fuel efficiency, and carbon footprint for maximum efficiency.
          </p>
          <div className="flex items-center justify-between">
            <span className="text-sm text-orange-600 font-medium">18% Savings</span>
            <span className="text-xs text-gray-500">Click to explore</span>
          </div>
        </div>

        {/* AI Assistant */}
        <div className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow cursor-pointer"
             onClick={() => setActiveTab('assistant')}>
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center">
              <FaComments className="text-2xl text-indigo-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">AI Assistant</h3>
              <p className="text-sm text-gray-600">Intelligent support</p>
            </div>
          </div>
          <p className="text-gray-600 mb-4">
            Get instant answers and support from our AI assistant. Ask questions about routes, 
            analytics, maintenance, and more with natural language processing.
          </p>
          <div className="flex items-center justify-between">
            <span className="text-sm text-indigo-600 font-medium">24/7 Support</span>
            <span className="text-xs text-gray-500">Click to explore</span>
          </div>
        </div>

        {/* Performance Metrics */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <FaBrain className="text-2xl text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">AI Performance</h3>
              <p className="text-sm text-gray-600">System metrics</p>
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Prediction Accuracy</span>
              <span className="text-sm font-semibold text-green-600">95%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Response Time</span>
              <span className="text-sm font-semibold text-blue-600">&lt;2s</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Cost Savings</span>
              <span className="text-sm font-semibold text-purple-600">$6.5K/mo</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Uptime</span>
              <span className="text-sm font-semibold text-green-600">99.9%</span>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
              <FaRobot className="text-2xl text-gray-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Quick Actions</h3>
              <p className="text-sm text-gray-600">Common tasks</p>
            </div>
          </div>
          <div className="space-y-2">
            <button 
              onClick={() => setActiveTab('tracking')}
              className="w-full text-left p-2 text-sm bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-md transition-colors"
            >
              View Fleet Status
            </button>
            <button 
              onClick={() => setActiveTab('analytics')}
              className="w-full text-left p-2 text-sm bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-md transition-colors"
            >
              Generate Report
            </button>
            <button 
              onClick={() => setActiveTab('optimization')}
              className="w-full text-left p-2 text-sm bg-orange-50 hover:bg-orange-100 text-orange-700 rounded-md transition-colors"
            >
              Optimize Routes
            </button>
            <button 
              onClick={() => setActiveTab('assistant')}
              className="w-full text-left p-2 text-sm bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-md transition-colors"
            >
              Ask AI Assistant
            </button>
          </div>
        </div>
      </div>

      {/* Technology Stack */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">AI Technology Stack</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <h4 className="font-semibold text-gray-900 mb-2">Machine Learning</h4>
            <p className="text-sm text-gray-600">TensorFlow, Scikit-learn</p>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <h4 className="font-semibold text-gray-900 mb-2">Real-time Processing</h4>
            <p className="text-sm text-gray-600">Kafka, WebSockets</p>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <h4 className="font-semibold text-gray-900 mb-2">Data Analytics</h4>
            <p className="text-sm text-gray-600">Elasticsearch, Pandas</p>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <h4 className="font-semibold text-gray-900 mb-2">Natural Language</h4>
            <p className="text-sm text-gray-600">NLP, Chatbot AI</p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Tabs */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.icon}
                <span>{tab.name}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="max-w-7xl mx-auto">
        {renderTabContent()}
      </div>
    </div>
  );
};

export default AIDashboard;

