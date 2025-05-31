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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Simplify - no need to fetch video or create blob URLs
  useEffect(() => {
    if (!videoUrl) {
      setError("No video URL provided");
      setLoading(false);
      return;
    }
    
    // Just use the URL directly - modern browsers handle S3 signed URLs fine
        setLoading(false);
  }, [videoUrl]);
  
  // Handle video events
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    
    const handleTimeUpdate = () => {
      setCurrentTime(video.currentTime);
    };
    
    const handleLoadedMetadata = () => {
      setDuration(video.duration);
      setLoading(false);
    };
    
    const handleError = (e) => {
      console.error("Video playback error:", e);
      const video = e.target;
      let errorMessage = "Video playback error.";
      
      // Get more specific error information
      if (video && video.error) {
        switch (video.error.code) {
          case 1:
            errorMessage = "Video loading aborted.";
            break;
          case 2:
            errorMessage = "Network error while loading video.";
            break;
          case 3:
            errorMessage = "Video decoding error.";
            break;
          case 4:
            errorMessage = "Video format not supported.";
            break;
          default:
            errorMessage = `Video error: ${video.error.message || 'Unknown error'}`;
        }
      }
      
      console.error("Video error details:", {
        url: videoUrl,
        errorCode: video?.error?.code,
        errorMessage: video?.error?.message
      });
      
      setError(`${errorMessage} Please use the direct links below.`);
      setLoading(false);
    };
    
    const handleLoadStart = () => {
      setLoading(true);
    };
    
    const handleCanPlay = () => {
      setLoading(false);
      setError(null);
    };
    
    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    video.addEventListener('error', handleError);
    video.addEventListener('loadstart', handleLoadStart);
    video.addEventListener('canplay', handleCanPlay);
    
    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      video.removeEventListener('error', handleError);
      video.removeEventListener('loadstart', handleLoadStart);
      video.removeEventListener('canplay', handleCanPlay);
    };
  }, [videoUrl]);
  
  // Open video in new tab
  const handleOpenVideo = () => {
    if (videoUrl) {
      window.open(videoUrl, '_blank');
    }
  };
  
  return (
    <div className="mb-6">
      <h3 className="text-lg font-semibold text-gray-700 mb-2">{title || 'Processed Video'}</h3>
      
      {error ? (
        <div className="flex flex-col items-center justify-center bg-gray-100 rounded-lg p-6">
          <p className="text-gray-700 mb-4">
            {error}
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
        <div className="relative">
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-100 bg-opacity-75 rounded-lg z-10">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
          )}
          
        <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
          <video
            ref={videoRef}
              src={videoUrl}
            className="w-full h-full"
            controls
              preload="metadata"
            playsInline
          />
          
          {/* Alternate fallback links */}
            <div className="absolute bottom-2 right-2 flex space-x-2 opacity-80 hover:opacity-100">
            <button
              onClick={handleOpenVideo}
              className="px-2 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700"
                title="Open in new tab"
            >
              Open
            </button>
            
            <a
              href={videoUrl}
              download="cyclofit-video.mp4"
              className="px-2 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700"
                title="Download video"
            >
              Download
            </a>
            </div>
          </div>
        </div>
      )}
      
      {!error && duration > 0 && (
      <div className="mt-1 flex justify-between text-sm text-gray-500">
        <div>Time: {formatTime(currentTime)} / {formatTime(duration)}</div>
      </div>
      )}
    </div>
  );
}

export default VideoPlayer; 