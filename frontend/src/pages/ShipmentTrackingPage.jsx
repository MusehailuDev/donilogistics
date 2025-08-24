import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';

function ShipmentTrackingPage() {
  const { trackingNumber } = useParams();
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${API_BASE_URL}/api/public/shipments/track/${encodeURIComponent(trackingNumber)}`);
        setData(res.data);
      } catch (e) {
        setError('Not found');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [trackingNumber]);

  if (loading) return <div className="p-6">Loading...</div>;
  if (error) return <div className="p-6 text-red-600">{error}</div>;

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-4">
      <h1 className="text-2xl font-bold">Track Shipment</h1>
      <div className="bg-white rounded shadow p-4 space-y-2">
        <div className="flex justify-between items-center">
          <div>
            <div className="text-gray-500 text-sm">Tracking Number</div>
            <div className="font-semibold">{data.trackingNumber}</div>
          </div>
          <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-semibold">{data.status}</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <div className="text-gray-500 text-sm">Order</div>
            <div>{data.externalOrderId || 'N/A'}</div>
          </div>
          <div>
            <div className="text-gray-500 text-sm">Weight</div>
            <div>{data.weightKg || 'N/A'} kg</div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded shadow p-4">
        <h2 className="font-semibold mb-3">Addresses</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <div className="text-gray-500 text-sm">Pickup</div>
            <div>{data.pickupAddress?.street || ''} {data.pickupAddress?.city || ''}</div>
            <div className="text-xs text-gray-500">{data.pickupAddress?.latitude}, {data.pickupAddress?.longitude}</div>
          </div>
          <div>
            <div className="text-gray-500 text-sm">Delivery</div>
            <div>{data.deliveryAddress?.street || ''} {data.deliveryAddress?.city || ''}</div>
            <div className="text-xs text-gray-500">{data.deliveryAddress?.latitude}, {data.deliveryAddress?.longitude}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ShipmentTrackingPage;
