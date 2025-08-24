import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
// import { toast } from 'react-hot-toast';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import Logo from '../components/Logo';

const EmailVerificationPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('verifying'); // 'verifying', 'success', 'error'
  const [message, setMessage] = useState('');

  useEffect(() => {
    const verifyEmail = async () => {
      const token = searchParams.get('token');
      const statusParam = searchParams.get('status');
      const messageParam = searchParams.get('message');
      
      // If we have status and message from URL (redirect from backend), use them
      if (statusParam && messageParam) {
        setStatus(statusParam);
        setMessage(decodeURIComponent(messageParam));
        return;
      }
      
      // Otherwise, if we have a token, verify it via API
      if (!token) {
        setStatus('error');
        setMessage('Invalid verification link. No token provided.');
        return;
      }

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

        if (response.ok && data.success) {
          setStatus('success');
          setMessage('Email verified successfully! You can now log in to your account.');
        } else {
          setStatus('error');
          setMessage(data.message || 'Email verification failed. The link may be expired or invalid.');
        }
      } catch (error) {
        console.error('Verification error:', error);
        setStatus('error');
        setMessage('An error occurred during verification. Please try again.');
      }
    };

    verifyEmail();
  }, [searchParams]);

  const handleLogin = () => {
    navigate('/login');
  };

  const handleRegister = () => {
    navigate('/register');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
        <div className="text-center mb-8">
          <Logo className="h-12 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900">Email Verification</h1>
        </div>

        <div className="text-center">
          {status === 'verifying' && (
            <div className="space-y-4">
              <Loader2 className="h-12 w-12 text-blue-500 animate-spin mx-auto" />
              <p className="text-gray-600">Verifying your email address...</p>
            </div>
          )}

          {status === 'success' && (
            <div className="space-y-4">
              <CheckCircle className="h-12 w-12 text-green-500 mx-auto" />
              <p className="text-green-600 font-medium">{message}</p>
              <button
                onClick={handleLogin}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
              >
                Go to Login
              </button>
            </div>
          )}

          {status === 'error' && (
            <div className="space-y-4">
              <XCircle className="h-12 w-12 text-red-500 mx-auto" />
              <p className="text-red-600 font-medium">{message}</p>
              <div className="space-y-2">
                <button
                  onClick={handleLogin}
                  className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
                >
                  Go to Login
                </button>
                <button
                  onClick={handleRegister}
                  className="w-full bg-gray-200 text-gray-800 py-2 px-4 rounded-md hover:bg-gray-300 transition-colors"
                >
                  Register Again
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EmailVerificationPage;
