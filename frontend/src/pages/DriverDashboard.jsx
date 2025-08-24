import React, { useEffect, useMemo, useState } from 'react';
import { toast } from 'react-hot-toast';
import { FaMapMarkerAlt, FaCrosshairs, FaCheck } from 'react-icons/fa';
import LocationPicker from '../components/LocationPicker';
import { adminAPI } from '../services/api';
import { MapContainer, TileLayer, Marker, Polyline, useMap } from 'react-leaflet';
import { Icon, latLngBounds } from 'leaflet';
import 'leaflet/dist/leaflet.css';

const DriverDashboard = () => {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('user') || '{}'); } catch { return {}; }
  });
  const [driver, setDriver] = useState(null);
  const [loading, setLoading] = useState(true);
  const [shipments, setShipments] = useState([]);
  const [acceptedShipmentIds] = useState(() => new Set());
  const [mutatingId, setMutatingId] = useState(null);
  const [liveTracking, setLiveTracking] = useState(false);
  const [geoWatchId, setGeoWatchId] = useState(null);
  const [showLocationPicker, setShowLocationPicker] = useState(false);
  const [localLocation, setLocalLocation] = useState(null);
  const [navMode, setNavMode] = useState(false);
  const [routeCoords, setRouteCoords] = useState([]);
  const [selectedShipmentId, setSelectedShipmentId] = useState(null);
  const [lastRouteFetchAt, setLastRouteFetchAt] = useState(0);

  const ensureDriverProfile = async (drivers) => {
    const meUserId = user?.id;
    if (!meUserId) return null;
    const existing = (drivers || []).find(d => d.user?.id === meUserId);
    if (existing) return existing;
    // auto-create minimal driver profile for this user (dev convenience)
    try {
      const orgId = user?.organization?.id || null;
      const res = await adminAPI.createDriver({ userId: meUserId, organizationId: orgId, active: true });
      const createdId = res?.data?.id;
      if (createdId) {
        const refreshed = await adminAPI.listDrivers();
        return (refreshed.data || []).find(d => d.id === createdId) || null;
      }
    } catch {}
    return null;
  };

  const load = async () => {
    setLoading(true);
    try {
      const [driversRes, shipmentsRes] = await Promise.all([
        adminAPI.listDrivers(),
        adminAPI.listShipments(),
      ]);
      let me = (driversRes.data || []).find(d => d.user?.id === user.id);
      if (!me && user?.userRole === 'DRIVER') {
        me = await ensureDriverProfile(driversRes.data);
      }
      setDriver(me || null);
      setShipments(shipmentsRes.data || []);
    } catch (e) {
      toast.error('Failed to load driver data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  // Poll current driver location every 5s
  useEffect(() => {
    if (!driver) return;
    const t = setInterval(async () => {
      try { await load(); } catch {}
    }, 5000);
    return () => clearInterval(t);
  }, [driver?.id]);

  const availableShipments = useMemo(() => {
    const orgId = user?.organization?.id;
    const list = Array.isArray(shipments) ? shipments : [];
    return list.filter(s => !orgId || (s.customer && s.customer.id === orgId));
  }, [shipments, user]);

  const refreshRoute = async (shipmentId, driverProfileId) => {
    try {
      const base = process.env.REACT_APP_API_URL || 'http://localhost:8080';
      const url = `${base}/api/admin/shipments/${shipmentId}/route${driverProfileId ? `?driverProfileId=${driverProfileId}` : ''}`;
      const res = await fetch(url, { headers: { Authorization: 'Bearer dev-admin-token' } });
      const data = await res.json();
      if (Array.isArray(data?.geometry) && data.geometry.length > 1) {
        setRouteCoords(data.geometry.map(p => [p[0], p[1]]));
      } else {
        setRouteCoords([]);
      }
      setNavMode(true);
      setLastRouteFetchAt(Date.now());
    } catch (e) {
      // keep navMode but no route yet
      setNavMode(true);
    }
  };

  const acceptShipment = async (shipmentId) => {
    if (!user?.id) return toast.error('No user');
    try {
      setMutatingId(shipmentId);
      await adminAPI.acceptShipment(shipmentId, user.id);
      toast.success('Shipment accepted');
      await load();
      setSelectedShipmentId(shipmentId);
      await refreshRoute(shipmentId, (driver && driver.id) || null);
    } catch (e) {
      const msg = e?.response?.data?.error || e?.message || 'Accept failed';
      toast.error(`Accept failed: ${msg}`);
    }
    setMutatingId(null);
  };

  const startLive = async () => {
    if (!driver) return toast.error('No driver profile');
    if (!navigator.geolocation) return toast.error('Geolocation not available');
    if (geoWatchId) return;
    const id = navigator.geolocation.watchPosition(async (pos) => {
      try {
        await adminAPI.updateDriverLocation(driver.id, pos.coords.latitude, pos.coords.longitude);
        setLocalLocation({ latitude: pos.coords.latitude, longitude: pos.coords.longitude });
        if (navMode && selectedShipmentId && Date.now() - lastRouteFetchAt > 10000) {
          await refreshRoute(selectedShipmentId, driver.id);
        }
      } catch (e) {
        // avoid spamming
      }
    }, () => {}, { enableHighAccuracy: true, maximumAge: 5000, timeout: 10000 });
    setGeoWatchId(id);
    setLiveTracking(true);
    toast.success('Live tracking started');
  };

  const stopLive = () => {
    if (geoWatchId) {
      navigator.geolocation.clearWatch(geoWatchId);
      setGeoWatchId(null);
    }
    setLiveTracking(false);
    toast('Live tracking stopped');
  };

  const currentLat = (localLocation?.latitude) ?? (driver?.currentLatitude ?? null);
  const currentLon = (localLocation?.longitude) ?? (driver?.currentLongitude ?? null);
  const hasLocation = typeof currentLat === 'number' && typeof currentLon === 'number';
  const center = hasLocation ? [currentLat, currentLon] : [52.2297, 21.0122];

  const rejectShipment = async (shipmentId) => {
    try {
      setMutatingId(shipmentId);
      await adminAPI.rejectShipment(shipmentId);
      toast.success('Shipment rejected');
      await load();
      setNavMode(false);
      setRouteCoords([]);
    } catch (e) {
      const msg = e?.response?.data?.error || e?.message || 'Reject failed';
      toast.error(`Reject failed: ${msg}`);
    }
    setMutatingId(null);
  };

  const useGps = async () => {
    if (!driver) return toast.error('No driver profile');
    if (!navigator.geolocation) return toast.error('Geolocation not available');
    const opts = { enableHighAccuracy: true, maximumAge: 0, timeout: 20000 };
    const onSuccess = async (pos) => {
      try {
        await adminAPI.updateDriverLocation(driver.id, pos.coords.latitude, pos.coords.longitude);
        toast.success('Location updated');
        setLocalLocation({ latitude: pos.coords.latitude, longitude: pos.coords.longitude });
        await load();
      } catch {
        toast.error('Failed to update location');
      }
    };
    const onError = (err) => {
      const code = err && typeof err.code === 'number' ? err.code : null;
      const msg = err && err.message ? err.message : 'GPS failed';
      if (code === 1) {
        toast.error('Location permission denied');
        return;
      }
      // Fallback: try watchPosition once for a fresh fix
      let got = false;
      const wid = navigator.geolocation.watchPosition(async (p) => {
        got = true;
        navigator.geolocation.clearWatch(wid);
        await onSuccess(p);
      }, (e2) => {
        navigator.geolocation.clearWatch(wid);
        toast.error(`GPS failed: ${e2?.message || msg}`);
      }, opts);
      // Safety timeout to cleanup watch if no callback
      setTimeout(() => {
        if (!got) {
          try { navigator.geolocation.clearWatch(wid); } catch {}
        }
      }, 25000);
      // IP-based approximate fallback after a short delay if still no fix
      setTimeout(async () => {
        if (got) return;
        try {
          const resp = await fetch('https://ipapi.co/json/');
          if (resp.ok) {
            const j = await resp.json();
            if (j && typeof j.latitude === 'number' && typeof j.longitude === 'number') {
              await adminAPI.updateDriverLocation(driver.id, j.latitude, j.longitude);
              setLocalLocation({ latitude: j.latitude, longitude: j.longitude });
              toast.success('Used approximate IP location');
              await load();
              return;
            }
          }
        } catch {}
      }, 5000);
    };
    try {
      // Optional: preflight permission
      if (navigator.permissions && navigator.permissions.query) {
        try {
          const st = await navigator.permissions.query({ name: 'geolocation' });
          if (st.state === 'denied') {
            toast.error('Location permission denied in browser settings');
            return;
          }
        } catch {}
      }
      navigator.geolocation.getCurrentPosition(onSuccess, onError, opts);
    } catch (e) {
      toast.error('GPS failed to start');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto p-4 md:p-6">
        <h1 className="text-2xl font-bold mb-4">Driver Portal</h1>

        {/* Profile */}
        <div className="bg-white shadow rounded p-4 mb-6">
          <h2 className="text-md font-semibold mb-2">My Profile</h2>
          {loading ? (
            <p className="text-gray-500">Loading...</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
              <div>
                <div className="text-gray-500">Username</div>
                <div className="font-medium">{user.username || '-'}</div>
              </div>
              <div>
                <div className="text-gray-500">Organization</div>
                <div className="font-medium">{user.organization?.name || '-'}</div>
              </div>
              <div>
                <div className="text-gray-500">Driver Profile</div>
                <div className="font-medium">{driver ? 'Found' : 'Not Found'}</div>
              </div>
            </div>
          )}
        </div>

        {/* Location */}
        <div className="bg-white shadow rounded p-4 mb-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-md font-semibold">My Current Location</h2>
            <div className="flex items-center gap-2">
              <button className="px-3 py-1 rounded bg-gray-100 hover:bg-gray-200" onClick={useGps} disabled={!driver}><FaCrosshairs className="inline" /> <span className="ml-1">Use GPS</span></button>
              <button className="px-3 py-1 rounded bg-gray-100 hover:bg-gray-200" onClick={() => setShowLocationPicker(true)} disabled={!driver}><FaMapMarkerAlt className="inline" /> <span className="ml-1">Choose on Map</span></button>
              {!liveTracking ? (
                <button className="px-3 py-1 rounded bg-green-100 text-green-700 hover:bg-green-200" onClick={startLive} disabled={!driver}>Start Live</button>
              ) : (
                <button className="px-3 py-1 rounded bg-red-100 text-red-700 hover:bg-red-200" onClick={stopLive}>Stop Live</button>
              )}
            </div>
          </div>
          {driver ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
              <div>
                <div className="text-gray-500">Latitude</div>
                <div className="font-mono">{(localLocation?.latitude) ?? (driver.currentLatitude ?? '-')}</div>
              </div>
              <div>
                <div className="text-gray-500">Longitude</div>
                <div className="font-mono">{(localLocation?.longitude) ?? (driver.currentLongitude ?? '-')}</div>
              </div>
              <div>
                <div className="text-gray-500">Last Seen</div>
                <div className="font-mono">{driver.lastSeen || '-'}</div>
              </div>
              <div className="md:col-span-3 mt-3">
                <div style={{ height: 300 }} className="rounded overflow-hidden border">
                  <MapContainer center={center} zoom={hasLocation ? 14 : 7} style={{ height: '100%', width: '100%' }}>
                    <TileLayer
                      attribution='&copy; OpenStreetMap contributors'
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    {hasLocation && (
                      <Marker position={[currentLat, currentLon]} icon={new Icon({ iconUrl: require('leaflet/dist/images/marker-icon.png'), iconSize: [25,41], iconAnchor: [12,41] })} />
                    )}
                    {navMode && routeCoords.length > 1 && (
                      <Polyline positions={routeCoords} pathOptions={{ color: 'blue', weight: 5, opacity: 0.7 }} />
                    )}
                  </MapContainer>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-gray-500 text-sm">No driver profile found. Ask admin to create one.</p>
          )}
        </div>

        {/* Shipments (Demo acceptance) */}
        <div className="bg-white shadow rounded p-4 mb-6">
          <h2 className="text-md font-semibold mb-3">Available Shipments (Demo)</h2>
          {availableShipments.length === 0 ? (
            <p className="text-gray-500 text-sm">No shipments available.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-left">
                <thead>
                  <tr className="border-b">
                    <th className="py-2 px-2">Tracking</th>
                    <th className="py-2 px-2">Commodity</th>
                    <th className="py-2 px-2">Weight (kg)</th>
                    <th className="py-2 px-2">Status</th>
                    <th className="py-2 px-2">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {availableShipments.map(s => {
                    const isAssigned = !!s.assignedDriver;
                    const isMine = isAssigned && s.assignedDriver.id === user.id;
                    return (
                    <tr key={s.id} className="border-b">
                      <td className="py-2 px-2 font-mono text-sm">{s.trackingNumber || '-'}</td>
                      <td className="py-2 px-2">{s.commodityType || '-'}</td>
                      <td className="py-2 px-2">{s.weightKg || '-'}</td>
                      <td className="py-2 px-2">
                        <div className="flex flex-col">
                          <span>{s.status || '-'}</span>
                          {isAssigned && (
                            <span className="text-xs text-gray-500">Assigned to {isMine ? 'you' : (s.assignedDriver.username || 'driver')}</span>
                          )}
                        </div>
                      </td>
                      <td className="py-2 px-2">
                        <div className="flex items-center gap-2">
                          <button
                            className="px-3 py-1 rounded bg-green-600 text-white hover:bg-green-700 disabled:opacity-50"
                            onClick={() => acceptShipment(s.id)}
                            disabled={isAssigned || mutatingId === s.id}
                          >
                            <FaCheck className="inline mr-1" /> {mutatingId === s.id ? 'Working...' : 'Accept'}
                          </button>
                          <button
                            className="px-3 py-1 rounded bg-red-600 text-white hover:bg-red-700 disabled:opacity-50"
                            onClick={() => rejectShipment(s.id)}
                            disabled={(!isMine && isAssigned) || mutatingId === s.id}
                          >
                            {mutatingId === s.id ? 'Working...' : (isMine ? 'Reject' : 'Decline')}
                          </button>
                        </div>
                      </td>
                    </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
          <p className="text-xs text-gray-500 mt-2">Only your organization's shipments are listed. Assigned shipments show driver and disable Accept.</p>
        </div>

        {!!showLocationPicker && driver && (
          <LocationPicker
            isOpen={!!showLocationPicker}
            onClose={() => setShowLocationPicker(false)}
            onLocationSelect={async (loc) => {
              try {
                await adminAPI.updateDriverLocation(driver.id, loc.latitude, loc.longitude);
                toast.success('Location updated');
                setLocalLocation(loc);
                setShowLocationPicker(false);
                await load();
              } catch { toast.error('Failed to update'); }
            }}
            type="driver"
            initialPosition={[52.2297, 21.0122]}
          />
        )}
      </div>
    </div>
  );
};

export default DriverDashboard;


