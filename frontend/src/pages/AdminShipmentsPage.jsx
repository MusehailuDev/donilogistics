import React from 'react';
import AdminLayout from '../components/admin/AdminLayout';
import ShipmentManagement from '../components/ShipmentManagement';

const AdminShipmentsPage = () => {
  return (
    <AdminLayout title="Shipment Management">
      <ShipmentManagement />
    </AdminLayout>
  );
};

export default AdminShipmentsPage;
