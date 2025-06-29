import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUsers, faUserPlus, faUserMinus, faCrown } from '@fortawesome/free-solid-svg-icons';
import { Crew, UserProfile } from '../../types';

const ManageCrew: React.FC = () => {
  const { crewId } = useParams<{ crewId: string }>();
  const navigate = useNavigate();
  const { getCrew, getCrewMembers, removeMember, transferLeadership } = useApp();
  const [crew, setCrew] = useState<Crew | null>(null);
  const [members, setMembers] = useState<UserProfile[]>([]);
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
        
        const membersData = await getCrewMembers(crewId);
        setMembers(membersData);
        
      } catch (err) {
        setError('Failed to load crew data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadCrewData();
  }, [crewId, getCrew, getCrewMembers]);

  const handleRemoveMember = async (memberId: string) => {
    if (!crewId) return;
    
    try {
      await removeMember(crewId, memberId);
      setMembers(members.filter(member => member.id !== memberId));
    } catch (err) {
      setError('Failed to remove member');
      console.error(err);
    }
  };

  const handleTransferLeadership = async (newLeaderId: string) => {
    if (!crewId) return;
    
    try {
      await transferLeadership(crewId, newLeaderId);
      navigate(`/crew/${crewId}`);
    } catch (err) {
      setError('Failed to transfer leadership');
      console.error(err);
    }
  };

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
          <div className="card">
            <div className="card-body">
              <div className="d-flex align-items-center mb-4">
                <FontAwesomeIcon icon={faUsers} className="text-primary me-3" size="2x" />
                <h2 className="mb-0">Manage Crew</h2>
              </div>

              <h4 className="mb-3">Members</h4>
              {members.length === 0 ? (
                <div className="alert alert-info">
                  No members in this crew yet.
                </div>
              ) : (
                <div className="list-group">
                  {members.map((member) => (
                    <div key={member.id} className="list-group-item">
                      <div className="d-flex justify-content-between align-items-center">
                        <div>
                          <h5 className="mb-1">
                            {member.displayName}
                            {member.id === crew.leaderId && (
                              <FontAwesomeIcon icon={faCrown} className="text-warning ms-2" />
                            )}
                          </h5>
                          <p className="text-muted mb-0">{member.email}</p>
                        </div>
                        <div className="btn-group">
                          {member.id !== crew.leaderId && (
                            <>
                              <button
                                className="btn btn-outline-primary"
                                onClick={() => handleTransferLeadership(member.id)}
                              >
                                <FontAwesomeIcon icon={faCrown} className="me-2" />
                                Make Leader
                              </button>
                              <button
                                className="btn btn-outline-danger"
                                onClick={() => handleRemoveMember(member.id)}
                              >
                                <FontAwesomeIcon icon={faUserMinus} className="me-2" />
                                Remove
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="mt-4">
                <button
                  className="btn btn-primary"
                  onClick={() => navigate(`/crew/${crewId}/invite`)}
                >
                  <FontAwesomeIcon icon={faUserPlus} className="me-2" />
                  Invite Members
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManageCrew; 