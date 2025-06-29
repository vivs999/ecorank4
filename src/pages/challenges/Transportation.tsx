import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCar, faBicycle, faWalking, faBus, faTrain } from '@fortawesome/free-solid-svg-icons';

const Transportation: React.FC = () => {
  const navigate = useNavigate();
  const { submitChallenge } = useApp();
  const [transportType, setTransportType] = useState('');
  const [distance, setDistance] = useState('');
  const [duration, setDuration] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const transportOptions = [
    { value: 'walking', label: 'Walking', icon: faWalking, carbonFactor: 0 },
    { value: 'bicycle', label: 'Bicycle', icon: faBicycle, carbonFactor: 0 },
    { value: 'bus', label: 'Public Bus', icon: faBus, carbonFactor: 0.1 },
    { value: 'train', label: 'Train', icon: faTrain, carbonFactor: 0.05 },
    { value: 'car', label: 'Car', icon: faCar, carbonFactor: 0.2 }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const selectedTransport = transportOptions.find(option => option.value === transportType);
      const carbonSaved = selectedTransport ? (parseFloat(distance) * selectedTransport.carbonFactor) : 0;

      await submitChallenge({
        id: 'demo-transportation',
        challengeId: 'transportation',
        userId: 'demo-user',
        score: Math.max(0, 100 - carbonSaved * 10),
        timestamp: new Date(),
        type: 'carbon',
        details: {
          distance: parseFloat(distance),
          transportMode: transportType
        },
        status: 'approved',
        createdAt: new Date(),
        updatedAt: new Date()
      });

      navigate('/dashboard');
    } catch (error) {
      console.error('Error submitting transportation challenge:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container py-4">
      <div className="row">
        <div className="col-md-8 mx-auto">
          <div className="card">
            <div className="card-body">
              <div className="text-center mb-4">
                <FontAwesomeIcon icon={faCar} className="text-primary mb-3" size="3x" />
                <h2>Green Transportation Challenge</h2>
                <p className="text-muted">Track your eco-friendly travel choices</p>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <label className="form-label">Transportation Method</label>
                  <div className="row g-3">
                    {transportOptions.map((option) => (
                      <div key={option.value} className="col-md-4">
                        <div 
                          className={`card h-100 cursor-pointer ${
                            transportType === option.value ? 'border-primary' : ''
                          }`}
                          onClick={() => setTransportType(option.value)}
                        >
                          <div className="card-body text-center">
                            <FontAwesomeIcon 
                              icon={option.icon} 
                              className={`mb-2 ${transportType === option.value ? 'text-primary' : 'text-muted'}`}
                              size="2x"
                            />
                            <h6 className="card-title">{option.label}</h6>
                            <small className="text-muted">
                              {option.carbonFactor === 0 ? 'Zero emissions' : `${option.carbonFactor * 100}g CO2/km`}
                            </small>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="row mb-4">
                  <div className="col-md-6">
                    <label htmlFor="distance" className="form-label">Distance (km)</label>
                    <input
                      type="number"
                      className="form-control"
                      id="distance"
                      value={distance}
                      onChange={(e) => setDistance(e.target.value)}
                      step="0.1"
                      required
                    />
                  </div>
                  <div className="col-md-6">
                    <label htmlFor="duration" className="form-label">Duration (minutes)</label>
                    <input
                      type="number"
                      className="form-control"
                      id="duration"
                      value={duration}
                      onChange={(e) => setDuration(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="d-flex gap-2">
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={isSubmitting || !transportType || !distance || !duration}
                  >
                    {isSubmitting ? 'Submitting...' : 'Submit Challenge'}
                  </button>
                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={() => navigate('/demo')}
                  >
                    Back to Demo
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

export default Transportation; 