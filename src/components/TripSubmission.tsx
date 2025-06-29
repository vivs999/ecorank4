import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { CarbonFootprintSubmission } from '../types';
import { CarSelection } from './CarSelection';
import { VehicleInfo } from './VehicleInfo';
import { TripSummary } from './TripSummary';
import MapsService from '../lib/mapsservice';
import { VehicleData } from '../services/carEmissions';

interface TripSubmissionProps {
  onSubmit: (submission: CarbonFootprintSubmission) => Promise<void>;
}

const TripSubmission: React.FC<TripSubmissionProps> = ({ onSubmit }) => {
  const { submitCarbonFootprint } = useApp();
  const navigate = useNavigate();
  const [step, setStep] = useState<'vehicle' | 'route' | 'summary'>('vehicle');
  const [vehicleData, setVehicleData] = useState<VehicleData | null>(null);
  const [startLocation, setStartLocation] = useState('');
  const [endLocation, setEndLocation] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tripData, setTripData] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleVehicleSelect = (data: VehicleData) => {
    setVehicleData(data);
    setStep('route');
  };

  const handleRouteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!vehicleData) return;

    setIsLoading(true);
    setError(null);

    try {
      const mapsService = MapsService.getInstance();
      const directions = await mapsService.getDirections(startLocation, endLocation);
      const route = directions.routes[0].legs[0];

      const co2Emission = vehicleData.co2TailpipeGpm * (route.distance?.value || 0) / 1000; // Convert to miles

      const data = {
        vehicleData,
        startLocation,
        endLocation,
        distance: route.distance?.value || 0,
        duration: route.duration?.value || 0,
        co2Emission,
        routeSteps: route.steps,
      };

      setTripData(data);
      setStep('summary');
    } catch (err) {
      setError('Failed to calculate route. Please check your locations and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSummarySubmit = async () => {
    if (tripData) {
      try {
        setIsSubmitting(true);
        setError(null);
        
        const submission: CarbonFootprintSubmission = {
          ...tripData,
          co2Emission: tripData.co2Emission,
          routeSteps: tripData.routeSteps,
        };
        
        if (onSubmit) {
          await onSubmit(submission);
        } else {
          await submitCarbonFootprint(submission);
        }
        
        navigate('/dashboard');
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to submit trip');
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleCancel = () => {
    setStep('route');
  };

  return (
    <div className="max-w-2xl mx-auto">
      {step === 'vehicle' ? (
        <CarSelection onSelect={handleVehicleSelect} />
      ) : step === 'route' ? (
        <form onSubmit={handleRouteSubmit} className="space-y-6">
          {vehicleData && (
            <div className="mb-6">
              <VehicleInfo vehicleData={vehicleData} />
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label
                htmlFor="startLocation"
                className="block text-sm font-medium text-gray-700"
              >
                Start Location
              </label>
              <input
                type="text"
                id="startLocation"
                value={startLocation}
                onChange={(e) => setStartLocation(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                placeholder="Enter start location (e.g., 123 Main St, City, State)"
                required
              />
            </div>

            <div>
              <label
                htmlFor="endLocation"
                className="block text-sm font-medium text-gray-700"
              >
                End Location
              </label>
              <input
                type="text"
                id="endLocation"
                value={endLocation}
                onChange={(e) => setEndLocation(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                placeholder="Enter end location (e.g., 456 Oak Ave, City, State)"
                required
              />
            </div>
          </div>

          {error && (
            <div className="text-red-600 text-sm">{error}</div>
          )}

          <div className="flex justify-between">
            <button
              type="button"
              onClick={() => setStep('vehicle')}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Back
            </button>
            <button
              type="submit"
              disabled={isLoading || isSubmitting}
              className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 disabled:opacity-50"
            >
              {isLoading ? 'Calculating Route...' : isSubmitting ? 'Submitting...' : 'Calculate Emissions'}
            </button>
          </div>
        </form>
      ) : (
        tripData && (
          <TripSummary
            {...tripData}
            onSubmit={handleSummarySubmit}
            onCancel={handleCancel}
          />
        )
      )}
    </div>
  );
};

export default TripSubmission; 