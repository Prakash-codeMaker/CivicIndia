import React, { useState, useEffect } from 'react';

interface GovernmentAuthProps {
  onAuthSuccess?: (data: AuthData) => void;
}

interface AuthData {
  email: string;
  employeeId: string;
  department: string;
  role: string;
  sessionToken: string;
}

const GOVERNMENT_EMAIL_DOMAINS = ['@gov.in', '@nic.in', '@gov.in', '@up.nic.in', '@mp.gov.in'];
const MAX_ATTEMPTS = 3;
const SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes
const OTP_EXPIRY = 10 * 60 * 1000; // 10 minutes
const ALLOWED_FILE_TYPES = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

const DEPARTMENTS = [
  'Public Works Department',
  'Municipal Corporation',
  'Health Department',
  'Education Department',
  'Police Department',
  'Revenue Department',
  'Transport Department',
];

const GovernmentAuth: React.FC<GovernmentAuthProps> = ({ onAuthSuccess }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [email, setEmail] = useState('');
  const [employeeIdFile, setEmployeeIdFile] = useState<File | null>(null);
  const [otp, setOtp] = useState('');
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [department, setDepartment] = useState('');
  const [attempts, setAttempts] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [sessionStart, setSessionStart] = useState<number | null>(null);

  useEffect(() => {
    // Check session timeout
    const checkSession = () => {
      if (sessionStart && Date.now() - sessionStart > SESSION_TIMEOUT) {
        handleLogout();
        alert('Session expired. Please login again.');
      }
    };

    const interval = setInterval(checkSession, 60000);
    return () => clearInterval(interval);
  }, [sessionStart]);

  const validateEmail = (email: string): boolean => {
    const domain = email.split('@')[1];
    return GOVERNMENT_EMAIL_DOMAINS.some(govDomain => email.endsWith(govDomain));
  };

  const generateOTP = (): string => {
    return Math.floor(100000 + Math.random() * 900000).toString();
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email) {
      setError('Please enter your official email address');
      return;
    }

    if (!validateEmail(email)) {
      setError('Please use a government email (@gov.in or @nic.in)');
      return;
    }

    if (attempts >= MAX_ATTEMPTS) {
      setError('Maximum attempts exceeded. Please try again later.');
      return;
    }

    setLoading(true);

    // Simulate API call
    setTimeout(() => {
      const newOtp = generateOTP();
      setGeneratedOtp(newOtp);
      setOtpSent(true);
      setLoading(false);
      
      // In production, send OTP to email
      console.log('OTP sent to:', email, 'OTP:', newOtp);
      
      setCurrentStep(3);
    }, 1500);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    
    if (!file) return;

    // Validate file type
    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      setError('Please upload a PDF, JPG, or PNG file');
      return;
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      setError('File size should be less than 5MB');
      return;
    }

    setEmployeeIdFile(file);
    setError('');
  };

  const handleFileSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!employeeIdFile) {
      setError('Please upload your employee ID');
      return;
    }

    setCurrentStep(3);
  };

  const handleOtpVerify = (e: React.FormEvent) => {
    e.preventDefault();

    if (!otp) {
      setError('Please enter the OTP');
      return;
    }

    if (otp.length !== 6) {
      setError('OTP must be 6 digits');
      return;
    }

    if (otp !== generatedOtp) {
      const newAttempts = attempts + 1;
      setAttempts(newAttempts);
      
      if (newAttempts >= MAX_ATTEMPTS) {
        setError('Maximum attempts exceeded. OTP expired.');
        setTimeout(() => setCurrentStep(1), 2000);
        return;
      }
      
      setError(`Invalid OTP. ${MAX_ATTEMPTS - newAttempts} attempts remaining.`);
      return;
    }

    setCurrentStep(4);
  };

  const handleDepartmentSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!department) {
      setError('Please select a department');
      return;
    }

    setLoading(true);

    // Simulate API call
    setTimeout(() => {
      const sessionToken = `gov_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const role = email.includes('admin') ? 'Admin' : 
                   email.includes('head') ? 'Department Head' : 'Field Worker';

      const authData: AuthData = {
        email,
        employeeId: employeeIdFile?.name || '',
        department,
        role,
        sessionToken,
      };

      // Store session
      localStorage.setItem('gov_session', JSON.stringify({
        ...authData,
        sessionStart: Date.now(),
      }));

      setSessionStart(Date.now());
      setLoading(false);
      
      if (onAuthSuccess) {
        onAuthSuccess(authData);
      }
    }, 1500);
  };

  const handleLogout = () => {
    localStorage.removeItem('gov_session');
    setCurrentStep(1);
    setEmail('');
    setEmployeeIdFile(null);
    setOtp('');
    setDepartment('');
    setAttempts(0);
    setOtpSent(false);
    setSessionStart(null);
    setError('');
  };

  const progressPercentage = ((currentStep - 1) / 3) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Government Employee Portal
          </h1>
          <p className="text-gray-600">Multi-step verification required</p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">
              Step {currentStep} of 4
            </span>
            <span className="text-sm font-medium text-blue-600">
              {Math.round(progressPercentage)}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>

        {/* Step 1: Email */}
        {currentStep === 1 && (
          <form onSubmit={handleEmailSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Official Email Address *
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="employee@gov.in"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
              <p className="mt-1 text-sm text-gray-500">
                Use your government email (@gov.in, @nic.in)
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Sending OTP...' : 'Continue'}
            </button>
          </form>
        )}

        {/* Step 2: File Upload */}
        {currentStep === 2 && (
          <form onSubmit={handleFileSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Upload Employee ID *
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors">
                <input
                  type="file"
                  id="file-upload"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <label htmlFor="file-upload" className="cursor-pointer">
                  <svg
                    className="mx-auto h-12 w-12 text-gray-400"
                    stroke="currentColor"
                    fill="none"
                    viewBox="0 0 48 48"
                  >
                    <path
                      d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                      strokeWidth={2}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <p className="mt-2 text-sm text-gray-600">
                    Click to upload or drag and drop
                  </p>
                  <p className="mt-1 text-xs text-gray-500">
                    PDF, JPG, or PNG (max 5MB)
                  </p>
                </label>
              </div>
              {employeeIdFile && (
                <p className="mt-2 text-sm text-green-600">
                  ✓ {employeeIdFile.name}
                </p>
              )}
            </div>

            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => setCurrentStep(1)}
                className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-300 transition-colors"
              >
                Back
              </button>
              <button
                type="submit"
                className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
                disabled={!employeeIdFile}
              >
                Continue
              </button>
            </div>
          </form>
        )}

        {/* Step 3: OTP Verification */}
        {currentStep === 3 && (
          <form onSubmit={handleOtpVerify} className="space-y-6">
            <div>
              <label htmlFor="otp" className="block text-sm font-medium text-gray-700 mb-2">
                Enter OTP *
              </label>
              <p className="text-sm text-gray-600 mb-4">
                We've sent a 6-digit code to <strong>{email}</strong>
              </p>
              <input
                type="text"
                id="otp"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="000000"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg text-center text-2xl tracking-widest focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                maxLength={6}
                required
              />
              <p className="mt-2 text-sm text-gray-500">
                OTP expires in 10 minutes
              </p>
            </div>

            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => {
                  setOtp('');
                  setAttempts(0);
                  setCurrentStep(1);
                }}
                className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-300 transition-colors"
              >
                Back
              </button>
              <button
                type="submit"
                className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                Verify OTP
              </button>
            </div>
          </form>
        )}

        {/* Step 4: Department Selection */}
        {currentStep === 4 && (
          <form onSubmit={handleDepartmentSubmit} className="space-y-6">
            <div>
              <label htmlFor="department" className="block text-sm font-medium text-gray-700 mb-2">
                Select Department *
              </label>
              <select
                id="department"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                <option value="">Choose a department</option>
                {DEPARTMENTS.map((dept) => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
              </select>
            </div>

            {loading && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-blue-800 text-center">
                  Processing your request...
                </p>
              </div>
            )}

            {!loading && (
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => {
                    setDepartment('');
                    setOtp('');
                    setAttempts(0);
                    setCurrentStep(3);
                  }}
                  className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-300 transition-colors"
                >
                  Back
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                >
                  Complete Verification
                </button>
              </div>
            )}
          </form>
        )}

        {/* Error Message */}
        {error && (
          <div className="mt-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800 text-sm">{error}</p>
          </div>
        )}

        {/* Success Message */}
        {currentStep === 4 && loading && (
          <div className="mt-6 bg-green-50 border border-green-200 rounded-lg p-4">
            <p className="text-green-800 text-center">
              ✓ Verification successful! Redirecting...
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default GovernmentAuth;
