import React, { useState, useEffect } from 'react';
import axios from 'axios';
import AdminLayout from '../components/admin/AdminLayout';
import { API_BASE_URL } from '../services/api';
import LocationPicker from '../components/LocationPicker';
import { FaMapMarkerAlt } from 'react-icons/fa';

const AdminWarehousesPage = () => {
  const [warehouses, setWarehouses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: '', code: '', city: '', country: '', latitude: '', longitude: '', managerUserId: '' });
  const [showLocationPicker, setShowLocationPicker] = useState(false);
  const [users, setUsers] = useState([]);

  const headers = (() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (user?.userRole === 'ORGANIZATION_ADMIN') {
      return { Authorization: 'Bearer org-admin-token', 'X-Admin-User-Id': user.id, 'Content-Type': 'application/json' };
    }
    return { Authorization: 'Bearer dev-admin-token', 'Content-Type': 'application/json' };
  })();

  const load = async () => {
    setLoading(true);
    try {
      const path = headers.Authorization === 'Bearer org-admin-token' ? '/api/org/warehouses' : '/api/admin/warehouses';
      const { data } = await axios.get(`${API_BASE_URL}${path}`, { headers });
      setWarehouses(data);
      const usersRes = await axios.get(`${API_BASE_URL}/api/admin/users`, { headers });
      const warehouseManagers = (usersRes.data || []).filter(u => u.userRole === 'WAREHOUSE_MANAGER');
      setUsers(warehouseManagers);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const create = async () => {
    const path = headers.Authorization === 'Bearer org-admin-token' ? '/api/org/warehouses' : '/api/admin/warehouses';
    await axios.post(`${API_BASE_URL}${path}`, form, { headers });
    setShowModal(false);
    setForm({ name: '', code: '', city: '', country: '', latitude: '', longitude: '' });
    load();
  };

  return (
    <AdminLayout title="Warehouses">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">All Warehouses</h2>
        <button className="btn-primary" onClick={() => setShowModal(true)}>New Warehouse</button>
      </div>
      {loading ? (
        <div>Loading...</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white rounded-lg">
            <thead>
              <tr className="text-left text-sm text-gray-600">
                <th className="p-3">Name</th>
                <th className="p-3">Code</th>
                <th className="p-3">City</th>
                <th className="p-3">Country</th>
                <th className="p-3">Lat</th>
                <th className="p-3">Lng</th>
              </tr>
            </thead>
            <tbody>
              {warehouses.map(w => (
                <tr key={w.id} className="border-t">
                  <td className="p-3">{w.name}</td>
                  <td className="p-3">{w.code}</td>
                  <td className="p-3">{w.city}</td>
                  <td className="p-3">{w.country}</td>
                  <td className="p-3">{w.latitude ?? ''}</td>
                  <td className="p-3">{w.longitude ?? ''}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg">
            <h3 className="text-lg font-semibold mb-4">Create Warehouse</h3>
            <div className="grid grid-cols-2 gap-3">
              <input className="input-field" placeholder="Name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
              <input className="input-field" placeholder="Code" value={form.code} onChange={e => setForm({ ...form, code: e.target.value })} />
              <input className="input-field" placeholder="City" value={form.city} onChange={e => setForm({ ...form, city: e.target.value })} />
              <input className="input-field" placeholder="Country (ISO e.g. ET)" value={form.country} onChange={e => setForm({ ...form, country: e.target.value })} />
              <div className="col-span-2 grid grid-cols-1 md:grid-cols-3 gap-3 items-end">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Latitude</label>
                  <input className="input-field w-full" placeholder="Latitude" value={form.latitude} onChange={e => setForm({ ...form, latitude: e.target.value })} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Longitude</label>
                  <input className="input-field w-full" placeholder="Longitude" value={form.longitude} onChange={e => setForm({ ...form, longitude: e.target.value })} />
                </div>
                <div className="flex md:justify-end">
                  <button type="button" onClick={() => setShowLocationPicker(true)} className="flex items-center gap-2 px-3 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700">
                    <FaMapMarkerAlt size={14} />
                    Choose on Map
                  </button>
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button className="btn-outline" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="btn-primary" onClick={create}>Create</button>
            </div>
          </div>
        </div>
      )}

      <LocationPicker
        isOpen={showLocationPicker}
        onClose={() => setShowLocationPicker(false)}
        onLocationSelect={(location) => {
          setForm({ ...form, latitude: location.latitude.toString(), longitude: location.longitude.toString() });
          setShowLocationPicker(false);
        }}
        type="warehouse"
        initialPosition={[parseFloat(form.latitude) || 52.2297, parseFloat(form.longitude) || 21.0122]}
      />
    </AdminLayout>
  );
};

export default AdminWarehousesPage;


