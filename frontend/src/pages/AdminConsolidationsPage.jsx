import React, { useEffect, useState } from 'react';
import axios from 'axios';
import AdminLayout from '../components/admin/AdminLayout';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';
const DEV_ADMIN_HEADERS = { Authorization: 'Bearer dev-admin-token' };
const ORG_HEADERS = () => ({ Authorization: 'Bearer org-admin-token', 'X-Admin-User-Id': (JSON.parse(localStorage.getItem('user') || '{}').id || '') });
const isOrgAdmin = () => (JSON.parse(localStorage.getItem('user') || '{}').userRole === 'ORGANIZATION_ADMIN');

const AdminConsolidationsPage = () => {
  const [addresses, setAddresses] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [shipments, setShipments] = useState([]);
  const [addrFilter, setAddrFilter] = useState('');
  const [originId, setOriginId] = useState('');
  const [destId, setDestId] = useState('');
  const [originWarehouseId, setOriginWarehouseId] = useState('');
  const [destWarehouseId, setDestWarehouseId] = useState('');
  const [mode, setMode] = useState('addresses'); // 'addresses' | 'warehouses'
  const [selectedShipments, setSelectedShipments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const org = isOrgAdmin();
        const addrsUrl = org ? '/api/org/addresses' : '/api/admin/addresses';
        const shipsUrl = org ? '/api/org/shipments' : '/api/admin/shipments';
        const whUrl = org ? '/api/org/warehouses' : '/api/admin/warehouses';
        const headers = org ? ORG_HEADERS() : DEV_ADMIN_HEADERS;
        const [addrRes, shipRes, whRes] = await Promise.all([
          axios.get(`${API_BASE_URL}${addrsUrl}`, { headers }),
          axios.get(`${API_BASE_URL}${shipsUrl}`, { headers }),
          axios.get(`${API_BASE_URL}${whUrl}`, { headers })
        ]);
        setAddresses(Array.isArray(addrRes.data) ? addrRes.data : []);
        setShipments(Array.isArray(shipRes.data) ? shipRes.data : []);
        setWarehouses(Array.isArray(whRes.data) ? whRes.data : []);
      } catch (e) {
        setError('Failed to load data');
      }
    };
    load();
  }, []);

  const toggleShipment = (id) => {
    setSelectedShipments(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const plan = async () => {
    setLoading(true); setError(''); setResult(null);
    try {
      const payload = mode === 'addresses' ? {
        originAddressId: originId || null,
        destAddressId: destId || null,
        shipmentIds: selectedShipments,
      } : {
        originWarehouseId: originWarehouseId || null,
        destWarehouseId: destWarehouseId || null,
        shipmentIds: selectedShipments,
      };
      const { data } = await axios.post(`${API_BASE_URL}/api/admin/consolidations/plan`, payload, { headers: { ...DEV_ADMIN_HEADERS, 'Content-Type': 'application/json' } });
      setResult(data);
    } catch (e) {
      setError(e?.response?.data?.error || e.message || 'Failed to plan route');
    } finally { setLoading(false); }
  };

  // Hoisted function to safely use before its declaration site
  function formatAddress(a) {
    if (!a) return '';
    const parts = [a.name, a.street, a.city, a.state, a.country, a.postalCode]
      .filter(Boolean)
      .map(x => String(x).trim())
      .filter(x => x.length > 0);
    if (parts.length > 0) return parts.join(', ');
    if (a.latitude != null && a.longitude != null) return `(${a.latitude}, ${a.longitude})`;
    return `Address ${a.id}`;
  }

  const filteredAddresses = addresses.filter(a => {
    const label = (formatAddress(a) || '').toLowerCase();
    const q = addrFilter.trim().toLowerCase();
    return q === '' || label.includes(q);
  });

  const usePickupFromFirst = () => {
    const first = shipments.find(s => selectedShipments.includes(s.id) && s.pickupAddress && s.pickupAddress.id);
    if (first) setOriginId(first.pickupAddress.id);
  };

  const useDeliveryFromLast = () => {
    const sel = shipments.filter(s => selectedShipments.includes(s.id));
    for (let i = sel.length - 1; i >= 0; i--) {
      const d = sel[i]?.deliveryAddress?.id;
      if (d) { setDestId(d); break; }
    }
  };

  // formatAddress moved above to avoid TDZ runtime error

  return (
    <AdminLayout title="Consolidations">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow-sm border p-4">
          <h2 className="font-semibold mb-3">Route Parameters</h2>
          <div className="flex items-center gap-3 mb-3 text-sm">
            <label className="flex items-center gap-2">
              <input type="radio" checked={mode==='addresses'} onChange={()=>setMode('addresses')} /> By Addresses
            </label>
            <label className="flex items-center gap-2">
              <input type="radio" checked={mode==='warehouses'} onChange={()=>setMode('warehouses')} /> By Warehouses
            </label>
          </div>
          <p className="text-xs text-gray-500 mb-2">Pick origin and destination from saved addresses. These come from shipments or your address book.</p>

          {mode === 'addresses' ? (
            <>
              <label className="block text-sm text-gray-700 mb-1">Origin Address</label>
              <select className="w-full border rounded p-2 mb-3" value={originId} onChange={e => setOriginId(e.target.value)}>
                <option value="">Select origin</option>
                {filteredAddresses.map(a => {
                  const label = formatAddress(a);
                  return (
                    <option key={a.id} value={a.id} title={label}>{label}</option>
                  );
                })}
              </select>
            </>
          ) : (
            <>
              <label className="block text-sm text-gray-700 mb-1">Origin Warehouse</label>
              <select className="w-full border rounded p-2 mb-3" value={originWarehouseId} onChange={e => setOriginWarehouseId(e.target.value)}>
                <option value="">Select origin warehouse</option>
                {warehouses.map(w => (
                  <option key={w.id} value={w.id}>{w.code ? `${w.code} - `: ''}{w.name} {w.city ? `(${w.city})`: ''}</option>
                ))}
              </select>
            </>
          )}
          {mode === 'addresses' && (
            <div className="flex items-center gap-2 mb-3">
              <button type="button" onClick={usePickupFromFirst} className="text-xs px-2 py-1 rounded bg-gray-100 hover:bg-gray-200">Use pickup of first selected</button>
            </div>
          )}

          {mode === 'addresses' ? (
            <>
              <label className="block text-sm text-gray-700 mb-1">Destination Address</label>
              <select className="w-full border rounded p-2 mb-3" value={destId} onChange={e => setDestId(e.target.value)}>
                <option value="">Select destination</option>
                {filteredAddresses.map(a => {
                  const label = formatAddress(a);
                  return (
                    <option key={a.id} value={a.id} title={label}>{label}</option>
                  );
                })}
              </select>
              <div className="flex items-center gap-2 mb-3">
                <button type="button" onClick={useDeliveryFromLast} className="text-xs px-2 py-1 rounded bg-gray-100 hover:bg-gray-200">Use delivery of last selected</button>
              </div>
            </>
          ) : (
            <>
              <label className="block text-sm text-gray-700 mb-1">Destination Warehouse</label>
              <select className="w-full border rounded p-2 mb-3" value={destWarehouseId} onChange={e => setDestWarehouseId(e.target.value)}>
                <option value="">Select destination warehouse</option>
                {warehouses.map(w => (
                  <option key={w.id} value={w.id}>{w.code ? `${w.code} - `: ''}{w.name} {w.city ? `(${w.city})`: ''}</option>
                ))}
              </select>
            </>
          )}
          <button disabled={loading || (mode==='addresses' ? (!originId || !destId) : (!originWarehouseId || !destWarehouseId)) || selectedShipments.length === 0}
                  onClick={plan}
                  className={`w-full py-2 rounded ${ (loading || (mode==='addresses' ? (!originId || !destId) : (!originWarehouseId || !destWarehouseId)) || selectedShipments.length === 0) ? 'bg-gray-300 text-gray-600' : 'bg-doni-blue text-white hover:opacity-90'}`}>
            {loading ? 'Planning…' : 'Plan Consolidation Route'}
          </button>
          {error && <div className="mt-3 text-sm text-red-600">{error}</div>}
          {result && (
            <div className="mt-3 text-sm text-green-700">
              Planned. RoutePlan ID: <span className="font-mono">{result.routePlanId}</span>
              <a className="ml-3 text-blue-600 underline" href={`/admin/route-plan/${encodeURIComponent(result.routePlanId)}`}>Open map</a>
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-4 lg:col-span-2">
          <h2 className="font-semibold mb-3">Select Shipments</h2>
          <div className="flex items-center gap-2 mb-3">
            <input
              className="border rounded px-2 py-1 text-sm w-full md:w-80"
              placeholder="Filter addresses by name/city/country..."
              value={addrFilter}
              onChange={(e) => setAddrFilter(e.target.value)}
            />
            <span className="text-xs text-gray-500">{filteredAddresses.length} of {addresses.length}</span>
          </div>
          {addresses.length === 0 && (
            <div className="mb-3 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded p-2">
              No addresses found. Create a shipment with pickup/delivery addresses first, then return here.
            </div>
          )}
          <div className="max-h-[60vh] overflow-auto divide-y">
            {shipments.map(s => (
              <label key={s.id} className="flex items-center gap-3 p-2 cursor-pointer">
                <input type="checkbox" className="w-4 h-4" checked={selectedShipments.includes(s.id)} onChange={() => toggleShipment(s.id)} />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-gray-900 truncate">{s.trackingNumber || s.externalOrderId || s.id}</div>
                  <div className="text-xs text-gray-600 truncate">{s.commodityType || 'General'} • {s.weightKg ? `${s.weightKg} kg` : '—'}</div>
                  <div className="text-[11px] text-gray-500 truncate">
                    <span className="mr-2">Pickup: {s.pickupAddress ? (s.pickupAddress.city || s.pickupAddress.country || s.pickupAddress.id) : '—'}</span>
                    <span>Dest: {s.deliveryAddress ? (s.deliveryAddress.city || s.deliveryAddress.country || s.deliveryAddress.id) : '—'}</span>
                  </div>
                </div>
              </label>
            ))}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminConsolidationsPage;




