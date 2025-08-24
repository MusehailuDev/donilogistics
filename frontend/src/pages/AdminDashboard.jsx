import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import AdminLayout from '../components/admin/AdminLayout';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, Legend, PieChart, Pie, Cell } from 'recharts';
import { adminAPI, orgAdminAPI } from '../services/api';

const Card = ({ title, count, to }) => (
  <Link to={to} className="block bg-white rounded-lg shadow p-5 hover:shadow-md transition">
    <div className="text-sm text-gray-500">{title}</div>
    <div className="text-3xl font-bold mt-2">{count ?? '—'}</div>
  </Link>
);

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [orgCount, setOrgCount] = useState(null);
  const [userCount, setUserCount] = useState(null);
  const [trackingInput, setTrackingInput] = useState('');
  const [shipments, setShipments] = useState([]);

  useEffect(() => {
    const load = async () => {
      try {
        const base = process.env.REACT_APP_API_URL || 'http://localhost:8080';
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        if (user?.userRole === 'ORGANIZATION_ADMIN') {
          // For org admins, show only org-scoped counts (users)
          const usersRes = await axios.get(`${base}/api/org/users`, { headers: { Authorization: 'Bearer org-admin-token', 'X-Admin-User-Id': user.id } });
          setOrgCount(1);
          setUserCount(Array.isArray(usersRes.data) ? usersRes.data.length : null);
          try {
            const shipRes = await orgAdminAPI.listShipments();
            setShipments(Array.isArray(shipRes.data) ? shipRes.data : []);
          } catch {
            setShipments([]);
          }
        } else {
          const { data } = await axios.get(`${base}/api/admin/metrics`, { headers: { Authorization: 'Bearer dev-admin-token' } });
          setOrgCount(data.organizations);
          setUserCount(data.users);
          try {
            const shipRes = await adminAPI.listShipments();
            setShipments(Array.isArray(shipRes.data) ? shipRes.data : []);
          } catch {
            setShipments([]);
          }
        }
      } catch {
        setOrgCount(null);
        setUserCount(null);
        setShipments([]);
      }
    };
    load();
  }, []);

  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const isOrgAdmin = user?.userRole === 'ORGANIZATION_ADMIN';

  const statusData = useMemo(() => {
    const counts = shipments.reduce((acc, s) => {
      const st = s.status || 'UNKNOWN';
      acc[st] = (acc[st] || 0) + 1;
      return acc;
    }, {});
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [shipments]);

  const dailyCreated = useMemo(() => {
    const map = new Map();
    shipments.forEach((s) => {
      const d = s.createdAt ? new Date(s.createdAt) : null;
      if (!d) return;
      const key = d.toISOString().slice(0, 10);
      map.set(key, (map.get(key) || 0) + 1);
    });
    return Array.from(map.entries())
      .sort(([a], [b]) => (a < b ? -1 : 1))
      .map(([date, count]) => ({ date, count }));
  }, [shipments]);

  const COLORS = ['#2563eb', '#16a34a', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];
  return (
    <AdminLayout title={isOrgAdmin ? 'Organization Admin' : 'Super Admin Dashboard'}>
      <div className="bg-white rounded-lg shadow p-5 mb-6">
        <div className="text-sm text-gray-500 mb-2">Track a shipment</div>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Enter tracking number"
            value={trackingInput}
            onChange={(e) => setTrackingInput(e.target.value)}
            className="flex-1 border border-gray-300 rounded-md px-3 py-2"
          />
          <button
            onClick={() => { if (trackingInput.trim()) navigate(`/track/${encodeURIComponent(trackingInput.trim())}`); }}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Track
          </button>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {!isOrgAdmin && <Card title="Organizations" count={orgCount} to="/admin/orgs" />}
        <Card title="Users" count={userCount} to="/admin/users" />
        <Card title="Fleet / Vehicles" count={null} to="/admin/vehicles" />
        <Card title="Drivers" count={null} to="/admin/drivers" />
        <Card title="Shipments" count={null} to="/admin/shipments" />
        <Card title="Warehouses" count={null} to="/admin/warehouses" />
        <Card title="Containers" count={null} to="/admin/containers" />
        <Card title="Consolidations" count={null} to="/admin/consolidations" />
        <Card title="Routes" count={null} to="/admin/routes" />
        <Card title="Tracking" count={null} to="/admin/tracking" />
      </div>

      <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-4 col-span-2">
          <div className="font-medium text-gray-700 mb-2">Shipments created per day</div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={dailyCreated} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="count" name="Shipments" stroke="#2563eb" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="font-medium text-gray-700 mb-2">Shipment status distribution</div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={statusData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;


