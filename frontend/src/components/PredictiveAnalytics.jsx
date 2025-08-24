import React, { useState, useEffect } from 'react';
import { 
  LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';
import { FaChartLine, FaExclamationTriangle, FaRoute, FaDollarSign, FaDownload } from 'react-icons/fa';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

// AI Prediction Component
const AIPrediction = ({ prediction }) => {
  const getConfidenceColor = (confidence) => {
    if (confidence >= 80) return 'text-green-600';
    if (confidence >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-semibold text-gray-900">{prediction.type}</h3>
        <span className={`text-sm font-bold ${getConfidenceColor(prediction.confidence)}`}>
          {prediction.confidence}% confidence
        </span>
      </div>
      
      <div className="space-y-2">
        <p className="text-sm text-gray-600">
          <strong>Predicted Date:</strong> {prediction.predictedDate}
        </p>
        <p className="text-sm text-gray-600">
          <strong>Target:</strong> {prediction.target}
        </p>
        <div className="mt-3">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Recommendations:</h4>
          <ul className="text-xs text-gray-600 space-y-1">
            {prediction.recommendations.map((rec, index) => (
              <li key={index} className="flex items-start">
                <span className="text-blue-500 mr-1">•</span>
                {rec}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

// Cost Optimization Component
const CostOptimization = ({ data }) => {
  const [selectedPeriod, setSelectedPeriod] = useState('month');

  const optimizationData = [
    { category: 'Fuel', current: 15000, optimized: 12000, savings: 20 },
    { category: 'Maintenance', current: 8000, optimized: 6000, savings: 25 },
    { category: 'Labor', current: 25000, optimized: 22000, savings: 12 },
    { category: 'Insurance', current: 5000, optimized: 4500, savings: 10 }
  ];

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Cost Optimization</h3>
        <div className="flex items-center space-x-2">
          <FaDollarSign className="text-green-500" />
          <span className="text-sm text-gray-600">ROI Analysis</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={optimizationData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="category" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="current" fill="#EF4444" name="Current Cost" />
              <Bar dataKey="optimized" fill="#10B981" name="Optimized Cost" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="space-y-4">
          <div className="text-center">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Total Savings</h4>
            <p className="text-2xl font-bold text-green-600">$6,500</p>
            <p className="text-xs text-gray-500">per month</p>
          </div>

          <div className="space-y-2">
            {optimizationData.map((item, index) => (
              <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                <span className="text-sm text-gray-700">{item.category}</span>
                <span className="text-sm font-semibold text-green-600">
                  {item.savings}% savings
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="border-t pt-4">
        <h4 className="text-sm font-medium text-gray-700 mb-2">AI Recommendations:</h4>
        <ul className="text-xs text-gray-600 space-y-1">
          <li>• Implement predictive maintenance to reduce breakdown costs</li>
          <li>• Optimize routes using AI algorithms to save fuel</li>
          <li>• Use driver behavior analysis to reduce insurance premiums</li>
          <li>• Automate scheduling to optimize labor costs</li>
        </ul>
      </div>
    </div>
  );
};

// Safety Analytics Component
const SafetyAnalytics = ({ data }) => {
  const safetyData = [
    { month: 'Jan', incidents: 5, score: 85 },
    { month: 'Feb', incidents: 3, score: 88 },
    { month: 'Mar', incidents: 2, score: 92 },
    { month: 'Apr', incidents: 1, score: 95 },
    { month: 'May', incidents: 0, score: 98 },
    { month: 'Jun', incidents: 1, score: 96 }
  ];

  const driverData = [
    { name: 'John Doe', score: 95, incidents: 0 },
    { name: 'Jane Smith', score: 88, incidents: 1 },
    { name: 'Mike Johnson', score: 92, incidents: 0 },
    { name: 'Sarah Wilson', score: 85, incidents: 2 }
  ];

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Safety Analytics</h3>
        <div className="flex items-center space-x-2">
          <FaExclamationTriangle className="text-orange-500" />
          <span className="text-sm text-gray-600">Risk Assessment</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-3">Safety Trends</h4>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={safetyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="score" stroke="#10B981" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-3">Driver Safety Scores</h4>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={driverData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="score" fill="#3B82F6" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="mt-6 border-t pt-4">
        <h4 className="text-sm font-medium text-gray-700 mb-2">AI Safety Insights:</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="bg-green-50 p-3 rounded">
            <p className="font-medium text-green-800">Improvement Trend</p>
            <p className="text-green-600">Safety score increased by 15% over 6 months</p>
          </div>
          <div className="bg-blue-50 p-3 rounded">
            <p className="font-medium text-blue-800">Risk Reduction</p>
            <p className="text-blue-600">Accidents reduced by 80% with AI monitoring</p>
          </div>
          <div className="bg-orange-50 p-3 rounded">
            <p className="font-medium text-orange-800">Training Needed</p>
            <p className="text-orange-600">2 drivers require additional safety training</p>
          </div>
        </div>
      </div>
    </div>
  );
};

// Main Predictive Analytics Component
const PredictiveAnalytics = () => {
  const [predictions, setPredictions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTimeframe, setSelectedTimeframe] = useState('30d');

  useEffect(() => {
    // Simulate AI predictions
    const mockPredictions = [
      {
        id: '1',
        type: 'Maintenance Prediction',
        target: 'Vehicle WA-12345',
        predictedDate: '2024-02-15',
        confidence: 95,
        recommendations: [
          'Schedule brake pad replacement',
          'Check engine oil levels',
          'Inspect tire wear patterns'
        ]
      },
      {
        id: '2',
        type: 'Route Optimization',
        target: 'Delivery Route #456',
        predictedDate: '2024-01-25',
        confidence: 87,
        recommendations: [
          'Avoid city center during rush hour',
          'Use A2 highway for better fuel efficiency',
          'Optimize delivery sequence'
        ]
      },
      {
        id: '3',
        type: 'Driver Safety Alert',
        target: 'Driver Mike Johnson',
        predictedDate: '2024-01-20',
        confidence: 78,
        recommendations: [
          'Schedule safety training session',
          'Monitor driving behavior closely',
          'Provide feedback on aggressive driving'
        ]
      },
      {
        id: '4',
        type: 'Cost Optimization',
        target: 'Monthly Operations',
        predictedDate: '2024-02-01',
        confidence: 92,
        recommendations: [
          'Implement predictive maintenance',
          'Optimize fuel consumption',
          'Reduce idle time through better scheduling'
        ]
      }
    ];

    setPredictions(mockPredictions);
    setLoading(false);
  }, []);

  const handleExport = (format) => {
    // Simulate export functionality
    console.log(`Exporting data in ${format} format`);
    alert(`Exporting analytics data in ${format} format...`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading AI predictions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">AI Predictive Analytics</h1>
          <p className="text-gray-600">AI-powered insights and predictions for logistics optimization</p>
        </div>
        
        <div className="flex items-center space-x-4">
          <select
            value={selectedTimeframe}
            onChange={(e) => setSelectedTimeframe(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="1y">Last year</option>
          </select>
          
          <div className="flex space-x-2">
            <button
              onClick={() => handleExport('PDF')}
              className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 text-sm"
            >
              <FaDownload />
              <span>Export PDF</span>
            </button>
            <button
              onClick={() => handleExport('CSV')}
              className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 text-sm"
            >
              <FaDownload />
              <span>Export CSV</span>
            </button>
          </div>
        </div>
      </div>

      {/* AI Predictions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {predictions.map(prediction => (
          <AIPrediction key={prediction.id} prediction={prediction} />
        ))}
      </div>

      {/* Cost Optimization */}
      <CostOptimization data={{}} />

      {/* Safety Analytics */}
      <SafetyAnalytics data={{}} />

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-lg p-6 text-center">
          <div className="text-3xl font-bold text-blue-600 mb-2">95%</div>
          <div className="text-sm text-gray-600">Prediction Accuracy</div>
        </div>
        <div className="bg-white rounded-lg shadow-lg p-6 text-center">
          <div className="text-3xl font-bold text-green-600 mb-2">$6.5K</div>
          <div className="text-sm text-gray-600">Monthly Savings</div>
        </div>
        <div className="bg-white rounded-lg shadow-lg p-6 text-center">
          <div className="text-3xl font-bold text-orange-600 mb-2">80%</div>
          <div className="text-sm text-gray-600">Risk Reduction</div>
        </div>
        <div className="bg-white rounded-lg shadow-lg p-6 text-center">
          <div className="text-3xl font-bold text-purple-600 mb-2">15%</div>
          <div className="text-sm text-gray-600">Efficiency Gain</div>
        </div>
      </div>
    </div>
  );
};

export default PredictiveAnalytics;

