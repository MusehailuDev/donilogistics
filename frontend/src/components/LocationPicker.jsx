import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from 'react-leaflet';
import { Icon } from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icons in react-leaflet
delete Icon.Default.prototype._getIconUrl;
Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

const WARSAW_CENTER = [52.2297, 21.0122]; // Warsaw, Poland

const LocationMarker = ({ position, setPosition, type }) => {
  useMapEvents({
    click(e) {
      setPosition([e.latlng.lat, e.latlng.lng]);
    },
  });

  return position ? (
    <Marker 
      position={position} 
      icon={new Icon({
        iconUrl: type === 'pickup' 
          ? 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTEyIDJDNi40OCAyIDIgNi40OCAyIDEyQzIgMTcuNTIgNi40OCAyMiAxMiAyMkMxNy41MiAyMiAyMiAxNy41MiAyMiAxMkMyMiA2LjQ4IDE3LjUyIDIgMTIgMloiIGZpbGw9IiM0RkY1RjUiLz4KPHBhdGggZD0iTTEyIDZDNi40OCA2IDIgMTAuNDggMiAxNkMyIDIxLjUyIDYuNDggMjYgMTIgMjZDMjEuNTIgMjYgMjYgMjEuNTIgMjYgMTZDMjYgMTAuNDggMjEuNTIgNiAxMiA2WiIgZmlsbD0iIzQ2QjU2RCIvPgo8L3N2Zz4K' 
          : 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTEyIDJDNi40OCAyIDIgNi40OCAyIDEyQzIgMTcuNTIgNi40OCAyMiAxMiAyMkMxNy41MiAyMiAyMiAxNy41MiAyMiAxMkMyMiA2LjQ4IDE3LjUyIDIgMTIgMloiIGZpbGw9IiNGRjU3MjIiLz4KPHBhdGggZD0iTTEyIDZDNi40OCA2IDIgMTAuNDggMiAxNkMyIDIxLjUyIDYuNDggMjYgMTIgMjZDMjEuNTIgMjYgMjYgMjEuNTIgMjYgMTZDMjYgMTAuNDggMjEuNTIgNiAxMiA2WiIgZmlsbD0iI0Y0NDM2NiIvPgo8L3N2Zz4K',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
      })}
    />
  ) : null;
};

const LocationPicker = ({ 
  isOpen, 
  onClose, 
  onLocationSelect, 
  type = 'pickup',
  initialPosition = WARSAW_CENTER 
}) => {
  const [position, setPosition] = useState(initialPosition);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (isOpen) {
      // Always default to Warsaw center when opening the picker
      setPosition(WARSAW_CENTER);
    }
  }, [isOpen]);

  const handleConfirm = () => {
    onLocationSelect({
      latitude: position[0],
      longitude: position[1]
    });
    onClose();
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    try {
      // Using OpenStreetMap Nominatim for geocoding
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=1`
      );
      const data = await response.json();
      
      if (data.length > 0) {
        const lat = data[0].lat;
        const lon = data[0].lon;
        setPosition([parseFloat(lat), parseFloat(lon)]);
      }
    } catch (error) {
      console.error('Error searching location:', error);
    }
  };

  if (!isOpen) return null;

  const RecenterOnPosition = ({ pos }) => {
    const map = useMap();
    useEffect(() => {
      if (pos && Array.isArray(pos) && pos.length === 2) {
        map.setView(pos, map.getZoom(), { animate: true });
      }
    }, [pos, map]);
    return null;
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-10 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-2/3 shadow-lg rounded-md bg-white">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-900">
            Select {type === 'pickup' ? 'Pickup' : 'Delivery'} Location
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        </div>

        {/* Search Bar */}
        <div className="mb-4">
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Search for a location in Warsaw or nearby..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              className="flex-1 border border-gray-300 rounded-md px-3 py-2"
            />
            <button
              onClick={handleSearch}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Search
            </button>
          </div>
        </div>

        {/* Map */}
        <div className="mb-4" style={{ height: '400px' }}>
          <MapContainer
            center={position}
            zoom={10}
            style={{ height: '100%', width: '100%' }}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <RecenterOnPosition pos={position} />
            <LocationMarker 
              position={position} 
              setPosition={setPosition}
              type={type}
            />
          </MapContainer>
        </div>

        {/* Coordinates Display */}
        <div className="mb-4 p-3 bg-gray-50 rounded-md">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <label className="block text-sm font-medium text-gray-700">Latitude</label>
              <input
                type="number"
                step="0.000001"
                value={position[0]}
                onChange={(e) => setPosition([parseFloat(e.target.value) || 0, position[1]])}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Longitude</label>
              <input
                type="number"
                step="0.000001"
                value={position[1]}
                onChange={(e) => setPosition([position[0], parseFloat(e.target.value) || 0])}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
              />
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="mb-4 p-3 bg-blue-50 rounded-md">
          <p className="text-sm text-blue-800">
            💡 Click on the map to select a location, or search for an address above. 
            The selected coordinates will be automatically filled in the form.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Confirm Location
          </button>
        </div>
      </div>
    </div>
  );
};

export default LocationPicker;
