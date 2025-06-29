import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUsers, faSignOutAlt, faUserFriends, faTrophy, faShareAlt, faKey, faLeaf, faSync } from '@fortawesome/free-solid-svg-icons';
import { collection, doc, getDoc, getDocs, updateDoc } from 'firebase/firestore';
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
  const [refreshing, setRefreshing] = useState(false);

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
          
          // Calculate user score based on submissions from all collections
          const [carbonFootprints, foodCarbon, recycling, showerTimers] = await Promise.all([
            getDocs(collection(db, 'carbonFootprints')).catch(() => ({ docs: [] })),
            getDocs(collection(db, 'foodCarbon')).catch(() => ({ docs: [] })),
            getDocs(collection(db, 'recycling')).catch(() => ({ docs: [] })),
            getDocs(collection(db, 'showerTimers')).catch(() => ({ docs: [] }))
          ]);
          
          let totalScore = 0;
          
          // Sum scores from carbon footprint submissions
          carbonFootprints.docs.forEach(doc => {
            const submission = doc.data();
            if (submission.userId === memberId) {
              totalScore += submission.score || 0;
            }
          });
          
          // Sum scores from food carbon submissions
          foodCarbon.docs.forEach(doc => {
            const submission = doc.data();
            if (submission.userId === memberId) {
              totalScore += submission.score || 0;
            }
          });
          
          // Sum scores from recycling submissions
          recycling.docs.forEach(doc => {
            const submission = doc.data();
            if (submission.userId === memberId) {
              totalScore += submission.score || 0;
            }
          });
          
          // Sum scores from shower timer submissions
          showerTimers.docs.forEach(doc => {
            const submission = doc.data();
            if (submission.userId === memberId) {
              totalScore += submission.score || 0;
            }
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
      // Get submissions for all members of the crew from all collections
      const performanceData = [
        { challengeId: 'carbon-footprint', name: 'Carbon Footprint', score: 0, count: 0, totalImpact: 0 },
        { challengeId: 'recycling', name: 'Recycling', score: 0, count: 0, totalImpact: 0 },
        { challengeId: 'food-carbon', name: 'Food Carbon', score: 0, count: 0, totalImpact: 0 },
        { challengeId: 'shower-timer', name: 'Shower Timer', score: 0, count: 0, totalImpact: 0 }
      ];
      
      // Fetch submissions from all collections
      const [carbonFootprints, foodCarbon, recycling, showerTimers] = await Promise.all([
        getDocs(collection(db, 'carbonFootprints')).catch(() => ({ docs: [] })),
        getDocs(collection(db, 'foodCarbon')).catch(() => ({ docs: [] })),
        getDocs(collection(db, 'recycling')).catch(() => ({ docs: [] })),
        getDocs(collection(db, 'showerTimers')).catch(() => ({ docs: [] }))
      ]);

      // Process carbon footprint submissions
      carbonFootprints.docs.forEach(doc => {
        const submission = doc.data();
        if (userCrew.members.includes(submission.userId)) {
          const challenge = performanceData.find(c => c.challengeId === 'carbon-footprint');
          if (challenge) {
            challenge.score += submission.score || 0;
            challenge.count += 1;
            challenge.totalImpact += submission.distance || 0;
          }
        }
      });

      // Process food carbon submissions
      foodCarbon.docs.forEach(doc => {
        const submission = doc.data();
        if (userCrew.members.includes(submission.userId)) {
          const challenge = performanceData.find(c => c.challengeId === 'food-carbon');
          if (challenge) {
            challenge.score += submission.score || 0;
            challenge.count += 1;
            challenge.totalImpact += submission.totalCarbonFootprint || 0;
          }
        }
      });

      // Process recycling submissions
      recycling.docs.forEach(doc => {
        const submission = doc.data();
        if (userCrew.members.includes(submission.userId)) {
          const challenge = performanceData.find(c => c.challengeId === 'recycling');
          if (challenge) {
            challenge.score += submission.score || 0;
            challenge.count += 1;
            challenge.totalImpact += submission.quantity || 0;
          }
        }
      });

      // Process shower timer submissions
      showerTimers.docs.forEach(doc => {
        const submission = doc.data();
        if (userCrew.members.includes(submission.userId)) {
          const challenge = performanceData.find(c => c.challengeId === 'shower-timer');
          if (challenge) {
            challenge.score += submission.score || 0;
            challenge.count += 1;
            challenge.totalImpact += submission.duration || 0;
          }
        }
      });
      
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

  const refreshCrewData = useCallback(async () => {
    if (!userCrew) return;
    
    try {
      setRefreshing(true);
      await Promise.all([
        fetchCrewMembers(),
        fetchCrewPerformance()
      ]);
    } catch (err) {
      console.error('Error refreshing crew data:', err);
    } finally {
      setRefreshing(false);
    }
  }, [userCrew, fetchCrewMembers, fetchCrewPerformance]);

  useEffect(() => {
    // Fetch crew members and performance when crew changes
    if (userCrew) {
      fetchCrewMembers();
      fetchCrewPerformance();
    }
  }, [userCrew, fetchCrewMembers, fetchCrewPerformance]);

  // Auto-refresh when component mounts to get latest data
  useEffect(() => {
    if (userCrew) {
      refreshCrewData();
    }
  }, [userCrew, refreshCrewData]); // Include refreshCrewData in dependencies

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
              <button
                className="btn btn-outline-primary"
                onClick={refreshCrewData}
                disabled={refreshing}
              >
                <FontAwesomeIcon icon={faSync} className={`me-2 ${refreshing ? 'fa-spin' : ''}`} />
                {refreshing ? 'Refreshing...' : 'Refresh'}
              </button>
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
                      <th>Avg Score</th>
                      <th>Submissions</th>
                      <th>Total Impact</th>
                      <th>Progress</th>
                    </tr>
                  </thead>
                  <tbody>
                    {crewPerformance.map(perf => (
                      <tr key={perf.challengeId}>
                        <td>{perf.name}</td>
                        <td>{perf.score.toFixed(1)}</td>
                        <td>{perf.count}</td>
                        <td>
                          {perf.challengeId === 'carbon-footprint' && `${perf.totalImpact.toFixed(1)} mi`}
                          {perf.challengeId === 'food-carbon' && `${perf.totalImpact.toFixed(1)} kg CO₂`}
                          {perf.challengeId === 'recycling' && `${perf.totalImpact} items`}
                          {perf.challengeId === 'shower-timer' && `${perf.totalImpact.toFixed(0)} min`}
                        </td>
                        <td>
                          <div className="progress" style={{ height: '20px' }}>
                            <div 
                              className="progress-bar bg-success" 
                              role="progressbar" 
                              style={{ width: `${Math.min(100, (perf.score / 100) * 100)}%` }}
                              aria-valuenow={perf.score}
                              aria-valuemin={0}
                              aria-valuemax={100}
                            >
                              {perf.score > 0 && `${perf.score.toFixed(0)}%`}
                            </div>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              {/* Total Impact Summary */}
              <div className="mt-3 p-3 bg-light rounded">
                <h6 className="mb-2">
                  <FontAwesomeIcon icon={faLeaf} className="me-2" />
                  Total Crew Impact
                </h6>
                <div className="row text-center">
                  <div className="col-6">
                    <div className="h5 text-success mb-1">
                      {crewPerformance.reduce((total, perf) => total + perf.count, 0)}
                    </div>
                    <small className="text-muted">Total Submissions</small>
                  </div>
                  <div className="col-6">
                    <div className="h5 text-primary mb-1">
                      {crewPerformance.reduce((total, perf) => total + perf.score, 0).toFixed(1)}
                    </div>
                    <small className="text-muted">Avg Score</small>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CrewDetail; 