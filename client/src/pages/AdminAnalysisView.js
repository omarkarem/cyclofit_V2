import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import AdminNavbar from '../components/layout/AdminNavbar';
import LoadingIndicator from '../components/LoadingIndicator';

const AdminAnalysisView = () => {
  const { analysisId } = useParams();
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
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
      
      setAnalysis(response.data.data.analysis);
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
                    {analysis.duration ? `${Math.floor(analysis.duration / 60)}:${(analysis.duration % 60).toString().padStart(2, '0')}` : 'Unknown'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Storage:</span>
                  <span className="text-sm font-medium capitalize">{analysis.storageType}</span>
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

        {/* Media Information */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Media Files</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Original Video */}
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                <svg className="w-8 h-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </div>
              <h4 className="font-medium text-gray-900 mb-2">Original Video</h4>
              <p className="text-sm text-gray-500">
                {analysis.originalVideo?.s3Key || analysis.originalVideo?.filePath ? 'Available' : 'Not available'}
              </p>
            </div>

            {/* Processed Video */}
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h.01M19 10a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h4 className="font-medium text-gray-900 mb-2">Processed Video</h4>
              <p className="text-sm text-gray-500">
                {analysis.processed_video_available ? 'Available' : 'Not available'}
              </p>
            </div>

            {/* Keyframes */}
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                <svg className="w-8 h-8 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h4 className="font-medium text-gray-900 mb-2">Keyframes</h4>
              <p className="text-sm text-gray-500">
                {analysis.keyframes_available ? `${analysis.keyframe_count} frames` : 'Not available'}
              </p>
            </div>
          </div>
        </div>

        {/* Recommendations */}
        {analysis.recommendations && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Recommendations</h3>
            
            {analysis.recommendations.general && analysis.recommendations.general.length > 0 && (
              <div className="mb-6">
                <h4 className="font-medium text-gray-900 mb-3">General Recommendations</h4>
                <div className="space-y-3">
                  {analysis.recommendations.general.map((rec, index) => (
                    <div key={index} className="border-l-4 border-blue-400 bg-blue-50 p-4">
                      <h5 className="font-medium text-blue-900">{rec.component}</h5>
                      <p className="text-sm text-blue-800 mt-1">{rec.issue}</p>
                      <p className="text-sm text-blue-700 mt-2"><strong>Action:</strong> {rec.action}</p>
                      {rec.current && <p className="text-xs text-blue-600 mt-1">Current: {rec.current}</p>}
                      {rec.target && <p className="text-xs text-blue-600">Target: {rec.target}</p>}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminAnalysisView; 