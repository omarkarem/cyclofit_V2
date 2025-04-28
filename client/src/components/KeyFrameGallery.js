import React from 'react';

function KeyFrameGallery({ keyFrameUrls, onGenerateVideo, isGeneratingVideo }) {
  return (
    <>
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-700 mb-2">Key Frames</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {keyFrameUrls.map((url, index) => (
            <div key={index} className="relative aspect-video bg-black rounded-lg overflow-hidden">
              <img src={url} alt={`Key frame ${index + 1}`} className="w-full h-full object-contain" />
            </div>
          ))}
        </div>
      </div>
      
      {onGenerateVideo && (
        <div className="mt-4">
          <button
            onClick={onGenerateVideo}
            disabled={isGeneratingVideo}
            className={`px-4 py-2 ${isGeneratingVideo ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700'} text-white rounded-md`}
          >
            {isGeneratingVideo ? 'Generating Video...' : 'Create Video from Key Frames'}
          </button>
        </div>
      )}
    </>
  );
}

export default KeyFrameGallery; 