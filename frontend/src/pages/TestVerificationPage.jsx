import React, { useState } from 'react';
import { toast } from 'react-hot-toast';

const TestVerificationPage = () => {
  const [token, setToken] = useState('');
  const [result, setResult] = useState('');

  const testVerification = async () => {
    try {
      const base = process.env.REACT_APP_API_URL || 'http://localhost:8080';
      const response = await fetch(`${base}/api/auth/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token }),
      });

      const data = await response.json();
      setResult(JSON.stringify(data, null, 2));
      
      if (response.ok) {
        toast.success('Verification successful!');
      } else {
        toast.error('Verification failed: ' + (data.error || 'Unknown error'));
      }
    } catch (error) {
      setResult('Error: ' + error.message);
      toast.error('Network error: ' + error.message);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Test Email Verification</h1>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Verification Token
            </label>
            <input
              type="text"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter verification token"
            />
          </div>
          
          <button
            onClick={testVerification}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
          >
            Test Verification
          </button>
          
          {result && (
            <div className="mt-4">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Result:</h3>
              <pre className="bg-gray-100 p-3 rounded text-xs overflow-auto">
                {result}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TestVerificationPage;
