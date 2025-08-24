import React, { useEffect, useState } from 'react';
import axios from 'axios';
import AdminLayout from '../components/admin/AdminLayout';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';

const AdminNotificationsPage = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const headers = { Authorization: 'Bearer dev-admin-token' };

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(`${API_BASE_URL}/api/admin/notifications`, { headers });
      setItems(Array.isArray(data) ? data : []);
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const markRead = async (id) => {
    await axios.post(`${API_BASE_URL}/api/admin/notifications/${id}/read`, {}, { headers });
    setItems(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  return (
    <AdminLayout title="Notifications">
      {loading ? (
        <div>Loading...</div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Title</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Message</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Read</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Created</th>
                  <th className="px-6 py-3"></th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {items.map(n => (
                  <tr key={n.id} className={n.read ? '' : 'bg-blue-50'}>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{n.title || 'Notification'}</td>
                    <td className="px-6 py-4 text-sm text-gray-700 max-w-xl truncate" title={n.message}>{n.message}</td>
                    <td className="px-6 py-4 text-sm text-gray-700">{n.type}</td>
                    <td className="px-6 py-4 text-sm text-gray-700">{n.status}</td>
                    <td className="px-6 py-4 text-sm text-gray-700">{n.read ? 'Yes' : 'No'}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{n.createdAt ? new Date(n.createdAt).toLocaleString() : ''}</td>
                    <td className="px-6 py-4 text-right">
                      {!n.read && (
                        <button onClick={() => markRead(n.id)} className="text-blue-600 hover:underline text-sm">Mark read</button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminNotificationsPage;


