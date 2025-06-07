import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';

function Login() {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [needsVerification, setNeedsVerification] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  
  // Check if there's a redirect path in the URL params
  const from = location.state?.from?.pathname || '/dashboard';

  // Check if email was just verified
  const verified = new URLSearchParams(location.search).get('verified') === 'true';

  const { email, password } = formData;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    // Clear verification error when user updates form
    if (needsVerification) {
      setNeedsVerification(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setNeedsVerification(false);
    
    try {
      setLoading(true);
      const apiUrl = process.env.REACT_APP_API_URL;
      const res = await axios.post(`${apiUrl}/api/auth/login`, {
        email,
        password
      });
      
      // Store token and user data in localStorage
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data));
      
      setLoading(false);
      
      // Check if profile is complete by looking at additional profile fields
      const user = res.data;
      
      // Admin users don't need profile setup, redirect them to admin dashboard
      if (user.role === 'admin' || user.role === 'super_admin') {
        navigate('/admin/dashboard', { replace: true });
      } else {
        // For regular users, check if profile is complete
        const isProfileComplete = 
          user.height && 
          user.weight && 
          user.experience;
        
        // If profile is not complete, redirect to profile setup
        if (!isProfileComplete) {
          navigate('/profile-setup');
        } else {
          // Redirect to dashboard or previous page
          navigate(from, { replace: true });
        }
      }
    } catch (err) {
      setLoading(false);
      
      // Check if the error is about email verification
      if (err.response?.status === 403 && err.response?.data?.needsVerification) {
        setNeedsVerification(true);
      } else {
        setError(err.response?.data?.msg || 'Login failed. Please check your credentials.');
      }
    }
  };

  const handleResendVerification = async () => {
    try {
      setLoading(true);
      const apiUrl = process.env.REACT_APP_API_URL;
      await axios.post(`${apiUrl}/api/auth/resend-verification`, {
        email: formData.email
      });
      
      setLoading(false);
      setError('');
      setNeedsVerification(false);
      alert('Verification email has been sent! Please check your inbox and spam folder.');
    } catch (err) {
      setLoading(false);
      setError(err.response?.data?.msg || 'Failed to resend verification email.');
    }
  };

  const handleGoogleLogin = () => {
    // Save the redirect path in localStorage before redirecting to OAuth
    localStorage.setItem('redirectPath', from);
    const apiUrl = process.env.REACT_APP_API_URL;
    window.location.href = `${apiUrl}/api/auth/google`;
  };

  const handleForgotPassword = () => {
    navigate('/forgot-password');
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      <div className="flex-grow bg-secondary bg-opacity-5 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <h2 className="mt-6 text-center text-3xl font-extrabold text-dark">
          Sign in to your account
        </h2>
          <p className="mt-2 text-center text-sm text-secondary">
          Or{' '}
            <Link to="/register" className="font-medium text-primary hover:text-accent">
            create a new account
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white py-8 px-4 shadow-lg rounded-xl sm:px-10">
            {verified && (
              <div className="mb-6 bg-green-50 border-l-4 border-green-500 p-4 rounded-lg">
                <div className="flex">
                  <div className="ml-3">
                    <p className="text-sm text-green-700">Your email has been verified! You can now log in.</p>
                  </div>
                </div>
              </div>
            )}

            {needsVerification ? (
              <div className="mb-6 bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded-lg">
                <div>
                  <h3 className="text-sm font-medium text-yellow-800">Email verification required</h3>
                  <div className="mt-2 text-sm text-yellow-700">
                    <p>Your email address needs to be verified before you can log in.</p>
                    <button 
                      onClick={handleResendVerification}
                      disabled={loading}
                      className="mt-3 px-4 py-2 rounded bg-primary text-white font-medium text-sm hover:bg-accent hover:text-dark focus:outline-none transition-colors"
                    >
                      {loading ? 'Sending...' : 'Resend verification email'}
                    </button>
                  </div>
                </div>
              </div>
            ) : error ? (
              <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-lg">
                <div className="flex">
                  <div className="ml-3">
                    <p className="text-sm text-red-700">{error}</p>
                  </div>
                </div>
              </div>
            ) : null}

            <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
                <label htmlFor="email" className="block text-sm font-medium text-dark">
                Email address
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={handleChange}
                    className="appearance-none block w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary bg-gray-50 focus:bg-white transition-all"
                />
              </div>
            </div>

            <div>
                <label htmlFor="password" className="block text-sm font-medium text-dark">
                Password
              </label>
              <div className="mt-1">
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={handleChange}
                    className="appearance-none block w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary bg-gray-50 focus:bg-white transition-all"
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="text-sm">
                  <Link to="/forgot-password" className="font-medium text-primary hover:text-accent">
                  Forgot your password?
                </Link>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                  className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-full shadow-sm text-white font-medium ${
                    loading ? 'bg-primary opacity-70' : 'bg-primary hover:bg-accent hover:text-dark'
                  } transition-colors duration-300`}
              >
                {loading ? 'Signing in...' : 'Sign in'}
              </button>
            </div>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-secondary">Or continue with</span>
              </div>
            </div>

            <div className="mt-6">
              <button
                onClick={handleGoogleLogin}
                  className="w-full inline-flex justify-center py-3 px-4 border border-gray-300 rounded-full shadow-sm bg-white text-sm font-medium text-secondary hover:bg-gray-50 transition-colors"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12.24 10.285V14.4h6.806c-.275 1.765-2.056 5.174-6.806 5.174-4.095 0-7.439-3.389-7.439-7.574s3.345-7.574 7.439-7.574c2.33 0 3.891.989 4.785 1.849l3.254-3.138C18.189 1.186 15.479 0 12.24 0c-6.635 0-12 5.365-12 12s5.365 12 12 12c6.926 0 11.52-4.869 11.52-11.726 0-.788-.085-1.39-.189-1.989H12.24z" />
                </svg>
                <span className="ml-2">Google</span>
              </button>
            </div>
          </div>
        </div>
      </div>
      </div>

      <Footer />
    </div>
  );
}

export default Login; 