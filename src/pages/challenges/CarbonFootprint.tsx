import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { googleMapsService } from '../../services/googleMapsService';
import { VehicleInfo } from '../../components/VehicleInfo';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMapMarkerAlt, faRoute, faCalculator, faCar, faBus, faBicycle, faWalking, faArrowLeft } from '@fortawesome/free-solid-svg-icons';

const CarbonFootprint: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { submitCarbonFootprint, selectedVehicle, clearVehicle } = useApp();
  const [startLocation, setStartLocation] = useState('');
  const [endLocation, setEndLocation] = useState('');
  const [distance, setDistance] = useState('');
  const [duration, setDuration] = useState('');
  const [transportType, setTransportType] = useState<'car' | 'public' | 'bike' | 'walk'>('public');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCalculating, setIsCalculating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [startSuggestions, setStartSuggestions] = useState<string[]>([]);
  const [endSuggestions, setEndSuggestions] = useState<string[]>([]);
  const [showStartSuggestions, setShowStartSuggestions] = useState(false);
  const [showEndSuggestions, setShowEndSuggestions] = useState(false);
  const [carSkipped, setCarSkipped] = useState(false);

  // Check if car was skipped from URL parameter
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    if (urlParams.get('skipCar') === 'true') {
      setCarSkipped(true);
      setTransportType('public'); // Default to public transport when car is skipped
      clearVehicle(); // Ensure no vehicle data is present
    }
  }, [location.search, clearVehicle]);

  const transportOptions = [
    ...(carSkipped ? [] : [{ value: 'car', label: 'Car', icon: faCar, carbonFactor: 0.2 }]),
    { value: 'public', label: 'Public Transport', icon: faBus, carbonFactor: 0.05 },
    { value: 'bike', label: 'Bicycle', icon: faBicycle, carbonFactor: 0 },
    { value: 'walk', label: 'Walking', icon: faWalking, carbonFactor: 0 }
  ];

  // Debounced autocomplete for start location
  useEffect(() => {
    if (startLocation.length < 3) {
      setStartSuggestions([]);
      return;
    }

    const timeoutId = setTimeout(async () => {
      try {
        const suggestions = await googleMapsService.getAutocompleteSuggestions(startLocation);
        setStartSuggestions(suggestions);
      } catch (error) {
        console.error('Error getting start location suggestions:', error);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [startLocation]);

  // Debounced autocomplete for end location
  useEffect(() => {
    if (endLocation.length < 3) {
      setEndSuggestions([]);
      return;
    }

    const timeoutId = setTimeout(async () => {
      try {
        const suggestions = await googleMapsService.getAutocompleteSuggestions(endLocation);
        setEndSuggestions(suggestions);
      } catch (error) {
        console.error('Error getting end location suggestions:', error);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [endLocation]);

  const calculateRoute = async () => {
    if (!startLocation || !endLocation) {
      setError('Please enter both start and end locations');
      return;
    }

    setIsCalculating(true);
    setError(null);

    try {
      const routeInfo = await googleMapsService.calculateRoute(startLocation, endLocation);
      // Convert kilometers to miles and display with 1 decimal place
      const distanceInMiles = (routeInfo.distance * 0.621371).toFixed(1);
      setDistance(distanceInMiles);
      setDuration(routeInfo.duration.toFixed(0));
    } catch (error) {
      setError('Failed to calculate route. Please check your locations and try again.');
      console.error('Route calculation error:', error);
    } finally {
      setIsCalculating(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!distance) {
      setError('Please calculate the route distance first');
      return;
    }

      setIsSubmitting(true);
      setError(null);

    try {
      const score = transportType === 'car' ? 50 : transportType === 'public' ? 80 : 100;
      
      await submitCarbonFootprint({
        id: 'demo-carbon',
        userId: 'demo-user',
        challengeId: 'carbon-footprint',
        crewId: 'demo-crew',
        date: new Date(),
        startLocation,
        endLocation,
        distance: parseFloat(distance),
        transportType,
        score
      });

      navigate('/dashboard');
    } catch (error) {
      setError('Failed to submit challenge. Please try again.');
      console.error('Error submitting carbon footprint:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectStartLocation = (suggestion: string) => {
    setStartLocation(suggestion);
    setShowStartSuggestions(false);
  };

  const selectEndLocation = (suggestion: string) => {
    setEndLocation(suggestion);
    setShowEndSuggestions(false);
  };

  const calculateCarbonFootprint = () => {
    if (!distance) return 0;
    
    const distanceMiles = parseFloat(distance);
    
    if (transportType === 'car' && selectedVehicle) {
      // Check if we have valid vehicle data
      const hasValidVehicleData = selectedVehicle && 
        typeof selectedVehicle.comb08 === 'number' && 
        selectedVehicle.comb08 > 0;
      
      if (hasValidVehicleData) {
        // Use actual vehicle data for more accurate calculation
        const mpg = selectedVehicle.comb08; // Combined MPG
        const gallonsUsed = distanceMiles / mpg; // Distance is already in miles
        const co2PerGallon = 8.89; // kg CO2 per gallon of gasoline
        return gallonsUsed * co2PerGallon;
      } else {
        // Use average car values when vehicle data is not available
        const averageMpg = 25; // Average car MPG
        const gallonsUsed = distanceMiles / averageMpg;
        const co2PerGallon = 8.89;
        return gallonsUsed * co2PerGallon;
      }
    } else if (transportType === 'public') {
      // Public transport emissions (convert miles to km for the calculation)
      const distanceKm = distanceMiles * 1.60934;
      return googleMapsService.calculateCarbonFootprint(distanceKm, transportType);
    } else {
      // Walking and biking have 0 emissions
      return 0;
    }
  };

  return (
    <div className="container py-4">
      <div className="row">
        <div className="col-md-8 mx-auto">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <button
              className="btn btn-outline-secondary"
              onClick={() => navigate('/demo')}
            >
              <FontAwesomeIcon icon={faArrowLeft} className="me-2" />
              Back to Demo
            </button>
          </div>

          <div className="card">
            <div className="card-body">
              <div className="text-center mb-4">
                <FontAwesomeIcon icon={faCalculator} className="text-primary mb-3" size="3x" />
                <h2>Carbon Footprint Calculator</h2>
                <p className="text-muted">Calculate your transportation carbon emissions</p>
                {carSkipped && (
                  <div className="alert alert-warning">
                    <small>
                      <strong>Car option skipped:</strong> You chose to skip vehicle selection. 
                      Only public transport, walking, and biking options are available.
                    </small>
                  </div>
                )}
              </div>
          
          {error && (
            <div className="alert alert-danger" role="alert">
              {error}
            </div>
          )}
          
              <form onSubmit={handleSubmit}>
                <div className="row mb-3">
                  <div className="col-md-6">
                    <label htmlFor="startLocation" className="form-label">
                      <FontAwesomeIcon icon={faMapMarkerAlt} className="me-2" />
                      Start Location
                    </label>
                    <div className="position-relative">
                      <input
                        type="text"
                        className="form-control"
                        id="startLocation"
                        value={startLocation}
                        onChange={(e) => {
                          setStartLocation(e.target.value);
                          setShowStartSuggestions(true);
                        }}
                        onFocus={() => setShowStartSuggestions(true)}
                        placeholder="Enter start address"
                        required
                      />
                      {showStartSuggestions && startSuggestions.length > 0 && (
                        <div className="position-absolute w-100 bg-white border rounded mt-1" style={{ zIndex: 1000 }}>
                          {startSuggestions.map((suggestion, index) => (
                            <div
                              key={index}
                              className="p-2 cursor-pointer hover:bg-light"
                              onClick={() => selectStartLocation(suggestion)}
                              style={{ cursor: 'pointer' }}
                            >
                              {suggestion}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="col-md-6">
                    <label htmlFor="endLocation" className="form-label">
                      <FontAwesomeIcon icon={faMapMarkerAlt} className="me-2" />
                      End Location
                    </label>
                    <div className="position-relative">
                      <input
                        type="text"
                        className="form-control"
                        id="endLocation"
                        value={endLocation}
                        onChange={(e) => {
                          setEndLocation(e.target.value);
                          setShowEndSuggestions(true);
                        }}
                        onFocus={() => setShowEndSuggestions(true)}
                        placeholder="Enter end address"
                        required
                      />
                      {showEndSuggestions && endSuggestions.length > 0 && (
                        <div className="position-absolute w-100 bg-white border rounded mt-1" style={{ zIndex: 1000 }}>
                          {endSuggestions.map((suggestion, index) => (
                            <div
                              key={index}
                              className="p-2 cursor-pointer hover:bg-light"
                              onClick={() => selectEndLocation(suggestion)}
                              style={{ cursor: 'pointer' }}
                            >
                              {suggestion}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="text-center mb-3">
                  <button
                    type="button"
                    className="btn btn-outline-primary"
                    onClick={calculateRoute}
                    disabled={isCalculating || !startLocation || !endLocation}
                  >
                    <FontAwesomeIcon icon={faRoute} className="me-2" />
                    {isCalculating ? 'Calculating...' : 'Calculate Route'}
                  </button>
                </div>

                {distance && (
                  <div className="row mb-3">
                    <div className="col-md-6">
                      <label className="form-label">Distance (miles)</label>
                      <input
                        type="text"
                        className="form-control"
                        value={distance}
                        readOnly
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Duration (minutes)</label>
                      <input
                        type="text"
                        className="form-control"
                        value={duration}
                        readOnly
                      />
                    </div>
                  </div>
                )}

                <div className="mb-3">
                  <label className="form-label">Transport Type</label>
                  <div className="row g-3">
                    {transportOptions.map((option) => (
                      <div key={option.value} className={carSkipped ? "col-md-4" : "col-md-3"}>
                        <div 
                          className={`card h-100 cursor-pointer ${
                            transportType === option.value ? 'border-primary' : ''
                          }`}
                          onClick={() => {
                            setTransportType(option.value as any);
                            if (option.value === 'car' && !selectedVehicle && !carSkipped) {
                              // Navigate to car selection page if no vehicle is selected and car wasn't skipped
                              navigate('/challenges/transportation');
                            }
                            // Don't clear vehicle data when switching transport types - keep it available for car
                          }}
                          style={{ cursor: 'pointer' }}
                        >
                          <div className="card-body text-center">
                            <FontAwesomeIcon 
                              icon={option.icon} 
                              className={`mb-2 ${transportType === option.value ? 'text-primary' : 'text-muted'}`}
                              size="2x"
                            />
                            <h6 className="card-title">{option.label}</h6>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Vehicle Information Display */}
                {transportType === 'car' && selectedVehicle && (
                  <div className="mb-3">
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <label className="form-label mb-0">Selected Vehicle</label>
                      <button
                        type="button"
                        className="btn btn-sm btn-outline-primary"
                        onClick={() => navigate('/challenges/transportation')}
                      >
                        Change Vehicle
                      </button>
                    </div>
                    <VehicleInfo vehicleData={selectedVehicle} />
                  </div>
                )}

                {distance && (
                  <div className="alert alert-info">
                    <strong>Carbon Footprint:</strong> {calculateCarbonFootprint().toFixed(2)} kg CO2
                    {transportType === 'car' && selectedVehicle && (
                      <div className="mt-1 text-sm">
                        {(() => {
                          const hasValidVehicleData = selectedVehicle && 
                            typeof selectedVehicle.comb08 === 'number' && 
                            selectedVehicle.comb08 > 0;
                          
                          if (hasValidVehicleData) {
                            return `Based on your ${selectedVehicle.year} ${selectedVehicle.make} ${selectedVehicle.model} (${selectedVehicle.comb08} MPG combined)`;
                          } else {
                            return `Using average car emissions (25 MPG) - detailed vehicle data not available`;
                          }
                        })()}
                      </div>
                    )}
                    {transportType === 'public' && (
                      <div className="mt-1 text-sm">
                        Based on public transportation emissions
                      </div>
                    )}
                    {(transportType === 'bike' || transportType === 'walk') && (
                      <div className="mt-1 text-sm">
                        Zero emissions - great choice for the environment!
                      </div>
                    )}
                  </div>
                )}

                <div className="d-flex gap-2">
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={isSubmitting || !distance}
                  >
                    {isSubmitting ? 'Submitting...' : 'Submit Challenge'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CarbonFootprint; 