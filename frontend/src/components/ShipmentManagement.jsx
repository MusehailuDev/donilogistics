import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaPlus, FaEye, FaMapMarkerAlt } from 'react-icons/fa';
import LocationPicker from './LocationPicker';
import ShipmentSummary from './ShipmentSummary';
import { generateTrackingNumber } from '../utils/trackingNumberGenerator';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';
const DEV_ADMIN_HEADERS = { Authorization: 'Bearer dev-admin-token' };

const ShipmentManagement = () => {
  const [shipments, setShipments] = useState([]);
  const [organizations, setOrganizations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedShipment, setSelectedShipment] = useState(null);
  const [showLocationPicker, setShowLocationPicker] = useState(false);
  const [locationPickerType, setLocationPickerType] = useState('pickup');
  const [showShipmentSummary, setShowShipmentSummary] = useState(false);
  const [createdShipment, setCreatedShipment] = useState(null);
  const [toast, setToast] = useState(null);

  const [shipmentForm, setShipmentForm] = useState({
    externalOrderId: '',
    weightKg: '',
    lengthCm: '',
    widthCm: '',
    heightCm: '',
    commodityType: '',
    customerId: '',
    declaredValue: '',
    dimsConfirmed: false,
    consolidationAllowed: true,
    consolidationPriority: 'NORMAL',
    preferredDeliveryFrom: '',
    preferredDeliveryTo: '',
    ecoMode: 'NONE',
    pickupAddress: {
      name: '',
      contact: '',
      phone: '',
      street: '',
      city: '',
      state: '',
      country: '',
      postalCode: '',
      latitude: '',
      longitude: ''
    },
    deliveryAddress: {
      name: '',
      contact: '',
      phone: '',
      street: '',
      city: '',
      state: '',
      country: '',
      postalCode: '',
      latitude: '',
      longitude: ''
    }
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [shipmentsRes, orgsRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/api/admin/shipments`, { headers: DEV_ADMIN_HEADERS }),
        axios.get(`${API_BASE_URL}/api/admin/organizations`, { headers: DEV_ADMIN_HEADERS }).catch(() => ({ data: [] }))
      ]);
      setShipments(Array.isArray(shipmentsRes.data) ? shipmentsRes.data : []);
      setOrganizations(Array.isArray(orgsRes.data) ? orgsRes.data : []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateShipment = async (e) => {
    e.preventDefault();
    // Build payload once so it's available in both success and catch paths
    const trackingNumber = generateTrackingNumber(shipmentForm.externalOrderId, 'DONI');
    const shipmentData = {
      ...shipmentForm,
      trackingNumber: trackingNumber,
      status: 'CREATED',
      createdAt: new Date().toISOString(),
      createdByUserId: localStorage.getItem('currentUserId') || ''
    };

    try {
      // Send to backend
      const response = await axios.post(`${API_BASE_URL}/api/admin/shipments`, shipmentData, { 
        headers: { ...DEV_ADMIN_HEADERS, 'Content-Type': 'application/json' }
      });

      if (response && response.status === 200 && response.data && response.data.id) {
        // Close create modal
        setShowCreateModal(false);

        // Show shipment summary from server data
        setCreatedShipment({ ...shipmentData, id: response.data.id, createdAt: response.data.createdAt });
        setShowShipmentSummary(true);

        // Success toast
        setToast({ type: 'success', message: `Shipment ${response.data.trackingNumber || ''} created successfully` });
        setTimeout(() => setToast(null), 4000);
      } else {
        alert('Failed to save shipment. Please try again.');
        return;
      }

      // Reset form
      setShipmentForm({
        externalOrderId: '',
        weightKg: '',
        lengthCm: '',
        widthCm: '',
        heightCm: '',
        commodityType: '',
        customerId: '',
        declaredValue: '',
        dimsConfirmed: false,
        consolidationAllowed: true,
        consolidationPriority: 'NORMAL',
        preferredDeliveryFrom: '',
        preferredDeliveryTo: '',
        ecoMode: 'NONE',
        pickupAddress: {
          name: '',
          contact: '',
          phone: '',
          street: '',
          city: '',
          state: '',
          country: '',
          postalCode: '',
          latitude: '',
          longitude: ''
        },
        deliveryAddress: {
          name: '',
          contact: '',
          phone: '',
          street: '',
          city: '',
          state: '',
          country: '',
          postalCode: '',
          latitude: '',
          longitude: ''
        }
      });
      
      fetchData();
    } catch (error) {
      console.error('Error creating shipment:', error);
      // Fallback: show summary even if backend failed, so user gets QR/label immediately
      setShowCreateModal(false);
      setCreatedShipment(shipmentData);
      setShowShipmentSummary(true);
      setToast({ type: 'error', message: 'Backend error. Showing summary (not saved)' });
      setTimeout(() => setToast(null), 5000);

      // Reset form
      setShipmentForm({
        externalOrderId: '',
        weightKg: '',
        lengthCm: '',
        widthCm: '',
        heightCm: '',
        commodityType: '',
        customerId: '',
        declaredValue: '',
        dimsConfirmed: false,
        consolidationAllowed: true,
        consolidationPriority: 'NORMAL',
        preferredDeliveryFrom: '',
        preferredDeliveryTo: '',
        ecoMode: 'NONE',
        pickupAddress: {
          name: '',
          contact: '',
          phone: '',
          street: '',
          city: '',
          state: '',
          country: '',
          postalCode: '',
          latitude: '',
          longitude: ''
        },
        deliveryAddress: {
          name: '',
          contact: '',
          phone: '',
          street: '',
          city: '',
          state: '',
          country: '',
          postalCode: '',
          latitude: '',
          longitude: ''
        }
      });
    }
  };

  const handleLocationSelect = (location) => {
    if (locationPickerType === 'pickup') {
      setShipmentForm({
        ...shipmentForm,
        pickupAddress: {
          ...shipmentForm.pickupAddress,
          latitude: location.latitude.toString(),
          longitude: location.longitude.toString()
        }
      });
    } else {
      setShipmentForm({
        ...shipmentForm,
        deliveryAddress: {
          ...shipmentForm.deliveryAddress,
          latitude: location.latitude.toString(),
          longitude: location.longitude.toString()
        }
      });
    }
  };

  const openLocationPicker = (type) => {
    setLocationPickerType(type);
    setShowLocationPicker(true);
  };

  const getStatusColor = (status) => {
    const colors = {
      'CREATED': 'bg-blue-100 text-blue-800',
      'IN_TRANSIT': 'bg-orange-100 text-orange-800',
      'DELIVERED': 'bg-green-100 text-green-800',
      'CANCELLED': 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-2 rounded shadow ${toast.type === 'success' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'}`}>
          {toast.message}
        </div>
      )}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Shipment Management</h2>
          <p className="text-gray-600">Manage shipments and tracking</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
        >
          <FaPlus />
          <span>Create Shipment</span>
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Weight</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Created</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {shipments.map((shipment) => (
                <tr key={shipment.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">
                      {shipment.externalOrderId || 'N/A'}
                    </div>
                    <div className="text-sm text-gray-500">
                      {shipment.commodityType}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(shipment.status)}`}>
                      {shipment.status?.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {shipment.customer?.name || 'N/A'}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {shipment.weightKg} kg
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {new Date(shipment.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => setSelectedShipment(shipment)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        <FaEye />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showCreateModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-10 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-2/3 shadow-lg rounded-md bg-white max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Create New Shipment</h3>
            <form onSubmit={handleCreateShipment} className="space-y-6">
              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">External Order ID *</label>
                  <input
                    type="text"
                    required
                    value={shipmentForm.externalOrderId}
                    onChange={(e) => setShipmentForm({...shipmentForm, externalOrderId: e.target.value})}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Commodity Type *</label>
                  <input
                    type="text"
                    required
                    value={shipmentForm.commodityType}
                    onChange={(e) => setShipmentForm({...shipmentForm, commodityType: e.target.value})}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                  />
                </div>
              </div>

              {/* Dimensions and Weight */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Weight (kg) *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={shipmentForm.weightKg}
                    onChange={(e) => setShipmentForm({...shipmentForm, weightKg: e.target.value})}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Length (cm)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={shipmentForm.lengthCm}
                    onChange={(e) => setShipmentForm({...shipmentForm, lengthCm: e.target.value})}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Width (cm)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={shipmentForm.widthCm}
                    onChange={(e) => setShipmentForm({...shipmentForm, widthCm: e.target.value})}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Height (cm)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={shipmentForm.heightCm}
                    onChange={(e) => setShipmentForm({...shipmentForm, heightCm: e.target.value})}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                  />
                </div>
              </div>

              {/* Customer and Value */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Customer (optional)</label>
                  <select
                    value={shipmentForm.customerId}
                    onChange={(e) => setShipmentForm({...shipmentForm, customerId: e.target.value})}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                  >
                    <option value="">No customer</option>
                    {organizations.map(org => (
                      <option key={org.id} value={org.id}>{org.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Declared Value</label>
                  <input
                    type="number"
                    step="0.01"
                    value={shipmentForm.declaredValue}
                    onChange={(e) => setShipmentForm({...shipmentForm, declaredValue: e.target.value})}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                    placeholder="0.00"
                  />
                </div>
              </div>

              {/* Consolidation Settings */}
              <div className="border-t pt-4">
                <h4 className="text-md font-medium text-gray-900 mb-3">Consolidation Settings</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={shipmentForm.consolidationAllowed}
                      onChange={(e) => setShipmentForm({...shipmentForm, consolidationAllowed: e.target.checked})}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label className="ml-2 block text-sm text-gray-900">Allow Consolidation</label>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={shipmentForm.dimsConfirmed}
                      onChange={(e) => setShipmentForm({...shipmentForm, dimsConfirmed: e.target.checked})}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label className="ml-2 block text-sm text-gray-900">Dimensions Confirmed</label>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Consolidation Priority</label>
                    <select
                      value={shipmentForm.consolidationPriority}
                      onChange={(e) => setShipmentForm({...shipmentForm, consolidationPriority: e.target.value})}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                    >
                      <option value="LOW">Low</option>
                      <option value="NORMAL">Normal</option>
                      <option value="HIGH">High</option>
                      <option value="URGENT">Urgent</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Delivery Preferences */}
              <div className="border-t pt-4">
                <h4 className="text-md font-medium text-gray-900 mb-3">Delivery Preferences</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Preferred Delivery From</label>
                    <input
                      type="time"
                      value={shipmentForm.preferredDeliveryFrom}
                      onChange={(e) => setShipmentForm({...shipmentForm, preferredDeliveryFrom: e.target.value})}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Preferred Delivery To</label>
                    <input
                      type="time"
                      value={shipmentForm.preferredDeliveryTo}
                      onChange={(e) => setShipmentForm({...shipmentForm, preferredDeliveryTo: e.target.value})}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Eco Mode</label>
                    <select
                      value={shipmentForm.ecoMode}
                      onChange={(e) => setShipmentForm({...shipmentForm, ecoMode: e.target.value})}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                    >
                      <option value="NONE">None</option>
                      <option value="ECO">Eco</option>
                      <option value="EXPRESS">Express</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Pickup Address */}
              <div className="border-t pt-4">
                <div className="flex justify-between items-center mb-3">
                  <h4 className="text-md font-medium text-gray-900">Pickup Address</h4>
                  <button
                    type="button"
                    onClick={() => openLocationPicker('pickup')}
                    className="flex items-center gap-2 px-3 py-1 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    <FaMapMarkerAlt size={14} />
                    Choose on Map
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Contact Name</label>
                    <input
                      type="text"
                      value={shipmentForm.pickupAddress.name}
                      onChange={(e) => setShipmentForm({
                        ...shipmentForm, 
                        pickupAddress: {...shipmentForm.pickupAddress, name: e.target.value}
                      })}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Phone</label>
                    <input
                      type="tel"
                      value={shipmentForm.pickupAddress.phone}
                      onChange={(e) => setShipmentForm({
                        ...shipmentForm, 
                        pickupAddress: {...shipmentForm.pickupAddress, phone: e.target.value}
                      })}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700">Street Address</label>
                    <input
                      type="text"
                      value={shipmentForm.pickupAddress.street}
                      onChange={(e) => setShipmentForm({
                        ...shipmentForm, 
                        pickupAddress: {...shipmentForm.pickupAddress, street: e.target.value}
                      })}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">City</label>
                    <input
                      type="text"
                      value={shipmentForm.pickupAddress.city}
                      onChange={(e) => setShipmentForm({
                        ...shipmentForm, 
                        pickupAddress: {...shipmentForm.pickupAddress, city: e.target.value}
                      })}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">State/Province</label>
                    <input
                      type="text"
                      value={shipmentForm.pickupAddress.state}
                      onChange={(e) => setShipmentForm({
                        ...shipmentForm, 
                        pickupAddress: {...shipmentForm.pickupAddress, state: e.target.value}
                      })}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Country</label>
                    <input
                      type="text"
                      value={shipmentForm.pickupAddress.country}
                      onChange={(e) => setShipmentForm({
                        ...shipmentForm, 
                        pickupAddress: {...shipmentForm.pickupAddress, country: e.target.value}
                      })}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Postal Code</label>
                    <input
                      type="text"
                      value={shipmentForm.pickupAddress.postalCode}
                      onChange={(e) => setShipmentForm({
                        ...shipmentForm, 
                        pickupAddress: {...shipmentForm.pickupAddress, postalCode: e.target.value}
                      })}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Latitude</label>
                    <input
                      type="number"
                      step="0.000001"
                      value={shipmentForm.pickupAddress.latitude}
                      onChange={(e) => setShipmentForm({
                        ...shipmentForm, 
                        pickupAddress: {...shipmentForm.pickupAddress, latitude: e.target.value}
                      })}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                      placeholder="Click 'Choose on Map' to select"
                      readOnly
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Longitude</label>
                    <input
                      type="number"
                      step="0.000001"
                      value={shipmentForm.pickupAddress.longitude}
                      onChange={(e) => setShipmentForm({
                        ...shipmentForm, 
                        pickupAddress: {...shipmentForm.pickupAddress, longitude: e.target.value}
                      })}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                      placeholder="Click 'Choose on Map' to select"
                      readOnly
                    />
                  </div>
                </div>
              </div>

              {/* Delivery Address */}
              <div className="border-t pt-4">
                <div className="flex justify-between items-center mb-3">
                  <h4 className="text-md font-medium text-gray-900">Delivery Address</h4>
                  <button
                    type="button"
                    onClick={() => openLocationPicker('delivery')}
                    className="flex items-center gap-2 px-3 py-1 text-sm bg-green-600 text-white rounded-md hover:bg-green-700"
                  >
                    <FaMapMarkerAlt size={14} />
                    Choose on Map
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Contact Name</label>
                    <input
                      type="text"
                      value={shipmentForm.deliveryAddress.name}
                      onChange={(e) => setShipmentForm({
                        ...shipmentForm, 
                        deliveryAddress: {...shipmentForm.deliveryAddress, name: e.target.value}
                      })}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Phone</label>
                    <input
                      type="tel"
                      value={shipmentForm.deliveryAddress.phone}
                      onChange={(e) => setShipmentForm({
                        ...shipmentForm, 
                        deliveryAddress: {...shipmentForm.deliveryAddress, phone: e.target.value}
                      })}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700">Street Address</label>
                    <input
                      type="text"
                      value={shipmentForm.deliveryAddress.street}
                      onChange={(e) => setShipmentForm({
                        ...shipmentForm, 
                        deliveryAddress: {...shipmentForm.deliveryAddress, street: e.target.value}
                      })}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">City</label>
                    <input
                      type="text"
                      value={shipmentForm.deliveryAddress.city}
                      onChange={(e) => setShipmentForm({
                        ...shipmentForm, 
                        deliveryAddress: {...shipmentForm.deliveryAddress, city: e.target.value}
                      })}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">State/Province</label>
                    <input
                      type="text"
                      value={shipmentForm.deliveryAddress.state}
                      onChange={(e) => setShipmentForm({
                        ...shipmentForm, 
                        deliveryAddress: {...shipmentForm.deliveryAddress, state: e.target.value}
                      })}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Country</label>
                    <input
                      type="text"
                      value={shipmentForm.deliveryAddress.country}
                      onChange={(e) => setShipmentForm({
                        ...shipmentForm, 
                        deliveryAddress: {...shipmentForm.deliveryAddress, country: e.target.value}
                      })}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Postal Code</label>
                    <input
                      type="text"
                      value={shipmentForm.deliveryAddress.postalCode}
                      onChange={(e) => setShipmentForm({
                        ...shipmentForm, 
                        deliveryAddress: {...shipmentForm.deliveryAddress, postalCode: e.target.value}
                      })}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Latitude</label>
                    <input
                      type="number"
                      step="0.000001"
                      value={shipmentForm.deliveryAddress.latitude}
                      onChange={(e) => setShipmentForm({
                        ...shipmentForm, 
                        deliveryAddress: {...shipmentForm.deliveryAddress, latitude: e.target.value}
                      })}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                      placeholder="Click 'Choose on Map' to select"
                      readOnly
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Longitude</label>
                    <input
                      type="number"
                      step="0.000001"
                      value={shipmentForm.deliveryAddress.longitude}
                      onChange={(e) => setShipmentForm({
                        ...shipmentForm, 
                        deliveryAddress: {...shipmentForm.deliveryAddress, longitude: e.target.value}
                      })}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                      placeholder="Click 'Choose on Map' to select"
                      readOnly
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Create Shipment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {selectedShipment && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-2/3 shadow-lg rounded-md bg-white">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">Shipment Details</h3>
              <button
                onClick={() => setSelectedShipment(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Basic Information</h4>
                <div className="space-y-2">
                  <div>
                    <span className="text-sm font-medium text-gray-500">Order ID:</span>
                    <span className="ml-2 text-sm text-gray-900">{selectedShipment.externalOrderId || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500">Status:</span>
                    <span className={`ml-2 inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(selectedShipment.status)}`}>
                      {selectedShipment.status?.replace(/_/g, ' ')}
                    </span>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500">Customer:</span>
                    <span className="ml-2 text-sm text-gray-900">{selectedShipment.customer?.name || 'N/A'}</span>
                  </div>
                </div>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Details</h4>
                <div className="space-y-2">
                  <div>
                    <span className="text-sm font-medium text-gray-500">Weight:</span>
                    <span className="ml-2 text-sm text-gray-900">{selectedShipment.weightKg} kg</span>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500">Volume:</span>
                    <span className="ml-2 text-sm text-gray-900">{selectedShipment.volumeM3} m³</span>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500">Created:</span>
                    <span className="ml-2 text-sm text-gray-900">
                      {new Date(selectedShipment.createdAt).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

              {/* Location Picker Modal */}
        <LocationPicker
          isOpen={showLocationPicker}
          onClose={() => setShowLocationPicker(false)}
          onLocationSelect={handleLocationSelect}
          type={locationPickerType}
          initialPosition={[
            locationPickerType === 'pickup' 
              ? parseFloat(shipmentForm.pickupAddress.latitude) || 52.2297
              : parseFloat(shipmentForm.deliveryAddress.latitude) || 52.2297,
            locationPickerType === 'pickup'
              ? parseFloat(shipmentForm.pickupAddress.longitude) || 21.0122
              : parseFloat(shipmentForm.deliveryAddress.longitude) || 21.0122
          ]}
        />

        {/* Shipment Summary Modal */}
        {showShipmentSummary && createdShipment && (
          <ShipmentSummary
            shipment={createdShipment}
            onClose={() => setShowShipmentSummary(false)}
          />
        )}
      </div>
    );
  };

export default ShipmentManagement;
