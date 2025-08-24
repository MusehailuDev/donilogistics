import React, { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import { orgAdminAPI } from '../services/api';
import Logo from '../components/Logo';

const OrgAdminUsersPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const res = await orgAdminAPI.listUsers();
      setUsers(res.data || []);
    } catch (e) {
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const onActivate = async (id, activate) => {
    setLoading(true);
    try {
      if (activate) await orgAdminAPI.activateUser(id); else await orgAdminAPI.deactivateUser(id);
      toast.success(activate ? 'User activated' : 'User deactivated');
      await load();
    } catch {
      toast.error('Action failed');
    } finally { setLoading(false); }
  };

  const onDelete = async (id) => {
    if (!window.confirm('Delete this user?')) return;
    setLoading(true);
    try {
      await orgAdminAPI.deleteUser(id);
      toast.success('User deleted');
      await load();
    } catch {
      toast.error('Delete failed');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <Logo size="md" />
          <h1 className="text-lg font-semibold">Organization Users</h1>
        </div>
      </header>
      <main className="max-w-6xl mx-auto p-6">
        <div className="bg-white shadow rounded p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-md font-semibold">Users in your organization</h2>
            <button className="btn-outline" onClick={load} disabled={loading}>{loading ? 'Refreshing...' : 'Refresh'}</button>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-left">
              <thead>
                <tr className="border-b">
                  <th className="py-2 px-2">Username</th>
                  <th className="py-2 px-2">Email</th>
                  <th className="py-2 px-2">Role</th>
                  <th className="py-2 px-2">Status</th>
                  <th className="py-2 px-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {(users || []).map(u => (
                  <tr key={u.id} className="border-b">
                    <td className="py-2 px-2">{u.username}</td>
                    <td className="py-2 px-2">{u.email}</td>
                    <td className="py-2 px-2">{u.userRole || '-'}</td>
                    <td className="py-2 px-2">
                      <span className={`px-2 py-1 rounded text-xs ${u.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                        {u.active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="py-2 px-2">
                      <div className="flex items-center gap-2">
                        {u.active ? (
                          <button className="px-3 py-1 rounded bg-yellow-100 text-yellow-700 hover:bg-yellow-200" onClick={() => onActivate(u.id, false)}>Deactivate</button>
                        ) : (
                          <button className="px-3 py-1 rounded bg-green-100 text-green-700 hover:bg-green-200" onClick={() => onActivate(u.id, true)}>Activate</button>
                        )}
                        <button className="px-3 py-1 rounded bg-red-100 text-red-700 hover:bg-red-200" onClick={() => onDelete(u.id)}>Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
};

export default OrgAdminUsersPage;


