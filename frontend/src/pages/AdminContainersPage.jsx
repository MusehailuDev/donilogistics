import React, { useState, useEffect } from 'react';
import axios from 'axios';
import AdminLayout from '../components/admin/AdminLayout';
import { API_BASE_URL } from '../services/api';

const AdminContainersPage = () => {
  const [containers, setContainers] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    containerNumber: '', type: '', status: '', ownerName: '', ownerEmail: '', ownerPhone: '', assetTag: '',
    manufactureYear: '', tareWeightKg: '', maxGrossWeightKg: '', maxVolumeM3: '', currentWarehouseId: ''
  });
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
      const contPath = headers.Authorization === 'Bearer org-admin-token' ? '/api/org/containers' : '/api/admin/containers';
      const whPath = headers.Authorization === 'Bearer org-admin-token' ? '/api/org/warehouses' : '/api/admin/warehouses';
      const [cont, wh] = await Promise.all([
        axios.get(`${API_BASE_URL}${contPath}`, { headers }),
        axios.get(`${API_BASE_URL}${whPath}`, { headers })
      ]);
      setContainers(cont.data || []);
      setWarehouses(wh.data || []);
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const create = async () => {
    const path = headers.Authorization === 'Bearer org-admin-token' ? '/api/org/containers' : '/api/admin/containers';
    await axios.post(`${API_BASE_URL}${path}`, form, { headers });
    setShowModal(false);
    setForm({ containerNumber: '', type: '', status: '', ownerName: '', ownerEmail: '', ownerPhone: '', assetTag: '', manufactureYear: '', tareWeightKg: '', maxGrossWeightKg: '', maxVolumeM3: '', currentWarehouseId: '' });
    load();
  };

  return (
    <AdminLayout title="Containers">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">All Containers</h2>
        <button className="btn-primary" onClick={() => setShowModal(true)}>New Container</button>
      </div>
      {loading ? (
        <div>Loading...</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white rounded-lg">
            <thead>
              <tr className="text-left text-sm text-gray-600">
                <th className="p-3">Number</th>
                <th className="p-3">Type</th>
                <th className="p-3">Status</th>
                <th className="p-3">Owner</th>
                <th className="p-3">Warehouse</th>
              </tr>
            </thead>
            <tbody>
              {containers.map(c => (
                <tr key={c.id} className="border-t">
                  <td className="p-3 font-medium">{c.containerNumber}</td>
                  <td className="p-3">{c.type}</td>
                  <td className="p-3">{c.status}</td>
                  <td className="p-3">{c.ownerName || ''}</td>
                  <td className="p-3">{c.currentWarehouse?.name || ''}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
            <h3 className="text-lg font-semibold mb-4">Create Container</h3>
            <div className="grid grid-cols-2 gap-3">
              <input className="input-field" placeholder="Container Number" value={form.containerNumber} onChange={e => setForm({ ...form, containerNumber: e.target.value })} />
              <input className="input-field" placeholder="Type (e.g., 40HC)" value={form.type} onChange={e => setForm({ ...form, type: e.target.value })} />
              <input className="input-field" placeholder="Status" value={form.status} onChange={e => setForm({ ...form, status: e.target.value })} />
              <input className="input-field" placeholder="Owner Name" value={form.ownerName} onChange={e => setForm({ ...form, ownerName: e.target.value })} />
              <input className="input-field" placeholder="Owner Email" value={form.ownerEmail} onChange={e => setForm({ ...form, ownerEmail: e.target.value })} />
              <input className="input-field" placeholder="Owner Phone" value={form.ownerPhone} onChange={e => setForm({ ...form, ownerPhone: e.target.value })} />
              <input className="input-field" placeholder="Asset Tag" value={form.assetTag} onChange={e => setForm({ ...form, assetTag: e.target.value })} />
              <input className="input-field" placeholder="Manufacture Year" value={form.manufactureYear} onChange={e => setForm({ ...form, manufactureYear: e.target.value })} />
              <input className="input-field" placeholder="Tare Weight (kg)" value={form.tareWeightKg} onChange={e => setForm({ ...form, tareWeightKg: e.target.value })} />
              <input className="input-field" placeholder="Max Gross (kg)" value={form.maxGrossWeightKg} onChange={e => setForm({ ...form, maxGrossWeightKg: e.target.value })} />
              <input className="input-field" placeholder="Max Volume (m3)" value={form.maxVolumeM3} onChange={e => setForm({ ...form, maxVolumeM3: e.target.value })} />
              <select className="input-field" value={form.currentWarehouseId} onChange={e => setForm({ ...form, currentWarehouseId: e.target.value })}>
                <option value="">Select Warehouse</option>
                {warehouses.map(w => (
                  <option key={w.id} value={w.id}>{w.name}</option>
                ))}
              </select>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button className="btn-outline" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="btn-primary" onClick={create}>Create</button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminContainersPage;


