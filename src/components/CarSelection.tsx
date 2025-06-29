import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { carEmissionsService } from '../services/carEmissions';
import { VehicleMenu, VehicleData } from '../services/carEmissions';
import { useApp } from '../context/AppContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCar, faSpinner, faCheckCircle, faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';

interface CarSelectionProps {
  onSelect?: (vehicleData: VehicleData) => void;
  autoNavigate?: boolean;
}

export const CarSelection: React.FC<CarSelectionProps> = ({ onSelect, autoNavigate = true }) => {
  const navigate = useNavigate();
  const { saveVehicle } = useApp();
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
          
          // Save vehicle data to global context
          saveVehicle(vehicleData);
          
          // Call the onSelect callback if provided
          if (onSelect) {
            onSelect(vehicleData);
          }
          
          // Auto-navigate to distance page if enabled
          if (autoNavigate) {
            navigate('/challenges/carbon-footprint');
          }
        } catch (err) {
          setError('Failed to load vehicle data');
        } finally {
          setLoading(false);
        }
      };
      fetchVehicleData();
    }
  }, [selectedOption, onSelect, autoNavigate, navigate, saveVehicle]);

  if (error) {
    return (
      <div className="alert alert-danger d-flex align-items-center" role="alert">
        <FontAwesomeIcon icon={faExclamationTriangle} className="me-2" />
        <div>
          <strong>Error:</strong> {error}
          <button 
            onClick={() => setError(null)}
            className="btn btn-sm btn-outline-danger ms-2"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="card-body">
        <div className="text-center mb-4">
          <FontAwesomeIcon icon={faCar} className="text-primary mb-3" size="3x" />
          <h4>Select Your Vehicle</h4>
          <p className="text-muted">Choose your vehicle for accurate carbon footprint calculation</p>
        </div>

        <div className="row g-3">
          {/* Year Selection */}
          <div className="col-md-6 col-lg-3">
            <label className="form-label fw-bold">
              <span className="text-primary">1.</span> Year
            </label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="form-select form-select-lg"
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
          <div className="col-md-6 col-lg-3">
            <label className="form-label fw-bold">
              <span className="text-primary">2.</span> Make
            </label>
            <select
              value={selectedMake}
              onChange={(e) => setSelectedMake(e.target.value)}
              className="form-select form-select-lg"
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
          <div className="col-md-6 col-lg-3">
            <label className="form-label fw-bold">
              <span className="text-primary">3.</span> Model
            </label>
            <select
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
              className="form-select form-select-lg"
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
          <div className="col-md-6 col-lg-3">
            <label className="form-label fw-bold">
              <span className="text-primary">4.</span> Options
            </label>
            <select
              value={selectedOption}
              onChange={(e) => setSelectedOption(e.target.value)}
              className="form-select form-select-lg"
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
          <div className="text-center mt-4">
            <FontAwesomeIcon icon={faSpinner} className="fa-spin text-primary me-2" size="lg" />
            <span className="text-muted">Loading vehicle data...</span>
          </div>
        )}

        {selectedOption && !loading && (
          <div className="alert alert-success mt-3 d-flex align-items-center" role="alert">
            <FontAwesomeIcon icon={faCheckCircle} className="me-2" />
            <div>
              <strong>Vehicle selected!</strong> Redirecting to route calculation...
            </div>
          </div>
        )}

        <div className="mt-4">
          <div className="progress" style={{ height: '4px' }}>
            <div 
              className="progress-bar bg-primary" 
              style={{ 
                width: `${selectedOption ? 100 : selectedModel ? 75 : selectedMake ? 50 : selectedYear ? 25 : 0}%` 
              }}
            ></div>
          </div>
          <small className="text-muted mt-2 d-block">
            Step {selectedOption ? 4 : selectedModel ? 3 : selectedMake ? 2 : selectedYear ? 1 : 0} of 4
          </small>
        </div>
      </div>
    </div>
  );
}; 