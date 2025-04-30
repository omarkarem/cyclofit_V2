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
  const [debugInfo, setDebugInfo] = useState("");
  const [showDebug, setShowDebug] = useState(false);
  const [directUrl, setDirectUrl] = useState(null);
  
  // Handle video URL processing when it changes
  useEffect(() => {
    // Reset states when URL changes
    setLoading(true);
    setError(null);
    setFallbackUrl(null);
    setDirectUrl(videoUrl); // Store the original URL for direct access
    
    if (!videoUrl) {
      setError("No video URL provided");
      setLoading(false);
      return;
    }
    
    // Log the original URL for debugging
    console.log("Original video URL:", videoUrl);
    setDebugInfo(prev => prev + `Original URL: ${videoUrl}\n`);
    
    // Check URL content type with a HEAD request first
    if (videoUrl && videoUrl.startsWith('http')) {
      // First check the content type with a HEAD request
      fetch(videoUrl, { method: 'HEAD' })
        .then(response => {
          const contentType = response.headers.get('content-type');
          console.log("Content-Type from HEAD:", contentType);
          setDebugInfo(prev => prev + `Content-Type: ${contentType || 'unknown'}\n`);
          
          // Now fetch the actual content
          return fetch(videoUrl);
        })
        .then(response => {
          if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
          }
          
          const contentType = response.headers.get('content-type');
          console.log("Content-Type from GET:", contentType);
          setDebugInfo(prev => prev + `GET Content-Type: ${contentType || 'unknown'}\n`);
          
          return response.blob();
        })
        .then(blob => {
          console.log("Blob received:", blob.type, blob.size);
          setDebugInfo(prev => prev + `Blob: ${blob.type}, size: ${blob.size}\n`);
          
          // Create a new blob with explicit video/mp4 MIME type - IMPORTANT FOR DESKTOP BROWSERS
          const videoBlob = new Blob([blob], { type: 'video/mp4' });
          console.log("Created new blob with video/mp4 type:", videoBlob.type);
          setDebugInfo(prev => prev + `Created new blob with video/mp4 type\n`);
          
          const localBlobUrl = URL.createObjectURL(videoBlob);
          console.log("Created blob URL:", localBlobUrl);
          setDebugInfo(prev => prev + `Blob URL: ${localBlobUrl}\n`);
          
          setFallbackUrl(localBlobUrl);
        })
        .catch(err => {
          console.error('Error fetching video:', err);
          setDebugInfo(prev => prev + `Error: ${err.message}\n`);
          // Continue without fallback, will use direct URL
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
      console.log("Video metadata loaded:", videoElement.videoWidth, "x", videoElement.videoHeight);
      setDebugInfo(prev => prev + `Video loaded: ${videoElement.videoWidth}x${videoElement.videoHeight}\n`);
    };
    
    const handleError = (e) => {
      console.error('Video error:', e);
      const errorMessage = e.target.error ? e.target.error.message : 'Unknown error';
      setError(`Error loading video: ${errorMessage}`);
      setLoading(false);
      setDebugInfo(prev => prev + `Video error: ${errorMessage}\n`);
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
  }, [videoUrl, fallbackUrl]);
  
  // Determine the actual URL to use (fallback or original)
  const effectiveUrl = fallbackUrl || videoUrl;
  
  // Handle direct URL download
  const handleDirectDownload = () => {
    if (directUrl) {
      window.open(directUrl, '_blank');
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
      // Force reload with different MIME type
      videoElement.innerHTML = '';
      const source1 = document.createElement('source');
      source1.src = effectiveUrl;
      source1.type = 'video/mp4; codecs="avc1"';
      
      const source2 = document.createElement('source');
      source2.src = effectiveUrl;
      source2.type = 'video/webm';
      
      const source3 = document.createElement('source');
      source3.src = effectiveUrl;
      source3.type = 'video/quicktime';
      
      videoElement.appendChild(source1);
      videoElement.appendChild(source2);
      videoElement.appendChild(source3);
      videoElement.load();
      
      setDebugInfo(prev => prev + `Tried alternative formats\n`);
    }
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
                The video couldn't be played in your browser.
              </p>
              <div className="mt-4 flex space-x-2 justify-center">
                <button 
                  onClick={handleDirectDownload}
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
            >
              <source src={effectiveUrl} type="video/mp4; codecs='avc1'" />
              <source src={effectiveUrl} type="video/mp4" />
              <source src={effectiveUrl} type="video/webm" />
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
            onClick={handleDirectDownload}
            className="px-4 py-2 bg-gray-600 text-white text-sm rounded hover:bg-gray-700"
          >
            Open in New Tab
          </button>
        </div>
      </div>
    </div>
  );
}

export default VideoPlayer; 