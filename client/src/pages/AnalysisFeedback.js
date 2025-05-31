import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation, Link, useParams } from 'react-router-dom';
import VideoPlayer from '../components/VideoPlayer';
import KeyFrameGallery from '../components/KeyFrameGallery';
import BikeRecommendations from '../components/BikeRecommendations';
import BodyMeasurements from '../components/BodyMeasurements';
import JointAngles from '../components/JointAngles';
import axios from 'axios';
import { base64ToBlob } from '../utils/videoUtils';
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
  const { id } = useParams(); // Get ID from URL params
  const [selectedFrame, setSelectedFrame] = useState(0);
  const [analysisId, setAnalysisId] = useState(null);
  const [processedVideoUrl, setProcessedVideoUrl] = useState(null);
  const [keyframesUrl, setKeyframesUrl] = useState(null);
  // Add ref to store video blob
  const videoBlobRef = useRef(null);
  
  // Function to safely create a blob URL from base64 data
  const createVideoBlob = (base64Data) => {
    try {
      // Clean up previous blob URL if it exists
      if (processedVideoUrl && !processedVideoUrl.startsWith('http')) {
        URL.revokeObjectURL(processedVideoUrl);
      }
      
      // Handle video data encoding
      let base64Content = base64Data;
      if (base64Data.includes(',')) {
        base64Content = base64Data.split(',')[1];
      }
      
      // Convert base64 to binary
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
      
      // Store blob in ref to prevent garbage collection
      videoBlobRef.current = new Blob(byteArrays, { type: 'video/mp4' });
      console.log('Video blob created, size:', videoBlobRef.current.size);
      
      // Create and return blob URL
      return URL.createObjectURL(videoBlobRef.current);
    } catch (error) {
      console.error('Error creating video blob:', error);
      return null;
    }
  };

  // Main useEffect to handle initial data loading
  useEffect(() => {
    let isMounted = true; // Add cleanup flag
    
    // First check URL params
    if (id) {
      // If we have an ID in the URL, fetch the analysis
      fetchAnalysisById(id);
      return; // Exit early, fetchAnalysisById will handle everything
    }
    
    // Check if we have results from navigation state
    const analysisResult = location.state?.analysisResult;
    
    if (analysisResult) {
      // Clear location state to prevent issues on refresh
      window.history.replaceState({}, document.title);
      
      // Set the result and bike type
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
      
      // Handle video URL if directly available (from upload)
      if (analysisResult.videoUrl) {
        const videoUrl = analysisResult.videoUrl;
          setProcessedVideoUrl(videoUrl);
        setResult(prev => ({...prev, videoUrl}));
      } else if (processedResult.processed_video_available && processedResult.analysisId && isMounted) {
        // Only fetch if we don't already have the URL
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
      
      // Handle keyframes similarly - only fetch if needed and mounted
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
      // If no results or ID, redirect back to upload page
      navigate('/video-upload', { 
        state: { error: 'No analysis results found. Please upload a video first.' } 
      });
    }
    
    // Cleanup function
    return () => {
      isMounted = false;
      // Revoke blob URLs
      if (processedVideoUrl && !processedVideoUrl.startsWith('http')) {
        URL.revokeObjectURL(processedVideoUrl);
      }
      if (generatedVideoUrl) {
        URL.revokeObjectURL(generatedVideoUrl);
      }
    };
  }, [id, navigate]); // Remove location and other dependencies that cause re-renders

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
      
      // Fetch analysis data
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/analysis/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      if (!response.data || !response.data.analysis) {
        throw new Error('Analysis not found');
      }
      
      const analysis = response.data.analysis;
      
      // Transform database structure to match the expected result format
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
      
      // Set the result immediately
      if (isMounted) {
      setResult(analysisResult);
      setBikeType(analysis.bikeType || 'road');
        setAnalysisId(analysis._id);
      }
      
      // Fetch processed video if available - single request
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
          // Continue without video if there's an error
        }
      }
      
      // Fetch keyframes if available - single request
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
          // Continue without keyframes if there's an error
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
    
    // Cleanup
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
      
      // Get the original video URL
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/analysis/${analysisId}/original-video`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      
      if (response.data && response.data.url) {
        // Create a temporary link and click it to start the download
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
    // Navigate back to upload page without any state
    navigate('/video-upload');
  };

  const generateVideoFromKeyframes = async () => {
    setError(''); // Clear any previous errors
    
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
      
      // Create a canvas element
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        throw new Error("Could not get canvas context");
      }
      
      const frameWidth = 640;  // Set your desired video dimensions
      const frameHeight = 360;
      canvas.width = frameWidth;
      canvas.height = frameHeight;
      
      // Load all images first
      const images = await Promise.all(
        result.keyFrameUrls.map((url, index) => {
          return new Promise((resolve, reject) => {
            if (!url) {
              console.warn(`Key frame ${index} URL is null or undefined`);
              resolve(null); // Skip invalid URLs
              return;
            }
            
            const img = new Image();
            img.onload = () => {
              console.log(`Loaded image ${index} successfully`);
              resolve(img);
            };
            img.onerror = (e) => {
              console.warn(`Failed to load image from URL: ${url}`, e);
              resolve(null); // Don't reject the whole Promise.all
            };
            img.crossOrigin = "anonymous"; // Try to avoid CORS issues
            img.src = url;
          });
        })
      );
      
      // Filter out any null images
      const validImages = images.filter(img => img !== null);
      
      if (validImages.length === 0) {
        throw new Error("Failed to load any valid images");
      }
      
      console.log(`Successfully loaded ${validImages.length} images for video`);
      
      // Create MediaRecorder to capture canvas as video
      let stream;
      try {
        stream = canvas.captureStream(30); // 30 fps
      } catch (streamError) {
        console.error("Error creating canvas stream:", streamError);
        throw new Error(`Failed to create canvas stream: ${streamError.message}`);
      }
      
      // Check if MediaRecorder is supported with the given MIME type
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
        videoBitsPerSecond: 2500000 // 2.5 Mbps
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
      
      // Draw each frame with a delay
      let frameIndex = 0;
      const fps = result.fps || 10; // Default to 10fps if not provided by backend
      const frameDuration = 1000 / fps;
      
      const drawNextFrame = () => {
        if (frameIndex < validImages.length) {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(validImages[frameIndex], 0, 0, canvas.width, canvas.height);
          console.log(`Drew frame ${frameIndex}`);
          frameIndex++;
          setTimeout(drawNextFrame, frameDuration);
        } else {
          // Finished drawing all frames
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
          }, 100); // Give a little time for the last frame
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
      <div className="min-h-screen bg-secondary bg-opacity-10">
        <DashboardNavbar />
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8 pt-28">
          <div className="flex justify-center items-center h-64">
            <div className="text-center">
              <div className="animate-spin h-12 w-12 text-primary mx-auto mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-dark">Loading Analysis Results...</h2>
              <p className="text-secondary mt-2">Please wait while we prepare your bike fit analysis.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-secondary bg-opacity-10">
        <DashboardNavbar />
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8 pt-28">
          <div className="bg-white p-8 rounded-lg shadow-md">
            <div className="text-red-600 mb-4">
              <svg className="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-center mb-4 text-dark">Error Loading Analysis</h2>
            <p className="text-secondary text-center mb-6">{error}</p>
            <div className="flex justify-center">
              <button
                onClick={() => navigate('/dashboard')}
                className="bg-primary text-white px-4 py-2 rounded hover:bg-primary-dark"
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
      <div className="min-h-screen bg-secondary bg-opacity-10">
        <DashboardNavbar />
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8 pt-28">
          <div className="bg-white p-8 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold text-center mb-4 text-dark">No Analysis Results Available</h2>
            <p className="text-secondary text-center mb-6">We couldn't find any analysis results to display.</p>
            <div className="flex justify-center">
              <button
                onClick={() => navigate('/video-upload')}
                className="bg-primary text-white px-4 py-2 rounded hover:bg-primary-dark"
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
    <div className="min-h-screen bg-secondary bg-opacity-10">
      <DashboardNavbar />
      
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8 pt-28">
        <div className="px-4 py-6 sm:px-0">
          <div className="bg-white shadow-lg sm:rounded-3xl sm:p-8">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-dark mb-4">Bike Fit Analysis Results</h1>
              {result.createdAt && (
                <div className="text-sm text-gray-500 mb-2">
                  Created: {formatDate(result.createdAt)}
                </div>
              )}
              <p className="text-secondary">
                Review your bike fit analysis results and customized recommendations.
              </p>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Left column - Video and measurements */}
              <div className="lg:col-span-7">
                {/* Video section */}
                <div className="mb-8">
                  <h2 className="text-xl font-semibold text-dark mb-4">Video Analysis</h2>
                  {result.videoUrl ? (
                    <>
                      <VideoPlayer videoUrl={result.videoUrl} onDownload={handleDownload} />
                      {result.duration && (
                        <div className="mt-2 text-sm text-gray-600 flex items-center">
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          Duration: {formatDuration(result.duration)}
                        </div>
                      )}
                    </>
                  ) : generatedVideoUrl ? (
                    <VideoPlayer videoUrl={generatedVideoUrl} />
                  ) : (
                    <div className="bg-gray-100 p-6 rounded-lg text-center">
                      <p className="text-gray-600 mb-4">
                        {result.processed_video_available ? 
                          "Loading video... If it doesn't appear, please try refreshing the page." :
                          "Video processing failed or is not available for this analysis."}
                      </p>
                      
                      {/* Show keyframe options if keyframes are available */}
                      {result.keyFrameUrls && result.keyFrameUrls.length > 0 && (
                        <div className="mt-6">
                          <p className="text-gray-700 mb-2">Key frames are available for this analysis:</p>
                          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 mt-4">
                            {result.keyFrameUrls.map((url, index) => (
                              <img 
                                key={index} 
                                src={url} 
                                alt={`Keyframe ${index + 1}`}
                                className="w-full h-auto rounded shadow-sm"
                                onClick={() => setSelectedFrame(index)}
                              />
                            ))}
                          </div>
                          <button
                            onClick={generateVideoFromKeyframes}
                            className="mt-4 bg-primary text-white px-4 py-2 rounded hover:bg-primary-dark disabled:opacity-50"
                            disabled={isGeneratingVideo}
                          >
                            {isGeneratingVideo ? 'Generating Video...' : 'Generate Video from Keyframes'}
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                  
                  {result.videoUrl && (
                    <div className="mt-4">
                      <button 
                        onClick={handleDownload}
                        className="bg-primary text-white px-4 py-2 rounded hover:bg-primary-dark transition-colors"
                      >
                        Download Video
                      </button>
                    </div>
                  )}
                </div>
                
                {/* Joint angles section */}
                <div className="mb-8">
                  <JointAngles maxAngles={result.max_angles} minAngles={result.min_angles} />
                </div>
                
                {/* Body measurements section */}
                <div className="mb-8">
                  <BodyMeasurements bodyLengths={result.body_lengths_cm} />
                </div>
              </div>
              
              {/* Right column - Recommendations */}
              <div className="lg:col-span-5">
                <BikeRecommendations 
                  recommendations={result.recommendations} 
                  bikeType={bikeType} 
                  setBikeType={setBikeType} 
                />
                
                <div className="flex flex-wrap gap-3 justify-end mt-8">
                  <button 
                    onClick={() => navigate('/dashboard')}
                    className="bg-secondary bg-opacity-10 text-secondary px-4 py-2 rounded hover:bg-opacity-20 transition-colors"
                  >
                    Back to Dashboard
                  </button>
                  <button 
                    onClick={resetForm}
                    className="bg-primary text-white px-4 py-2 rounded hover:bg-primary-dark transition-colors"
                  >
                    New Analysis
                  </button>
                </div>
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