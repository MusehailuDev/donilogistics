import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Polyline, Popup } from 'react-leaflet';
import { Icon } from 'leaflet';
import { FaRoute, FaGasPump, FaClock, FaThermometerHalf, FaLeaf, FaCog } from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icons
delete Icon.Default.prototype._getIconUrl;
Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

const WARSAW_CENTER = [52.2297, 21.0122];

// AI Route Optimization Component
const AIRouteOptimization = () => {
  const [routes, setRoutes] = useState([]);
  const [selectedRoute, setSelectedRoute] = useState(null);
  const [optimizationFactors, setOptimizationFactors] = useState({
    fuelEfficiency: true,
    timeOptimization: true,
    trafficAvoidance: true,
    weatherConditions: true,
    carbonFootprint: false
  });
  const [loading, setLoading] = useState(false);
  const [optimizationResults, setOptimizationResults] = useState(null);

  // Mock route data
  const mockRoutes = [
    {
      id: '1',
      name: 'Warsaw City Center Delivery',
      originalRoute: [
        [52.2297, 21.0122], // Start
        [52.2300, 21.0130],
        [52.2305, 21.0140],
        [52.2310, 21.0150], // End
      ],
      optimizedRoute: [
        [52.2297, 21.0122], // Start
        [52.2295, 21.0115],
        [52.2290, 21.0120],
        [52.2285, 21.0130],
        [52.2280, 21.0140],
        [52.2275, 21.0150],
        [52.2270, 21.0160],
        [52.2265, 21.0170],
        [52.2260, 21.0180],
        [52.2255, 21.0190],
        [52.2250, 21.0200], // End
      ],
      stops: [
        { name: 'Warehouse A', lat: 52.2297, lng: 21.0122, type: 'pickup' },
        { name: 'Customer B', lat: 52.2300, lng: 21.0130, type: 'delivery' },
        { name: 'Customer C', lat: 52.2305, lng: 21.0140, type: 'delivery' },
        { name: 'Customer D', lat: 52.2310, lng: 21.0150, type: 'delivery' }
      ],
      metrics: {
        originalDistance: 12.5,
        optimizedDistance: 10.2,
        originalTime: 45,
        optimizedTime: 32,
        originalFuel: 8.5,
        optimizedFuel: 6.2,
        carbonReduction: 15.2
      }
    },
    {
      id: '2',
      name: 'Suburban Distribution Route',
      originalRoute: [
        [52.2297, 21.0122],
        [52.2350, 21.0200],
        [52.2400, 21.0300],
        [52.2450, 21.0400]
      ],
      optimizedRoute: [
        [52.2297, 21.0122],
        [52.2320, 21.0180],
        [52.2350, 21.0250],
        [52.2380, 21.0320],
        [52.2410, 21.0380],
        [52.2440, 21.0440],
        [52.2450, 21.0400]
      ],
      stops: [
        { name: 'Main Hub', lat: 52.2297, lng: 21.0122, type: 'pickup' },
        { name: 'Suburb A', lat: 52.2350, lng: 21.0200, type: 'delivery' },
        { name: 'Suburb B', lat: 52.2400, lng: 21.0300, type: 'delivery' },
        { name: 'Suburb C', lat: 52.2450, lng: 21.0400, type: 'delivery' }
      ],
      metrics: {
        originalDistance: 28.3,
        optimizedDistance: 24.7,
        originalTime: 85,
        optimizedTime: 68,
        originalFuel: 18.2,
        optimizedFuel: 14.8,
        carbonReduction: 18.7
      }
    }
  ];

  useEffect(() => {
    setRoutes(mockRoutes);
  }, []);

  const handleOptimizeRoute = async (routeId) => {
    setLoading(true);
    
    // Simulate AI optimization process
    setTimeout(() => {
      const route = routes.find(r => r.id === routeId);
      if (route) {
        setOptimizationResults({
          routeId,
          factors: optimizationFactors,
          improvements: {
            distance: ((route.metrics.originalDistance - route.metrics.optimizedDistance) / route.metrics.originalDistance * 100).toFixed(1),
            time: ((route.metrics.originalTime - route.metrics.optimizedTime) / route.metrics.originalTime * 100).toFixed(1),
            fuel: ((route.metrics.originalFuel - route.metrics.optimizedFuel) / route.metrics.originalFuel * 100).toFixed(1),
            carbon: route.metrics.carbonReduction
          },
          aiInsights: [
            'Traffic patterns analyzed for optimal timing',
            'Weather conditions considered for route safety',
            'Fuel consumption optimized through speed variations',
            'Carbon footprint reduced by 15.2%',
            'Delivery sequence optimized for efficiency'
          ]
        });
        toast.success('Route optimized successfully!');
      }
      setLoading(false);
    }, 2000);
  };

  const RouteCard = ({ route }) => {
    const isSelected = selectedRoute?.id === route.id;
    
    return (
      <div className={`bg-white rounded-lg shadow-lg p-6 cursor-pointer transition-all ${
        isSelected ? 'ring-2 ring-blue-500' : 'hover:shadow-xl'
      }`}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">{route.name}</h3>
          <div className="flex items-center space-x-2">
            <FaRoute className="text-blue-500" />
            <span className="text-sm text-gray-600">AI Optimized</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="text-center">
            <p className="text-sm text-gray-600">Distance</p>
            <p className="text-lg font-semibold text-gray-900">
              {route.metrics.optimizedDistance} km
            </p>
            <p className="text-xs text-green-600">
              -{((route.metrics.originalDistance - route.metrics.optimizedDistance) / route.metrics.originalDistance * 100).toFixed(1)}%
            </p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-600">Time</p>
            <p className="text-lg font-semibold text-gray-900">
              {route.metrics.optimizedTime} min
            </p>
            <p className="text-xs text-green-600">
              -{((route.metrics.originalTime - route.metrics.optimizedTime) / route.metrics.originalTime * 100).toFixed(1)}%
            </p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-600">Fuel</p>
            <p className="text-lg font-semibold text-gray-900">
              {route.metrics.optimizedFuel} L
            </p>
            <p className="text-xs text-green-600">
              -{((route.metrics.originalFuel - route.metrics.optimizedFuel) / route.metrics.originalFuel * 100).toFixed(1)}%
            </p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-600">Carbon</p>
            <p className="text-lg font-semibold text-gray-900">
              -{route.metrics.carbonReduction}%
            </p>
            <p className="text-xs text-green-600">
              <FaLeaf className="inline mr-1" />
              Eco-friendly
            </p>
          </div>
        </div>

        <button
          onClick={() => setSelectedRoute(route)}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
        >
          View Route
        </button>
      </div>
    );
  };

  const OptimizationFactors = () => (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">AI Optimization Factors</h3>
      <div className="space-y-3">
        {Object.entries(optimizationFactors).map(([factor, enabled]) => (
          <label key={factor} className="flex items-center">
            <input
              type="checkbox"
              checked={enabled}
              onChange={(e) => setOptimizationFactors(prev => ({
                ...prev,
                [factor]: e.target.checked
              }))}
              className="mr-3"
            />
            <span className="text-sm text-gray-700 capitalize">
              {factor.replace(/([A-Z])/g, ' $1').trim()}
            </span>
          </label>
        ))}
      </div>
    </div>
  );

  const AIInsights = ({ insights }) => (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">AI Insights</h3>
      <div className="space-y-3">
        {insights.map((insight, index) => (
          <div key={index} className="flex items-start">
            <FaCog className="text-blue-500 mr-2 mt-1 flex-shrink-0" />
            <p className="text-sm text-gray-600">{insight}</p>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">AI Route Optimization</h1>
          <p className="text-gray-600">Machine learning-powered route planning for maximum efficiency</p>
        </div>
        
        <button
          onClick={() => selectedRoute && handleOptimizeRoute(selectedRoute.id)}
          disabled={loading || !selectedRoute}
          className="flex items-center space-x-2 bg-green-600 text-white px-6 py-3 rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              <span>Optimizing...</span>
            </>
          ) : (
            <>
              <FaCog />
              <span>Optimize Route</span>
            </>
          )}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Route Selection */}
        <div className="lg:col-span-1 space-y-4">
          <h2 className="text-xl font-semibold text-gray-900">Available Routes</h2>
          <div className="space-y-4">
            {routes.map(route => (
              <RouteCard key={route.id} route={route} />
            ))}
          </div>

          <OptimizationFactors />

          {optimizationResults && (
            <AIInsights insights={optimizationResults.aiInsights} />
          )}
        </div>

        {/* Map View */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-lg p-4">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Route Visualization</h2>
            <div className="h-96 rounded-lg overflow-hidden">
              <MapContainer
                center={WARSAW_CENTER}
                zoom={11}
                style={{ height: '100%', width: '100%' }}
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                {selectedRoute && (
                  <>
                    {/* Original Route */}
                    <Polyline
                      positions={selectedRoute.originalRoute}
                      color="#EF4444"
                      weight={3}
                      opacity={0.7}
                    >
                      <Popup>
                        <div className="text-center">
                          <h3 className="font-semibold">Original Route</h3>
                          <p className="text-sm text-gray-600">
                            Distance: {selectedRoute.metrics.originalDistance} km<br/>
                            Time: {selectedRoute.metrics.originalTime} min<br/>
                            Fuel: {selectedRoute.metrics.originalFuel} L
                          </p>
                        </div>
                      </Popup>
                    </Polyline>

                    {/* Optimized Route */}
                    <Polyline
                      positions={selectedRoute.optimizedRoute}
                      color="#10B981"
                      weight={4}
                      opacity={0.9}
                    >
                      <Popup>
                        <div className="text-center">
                          <h3 className="font-semibold">AI Optimized Route</h3>
                          <p className="text-sm text-gray-600">
                            Distance: {selectedRoute.metrics.optimizedDistance} km<br/>
                            Time: {selectedRoute.metrics.optimizedTime} min<br/>
                            Fuel: {selectedRoute.metrics.optimizedFuel} L<br/>
                            Carbon Reduction: {selectedRoute.metrics.carbonReduction}%
                          </p>
                        </div>
                      </Popup>
                    </Polyline>

                    {/* Stops */}
                    {selectedRoute.stops.map((stop, index) => (
                      <Marker
                        key={index}
                        position={[stop.lat, stop.lng]}
                        icon={new Icon({
                          iconUrl: `data:image/svg+xml;base64,${btoa(`
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <circle cx="12" cy="12" r="8" fill="${stop.type === 'pickup' ? '#3B82F6' : '#10B981'}" stroke="white" stroke-width="2"/>
                              <text x="12" y="16" text-anchor="middle" fill="white" font-size="12" font-weight="bold">${index + 1}</text>
                            </svg>
                          `)}`,
                          iconSize: [20, 20],
                          iconAnchor: [10, 10],
                        })}
                      >
                        <Popup>
                          <div className="text-center">
                            <h3 className="font-semibold">{stop.name}</h3>
                            <p className="text-sm text-gray-600 capitalize">{stop.type}</p>
                          </div>
                        </Popup>
                      </Marker>
                    ))}
                  </>
                )}
              </MapContainer>
            </div>
          </div>
        </div>
      </div>

      {/* Optimization Results */}
      {optimizationResults && (
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Optimization Results</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <FaRoute className="text-green-500 text-2xl mx-auto mb-2" />
              <p className="text-sm text-gray-600">Distance Saved</p>
              <p className="text-2xl font-bold text-green-600">{optimizationResults.improvements.distance}%</p>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <FaClock className="text-blue-500 text-2xl mx-auto mb-2" />
              <p className="text-sm text-gray-600">Time Saved</p>
              <p className="text-2xl font-bold text-blue-600">{optimizationResults.improvements.time}%</p>
            </div>
            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <FaGasPump className="text-orange-500 text-2xl mx-auto mb-2" />
              <p className="text-sm text-gray-600">Fuel Saved</p>
              <p className="text-2xl font-bold text-orange-600">{optimizationResults.improvements.fuel}%</p>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <FaLeaf className="text-purple-500 text-2xl mx-auto mb-2" />
              <p className="text-sm text-gray-600">Carbon Reduced</p>
              <p className="text-2xl font-bold text-purple-600">{optimizationResults.improvements.carbon}%</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AIRouteOptimization;

