import React, { useEffect, useMemo, useState } from 'react';
import AdminLayout from '../components/admin/AdminLayout';
import { adminAPI } from '../services/api';
import { toast } from 'react-hot-toast';
import LocationPicker from '../components/LocationPicker';
import { FaMapMarkerAlt } from 'react-icons/fa';

const emptyForm = {
  licensePlate: '',
  make: '',
  model: '',
  year: '',
  vin: '',
  capacity: '',
  capacityUnit: 'kg',
  volumeCapacity: '',
  volumeUnit: 'm3',
  fuelType: '',
  status: 'AVAILABLE',
  organizationId: '',
  assignedDriverId: '',
  currentLocation: '',
  currentLatitude: '',
  currentLongitude: '',
  gpsTrackingEnabled: false,
};

const AdminVehiclesPage = () => {
  const [vehicles, setVehicles] = useState([]);
  const [orgs, setOrgs] = useState([]);
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [existingDocuments, setExistingDocuments] = useState({});
  const [showLocationPicker, setShowLocationPicker] = useState(false);

  const orgOptions = useMemo(() => orgs || [], [orgs]);
  const isOrgAdmin = () => (JSON.parse(localStorage.getItem('user') || '{}').userRole === 'ORGANIZATION_ADMIN');
  const headers = useMemo(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (user?.userRole === 'ORGANIZATION_ADMIN') {
      return { Authorization: 'Bearer org-admin-token', 'X-Admin-User-Id': user.id };
    }
    return { Authorization: 'Bearer dev-admin-token' };
  }, []);
  const driverOptions = useMemo(() => (users || []).filter(u => u.userRole === 'DRIVER'), [users]);

  const load = async () => {
    try {
      const base = process.env.REACT_APP_API_URL || 'http://localhost:8080';
      const org = isOrgAdmin();
      const vehPath = org ? '/api/org/vehicles' : '/api/admin/vehicles';
      const usersPath = '/api/admin/users';
      const orgsPath = '/api/admin/organizations';
      const [vehRes, orgRes, userRes] = await Promise.all([
        fetch(`${base}${vehPath}`, { headers }).then(r=>r.json()),
        fetch(`${base}${orgsPath}`, { headers: { Authorization: 'Bearer dev-admin-token' } }).then(r=>r.json()),
        fetch(`${base}${usersPath}`, { headers: { Authorization: 'Bearer dev-admin-token' } }).then(r=>r.json()),
      ]);
      setVehicles(Array.isArray(vehRes) ? vehRes : (vehRes?.data || []));
      setOrgs(Array.isArray(orgRes) ? orgRes : (orgRes?.data || []));
      setUsers(Array.isArray(userRes) ? userRes : (userRes?.data || []));
    } catch (e) {
      toast.error('Failed to load vehicles');
    }
  };

  useEffect(() => { load(); }, []);

  const submit = async () => {
    if (!form.licensePlate) return toast.error('License plate is required');
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
      const regRef = await upload(form.registrationDocument);
      const insRef = await upload(form.insuranceDocument);
      const photoRef = await upload(form.photo);
      if (regRef) payload.registrationDocument = regRef;
      if (insRef) payload.insuranceDocument = insRef;
      if (photoRef) payload.photo = photoRef;

      if (editingId) {
        await adminAPI.updateVehicle(editingId, payload);
        toast.success('Vehicle updated');
      } else {
        await adminAPI.createVehicle(payload);
        toast.success('Vehicle created');
      }
      setForm(emptyForm);
      setEditingId(null);
      await load();
    } catch (e) {
      toast.error('Save failed');
    } finally { setLoading(false); }
  };

  const onEdit = (v) => {
    setEditingId(v.id);
    setForm({
      licensePlate: v.licensePlate || '',
      make: v.make || '',
      model: v.model || '',
      year: v.year || '',
      vin: v.vin || '',
      capacity: v.capacity || '',
      capacityUnit: v.capacityUnit || 'kg',
      volumeCapacity: v.volumeCapacity || '',
      volumeUnit: v.volumeUnit || 'm3',
      fuelType: v.fuelType || '',
      status: v.status || 'AVAILABLE',
      organizationId: v.organization?.id || '',
      assignedDriverId: v.assignedDriver?.id || '',
      currentLocation: v.currentLocation || '',
      currentLatitude: v.currentLatitude || '',
      currentLongitude: v.currentLongitude || '',
      gpsTrackingEnabled: !!v.gpsTrackingEnabled,
      registrationDocument: null,
      insuranceDocument: null,
      photo: null,
    });
    // Store existing documents for display
    setExistingDocuments({
      registrationDocument: v.registrationDocument,
      insuranceDocument: v.insuranceDocument,
      photo: v.photo,
    });
  };

  const onDelete = async (id) => {
    if (!window.confirm('Delete this vehicle?')) return;
    setLoading(true);
    try {
      await adminAPI.deleteVehicle(id);
      toast.success('Vehicle deleted');
      await load();
    } catch {
      toast.error('Delete failed');
    } finally { setLoading(false); }
  };

  return (
    <AdminLayout title="Admin: Vehicles">
      <div className="bg-white shadow rounded p-4 mb-6">
        <h2 className="text-md font-semibold mb-3">{editingId ? 'Edit Vehicle' : 'Create Vehicle'}</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <input className="input-field" placeholder="License Plate" value={form.licensePlate} onChange={e=>setForm({...form, licensePlate:e.target.value})} />
          <input className="input-field" placeholder="Make" value={form.make} onChange={e=>setForm({...form, make:e.target.value})} />
          <input className="input-field" placeholder="Model" value={form.model} onChange={e=>setForm({...form, model:e.target.value})} />
          <input className="input-field" placeholder="Year" type="number" value={form.year} onChange={e=>setForm({...form, year:e.target.value})} />
          <input className="input-field" placeholder="VIN" value={form.vin} onChange={e=>setForm({...form, vin:e.target.value})} />
          <input className="input-field" placeholder="Capacity" type="number" value={form.capacity} onChange={e=>setForm({...form, capacity:e.target.value})} />
          <input className="input-field" placeholder="Capacity Unit" value={form.capacityUnit} onChange={e=>setForm({...form, capacityUnit:e.target.value})} />
          <input className="input-field" placeholder="Volume Capacity" type="number" value={form.volumeCapacity} onChange={e=>setForm({...form, volumeCapacity:e.target.value})} />
          <input className="input-field" placeholder="Volume Unit" value={form.volumeUnit} onChange={e=>setForm({...form, volumeUnit:e.target.value})} />
          <input className="input-field" placeholder="Fuel Type" value={form.fuelType} onChange={e=>setForm({...form, fuelType:e.target.value})} />
          <select className="input-field" value={form.status} onChange={e=>setForm({...form, status:e.target.value})}>
            <option value="AVAILABLE">Available</option>
            <option value="IN_TRANSIT">In Transit</option>
            <option value="MAINTENANCE">Maintenance</option>
            <option value="OUT_OF_SERVICE">Out of Service</option>
            <option value="RESERVED">Reserved</option>
          </select>
          <select className="input-field" value={form.organizationId} onChange={e=>setForm({...form, organizationId:e.target.value})}>
            <option value="">Organization</option>
            {orgOptions.map(o => <option key={o.id} value={o.id}>{o.name}</option>)}
          </select>
          <select className="input-field" value={form.assignedDriverId} onChange={e=>setForm({...form, assignedDriverId:e.target.value})}>
            <option value="">Assigned Driver</option>
            {driverOptions.map(u => <option key={u.id} value={u.id}>{u.username}</option>)}
          </select>
          <input className="input-field" placeholder="Current Location" value={form.currentLocation} onChange={e=>setForm({...form, currentLocation:e.target.value})} />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-end">
            <input className="input-field" placeholder="Latitude" type="number" value={form.currentLatitude || ''} onChange={e=>setForm({...form, currentLatitude:e.target.value})} />
            <input className="input-field" placeholder="Longitude" type="number" value={form.currentLongitude || ''} onChange={e=>setForm({...form, currentLongitude:e.target.value})} />
            <div className="flex md:justify-end">
              <button type="button" onClick={() => setShowLocationPicker(true)} className="flex items-center gap-2 px-3 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700">
                <FaMapMarkerAlt size={14} />
                Choose on Map
              </button>
            </div>
          </div>
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={form.gpsTrackingEnabled} onChange={e=>setForm({...form, gpsTrackingEnabled:e.target.checked})} />
            <span>GPS Tracking</span>
          </label>
        </div>
        
        {/* Document Upload Section */}
        <div className="mt-4">
          <h3 className="text-sm font-medium text-gray-700 mb-3">Documents & Photos</h3>
          
          {/* Show existing documents if editing */}
          {editingId && (existingDocuments.registrationDocument || existingDocuments.insuranceDocument || existingDocuments.photo) && (
            <div className="mb-4 p-3 bg-gray-50 rounded-lg">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Current Documents:</h4>
              <div className="flex flex-wrap gap-2">
                {existingDocuments.registrationDocument && (
                  <div className="flex items-center gap-1">
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      📄 Registration
                    </span>
                    <button 
                      onClick={() => window.open(`${process.env.REACT_APP_API_URL || 'http://localhost:8080'}/api/admin/files?fileRef=${encodeURIComponent(existingDocuments.registrationDocument)}&token=dev-admin-token`, '_blank')}
                      className="text-blue-600 hover:text-blue-800 text-xs"
                    >
                      View
                    </button>
                  </div>
                )}
                {existingDocuments.insuranceDocument && (
                  <div className="flex items-center gap-1">
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      📄 Insurance
                    </span>
                    <button 
                      onClick={() => window.open(`${process.env.REACT_APP_API_URL || 'http://localhost:8080'}/api/admin/files?fileRef=${encodeURIComponent(existingDocuments.insuranceDocument)}&token=dev-admin-token`, '_blank')}
                      className="text-blue-600 hover:text-blue-800 text-xs"
                    >
                      View
                    </button>
                  </div>
                )}
                {existingDocuments.photo && (
                  <div className="flex items-center gap-1">
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                      📷 Photo
                    </span>
                    <button 
                      onClick={() => window.open(`${process.env.REACT_APP_API_URL || 'http://localhost:8080'}/api/admin/files?fileRef=${encodeURIComponent(existingDocuments.photo)}&token=dev-admin-token`, '_blank')}
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
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Registration Document</label>
              <input 
                type="file" 
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                onChange={e=>setForm({...form, registrationDocument: e.target.files?.[0]})} 
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Insurance Document</label>
              <input 
                type="file" 
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                onChange={e=>setForm({...form, insuranceDocument: e.target.files?.[0]})} 
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Vehicle Photo</label>
              <input 
                type="file" 
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                onChange={e=>setForm({...form, photo: e.target.files?.[0]})} 
              />
            </div>
          </div>
        </div>
        
        <div className="mt-4">
          <div className="flex items-center gap-2">
            <button className="btn-primary" disabled={loading} onClick={submit}>{loading ? 'Saving...' : (editingId ? 'Update' : 'Create')}</button>
            {editingId && <button className="btn-outline" onClick={() => { setEditingId(null); setForm(emptyForm); setExistingDocuments({}); }}>Cancel</button>}
          </div>
        </div>
      </div>

      <div className="bg-white shadow rounded p-4">
        <h2 className="text-md font-semibold mb-3">Vehicles</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full text-left">
            <thead>
              <tr className="border-b">
                <th className="py-2 px-2">Plate</th>
                <th className="py-2 px-2">Make/Model</th>
                <th className="py-2 px-2">Year</th>
                <th className="py-2 px-2">Capacity</th>
                <th className="py-2 px-2">Status</th>
                <th className="py-2 px-2">Org</th>
                <th className="py-2 px-2">Driver</th>
                <th className="py-2 px-2">Documents</th>
                <th className="py-2 px-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {(vehicles || []).map(v => (
                <tr key={v.id} className="border-b">
                  <td className="py-2 px-2">{v.licensePlate}</td>
                  <td className="py-2 px-2">{v.make} {v.model}</td>
                  <td className="py-2 px-2">{v.year || '-'}</td>
                  <td className="py-2 px-2">
                    <div className="text-xs">
                      <div>{v.capacity ? `${v.capacity} ${v.capacityUnit || 'kg'}` : '-'}</div>
                      <div>{v.volumeCapacity ? `${v.volumeCapacity} ${v.volumeUnit || 'm3'}` : '-'}</div>
                    </div>
                  </td>
                  <td className="py-2 px-2">{v.status}</td>
                  <td className="py-2 px-2">{v.organization?.name || '-'}</td>
                  <td className="py-2 px-2">{v.assignedDriver?.username || '-'}</td>
                  <td className="py-2 px-2">
                    <div className="flex flex-col gap-1 text-xs">
                      {v.registrationDocument && (
                        <div className="flex items-center gap-1">
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            📄 Registration
                          </span>
                          <button 
                            onClick={() => window.open(`${process.env.REACT_APP_API_URL || 'http://localhost:8080'}/api/admin/files?fileRef=${encodeURIComponent(v.registrationDocument)}&token=dev-admin-token`, '_blank')}
                            className="text-blue-600 hover:text-blue-800 text-xs"
                          >
                            View
                          </button>
                        </div>
                      )}
                      {v.insuranceDocument && (
                        <div className="flex items-center gap-1">
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            📄 Insurance
                          </span>
                          <button 
                            onClick={() => window.open(`${process.env.REACT_APP_API_URL || 'http://localhost:8080'}/api/admin/files?fileRef=${encodeURIComponent(v.insuranceDocument)}&token=dev-admin-token`, '_blank')}
                            className="text-blue-600 hover:text-blue-800 text-xs"
                          >
                            View
                          </button>
                        </div>
                      )}
                      {v.photo && (
                        <div className="flex items-center gap-1">
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                            📷 Photo
                          </span>
                          <button 
                            onClick={() => window.open(`${process.env.REACT_APP_API_URL || 'http://localhost:8080'}/api/admin/files?fileRef=${encodeURIComponent(v.photo)}&token=dev-admin-token`, '_blank')}
                            className="text-blue-600 hover:text-blue-800 text-xs"
                          >
                            View
                          </button>
                        </div>
                      )}
                      {!v.registrationDocument && !v.insuranceDocument && !v.photo && (
                        <span className="text-gray-500">No documents</span>
                      )}
                    </div>
                  </td>
                  <td className="py-2 px-2">
                    <div className="flex items-center gap-2">
                      <button className="px-3 py-1 rounded bg-blue-100 text-blue-700 hover:bg-blue-200" onClick={() => onEdit(v)}>Edit</button>
                      <button className="px-3 py-1 rounded bg-red-100 text-red-700 hover:bg-red-200" onClick={() => onDelete(v.id)}>Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <LocationPicker
        isOpen={showLocationPicker}
        onClose={() => setShowLocationPicker(false)}
        onLocationSelect={(loc) => {
          setForm({ ...form, currentLatitude: loc.latitude.toString(), currentLongitude: loc.longitude.toString() });
          setShowLocationPicker(false);
        }}
        type="vehicle"
        initialPosition={[parseFloat(form.currentLatitude) || 52.2297, parseFloat(form.currentLongitude) || 21.0122]}
      />
    </AdminLayout>
  );
};

export default AdminVehiclesPage;


