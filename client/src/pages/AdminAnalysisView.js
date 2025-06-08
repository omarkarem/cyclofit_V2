import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import AdminNavbar from '../components/layout/AdminNavbar';
import LoadingIndicator from '../components/LoadingIndicator';
import KeyFrameGallery from '../components/KeyFrameGallery';
import BikeRecommendations from '../components/BikeRecommendations';

const AdminAnalysisView = () => {
  const { analysisId } = useParams();
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [processedVideoUrl, setProcessedVideoUrl] = useState(null);
  const [keyframesUrl, setKeyframesUrl] = useState(null);
  const [bikeType, setBikeType] = useState('road');
  const navigate = useNavigate();

  useEffect(() => {
    fetchAnalysis();
  }, [analysisId]);

  const fetchAnalysis = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    try {
      setLoading(true);
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/admin/analyses/${analysisId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      const analysisData = response.data.data.analysis;
      console.log('Admin Analysis Data:', analysisData); // Debug log
      setAnalysis(analysisData);
      setBikeType(analysisData.bikeType || 'road');
      
      // Fetch processed video if available
      if (analysisData.processed_video_available) {
        try {
          const videoResponse = await axios.get(`${process.env.REACT_APP_API_URL}/api/admin/analyses/${analysisId}/processed-video`, {
            headers: {
              Authorization: `Bearer ${token}`
            }
          });
          
          if (videoResponse.data && videoResponse.data.url) {
            setProcessedVideoUrl(videoResponse.data.url);
          }
        } catch (videoError) {
          console.error('Error fetching processed video:', videoError);
        }
      }

      // Fetch keyframes if available
      if (analysisData.keyframes_available && analysisData.keyframe_count > 0) {
        try {
          const keyframesResponse = await axios.get(`${process.env.REACT_APP_API_URL}/api/admin/analyses/${analysisId}/keyframes`, {
            headers: {
              Authorization: `Bearer ${token}`
            }
          });
          
          if (keyframesResponse.data && keyframesResponse.data.keyframes) {
            const keyFrameUrls = keyframesResponse.data.keyframes.map(kf => kf.url);
            setAnalysis(prev => ({...prev, keyFrameUrls}));
          }
        } catch (keyframeError) {
          console.error('Error fetching keyframes:', keyframeError);
        }
      }
      
      setLoading(false);
    } catch (err) {
      console.error('Error fetching analysis:', err);
      if (err.response?.status === 403) {
        setError('Access denied. Admin privileges required.');
      } else if (err.response?.status === 404) {
        setError('Analysis not found.');
      } else {
        setError('Failed to load analysis.');
      }
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getBikeTypeLabel = (type) => {
    switch(type) {
      case 'road': return 'Road Bike';
      case 'tt': return 'Time Trial';
      case 'mtb': return 'Mountain Bike';
      case 'gravel': return 'Gravel Bike';
      case 'hybrid': return 'Hybrid Bike';
      default: return 'Road Bike';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <AdminNavbar />
        <div className="flex items-center justify-center pt-32">
          <LoadingIndicator />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <AdminNavbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-24">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <h3 className="text-lg font-medium text-red-800 mb-2">Error Loading Analysis</h3>
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={() => navigate('/admin/analyses')}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Back to Analyses
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!analysis) {
    return (
      <div className="min-h-screen bg-gray-50">
        <AdminNavbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-24">
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
            <h3 className="text-lg font-medium text-gray-800 mb-2">Analysis Not Found</h3>
            <p className="text-gray-600 mb-4">The requested analysis could not be found.</p>
            <button
              onClick={() => navigate('/admin/analyses')}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              Back to Analyses
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminNavbar />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-24">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <button
              onClick={() => navigate('/admin/analyses')}
              className="mb-4 text-sm text-gray-600 hover:text-gray-900 flex items-center"
            >
              ← Back to Analyses
            </button>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Analysis Details</h1>
            <p className="text-gray-600">Admin view of user bike fit analysis</p>
          </div>
        </div>

        {/* Analysis Overview */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* User Information */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">User Information</h3>
              <div className="space-y-3">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mr-4">
                    <span className="text-sm font-medium text-red-600">
                      {analysis.user?.name?.firstName?.charAt(0) || 'U'}
                      {analysis.user?.name?.lastName?.charAt(0) || ''}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">
                      {analysis.user?.name?.firstName} {analysis.user?.name?.lastName}
                    </p>
                    <p className="text-sm text-gray-500">{analysis.user?.email}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Analysis Information */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Analysis Information</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Created:</span>
                  <span className="text-sm font-medium">{formatDate(analysis.createdAt)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Bike Type:</span>
                  <span className="text-sm font-medium">{getBikeTypeLabel(analysis.bikeType)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">User Height:</span>
                  <span className="text-sm font-medium">{analysis.userHeightCm} cm</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Duration:</span>
                  <span className="text-sm font-medium">
                    {(() => {
                      console.log('Frontend duration value:', analysis.duration, typeof analysis.duration);
                      return analysis.duration ? `${Math.floor(analysis.duration / 60)}:${(analysis.duration % 60).toString().padStart(2, '0')}` : 'Unknown';
                    })()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Storage:</span>
                  <span className="text-sm font-medium capitalize">{analysis.storageType || 'Unknown'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Analysis Results */}
        {analysis.maxAngles && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Analysis Results</h3>
            
            {/* Angles */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Maximum Angles</h4>
                <div className="space-y-2">
                  {Object.entries(analysis.maxAngles).map(([key, value]) => (
                    <div key={key} className="flex justify-between">
                      <span className="text-sm text-gray-600">{key.replace(/_/g, ' ').toUpperCase()}:</span>
                      <span className="text-sm font-medium">{value}°</span>
                    </div>
                  ))}
                </div>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Minimum Angles</h4>
                <div className="space-y-2">
                  {Object.entries(analysis.minAngles).map(([key, value]) => (
                    <div key={key} className="flex justify-between">
                      <span className="text-sm text-gray-600">{key.replace(/_/g, ' ').toUpperCase()}:</span>
                      <span className="text-sm font-medium">{value}°</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Body Measurements */}
            {analysis.bodyLengthsCm && (
              <div className="mb-6">
                <h4 className="font-medium text-gray-900 mb-3">Body Measurements (cm)</h4>
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                  {Object.entries(analysis.bodyLengthsCm).map(([key, value]) => (
                    <div key={key} className="flex justify-between">
                      <span className="text-sm text-gray-600">{key.replace(/_/g, ' ').toUpperCase()}:</span>
                      <span className="text-sm font-medium">{value} cm</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Processed Video */}
        {processedVideoUrl && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Processed Video</h3>
            <div className="flex justify-center">
              <video
                controls
                className="max-w-full h-auto rounded-lg shadow-sm"
                style={{ maxHeight: '400px' }}
              >
                <source src={processedVideoUrl} type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            </div>
          </div>
                  )}

        {/* Keyframes */}
        {analysis.keyFrameUrls && analysis.keyFrameUrls.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Key Frames</h3>
            <KeyFrameGallery keyframes={analysis.keyFrameUrls} />
          </div>
        )}

        {/* Recommendations */}
        {analysis.recommendations && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <BikeRecommendations 
              recommendations={analysis.recommendations} 
              bikeType={bikeType} 
              setBikeType={setBikeType} 
            />
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminAnalysisView; 