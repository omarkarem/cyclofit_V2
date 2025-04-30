import React, { useState } from 'react';

// Format time in seconds to MM:SS format
const formatTime = (seconds) => {
  if (!seconds) return '00:00';
  
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  
  return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
};

function VideoPlayer({ videoUrl, onDownload, title }) {
  const [currentTime] = useState(0);
  const [duration] = useState(0);
  
  // Open video in new tab
  const handleOpenVideo = () => {
    if (videoUrl) {
      window.open(videoUrl, '_blank');
    }
  };
  
  return (
    <div className="mb-6">
      <h3 className="text-lg font-semibold text-gray-700 mb-2">{title || 'Processed Video'}</h3>
      
      <div className="flex flex-col items-center justify-center bg-gray-100 rounded-lg p-6">
        <p className="text-gray-700 mb-4">
          Your video is ready and available for viewing, but can't be displayed directly on this page.
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
        
        <div className="text-sm text-gray-500">
          Time: {formatTime(currentTime)} / {formatTime(duration)}
        </div>
      </div>
    </div>
  );
}

export default VideoPlayer; 