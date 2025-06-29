import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUsers, faKey, faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../lib/firebase';

const JoinCrew: React.FC = () => {
  const navigate = useNavigate();
  const { joinCrew, userCrew, refreshData, isLoading } = useApp();
  const { currentUser } = useAuth();
  const [crewCode, setCrewCode] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Refresh data when component mounts to ensure we have latest crew state
  useEffect(() => {
    refreshData();
  }, [refreshData]);

  // Show loading while refreshing data
  if (isLoading) {
    return (
      <div className="container py-4">
        <div className="row">
          <div className="col-md-6 mx-auto">
            <div className="card">
              <div className="card-body text-center">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
                <p className="mt-2">Loading crew information...</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!crewCode.trim()) {
      return setError('Please enter a crew code');
    }
    
    setIsSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      console.log('Searching for crew with code:', crewCode.toUpperCase());
      
      // Find crew by join code (case insensitive)
      const crewsQuery = query(
        collection(db, 'crews'),
        where('joinCode', '==', crewCode.toUpperCase())
      );
      const crewsSnapshot = await getDocs(crewsQuery);
      
      if (crewsSnapshot.empty) {
        throw new Error('Invalid crew code. Please check the code and try again.');
      }

      const crewDoc = crewsSnapshot.docs[0];
      const crewData = crewDoc.data();
      
      console.log('Found crew:', crewData.name);
      
      // Check if user is already a member
      if (crewData.members && crewData.members.includes(currentUser?.uid)) {
        throw new Error('You are already a member of this crew.');
      }

      // Check if user is already in another crew
      if (userCrew) {
        throw new Error(`You are already a member of "${userCrew.name}". You must leave your current crew before joining another one.`);
      }

      // Join the crew
      await joinCrew(crewDoc.id);
      setSuccess(`Successfully joined ${crewData.name}!`);
      
      // Navigate to crew page after a short delay
      setTimeout(() => {
        navigate('/crew');
      }, 2000);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to join crew');
      console.error('Join crew error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container py-4">
      <div className="row">
        <div className="col-md-6 mx-auto">
          <div className="card">
            <div className="card-body">
              <div className="d-flex align-items-center mb-4">
                <FontAwesomeIcon icon={faUsers} className="text-primary me-3" size="2x" />
                <h2 className="mb-0">Join a Crew</h2>
              </div>

              {userCrew && (
                <div className="alert alert-warning" role="alert">
                  <h5>Already in a Crew</h5>
                  <p className="mb-2">You are currently a member of <strong>{userCrew.name}</strong>.</p>
                  <p className="mb-3">To join another crew, you'll need to leave your current crew first.</p>
                  <div className="d-flex gap-2">
                    <button
                      className="btn btn-outline-warning"
                      onClick={() => navigate(`/crew/${userCrew.id}`)}
                    >
                      View Current Crew
                    </button>
                    <button
                      className="btn btn-warning"
                      onClick={() => navigate('/crew')}
                    >
                      Manage Crews
                    </button>
                  </div>
                </div>
              )}

              {!userCrew && (
                <>
                  {error && (
                    <div className="alert alert-danger" role="alert">
                      {error}
                    </div>
                  )}

                  {success && (
                    <div className="alert alert-success" role="alert">
                      {success}
                    </div>
                  )}

                  <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                      <label htmlFor="crewCode" className="form-label">
                        <FontAwesomeIcon icon={faKey} className="me-2" />
                        Crew Join Code
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        id="crewCode"
                        value={crewCode}
                        onChange={(e) => setCrewCode(e.target.value)}
                        placeholder="Enter the 6-character crew code"
                        maxLength={6}
                        required
                      />
                      <div className="form-text">
                        Ask your crew leader for the join code to join their crew.
                      </div>
                    </div>

                    <div className="d-flex gap-2">
                      <button
                        type="submit"
                        className="btn btn-eco"
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? 'Joining...' : 'Join Crew'}
                      </button>
                      <button
                        type="button"
                        className="btn btn-outline-secondary"
                        onClick={() => navigate('/crew')}
                      >
                        <FontAwesomeIcon icon={faArrowLeft} className="me-2" />
                        Back to Crew
                      </button>
                    </div>
                  </form>

                  <hr className="my-4" />

                  <div className="text-center">
                    <p className="text-muted mb-2">Don't have a crew code?</p>
                    <button
                      className="btn btn-outline-primary"
                      onClick={() => navigate('/crew/create')}
                    >
                      Create Your Own Crew
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JoinCrew; 