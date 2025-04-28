import React from 'react';

function JointAngles({ maxAngles, minAngles }) {
  return (
    <div className="bg-gray-50 rounded-lg p-4 mb-6">
      <h3 className="text-lg font-semibold text-gray-700 mb-2">Joint Angles</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <h4 className="font-medium text-gray-600 mb-1">Maximum Angles</h4>
          <ul className="space-y-1 text-sm">
            {Object.entries(maxAngles).map(([key, value]) => (
              <li key={key}>
                <span className="font-medium">{key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}: </span>
                {value}°
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h4 className="font-medium text-gray-600 mb-1">Minimum Angles</h4>
          <ul className="space-y-1 text-sm">
            {Object.entries(minAngles).map(([key, value]) => (
              <li key={key}>
                <span className="font-medium">{key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}: </span>
                {value}°
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

export default JointAngles; 