import React, { useRef, useState, useEffect } from 'react';

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
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [fallbackUrl, setFallbackUrl] = useState(null);
  
  // Handle video URL processing when it changes
  useEffect(() => {
    // Reset states when URL changes
    setLoading(true);
    setError(null);
    setFallbackUrl(null);
    
    // Fetch the video directly to create a local blob URL
    // This can help bypass CORS issues on desktop browsers
    if (videoUrl && videoUrl.startsWith('http')) {
      fetch(videoUrl)
        .then(response => {
          if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
          }
          return response.blob();
        })
        .then(blob => {
          const localBlobUrl = URL.createObjectURL(blob);
          setFallbackUrl(localBlobUrl);
        })
        .catch(err => {
          console.error('Error fetching video for local blob:', err);
          // Don't set error, just continue using original URL
        });
    }
  }, [videoUrl]);
  
  useEffect(() => {
    const videoElement = videoRef.current;
    if (!videoElement) return;
    
    const handleTimeUpdate = () => {
      setCurrentTime(videoElement.currentTime);
    };
    
    const handleLoadedMetadata = () => {
      setDuration(videoElement.duration);
      setLoading(false);
    };
    
    const handleError = (e) => {
      console.error('Video error:', e);
      setError(`Error loading video: ${e.target.error ? e.target.error.message : 'Unknown error'}`);
      setLoading(false);
    };
    
    const handleLoadedData = () => {
      setLoading(false);
    };
    
    videoElement.addEventListener('timeupdate', handleTimeUpdate);
    videoElement.addEventListener('loadedmetadata', handleLoadedMetadata);
    videoElement.addEventListener('error', handleError);
    videoElement.addEventListener('loadeddata', handleLoadedData);
    
    return () => {
      videoElement.removeEventListener('timeupdate', handleTimeUpdate);
      videoElement.removeEventListener('loadedmetadata', handleLoadedMetadata);
      videoElement.removeEventListener('error', handleError);
      videoElement.removeEventListener('loadeddata', handleLoadedData);
    };
  }, [videoUrl, fallbackUrl]);
  
  // Determine the actual URL to use (fallback or original)
  const effectiveUrl = fallbackUrl || videoUrl;
  
  // Handle video rendering
  const renderVideo = () => {
    if (!effectiveUrl) return null;
    
    return (
      <video 
        ref={videoRef}
        className="w-full h-full" 
        controls
        autoPlay={false}
        preload="auto"
        playsInline
        // Removed crossOrigin to avoid CORS issues with direct playback
      >
        <source src={effectiveUrl} type="video/mp4" />
        Your browser does not support the video tag.
      </video>
    );
  };
  
  // Cleanup blob URLs when component unmounts
  useEffect(() => {
    return () => {
      if (fallbackUrl) {
        URL.revokeObjectURL(fallbackUrl);
      }
    };
  }, [fallbackUrl]);
  
  return (
    <div className="mb-6">
      <h3 className="text-lg font-semibold text-gray-700 mb-2">{title || 'Processed Video'}</h3>
      <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        )}
        
        {error ? (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-800 text-white p-4 text-center">
            <div>
              <p className="mb-2">{error}</p>
              <p className="text-sm text-gray-300">
                Try refreshing the page or view this video on a mobile device.
              </p>
            </div>
          </div>
        ) : (
          renderVideo()
        )}
      </div>
      
      <div className="mt-1 flex justify-between text-sm text-gray-500">
        <div>Time: {formatTime(currentTime)} / {formatTime(duration)}</div>
        {onDownload && (
          <button
            onClick={onDownload}
            className="px-4 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
          >
            Download
          </button>
        )}
      </div>
    </div>
  );
}

export default VideoPlayer; 