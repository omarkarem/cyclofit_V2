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
  const [useIframe, setUseIframe] = useState(false);
  
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
  }, [videoUrl]);
  
  useEffect(() => {
    if (useIframe) return; // Skip this effect if using iframe
    
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
      setDebugInfo(prev => prev + `CORS issue detected. Trying iframe fallback.\n`);
      
      // Automatically switch to iframe on error
      setUseIframe(true);
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
  }, [videoUrl, useIframe]);
  
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
  
  // Toggle between iframe and video element
  const toggleIframe = () => {
    setUseIframe(!useIframe);
    setLoading(true);
    setTimeout(() => setLoading(false), 1000);
  };
  
  // Render video content
  const renderVideoContent = () => {
    if (useIframe) {
      return (
        <div className="relative w-full h-full">
          <iframe 
            src={videoUrl}
            className="absolute inset-0 w-full h-full" 
            frameBorder="0"
            allowFullScreen
            title="Video Player"
            onLoad={() => setLoading(false)}
          />
        </div>
      );
    } else {
      return (
        <video 
          ref={videoRef}
          className="w-full h-full" 
          controls
          controlsList="nodownload"
          autoPlay={false}
          preload="metadata"
          playsInline
        >
          <source src={videoUrl} type="video/mp4; codecs='avc1'" />
          <source src={videoUrl} type="video/mp4" />
          <source src={videoUrl} type="video/webm" />
          <p className="text-white text-center p-4">
            Your browser doesn't support HTML5 video.
          </p>
        </video>
      );
    }
  };
  
  return (
    <div className="mb-6">
      <h3 className="text-lg font-semibold text-gray-700 mb-2">{title || 'Processed Video'}</h3>
      
      <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50 z-10">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        )}
        
        {error && !useIframe ? (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-800 text-white p-4 text-center z-10">
            <div>
              <p className="mb-2">{error}</p>
              <p className="text-sm text-gray-300 mb-2">
                Trying alternative display method...
              </p>
              <div className="mt-4 flex space-x-2 justify-center">
                <button 
                  onClick={toggleIframe}
                  className="px-4 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                >
                  Try Iframe Mode
                </button>
                <button 
                  onClick={handleDirectAccess}
                  className="px-4 py-2 bg-green-600 text-white text-sm rounded hover:bg-green-700"
                >
                  Open Video
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
                </div>
              )}
            </div>
          </div>
        ) : (
          <>
            {renderVideoContent()}
            
            {/* Show the debug info button even when video seems to be working */}
            <div className="absolute bottom-2 right-2 z-10">
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
          <button
            onClick={toggleIframe}
            className={`px-4 py-2 text-white text-sm rounded ${useIframe ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-600 hover:bg-gray-700'}`}
          >
            {useIframe ? 'Use Video Player' : 'Use Iframe'}
          </button>
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
        <p className="font-semibold text-yellow-700">Still having trouble?</p>
        <ol className="text-yellow-600 mt-1 list-decimal pl-5">
          <li>Try the "Use Iframe" button which often bypasses CORS issues</li>
          <li>Use the "Open in New Tab" button to view the video directly</li>
          <li>Download the video with the "Download MP4" button</li>
          <li>Try clearing your browser cache (Ctrl+F5 or Cmd+Shift+R)</li>
          <li>Make sure your S3 CORS settings are exactly as shown below:</li>
        </ol>
        <pre className="mt-2 p-2 bg-gray-800 text-xs text-white rounded overflow-auto">
{`[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["GET", "HEAD"],
    "AllowedOrigins": ["https://cyclofit.vercel.app"],
    "ExposeHeaders": ["ETag", "Content-Length"],
    "MaxAgeSeconds": 3000
  }
]`}
        </pre>
      </div>
    </div>
  );
}

export default VideoPlayer; 