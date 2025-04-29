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
    
    // Reset state when video URL changes
    setLoading(true);
    setError(null);
    
    return () => {
      videoElement.removeEventListener('timeupdate', handleTimeUpdate);
      videoElement.removeEventListener('loadedmetadata', handleLoadedMetadata);
      videoElement.removeEventListener('error', handleError);
      videoElement.removeEventListener('loadeddata', handleLoadedData);
    };
  }, [videoUrl]);
  
  // Use multiple sources to support different browsers
  const getVideoSources = () => {
    // For blob URLs or direct URLs, just use a single source
    if (videoUrl && (videoUrl.startsWith('blob:') || videoUrl.startsWith('http'))) {
      return <source src={videoUrl} type="video/mp4" />;
    }
    
    // If it's base64 data, create a blob URL
    if (videoUrl && videoUrl.startsWith('data:')) {
      try {
        const blob = fetch(videoUrl).then(r => r.blob());
        const blobUrl = URL.createObjectURL(blob);
        return <source src={blobUrl} type="video/mp4" />;
      } catch (e) {
        console.error('Error creating blob from data URL:', e);
        return <source src={videoUrl} type="video/mp4" />;
      }
    }
    
    // Default case
    return <source src={videoUrl} type="video/mp4" />;
  };
  
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
          <video 
            ref={videoRef}
            className="w-full h-full" 
            controls
            autoPlay={false}
            preload="auto"
            playsInline
            crossOrigin="anonymous"
          >
            {videoUrl ? getVideoSources() : null}
            Your browser does not support the video tag.
          </video>
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