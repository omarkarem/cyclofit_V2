import React, { useRef, useEffect, useState } from 'react';

function UploadForm({ 
  file, 
  height, 
  quality, 
  bikeType, 
  loading, 
  error, 
  setFile, 
  setHeight, 
  setBikeType, 
  setQuality, 
  handleSubmit 
}) {
  const fileInputRef = useRef(null);
  const [initialHeight, setInitialHeight] = useState('');
  
  // Store the initial height value that came from the profile
  useEffect(() => {
    if (height && !initialHeight) {
      setInitialHeight(height);
    }
  }, [height, initialHeight]);
  
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      // Check if file is a video
      if (!selectedFile.type.startsWith('video/') && selectedFile.name.toLowerCase().endsWith('.mov') === false) {
        setFile(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
        return;
      }
      
      setFile(selectedFile);
    }
  };

  // We're no longer allowing height changes if it comes from the profile
  const handleHeightChange = (e) => {
    // Only do this if there is no initialHeight (profile height)
    if (!initialHeight) {
      const value = e.target.value;
      // Only allow numeric input
      if (value === '' || /^\d+(\.\d*)?$/.test(value)) {
        setHeight(value);
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label htmlFor="video" className="block text-sm font-medium text-secondary mb-1">
          Upload Video
        </label>
        <input
          type="file"
          accept="video/*"
          id="video"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="block w-full text-sm text-secondary
            file:mr-4 file:py-2 file:px-4
            file:rounded-md file:border-0
            file:text-sm file:font-semibold
            file:bg-primary file:bg-opacity-10 file:text-primary
            hover:file:bg-accent hover:file:text-dark"
        />
      </div>
      
      <div>
        <label htmlFor="height" className="block text-sm font-medium text-secondary mb-1">
          Your Height (cm)
        </label>
        <div className="relative">
          {initialHeight ? (
            <div className="mt-1 w-full px-3 py-2 bg-secondary bg-opacity-5 border border-secondary border-opacity-20 rounded-md text-dark flex items-center">
              <span>{initialHeight} cm</span>
              <span className="ml-2 text-xs text-primary">✓ Using height from your profile</span>
            </div>
          ) : (
            <input
              type="text"
              id="height"
              value={height}
              onChange={handleHeightChange}
              placeholder="Enter your height in cm"
              className="mt-1 block w-full px-3 py-2 border border-secondary border-opacity-30 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
            />
          )}
        </div>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-secondary mb-2">
          Choose Bike Type
        </label>
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex items-center">
            <input
              id="bike-road"
              name="bike-type"
              type="radio"
              checked={bikeType === 'road'}
              onChange={() => setBikeType('road')}
              className="h-4 w-4 text-primary border-secondary border-opacity-30 focus:ring-primary"
            />
            <label htmlFor="bike-road" className="ml-2 block text-sm text-secondary">
              Road Bike
            </label>
          </div>
          
          <div className="flex items-center">
            <input
              id="bike-tt"
              name="bike-type"
              type="radio"
              checked={bikeType === 'tt'}
              onChange={() => setBikeType('tt')}
              className="h-4 w-4 text-primary border-secondary border-opacity-30 focus:ring-primary"
            />
            <label htmlFor="bike-tt" className="ml-2 block text-sm text-secondary">
              Time Trial Bike
            </label>
          </div>
        </div>
      </div>
      
      <div>
        <label htmlFor="quality" className="block text-sm font-medium text-secondary mb-1">
          Video Quality: {quality}%
        </label>
        <input
          type="range"
          id="quality"
          min="10"
          max="100"
          value={quality}
          onChange={(e) => setQuality(parseInt(e.target.value))}
          className="w-full h-2 bg-secondary bg-opacity-20 rounded-lg appearance-none cursor-pointer"
        />
        <div className="flex justify-between text-xs text-secondary">
          <span>Lower (Faster)</span>
          <span>Higher (Slower)</span>
        </div>
      </div>
      
      {error && (
        <div className="text-red-600 text-sm font-medium py-2">{error}</div>
      )}
      
      <button
        type="submit"
        disabled={loading}
        className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium ${
          loading ? 'bg-primary bg-opacity-60 text-white' : 'bg-primary hover:bg-accent text-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary'
        }`}
      >
        {loading ? 'Processing...' : 'Analyze Cycling Position'}
      </button>
    </form>
  );
}

export default UploadForm; 