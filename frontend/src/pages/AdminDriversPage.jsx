import React, { useEffect, useMemo, useState } from 'react';
import AdminLayout from '../components/admin/AdminLayout';
import { adminAPI } from '../services/api';
import { toast } from 'react-hot-toast';
import LocationPicker from '../components/LocationPicker';
import { FaMapMarkerAlt, FaCrosshairs } from 'react-icons/fa';

const empty = {
  userId: '',
  organizationId: '',
  bloodType: '',
  drivingLicenseNumber: '',
  age: '',
  hiredDate: '',
  drivingLicenseIssueDate: '',
  drivingLicenseExpiryDate: '',
  active: true,
};

const AdminDriversPage = () => {
  const [drivers, setDrivers] = useState([]);
  const [users, setUsers] = useState([]);
  const [orgs, setOrgs] = useState([]);
  const [form, setForm] = useState(empty);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [existingDocuments, setExistingDocuments] = useState({});
  const [showLocationPicker, setShowLocationPicker] = useState(false);

  const availableUsers = useMemo(() => (users || []).filter(u => u.userRole === 'DRIVER'), [users]);

  const load = async () => {
    try {
      const [dRes, uRes, oRes] = await Promise.all([
        adminAPI.listDrivers(),
        adminAPI.listUsers(),
        adminAPI.listOrganizations(),
      ]);
      setDrivers(dRes.data || []);
      setUsers(uRes.data || []);
      setOrgs(oRes.data || []);
    } catch (e) {
      toast.error('Failed to load drivers');
    }
  };

  useEffect(() => { load(); }, []);

  const submit = async () => {
    if (!form.userId) return toast.error('Select a driver user');
    setLoading(true);
    try {
      let payload = { ...form };
      
      // Upload files first if they are File objects
      const upload = async (f) => {
        if (!f || !(f instanceof File)) return null;
        const fd = new FormData();
        fd.append('file', f);
        const base = process.env.REACT_APP_API_URL || 'http://localhost:8080';
        const response = await fetch(`${base}/api/admin/upload`, { 
          method: 'POST', 
          headers: { Authorization: 'Bearer dev-admin-token' }, 
          body: fd 
        });
        const data = await response.json();
        return { fileRef: data.fileRef };
      };
      
      const dlRef = await upload(form.drivingLicenseDocument);
      const idRef = await upload(form.idDocument);
      if (dlRef) payload.drivingLicenseDocument = dlRef;
      if (idRef) payload.idDocument = idRef;

      if (editingId) {
        await adminAPI.updateDriver(editingId, payload);
        toast.success('Driver updated');
      } else {
        await adminAPI.createDriver(payload);
        toast.success('Driver created');
      }
      setForm(empty); setEditingId(null); await load();
    } catch { toast.error('Save failed'); } finally { setLoading(false); }
  };

  const onEdit = (d) => {
    setEditingId(d.id);
    setForm({
      userId: d.user?.id || '',
      organizationId: d.organization?.id || '',
      bloodType: d.bloodType || '',
      drivingLicenseNumber: d.drivingLicenseNumber || '',
      age: d.age || '',
      hiredDate: d.hiredDate || '',
      drivingLicenseIssueDate: d.drivingLicenseIssueDate || '',
      drivingLicenseExpiryDate: d.drivingLicenseExpiryDate || '',
      active: !!d.active,
      drivingLicenseDocument: null,
      idDocument: null,
    });
    // Store existing documents for display
    setExistingDocuments({
      drivingLicenseDocument: d.drivingLicenseDocument,
      idDocument: d.idDocument,
    });
  };

  const onDelete = async (id) => {
    if (!window.confirm('Delete this driver?')) return;
    setLoading(true);
    try { await adminAPI.deleteDriver(id); toast.success('Driver deleted'); await load(); } catch { toast.error('Delete failed'); } finally { setLoading(false); }
  };

  const daysToExpiry = (dateStr) => {
    if (!dateStr) return '-';
    const today = new Date();
    const exp = new Date(dateStr);
    const diff = Math.ceil((exp - today) / (1000*60*60*24));
    return diff;
  };

  return (
    <AdminLayout title="Admin: Drivers">
      <div className="bg-white shadow rounded p-4 mb-6">
        <h2 className="text-md font-semibold mb-3">{editingId ? 'Edit Driver' : 'Create Driver'}</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <select className="input-field" value={form.userId} onChange={e=>setForm({...form, userId:e.target.value})}>
            <option value="">Select Driver User</option>
            {availableUsers.map(u => <option key={u.id} value={u.id}>{u.username}</option>)}
          </select>
          <select className="input-field" value={form.organizationId} onChange={e=>setForm({...form, organizationId:e.target.value})}>
            <option value="">Organization</option>
            {orgs.map(o => <option key={o.id} value={o.id}>{o.name}</option>)}
          </select>
          <input className="input-field" placeholder="Blood Type" value={form.bloodType} onChange={e=>setForm({...form, bloodType:e.target.value})} />
          <input className="input-field" placeholder="Driving License No." value={form.drivingLicenseNumber} onChange={e=>setForm({...form, drivingLicenseNumber:e.target.value})} />
          <input className="input-field" placeholder="Age" type="number" value={form.age} onChange={e=>setForm({...form, age:e.target.value})} />
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={form.active} onChange={e=>setForm({...form, active:e.target.checked})} />
            <span>Active</span>
          </label>
        </div>
        
        {/* Date Fields Section */}
        <div className="mt-4">
          <h3 className="text-sm font-medium text-gray-700 mb-3">Important Dates</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Hired Date</label>
              <input 
                className="input-field" 
                type="date" 
                value={form.hiredDate} 
                onChange={e=>setForm({...form, hiredDate:e.target.value})} 
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">DL Issue Date</label>
              <input 
                className="input-field" 
                type="date" 
                value={form.drivingLicenseIssueDate} 
                onChange={e=>setForm({...form, drivingLicenseIssueDate:e.target.value})} 
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">DL Expiry Date</label>
              <input 
                className="input-field" 
                type="date" 
                value={form.drivingLicenseExpiryDate} 
                onChange={e=>setForm({...form, drivingLicenseExpiryDate:e.target.value})} 
              />
            </div>
          </div>
        </div>
        
        {/* Document Upload Section */}
        <div className="mt-4">
          <h3 className="text-sm font-medium text-gray-700 mb-3">Documents</h3>
          
          {/* Show existing documents if editing */}
          {editingId && (existingDocuments.drivingLicenseDocument || existingDocuments.idDocument) && (
            <div className="mb-4 p-3 bg-gray-50 rounded-lg">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Current Documents:</h4>
              <div className="flex flex-wrap gap-2">
                {existingDocuments.drivingLicenseDocument && (
                  <div className="flex items-center gap-1">
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      📄 DL Document
                    </span>
                    <button 
                      onClick={() => window.open(`${process.env.REACT_APP_API_URL || 'http://localhost:8080'}/api/admin/files?fileRef=${encodeURIComponent(existingDocuments.drivingLicenseDocument)}&token=dev-admin-token`, '_blank')}
                      className="text-blue-600 hover:text-blue-800 text-xs"
                    >
                      View
                    </button>
                  </div>
                )}
                {existingDocuments.idDocument && (
                  <div className="flex items-center gap-1">
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      📄 ID Document
                    </span>
                    <button 
                      onClick={() => window.open(`${process.env.REACT_APP_API_URL || 'http://localhost:8080'}/api/admin/files?fileRef=${encodeURIComponent(existingDocuments.idDocument)}&token=dev-admin-token`, '_blank')}
                      className="text-blue-600 hover:text-blue-800 text-xs"
                    >
                      View
                    </button>
                  </div>
                )}
              </div>
              <p className="text-xs text-gray-600 mt-2">Upload new files to replace existing ones</p>
            </div>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Driving License Document</label>
              <input 
                type="file" 
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                onChange={e=>setForm({...form, drivingLicenseDocument: e.target.files?.[0]})} 
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">ID Document</label>
              <input 
                type="file" 
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                onChange={e=>setForm({...form, idDocument: e.target.files?.[0]})} 
              />
            </div>
          </div>
        </div>
        
        <div className="mt-4">
          <div className="flex items-center gap-2">
            <button className="btn-primary" disabled={loading} onClick={submit}>{loading ? 'Saving...' : (editingId ? 'Update' : 'Create')}</button>
            {editingId && <button className="btn-outline" onClick={() => { setEditingId(null); setForm(empty); setExistingDocuments({}); }}>Cancel</button>}
          </div>
        </div>
      </div>

      <div className="bg-white shadow rounded p-4">
        <h2 className="text-md font-semibold mb-3">Drivers</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full text-left">
            <thead>
              <tr className="border-b">
                <th className="py-2 px-2">User</th>
                <th className="py-2 px-2">Organization</th>
                <th className="py-2 px-2">DL No.</th>
                <th className="py-2 px-2">DL Expiry</th>
                <th className="py-2 px-2">Days Left</th>
                <th className="py-2 px-2">Active</th>
                <th className="py-2 px-2">Documents</th>
                <th className="py-2 px-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {drivers.map(d => (
                <tr key={d.id} className="border-b">
                  <td className="py-2 px-2">{d.user?.username || '-'}</td>
                  <td className="py-2 px-2">{d.organization?.name || '-'}</td>
                  <td className="py-2 px-2">{d.drivingLicenseNumber || '-'}</td>
                  <td className="py-2 px-2">{d.drivingLicenseExpiryDate || '-'}</td>
                  <td className="py-2 px-2">{daysToExpiry(d.drivingLicenseExpiryDate)}</td>
                  <td className="py-2 px-2">{d.active ? 'Yes' : 'No'}</td>
                  <td className="py-2 px-2">
                    <div className="flex flex-col gap-1 text-xs">
                      {d.drivingLicenseDocument && (
                        <div className="flex items-center gap-1">
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            📄 DL Document
                          </span>
                          <button 
                            onClick={() => window.open(`${process.env.REACT_APP_API_URL || 'http://localhost:8080'}/api/admin/files?fileRef=${encodeURIComponent(d.drivingLicenseDocument)}&token=dev-admin-token`, '_blank')}
                            className="text-blue-600 hover:text-blue-800 text-xs"
                          >
                            View
                          </button>
                        </div>
                      )}
                      {d.idDocument && (
                        <div className="flex items-center gap-1">
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            📄 ID Document
                          </span>
                          <button 
                            onClick={() => window.open(`${process.env.REACT_APP_API_URL || 'http://localhost:8080'}/api/admin/files?fileRef=${encodeURIComponent(d.idDocument)}&token=dev-admin-token`, '_blank')}
                            className="text-blue-600 hover:text-blue-800 text-xs"
                          >
                            View
                          </button>
                        </div>
                      )}
                      {!d.drivingLicenseDocument && !d.idDocument && (
                        <span className="text-gray-500">No documents</span>
                      )}
                    </div>
                  </td>
                  <td className="py-2 px-2">
                    <div className="flex items-center gap-2">
                      <button className="px-3 py-1 rounded bg-blue-100 text-blue-700 hover:bg-blue-200" onClick={() => onEdit(d)}>Edit</button>
                      <button className="px-3 py-1 rounded bg-red-100 text-red-700 hover:bg-red-200" onClick={() => onDelete(d.id)}>Delete</button>
                      <button title="Use GPS" className="px-2 py-1 rounded bg-gray-100 hover:bg-gray-200" onClick={async () => {
                        if (!navigator.geolocation) return toast.error('Geolocation not available');
                        navigator.geolocation.getCurrentPosition(async (pos) => {
                          try {
                            await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:8080'}/api/admin/drivers/${d.id}/location`, {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json', Authorization: 'Bearer dev-admin-token' },
                              body: JSON.stringify({ latitude: pos.coords.latitude, longitude: pos.coords.longitude })
                            });
                            toast.success('Driver location updated');
                            await load();
                          } catch { toast.error('Failed to update'); }
                        }, () => toast.error('GPS failed'));
                      }}>
                        <FaCrosshairs />
                      </button>
                      <button title="Choose on Map" className="px-2 py-1 rounded bg-gray-100 hover:bg-gray-200" onClick={() => setShowLocationPicker(d.id)}>
                        <FaMapMarkerAlt />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {!!showLocationPicker && (
        <LocationPicker
          isOpen={!!showLocationPicker}
          onClose={() => setShowLocationPicker(false)}
          onLocationSelect={async (loc) => {
            try {
              await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:8080'}/api/admin/drivers/${showLocationPicker}/location`, {
                method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: 'Bearer dev-admin-token' },
                body: JSON.stringify({ latitude: loc.latitude, longitude: loc.longitude })
              });
              toast.success('Driver location updated');
              setShowLocationPicker(false);
              await load();
            } catch { toast.error('Failed to update'); }
          }}
          type="driver"
          initialPosition={[52.2297, 21.0122]}
        />
      )}
    </AdminLayout>
  );
};

export default AdminDriversPage;


