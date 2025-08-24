import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { Icon } from 'leaflet';
import { FaCar, FaExclamationTriangle, FaRoute, FaClock } from 'react-icons/fa';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icons
delete Icon.Default.prototype._getIconUrl;
Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

const WARSAW_CENTER = [52.2297, 21.0122];

// AI Insights Component
const AIInsights = ({ vehicle, predictions }) => {
  const safetyScore = predictions?.safetyScore || Math.floor(Math.random() * 30) + 70;
  const fuelSavings = predictions?.fuelSavings || Math.floor(Math.random() * 15) + 5;
  const maintenanceDue = predictions?.maintenanceDue || '2024-02-15';

  return (
    <div className="bg-white rounded-lg shadow-lg p-4 max-w-sm">
      <h3 className="text-lg font-semibold text-gray-900 mb-3">AI Insights</h3>
      
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

      {/* Fuel Savings */}
      <div className="mb-4">
        <div className="flex items-center mb-2">
          <FaRoute className="text-blue-500 mr-2" />
          <span className="text-sm font-medium text-gray-700">Route Optimization</span>
        </div>
        <p className="text-sm text-gray-600">Fuel savings: {fuelSavings}%</p>
      </div>

      {/* Maintenance */}
      <div className="mb-4">
        <div className="flex items-center mb-2">
          <FaExclamationTriangle className="text-orange-500 mr-2" />
          <span className="text-sm font-medium text-gray-700">Maintenance</span>
        </div>
        <p className="text-sm text-gray-600">Next service: {maintenanceDue}</p>
      </div>
    </div>
  );
};

// Vehicle Marker Component
const VehicleMarker = ({ vehicle, onVehicleClick }) => {
  const [showPopup, setShowPopup] = useState(false);

  const getStatusColor = (status) => {
    switch (status) {
      case 'ACTIVE': return '#10B981';
      case 'MAINTENANCE': return '#F59E0B';
      case 'OFFLINE': return '#EF4444';
      default: return '#6B7280';
    }
  };

  const icon = new Icon({
    iconUrl: `data:image/svg+xml;base64,${btoa(`
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="12" cy="12" r="10" fill="${getStatusColor(vehicle.status)}" stroke="white" stroke-width="2"/>
        <path d="M8 12h8M6 9h12M6 15h12" stroke="white" stroke-width="2" stroke-linecap="round"/>
      </svg>
    `)}`,
    iconSize: [30, 30],
    iconAnchor: [15, 15],
    popupAnchor: [0, -15],
  });

  return (
    <Marker
      position={[vehicle.latitude, vehicle.longitude]}
      icon={icon}
      eventHandlers={{
        click: () => {
          setShowPopup(!showPopup);
          if (onVehicleClick) onVehicleClick(vehicle);
        },
      }}
    >
      {showPopup && (
        <Popup>
          <div className="p-2">
            <h3 className="font-semibold text-gray-900 mb-2">{vehicle.licensePlate}</h3>
            <div className="text-sm text-gray-600 space-y-1">
              <p><strong>Driver:</strong> {vehicle.driver}</p>
              <p><strong>Status:</strong> {vehicle.status}</p>
              <p><strong>Speed:</strong> {vehicle.speed} km/h</p>
              <p><strong>ETA:</strong> {vehicle.eta}</p>
            </div>
          </div>
        </Popup>
      )}
    </Marker>
  );
};

// Main AI Tracking Component
const AITracking = () => {
  const [vehicles, setVehicles] = useState([]);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate real-time data
    const mockVehicles = [
      {
        id: '1',
        licensePlate: 'WA 12345',
        latitude: 52.2297,
        longitude: 21.0122,
        status: 'ACTIVE',
        speed: 45,
        eta: '15:30',
        driver: 'John Doe'
      },
      {
        id: '2',
        licensePlate: 'WA 67890',
        latitude: 52.2310,
        longitude: 21.0150,
        status: 'IDLE',
        speed: 0,
        eta: 'N/A',
        driver: 'Jane Smith'
      },
      {
        id: '3',
        licensePlate: 'WA 11111',
        latitude: 52.2280,
        longitude: 21.0100,
        status: 'MAINTENANCE',
        speed: 0,
        eta: 'N/A',
        driver: 'Mike Johnson'
      }
    ];

    setVehicles(mockVehicles);
    setLoading(false);

    // Simulate real-time updates
    const interval = setInterval(() => {
      setVehicles(prev => prev.map(v => ({
        ...v,
        latitude: v.latitude + (Math.random() - 0.5) * 0.001,
        longitude: v.longitude + (Math.random() - 0.5) * 0.001,
        speed: v.status === 'ACTIVE' ? Math.floor(Math.random() * 60) + 20 : 0
      })));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const handleVehicleClick = (vehicle) => {
    setSelectedVehicle(vehicle);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading AI-powered tracking...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-full">
      <MapContainer
        center={WARSAW_CENTER}
        zoom={12}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {vehicles.map(vehicle => (
          <VehicleMarker
            key={vehicle.id}
            vehicle={vehicle}
            onVehicleClick={handleVehicleClick}
          />
        ))}
      </MapContainer>

      {/* AI Insights Panel */}
      {selectedVehicle && (
        <div className="absolute top-4 right-4 z-10">
          <AIInsights
            vehicle={selectedVehicle}
            predictions={{
              safetyScore: Math.floor(Math.random() * 30) + 70,
              fuelSavings: Math.floor(Math.random() * 15) + 5,
              maintenanceDue: '2024-02-15'
            }}
          />
        </div>
      )}

      {/* Fleet Summary */}
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
        </div>
      </div>
    </div>
  );
};

export default AITracking;

