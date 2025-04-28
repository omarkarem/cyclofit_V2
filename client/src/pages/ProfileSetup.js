import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Layout from '../components/layout/Layout';

function ProfileSetup() {
  const [formData, setFormData] = useState({
    height: '',
    weight: '',
    bikeType: '',
    experience: ''
  });
  
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  // Load user data when component mounts
  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      try {
        const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:4000';
        const res = await axios.get(`${apiUrl}/api/auth/me`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        
        // Check if user is email verified
        if (!res.data.user.isEmailVerified) {
          // Redirect to login if not verified
          localStorage.removeItem('token');
          navigate('/login');
          return;
        }
        
        setUser(res.data.user);
        
        // Pre-fill form with existing data if available
        if (res.data.user) {
          setFormData(prev => ({
            ...prev,
            height: res.data.user.height || '',
            weight: res.data.user.weight || '',
            bikeType: res.data.user.bikeType || '',
            experience: res.data.user.experience || ''
          }));
        }
      } catch (err) {
        console.error('Error fetching user data:', err);
        navigate('/login');
      }
    };

    fetchUser();
  }, [navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    // Basic validation
    if (!formData.height || !formData.weight || !formData.experience) {
      setError('Please fill in all required fields');
      return;
    }
    
    // Validate numeric fields
    if (
      isNaN(formData.height) || 
      isNaN(formData.weight) ||
      parseFloat(formData.height) < 100 ||
      parseFloat(formData.height) > 250 ||
      parseFloat(formData.weight) < 30 ||
      parseFloat(formData.weight) > 200
    ) {
      setError('Please enter valid values for height and weight');
      return;
    }
    
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:4000';
      
      // Format profile data - only include what we need
      const profileData = {
        height: parseFloat(formData.height),
        weight: parseFloat(formData.weight),
        bikeType: formData.bikeType,
        experience: formData.experience
      };
      
      // Update user profile
      await axios.put(`${apiUrl}/api/auth/update`, profileData, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      setLoading(false);
      navigate('/dashboard');
    } catch (err) {
      setLoading(false);
      setError(err.response?.data?.message || 'Profile update failed. Please try again.');
    }
  };

  if (!user) {
    return (
      <Layout>
        <div className="min-h-screen flex flex-col justify-center items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          <p className="mt-4 text-secondary">Loading...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="pt-32 pb-16">
        <div className="max-w-2xl mx-auto px-4">
          <div className="text-center mb-10">
            <h1 className="text-3xl font-bold text-dark mb-4">Complete Your Profile</h1>
            <p className="text-secondary">
              We need a few more details to personalize your cycling experience
            </p>
          </div>

          <div className="bg-white p-8 shadow-lg rounded-2xl">
            {error && (
              <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded-lg">
                <div className="flex">
                  <div className="ml-3">
                    <p className="text-sm text-red-700">{error}</p>
                  </div>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="height" className="block text-sm font-medium text-dark mb-2">
                    Height (cm) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    id="height"
                    name="height"
                    min="100"
                    max="250"
                    required
                    value={formData.height}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary bg-gray-50 focus:bg-white transition-all"
                    placeholder="Enter your height in cm"
                  />
                  <p className="mt-1 text-xs text-gray-500">Example: 175</p>
                </div>

                <div>
                  <label htmlFor="weight" className="block text-sm font-medium text-dark mb-2">
                    Weight (kg) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    id="weight"
                    name="weight"
                    min="30"
                    max="200"
                    required
                    value={formData.weight}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary bg-gray-50 focus:bg-white transition-all"
                    placeholder="Enter your weight in kg"
                  />
                  <p className="mt-1 text-xs text-gray-500">Example: 70</p>
                </div>
              </div>

              <div>
                <label htmlFor="bikeType" className="block text-sm font-medium text-dark mb-2">
                  Bike Type
                </label>
                <select
                  id="bikeType"
                  name="bikeType"
                  value={formData.bikeType}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary bg-gray-50 focus:bg-white transition-all"
                >
                  <option value="">Select bike type</option>
                  <option value="Road Bike">Road Bike</option>
                  <option value="Mountain Bike">Mountain Bike</option>
                  <option value="Hybrid">Hybrid</option>
                  <option value="Time Trial">Time Trial</option>
                  <option value="Gravel">Gravel</option>
                  <option value="Commuter">Commuter</option>
                </select>
              </div>

              <div>
                <label htmlFor="experience" className="block text-sm font-medium text-dark mb-2">
                  Cycling Experience <span className="text-red-500">*</span>
                </label>
                <select
                  id="experience"
                  name="experience"
                  required
                  value={formData.experience}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary bg-gray-50 focus:bg-white transition-all"
                >
                  <option value="">Select your experience level</option>
                  <option value="Beginner">Beginner (Less than 1 year)</option>
                  <option value="Intermediate">Intermediate (1-3 years)</option>
                  <option value="Advanced">Advanced (3-5 years)</option>
                  <option value="Expert">Expert (5+ years)</option>
                </select>
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full px-6 py-4 bg-primary text-white font-semibold rounded-full hover:bg-accent hover:text-dark transition duration-300 ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
                >
                  {loading ? (
                    <div className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Saving Profile
                    </div>
                  ) : (
                    'Save Profile'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </Layout>
  );
}

export default ProfileSetup; 