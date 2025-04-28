import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import DashboardNavbar from '../components/layout/DashboardNavbar';

function Profile() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    height: '',
    weight: '',
    bikeType: '',
    experience: '',
    bio: ''
  });
  const [updateSuccess, setUpdateSuccess] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    const fetchUserProfile = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        
        console.log('Fetching profile with token:', token ? 'Valid token exists' : 'No token found');
        
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/auth/me`, {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        console.log('Profile data received:', response.data);
        
        // The response structure from /api/auth/me is different - it includes user data in a 'user' property
        const userData = response.data.user || response.data;
        setUser(userData);
        
        // Initialize form data with user data
        setFormData({
          name: userData.name?.firstName && userData.name?.lastName 
            ? `${userData.name.firstName} ${userData.name.lastName}` 
            : '',
          email: userData.email || '',
          height: userData.height || '',
          weight: userData.weight || '',
          bikeType: userData.bikeType || '',
          experience: userData.experience || '',
          bio: userData.bio || ''
        });
        setLoading(false);
      } catch (err) {
        console.error('Error fetching profile:', err);
        
        // Try to get basic user data from localStorage as fallback
        let localUser = {};
        try {
          const userStr = localStorage.getItem('user');
          if (userStr && userStr !== "undefined" && userStr !== "null") {
            localUser = JSON.parse(userStr);
          }
        } catch (parseError) {
          console.error('Error parsing user data from localStorage:', parseError);
        }
        
        if (localUser && localUser.email) {
          setUser(localUser);
          setFormData({
            name: localUser.name?.firstName && localUser.name?.lastName 
              ? `${localUser.name.firstName} ${localUser.name.lastName}` 
              : '',
            email: localUser.email || '',
            height: localUser.height || '',
            weight: localUser.weight || '',
            bikeType: localUser.bikeType || '',
            experience: localUser.experience || '',
            bio: localUser.bio || ''
          });
          setError('Using locally saved profile data. Some information may be incomplete.');
        } else {
          setError(`Failed to load profile: ${err.response?.data?.message || err.message || 'Unknown error'}`);
        }
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      console.log('Updating profile with token:', token ? 'Valid token exists' : 'No token found');
      
      // Process form data to match the expected server format
      const submitData = { ...formData };
      
      // Convert name string to object if it's a string
      if (typeof formData.name === 'string' && formData.name.trim() !== '') {
        const nameParts = formData.name.trim().split(' ');
        submitData.name = {
          firstName: nameParts[0] || '',
          lastName: nameParts.slice(1).join(' ') || ''
        };
      }
      
      console.log('Sending profile data:', submitData);
      
      // Since the /api/users/profile endpoint doesn't exist, use /api/auth/update instead
      const response = await axios.put(`${process.env.REACT_APP_API_URL}/api/auth/update`, submitData, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('Profile update response:', response.data);
      
      // Store updated user data in localStorage to ensure it's available for other components
      const updatedUser = response.data.user || {...user, ...submitData};
      localStorage.setItem('user', JSON.stringify(updatedUser));
      
      // Update the user state with the updated data
      setUser(updatedUser);
      
      setEditMode(false);
      setUpdateSuccess(true);
      setTimeout(() => setUpdateSuccess(false), 3000);
      setLoading(false);
    } catch (err) {
      console.error('Error updating profile:', err);
      setError('Failed to update profile. Please try again.');
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  if (loading && !user) {
    return (
      <div className="min-h-screen bg-secondary bg-opacity-10 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Loading Profile...</h2>
          <div className="animate-pulse flex space-x-4">
            <div className="rounded-full bg-secondary bg-opacity-20 h-12 w-12"></div>
            <div className="flex-1 space-y-4 py-1">
              <div className="h-4 bg-secondary bg-opacity-20 rounded w-3/4"></div>
              <div className="space-y-2">
                <div className="h-4 bg-secondary bg-opacity-20 rounded"></div>
                <div className="h-4 bg-secondary bg-opacity-20 rounded w-5/6"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-secondary bg-opacity-10 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4 text-red-600">Error</h2>
          <p className="text-secondary">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-4 bg-primary text-white px-4 py-2 rounded hover:bg-accent hover:text-dark"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-secondary bg-opacity-5">
      {/* App Header with Navigation */}
      <DashboardNavbar />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-8 sm:px-6 lg:px-8 pt-28">
        <div className="px-4 py-6 sm:px-0">
          {/* Profile Header */}
          <div className="bg-white shadow-md overflow-hidden sm:rounded-lg mb-6">
            <div className="relative">
              {/* Cover Photo Area */}
              <div className="h-32 sm:h-48 bg-gradient-to-r from-primary to-accent"></div>
              
              {/* Profile Photo and Basic Info */}
              <div className="px-4 sm:px-6 lg:px-8 pb-5">
                <div className="flex flex-col sm:flex-row items-center">
                  <div className="-mt-16 sm:-mt-20">
                    <div className="bg-white p-2 rounded-full inline-block ring-4 ring-white">
                      <div className="bg-primary text-white h-24 w-24 sm:h-32 sm:w-32 rounded-full flex items-center justify-center text-3xl font-bold">
                        {user?.name?.firstName?.charAt(0) || ''}
                        {user?.name?.lastName?.charAt(0) || ''}
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 sm:mt-0 sm:ml-4 text-center sm:text-left">
                    <h2 className="text-2xl font-bold text-dark">
                      {user?.name?.firstName ? `${user.name.firstName} ${user.name.lastName || ''}` : 'User'}
                    </h2>
                    <p className="text-secondary">
                      {user?.email || 'No email available'}
                    </p>
                  </div>
                  <div className="ml-auto mt-4 sm:mt-0">
                    {!editMode ? (
                      <button
                        onClick={() => setEditMode(true)}
                        className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-accent hover:text-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors duration-200"
                      >
                        Edit Profile
                      </button>
                    ) : (
                      <button
                        onClick={() => setEditMode(false)}
                        className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-dark bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-secondary transition-colors duration-200"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
            
            {updateSuccess && (
              <div className="mx-4 sm:mx-6 lg:mx-8 mb-4 bg-primary bg-opacity-10 p-4 rounded-md border border-primary">
                <p className="text-primary">Profile updated successfully!</p>
              </div>
            )}
            
            {/* Profile Information */}
            {!editMode ? (
              <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
                <dl className="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2">
                  <div className="sm:col-span-1">
                    <dt className="text-sm font-medium text-secondary">Email</dt>
                    <dd className="mt-1 text-sm text-dark">{user?.email || 'Not provided'}</dd>
                  </div>
                  <div className="sm:col-span-1">
                    <dt className="text-sm font-medium text-secondary">Height</dt>
                    <dd className="mt-1 text-sm text-dark">{user?.height ? `${user.height} cm` : 'Not provided'}</dd>
                  </div>
                  <div className="sm:col-span-1">
                    <dt className="text-sm font-medium text-secondary">Weight</dt>
                    <dd className="mt-1 text-sm text-dark">{user?.weight ? `${user.weight} kg` : 'Not provided'}</dd>
                  </div>
                  <div className="sm:col-span-1">
                    <dt className="text-sm font-medium text-secondary">Bike Type</dt>
                    <dd className="mt-1 text-sm text-dark">{user?.bikeType || 'Not provided'}</dd>
                  </div>
                  <div className="sm:col-span-1">
                    <dt className="text-sm font-medium text-secondary">Experience Level</dt>
                    <dd className="mt-1 text-sm text-dark">{user?.experience || 'Not provided'}</dd>
                  </div>
                  <div className="sm:col-span-2">
                    <dt className="text-sm font-medium text-secondary">Bio</dt>
                    <dd className="mt-1 text-sm text-dark">{user?.bio || 'No bio provided'}</dd>
                  </div>
                </dl>
              </div>
            ) : (
              <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
                <form onSubmit={handleSubmit}>
                  <div className="grid grid-cols-1 gap-y-6 sm:grid-cols-2 sm:gap-x-4">
                    <div className="sm:col-span-2">
                      <label htmlFor="name" className="block text-sm font-medium text-secondary">
                        Full Name
                      </label>
                      <div className="mt-1">
                        <input
                          type="text"
                          name="name"
                          id="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          className="shadow-sm focus:ring-primary focus:border-primary block w-full sm:text-sm border-gray-300 rounded-md"
                        />
                      </div>
                    </div>
                    <div className="sm:col-span-2">
                      <label htmlFor="email" className="block text-sm font-medium text-secondary">
                        Email
                      </label>
                      <div className="mt-1">
                        <input
                          type="email"
                          name="email"
                          id="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          className="shadow-sm focus:ring-primary focus:border-primary block w-full sm:text-sm border-gray-300 rounded-md"
                          disabled
                        />
                        <p className="mt-1 text-xs text-secondary">Email cannot be changed</p>
                      </div>
                    </div>
                    <div>
                      <label htmlFor="height" className="block text-sm font-medium text-secondary">
                        Height (cm)
                      </label>
                      <div className="mt-1">
                        <input
                          type="number"
                          name="height"
                          id="height"
                          value={formData.height}
                          onChange={handleInputChange}
                          className="shadow-sm focus:ring-primary focus:border-primary block w-full sm:text-sm border-gray-300 rounded-md"
                        />
                      </div>
                    </div>
                    <div>
                      <label htmlFor="weight" className="block text-sm font-medium text-secondary">
                        Weight (kg)
                      </label>
                      <div className="mt-1">
                        <input
                          type="number"
                          name="weight"
                          id="weight"
                          value={formData.weight}
                          onChange={handleInputChange}
                          className="shadow-sm focus:ring-primary focus:border-primary block w-full sm:text-sm border-gray-300 rounded-md"
                        />
                      </div>
                    </div>
                    <div>
                      <label htmlFor="bikeType" className="block text-sm font-medium text-secondary">
                        Bike Type
                      </label>
                      <div className="mt-1">
                        <select
                          id="bikeType"
                          name="bikeType"
                          value={formData.bikeType}
                          onChange={handleInputChange}
                          className="shadow-sm focus:ring-primary focus:border-primary block w-full sm:text-sm border-gray-300 rounded-md"
                        >
                          <option value="">Select bike type</option>
                          <option value="road">Road Bike</option>
                          <option value="mountain">Mountain Bike</option>
                          <option value="hybrid">Hybrid Bike</option>
                          <option value="gravel">Gravel Bike</option>
                          <option value="triathlon">Triathlon Bike</option>
                          <option value="other">Other</option>
                        </select>
                      </div>
                    </div>
                    <div>
                      <label htmlFor="experience" className="block text-sm font-medium text-secondary">
                        Experience Level
                      </label>
                      <div className="mt-1">
                        <select
                          id="experience"
                          name="experience"
                          value={formData.experience}
                          onChange={handleInputChange}
                          className="shadow-sm focus:ring-primary focus:border-primary block w-full sm:text-sm border-gray-300 rounded-md"
                        >
                          <option value="">Select experience level</option>
                          <option value="beginner">Beginner</option>
                          <option value="intermediate">Intermediate</option>
                          <option value="advanced">Advanced</option>
                          <option value="professional">Professional</option>
                        </select>
                      </div>
                    </div>
                    <div className="sm:col-span-2">
                      <label htmlFor="bio" className="block text-sm font-medium text-secondary">
                        Bio
                      </label>
                      <div className="mt-1">
                        <textarea
                          id="bio"
                          name="bio"
                          rows="3"
                          value={formData.bio}
                          onChange={handleInputChange}
                          className="shadow-sm focus:ring-primary focus:border-primary block w-full sm:text-sm border-gray-300 rounded-md"
                        ></textarea>
                      </div>
                      <p className="mt-2 text-sm text-secondary">
                        Brief description about yourself as a cyclist.
                      </p>
                    </div>
                  </div>
                  <div className="mt-6 flex justify-end space-x-3">
                    <button
                      type="button"
                      onClick={() => setEditMode(false)}
                      className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-secondary bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-secondary"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-accent hover:text-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                      disabled={loading}
                    >
                      {loading ? 'Saving...' : 'Save'}
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

// Add some CSS animations
const style = document.createElement('style');
style.textContent = `
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
  .animate-fadeIn {
    animation: fadeIn 0.3s ease-in;
  }
`;
document.head.appendChild(style);

export default Profile; 