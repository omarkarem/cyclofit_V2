import React from 'react';

function LoadingIndicator() {
  return (
    <div className="flex flex-col items-center justify-center mt-8">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      <p className="mt-4 text-dark">Analyzing your cycling position...</p>
      <p className="text-sm text-secondary">This may take a minute depending on video length</p>
    </div>
  );
}

export default LoadingIndicator; 