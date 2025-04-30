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
          // Create a new blob with explicit video/mp4 MIME type
          const videoBlob = new Blob([blob], { type: 'video/mp4' });
          const localBlobUrl = URL.createObjectURL(videoBlob);
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
  
  // Handle direct URL download for debugging
  const handleDirectDownload = () => {
    if (effectiveUrl) {
      window.open(effectiveUrl, '_blank');
    }
  };
  
  // Handle video rendering
  const renderVideo = () => {
    if (!effectiveUrl) return null;
    
    return (
      <video 
        ref={videoRef}
        className="w-full h-full" 
        controls
        autoPlay={false}
        preload="metadata"
        playsInline
        muted={false}
      >
        {/* Support multiple formats for better compatibility */}
        <source src={effectiveUrl} type="video/mp4" />
        <source src={effectiveUrl} type="video/webm" />
        <source src={effectiveUrl} type="video/quicktime" />
        <p className="text-white text-center p-4">
          Your browser doesn't support HTML5 video. 
          <button 
            onClick={handleDirectDownload}
            className="ml-2 text-blue-400 underline"
          >
            Download video
          </button>
        </p>
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
              <button 
                onClick={handleDirectDownload}
                className="mt-2 px-4 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
              >
                Download Video
              </button>
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