import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { Eye, EyeOff, CheckCircle, AlertCircle } from 'lucide-react';
import { authAPI } from '../services/api';
import Logo from '../components/Logo';

const RegisterPage = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [organizations, setOrganizations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    setValue,
  } = useForm();

  const password = watch('password', '');

  useEffect(() => {
    loadOrganizations();
  }, []);

  const loadOrganizations = async () => {
    try {
      const response = await authAPI.getOrganizations();
      setOrganizations(response.data);
    } catch (error) {
      console.error('Error loading organizations:', error);
      toast.error('Failed to load organizations');
    }
  };

  const userRoles = [
    { value: 'ORGANIZATION_ADMIN', label: 'Organization Administrator' },
    { value: 'DISPATCHER', label: 'Dispatcher/Fleet Manager' },
    { value: 'DRIVER', label: 'Driver' },
    { value: 'WAREHOUSE_MANAGER', label: 'Warehouse Manager' },
    { value: 'FACILITATOR', label: 'Facilitator' },
    { value: 'CUSTOMER_SERVICE', label: 'Customer Service' },
    { value: 'ACCOUNTANT', label: 'Accountant' },
    { value: 'OPERATIONS_MANAGER', label: 'Operations Manager' },
  ];

  const validatePassword = (password) => {
    const minLength = password.length >= 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    return {
      minLength,
      hasUpperCase,
      hasLowerCase,
      hasNumbers,
      hasSpecialChar,
      isValid: minLength && hasUpperCase && hasLowerCase && hasNumbers && hasSpecialChar,
    };
  };

  const passwordValidation = validatePassword(password);

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const userData = {
        username: data.username,
        email: data.email,
        password: data.password,
        firstName: data.firstName,
        lastName: data.lastName,
        phoneNumber: data.phoneNumber,
        address: data.address,
        organizationId: data.organizationId,
        userRole: data.userRole,
      };

      await authAPI.register(userData);
      toast.success('Registration successful! Please check your email for verification.');
      navigate('/login');
    } catch (error) {
      console.error('Registration error:', error);
      const errorMessage = error.response?.data?.message || 'Registration failed. Please try again.';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <Logo size="xxl" className="mx-auto mb-8" />
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Create your account</h2>
          <p className="text-gray-600">Join Doni Logistics and streamline your operations</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Step 1: Basic Information */}
          {step === 1 && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    First Name *
                  </label>
                  <input
                    type="text"
                    {...register('firstName', { required: 'First name is required' })}
                    className="input-field"
                    placeholder="John"
                  />
                  {errors.firstName && (
                    <p className="text-red-500 text-sm mt-1">{errors.firstName.message}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Last Name *
                  </label>
                  <input
                    type="text"
                    {...register('lastName', { required: 'Last name is required' })}
                    className="input-field"
                    placeholder="Doe"
                  />
                  {errors.lastName && (
                    <p className="text-red-500 text-sm mt-1">{errors.lastName.message}</p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address *
                </label>
                <input
                  type="email"
                  {...register('email', {
                    required: 'Email is required',
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: 'Invalid email address',
                    },
                  })}
                  className="input-field"
                  placeholder="john@example.com"
                />
                {errors.email && (
                  <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  {...register('phoneNumber')}
                  className="input-field"
                  placeholder="+1 (555) 123-4567"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Address
                </label>
                <textarea
                  {...register('address')}
                  className="input-field"
                  rows="3"
                  placeholder="Enter your address"
                />
              </div>

              <button
                type="button"
                onClick={() => setStep(2)}
                className="btn-primary w-full"
              >
                Next Step
              </button>
            </>
          )}

          {/* Step 2: Account Details */}
          {step === 2 && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Username *
                </label>
                <input
                  type="text"
                  {...register('username', {
                    required: 'Username is required',
                    minLength: {
                      value: 3,
                      message: 'Username must be at least 3 characters',
                    },
                  })}
                  className="input-field"
                  placeholder="johndoe"
                />
                {errors.username && (
                  <p className="text-red-500 text-sm mt-1">{errors.username.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password *
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    {...register('password', {
                      required: 'Password is required',
                      validate: (value) => validatePassword(value).isValid || 'Password does not meet requirements',
                    })}
                    className="input-field pr-10"
                    placeholder="Create a strong password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>
                )}

                {/* Password strength indicator */}
                <div className="mt-3 space-y-2">
                  <div className="flex items-center space-x-2">
                    {passwordValidation.minLength ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : (
                      <AlertCircle className="h-4 w-4 text-gray-400" />
                    )}
                    <span className="text-sm text-gray-600">At least 8 characters</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    {passwordValidation.hasUpperCase ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : (
                      <AlertCircle className="h-4 w-4 text-gray-400" />
                    )}
                    <span className="text-sm text-gray-600">One uppercase letter</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    {passwordValidation.hasLowerCase ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : (
                      <AlertCircle className="h-4 w-4 text-gray-400" />
                    )}
                    <span className="text-sm text-gray-600">One lowercase letter</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    {passwordValidation.hasNumbers ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : (
                      <AlertCircle className="h-4 w-4 text-gray-400" />
                    )}
                    <span className="text-sm text-gray-600">One number</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    {passwordValidation.hasSpecialChar ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : (
                      <AlertCircle className="h-4 w-4 text-gray-400" />
                    )}
                    <span className="text-sm text-gray-600">One special character</span>
                  </div>
                </div>
              </div>

              <div className="flex space-x-4">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="btn-outline flex-1"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className="btn-primary flex-1"
                >
                  Next Step
                </button>
              </div>
            </>
          )}

          {/* Step 3: Organization & Role */}
          {step === 3 && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Organization *
                </label>
                <select
                  {...register('organizationId', { required: 'Please select an organization' })}
                  className="input-field"
                >
                  <option value="">Select your organization</option>
                  {organizations.map((org) => (
                    <option key={org.id} value={org.id}>
                      {org.name}
                    </option>
                  ))}
                </select>
                {errors.organizationId && (
                  <p className="text-red-500 text-sm mt-1">{errors.organizationId.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Role *
                </label>
                <select
                  {...register('userRole', { required: 'Please select a role' })}
                  className="input-field"
                >
                  <option value="">Select your role</option>
                  {userRoles.map((role) => (
                    <option key={role.value} value={role.value}>
                      {role.label}
                    </option>
                  ))}
                </select>
                {errors.userRole && (
                  <p className="text-red-500 text-sm mt-1">{errors.userRole.message}</p>
                )}
              </div>

              <div className="flex space-x-4">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="btn-outline flex-1"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="btn-secondary flex-1 disabled:opacity-50"
                >
                  {loading ? 'Creating Account...' : 'Create Account'}
                </button>
              </div>
            </>
          )}
        </form>

        <div className="text-center">
          <p className="text-gray-600">
            Already have an account?{' '}
            <Link to="/login" className="text-doni-blue hover:text-blue-700 font-medium">
              Sign in
            </Link>
          </p>
          <p className="text-gray-500 mt-2 text-sm">
            Organization not listed?{' '}
            <Link to="/admin/orgs" className="text-doni-blue hover:text-blue-700 font-medium">
              Register a new organization
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
