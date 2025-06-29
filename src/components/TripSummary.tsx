import React from 'react';
import { VehicleData } from '../services/carEmissions';

interface TripSummaryProps {
  vehicleData: VehicleData;
  startLocation: string;
  endLocation: string;
  distance: number;
  duration: number;
  co2Emission: number;
  routeSteps: {
    distance: number;
    duration: number;
    instruction: string;
  }[];
  onSubmit: () => void;
  onCancel: () => void;
}

export const TripSummary: React.FC<TripSummaryProps> = ({
  vehicleData,
  startLocation,
  endLocation,
  distance,
  duration,
  co2Emission,
  routeSteps,
  onSubmit,
  onCancel,
}) => {
  const formatDuration = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = Math.round(minutes % 60);
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  const formatDistance = (miles: number): string => {
    return `${miles.toFixed(1)} mi`;
  };

  return (
    <div className="bg-white rounded-lg shadow p-6 space-y-6">
      {/* Trip Overview */}
      <div>
        <h3 className="text-xl font-semibold text-gray-900 mb-4">Trip Summary</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm text-gray-500">Route</p>
            <p className="text-sm font-medium text-gray-900">{startLocation}</p>
            <p className="text-sm font-medium text-gray-900">→</p>
            <p className="text-sm font-medium text-gray-900">{endLocation}</p>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm text-gray-500">Vehicle</p>
            <p className="text-sm font-medium text-gray-900">
              {vehicleData.year} {vehicleData.make} {vehicleData.model}
            </p>
          </div>
        </div>
      </div>

      {/* Trip Details */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gray-50 p-4 rounded-lg">
          <p className="text-sm text-gray-500">Distance</p>
          <p className="text-lg font-semibold text-gray-900">
            {formatDistance(distance)}
          </p>
        </div>
        <div className="bg-gray-50 p-4 rounded-lg">
          <p className="text-sm text-gray-500">Duration</p>
          <p className="text-lg font-semibold text-gray-900">
            {formatDuration(duration)}
          </p>
        </div>
        <div className="bg-gray-50 p-4 rounded-lg">
          <p className="text-sm text-gray-500">CO2 Emissions</p>
          <p className="text-lg font-semibold text-gray-900">
            {co2Emission.toFixed(1)} g
          </p>
        </div>
      </div>

      {/* Route Steps */}
      <div>
        <h4 className="text-sm font-medium text-gray-500 mb-3">Route Details</h4>
        <div className="space-y-2">
          {routeSteps.map((step, index) => (
            <div key={index} className="bg-gray-50 p-3 rounded-lg">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <p className="text-sm text-gray-900" dangerouslySetInnerHTML={{ __html: step.instruction }} />
                </div>
                <div className="text-right ml-4">
                  <p className="text-xs text-gray-500">{formatDistance(step.distance)}</p>
                  <p className="text-xs text-gray-500">{formatDuration(step.duration)}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-between pt-4">
        <button
          onClick={onCancel}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          onClick={onSubmit}
          className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700"
        >
          Submit Trip
        </button>
      </div>
    </div>
  );
}; 