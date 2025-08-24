import React, { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Users, Building2, Truck, Car, Package, Warehouse, Boxes, Layers, Map, SatelliteDish, LogOut, XCircle, Bell } from 'lucide-react';
import axios from 'axios';
import Logo from '../Logo';
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';
const DEV_ADMIN_HEADERS = { Authorization: 'Bearer dev-admin-token' };

const navItems = [
  { label: 'Dashboard', to: '/admin', icon: LayoutDashboard },
  { label: 'Organizations', to: '/admin/orgs', icon: Building2 },
  { label: 'Users', to: '/admin/users', icon: Users },
  { label: 'Fleet / Vehicles', to: '/admin/vehicles', icon: Truck },
  { label: 'Drivers', to: '/admin/drivers', icon: Car },
  { label: 'Shipments', to: '/admin/shipments', icon: Package },
  { label: 'Warehouses', to: '/admin/warehouses', icon: Warehouse },
  { label: 'Containers', to: '/admin/containers', icon: Boxes },
  { label: 'Consolidations', to: '/admin/consolidations', icon: Layers },
  { label: 'Routes', to: '/admin/routes', icon: Map },
  { label: 'Tracking', to: '/admin/tracking', icon: SatelliteDish },
  { label: 'Notifications', to: '/admin/notifications', icon: Bell },
];

const SidebarLink = ({ to, icon: Icon, label, active }) => (
  <Link
    to={to}
    className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
      active ? 'bg-blue-100 text-doni-blue font-semibold' : 'text-gray-700 hover:bg-gray-100'
    }`}
  >
    <Icon size={18} />
    <span className="truncate">{label}</span>
  </Link>
);

const AdminLayout = ({ title, children }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const [notifications, setNotifications] = useState([]);
  const [loadingNotif, setLoadingNotif] = useState(false);
  const [showNotif, setShowNotif] = useState(false);

  const unreadCount = useMemo(() => notifications.filter(n => !n.read).length, [notifications]);

  const fetchNotifications = async () => {
    setLoadingNotif(true);
    try {
      const { data } = await axios.get(`${API_BASE_URL}/api/admin/notifications`, { headers: DEV_ADMIN_HEADERS });
      setNotifications(Array.isArray(data) ? data.slice(0, 10) : []);
    } catch (_) { /* noop */ }
    finally { setLoadingNotif(false); }
  };

  const markRead = async (id) => {
    try {
      await axios.post(`${API_BASE_URL}/api/admin/notifications/${id}/read`, {}, { headers: DEV_ADMIN_HEADERS });
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    } catch (_) { /* noop */ }
  };

  useEffect(() => {
    fetchNotifications();
    const t = setInterval(fetchNotifications, 20000);
    return () => clearInterval(t);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const handleClose = () => {
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white/80 backdrop-blur border-r hidden md:flex md:flex-col">
        <div className="h-16 px-4 flex items-center border-b">
          <Logo size="md" />
        </div>
        <nav className="p-3 space-y-1 overflow-y-auto">
          {navItems.map(item => (
            <SidebarLink
              key={item.to}
              to={item.to}
              icon={item.icon}
              label={item.label}
              active={location.pathname === item.to}
            />
          ))}
        </nav>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="bg-white/60 backdrop-blur-md shadow-sm relative">
          <div className="h-16 px-2 sm:px-4 flex items-center justify-between">
            <div className="flex items-center gap-3 md:hidden">
              <Logo size="sm" />
            </div>
            <h1 className="text-lg font-semibold truncate">{title || 'Super Admin'}</h1>
            <div className="flex items-center gap-2 relative">
              <button
                onClick={() => setShowNotif(v => !v)}
                className="relative p-2 rounded-lg hover:bg-gray-100 text-gray-700"
                aria-label="Notifications"
              >
                <Bell size={18} />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] leading-none px-1.5 py-0.5 rounded-full">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>
              {showNotif && (
                <div className="absolute right-0 top-10 w-80 bg-white/95 backdrop-blur border rounded-lg shadow-lg z-20">
                  <div className="p-3 border-b flex items-center justify-between">
                    <span className="text-sm font-semibold">Notifications</span>
                    <button className="text-xs text-blue-600 hover:underline" onClick={() => { setShowNotif(false); navigate('/admin/notifications'); }}>View all</button>
                  </div>
                  <div className="max-h-80 overflow-auto">
                    {loadingNotif ? (
                      <div className="p-4 text-sm text-gray-500">Loading…</div>
                    ) : notifications.length === 0 ? (
                      <div className="p-4 text-sm text-gray-500">No notifications</div>
                    ) : notifications.map(n => (
                      <div key={n.id} className={`p-3 border-b last:border-b-0 ${n.read ? 'bg-white' : 'bg-blue-50'}`}>
                        <div className="flex items-start gap-2">
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium text-gray-900 truncate">{n.title || 'Notification'}</div>
                            <div className="text-xs text-gray-600 truncate" title={n.message}>{n.message}</div>
                            <div className="text-[10px] text-gray-400 mt-1">{n.createdAt ? new Date(n.createdAt).toLocaleString() : ''}</div>
                          </div>
                          {!n.read && (
                            <button className="text-[11px] text-blue-600 hover:underline whitespace-nowrap" onClick={() => markRead(n.id)}>Mark read</button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <button onClick={handleClose} className="flex items-center gap-2 px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-100">
                <XCircle size={18} />
                <span className="hidden sm:inline">Close</span>
              </button>
              <button onClick={handleLogout} className="flex items-center gap-2 px-3 py-2 rounded-lg text-red-600 hover:bg-red-50">
                <LogOut size={18} />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;


