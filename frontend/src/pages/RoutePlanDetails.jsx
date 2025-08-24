import React, { useEffect, useMemo, useState } from 'react';
import { MapContainer, TileLayer, Marker, Polyline, Popup } from 'react-leaflet';
import L from 'leaflet';
import axios from 'axios';
import AdminLayout from '../components/admin/AdminLayout';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';
const DEV_ADMIN_HEADERS = { Authorization: 'Bearer dev-admin-token' };

const RoutePlanDetails = ({ routePlanId }) => {
  const [plan, setPlan] = useState(null);
  const [stops, setStops] = useState([]);
  const [error, setError] = useState('');
  const [broadcasting, setBroadcasting] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await axios.get(`${API_BASE_URL}/api/admin/route-plans/${routePlanId}` , { headers: DEV_ADMIN_HEADERS });
        setPlan(data);
        setStops(Array.isArray(data.stops) ? data.stops : []);
      } catch (e) {
        setError(e?.response?.data?.error || 'Failed to load route plan');
      }
    };
    if (routePlanId) load();
  }, [routePlanId]);

  const polyline = useMemo(() => {
    return stops
      .map(s => [Number(s.lat || s.latitude), Number(s.lon || s.longitude)])
      .filter(([a, b]) => !Number.isNaN(a) && !Number.isNaN(b));
  }, [stops]);

  const center = polyline.length > 0 ? polyline[0] : [52.2297, 21.0122];

  const originIcon = new L.Icon({
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34]
  });
  const deliveryIcon = new L.DivIcon({
    className: 'custom-marker-delivery',
    html: '<div style="background:#2563eb;color:#fff;border-radius:12px;padding:4px 6px;font-size:12px;box-shadow:0 1px 4px rgba(0,0,0,.2)">Drop</div>'
  });
  const pickupIcon = new L.DivIcon({
    className: 'custom-marker-pickup',
    html: '<div style="background:#059669;color:#fff;border-radius:12px;padding:4px 6px;font-size:12px;box-shadow:0 1px 4px rgba(0,0,0,.2)">Pickup</div>'
  });
  const destinationIcon = new L.DivIcon({
    className: 'custom-marker-destination',
    html: '<div style="background:#dc2626;color:#fff;border-radius:12px;padding:4px 6px;font-size:12px;box-shadow:0 1px 4px rgba(0,0,0,.2)">Dest</div>'
  });

  const getIconForStop = (s, idx) => {
    if (idx === 0) return originIcon;
    if (idx === stops.length - 1) return destinationIcon;
    return (s.stopType || '').toUpperCase() === 'DELIVERY' ? deliveryIcon : pickupIcon;
  };

  const broadcast = async () => {
    if (!routePlanId) return;
    setBroadcasting(true);
    try {
      await axios.post(`${API_BASE_URL}/api/admin/route-plans/${routePlanId}/broadcast`, { audience: 'both', limit: 5 }, { headers: DEV_ADMIN_HEADERS });
      alert('Broadcast sent to nearby drivers/vehicles');
    } catch (e) {
      alert(e?.response?.data?.error || 'Broadcast failed');
    } finally { setBroadcasting(false); }
  };

  return (
    <AdminLayout title={plan?.name || 'Route Plan'}>
      {error && <div className="mb-3 text-sm text-red-600">{error}</div>}
      <div className="bg-white rounded-lg shadow-sm border p-3">
        <div className="flex items-center justify-between mb-2">
          <div className="text-sm text-gray-600">Stops: {stops.length} • Status: {plan?.routeStatus || '—'}</div>
          <button onClick={broadcast} disabled={broadcasting} className={`px-3 py-1.5 rounded ${broadcasting ? 'bg-gray-300 text-gray-600' : 'bg-doni-blue text-white hover:opacity-90'}`}>{broadcasting ? 'Broadcasting…' : 'Broadcast to nearby'}</button>
        </div>
        <div className="h-[60vh] w-full">
          <MapContainer center={center} zoom={12} style={{ height: '100%', width: '100%' }}>
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            {(() => {
              // prefer solverMeta.geometry if available
              const geom = (() => {
                try {
                  const meta = plan?.solverMeta && JSON.parse(plan.solverMeta);
                  if (meta && Array.isArray(meta.geometry)) {
                    return meta.geometry.map(pt => [Number(pt.lat), Number(pt.lon)]).filter(([a,b]) => !Number.isNaN(a) && !Number.isNaN(b));
                  }
                } catch (_) {}
                return [];
              })();
              const line = (geom && geom.length >= 2) ? geom : polyline;
              return line.length > 1 ? (<Polyline positions={line} color="#2563eb" />) : null;
            })()}
            {stops.map((s, idx) => (
              <Marker key={s.id || idx} position={[Number(s.lat || s.latitude), Number(s.lon || s.longitude)]} icon={getIconForStop(s, idx)}>
                <Popup>
                  <div className="text-sm">
                    <div className="font-semibold">Stop #{s.sequenceNo}</div>
                    <div>Type: {s.stopType || 'STOP'}</div>
                    {s.shipment && s.shipment.trackingNumber && <div>Shipment: {s.shipment.trackingNumber}</div>}
                    {s.warehouse && s.warehouse.name && <div>Warehouse: {s.warehouse.name}</div>}
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>
      </div>
    </AdminLayout>
  );
};

export default RoutePlanDetails;








