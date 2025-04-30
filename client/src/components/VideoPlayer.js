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
  const [debugInfo, setDebugInfo] = useState("");
  const [showDebug, setShowDebug] = useState(false);
  
  // Handle video URL changes
  useEffect(() => {
    setLoading(true);
    setError(null);
    setDebugInfo("");
    
    if (!videoUrl) {
      setError("No video URL provided");
      setLoading(false);
      return;
    }
    
    // Log the original URL for debugging
    console.log("Original video URL:", videoUrl);
    setDebugInfo(prev => prev + `Original URL: ${videoUrl}\n`);
    
    // No fetch attempts - they trigger CORS errors
    // Instead, we'll let the video element handle the URL directly
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
      console.log("Video metadata loaded:", videoElement.videoWidth, "x", videoElement.videoHeight);
      setDebugInfo(prev => prev + `Video loaded: ${videoElement.videoWidth}x${videoElement.videoHeight}\n`);
    };
    
    const handleError = (e) => {
      console.error('Video error:', e);
      const errorMessage = e.target.error ? e.target.error.message : 'Unknown error';
      setError(`Error loading video: ${errorMessage}`);
      setLoading(false);
      setDebugInfo(prev => prev + `Video error: ${errorMessage}\n`);
      setDebugInfo(prev => prev + `CORS issue detected. Try opening in new tab.\n`);
    };
    
    const handleLoadedData = () => {
      setLoading(false);
      console.log("Video data loaded successfully");
      setDebugInfo(prev => prev + `Video data loaded successfully\n`);
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
  }, [videoUrl]);
  
  // Handle direct URL access
  const handleDirectAccess = () => {
    if (videoUrl) {
      window.open(videoUrl, '_blank');
    }
  };
  
  // Toggle debug info display
  const toggleDebug = () => {
    setShowDebug(!showDebug);
  };
  
  // Try playing with alternative format
  const tryAlternativeFormat = () => {
    const videoElement = videoRef.current;
    if (videoElement) {
      videoElement.innerHTML = '';
      
      // Try multiple sources with different MIME types
      const formats = [
        { type: 'video/mp4; codecs="avc1"' },
        { type: 'video/mp4' },
        { type: 'video/webm' }
      ];
      
      formats.forEach(format => {
        const source = document.createElement('source');
        source.src = videoUrl;
        source.type = format.type;
        videoElement.appendChild(source);
      });
      
      videoElement.load();
      
      setDebugInfo(prev => prev + `Tried alternative formats\n`);
    }
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
              <p className="text-sm text-gray-300 mb-2">
                S3 CORS error detected. Please use the Open Video button below.
              </p>
              <p className="text-xs text-red-300">
                To fix this permanently, you need to update your S3 bucket CORS settings.
              </p>
              <div className="mt-4 flex space-x-2 justify-center">
                <button 
                  onClick={handleDirectAccess}
                  className="px-4 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                >
                  Open Video
                </button>
                <button
                  onClick={tryAlternativeFormat}
                  className="px-4 py-2 bg-green-600 text-white text-sm rounded hover:bg-green-700"
                >
                  Try Fix
                </button>
                <button
                  onClick={toggleDebug}
                  className="px-4 py-2 bg-gray-600 text-white text-sm rounded hover:bg-gray-700"
                >
                  {showDebug ? 'Hide Details' : 'Show Details'}
                </button>
              </div>
              
              {showDebug && (
                <div className="mt-4 p-2 bg-gray-900 rounded text-xs text-left overflow-auto max-h-40">
                  <pre>{debugInfo}</pre>
                  <p className="mt-2 text-yellow-300">
                    Your S3 bucket needs CORS configuration to allow access from https://cyclofit.vercel.app
                  </p>
                </div>
              )}
            </div>
          </div>
        ) : (
          <>
            <video 
              ref={videoRef}
              className="w-full h-full" 
              controls
              controlsList="nodownload"
              autoPlay={false}
              preload="metadata"
              playsInline
              crossOrigin="anonymous"
            >
              <source src={videoUrl} type="video/mp4; codecs='avc1'" />
              <source src={videoUrl} type="video/mp4" />
              <source src={videoUrl} type="video/webm" />
              <p className="text-white text-center p-4">
                Your browser doesn't support HTML5 video.
              </p>
            </video>
            
            {/* Show the debug info button even when video seems to be working */}
            <div className="absolute bottom-2 right-2">
              <button 
                onClick={toggleDebug}
                className="px-2 py-1 bg-black bg-opacity-50 text-white text-xs rounded"
              >
                Debug
              </button>
            </div>
          </>
        )}
      </div>
      
      <div className="mt-1 flex justify-between text-sm text-gray-500">
        <div>Time: {formatTime(currentTime)} / {formatTime(duration)}</div>
        <div className="flex space-x-2">
          {onDownload && (
            <button
              onClick={onDownload}
              className="px-4 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
            >
              Download
            </button>
          )}
          <button
            onClick={handleDirectAccess}
            className="px-4 py-2 bg-gray-600 text-white text-sm rounded hover:bg-gray-700"
          >
            Open in New Tab
          </button>
          <a 
            href={videoUrl} 
            download="cyclofit-video.mp4"
            className="px-4 py-2 bg-green-600 text-white text-sm rounded hover:bg-green-700"
          >
            Download MP4
          </a>
        </div>
      </div>
      
      <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded text-sm">
        <p className="font-semibold text-yellow-700">S3 Configuration Required</p>
        <p className="text-yellow-600 mt-1">
          To fix video playback issues, add this CORS policy to your S3 bucket:
        </p>
        <pre className="mt-2 p-2 bg-gray-800 text-xs text-white rounded overflow-auto">
{`[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["GET"],
    "AllowedOrigins": ["https://cyclofit.vercel.app"],
    "ExposeHeaders": [],
    "MaxAgeSeconds": 3000
  }
]`}
        </pre>
      </div>
    </div>
  );
}

export default VideoPlayer; 