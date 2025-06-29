import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CarSelection } from '../../components/CarSelection';
import { useApp } from '../../context/AppContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCar, faArrowLeft, faForward } from '@fortawesome/free-solid-svg-icons';

const Transportation: React.FC = () => {
  const navigate = useNavigate();
  const { clearVehicle } = useApp();

  const handleSkip = () => {
    // Clear any existing vehicle data and navigate to carbon footprint with skip flag
    clearVehicle();
    navigate('/challenges/carbon-footprint?skipCar=true');
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
            <button
              className="btn btn-outline-warning"
              onClick={handleSkip}
            >
              <FontAwesomeIcon icon={faForward} className="me-2" />
              Skip Vehicle Selection
            </button>
          </div>

          <div className="text-center mb-4">
            <FontAwesomeIcon icon={faCar} className="text-primary mb-3" size="3x" />
            <h2>Vehicle Selection</h2>
            <p className="text-muted">Select your vehicle to calculate accurate carbon emissions</p>
            <div className="alert alert-info">
              <small>
                <strong>Note:</strong> You can skip vehicle selection if you prefer to use public transport, 
                walking, or biking instead of a car.
              </small>
            </div>
          </div>

          <CarSelection autoNavigate={true} />
        </div>
      </div>
    </div>
  );
};

export default Transportation; 