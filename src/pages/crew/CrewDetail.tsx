import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUsers, faSignOutAlt, faUserFriends, faTrophy, faShareAlt, faKey } from '@fortawesome/free-solid-svg-icons';
import { collection, query, where, getDocs, doc, updateDoc, getDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { generateRandomCode } from '../../utils/helpers';

const CrewDetail: React.FC = () => {
  const { userCrew, leaveCrew } = useApp();
  const { userProfile, currentUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [inviteUrl, setInviteUrl] = useState<string | null>(null);
  const [members, setMembers] = useState<any[]>([]);
  const [crewPerformance, setCrewPerformance] = useState<any[]>([]);
  const [joinCode, setJoinCode] = useState<string>('');
  const [isCreator, setIsCreator] = useState(false);
  const [loadingMembers, setLoadingMembers] = useState(false);
  const [regeneratingCode, setRegeneratingCode] = useState(false);

  const fetchCrewMembers = useCallback(async () => {
    if (!userCrew) return;
    
    try {
      setLoadingMembers(true);
      const membersData = [];
      
      // Get each member's user document from Firebase
      for (const memberId of userCrew.members) {
        const userDoc = await getDoc(doc(db, 'users', memberId));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          
          // Calculate user score based on submissions
          const submissionsQuery = query(
            collection(db, 'submissions'),
            where('userId', '==', memberId)
          );
          const submissionsSnapshot = await getDocs(submissionsQuery);
          let totalScore = 0;
          
          submissionsSnapshot.forEach(doc => {
            const submission = doc.data();
            totalScore += submission.score || 0;
          });
          
          membersData.push({
            id: memberId,
            displayName: userData.displayName || 'Anonymous',
            score: totalScore,
            joinedDate: userData.createdAt?.toDate() || new Date()
          });
        }
      }
      
      // Sort members by score (descending)
      membersData.sort((a, b) => b.score - a.score);
      setMembers(membersData);
    } catch (err) {
      console.error('Error fetching crew members:', err);
    } finally {
      setLoadingMembers(false);
    }
  }, [userCrew]);
  
  const fetchCrewPerformance = useCallback(async () => {
    if (!userCrew) return;
    
    try {
      // Get submissions for all members of the crew
      const performanceData = [
        { challengeId: 1, name: 'Carbon Footprint', score: 0, count: 0 },
        { challengeId: 2, name: 'Recycling', score: 0, count: 0 },
        { challengeId: 3, name: 'Food Carbon', score: 0, count: 0 },
        { challengeId: 4, name: 'Shower Timer', score: 0, count: 0 }
      ];
      
      // For each member, get their submissions
      for (const memberId of userCrew.members) {
        const submissionsQuery = query(
          collection(db, 'submissions'),
          where('userId', '==', memberId)
        );
        const submissionsSnapshot = await getDocs(submissionsQuery);
        
        submissionsSnapshot.forEach(doc => {
          const submission = doc.data();
          const challenge = performanceData.find(c => c.challengeId === submission.challengeId);
          if (challenge) {
            challenge.score += submission.score || 0;
            challenge.count += 1;
          }
        });
      }
      
      // Calculate average score for each challenge
      performanceData.forEach(challenge => {
        challenge.score = challenge.count > 0 ? challenge.score / challenge.count : 0;
      });
      
      setCrewPerformance(performanceData);
    } catch (err) {
      console.error('Error fetching crew performance:', err);
    }
  }, [userCrew]);

  useEffect(() => {
    // Check if user is the crew leader and set join code
    if (userCrew && (userProfile || currentUser)) {
      const userId = currentUser?.uid || userProfile?.id;
      setIsCreator(userCrew.leaderId === userId);
      setJoinCode(userCrew.joinCode || '');
      console.log('Crew join code:', userCrew.joinCode); // Debug log
    }
  }, [userCrew, userProfile, currentUser]);

  useEffect(() => {
    // Fetch crew members and performance when crew changes
    if (userCrew) {
      fetchCrewMembers();
      fetchCrewPerformance();
    }
  }, [userCrew, fetchCrewMembers, fetchCrewPerformance]);

  const handleLeaveCrew = async () => {
    if (!window.confirm('Are you sure you want to leave this crew?')) return;
    
    try {
      setError(null);
      setLoading(true);
      await leaveCrew();
    } catch (err) {
      setError('Failed to leave crew');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  
  const handleGenerateInvite = () => {
    // Generate a shareable invite URL with the join code
    const inviteUrl = `${window.location.origin}/crew/join?code=${joinCode}`;
    setInviteUrl(inviteUrl);
  };
  
  const handleCopyInvite = () => {
    if (inviteUrl) {
      navigator.clipboard.writeText(inviteUrl);
      alert('Invite URL copied to clipboard!');
    }
  };
  
  const handleRegenerateJoinCode = async () => {
    if (!userCrew || !isCreator) return;
    
    try {
      setRegeneratingCode(true);
      
      // Generate a new random join code
      const newCode = generateRandomCode(6);
      
      // Update in Firestore
      await updateDoc(doc(db, 'crews', userCrew.id), {
        joinCode: newCode
      });
      
      setJoinCode(newCode);
      
      // Reset invite URL since the code changed
      setInviteUrl(null);
    } catch (err) {
      console.error('Error regenerating join code:', err);
      setError('Failed to regenerate join code');
    } finally {
      setRegeneratingCode(false);
    }
  };

  if (!userCrew) {
    return (
      <div className="container py-4">
        <div className="alert alert-info">
          <p className="mb-2">You haven't joined a crew yet.</p>
          <div className="d-flex gap-2">
            <Link to="/crew/create" className="btn btn-eco">Create Crew</Link>
            <Link to="/crew/join" className="btn btn-outline-primary">Join Crew</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-4">
      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}
      
      <div className="card mb-4">
        <div className="card-body">
          <div className="d-flex align-items-start justify-content-between">
            <div className="d-flex align-items-center">
              <FontAwesomeIcon icon={faUsers} className="text-primary me-3" size="2x" />
              <div>
                <h2 className="mb-1">{userCrew.name}</h2>
                <p className="text-muted mb-0">{userCrew.members.length} members</p>
              </div>
            </div>
            
            <div className="d-flex gap-2">
              <Link to="/crew/join" className="btn btn-outline-primary">
                <FontAwesomeIcon icon={faUsers} className="me-2" />
                Join Another Crew
              </Link>
              <button
                className="btn btn-outline-danger"
                onClick={handleLeaveCrew}
                disabled={loading}
              >
                <FontAwesomeIcon icon={faSignOutAlt} className="me-2" />
                Leave Crew
              </button>
            </div>
          </div>
          
          <hr />
          
          <p className="lead">{userCrew.description}</p>
          
          <div className="mt-3">
            <h5 className="mb-3">Invite Others</h5>
            
            <div className="card mb-3">
              <div className="card-body bg-light">
                <div className="d-flex align-items-center justify-content-between mb-2">
                  <h6 className="card-title mb-0">
                    <FontAwesomeIcon icon={faKey} className="me-2" />
                    Join Code
                  </h6>
                  {isCreator && (
                    <button 
                      className="btn btn-sm btn-outline-secondary"
                      onClick={handleRegenerateJoinCode}
                      disabled={regeneratingCode}
                    >
                      Regenerate
                    </button>
                  )}
                </div>
                <div className="input-group mb-2">
                  <input
                    type="text"
                    className="form-control"
                    value={joinCode}
                    readOnly
                  />
                </div>
                <small className="text-muted">Share this code for others to join your crew</small>
              </div>
            </div>
            
            <div className="d-flex gap-2">
              <button 
                className="btn btn-outline-primary" 
                onClick={handleGenerateInvite}
              >
                <FontAwesomeIcon icon={faShareAlt} className="me-2" />
                Generate Invite Link
              </button>
              
              {inviteUrl && (
                <>
                  <input 
                    type="text" 
                    className="form-control" 
                    value={inviteUrl} 
                    readOnly 
                  />
                  <button 
                    className="btn btn-secondary"
                    onClick={handleCopyInvite}
                  >
                    Copy
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
      
      <div className="row">
        <div className="col-md-6 mb-4">
          <div className="card h-100">
            <div className="card-header">
              <h5 className="mb-0">
                <FontAwesomeIcon icon={faUserFriends} className="me-2" />
                Members
              </h5>
            </div>
            <div className="card-body">
              {loadingMembers ? (
                <div className="text-center py-3">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                  <p className="mb-0 mt-2">Loading members...</p>
                </div>
              ) : (
                <div className="list-group">
                  {members.map(member => (
                    <div key={member.id} className="list-group-item d-flex justify-content-between align-items-center">
                      <div>
                        {member.displayName}
                        {member.id === userCrew.leaderId && (
                          <span className="badge badge-eco ms-2">Leader</span>
                        )}
                        {member.id === userProfile?.id && (
                          <span className="badge bg-secondary ms-2">You</span>
                        )}
                      </div>
                      <span className="badge badge-eco">{member.score} pts</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
        
        <div className="col-md-6 mb-4">
          <div className="card h-100">
            <div className="card-header">
              <h5 className="mb-0">
                <FontAwesomeIcon icon={faTrophy} className="me-2" />
                Crew Performance
              </h5>
            </div>
            <div className="card-body">
              <div className="table-responsive">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Challenge</th>
                      <th>Score</th>
                      <th>Progress</th>
                    </tr>
                  </thead>
                  <tbody>
                    {crewPerformance.map(perf => (
                      <tr key={perf.challengeId}>
                        <td>{perf.name}</td>
                        <td>{perf.score.toFixed(1)}</td>
                        <td>
                          <div className="progress">
                            <div 
                              className="progress-bar bg-success" 
                              role="progressbar" 
                              style={{ width: `${Math.min(100, perf.score)}%` }}
                              aria-valuenow={perf.score}
                              aria-valuemin={0}
                              aria-valuemax={100}
                            ></div>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CrewDetail; 