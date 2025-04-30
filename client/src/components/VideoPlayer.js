import React, { useRef, useState, useEffect } from 'react';
import axios from 'axios';

// Format time in seconds to MM:SS format
const formatTime = (seconds) => {
  if (!seconds) return '00:00';
  
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  
  return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
};

function VideoPlayer({ videoUrl, onDownload, title }) {
  const videoRef = useRef(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [localBlobUrl, setLocalBlobUrl] = useState(null);
  const [isMobile, setIsMobile] = useState(false);
  
  // Detect if user is on mobile device
  useEffect(() => {
    const userAgent = navigator.userAgent || navigator.vendor || window.opera;
    const isMobileDevice = /android|iPad|iPhone|iPod|webOS/i.test(userAgent);
    setIsMobile(isMobileDevice);
  }, []);
  
  // Create a local blob URL from the remote video to avoid CORS issues
  useEffect(() => {
    if (!videoUrl) return;
    
    setLoading(true);
    
    // If on mobile (iOS), use the direct URL which works there
    if (isMobile) {
      setLoading(false);
      return;
    }
    
    // For desktop browsers, we need to proxy the content
    // to avoid CORS issues with S3 signed URLs
    const fetchVideo = async () => {
      try {
        const response = await axios.get(videoUrl, {
          responseType: 'blob',
          // Disable CORS check since we're using a proxy
          // This only affects the request, not the browser's CORS policy
          headers: {
            'Cache-Control': 'no-cache',
          }
        });
        
        // Create a local blob URL from the response
        const blob = new Blob([response.data], { type: 'video/mp4' });
        const url = URL.createObjectURL(blob);
        setLocalBlobUrl(url);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching video:", err);
        setError("Could not load video. Please use the direct links below.");
        setLoading(false);
      }
    };
    
    fetchVideo();
    
    // Cleanup function to revoke blob URL
    return () => {
      if (localBlobUrl) {
        URL.revokeObjectURL(localBlobUrl);
      }
    };
  }, [videoUrl, isMobile]);
  
  // Handle video events
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    
    const handleTimeUpdate = () => {
      setCurrentTime(video.currentTime);
    };
    
    const handleLoadedMetadata = () => {
      setDuration(video.duration);
    };
    
    const handleError = () => {
      setError("Video playback error. Please use the direct links below.");
    };
    
    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    video.addEventListener('error', handleError);
    
    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      video.removeEventListener('error', handleError);
    };
  }, []);
  
  // Open video in new tab
  const handleOpenVideo = () => {
    if (videoUrl) {
      window.open(videoUrl, '_blank');
    }
  };
  
  // What URL to use for the video element
  const effectiveUrl = isMobile ? videoUrl : (localBlobUrl || '');
  
  return (
    <div className="mb-6">
      <h3 className="text-lg font-semibold text-gray-700 mb-2">{title || 'Processed Video'}</h3>
      
      {loading ? (
        <div className="flex items-center justify-center bg-gray-100 rounded-lg p-10">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : error || !effectiveUrl ? (
        <div className="flex flex-col items-center justify-center bg-gray-100 rounded-lg p-6">
          <p className="text-gray-700 mb-4">
            {error || "Video can't be displayed directly. Please use the links below."}
          </p>
          
          <div className="flex space-x-3 mb-4">
            <button
              onClick={handleOpenVideo}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Open Video
            </button>
            
            <a
              href={videoUrl}
              download="cyclofit-video.mp4"
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            >
              Download Video
            </a>
          </div>
        </div>
      ) : (
        <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
          <video
            ref={videoRef}
            src={effectiveUrl}
            className="w-full h-full"
            controls
            preload="auto"
            playsInline
          />
          
          {/* Alternate fallback links */}
          <div className="absolute bottom-2 right-2 flex space-x-2">
            <button
              onClick={handleOpenVideo}
              className="px-2 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700"
            >
              Open
            </button>
            
            <a
              href={videoUrl}
              download="cyclofit-video.mp4"
              className="px-2 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700"
            >
              Download
            </a>
          </div>
        </div>
      )}
      
      <div className="mt-1 flex justify-between text-sm text-gray-500">
        <div>Time: {formatTime(currentTime)} / {formatTime(duration)}</div>
      </div>
    </div>
  );
}

export default VideoPlayer; 