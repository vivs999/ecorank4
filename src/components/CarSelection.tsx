import React, { useState, useEffect } from 'react';
import { carEmissionsService } from '../services/carEmissions';
import { VehicleMenu, VehicleData } from '../services/carEmissions';

interface CarSelectionProps {
  onSelect: (vehicleData: VehicleData) => void;
}

export const CarSelection: React.FC<CarSelectionProps> = ({ onSelect }) => {
  const [years, setYears] = useState<VehicleMenu[]>([]);
  const [makes, setMakes] = useState<VehicleMenu[]>([]);
  const [models, setModels] = useState<VehicleMenu[]>([]);
  const [options, setOptions] = useState<VehicleMenu[]>([]);
  
  const [selectedYear, setSelectedYear] = useState<string>('');
  const [selectedMake, setSelectedMake] = useState<string>('');
  const [selectedModel, setSelectedModel] = useState<string>('');
  const [selectedOption, setSelectedOption] = useState<string>('');
  
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch available years on component mount
  useEffect(() => {
    const fetchYears = async () => {
      try {
        const yearsData = await carEmissionsService.getYears();
        console.log('Years data:', yearsData);
        setYears(Array.isArray(yearsData) ? yearsData : []);
      } catch (err) {
        console.error('Error fetching years:', err);
        setError('Failed to load years');
      }
    };
    fetchYears();
  }, []);

  // Fetch makes when year is selected
  useEffect(() => {
    if (selectedYear) {
      const fetchMakes = async () => {
        setLoading(true);
        try {
          const makesData = await carEmissionsService.getMakes(selectedYear);
          console.log('Makes data:', makesData);
          setMakes(Array.isArray(makesData) ? makesData : []);
          setSelectedMake('');
          setSelectedModel('');
          setSelectedOption('');
        } catch (err) {
          console.error('Error fetching makes:', err);
          setError('Failed to load makes');
        } finally {
          setLoading(false);
        }
      };
      fetchMakes();
    }
  }, [selectedYear]);

  // Fetch models when make is selected
  useEffect(() => {
    if (selectedYear && selectedMake) {
      const fetchModels = async () => {
        setLoading(true);
        try {
          const modelsData = await carEmissionsService.getModels(selectedYear, selectedMake);
          console.log('Models data:', modelsData);
          setModels(Array.isArray(modelsData) ? modelsData : []);
          setSelectedModel('');
          setSelectedOption('');
        } catch (err) {
          console.error('Error fetching models:', err);
          setError('Failed to load models');
        } finally {
          setLoading(false);
        }
      };
      fetchModels();
    }
  }, [selectedYear, selectedMake]);

  // Fetch options when model is selected
  useEffect(() => {
    if (selectedYear && selectedMake && selectedModel) {
      const fetchOptions = async () => {
        setLoading(true);
        try {
          const optionsData = await carEmissionsService.getOptions(selectedYear, selectedMake, selectedModel);
          console.log('Options data:', optionsData);
          setOptions(Array.isArray(optionsData) ? optionsData : []);
          setSelectedOption('');
        } catch (err) {
          console.error('Error fetching options:', err);
          setError('Failed to load options');
        } finally {
          setLoading(false);
        }
      };
      fetchOptions();
    }
  }, [selectedYear, selectedMake, selectedModel]);

  // Handle final selection
  useEffect(() => {
    if (selectedOption) {
      const fetchVehicleData = async () => {
        setLoading(true);
        try {
          const vehicleData = await carEmissionsService.getVehicleData(selectedOption);
          onSelect(vehicleData);
        } catch (err) {
          setError('Failed to load vehicle data');
        } finally {
          setLoading(false);
        }
      };
      fetchVehicleData();
    }
  }, [selectedOption, onSelect]);

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
        <p className="text-red-600">{error}</p>
        <button 
          onClick={() => setError(null)}
          className="mt-2 text-sm text-red-500 hover:text-red-700"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Year Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Year
          </label>
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            className="w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
            disabled={loading}
          >
            <option value="">Select Year</option>
            {Array.isArray(years) && years.map((year) => (
              <option key={year.value} value={year.value}>
                {year.text}
              </option>
            ))}
          </select>
        </div>

        {/* Make Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Make
          </label>
          <select
            value={selectedMake}
            onChange={(e) => setSelectedMake(e.target.value)}
            className="w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
            disabled={!selectedYear || loading}
          >
            <option value="">Select Make</option>
            {Array.isArray(makes) && makes.map((make) => (
              <option key={make.value} value={make.value}>
                {make.text}
              </option>
            ))}
          </select>
        </div>

        {/* Model Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Model
          </label>
          <select
            value={selectedModel}
            onChange={(e) => setSelectedModel(e.target.value)}
            className="w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
            disabled={!selectedMake || loading}
          >
            <option value="">Select Model</option>
            {Array.isArray(models) && models.map((model) => (
              <option key={model.value} value={model.value}>
                {model.text}
              </option>
            ))}
          </select>
        </div>

        {/* Options Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Options
          </label>
          <select
            value={selectedOption}
            onChange={(e) => setSelectedOption(e.target.value)}
            className="w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
            disabled={!selectedModel || loading}
          >
            <option value="">Select Options</option>
            {Array.isArray(options) && options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.text}
              </option>
            ))}
          </select>
        </div>
      </div>

      {loading && (
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
        </div>
      )}
    </div>
  );
}; 