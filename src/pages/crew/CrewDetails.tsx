import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUsers, faTrophy, faLeaf, faCalendarAlt } from '@fortawesome/free-solid-svg-icons';
import { Crew, Challenge } from '../../types';

const CrewDetails: React.FC = () => {
  const { crewId } = useParams<{ crewId: string }>();
  const navigate = useNavigate();
  const { getCrew, getCrewChallenges } = useApp();
  const [crew, setCrew] = useState<Crew | null>(null);
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadCrewData = async () => {
      if (!crewId) return;
      
      try {
        setLoading(true);
        setError(null);
        
        const crewData = await getCrew(crewId);
        setCrew(crewData);
        
        const challengesData = await getCrewChallenges(crewId);
        setChallenges(challengesData);
        
      } catch (err) {
        setError('Failed to load crew data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadCrewData();
  }, [crewId, getCrew, getCrewChallenges]);

  if (loading) {
    return (
      <div className="container py-4">
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error || !crew) {
    return (
      <div className="container py-4">
        <div className="alert alert-danger" role="alert">
          {error || 'Crew not found'}
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
              <div className="d-flex align-items-center mb-4">
                <FontAwesomeIcon icon={faUsers} className="text-primary me-3" size="2x" />
                <h2 className="mb-0">{crew.name}</h2>
              </div>

              <p className="text-muted">{crew.description}</p>

              <div className="row g-3 mb-4">
                <div className="col-md-4">
                  <div className="card bg-light">
                    <div className="card-body text-center">
                      <FontAwesomeIcon icon={faUsers} className="text-primary mb-2" size="2x" />
                      <h5 className="card-title">Members</h5>
                      <p className="card-text h3">{crew.members?.length || 0}</p>
                    </div>
                  </div>
                </div>
                <div className="col-md-4">
                  <div className="card bg-light">
                    <div className="card-body text-center">
                      <FontAwesomeIcon icon={faTrophy} className="text-primary mb-2" size="2x" />
                      <h5 className="card-title">Challenges</h5>
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
                        {challenges.length} challenges
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <h4 className="mb-3">
                <FontAwesomeIcon icon={faCalendarAlt} className="me-2" />
                Active Challenges
              </h4>

              {challenges.length === 0 ? (
                <div className="alert alert-info">
                  No active challenges at the moment.
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
                            className="btn btn-sm btn-outline-primary"
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

export default CrewDetails; 