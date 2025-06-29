import React, { useState, useEffect } from 'react';
import { VehicleData } from '../services/carEmissions';
import { carEmissionsService } from '../services/carEmissions';

interface VehicleInfoProps {
  vehicleData: VehicleData;
}

export const VehicleInfo: React.FC<VehicleInfoProps> = ({ vehicleData }) => {
  const [ecoScore, setEcoScore] = useState<{
    smogScore: number;
    smartwayScore: number;
    emissionStandard: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Debug logging
  console.log('VehicleInfo received data:', vehicleData);
  console.log('co2TailpipeGpm type:', typeof vehicleData.co2TailpipeGpm, 'value:', vehicleData.co2TailpipeGpm);

  // Check if we have valid vehicle data
  const hasValidData = vehicleData && 
    vehicleData.make && 
    vehicleData.model && 
    vehicleData.year &&
    typeof vehicleData.comb08 === 'number' && 
    vehicleData.comb08 > 0;

  useEffect(() => {
    const fetchEcoScore = async () => {
      if (!hasValidData) {
        setLoading(false);
        return;
      }
      
      try {
        const score = await carEmissionsService.getEcoScore(vehicleData.id);
        setEcoScore(score);
      } catch (err) {
        console.error('Error fetching eco score:', err);
        setError('Failed to load eco score');
      } finally {
        setLoading(false);
      }
    };

    fetchEcoScore();
  }, [vehicleData.id, hasValidData]);

  const getSmartwayLabel = (score: number) => {
    switch (score) {
      case 1:
        return 'SmartWay';
      case 2:
        return 'SmartWay Elite';
      default:
        return 'Not SmartWay Certified';
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
        </div>
      </div>
    );
  }

  if (!hasValidData) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-yellow-800">
              Vehicle Information Not Available
            </h3>
            <div className="mt-2 text-sm text-yellow-700">
              <p>
                Detailed information for this vehicle is not available in our database. 
                We'll use average car emissions (25 MPG) for carbon footprint calculations.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !ecoScore) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">
          {vehicleData.year} {vehicleData.make} {vehicleData.model}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Fuel Economy */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-gray-500">Fuel Economy</h4>
            <div className="grid grid-cols-3 gap-2">
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-sm text-gray-500">City</p>
                <p className="text-lg font-semibold text-gray-900">
                  {typeof vehicleData.city08 === 'number' ? vehicleData.city08 : 'N/A'} MPG
                </p>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-sm text-gray-500">Highway</p>
                <p className="text-lg font-semibold text-gray-900">
                  {typeof vehicleData.hwy08 === 'number' ? vehicleData.hwy08 : 'N/A'} MPG
                </p>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-sm text-gray-500">Combined</p>
                <p className="text-lg font-semibold text-gray-900">
                  {typeof vehicleData.comb08 === 'number' ? vehicleData.comb08 : 'N/A'} MPG
                </p>
              </div>
            </div>
          </div>

          {/* Emissions */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-gray-500">Emissions</h4>
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-sm text-gray-500">CO2 per Mile</p>
                <p className="text-lg font-semibold text-gray-900">
                  {typeof vehicleData.co2TailpipeGpm === 'number' 
                    ? vehicleData.co2TailpipeGpm.toFixed(1) 
                    : 'N/A'} g/mi
                </p>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-sm text-gray-500">Fuel Type</p>
                <p className="text-sm font-medium text-gray-900">
                  {vehicleData.fuelType1}
                  {vehicleData.fuelType2 ? ` / ${vehicleData.fuelType2}` : ''}
                </p>
              </div>
            </div>
          </div>
        </div>
        
        {error && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6 space-y-4">
      <h3 className="text-xl font-semibold text-gray-900">
        {vehicleData.year} {vehicleData.make} {vehicleData.model}
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Fuel Economy */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-500">Fuel Economy</h4>
          <div className="grid grid-cols-3 gap-2">
            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="text-sm text-gray-500">City</p>
              <p className="text-lg font-semibold text-gray-900">
                {typeof vehicleData.city08 === 'number' ? vehicleData.city08 : 'N/A'} MPG
              </p>
            </div>
            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="text-sm text-gray-500">Highway</p>
              <p className="text-lg font-semibold text-gray-900">
                {typeof vehicleData.hwy08 === 'number' ? vehicleData.hwy08 : 'N/A'} MPG
              </p>
            </div>
            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="text-sm text-gray-500">Combined</p>
              <p className="text-lg font-semibold text-gray-900">
                {typeof vehicleData.comb08 === 'number' ? vehicleData.comb08 : 'N/A'} MPG
              </p>
            </div>
          </div>
        </div>

        {/* Emissions */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-500">Emissions</h4>
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="text-sm text-gray-500">CO2 per Mile</p>
              <p className="text-lg font-semibold text-gray-900">
                {typeof vehicleData.co2TailpipeGpm === 'number' 
                  ? vehicleData.co2TailpipeGpm.toFixed(1) 
                  : 'N/A'} g/mi
              </p>
            </div>
            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="text-sm text-gray-500">Smog Rating</p>
              <div className="flex items-center space-x-2">
                <div className="flex">
                  {[...Array(10)].map((_, i) => (
                    <div
                      key={i}
                      className={`w-2 h-2 rounded-full mx-0.5 ${
                        i < ecoScore.smogScore ? 'bg-green-500' : 'bg-gray-200'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-sm text-gray-500">({ecoScore.smogScore}/10)</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Additional Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-gray-50 p-3 rounded-lg">
          <p className="text-sm text-gray-500">Fuel Type</p>
          <p className="text-sm font-medium text-gray-900">
            {vehicleData.fuelType1}
            {vehicleData.fuelType2 ? ` / ${vehicleData.fuelType2}` : ''}
          </p>
        </div>
        <div className="bg-gray-50 p-3 rounded-lg">
          <p className="text-sm text-gray-500">SmartWay Rating</p>
          <p className="text-sm font-medium text-gray-900">
            {getSmartwayLabel(ecoScore.smartwayScore)}
          </p>
        </div>
      </div>

      {/* Emission Standard */}
      <div className="bg-gray-50 p-3 rounded-lg">
        <p className="text-sm text-gray-500">Emission Standard</p>
        <p className="text-sm font-medium text-gray-900">{ecoScore.emissionStandard}</p>
      </div>
    </div>
  );
};