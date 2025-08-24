import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import Logo from '../components/Logo';
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';

const VerifyEmailPage = () => {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState('pending');
  const token = searchParams.get('token');

  useEffect(() => {
    const run = async () => {
      if (!token) {
        setStatus('error');
        toast.error('Missing token');
        return;
      }
      try {
        await axios.get(`${API_BASE_URL}/api/auth/verify`, { params: { token } });
        setStatus('ok');
        toast.success('Email verified successfully');
      } catch (e) {
        setStatus('error');
        toast.error('Verification failed');
      }
    };
    run();
  }, [token]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white shadow rounded-lg p-8 text-center">
        <Logo size="md" className="mx-auto mb-6" />
        {status === 'pending' && (
          <>
            <h2 className="text-xl font-semibold">Verifying your email...</h2>
            <p className="text-gray-500 mt-2">Please wait</p>
          </>
        )}
        {status === 'ok' && (
          <>
            <h2 className="text-xl font-semibold text-green-600">Email verified!</h2>
            <p className="text-gray-600 mt-2">You can now sign in.</p>
            <Link to="/login" className="btn-primary inline-block mt-6">Go to Login</Link>
          </>
        )}
        {status === 'error' && (
          <>
            <h2 className="text-xl font-semibold text-red-600">Verification failed</h2>
            <p className="text-gray-600 mt-2">The link may be invalid or expired.</p>
            <Link to="/login" className="btn-primary inline-block mt-6">Back to Login</Link>
          </>
        )}
      </div>
    </div>
  );
};

export default VerifyEmailPage;


