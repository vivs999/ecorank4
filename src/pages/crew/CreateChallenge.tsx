import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrophy, faCalendar, faClock, faLeaf } from '@fortawesome/free-solid-svg-icons';
import { Challenge } from '../../types';

const CreateChallenge: React.FC = () => {
  const navigate = useNavigate();
  const { createChallenge } = useApp();
  const { userProfile } = useAuth();
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [challengeType, setChallengeType] = useState<'carbon' | 'recycling' | 'food' | 'shower'>('carbon');
  const [duration, setDuration] = useState(7);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [lowerScoreIsBetter, setLowerScoreIsBetter] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Check if user is a crew manager
  if (!userProfile?.isCrewManager) {
    return (
      <div className="container py-4">
        <div className="alert alert-warning" role="alert">
          <h4 className="alert-heading">Access Denied</h4>
          <p>You need to be a crew manager to create challenges.</p>
          <hr />
          <button className="btn btn-outline-warning" onClick={() => navigate('/crew')}>
            Back to Crew
          </button>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (title.trim().length < 5) {
      return setError('Challenge title must be at least 5 characters long');
    }
    
    if (description.trim().length < 20) {
      return setError('Please provide a more detailed description (20+ characters)');
    }
    
    if (!startDate || !endDate) {
      return setError('Please select both start and end dates');
    }
    
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (start >= end) {
      return setError('End date must be after start date');
    }
    
    if (start < new Date()) {
      return setError('Start date cannot be in the past');
    }
    
    try {
      setError(null);
      setLoading(true);
      
      const challenge: Omit<Challenge, 'id'> = {
        title,
        description,
        type: challengeType,
        startDate: start,
        endDate: end,
        duration,
        lowerScoreIsBetter,
        crewId: userProfile.crewId || '',
        participants: [],
        submissions: [],
        status: 'active',
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      await createChallenge(challenge);
      navigate('/crew');
      
    } catch (err) {
      setError('Failed to create challenge');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const challengeTypes = [
    { value: 'carbon', label: 'Carbon Footprint', icon: faLeaf, description: 'Reduce your carbon emissions' },
    { value: 'recycling', label: 'Recycling', icon: faLeaf, description: 'Increase recycling efforts' },
    { value: 'food', label: 'Food Waste', icon: faLeaf, description: 'Reduce food waste' },
    { value: 'shower', label: 'Shower Timer', icon: faLeaf, description: 'Reduce shower time' }
  ];

  return (
    <div className="container py-4">
      <div className="row">
        <div className="col-lg-10 mx-auto">
          <div className="card">
            <div className="card-body">
              <div className="d-flex align-items-center mb-4">
                <FontAwesomeIcon icon={faTrophy} className="text-primary me-3" size="2x" />
                <h2 className="mb-0">Create Challenge</h2>
              </div>

              {error && (
                <div className="alert alert-danger" role="alert">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div className="row">
                  <div className="col-md-8">
                    <div className="mb-3">
                      <label htmlFor="title" className="form-label">Challenge Title</label>
                      <input
                        type="text"
                        className="form-control"
                        id="title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="e.g., Reduce Carbon Footprint by 20%"
                        required
                      />
                    </div>

                    <div className="mb-3">
                      <label htmlFor="description" className="form-label">Description</label>
                      <textarea
                        className="form-control"
                        id="description"
                        rows={4}
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Describe the challenge goals, rules, and how participants can achieve them..."
                        required
                      />
                    </div>

                    <div className="mb-3">
                      <label htmlFor="challengeType" className="form-label">Challenge Type</label>
                      <select
                        className="form-select"
                        id="challengeType"
                        value={challengeType}
                        onChange={(e) => setChallengeType(e.target.value as any)}
                        required
                      >
                        {challengeTypes.map(type => (
                          <option key={type.value} value={type.value}>
                            {type.label} - {type.description}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="col-md-4">
                    <div className="card bg-light">
                      <div className="card-body">
                        <h5 className="card-title">
                          <FontAwesomeIcon icon={faCalendar} className="me-2" />
                          Challenge Settings
                        </h5>
                        
                        <div className="mb-3">
                          <label htmlFor="startDate" className="form-label">Start Date</label>
                          <input
                            type="datetime-local"
                            className="form-control"
                            id="startDate"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            required
                          />
                        </div>

                        <div className="mb-3">
                          <label htmlFor="endDate" className="form-label">End Date</label>
                          <input
                            type="datetime-local"
                            className="form-control"
                            id="endDate"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            required
                          />
                        </div>

                        <div className="mb-3">
                          <label htmlFor="duration" className="form-label">
                            <FontAwesomeIcon icon={faClock} className="me-1" />
                            Duration (days)
                          </label>
                          <input
                            type="number"
                            className="form-control"
                            id="duration"
                            value={duration}
                            onChange={(e) => setDuration(parseInt(e.target.value))}
                            min="1"
                            max="365"
                            required
                          />
                        </div>

                        <div className="mb-3">
                          <div className="form-check">
                            <input
                              className="form-check-input"
                              type="checkbox"
                              id="lowerScoreIsBetter"
                              checked={lowerScoreIsBetter}
                              onChange={(e) => setLowerScoreIsBetter(e.target.checked)}
                            />
                            <label className="form-check-label" htmlFor="lowerScoreIsBetter">
                              Lower score is better (e.g., carbon footprint)
                            </label>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="d-flex gap-2">
                  <button 
                    type="submit" 
                    className="btn btn-eco"
                    disabled={loading}
                  >
                    {loading ? 'Creating...' : 'Create Challenge'}
                  </button>
                  <button 
                    type="button" 
                    className="btn btn-outline-secondary"
                    onClick={() => navigate('/crew')}
                  >
                    Cancel
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

export default CreateChallenge; 