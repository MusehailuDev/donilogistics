import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap, useMapEvents } from 'react-leaflet';
import { Icon, latLngBounds } from 'leaflet';
import { FaCar, FaExclamationTriangle, FaRoute, FaClock, FaGasPump, FaThermometerHalf } from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icons in react-leaflet
delete Icon.Default.prototype._getIconUrl;
Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

const WARSAW_CENTER = [52.2297, 21.0122]; // Warsaw, Poland

// Custom vehicle marker icons
const createVehicleIcon = (status, type = 'vehicle') => {
  const colors = {
    active: '#10B981',
    idle: '#6B7280',
    maintenance: '#F59E0B',
    offline: '#EF4444',
    pickup: '#3B82F6',
    delivery: '#8B5CF6'
  };

  const color = colors[status] || colors.idle;
  
  return new Icon({
    iconUrl: `data:image/svg+xml;base64,${btoa(`
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="12" cy="12" r="10" fill="${color}" stroke="white" stroke-width="2"/>
        <path d="M8 12h8M6 9h12M6 15h12" stroke="white" stroke-width="2" stroke-linecap="round"/>
      </svg>
    `)}`,
    iconSize: [30, 30],
    iconAnchor: [15, 15],
    popupAnchor: [0, -15],
  });
};

// AI-powered vehicle insights component
const VehicleInsights = ({ vehicle, aiPredictions }) => {
  const [showDetails, setShowDetails] = useState(false);

  const getSafetyScore = () => {
    // AI prediction for safety score (0-100)
    return aiPredictions?.safetyScore || Math.floor(Math.random() * 30) + 70;
  };

  const getMaintenancePrediction = () => {
    // AI prediction for maintenance needs
    return aiPredictions?.maintenancePrediction || {
      nextService: '2024-02-15',
      urgency: 'low',
      recommendations: ['Check tire pressure', 'Oil change due in 500km']
    };
  };

  const getRouteOptimization = () => {
    // AI route optimization suggestions
    return aiPredictions?.routeOptimization || {
      fuelSavings: Math.floor(Math.random() * 15) + 5,
      timeSavings: Math.floor(Math.random() * 20) + 10,
      suggestions: ['Consider alternative route via A2 highway', 'Avoid city center during rush hour']
    };
  };

  const safetyScore = getSafetyScore();
  const maintenance = getMaintenancePrediction();
  const optimization = getRouteOptimization();

  return (
    <div className="bg-white rounded-lg shadow-lg p-4 max-w-sm">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-semibold text-gray-900">AI Insights</h3>
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="text-blue-600 hover:text-blue-800 text-sm"
        >
          {showDetails ? 'Hide' : 'Show'} Details
        </button>
      </div>

      {/* Safety Score */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">Safety Score</span>
          <span className={`text-sm font-bold ${
            safetyScore >= 80 ? 'text-green-600' : 
            safetyScore >= 60 ? 'text-yellow-600' : 'text-red-600'
          }`}>
            {safetyScore}/100
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className={`h-2 rounded-full ${
              safetyScore >= 80 ? 'bg-green-500' : 
              safetyScore >= 60 ? 'bg-yellow-500' : 'bg-red-500'
            }`}
            style={{ width: `${safetyScore}%` }}
          ></div>
        </div>
      </div>

      {/* Maintenance Prediction */}
      <div className="mb-4">
        <div className="flex items-center mb-2">
          <FaThermometerHalf className="text-orange-500 mr-2" />
          <span className="text-sm font-medium text-gray-700">Maintenance Alert</span>
        </div>
        <div className="text-xs text-gray-600">
          <p>Next service: {maintenance.nextService}</p>
          <p className={`font-medium ${
            maintenance.urgency === 'high' ? 'text-red-600' :
            maintenance.urgency === 'medium' ? 'text-yellow-600' : 'text-green-600'
          }`}>
            Urgency: {maintenance.urgency}
          </p>
        </div>
      </div>

      {/* Route Optimization */}
      <div className="mb-4">
        <div className="flex items-center mb-2">
          <FaRoute className="text-blue-500 mr-2" />
          <span className="text-sm font-medium text-gray-700">Route Optimization</span>
        </div>
        <div className="text-xs text-gray-600">
          <p>Fuel savings: {optimization.fuelSavings}%</p>
          <p>Time savings: {optimization.timeSavings} min</p>
        </div>
      </div>

      {showDetails && (
        <div className="border-t pt-3">
          <h4 className="text-sm font-medium text-gray-700 mb-2">AI Recommendations:</h4>
          <ul className="text-xs text-gray-600 space-y-1">
            {maintenance.recommendations.map((rec, index) => (
              <li key={index} className="flex items-start">
                <span className="text-blue-500 mr-1">•</span>
                {rec}
              </li>
            ))}
            {optimization.suggestions.map((suggestion, index) => (
              <li key={index} className="flex items-start">
                <span className="text-green-500 mr-1">•</span>
                {suggestion}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

// Vehicle marker component
const VehicleMarker = ({ vehicle, aiPredictions, onVehicleClick }) => {
  const [showPopup, setShowPopup] = useState(false);

  const getVehicleStatus = () => {
    if (vehicle.status === 'ACTIVE') return 'active';
    if (vehicle.status === 'MAINTENANCE') return 'maintenance';
    if (vehicle.status === 'OFFLINE') return 'offline';
    return 'idle';
  };

  const status = getVehicleStatus();
  const icon = createVehicleIcon(status, vehicle.type);

  const handleClick = () => {
    setShowPopup(!showPopup);
    if (onVehicleClick) onVehicleClick(vehicle);
  };

  return (
    <Marker
      position={[vehicle.currentLatitude, vehicle.currentLongitude]}
      icon={icon}
      eventHandlers={{
        click: handleClick,
      }}
    >
      {showPopup && (
        <Popup className="vehicle-popup">
          <div className="p-2">
            <h3 className="font-semibold text-gray-900 mb-2">{vehicle.licensePlate}</h3>
            <div className="text-sm text-gray-600 space-y-1">
              <p><strong>Driver:</strong> {vehicle.driver?.firstName} {vehicle.driver?.lastName}</p>
              <p><strong>Status:</strong> <span className={`capitalize ${
                status === 'active' ? 'text-green-600' :
                status === 'maintenance' ? 'text-orange-600' :
                status === 'offline' ? 'text-red-600' : 'text-gray-600'
              }`}>{status}</span></p>
              <p><strong>Speed:</strong> {vehicle.currentSpeed || 0} km/h</p>
              <p><strong>ETA:</strong> {vehicle.eta || 'N/A'}</p>
            </div>
            <button
              onClick={() => setShowPopup(false)}
              className="mt-2 text-xs text-blue-600 hover:text-blue-800"
            >
              View AI Insights
            </button>
          </div>
        </Popup>
      )}
    </Marker>
  );
};

// Map controls component
const MapControls = ({ vehicles, onFilterChange, onRefresh }) => {
  const [filters, setFilters] = useState({
    status: 'all',
    showAI: true,
    showRoutes: true
  });

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  return (
    <div className="absolute top-4 left-4 z-10 bg-white rounded-lg shadow-lg p-4">
      <h3 className="font-semibold text-gray-900 mb-3">Map Controls</h3>
      
      {/* Status Filter */}
      <div className="mb-3">
        <label className="block text-sm font-medium text-gray-700 mb-1">Status Filter</label>
        <select
          value={filters.status}
          onChange={(e) => handleFilterChange('status', e.target.value)}
          className="w-full text-sm border border-gray-300 rounded-md px-2 py-1"
        >
          <option value="all">All Vehicles</option>
          <option value="active">Active</option>
          <option value="idle">Idle</option>
          <option value="maintenance">Maintenance</option>
          <option value="offline">Offline</option>
        </select>
      </div>

      {/* AI Insights Toggle */}
      <div className="mb-3">
        <label className="flex items-center">
          <input
            type="checkbox"
            checked={filters.showAI}
            onChange={(e) => handleFilterChange('showAI', e.target.checked)}
            className="mr-2"
          />
          <span className="text-sm text-gray-700">Show AI Insights</span>
        </label>
      </div>

      {/* Route Display Toggle */}
      <div className="mb-3">
        <label className="flex items-center">
          <input
            type="checkbox"
            checked={filters.showRoutes}
            onChange={(e) => handleFilterChange('showRoutes', e.target.checked)}
            className="mr-2"
          />
          <span className="text-sm text-gray-700">Show Routes</span>
        </label>
      </div>

      {/* Refresh Button */}
      <button
        onClick={onRefresh}
        className="w-full bg-blue-600 text-white text-sm py-2 px-3 rounded-md hover:bg-blue-700 transition-colors"
      >
        Refresh Data
      </button>
    </div>
  );
};

// Main RealTimeTracking component
const RealTimeTracking = () => {
  const [vehicles, setVehicles] = useState([]);
  const [aiPredictions, setAiPredictions] = useState({});
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [filters, setFilters] = useState({
    status: 'all',
    showAI: true,
    showRoutes: true
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const mapRef = useRef(null);

  // Simulate real-time data updates
  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        setLoading(true);
        // Simulate API call - replace with actual API
        const mockVehicles = [
          {
            id: '1',
            licensePlate: 'WA 12345',
            currentLatitude: 52.2297,
            currentLongitude: 21.0122,
            status: 'ACTIVE',
            currentSpeed: 45,
            eta: '15:30',
            driver: { firstName: 'John', lastName: 'Doe' },
            route: [
              [52.2297, 21.0122],
              [52.2300, 21.0130],
              [52.2305, 21.0140]
            ]
          },
          {
            id: '2',
            licensePlate: 'WA 67890',
            currentLatitude: 52.2310,
            currentLongitude: 21.0150,
            status: 'IDLE',
            currentSpeed: 0,
            eta: 'N/A',
            driver: { firstName: 'Jane', lastName: 'Smith' },
            route: []
          },
          {
            id: '3',
            licensePlate: 'WA 11111',
            currentLatitude: 52.2280,
            currentLongitude: 21.0100,
            status: 'MAINTENANCE',
            currentSpeed: 0,
            eta: 'N/A',
            driver: { firstName: 'Mike', lastName: 'Johnson' },
            route: []
          }
        ];

        setVehicles(mockVehicles);

        // Simulate AI predictions
        const mockAiPredictions = {
          '1': {
            safetyScore: 85,
            maintenancePrediction: {
              nextService: '2024-02-15',
              urgency: 'low',
              recommendations: ['Check tire pressure', 'Oil change due in 500km']
            },
            routeOptimization: {
              fuelSavings: 12,
              timeSavings: 15,
              suggestions: ['Consider alternative route via A2 highway', 'Avoid city center during rush hour']
            }
          },
          '2': {
            safetyScore: 92,
            maintenancePrediction: {
              nextService: '2024-03-01',
              urgency: 'low',
              recommendations: ['Routine inspection due', 'Check brake fluid']
            },
            routeOptimization: {
              fuelSavings: 8,
              timeSavings: 10,
              suggestions: ['Optimize delivery sequence', 'Use express lanes']
            }
          },
          '3': {
            safetyScore: 45,
            maintenancePrediction: {
              nextService: '2024-01-20',
              urgency: 'high',
              recommendations: ['Immediate brake system check', 'Engine diagnostic required']
            },
            routeOptimization: {
              fuelSavings: 0,
              timeSavings: 0,
              suggestions: ['Vehicle requires immediate maintenance', 'Schedule service appointment']
            }
          }
        };

        setAiPredictions(mockAiPredictions);
        setError(null);
      } catch (err) {
        setError('Failed to load vehicle data');
        toast.error('Failed to load vehicle data');
      } finally {
        setLoading(false);
      }
    };

    fetchVehicles();

    // Set up real-time updates every 5 seconds
    const interval = setInterval(fetchVehicles, 5000);

    return () => clearInterval(interval);
  }, []);

  const handleVehicleClick = (vehicle) => {
    setSelectedVehicle(vehicle);
  };

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
  };

  const handleRefresh = () => {
    toast.success('Refreshing vehicle data...');
    // Trigger data refresh
  };

  const filteredVehicles = vehicles.filter(vehicle => {
    if (filters.status === 'all') return true;
    return vehicle.status.toLowerCase() === filters.status;
  });

  // Calculate map bounds
  const bounds = vehicles.length > 0 
    ? latLngBounds(vehicles.map(v => [v.currentLatitude, v.currentLongitude]))
    : latLngBounds([WARSAW_CENTER, WARSAW_CENTER]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading real-time vehicle data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <FaExclamationTriangle className="text-red-500 text-4xl mx-auto mb-4" />
          <p className="text-red-600">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-full">
      <MapContainer
        ref={mapRef}
        center={WARSAW_CENTER}
        zoom={12}
        style={{ height: '100%', width: '100%' }}
        bounds={bounds}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Vehicle Markers */}
        {filteredVehicles.map(vehicle => (
          <VehicleMarker
            key={vehicle.id}
            vehicle={vehicle}
            aiPredictions={aiPredictions[vehicle.id]}
            onVehicleClick={handleVehicleClick}
          />
        ))}

        {/* Route Lines */}
        {filters.showRoutes && filteredVehicles.map(vehicle => (
          vehicle.route && vehicle.route.length > 1 && (
            <Polyline
              key={`route-${vehicle.id}`}
              positions={vehicle.route}
              color="#3B82F6"
              weight={3}
              opacity={0.7}
            />
          )
        ))}
      </MapContainer>

      {/* Map Controls */}
      <MapControls
        vehicles={vehicles}
        onFilterChange={handleFilterChange}
        onRefresh={handleRefresh}
      />

      {/* AI Insights Panel */}
      {selectedVehicle && filters.showAI && (
        <div className="absolute top-4 right-4 z-10">
          <VehicleInsights
            vehicle={selectedVehicle}
            aiPredictions={aiPredictions[selectedVehicle.id]}
          />
        </div>
      )}

      {/* Vehicle Summary */}
      <div className="absolute bottom-4 left-4 z-10 bg-white rounded-lg shadow-lg p-4">
        <h3 className="font-semibold text-gray-900 mb-2">Fleet Summary</h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-gray-600">Total Vehicles</p>
            <p className="font-semibold">{vehicles.length}</p>
          </div>
          <div>
            <p className="text-gray-600">Active</p>
            <p className="font-semibold text-green-600">
              {vehicles.filter(v => v.status === 'ACTIVE').length}
            </p>
          </div>
          <div>
            <p className="text-gray-600">In Maintenance</p>
            <p className="font-semibold text-orange-600">
              {vehicles.filter(v => v.status === 'MAINTENANCE').length}
            </p>
          </div>
          <div>
            <p className="text-gray-600">Offline</p>
            <p className="font-semibold text-red-600">
              {vehicles.filter(v => v.status === 'OFFLINE').length}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RealTimeTracking;

