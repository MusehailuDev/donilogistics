import React from 'react';
import QRCode from 'react-qr-code';
import { generateShipmentSummary } from '../utils/trackingNumberGenerator';

const ShipmentSummary = ({ shipment, onClose, onPrint }) => {
  const summary = generateShipmentSummary(shipment);
  
  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Shipment Summary - ${summary.trackingNumber}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .summary-container { max-width: 600px; margin: 0 auto; }
            .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 10px; margin-bottom: 20px; }
            .tracking-number { font-size: 24px; font-weight: bold; color: #2563eb; margin: 10px 0; }
            .qr-section { text-align: center; margin: 20px 0; }
            .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin: 20px 0; }
            .info-item { border: 1px solid #ddd; padding: 10px; border-radius: 5px; }
            .label { font-weight: bold; color: #666; font-size: 12px; }
            .value { font-size: 14px; margin-top: 5px; }
            .status-badge { 
              display: inline-block; 
              padding: 4px 8px; 
              border-radius: 12px; 
              font-size: 12px; 
              font-weight: bold;
              background-color: #10b981;
              color: white;
            }
            .footer { margin-top: 30px; text-align: center; font-size: 12px; color: #666; }
            @media print {
              body { margin: 0; }
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="summary-container">
            <div class="header">
              <h1>Doni Logistics</h1>
              <div class="tracking-number">${summary.trackingNumber}</div>
              <div class="status-badge">${summary.status}</div>
            </div>
            
            <div class="qr-section">
              <div style="display: inline-block; padding: 20px; border: 2px solid #333;">
                <div style="width: 200px; height: 200px; margin: 0 auto;">
                  <svg width="200" height="200" viewBox="0 0 200 200">
                    ${QRCode.toString(JSON.stringify(summary), { width: 200, height: 200 })}
                  </svg>
                </div>
              </div>
              <p style="margin-top: 10px; font-size: 12px;">Scan to track shipment</p>
            </div>
            
            <div class="info-grid">
              <div class="info-item">
                <div class="label">External Order ID</div>
                <div class="value">${summary.externalOrderId}</div>
              </div>
              <div class="info-item">
                <div class="label">Customer</div>
                <div class="value">${summary.customer}</div>
              </div>
              <div class="info-item">
                <div class="label">Weight</div>
                <div class="value">${summary.weight}</div>
              </div>
              <div class="info-item">
                <div class="label">Volume</div>
                <div class="value">${summary.volume}</div>
              </div>
              <div class="info-item">
                <div class="label">Commodity Type</div>
                <div class="value">${summary.commodityType}</div>
              </div>
              <div class="info-item">
                <div class="label">Priority</div>
                <div class="value">${summary.priority}</div>
              </div>
              <div class="info-item">
                <div class="label">Pickup Location</div>
                <div class="value">${summary.pickup}</div>
              </div>
              <div class="info-item">
                <div class="label">Delivery Location</div>
                <div class="value">${summary.delivery}</div>
              </div>
              <div class="info-item">
                <div class="label">Consolidation Allowed</div>
                <div class="value">${summary.consolidationAllowed}</div>
              </div>
              <div class="info-item">
                <div class="label">Eco Mode</div>
                <div class="value">${summary.ecoMode}</div>
              </div>
            </div>
            
            <div class="footer">
              <p>Created: ${summary.createdAt}</p>
              <p>Track your shipment at: ${window.location.origin}/track/${summary.trackingNumber}</p>
            </div>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-10 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-2/3 shadow-lg rounded-md bg-white max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-900">Shipment Created Successfully!</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        </div>

        {/* Header with Tracking Number */}
        <div className="text-center border-b pb-4 mb-6">
          <h2 className="text-2xl font-bold text-blue-600 mb-2">{summary.trackingNumber}</h2>
          <span className="inline-flex px-3 py-1 text-sm font-semibold rounded-full bg-green-100 text-green-800">
            {summary.status}
          </span>
        </div>

        {/* QR Code Section */}
        <div className="text-center mb-6">
          <div className="inline-block p-4 border-2 border-gray-300 rounded-lg">
            <QRCode 
              value={JSON.stringify(summary)}
              size={200}
              level="M"
              includeMargin={true}
            />
          </div>
          <p className="text-sm text-gray-600 mt-2">Scan to track shipment</p>
        </div>

        {/* Shipment Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="bg-gray-50 p-3 rounded-lg">
            <div className="text-sm font-medium text-gray-500">External Order ID</div>
            <div className="text-sm font-semibold">{summary.externalOrderId}</div>
          </div>
          <div className="bg-gray-50 p-3 rounded-lg">
            <div className="text-sm font-medium text-gray-500">Customer</div>
            <div className="text-sm font-semibold">{summary.customer}</div>
          </div>
          <div className="bg-gray-50 p-3 rounded-lg">
            <div className="text-sm font-medium text-gray-500">Weight</div>
            <div className="text-sm font-semibold">{summary.weight}</div>
          </div>
          <div className="bg-gray-50 p-3 rounded-lg">
            <div className="text-sm font-medium text-gray-500">Volume</div>
            <div className="text-sm font-semibold">{summary.volume}</div>
          </div>
          <div className="bg-gray-50 p-3 rounded-lg">
            <div className="text-sm font-medium text-gray-500">Commodity Type</div>
            <div className="text-sm font-semibold">{summary.commodityType}</div>
          </div>
          <div className="bg-gray-50 p-3 rounded-lg">
            <div className="text-sm font-medium text-gray-500">Priority</div>
            <div className="text-sm font-semibold">{summary.priority}</div>
          </div>
          <div className="bg-gray-50 p-3 rounded-lg">
            <div className="text-sm font-medium text-gray-500">Pickup Location</div>
            <div className="text-sm font-semibold">{summary.pickup}</div>
          </div>
          <div className="bg-gray-50 p-3 rounded-lg">
            <div className="text-sm font-medium text-gray-500">Delivery Location</div>
            <div className="text-sm font-semibold">{summary.delivery}</div>
          </div>
          <div className="bg-gray-50 p-3 rounded-lg">
            <div className="text-sm font-medium text-gray-500">Consolidation Allowed</div>
            <div className="text-sm font-semibold">{summary.consolidationAllowed}</div>
          </div>
          <div className="bg-gray-50 p-3 rounded-lg">
            <div className="text-sm font-medium text-gray-500">Eco Mode</div>
            <div className="text-sm font-semibold">{summary.ecoMode}</div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-sm text-gray-600 mb-6">
          <p>Created: {summary.createdAt}</p>
          <p>Track your shipment at: {window.location.origin}/track/{summary.trackingNumber}</p>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-center space-x-4">
          <button
            onClick={handlePrint}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center gap-2"
          >
            🖨️ Print Summary
          </button>
          <button
            onClick={onClose}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ShipmentSummary;
