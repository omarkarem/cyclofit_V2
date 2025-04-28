import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';

function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [status, setStatus] = useState('verifying'); // 'verifying', 'success', 'error', 'already_verified'
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();
  const verificationAttempted = useRef(false);

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setErrorMessage('Verification token is missing. Please check your email link.');
      return;
    }

    const verifyEmail = async () => {
      // Prevent multiple verification attempts
      if (verificationAttempted.current) return;
      verificationAttempted.current = true;

      try {
        // Send token to backend verification endpoint
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/auth/verify-email?token=${token}`);
        
        if (response.data.success) {
          if (response.data.msg === 'Email already verified') {
            setStatus('already_verified');
          } else {
            setStatus('success');
          }
          
          // Store verification status in localStorage
          localStorage.setItem('emailVerified', 'true');
          
          // Redirect to login after 3 seconds
          setTimeout(() => {
            navigate('/login?verified=true');
          }, 3000);
        } else {
          throw new Error(response.data.msg || 'Verification failed');
        }
      } catch (error) {
        console.error('Verification error:', error);
        setStatus('error');
        setErrorMessage(
          error.response?.data?.msg || 
          error.response?.data?.message || 
          'Email verification failed. The link may be expired or invalid.'
        );
      }
    };

    verifyEmail();
  }, [token, navigate]);

  const goToLogin = () => {
    navigate('/login');
  };

  const resendVerification = async () => {
    try {
      const email = localStorage.getItem('pendingVerificationEmail');
      
      if (!email) {
        setErrorMessage('Your email is not available. Please try registering again.');
        return;
      }
      
      await axios.post(`${process.env.REACT_APP_API_URL}/api/auth/resend-verification`, { email });
      setStatus('resent');
    } catch (error) {
      setErrorMessage('Failed to resend verification email. Please try again later.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <div className="text-center">
            {status === 'verifying' && (
              <>
                <svg className="animate-spin mx-auto h-12 w-12 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <h2 className="mt-6 text-center text-xl font-extrabold text-gray-900">Verifying your email...</h2>
                <p className="mt-2 text-center text-sm text-gray-600">Please wait while we verify your email address.</p>
              </>
            )}

            {status === 'success' && (
              <>
                <svg className="h-16 w-16 text-green-500 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <h2 className="mt-6 text-center text-xl font-extrabold text-gray-900">Email verified successfully!</h2>
                <p className="mt-2 text-center text-sm text-gray-600">
                  Your email has been verified. You will be redirected to the login page shortly.
                </p>
                <button
                  onClick={goToLogin}
                  className="mt-4 w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Go to Login
                </button>
              </>
            )}

            {status === 'already_verified' && (
              <>
                <svg className="h-16 w-16 text-green-500 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <h2 className="mt-6 text-center text-xl font-extrabold text-gray-900">Email Already Verified</h2>
                <p className="mt-2 text-center text-sm text-gray-600">
                  Your email has already been verified. You will be redirected to the login page shortly.
                </p>
                <button
                  onClick={goToLogin}
                  className="mt-4 w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Go to Login
                </button>
              </>
            )}

            {status === 'error' && (
              <>
                <svg className="h-16 w-16 text-red-500 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                <h2 className="mt-6 text-center text-xl font-extrabold text-gray-900">Verification Failed</h2>
                <p className="mt-2 text-center text-sm text-gray-600">
                  {errorMessage}
                </p>
                <div className="mt-4 flex flex-col space-y-3">
                  <button
                    onClick={resendVerification}
                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Resend Verification Email
                  </button>
                  <button
                    onClick={goToLogin}
                    className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Back to Login
                  </button>
                </div>
              </>
            )}

            {status === 'resent' && (
              <>
                <svg className="h-16 w-16 text-green-500 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <h2 className="mt-6 text-center text-xl font-extrabold text-gray-900">Verification Email Sent</h2>
                <p className="mt-2 text-center text-sm text-gray-600">
                  We've sent a new verification email to your inbox. Please check your email.
                </p>
                <button
                  onClick={goToLogin}
                  className="mt-4 w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Go to Login
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default VerifyEmail; 