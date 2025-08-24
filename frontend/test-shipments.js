const axios = require('axios');

const API_BASE = 'http://localhost:8080/api/admin';
const AUTH_HEADER = 'Bearer dev-admin-token';

async function createTestShipments() {
  try {
    console.log('Creating test shipments...');
    
    // First, get organizations to use as customers
    const orgsResponse = await axios.get(`${API_BASE}/organizations`, {
      headers: { Authorization: AUTH_HEADER }
    });
    
    if (orgsResponse.data.length === 0) {
      console.log('No organizations found. Please create some organizations first.');
      return;
    }
    
    const customerId = orgsResponse.data[0].id;
    
    // Create test shipments
    const shipments = [
      {
        externalOrderId: 'ORD-001-2024',
        commodityType: 'Electronics',
        weightKg: 25.5,
        lengthCm: 50,
        widthCm: 30,
        heightCm: 20,
        declaredValue: 1500.00,
        customerId: customerId,
        ecoMode: 'ECO'
      },
      {
        externalOrderId: 'ORD-002-2024',
        commodityType: 'Clothing',
        weightKg: 15.2,
        lengthCm: 40,
        widthCm: 25,
        heightCm: 15,
        declaredValue: 450.00,
        customerId: customerId,
        ecoMode: 'NONE'
      },
      {
        externalOrderId: 'ORD-003-2024',
        commodityType: 'Furniture',
        weightKg: 85.0,
        lengthCm: 120,
        widthCm: 80,
        heightCm: 60,
        declaredValue: 2500.00,
        customerId: customerId,
        ecoMode: 'EXPRESS'
      },
      {
        externalOrderId: 'ORD-004-2024',
        commodityType: 'Books',
        weightKg: 12.8,
        lengthCm: 35,
        widthCm: 25,
        heightCm: 10,
        declaredValue: 180.00,
        customerId: customerId,
        ecoMode: 'ECO'
      },
      {
        externalOrderId: 'ORD-005-2024',
        commodityType: 'Automotive Parts',
        weightKg: 45.3,
        lengthCm: 60,
        widthCm: 40,
        heightCm: 30,
        declaredValue: 1200.00,
        customerId: customerId,
        ecoMode: 'NONE'
      }
    ];
    
    for (const shipment of shipments) {
      try {
        const response = await axios.post(`${API_BASE}/shipments`, shipment, {
          headers: { 
            Authorization: AUTH_HEADER,
            'Content-Type': 'application/json'
          }
        });
        console.log(`Created shipment: ${shipment.externalOrderId}`);
      } catch (error) {
        console.error(`Failed to create shipment ${shipment.externalOrderId}:`, error.response?.data || error.message);
      }
    }
    
    console.log('Test shipments creation completed!');
    
  } catch (error) {
    console.error('Error creating test shipments:', error.response?.data || error.message);
  }
}

createTestShipments();
