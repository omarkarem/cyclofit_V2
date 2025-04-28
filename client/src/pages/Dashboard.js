import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import DashboardNavbar from '../components/layout/DashboardNavbar';
import SmoothScroll from '../components/SmoothScroll';

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const [analyses, setAnalyses] = useState([]);

  useEffect(() => {
    const fetchUserData = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      try {
        const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/auth/me`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        setUser(res.data.user);
        
        // Check if user has completed their profile
        const isProfileComplete = 
          res.data.user.height && 
          res.data.user.weight && 
          res.data.user.experience;
        
        // Redirect to profile setup if profile is incomplete
        if (!isProfileComplete) {
          navigate('/profile-setup');
          return;
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching user data:', err);
        setError('Failed to load user data');
        setLoading(false);
      }
    };

    fetchUserData();
  }, [navigate]);

  useEffect(() => {
    const fetchAnalyses = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        return;
      }

      try {
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/analysis`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        
        // Check if we got valid analyses and log for debugging
        console.log('Fetched analyses:', response.data);
        
        if (response.data.analyses && Array.isArray(response.data.analyses)) {
          // Transform the analyses to include info about video/keyframe availability
          const processedAnalyses = response.data.analyses.map(analysis => ({
            ...analysis,
            hasVideo: !!analysis.processedVideo?.s3Key || !!analysis.processedVideo?.filePath,
            hasKeyframes: Array.isArray(analysis.keyframes) && analysis.keyframes.length > 0,
            keyframeCount: Array.isArray(analysis.keyframes) ? analysis.keyframes.length : 0
          }));
          
          setAnalyses(processedAnalyses);
          console.log('Processed analyses:', processedAnalyses);
        } else {
          console.error('Invalid analyses data structure:', response.data);
          setAnalyses([]);
        }
      } catch (err) {
        console.error('Error fetching analyses:', err);
        setError('Failed to load your analyses. Please try again later.');
      }
    };

    fetchAnalyses();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const handleDeleteAnalysis = async (analysisId) => {
    if (!window.confirm('Are you sure you want to delete this analysis?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${process.env.REACT_APP_API_URL}/api/analysis/${analysisId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      // Remove the deleted analysis from state
      setAnalyses(analyses.filter(analysis => analysis._id !== analysisId));
    } catch (err) {
      console.error('Error deleting analysis:', err);
      alert('Failed to delete analysis. Please try again.');
    }
  };

  const formatDate = (dateString) => {
    const options = { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Function to get bike type label
  const getBikeTypeLabel = (type) => {
    switch(type) {
      case 'road': return 'Road Bike';
      case 'tt': return 'Time Trial Bike';
      case 'mtb': return 'Mountain Bike';
      case 'gravel': return 'Gravel Bike';
      case 'hybrid': return 'Hybrid Bike';
      default: return 'Road Bike';
    }
  };

  // Function to format duration in seconds to MM:SS
  const formatDuration = (seconds) => {
    if (!seconds) return 'Unknown';
    
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-secondary bg-opacity-5 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-10 w-10 border-t-2 border-b-2 border-primary rounded-full mx-auto"></div>
          <p className="mt-4 text-secondary">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-secondary bg-opacity-5">
      <SmoothScroll />
      {/* App Header with Navigation */}
      <DashboardNavbar />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8 pt-28">
        <div className="px-4 py-6 sm:px-0">
          <div className="border-4 border-dashed border-secondary border-opacity-20 rounded-lg p-4 h-96">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-dark mb-4">Welcome, {user?.name?.firstName || 'Cyclist'}</h2>
              <p className="text-secondary mb-8">What would you like to do today?</p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
                {/* Video Analysis Card */}
                <div className="bg-white overflow-hidden shadow rounded-lg">
                  <div className="px-4 py-5 sm:p-6">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 bg-primary rounded-md p-3">
                        <svg className="h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <div className="ml-5 w-0 flex-1">
                        <dt className="text-lg font-medium text-dark">Video Analysis</dt>
                        <dd className="mt-2 text-secondary">Upload a cycling video for advanced position analysis</dd>
                      </div>
                    </div>
                    <div className="mt-5">
                      <Link to="/video-upload" className="w-full inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-dark bg-primary hover:bg-accent">
                        Start Analysis
                      </Link>
                    </div>
                  </div>
                </div>

                {/* Profile Card */}
                <div className="bg-white overflow-hidden shadow rounded-lg">
                  <div className="px-4 py-5 sm:p-6">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 bg-accent rounded-md p-3">
                        <svg className="h-6 w-6 text-dark" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
                      <div className="ml-5 w-0 flex-1">
                        <dt className="text-lg font-medium text-dark">My Profile</dt>
                        <dd className="mt-2 text-secondary">View and update your personal information</dd>
                      </div>
                    </div>
                    <div className="mt-5">
                      <Link to="/profile" className="w-full inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-dark bg-accent hover:bg-primary">
                        View Profile
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Analyses history */}
          <div className="mt-8">
            <h2 className="text-xl font-semibold text-dark mb-4">Your Analyses</h2>
            
            {loading ? (
              <div className="text-center py-10">
                <div className="spinner-border text-primary" role="status">
                  <svg className="animate-spin h-10 w-10 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                </div>
                <p className="mt-2 text-secondary">Loading your analyses...</p>
              </div>
            ) : error ? (
              <div className="bg-red-50 text-red-600 p-4 rounded-md">
                {error}
              </div>
            ) : analyses.length === 0 ? (
              <div className="bg-gray-50 p-8 rounded-lg text-center">
                <h3 className="text-lg font-medium text-gray-700 mb-2">No Analyses Yet</h3>
                <p className="text-gray-500 mb-4">Create your first bike fit analysis to see it here.</p>
                <Link 
                  to="/video-upload" 
                  className="bg-primary hover:bg-primary-dark text-white px-6 py-3 rounded-lg font-medium transition-colors inline-block"
                >
                  Start New Analysis
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {analyses.map(analysis => (
                  <div key={analysis._id} className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                    <div className="p-5">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="text-lg font-semibold text-dark">{analysis.title || 'Bike Fit Analysis'}</h3>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          analysis.bikeType === 'tt' ? 'bg-purple-100 text-purple-800' : 
                          'bg-blue-100 text-blue-800'
                        }`}>
                          {getBikeTypeLabel(analysis.bikeType)}
                        </span>
                      </div>
                      
                      <p className="text-gray-500 text-sm mb-3">
                        {formatDate(analysis.createdAt)}
                      </p>

                      {analysis.description && (
                        <p className="text-gray-700 mb-4">{analysis.description}</p>
                      )}
                      
                      <div className="flex items-center gap-2 my-2 text-sm">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full ${analysis.hasVideo ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          {analysis.hasVideo ? 'Video Available' : 'No Video'}
                        </span>
                        
                        {analysis.hasKeyframes && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full bg-blue-100 text-blue-800">
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            {analysis.keyframeCount} Keyframes
                          </span>
                        )}
                        
                        {analysis.duration && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full bg-purple-100 text-purple-800">
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            {formatDuration(analysis.duration)}
                          </span>
                        )}
                      </div>
                      
                      <div className="flex justify-between items-center mt-4">
                        <button
                          onClick={() => handleDeleteAnalysis(analysis._id)}
                          className="text-red-600 hover:text-red-800 text-sm"
                        >
                          Delete
                        </button>
                        <Link
                          to={`/analysis/${analysis._id}`}
                          state={{ analysisId: analysis._id }}
                          className="bg-primary text-white px-3 py-1 rounded hover:bg-primary-dark text-sm"
                        >
                          View Details
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard; 