import React, { useEffect, useMemo, useState } from 'react';
import { toast } from 'react-hot-toast';
import { adminAPI } from '../services/api';
import AdminLayout from '../components/admin/AdminLayout';

const roleOptions = [
  'SUPER_ADMIN',
  'ORGANIZATION_ADMIN',
  'DISPATCHER',
  'DRIVER',
  'WAREHOUSE_MANAGER',
  'FACILITATOR',
  'CUSTOMER_SERVICE',
  'ACCOUNTANT',
  'OPERATIONS_MANAGER',
];

const AdminUsersPage = () => {
  const [users, setUsers] = useState([]);
  const [orgs, setOrgs] = useState([]);
  const [loading, setLoading] = useState(false);

  const orgMap = useMemo(() => Object.fromEntries((orgs || []).map(o => [o.id, o.name])), [orgs]);

  const load = async () => {
    try {
      const [uRes, oRes] = await Promise.all([
        adminAPI.listUsers(),
        adminAPI.listOrganizations(),
      ]);
      setUsers(uRes.data || []);
      setOrgs(oRes.data || []);
    } catch (e) {
      toast.error('Failed to load users or organizations');
    }
  };

  useEffect(() => { load(); }, []);

  const setRole = async (userId, userRole) => {
    try {
      await adminAPI.setUserRole(userId, userRole);
      toast.success('Role updated');
      await load();
    } catch {
      toast.error('Failed to update role');
    }
  };

  const setOrganization = async (userId, organizationId) => {
    try {
      await adminAPI.setUserOrganization(userId, organizationId || '');
      toast.success('Organization updated');
      await load();
    } catch {
      toast.error('Failed to update organization');
    }
  };

  return (
    <AdminLayout title="Admin: Users">
        <div className="bg-white shadow rounded p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-md font-semibold">All Users</h2>
            <button className="btn-outline" onClick={load} disabled={loading}>{loading ? 'Refreshing...' : 'Refresh'}</button>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-left">
              <thead>
                <tr className="border-b">
                  <th className="py-2 px-2">Username</th>
                  <th className="py-2 px-2">Email</th>
                  <th className="py-2 px-2">Role</th>
                  <th className="py-2 px-2">Organization</th>
                  <th className="py-2 px-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {(users || []).map(u => (
                  <tr key={u.id} className="border-b">
                    <td className="py-2 px-2">{u.username}</td>
                    <td className="py-2 px-2">{u.email}</td>
                    <td className="py-2 px-2">
                      <select
                        className="input-field"
                        value={u.userRole || ''}
                        onChange={e => setRole(u.id, e.target.value)}
                      >
                        <option value="">Select role</option>
                        {roleOptions.map(r => (
                          <option key={r} value={r}>{r.replace(/_/g, ' ')}</option>
                        ))}
                      </select>
                    </td>
                    <td className="py-2 px-2">
                      <select
                        className="input-field"
                        value={u.organization?.id || ''}
                        onChange={e => setOrganization(u.id, e.target.value)}
                      >
                        <option value="">No organization</option>
                        {(orgs || []).map(o => (
                          <option key={o.id} value={o.id}>{o.name}</option>
                        ))}
                      </select>
                    </td>
                    <td className="py-2 px-2">
                      <div className="flex items-center gap-2">
                        {u.active ? (
                          <button className="px-3 py-1 rounded bg-yellow-100 text-yellow-700 hover:bg-yellow-200" onClick={() => setLoading(true) || adminAPI.deactivateUser(u.id).then(()=>{ toast.success('Deactivated'); load(); }).finally(()=>setLoading(false))}>Deactivate</button>
                        ) : (
                          <button className="px-3 py-1 rounded bg-green-100 text-green-700 hover:bg-green-200" onClick={() => setLoading(true) || adminAPI.activateUser(u.id).then(()=>{ toast.success('Activated'); load(); }).finally(()=>setLoading(false))}>Activate</button>
                        )}
                        <button className="px-3 py-1 rounded bg-red-100 text-red-700 hover:bg-red-200" onClick={() => {
                          if (window.confirm('Delete this user?')) {
                            setLoading(true);
                            adminAPI.deleteUser(u.id).then(()=>{ toast.success('Deleted'); load(); }).finally(()=>setLoading(false));
                          }
                        }}>Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
    </AdminLayout>
  );
};

export default AdminUsersPage;


