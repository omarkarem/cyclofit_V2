import React from 'react';

function BodyMeasurements({ bodyLengths }) {
  // Default to empty object if bodyLengths is not provided
  const measurements = bodyLengths || {};
  
  return (
    <div>
      <h3 className="text-lg font-semibold text-gray-700 mb-2">Your Body Measurements</h3>
      <div className="grid grid-cols-2 gap-4 bg-gray-50 rounded-lg p-4">
        {Object.entries(measurements)
          .filter(([key]) => 
            key !== 'measurement_method' && 
            key !== 'visible_side' && 
            typeof measurements[key] === 'number')
          .map(([key, value]) => (
            <div key={key} className="text-sm">
              <span className="font-medium text-gray-700">{key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}: </span>
              <span>{typeof value === 'number' ? `${value.toFixed(1)} cm` : value}</span>
            </div>
          ))}
      </div>
      {measurements.measurement_method && (
        <div className="mt-2 text-xs text-gray-500">
          Method: {measurements.measurement_method}
        </div>
      )}
    </div>
  );
}

export default BodyMeasurements; 