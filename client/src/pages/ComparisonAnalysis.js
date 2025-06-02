import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import DashboardNavbar from '../components/layout/DashboardNavbar';
import VideoPlayer from '../components/VideoPlayer';
import LoadingIndicator from '../components/LoadingIndicator';

const ComparisonAnalysis = () => {
  const [analyses, setAnalyses] = useState([]);
  const [selectedAnalyses, setSelectedAnalyses] = useState({ left: null, right: null });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [comparing, setComparing] = useState(false);
  const [loadingVideos, setLoadingVideos] = useState(false);
  const [videoUrls, setVideoUrls] = useState({ left: null, right: null });
  const navigate = useNavigate();
  const location = useLocation();

  // Format date to display date and time
  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown';
    
    const options = { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Format duration in seconds to MM:SS format
  const formatDuration = (seconds) => {
    if (seconds === null || seconds === undefined || isNaN(seconds)) return 'Unknown';
    
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
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

  // Visual bar component for optimal range display with real recommendation data
  const OptimalRangeBar = ({ analysis, recommendation, title }) => {
    if (!analysis || !recommendation) return null;

    // Extract angle value from recommendation current field (e.g., "142° knee extension" -> 142)
    const extractAngleFromRecommendation = (current) => {
      if (!current) return null;
      const match = current.match(/(\d+(?:\.\d+)?)°/);
      return match ? parseFloat(match[1]) : null;
    };

    // Extract target range from recommendation target field
    const extractTargetRange = (target) => {
      if (!target) return null;
      const rangeMatch = target.match(/(\d+(?:\.\d+)?)-(\d+(?:\.\d+)?)°/);
      if (rangeMatch) {
        return {
          min: parseFloat(rangeMatch[1]),
          max: parseFloat(rangeMatch[2])
        };
      }
      return null;
    };

    const currentValue = extractAngleFromRecommendation(recommendation.current);
    const targetRange = extractTargetRange(recommendation.target);

    // If we can't extract numeric data, don't show the bar
    if (!currentValue || !targetRange) return null;

    const { min, max } = targetRange;
    const center = (min + max) / 2;
    const range = max - min;
    const extendedMin = min - range * 0.4;
    const extendedMax = max + range * 0.4;
    const extendedRange = extendedMax - extendedMin;

    // Calculate positions for the bar
    const optimalStartPercent = ((min - extendedMin) / extendedRange) * 100;
    const optimalWidthPercent = ((max - min) / extendedRange) * 100;
    const valuePercent = ((currentValue - extendedMin) / extendedRange) * 100;
    const centerPercent = ((center - extendedMin) / extendedRange) * 100;

    // Calculate how close to optimal the value is
    const evaluatePosition = () => {
      if (currentValue >= min && currentValue <= max) {
        const distanceFromCenter = Math.abs(currentValue - center);
        const maxDistanceFromCenter = range / 2;
        const closenessToCenter = 1 - (distanceFromCenter / maxDistanceFromCenter);
        
        if (closenessToCenter > 0.8) {
          return { status: 'excellent', message: 'Excellent!', color: 'bg-emerald-100 text-emerald-800' };
        } else if (closenessToCenter > 0.5) {
          return { status: 'good', message: 'Good', color: 'bg-green-100 text-green-800' };
        } else {
          return { status: 'acceptable', message: 'Acceptable', color: 'bg-lime-100 text-lime-800' };
        }
      } else if (currentValue < min) {
        const deviation = min - currentValue;
        const severity = deviation > range * 0.5 ? 'high' : 'moderate';
        return {
          status: 'below',
          message: severity === 'high' ? 'Too Low' : 'Slightly Low',
          color: severity === 'high' ? 'bg-red-100 text-red-800' : 'bg-orange-100 text-orange-800'
        };
      } else {
        const deviation = currentValue - max;
        const severity = deviation > range * 0.5 ? 'high' : 'moderate';
        return {
          status: 'above',
          message: severity === 'high' ? 'Too High' : 'Slightly High',
          color: severity === 'high' ? 'bg-red-100 text-red-800' : 'bg-orange-100 text-orange-800'
        };
      }
    };

    const evaluation = evaluatePosition();

    // Create enhanced gradient background with red zones outside optimal range
    const createGradientBackground = () => {
      // Calculate percentages for the gradient stops based on optimal range position
      const optimalStartPercent = ((min - extendedMin) / extendedRange) * 100;
      const optimalEndPercent = ((max - extendedMin) / extendedRange) * 100;
      
      return `linear-gradient(90deg, 
        #dc2626 0%,                                    /* Dark red - critical low */
        #ef4444 ${optimalStartPercent * 0.3}%,         /* Red */
        #f97316 ${optimalStartPercent * 0.6}%,         /* Orange */
        #eab308 ${optimalStartPercent * 0.9}%,         /* Yellow - approaching optimal */
        #22c55e ${optimalStartPercent}%,               /* Green - start of optimal */
        #16a34a ${(optimalStartPercent + optimalEndPercent) / 2}%, /* Darker green - center */
        #22c55e ${optimalEndPercent}%,                 /* Green - end of optimal */
        #eab308 ${optimalEndPercent + (100 - optimalEndPercent) * 0.1}%, /* Yellow - leaving optimal */
        #f97316 ${optimalEndPercent + (100 - optimalEndPercent) * 0.4}%, /* Orange */
        #ef4444 ${optimalEndPercent + (100 - optimalEndPercent) * 0.7}%, /* Red */
        #dc2626 100%)`;                                /* Dark red - critical high */
    };

    // Get component icon based on component name
    const getComponentIcon = (component) => {
      const icons = {
        'SADDLE HEIGHT': '🦵',
        'SADDLE FORE/AFT': '🏋️',
        'HANDLEBAR HEIGHT': '🏃',
        'STEM LENGTH': '💪',
        'HIP ANGLE': '🔄',
        'AEROBAR POSITION': '✈️'
      };
      return icons[component.toUpperCase()] || '⚙️';
    };

    return (
      <div className="space-y-4 bg-gray-50 p-4 rounded-lg border">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <span className="text-2xl">{getComponentIcon(recommendation.component)}</span>
            <div>
              <h4 className="font-semibold text-gray-900">{title}</h4>
              <p className="text-sm text-gray-600">{recommendation.component}</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-xl font-bold text-gray-900">
              {currentValue.toFixed(1)}°
            </div>
            <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${evaluation.color}`}>
              {evaluation.message}
            </span>
          </div>
        </div>

        {/* Enhanced visual bar with gradient */}
        <div className="relative">
          {/* Background gradient bar */}
          <div 
            className="w-full h-8 rounded-full relative overflow-hidden border border-gray-300"
            style={{
              background: createGradientBackground()
            }}
          >
            {/* Optimal range overlay */}
            <div 
              className="absolute h-full bg-green-400 bg-opacity-20 rounded-full"
              style={{
                left: `${Math.max(0, optimalStartPercent)}%`,
                width: `${Math.min(100, optimalWidthPercent)}%`
              }}
            />
            
            {/* Center line (sweet spot) */}
            <div 
              className="absolute top-0 w-1 h-full bg-green-800 rounded-full"
              style={{ left: `${centerPercent}%` }}
              title="Sweet Spot"
            />
            
            {/* Current value indicator */}
            <div 
              className="absolute top-0 w-3 h-full bg-gray-900 rounded-full transform -translate-x-1/2 shadow-lg"
              style={{ left: `${Math.max(1.5, Math.min(98.5, valuePercent))}%` }}
              title={`Current: ${currentValue.toFixed(1)}°`}
            />
          </div>

          {/* Scale labels */}
          <div className="flex justify-between text-xs text-gray-500 mt-2">
            <span>{extendedMin.toFixed(0)}°</span>
            <span className="text-green-700 font-semibold">
              Optimal: {min.toFixed(0)}° - {max.toFixed(0)}° (Sweet Spot: {center.toFixed(0)}°)
            </span>
            <span>{extendedMax.toFixed(0)}°</span>
          </div>
        </div>

        {/* Distance from optimal indicator */}
        <div className="text-center">
          <div className="text-sm text-gray-600">
            Distance from sweet spot: <span className="font-semibold">{Math.abs(currentValue - center).toFixed(1)}°</span>
          </div>
        </div>
      </div>
    );
  };

  // Component to display recommendations by category
  const RecommendationCategoryComparison = ({ leftAnalysis, rightAnalysis, category, title, colorClass }) => {
    if (!leftAnalysis?.recommendations || !rightAnalysis?.recommendations) return null;

    // Get recommendations for the specific category
    const getRecommendationsForCategory = (analysis, category) => {
      const recommendations = analysis.recommendations;
      
      switch (category) {
        case 'general':
          return recommendations.general || [];
        case 'endurance':
          return recommendations.road_bike?.endurance || [];
        case 'aggressive':
          return recommendations.road_bike?.aggressive || [];
        case 'time_trial':
          return recommendations.time_trial || [];
        default:
          return [];
      }
    };

    const leftRecommendations = getRecommendationsForCategory(leftAnalysis, category);
    const rightRecommendations = getRecommendationsForCategory(rightAnalysis, category);

    // If both analyses have no recommendations for this category, don't render
    if (leftRecommendations.length === 0 && rightRecommendations.length === 0) {
      return null;
    }

    // Component to display a single recommendation
    const RecommendationDisplay = ({ recommendation, side, analysis }) => {
      if (!recommendation || typeof recommendation === 'string') {
        return (
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-gray-500 text-sm">
              {typeof recommendation === 'string' ? recommendation : 'No specific recommendation'}
            </p>
          </div>
        );
      }

      const priorityColors = {
        high: 'bg-red-100 text-red-700 border-red-200',
        medium: 'bg-orange-100 text-orange-700 border-orange-200',
        low: 'bg-green-100 text-green-700 border-green-200'
      };

      const priorityColor = priorityColors[recommendation.priority] || priorityColors.low;

      // Check if recommendation has angle data for visual bar
      const hasAngleData = recommendation.current && recommendation.target && 
                          recommendation.current.includes('°') && 
                          recommendation.target.match(/\d+-\d+°/);

      return (
        <div className="space-y-4">
          <div className={`p-4 rounded-lg border-2 ${priorityColor}`}>
            <div className="flex justify-between items-start mb-2">
              <h5 className="font-bold text-gray-900 text-lg">
                {recommendation.component}
              </h5>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${priorityColor}`}>
                {recommendation.priority === 'high' ? 'High Priority' :
                 recommendation.priority === 'medium' ? 'Medium Priority' : 
                 'Low Priority'}
              </span>
            </div>
            
            <p className="text-gray-700 mb-3 font-medium">
              {recommendation.issue}
            </p>
            
            <div className="space-y-2">
              <div className="bg-white bg-opacity-60 px-3 py-2 rounded border">
                <span className="text-sm font-semibold text-gray-900">Action: </span>
                <span className="text-sm text-gray-800">{recommendation.action}</span>
              </div>
              
              {recommendation.current && (
                <div className="bg-white bg-opacity-60 px-3 py-2 rounded border">
                  <span className="text-sm font-semibold text-gray-900">Current: </span>
                  <span className="text-sm text-gray-800">{recommendation.current}</span>
                </div>
              )}
              
              {recommendation.target && (
                <div className="bg-white bg-opacity-60 px-3 py-2 rounded border">
                  <span className="text-sm font-semibold text-gray-900">Target: </span>
                  <span className="text-sm text-gray-800">{recommendation.target}</span>
                </div>
              )}
            </div>
          </div>

          {/* Visual Bar for angle-based recommendations */}
          {hasAngleData && (
            <OptimalRangeBar 
              analysis={analysis}
              recommendation={recommendation}
              title={`${side === 'left' ? 'Before' : 'After'} Position Analysis`}
            />
          )}
        </div>
      );
    };

    // Get all unique components mentioned in both analyses
    const allComponents = new Set();
    leftRecommendations.forEach(rec => {
      if (rec.component) allComponents.add(rec.component);
    });
    rightRecommendations.forEach(rec => {
      if (rec.component) allComponents.add(rec.component);
    });

    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className={`${colorClass} rounded-lg p-4 mb-6`}>
          <h3 className="text-xl font-bold text-gray-900 text-center">{title}</h3>
        </div>
        
        <div className="space-y-6">
          {Array.from(allComponents).map((component) => {
            const leftRec = leftRecommendations.find(r => r.component === component);
            const rightRec = rightRecommendations.find(r => r.component === component);
            
            return (
              <div key={component} className="border border-gray-200 rounded-lg p-4">
                <h4 className="text-lg font-semibold text-gray-900 mb-4 text-center border-b pb-2">
                  {component}
                </h4>
                
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Before */}
                  <div className="border-l-4 border-blue-500 pl-4">
                    <h5 className="text-md font-semibold text-blue-800 mb-3 flex items-center">
                      <span className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-bold mr-2">
                        1
                      </span>
                      Before Analysis
                    </h5>
                    <RecommendationDisplay recommendation={leftRec} side="left" analysis={leftAnalysis} />
                  </div>

                  {/* After */}
                  <div className="border-l-4 border-green-500 pl-4">
                    <h5 className="text-md font-semibold text-green-800 mb-3 flex items-center">
                      <span className="w-6 h-6 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-sm font-bold mr-2">
                        2
                      </span>
                      After Analysis
                    </h5>
                    <RecommendationDisplay recommendation={rightRec} side="right" analysis={rightAnalysis} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // Component for side-by-side comparison organized by recommendation categories
  const BikePositionComparison = ({ leftAnalysis, rightAnalysis }) => {
    if (!leftAnalysis || !rightAnalysis) return null;

    const leftBikeType = leftAnalysis.bikeType || 'road';
    const rightBikeType = rightAnalysis.bikeType || 'road';

    return (
      <div className="space-y-8">
        {/* General Recommendations */}
        <RecommendationCategoryComparison
          leftAnalysis={leftAnalysis}
          rightAnalysis={rightAnalysis}
          category="general"
          title="General Recommendations"
          colorClass="bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200"
        />

        {/* Road Bike Specific Recommendations */}
        {(leftBikeType === 'road' || rightBikeType === 'road') && (
          <>
            <RecommendationCategoryComparison
              leftAnalysis={leftAnalysis}
              rightAnalysis={rightAnalysis}
              category="endurance"
              title="Road Bike - Endurance Position"
              colorClass="bg-gradient-to-r from-green-50 to-green-100 border border-green-200"
            />
            
            <RecommendationCategoryComparison
              leftAnalysis={leftAnalysis}
              rightAnalysis={rightAnalysis}
              category="aggressive"
              title="Road Bike - Aggressive Position"
              colorClass="bg-gradient-to-r from-red-50 to-red-100 border border-red-200"
            />
          </>
        )}

        {/* Time Trial Specific Recommendations */}
        {(leftBikeType === 'tt' || rightBikeType === 'tt') && (
          <RecommendationCategoryComparison
            leftAnalysis={leftAnalysis}
            rightAnalysis={rightAnalysis}
            category="time_trial"
            title="Time Trial Bike Position"
            colorClass="bg-gradient-to-r from-purple-50 to-purple-100 border border-purple-200"
          />
        )}
      </div>
    );
  };

  useEffect(() => {
    fetchAnalyses();
  }, []);

  // Check if there are pre-selected analyses from navigation state
  useEffect(() => {
    if (location.state?.preSelectedAnalyses) {
      const { left, right } = location.state.preSelectedAnalyses;
      if (left) setSelectedAnalyses(prev => ({ ...prev, left }));
      if (right) setSelectedAnalyses(prev => ({ ...prev, right }));
      setComparing(true);
    }
  }, [location.state]);

  const fetchAnalyses = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/analysis`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      if (response.data.analyses && Array.isArray(response.data.analyses)) {
        const processedAnalyses = response.data.analyses.map(analysis => ({
          ...analysis,
          hasVideo: !!analysis.processedVideo?.s3Key || !!analysis.processedVideo?.filePath
        }));
        setAnalyses(processedAnalyses);
      } else {
        setAnalyses([]);
      }
      setLoading(false);
    } catch (err) {
      console.error('Error fetching analyses:', err);
      setError('Failed to load your analyses. Please try again later.');
      setLoading(false);
    }
  };

  const fetchVideoUrl = async (analysisId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/analysis/${analysisId}/processed-video`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      return response.data?.url || null;
    } catch (error) {
      console.error('Error fetching video URL:', error);
      return null;
    }
  };

  const handleSelectAnalysis = (analysis, side) => {
    setSelectedAnalyses(prev => ({
      ...prev,
      [side]: analysis
    }));
  };

  const startComparison = async () => {
    if (selectedAnalyses.left && selectedAnalyses.right) {
      setComparing(true);
      
      // Fetch video URLs if videos are available
      if (selectedAnalyses.left.hasVideo || selectedAnalyses.right.hasVideo) {
        setLoadingVideos(true);
        
        const [leftVideoUrl, rightVideoUrl] = await Promise.all([
          selectedAnalyses.left.hasVideo ? fetchVideoUrl(selectedAnalyses.left._id) : null,
          selectedAnalyses.right.hasVideo ? fetchVideoUrl(selectedAnalyses.right._id) : null
        ]);
        
        setVideoUrls({
          left: leftVideoUrl,
          right: rightVideoUrl
        });
        
        setLoadingVideos(false);
      }
    }
  };

  const resetComparison = () => {
    setSelectedAnalyses({ left: null, right: null });
    setComparing(false);
    setVideoUrls({ left: null, right: null });
    setLoadingVideos(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <DashboardNavbar />
        <div className="flex items-center justify-center pt-32">
          <LoadingIndicator />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <DashboardNavbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-20 sm:pt-24 lg:pt-28">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-600">{error}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="mt-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardNavbar />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-20 sm:pt-24 lg:pt-28">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Recommendation Comparison
              </h1>
              <p className="text-gray-600">
                Compare bike fit recommendations side-by-side to track your progress and improvements.
              </p>
            </div>
            {comparing && (
              <button
                onClick={resetComparison}
                className="mt-4 sm:mt-0 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Reset Selection
              </button>
            )}
          </div>
        </div>

        {!comparing ? (
          /* Selection Phase */
          <div className="space-y-8">
            {analyses.length === 0 ? (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
                <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Analyses Found</h3>
                <p className="text-gray-600 mb-4">
                  You need at least 2 analysis sessions to compare. Upload some videos first!
                </p>
                <button
                  onClick={() => navigate('/video-upload')}
                  className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
                >
                  Upload Video
                </button>
              </div>
            ) : analyses.length < 2 ? (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
                <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Need More Analyses</h3>
                <p className="text-gray-600 mb-4">
                  You have {analyses.length} analysis session{analyses.length > 1 ? 's' : ''}. You need at least 2 to compare.
                </p>
                <button
                  onClick={() => navigate('/video-upload')}
                  className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
                >
                  Upload Another Video
                </button>
              </div>
            ) : (
              <>
                {/* Selection Instructions */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start">
                    <svg className="w-5 h-5 text-blue-600 mr-3 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div>
                      <h3 className="text-sm font-medium text-blue-800 mb-1">How to Compare</h3>
                      <p className="text-sm text-blue-700">
                        Select one analysis for the left side (e.g., "before") and one for the right side (e.g., "after"). 
                        Then click "Start Comparison" to see the side-by-side recommendation analysis.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Selection Grid */}
                <div className="grid md:grid-cols-2 gap-8">
                  {/* Left Side Selection */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <span className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium mr-2">
                        1
                      </span>
                      Select "Before" Analysis
                    </h3>
                    <div className="space-y-3">
                      {analyses.map(analysis => (
                        <div
                          key={analysis._id}
                          className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                            selectedAnalyses.left?._id === analysis._id
                              ? 'border-blue-500 bg-blue-50'
                              : 'border-gray-200 hover:border-gray-300 bg-white'
                          }`}
                          onClick={() => handleSelectAnalysis(analysis, 'left')}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-medium text-gray-900">
                              {analysis.title || 'Bike Fit Analysis'}
                            </h4>
                            <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                              {getBikeTypeLabel(analysis.bikeType)}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600">
                            {formatDate(analysis.createdAt)}
                          </p>
                          {analysis.duration && (
                            <p className="text-xs text-gray-500 mt-1">
                              Duration: {formatDuration(analysis.duration)}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Right Side Selection */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <span className="w-6 h-6 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-sm font-medium mr-2">
                        2
                      </span>
                      Select "After" Analysis
                    </h3>
                    <div className="space-y-3">
                      {analyses.map(analysis => (
                        <div
                          key={analysis._id}
                          className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                            selectedAnalyses.right?._id === analysis._id
                              ? 'border-green-500 bg-green-50'
                              : 'border-gray-200 hover:border-gray-300 bg-white'
                          } ${
                            selectedAnalyses.left?._id === analysis._id
                              ? 'opacity-50 cursor-not-allowed'
                              : ''
                          }`}
                          onClick={() => {
                            if (selectedAnalyses.left?._id !== analysis._id) {
                              handleSelectAnalysis(analysis, 'right');
                            }
                          }}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-medium text-gray-900">
                              {analysis.title || 'Bike Fit Analysis'}
                            </h4>
                            <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                              {getBikeTypeLabel(analysis.bikeType)}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600">
                            {formatDate(analysis.createdAt)}
                          </p>
                          {analysis.duration && (
                            <p className="text-xs text-gray-500 mt-1">
                              Duration: {formatDuration(analysis.duration)}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Start Comparison Button */}
                {selectedAnalyses.left && selectedAnalyses.right && (
                  <div className="flex justify-center">
                    <button
                      onClick={startComparison}
                      className="px-8 py-3 bg-primary text-white text-lg font-medium rounded-lg hover:bg-primary-dark transition-colors flex items-center"
                    >
                      <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                      Start Comparison
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        ) : (
          /* Comparison Phase */
          <div className="space-y-8">
            {/* Comparison Header */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-blue-800 mb-2">Before Analysis</h3>
                <h4 className="font-medium text-gray-900 mb-1">
                  {selectedAnalyses.left.title || 'Bike Fit Analysis'}
                </h4>
                <p className="text-sm text-gray-600">
                  {formatDate(selectedAnalyses.left.createdAt)}
                </p>
                <div className="flex items-center justify-between mt-3">
                  <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                    {getBikeTypeLabel(selectedAnalyses.left.bikeType)}
                  </span>
                  {selectedAnalyses.left.duration && (
                    <span className="text-xs text-gray-500">
                      {formatDuration(selectedAnalyses.left.duration)}
                    </span>
                  )}
                </div>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-green-800 mb-2">After Analysis</h3>
                <h4 className="font-medium text-gray-900 mb-1">
                  {selectedAnalyses.right.title || 'Bike Fit Analysis'}
                </h4>
                <p className="text-sm text-gray-600">
                  {formatDate(selectedAnalyses.right.createdAt)}
                </p>
                <div className="flex items-center justify-between mt-3">
                  <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                    {getBikeTypeLabel(selectedAnalyses.right.bikeType)}
                  </span>
                  {selectedAnalyses.right.duration && (
                    <span className="text-xs text-gray-500">
                      {formatDuration(selectedAnalyses.right.duration)}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Video Comparison Section - moved to top */}
            {(videoUrls.left || videoUrls.right) && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-6 text-center">Video Comparison</h3>
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Left Video */}
                  <div className="border-l-4 border-blue-500 pl-4">
                    <h4 className="text-lg font-semibold text-blue-800 mb-3 flex items-center">
                      <span className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-bold mr-3">
                        1
                      </span>
                      Before Video
                    </h4>
                    {loadingVideos ? (
                      <div className="flex items-center justify-center h-64 bg-gray-100 rounded-lg">
                        <LoadingIndicator />
                      </div>
                    ) : videoUrls.left ? (
                      <VideoPlayer videoUrl={videoUrls.left} />
                    ) : (
                      <div className="flex items-center justify-center h-64 bg-gray-100 rounded-lg">
                        <div className="text-center">
                          <svg className="w-12 h-12 text-gray-400 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                          </svg>
                          <p className="text-gray-500 text-sm">No video available</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Right Video */}
                  <div className="border-l-4 border-green-500 pl-4">
                    <h4 className="text-lg font-semibold text-green-800 mb-3 flex items-center">
                      <span className="w-8 h-8 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-sm font-bold mr-3">
                        2
                      </span>
                      After Video
                    </h4>
                    {loadingVideos ? (
                      <div className="flex items-center justify-center h-64 bg-gray-100 rounded-lg">
                        <LoadingIndicator />
                      </div>
                    ) : videoUrls.right ? (
                      <VideoPlayer videoUrl={videoUrls.right} />
                    ) : (
                      <div className="flex items-center justify-center h-64 bg-gray-100 rounded-lg">
                        <div className="text-center">
                          <svg className="w-12 h-12 text-gray-400 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                          </svg>
                          <p className="text-gray-500 text-sm">No video available</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Recommendations Comparison Explanation */}
            <div className="bg-gradient-to-r from-blue-50 to-green-50 border border-gray-200 rounded-xl p-6">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <svg className="w-8 h-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Understanding Your Bike Fit Recommendations</h3>
                  <div className="space-y-3 text-sm text-gray-700">
                    <p>
                      <strong>What you're seeing:</strong> AI-generated recommendations comparing your "before" and "after" analysis sessions, organized by bike position type and priority level.
                    </p>
                    <div className="grid md:grid-cols-3 gap-4 text-xs">
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-2 bg-red-200 rounded border border-red-300"></div>
                        <span><strong>High Priority:</strong> Critical adjustments needed</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-2 bg-orange-200 rounded border border-orange-300"></div>
                        <span><strong>Medium Priority:</strong> Important improvements</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-2 bg-green-200 rounded border border-green-300"></div>
                        <span><strong>Low Priority:</strong> Fine-tuning suggestions</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Bike Position Recommendations Comparison */}
            <BikePositionComparison 
              leftAnalysis={selectedAnalyses.left}
              rightAnalysis={selectedAnalyses.right}
            />

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={resetComparison}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Select Different Analyses
              </button>
              <button
                onClick={() => navigate('/dashboard')}
                className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
              >
                Back to Dashboard
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default ComparisonAnalysis; 