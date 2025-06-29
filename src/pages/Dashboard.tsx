import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrophy, faUsers, faLeaf, faPlus } from '@fortawesome/free-solid-svg-icons';
import { Challenge, Crew } from '../types';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { getUserCrews, getActiveChallenges, userProfile } = useApp();
  const { currentUser } = useAuth();
  const [crews, setCrews] = useState<Crew[]>([]);
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        console.log('Loading dashboard data for user:', currentUser?.uid);
        
        const crewsData = await getUserCrews();
        console.log('Loaded crews:', crewsData);
        setCrews(crewsData);
        
        const challengesData = await getActiveChallenges();
        console.log('Loaded challenges:', challengesData);
        setChallenges(challengesData);
        
      } catch (err) {
        const error = err as Error;
        console.error('Dashboard data loading error:', error);
        setError(`Failed to load dashboard data: ${error.message}`);
      } finally {
        setLoading(false);
      }
    };

    if (currentUser) {
      loadDashboardData();
    }
  }, [currentUser, getUserCrews, getActiveChallenges]);

  if (loading) {
    return (
      <div className="container py-4">
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-2">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container py-4">
        <div className="alert alert-danger" role="alert">
          <h4 className="alert-heading">Error Loading Dashboard</h4>
          <p>{error}</p>
          <hr />
          <button 
            className="btn btn-outline-danger"
            onClick={() => window.location.reload()}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-4">
      <div className="row">
        <div className="col-md-8 mx-auto">
          <div className="card mb-4">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                  <h2 className="mb-0">Welcome, {userProfile?.displayName || currentUser?.displayName || 'User'}!</h2>
                  <p className="text-muted mb-0">Level {userProfile?.level || 1} • {userProfile?.totalScore || 0} points</p>
                </div>
                <div className="d-flex gap-2">
                  <button
                    className="btn btn-outline-primary"
                    onClick={() => navigate('/crew/join')}
                  >
                    <FontAwesomeIcon icon={faUsers} className="me-2" />
                    Join Another Crew
                  </button>
                  <button
                    className="btn btn-primary"
                    onClick={() => navigate('/crew/create')}
                  >
                    <FontAwesomeIcon icon={faPlus} className="me-2" />
                    Create Crew
                  </button>
                </div>
              </div>

              <div className="row g-3 mb-4">
                <div className="col-md-4">
                  <div className="card bg-light">
                    <div className="card-body text-center">
                      <FontAwesomeIcon icon={faUsers} className="text-primary mb-2" size="2x" />
                      <h5 className="card-title">Your Crews</h5>
                      <p className="card-text h3">{crews.length}</p>
                    </div>
                  </div>
                </div>
                <div className="col-md-4">
                  <div className="card bg-light">
                    <div className="card-body text-center">
                      <FontAwesomeIcon icon={faTrophy} className="text-primary mb-2" size="2x" />
                      <h5 className="card-title">Active Challenges</h5>
                      <p className="card-text h3">{challenges.length}</p>
                    </div>
                  </div>
                </div>
                <div className="col-md-4">
                  <div className="card bg-light">
                    <div className="card-body text-center">
                      <FontAwesomeIcon icon={faLeaf} className="text-primary mb-2" size="2x" />
                      <h5 className="card-title">Total Impact</h5>
                      <p className="card-text h3">
                        {userProfile?.submissionsCount || 0} submissions
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <h4 className="mb-3">Your Crews</h4>
              {crews.length === 0 ? (
                <div className="alert alert-info">
                  <h5>No crews yet!</h5>
                  <p className="mb-2">Join a crew to start collaborating on environmental challenges with other eco-warriors.</p>
                  <div className="d-flex gap-2">
                    <button
                      className="btn btn-primary"
                      onClick={() => navigate('/crew/create')}
                    >
                      Create a Crew
                    </button>
                    <button
                      className="btn btn-outline-primary"
                      onClick={() => navigate('/crew/join')}
                    >
                      Join a Crew
                    </button>
                  </div>
                </div>
              ) : (
                <div className="list-group">
                  {crews.map((crew) => (
                    <div key={crew.id} className="list-group-item">
                      <div className="d-flex justify-content-between align-items-center">
                        <div>
                          <h5 className="mb-1">{crew.name}</h5>
                          <p className="text-muted mb-0">{crew.description}</p>
                        </div>
                        <button
                          className="btn btn-outline-primary"
                          onClick={() => navigate(`/crew/${crew.id}`)}
                        >
                          View Details
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <h4 className="mb-3 mt-4">Active Challenges</h4>
              {challenges.length === 0 ? (
                <div className="alert alert-info">
                  <h5>No active challenges</h5>
                  <p className="mb-2">Check back later for new environmental challenges, or create one if you're a crew manager!</p>
                  <button
                    className="btn btn-outline-primary"
                    onClick={() => navigate('/challenges/1')}
                  >
                    Browse Available Challenges
                  </button>
                </div>
              ) : (
                <div className="list-group">
                  {challenges.map((challenge) => (
                    <div key={challenge.id} className="list-group-item">
                      <div className="d-flex justify-content-between align-items-center">
                        <div>
                          <h5 className="mb-1">{challenge.title}</h5>
                          <p className="text-muted mb-0">{challenge.description}</p>
                        </div>
                        <div className="text-end">
                          <button
                            className="btn btn-outline-primary"
                            onClick={() => navigate(`/challenges/${challenge.id}`)}
                          >
                            View Details
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 