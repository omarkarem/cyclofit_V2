import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import UploadForm from '../components/UploadForm';
import LoadingIndicator from '../components/LoadingIndicator';
import { base64ToBlob } from '../utils/videoUtils';
import axios from 'axios';
import DashboardNavbar from '../components/layout/DashboardNavbar';

function VideoUpload() {
  const [file, setFile] = useState(null);
  const [height, setHeight] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [quality, setQuality] = useState(100);
  const [bikeType, setBikeType] = useState('road');
  const navigate = useNavigate();

  // Add useEffect to fetch user profile data when component mounts
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/login');
          return;
        }
        
        // First try to get user data from localStorage for quick access
        const userStr = localStorage.getItem('user');
        if (userStr) {
          try {
            const userData = JSON.parse(userStr);
            if (userData && userData.height) {
              setHeight(userData.height.toString());
              console.log('Height loaded from local storage:', userData.height);
              return;
            }
          } catch (e) {
            console.error('Error parsing user data from localStorage:', e);
          }
        }
        
        // If not in localStorage, fetch from API
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/auth/me`, {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          withCredentials: true
        });
        
        // The response structure might include user data in a 'user' property
        const userData = response.data.user || response.data;
        
        if (userData && userData.height) {
          setHeight(userData.height.toString());
          console.log('Height loaded from API:', userData.height);
        }
      } catch (err) {
        console.error('Error fetching user profile:', err);
        // Don't set error state here to avoid showing errors to user
        // Just let them enter height manually if we can't fetch it
      }
    };

    fetchUserProfile();
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!file) {
      setError('Please select a video file');
      return;
    }
    
    if (!height || isNaN(parseFloat(height)) || parseFloat(height) < 100 || parseFloat(height) > 220) {
      setError('Please enter a valid height in cm (between 100-220)');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      const formData = new FormData();
      formData.append('video', file);
      formData.append('user_height_cm', height);
      formData.append('quality', quality.toString());
      formData.append('bike_type', bikeType);
      
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 600000);  // 10 minute timeout for large videos
      
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/analysis/process`, {
        method: 'POST',
        body: formData,
        headers: {
          'Authorization': `Bearer ${token}`
        },
        signal: controller.signal,
        credentials: 'include'
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Process the data with better error handling
      try {
        if (!data.success) {
          throw new Error(data.error || 'Unknown error processing video');
        }
        
        // Get the analysis result from the response
        const analysisResult = data.analysisResult;
        
        if (!analysisResult) {
          throw new Error('No analysis result returned from server');
        }
        
        // Process video if available
        if (analysisResult.video) {
          // Create video URL from base64 string
          const videoBlob = base64ToBlob(analysisResult.video, 'video/mp4');
          analysisResult.videoUrl = URL.createObjectURL(videoBlob);
          
          // Remove the base64 data to save memory
          delete analysisResult.video;
        }
        
        // Include the analysis ID for future reference
        analysisResult.analysisId = data.analysisId;
        
        // Process key frames if available
        if (analysisResult.key_frames && Array.isArray(analysisResult.key_frames)) {
          // Process key frames and store URLs
          const keyFrameUrls = [];
          
          for (let i = 0; i < analysisResult.key_frames.length; i++) {
            try {
              const frameBlob = base64ToBlob(analysisResult.key_frames[i], 'image/jpeg');
              keyFrameUrls.push(URL.createObjectURL(frameBlob));
            } catch (frameError) {
              console.error('Error processing key frame:', frameError);
            }
          }
          
          analysisResult.keyFrameUrls = keyFrameUrls.filter(url => url !== null);
          
          // Remove the base64 key frames to save memory
          delete analysisResult.key_frames;
        }
        
        // Make sure to set loading to false before navigation
        setLoading(false);
        
        // Navigate to results page with the analysis data
        navigate('/analysis-feedback', { state: { analysisResult: analysisResult } });
        
      } catch (processError) {
        console.error('Error processing response data:', processError);
        setError(`Failed to process analysis results: ${processError.message}`);
        setLoading(false);
      }
    } catch (err) {
      console.error('Error processing video:', err);
      let errorMessage = `Failed to process video: ${err.message}`;
      
      // Add more details for common errors
      if (err.name === 'AbortError') {
        errorMessage = 'Upload timed out. Your video might be too large or the server is busy. Try a shorter video or try again later.';
      } else if (err.message.includes('Network Error')) {
        errorMessage = 'Network error. Please check your internet connection and try again.';
      } else if (err.response) {
        // Server returned an error response
        const status = err.response.status;
        const serverError = err.response.data?.error || 'Unknown server error';
        errorMessage = `Server error (${status}): ${serverError}`;
        
        if (status === 413) {
          errorMessage = 'Video file is too large. Please use a smaller video file (under 100MB).';
        }
      }
      
      setError(errorMessage);
      setLoading(false);
      
      // Check S3 status if the error might be related to storage
      if (err.message.includes('storage') || err.message.includes('S3') || err.message.includes('upload')) {
        try {
          const token = localStorage.getItem('token');
          if (token) {
            console.log('Checking S3 status...');
            const statusResponse = await axios.get(`${process.env.REACT_APP_API_URL}/api/analysis/status/s3`, {
              headers: { Authorization: `Bearer ${token}` }
            });
            console.log('S3 status check result:', statusResponse.data);
            
            if (!statusResponse.data.success || !statusResponse.data.s3Status.connected) {
              setError(prev => prev + ' S3 storage connection issue detected. Please contact support.');
            }
          }
        } catch (statusErr) {
          console.error('Failed to check S3 status:', statusErr);
        }
      }
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-secondary bg-opacity-10">
      {/* App Header with Navigation */}
      <DashboardNavbar />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8 pt-28">
        <div className="px-4 py-6 sm:px-0">
          <div className="relative bg-white shadow-lg sm:rounded-3xl sm:p-16">
          <div className="max-w-3xl mx-auto">
            <div className="text-center">
                <h1 className="text-3xl font-bold text-dark mb-5">Bike Fit Analyzer</h1>
                <p className="text-secondary mb-8">Upload a video of your cycling position for personalized fit recommendations</p>
            </div>
            
            <UploadForm 
              file={file}
              height={height}
              quality={quality}
              bikeType={bikeType}
              loading={loading}
              error={error}
              setFile={setFile}
              setHeight={setHeight}
              setBikeType={setBikeType}
              setQuality={setQuality}
              handleSubmit={handleSubmit}
            />
            
            {loading && <LoadingIndicator />}
          </div>
        </div>
      </div>
      </main>
    </div>
  );
}

export default VideoUpload; 