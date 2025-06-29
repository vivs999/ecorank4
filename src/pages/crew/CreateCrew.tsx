import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUsers, faCopy, faCheck } from '@fortawesome/free-solid-svg-icons';
import { Crew } from '../../types';

const CreateCrew: React.FC = () => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [createdCrew, setCreatedCrew] = useState<Crew | null>(null);
  const [copied, setCopied] = useState(false);
  const { createCrew } = useApp();
  const navigate = useNavigate();
  const [startDate, setStartDate] = useState('');
  const [defaultDuration, setDefaultDuration] = useState(7);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (name.trim().length < 3) {
      return setError('Crew name must be at least 3 characters long');
    }
    
    if (description.trim().length < 10) {
      return setError('Please provide a more detailed description (10+ characters)');
    }
    
    if (!startDate) {
      return setError('Please select a crew start date');
    }
    
    if (defaultDuration < 1) {
      return setError('Default challenge duration must be at least 1 day');
    }
    
    try {
      setError(null);
      setLoading(true);
      
      const crew = await createCrew(name, description, startDate, defaultDuration);
      setCreatedCrew(crew);
      
    } catch (err) {
      setError('Failed to create crew');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const copyJoinCode = async () => {
    if (createdCrew?.joinCode) {
      try {
        await navigator.clipboard.writeText(createdCrew.joinCode);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.error('Failed to copy join code:', err);
      }
    }
  };

  if (createdCrew) {
    return (
      <div className="container py-4">
        <div className="row">
          <div className="col-md-8 mx-auto">
            <div className="card">
              <div className="card-body text-center">
                <div className="mb-4">
                  <FontAwesomeIcon icon={faUsers} className="text-success" size="3x" />
                  <h2 className="mt-3">Crew Created Successfully!</h2>
                  <p className="text-muted">Your crew "{createdCrew.name}" is ready to go!</p>
                </div>

                <div className="alert alert-info">
                  <h5>Share this join code with your crew members:</h5>
                  <div className="d-flex align-items-center justify-content-center gap-2">
                    <code className="fs-4 fw-bold">{createdCrew.joinCode}</code>
                    <button
                      className="btn btn-outline-primary btn-sm"
                      onClick={copyJoinCode}
                    >
                      <FontAwesomeIcon icon={copied ? faCheck : faCopy} />
                      {copied ? ' Copied!' : ' Copy'}
                    </button>
                  </div>
                </div>

                <div className="d-flex gap-2 justify-content-center">
                  <button
                    className="btn btn-primary"
                    onClick={() => navigate('/crew')}
                  >
                    Go to Crew Page
                  </button>
                  <button
                    className="btn btn-outline-secondary"
                    onClick={() => {
                      setCreatedCrew(null);
                      setName('');
                      setDescription('');
                    }}
                  >
                    Create Another Crew
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-4">
      <div className="row">
        <div className="col-md-8 mx-auto">
          <div className="card">
            <div className="card-body">
              <div className="d-flex align-items-center mb-4">
                <FontAwesomeIcon icon={faUsers} className="text-primary me-3" size="2x" />
                <h2 className="mb-0">Create Crew</h2>
              </div>

              {error && (
                <div className="alert alert-danger" role="alert">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label htmlFor="name" className="form-label">Crew Name</label>
                  <input
                    type="text"
                    className="form-control"
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>

                <div className="mb-3">
                  <label htmlFor="description" className="form-label">Description</label>
                  <textarea
                    className="form-control"
                    id="description"
                    rows={3}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    required
                  />
                </div>

                <div className="mb-3">
                  <label htmlFor="startDate" className="form-label">Crew Start Date</label>
                  <input
                    type="date"
                    className="form-control"
                    id="startDate"
                    value={startDate}
                    onChange={e => setStartDate(e.target.value)}
                    required
                  />
                </div>

                <div className="mb-3">
                  <label htmlFor="defaultDuration" className="form-label">Default Challenge Duration (days)</label>
                  <input
                    type="number"
                    className="form-control"
                    id="defaultDuration"
                    value={defaultDuration}
                    onChange={e => setDefaultDuration(Number(e.target.value))}
                    min={1}
                    required
                  />
                </div>
                
                <button 
                  type="submit" 
                  className="btn btn-eco"
                  disabled={loading}
                >
                  {loading ? 'Creating...' : 'Create Crew'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateCrew; 