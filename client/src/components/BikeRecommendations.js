import React from 'react';

function BikeRecommendations({ recommendations, bikeType, setBikeType }) {
  // Check if recommendations is undefined or null
  if (!recommendations) {
    return (
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-700 mb-2">Bike Fit Recommendations</h3>
        <div className="flex space-x-4 mb-4">
          <button
            onClick={() => setBikeType('road')}
            className={`px-4 py-2 rounded-md ${
              bikeType === 'road' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Road Bike
          </button>
          <button
            onClick={() => setBikeType('tt')}
            className={`px-4 py-2 rounded-md ${
              bikeType === 'tt' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Time Trial Bike
          </button>
        </div>
        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-md">
          <p className="text-yellow-700">No bike fit recommendations available for this analysis.</p>
        </div>
      </div>
    );
  }

  // Create default empty structure if any of the expected properties are missing
  const safeRecommendations = {
    general: recommendations.general || [],
    road_bike: {
      endurance: recommendations.road_bike?.endurance || [],
      aggressive: recommendations.road_bike?.aggressive || []
    },
    time_trial: recommendations.time_trial || []
  };

  // Function to render a recommendation item
  const renderRecommendation = (rec, index) => {
    // Handle both string recommendations (old format) and object recommendations (new format)
    if (typeof rec === 'string') {
      return <li key={index} className="text-gray-700">{rec}</li>;
    }
    
    // Handle object-based recommendation (new format)
    const priorityColors = {
      high: 'text-red-600 font-medium',
      medium: 'text-orange-500',
      low: 'text-gray-600'
    };
    
    return (
      <li key={index} className="pb-3 mb-3 border-b border-gray-200 last:border-0">
        <div className="flex flex-col">
          <div className="flex justify-between items-start mb-1">
            <span className="font-semibold text-gray-800">
              {rec.component}
            </span>
            <span className={`text-sm px-2 py-0.5 rounded-full ${
              rec.priority === 'high' 
                ? 'bg-red-100 text-red-700' 
                : rec.priority === 'medium'
                  ? 'bg-orange-100 text-orange-700'
                  : 'bg-gray-100 text-gray-700'
            }`}>
              {rec.priority === 'high' ? 'High Priority' : 
               rec.priority === 'medium' ? 'Medium Priority' : 
               'Low Priority'}
            </span>
          </div>
          <p className="text-gray-700">{rec.issue}</p>
          <div className="flex flex-wrap mt-1">
            <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded mr-2 mt-1 text-sm">
              <strong>Action:</strong> {rec.action}
            </span>
            {rec.current && (
              <span className="bg-gray-50 text-gray-700 px-2 py-1 rounded mr-2 mt-1 text-sm">
                <strong>Current:</strong> {rec.current}
              </span>
            )}
            {rec.target && (
              <span className="bg-green-50 text-green-700 px-2 py-1 rounded mt-1 text-sm">
                <strong>Target:</strong> {rec.target}
              </span>
            )}
          </div>
        </div>
      </li>
    );
  };

  return (
    <div className="mb-6">
      <h3 className="text-lg font-semibold text-gray-700 mb-2">Bike Fit Recommendations</h3>
      <div className="flex space-x-4 mb-4">
        <button
          onClick={() => setBikeType('road')}
          className={`px-4 py-2 rounded-md ${
            bikeType === 'road' 
              ? 'bg-blue-600 text-white' 
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Road Bike
        </button>
        <button
          onClick={() => setBikeType('tt')}
          className={`px-4 py-2 rounded-md ${
            bikeType === 'tt' 
              ? 'bg-blue-600 text-white' 
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Time Trial Bike
        </button>
      </div>
    
      {/* General Recommendations */}
      <div className="mb-6">
        <h4 className="font-medium text-gray-800 mb-2 border-l-4 border-blue-600 pl-2">General Recommendations</h4>
        <ul className="space-y-2 pl-2">
          {safeRecommendations.general.length > 0 ? (
            safeRecommendations.general.map((rec, index) => renderRecommendation(rec, index))
          ) : (
            <li className="text-gray-500 italic">No general recommendations available</li>
          )}
        </ul>
      </div>

      {/* Bike-specific recommendations based on selected type */}
      {bikeType === 'road' && (
        <>
          {/* Road Bike - Endurance */}
          <div className="mb-6">
            <h4 className="font-medium text-gray-800 mb-2 border-l-4 border-green-600 pl-2">Road Bike - Endurance Position</h4>
            <ul className="space-y-2 pl-2">
              {safeRecommendations.road_bike.endurance?.length > 0 ? 
                safeRecommendations.road_bike.endurance.map((rec, index) => renderRecommendation(rec, index)) : 
                <li className="text-gray-500 italic">No specific endurance recommendations</li>
              }
            </ul>
          </div>
          
          {/* Road Bike - Aggressive */}
          <div className="mb-6">
            <h4 className="font-medium text-gray-800 mb-2 border-l-4 border-red-600 pl-2">Road Bike - Aggressive Position</h4>
            <ul className="space-y-2 pl-2">
              {safeRecommendations.road_bike.aggressive?.length > 0 ? 
                safeRecommendations.road_bike.aggressive.map((rec, index) => renderRecommendation(rec, index)) : 
                <li className="text-gray-500 italic">No specific aggressive racing recommendations</li>
              }
            </ul>
          </div>
        </>
      )}

      {/* Time Trial recommendations when TT is selected */}
      {bikeType === 'tt' && (
        <div className="mb-6">
          <h4 className="font-medium text-gray-800 mb-2 border-l-4 border-purple-600 pl-2">Time Trial Bike Position</h4>
          <ul className="space-y-2 pl-2">
            {safeRecommendations.time_trial?.length > 0 ? 
              safeRecommendations.time_trial.map((rec, index) => renderRecommendation(rec, index)) : 
              <li className="text-gray-500 italic">No specific time trial recommendations</li>
            }
          </ul>
        </div>
      )}
    </div>
  );
}

export default BikeRecommendations; 