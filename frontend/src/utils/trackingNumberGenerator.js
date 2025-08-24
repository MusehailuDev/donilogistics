// Tracking Number Generator Utility
export const generateTrackingNumber = (externalOrderId, companyAbbreviation = 'DONI') => {
  // Get current timestamp for uniqueness
  const timestamp = Date.now().toString().slice(-8);
  
  // Clean and format external order ID (take last 6 characters)
  const cleanOrderId = externalOrderId.replace(/[^A-Z0-9]/gi, '').toUpperCase().slice(-6);
  
  // Generate a random 4-character string
  const randomChars = Math.random().toString(36).substring(2, 6).toUpperCase();
  
  // Format: DONI-ORDERID-TIMESTAMP-RANDOM
  const trackingNumber = `${companyAbbreviation}-${cleanOrderId}-${timestamp}-${randomChars}`;
  
  return trackingNumber;
};

// Generate QR code data with shipment summary
export const generateQRCodeData = (shipmentData) => {
  const qrData = {
    trackingNumber: shipmentData.trackingNumber,
    externalOrderId: shipmentData.externalOrderId,
    customer: shipmentData.customer?.name || 'N/A',
    weight: `${shipmentData.weightKg} kg`,
    commodityType: shipmentData.commodityType,
    status: shipmentData.status || 'CREATED',
    pickupAddress: `${shipmentData.pickupAddress?.city || ''}, ${shipmentData.pickupAddress?.country || ''}`,
    deliveryAddress: `${shipmentData.deliveryAddress?.city || ''}, ${shipmentData.deliveryAddress?.country || ''}`,
    createdAt: new Date().toISOString(),
    trackingUrl: `${window.location.origin}/track/${shipmentData.trackingNumber}`
  };
  
  return JSON.stringify(qrData);
};

// Generate shipment summary for display
export const generateShipmentSummary = (shipmentData) => {
  return {
    trackingNumber: shipmentData.trackingNumber,
    externalOrderId: shipmentData.externalOrderId,
    customer: shipmentData.customer?.name || 'N/A',
    weight: `${shipmentData.weightKg} kg`,
    volume: shipmentData.volumeM3 ? `${shipmentData.volumeM3} m³` : 'N/A',
    commodityType: shipmentData.commodityType,
    status: shipmentData.status || 'CREATED',
    pickup: `${shipmentData.pickupAddress?.city || ''}, ${shipmentData.pickupAddress?.country || ''}`,
    delivery: `${shipmentData.deliveryAddress?.city || ''}, ${shipmentData.deliveryAddress?.country || ''}`,
    createdAt: new Date().toLocaleString(),
    consolidationAllowed: shipmentData.consolidationAllowed ? 'Yes' : 'No',
    priority: shipmentData.consolidationPriority || 'NORMAL',
    ecoMode: shipmentData.ecoMode || 'NONE'
  };
};
