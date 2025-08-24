import React, { useEffect, useState } from 'react';
import { adminAPI } from '../services/api';
import { toast } from 'react-hot-toast';
import AdminLayout from '../components/admin/AdminLayout';

const AdminOrganizationsPage = () => {
  const [orgs, setOrgs] = useState([]);
  const [form, setForm] = useState({ name: '', code: '', orgType: '' });
  const [loading, setLoading] = useState(false);

  const load = async () => {
    try {
      const { data } = await adminAPI.listOrganizations();
      setOrgs(data || []);
    } catch (e) {
      toast.error('Failed to load organizations');
    }
  };

  useEffect(() => { load(); }, []);

  const create = async () => {
    if (!form.name || !form.code) { toast.error('Name and code required'); return; }
    setLoading(true);
    try {
      await adminAPI.createOrganization(form);
      setForm({ name: '', code: '' });
      await load();
      toast.success('Organization created');
    } catch (e) {
      toast.error('Create failed');
    } finally { setLoading(false); }
  };

  return (
    <AdminLayout title="Admin: Organizations">
        <div className="bg-white shadow rounded p-4 mb-6">
          <h2 className="text-md font-semibold mb-3">Create Organization</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <input className="input-field" placeholder="Name" value={form.name} onChange={e=>setForm({...form, name:e.target.value})} />
            <input className="input-field" placeholder="Code" value={form.code} onChange={e=>setForm({...form, code:e.target.value})} />
            <select className="input-field" value={form.orgType} onChange={e=>setForm({...form, orgType:e.target.value})}>
              <option value="">Select Type</option>
              <option value="SHIPPER">Shipper</option>
              <option value="CARRIER">Carrier</option>
              <option value="EXPRESS">Express</option>
              <option value="TERMINAL">Terminal</option>
              <option value="WAREHOUSING">Warehousing</option>
              <option value="INSTITUTION">Institution</option>
              <option value="AIRLINE">Airline</option>
            </select>
            <button className="btn-primary" disabled={loading} onClick={create}>{loading? 'Creating...' : 'Create'}</button>
          </div>
        </div>
        <div className="bg-white shadow rounded p-4">
          <h2 className="text-md font-semibold mb-3">Organizations</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full text-left">
              <thead>
                <tr className="border-b">
                  <th className="py-2 px-2">Name</th>
                  <th className="py-2 px-2">Code</th>
                  <th className="py-2 px-2">Email</th>
                  <th className="py-2 px-2">Active</th>
                </tr>
              </thead>
              <tbody>
                {orgs.map(o => (
                  <tr key={o.id} className="border-b">
                    <td className="py-2 px-2">{o.name}</td>
                    <td className="py-2 px-2">{o.code}</td>
                    <td className="py-2 px-2">{o.email || '-'}</td>
                    <td className="py-2 px-2">{String(o.active)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
    </AdminLayout>
  );
};

export default AdminOrganizationsPage;


