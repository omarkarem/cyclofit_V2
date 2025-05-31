import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation, Link, useParams } from 'react-router-dom';
import VideoPlayer from '../components/VideoPlayer';
import KeyFrameGallery from '../components/KeyFrameGallery';
import BikeRecommendations from '../components/BikeRecommendations';
import BodyMeasurements from '../components/BodyMeasurements';
import JointAngles from '../components/JointAngles';
import axios from 'axios';
import DashboardNavbar from '../components/layout/DashboardNavbar';

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

function AnalysisFeedback() {
  const [result, setResult] = useState(null);
  const [bikeType, setBikeType] = useState('road');
  const [generatedVideoUrl, setGeneratedVideoUrl] = useState(null);
  const [isGeneratingVideo, setIsGeneratingVideo] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const canvasRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();
  const [selectedFrame, setSelectedFrame] = useState(0);
  const [analysisId, setAnalysisId] = useState(null);
  const [processedVideoUrl, setProcessedVideoUrl] = useState(null);
  const [keyframesUrl, setKeyframesUrl] = useState(null);
  const videoBlobRef = useRef(null);
  
  // Function to safely create a blob URL from base64 data
  const createVideoBlob = (base64Data) => {
    try {
      if (processedVideoUrl && !processedVideoUrl.startsWith('http')) {
        URL.revokeObjectURL(processedVideoUrl);
      }
      
      let base64Content = base64Data;
      if (base64Data.includes(',')) {
        base64Content = base64Data.split(',')[1];
      }
      
      const byteCharacters = atob(base64Content);
      const byteArrays = [];
      
      for (let i = 0; i < byteCharacters.length; i += 1024) {
        const slice = byteCharacters.slice(i, i + 1024);
        const byteNumbers = new Array(slice.length);
        
        for (let j = 0; j < slice.length; j++) {
          byteNumbers[j] = slice.charCodeAt(j);
        }
        
        byteArrays.push(new Uint8Array(byteNumbers));
      }
      
      videoBlobRef.current = new Blob(byteArrays, { type: 'video/mp4' });
      console.log('Video blob created, size:', videoBlobRef.current.size);
      
      return URL.createObjectURL(videoBlobRef.current);
    } catch (error) {
      console.error('Error creating video blob:', error);
      return null;
    }
  };

  // Main useEffect to handle initial data loading
  useEffect(() => {
    let isMounted = true;
    
    if (id) {
      fetchAnalysisById(id);
      return;
    }
    
    const analysisResult = location.state?.analysisResult;
    
    if (analysisResult) {
      window.history.replaceState({}, document.title);
      
      const processedResult = {
        max_angles: analysisResult.max_angles || analysisResult.maxAngles,
        min_angles: analysisResult.min_angles || analysisResult.minAngles,
        body_lengths_cm: analysisResult.body_lengths_cm || analysisResult.bodyLengthsCm,
        recommendations: analysisResult.recommendations,
        bike_type: analysisResult.bike_type || analysisResult.bikeType || 'road',
        analysisId: analysisResult.analysisId || analysisResult._id,
        duration: analysisResult.duration,
        processed_video_available: analysisResult.processed_video_available,
        keyframes_available: analysisResult.keyframes_available,
        keyframe_count: analysisResult.keyframe_count
      };
      
      setResult(processedResult);
      setBikeType(processedResult.bike_type);
      setAnalysisId(processedResult.analysisId);
      
      if (analysisResult.videoUrl) {
        const videoUrl = analysisResult.videoUrl;
        setProcessedVideoUrl(videoUrl);
        setResult(prev => ({...prev, videoUrl}));
      } else if (processedResult.processed_video_available && processedResult.analysisId && isMounted) {
        const fetchProcessedVideo = async () => {
          try {
            const token = localStorage.getItem('token');
            if (!token) {
              navigate('/login');
              return;
            }
            
            const videoResponse = await axios.get(
              `${process.env.REACT_APP_API_URL}/api/analysis/${processedResult.analysisId}/processed-video`, 
              {
                headers: {
                  Authorization: `Bearer ${token}`
                }
              }
            );
            
            if (isMounted && videoResponse.data && videoResponse.data.url) {
              setProcessedVideoUrl(videoResponse.data.url);
              setResult(prevResult => ({...prevResult, videoUrl: videoResponse.data.url}));
              console.log('Successfully fetched processed video URL');
            }
          } catch (videoError) {
            console.error('Error fetching processed video:', videoError);
          }
        };
        
        fetchProcessedVideo();
      }
      
      if (processedResult.keyframes_available && processedResult.keyframe_count > 0 && processedResult.analysisId && isMounted) {
        const fetchKeyframes = async () => {
          try {
            const token = localStorage.getItem('token');
            if (!token) {
              navigate('/login');
              return;
            }
            
            const keyframesResponse = await axios.get(
              `${process.env.REACT_APP_API_URL}/api/analysis/${processedResult.analysisId}/keyframes`, 
              {
                headers: {
                  Authorization: `Bearer ${token}`
                }
              }
            );
            
            if (isMounted && keyframesResponse.data && keyframesResponse.data.keyframes) {
              const keyFrameUrls = keyframesResponse.data.keyframes.map(kf => kf.url);
                setResult(prevResult => ({...prevResult, keyFrameUrls}));
              console.log('Successfully fetched keyframes');
            }
          } catch (keyframeError) {
            console.error('Error fetching keyframes:', keyframeError);
          }
        };
        
        fetchKeyframes();
      }
      
      setLoading(false);
    } else {
      navigate('/video-upload', { 
        state: { error: 'No analysis results found. Please upload a video first.' } 
      });
    }
    
    return () => {
      isMounted = false;
      if (processedVideoUrl && !processedVideoUrl.startsWith('http')) {
        URL.revokeObjectURL(processedVideoUrl);
      }
      if (generatedVideoUrl) {
        URL.revokeObjectURL(generatedVideoUrl);
      }
    };
  }, [id, navigate]);

  // Function to fetch analysis by ID
  const fetchAnalysisById = async (id) => {
    let isMounted = true;
    setLoading(true);
    setError('');
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }
      
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/analysis/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      if (!response.data || !response.data.analysis) {
        throw new Error('Analysis not found');
      }
      
      const analysis = response.data.analysis;
      
      const analysisResult = {
        max_angles: analysis.maxAngles,
        min_angles: analysis.minAngles,
        body_lengths_cm: analysis.bodyLengthsCm,
        recommendations: analysis.recommendations,
        bike_type: analysis.bikeType,
        analysisId: analysis._id,
        duration: analysis.duration,
        createdAt: analysis.createdAt,
        storage_type: analysis.storageType || 's3',
        processed_video_available: !!analysis.processedVideo?.s3Key || !!analysis.processedVideo?.filePath,
        keyframes_available: Array.isArray(analysis.keyframes) && analysis.keyframes.length > 0,
        keyframe_count: Array.isArray(analysis.keyframes) ? analysis.keyframes.length : 0
      };
      
      if (isMounted) {
      setResult(analysisResult);
      setBikeType(analysis.bikeType || 'road');
        setAnalysisId(analysis._id);
      }
      
      if (analysisResult.processed_video_available && isMounted) {
        try {
          const videoResponse = await axios.get(
            `${process.env.REACT_APP_API_URL}/api/analysis/${id}/processed-video`, 
            {
              headers: {
                Authorization: `Bearer ${token}`
              }
            }
          );
          
          if (isMounted && videoResponse.data && videoResponse.data.url) {
            setProcessedVideoUrl(videoResponse.data.url);
            setResult(prev => ({...prev, videoUrl: videoResponse.data.url}));
            console.log('Successfully fetched processed video URL from analysis');
          }
        } catch (videoError) {
          console.error('Error fetching processed video:', videoError);
        }
      }
      
      if (analysisResult.keyframes_available && analysisResult.keyframe_count > 0 && isMounted) {
        try {
          const keyframesResponse = await axios.get(
            `${process.env.REACT_APP_API_URL}/api/analysis/${id}/keyframes`, 
            {
              headers: {
                Authorization: `Bearer ${token}`
              }
            }
          );
          
          if (isMounted && keyframesResponse.data && keyframesResponse.data.keyframes) {
            const keyFrameUrls = keyframesResponse.data.keyframes.map(kf => kf.url);
            setResult(prev => ({...prev, keyFrameUrls}));
            console.log('Successfully fetched keyframe URLs from analysis');
          }
        } catch (keyframeError) {
          console.error('Error fetching keyframes:', keyframeError);
        }
      }
      
      if (isMounted) {
      setLoading(false);
      }
    } catch (error) {
      console.error('Error fetching analysis:', error);
      if (isMounted) {
      setError('Failed to load analysis. Please try again.');
      setLoading(false);
    }
    }
    
    return () => {
      isMounted = false;
    };
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const handleDownload = async () => {
    if (!result || !analysisId) {
      console.error('No analysis ID available for download');
      return;
    }
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }
      
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/analysis/${analysisId}/original-video`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      
      if (response.data && response.data.url) {
        const link = document.createElement('a');
        link.href = response.data.url;
        link.setAttribute('download', `CycloFit_Analysis_${analysisId}.mp4`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        console.error('No download URL available');
      }
    } catch (error) {
      console.error('Error downloading video:', error);
    }
  };
  
  const resetForm = () => {
    navigate('/video-upload');
  };

  const generateVideoFromKeyframes = async () => {
    setError('');
    
    if (!result) {
      setError("No analysis results available");
      return;
    }
    
    if (!result.keyFrameUrls || !Array.isArray(result.keyFrameUrls) || result.keyFrameUrls.length === 0) {
      setError("No key frames available to create video");
      return;
    }
    
    if (!canvasRef.current) {
      setError("Canvas element not available");
      return;
    }
    
    setIsGeneratingVideo(true);
    
    try {
      console.log("Starting video generation from key frames:", result.keyFrameUrls);
      
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        throw new Error("Could not get canvas context");
      }
      
      const frameWidth = 640;
      const frameHeight = 360;
      canvas.width = frameWidth;
      canvas.height = frameHeight;
      
      const images = await Promise.all(
        result.keyFrameUrls.map((url, index) => {
          return new Promise((resolve, reject) => {
            if (!url) {
              console.warn(`Key frame ${index} URL is null or undefined`);
              resolve(null);
              return;
            }
            
            const img = new Image();
            img.onload = () => {
              console.log(`Loaded image ${index} successfully`);
              resolve(img);
            };
            img.onerror = (e) => {
              console.warn(`Failed to load image from URL: ${url}`, e);
              resolve(null);
            };
            img.crossOrigin = "anonymous";
            img.src = url;
          });
        })
      );
      
      const validImages = images.filter(img => img !== null);
      
      if (validImages.length === 0) {
        throw new Error("Failed to load any valid images");
      }
      
      console.log(`Successfully loaded ${validImages.length} images for video`);
      
      let stream;
      try {
        stream = canvas.captureStream(30);
      } catch (streamError) {
        console.error("Error creating canvas stream:", streamError);
        throw new Error(`Failed to create canvas stream: ${streamError.message}`);
      }
      
      let mimeType = 'video/webm;codecs=vp9';
      if (!MediaRecorder.isTypeSupported(mimeType)) {
        console.warn(`${mimeType} is not supported, falling back to video/webm`);
        mimeType = 'video/webm';
        
        if (!MediaRecorder.isTypeSupported(mimeType)) {
          console.warn(`${mimeType} is not supported, falling back to video/mp4`);
          mimeType = 'video/mp4';
          
          if (!MediaRecorder.isTypeSupported(mimeType)) {
            throw new Error("None of the supported video formats are available in this browser");
          }
        }
      }
      
      console.log(`Using MIME type: ${mimeType} for video recording`);
      
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: mimeType,
        videoBitsPerSecond: 2500000
      });
      
      const chunks = [];
      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunks.push(e.data);
          console.log(`Received data chunk of size: ${e.data.size}`);
        }
      };
      
      mediaRecorder.onerror = (event) => {
        console.error("MediaRecorder error:", event);
        setError(`Video generation error: ${event.error?.message || 'Unknown error'}`);
        setIsGeneratingVideo(false);
      };
      
      mediaRecorder.onstop = () => {
        try {
          if (chunks.length === 0) {
            throw new Error("No data was recorded");
          }
          
          console.log(`Creating video blob from ${chunks.length} chunks`);
          const blob = new Blob(chunks, { type: mimeType });
          console.log(`Video blob created: ${blob.size} bytes`);
          
          const videoUrl = URL.createObjectURL(blob);
          setGeneratedVideoUrl(videoUrl);
          console.log("Video URL created:", videoUrl);
        } catch (blobError) {
          console.error("Error creating video blob:", blobError);
          setError(`Failed to create video: ${blobError.message}`);
        } finally {
          setIsGeneratingVideo(false);
        }
      };
      
      mediaRecorder.start();
      console.log("MediaRecorder started");
      
      let frameIndex = 0;
      const fps = result.fps || 10;
      const frameDuration = 1000 / fps;
      
      const drawNextFrame = () => {
        if (frameIndex < validImages.length) {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(validImages[frameIndex], 0, 0, canvas.width, canvas.height);
          console.log(`Drew frame ${frameIndex}`);
          frameIndex++;
          setTimeout(drawNextFrame, frameDuration);
        } else {
          console.log("Finished drawing all frames");
          setTimeout(() => {
            try {
              mediaRecorder.stop();
              console.log("MediaRecorder stopped");
            } catch (stopError) {
              console.error("Error stopping MediaRecorder:", stopError);
              setError(`Failed to stop recording: ${stopError.message}`);
              setIsGeneratingVideo(false);
            }
          }, 100);
        }
      };
      
      drawNextFrame();
      
    } catch (err) {
      console.error("Error generating video:", err);
      setError(`Failed to generate video: ${err.message}`);
      setIsGeneratingVideo(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-12 w-12 border-t-2 border-b-2 border-primary rounded-full mx-auto"></div>
          <h2 className="text-xl font-semibold text-gray-900 mt-4">Loading Analysis Results...</h2>
          <p className="text-gray-600 mt-2">Please wait while we prepare your bike fit analysis.</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <DashboardNavbar />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-20 sm:pt-24 lg:pt-28">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
            <div className="text-center">
              <svg className="h-12 w-12 text-red-500 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Analysis</h2>
              <p className="text-gray-600 mb-6">{error}</p>
              <button
                onClick={() => navigate('/dashboard')}
                className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary-dark transition-colors"
              >
                Return to Dashboard
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="min-h-screen bg-gray-50">
        <DashboardNavbar />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-20 sm:pt-24 lg:pt-28">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
            <div className="text-center">
              <svg className="h-12 w-12 text-gray-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">No Analysis Results Available</h2>
              <p className="text-gray-600 mb-6">We couldn't find any analysis results to display.</p>
              <button
                onClick={() => navigate('/video-upload')}
                className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary-dark transition-colors"
              >
                Create New Analysis
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardNavbar />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-20 sm:pt-24 lg:pt-28">
        {/* Header Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">
                Bike Fit Analysis Results
              </h1>
              {result.createdAt && (
                <p className="text-sm text-gray-500">
                  Created: {formatDate(result.createdAt)}
                </p>
              )}
            </div>
            <div className="mt-4 sm:mt-0 flex flex-wrap gap-2">
              <span className="px-3 py-1 bg-blue-50 text-blue-700 text-sm font-medium rounded-full">
                {result.bike_type || 'Road'} Bike
              </span>
              {result.duration && (
                <span className="px-3 py-1 bg-gray-100 text-gray-700 text-sm font-medium rounded-full">
                  {formatDuration(result.duration)}
                </span>
              )}
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Video and Measurements */}
          <div className="lg:col-span-2 space-y-6">
            {/* Video Section */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">Video Analysis</h2>
              
              {result.videoUrl ? (
                <>
                  <VideoPlayer videoUrl={result.videoUrl} onDownload={handleDownload} />
                  {result.duration && (
                    <div className="mt-2 flex items-center text-sm text-gray-600">
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Duration: {formatDuration(result.duration)}
                    </div>
                  )}
                  <div className="mt-4">
                    <button 
                      onClick={handleDownload}
                      className="inline-flex items-center px-4 py-2 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary-dark transition-colors"
                    >
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                      </svg>
                      Download Video
                    </button>
                  </div>
                </>
              ) : generatedVideoUrl ? (
                <VideoPlayer videoUrl={generatedVideoUrl} />
              ) : (
                <div className="bg-gray-100 rounded-lg p-6 text-center">
                  <svg className="w-12 h-12 text-gray-400 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  <p className="text-gray-600 mb-4">
                    {result.processed_video_available ? 
                      "Loading video... If it doesn't appear, please try refreshing the page." :
                      "Video processing failed or is not available for this analysis."}
                  </p>
                  
                  {/* Keyframes */}
                  {result.keyFrameUrls && result.keyFrameUrls.length > 0 && (
                    <div className="mt-6">
                      <p className="text-gray-700 mb-3">Key frames available:</p>
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 mb-4">
                        {result.keyFrameUrls.map((url, index) => (
                          <img 
                            key={index} 
                            src={url} 
                            alt={`Keyframe ${index + 1}`}
                            className="w-full rounded shadow-sm cursor-pointer hover:shadow-md transition-shadow"
                            onClick={() => setSelectedFrame(index)}
                          />
                        ))}
                      </div>
                      <button
                        onClick={generateVideoFromKeyframes}
                        className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark disabled:opacity-50 transition-colors"
                        disabled={isGeneratingVideo}
                      >
                        {isGeneratingVideo ? 'Generating Video...' : 'Generate Video from Keyframes'}
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
            
            {/* Joint Angles */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
              <JointAngles maxAngles={result.max_angles} minAngles={result.min_angles} />
            </div>
            
            {/* Body Measurements */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
              <BodyMeasurements bodyLengths={result.body_lengths_cm} />
            </div>
          </div>
          
          {/* Right Column - Recommendations */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6 mb-6">
                <BikeRecommendations 
                  recommendations={result.recommendations} 
                  bikeType={bikeType} 
                  setBikeType={setBikeType} 
                />
              </div>
              
              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3">
                <button 
                  onClick={() => navigate('/dashboard')}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-center"
                >
                  Back to Dashboard
                </button>
                <button 
                  onClick={resetForm}
                  className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors text-center"
                >
                  New Analysis
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      {/* Hidden canvas for video generation */}
      <canvas ref={canvasRef} style={{ display: 'none' }}></canvas>
    </div>
  );
}

export default AnalysisFeedback; 