import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faClock,
  faPlay,
  faPause,
  faStop,
  faSave,
  faWater,
  faPlus,
  faCalendarDay,
  faTrash,
  faHistory
} from '@fortawesome/free-solid-svg-icons';
import { ShowerTimerSubmission } from '../../types';

interface ShowerEntry {
  id: string;
  duration: number;
  skipped: boolean;
  date: Date;
  waterSaved: number;
}

const ShowerTimer: React.FC = () => {
  // Timer state
  const [duration, setDuration] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [skippedToday, setSkippedToday] = useState(false);
  const [hasCompletedToday, setHasCompletedToday] = useState(0); // Count of showers today
  
  // Shower entries
  const [showerEntries, setShowerEntries] = useState<ShowerEntry[]>([]);
  const [viewMode, setViewMode] = useState<'timer' | 'history'>('timer');
  
  // UI state
  const [totalWaterUsage, setTotalWaterUsage] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  
  const { submitShowerTimer } = useApp();
  const navigate = useNavigate();
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  
  // Check if we've already skipped or completed showers today
  const checkTodayStatus = useCallback(() => {
    const today = new Date().setHours(0, 0, 0, 0);
    
    // Check if we've skipped today
    const skipToday = showerEntries.some(entry => 
      entry.skipped && new Date(entry.date).setHours(0, 0, 0, 0) === today
    );
    setSkippedToday(skipToday);
    
    // Count showers completed today
    const completedToday = showerEntries.filter(entry => 
      !entry.skipped && new Date(entry.date).setHours(0, 0, 0, 0) === today
    ).length;
    setHasCompletedToday(completedToday);
  }, [showerEntries]);
  
  // Check skip and completion status for today on mount
  useEffect(() => {
    checkTodayStatus();
  }, [checkTodayStatus]);
  
  // Update water usage calculation when duration changes
  useEffect(() => {
    // Average shower uses 2.5 gallons (9.5 liters) per minute
    const avgGallonsPerMinute = 2.5;
    setTotalWaterUsage(duration * avgGallonsPerMinute);
  }, [duration]);
  
  // Timer functionality
  useEffect(() => {
    if (isRunning) {
      timerRef.current = setInterval(() => {
        setDuration(prev => prev + 1/60);
      }, 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isRunning]);
  
  const startTimer = () => {
    setIsRunning(true);
  };
  
  const pauseTimer = () => {
    setIsRunning(false);
  };
  
  const resetTimer = () => {
    pauseTimer();
    setDuration(0);
  };
  
  const skipShower = () => {
    if (skippedToday) {
      setError("You've already skipped a shower today. You can only skip once per day.");
      return;
    }
    
    // Calculate water saved (average 8-minute shower)
    const waterSaved = 8 * 2.5; // 8 minutes * 2.5 gallons per minute
    
    const newEntry: ShowerEntry = {
      id: `skip-${Date.now()}`,
      duration: 0,
      skipped: true,
      date: new Date(),
      waterSaved
    };
    
    setShowerEntries([...showerEntries, newEntry]);
    setSkippedToday(true);
    resetTimer();
    setError(null);
  };
  
  const saveShower = () => {
    if (isRunning) {
      setError('Please stop the timer before saving');
      return;
    }
    
    if (duration === 0) {
      setError('Please record a shower time or mark as skipped');
      return;
    }
    
    if (hasCompletedToday >= 3) {
      setError("You've already recorded 3 showers today. That's the maximum allowed per day.");
      return;
    }
    
    // Calculate water saved compared to average 8-minute shower
    const avgShowerTime = 8; // minutes
    const waterSaved = Math.max(0, (avgShowerTime - duration) * 2.5); // gallons saved
    
    const newEntry: ShowerEntry = {
      id: `shower-${Date.now()}`,
      duration,
      skipped: false,
      date: new Date(),
      waterSaved
    };
    
    setShowerEntries([...showerEntries, newEntry]);
    resetTimer();
    setHasCompletedToday(hasCompletedToday + 1);
    setError(null);
  };
  
  const removeEntry = (id: string) => {
    const entryToRemove = showerEntries.find(entry => entry.id === id);
    if (!entryToRemove) return;
    
    // Update skip/completion status if needed
    const today = new Date().setHours(0, 0, 0, 0);
    const entryDate = new Date(entryToRemove.date).setHours(0, 0, 0, 0);
    
    if (entryDate === today) {
      if (entryToRemove.skipped) {
        setSkippedToday(false);
      } else {
        setHasCompletedToday(prev => Math.max(0, prev - 1));
      }
    }
    
    setShowerEntries(showerEntries.filter(entry => entry.id !== id));
  };
  
  const calculateScore = (entry: ShowerEntry) => {
    if (entry.skipped) {
      return 3; // Default score for skipped showers
    } else {
      // Lower duration is better (max 10 points, min 1 point)
      return Math.max(1, Math.min(10, Math.ceil(10 - entry.duration)));
    }
  };
  
  const calculateTotalScore = () => {
    return showerEntries.reduce((total, entry) => total + calculateScore(entry), 0);
  };
  
  const calculateTotalWaterSaved = () => {
    return showerEntries.reduce((total, entry) => total + entry.waterSaved, 0);
  };
  
  const formatTime = (minutes: number) => {
    const mins = Math.floor(minutes);
    const secs = Math.floor((minutes - mins) * 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };
  
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      weekday: 'short',
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  const isToday = (date: Date) => {
    const today = new Date().setHours(0, 0, 0, 0);
    const checkDate = new Date(date).setHours(0, 0, 0, 0);
    return today === checkDate;
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isRunning) {
      return setError('Please stop the timer before submitting');
    }
    
    if (showerEntries.length === 0) {
      return setError('Please record at least one shower time or mark as skipped');
    }
    
    try {
      setError(null);
      setLoading(true);
      
      // For backward compatibility, we'll use the last entry as the main submission
      const lastEntry = showerEntries[showerEntries.length - 1];
      
      const submission: ShowerTimerSubmission = {
        id: '',
        userId: '',
        challengeId: '',
        crewId: '',
        date: lastEntry.date,
        duration: lastEntry.duration,
        score: calculateTotalScore()
      };
      
      await submitShowerTimer(submission);
      setSubmitted(true);
      
    } catch (err) {
      setError('Failed to submit challenge data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  
  if (submitted) {
    return (
      <div className="container py-4">
        <div className="card">
          <div className="card-body text-center">
            <FontAwesomeIcon icon={faClock} className="text-primary" size="4x" />
            <h2 className="mt-3">Challenge Completed!</h2>
            
            <div className="row justify-content-center mt-4">
              <div className="col-md-4">
                <div className="card mb-4">
                  <div className="card-body">
                    <p className="lead mb-0">
                      Total Showers: <strong>{showerEntries.filter(entry => !entry.skipped).length}</strong>
                    </p>
                  </div>
                </div>
              </div>
              <div className="col-md-4">
                <div className="card mb-4">
                  <div className="card-body">
                    <p className="lead mb-0">
                      Water Saved: <strong>{calculateTotalWaterSaved().toFixed(1)} gallons</strong>
                    </p>
                  </div>
                </div>
              </div>
              <div className="col-md-4">
                <div className="card mb-4">
                  <div className="card-body">
                    <p className="lead mb-0">
                      Your Score: <strong>{calculateTotalScore()} points</strong>
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="card mb-4">
              <div className="card-header">
                <h5 className="mb-0">Your Shower Records</h5>
              </div>
              <div className="card-body p-0">
                <div className="table-responsive">
                  <table className="table mb-0">
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Type</th>
                        <th>Duration</th>
                        <th>Water Saved</th>
                        <th>Score</th>
                      </tr>
                    </thead>
                    <tbody>
                      {showerEntries.map(entry => (
                        <tr key={entry.id}>
                          <td>{formatDate(entry.date)}</td>
                          <td>
                            {entry.skipped ? (
                              <span className="badge bg-info">Skipped</span>
                            ) : (
                              <span className="badge bg-primary">Shower</span>
                            )}
                          </td>
                          <td>
                            {entry.skipped ? 'N/A' : formatTime(entry.duration)}
                          </td>
                          <td>{entry.waterSaved.toFixed(1)} gallons</td>
                          <td>
                            <span className="badge bg-success">
                              +{calculateScore(entry)} points
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
            
            <div className="alert alert-success mt-3">
              <p className="mb-0">
                {showerEntries.some(e => e.skipped) ? 
                  "Great job skipping a shower! You've saved a significant amount of water." : 
                  calculateTotalScore() > 15 ?
                  "Amazing! Your short showers are making a real difference to water conservation." :
                  calculateTotalScore() > 8 ?
                  "Good job! Your showers were shorter than the average 8-minute shower." :
                  "Thanks for participating! Try to reduce your shower time next time to save more water."}
              </p>
            </div>
            
            <div className="card mb-4">
              <div className="card-body">
                <h5 className="mb-3">Water Conservation Tips</h5>
                <ul className="list-group list-group-flush text-start">
                  <li className="list-group-item">Install a low-flow showerhead to save up to 60% of water</li>
                  <li className="list-group-item">Turn off the water while lathering with soap</li>
                  <li className="list-group-item">Consider taking shorter showers (5 minutes or less)</li>
                  <li className="list-group-item">Collect cold water while waiting for it to warm up</li>
                </ul>
              </div>
            </div>
            
            <div className="d-grid gap-2 d-md-block mt-4">
              <button 
                className="btn btn-eco btn-lg me-md-2" 
                onClick={() => navigate('/dashboard')}
              >
                Back to Dashboard
              </button>
              <button 
                className="btn btn-outline-eco btn-lg" 
                onClick={() => navigate('/leaderboard')}
              >
                View Leaderboard
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container py-4">
      <div className="card mb-4">
        <div className="card-body">
          <h2>Shower Timer Challenge</h2>
          <p className="lead">
            Time your showers and save water. Track multiple showers per day (max 3), and you can skip once daily.
          </p>
          
          {error && (
            <div className="alert alert-danger" role="alert">
              {error}
            </div>
          )}
          
          <div className="nav nav-pills mb-4">
            <button 
              className={`nav-link ${viewMode === 'timer' ? 'active' : ''}`} 
              onClick={() => setViewMode('timer')}
            >
              <FontAwesomeIcon icon={faClock} className="me-2" />
              Shower Timer
            </button>
            <button 
              className={`nav-link ${viewMode === 'history' ? 'active' : ''}`} 
              onClick={() => setViewMode('history')}
            >
              <FontAwesomeIcon icon={faHistory} className="me-2" />
              History ({showerEntries.length})
            </button>
          </div>
          
          <form onSubmit={handleSubmit}>
            {viewMode === 'timer' ? (
              <div className="row justify-content-center mb-4">
                <div className="col-md-8">
                  <div className="card text-center">
                    <div className="card-body py-5">
                      <h5 className="card-title mb-4">Shower Timer</h5>
                      
                      {hasCompletedToday >= 3 ? (
                        <div className="alert alert-warning">
                          <FontAwesomeIcon icon={faCalendarDay} className="me-2" />
                          You've already tracked 3 showers today, which is the daily maximum.
                          {!skippedToday && (
                            <div className="mt-2">
                              <button
                                type="button"
                                className="btn btn-info text-white"
                                onClick={skipShower}
                              >
                                <FontAwesomeIcon icon={faWater} className="me-2" />
                                Skip Today's Shower
                              </button>
                            </div>
                          )}
                        </div>
                      ) : skippedToday ? (
                        <div className="alert alert-info">
                          <FontAwesomeIcon icon={faWater} className="me-2" />
                          You've already skipped a shower today. Track your other showers with the timer.
                        </div>
                      ) : (
                        <>
                          <div className="display-1 mb-3">
                            {formatTime(duration)}
                          </div>
                          
                          <div className="d-flex justify-content-center mb-4">
                            <button
                              type="button"
                              className={`btn btn-${isRunning ? 'outline-secondary' : 'success'} me-2`}
                              disabled={isRunning}
                              onClick={startTimer}
                            >
                              <FontAwesomeIcon icon={faPlay} className="me-2" />
                              Start
                            </button>
                            
                            <button
                              type="button"
                              className={`btn btn-${isRunning ? 'warning' : 'outline-secondary'} me-2`}
                              disabled={!isRunning}
                              onClick={pauseTimer}
                            >
                              <FontAwesomeIcon icon={faPause} className="me-2" />
                              Pause
                            </button>
                            
                            <button
                              type="button"
                              className="btn btn-danger me-2"
                              disabled={duration === 0}
                              onClick={resetTimer}
                            >
                              <FontAwesomeIcon icon={faStop} className="me-2" />
                              Reset
                            </button>
                            
                            {!skippedToday && (
                              <button
                                type="button"
                                className="btn btn-info text-white"
                                onClick={skipShower}
                              >
                                <FontAwesomeIcon icon={faWater} className="me-2" />
                                Skip Shower
                              </button>
                            )}
                          </div>
                          
                          {duration > 0 && (
                            <div className="d-flex justify-content-center mb-4">
                              <button
                                type="button"
                                className="btn btn-eco"
                                onClick={saveShower}
                                disabled={isRunning}
                              >
                                <FontAwesomeIcon icon={faPlus} className="me-2" />
                                Save This Shower
                              </button>
                            </div>
                          )}
                          
                          {duration > 0 && (
                            <p className="text-muted">
                              Estimated water usage: {totalWaterUsage.toFixed(1)} gallons
                            </p>
                          )}
                          
                          <div className="progress mt-4" style={{ height: '10px' }}>
                            <div
                              className="progress-bar"
                              role="progressbar"
                              style={{
                                width: `${Math.min(100, (duration / 10) * 100)}%`,
                                backgroundColor: duration > 8 ? '#dc3545' : 
                                              duration > 5 ? '#ffc107' : '#198754'
                              }}
                              aria-valuenow={duration}
                              aria-valuemin={0}
                              aria-valuemax={10}
                            ></div>
                          </div>
                          <div className="d-flex justify-content-between text-muted mt-1">
                            <small>Excellent (2-5 min)</small>
                            <small>Average (8 min)</small>
                            <small>Long (10+ min)</small>
                          </div>
                        </>
                      )}
                      
                      <div className="mt-4">
                        <p className="mb-1 text-muted">Today's shower count: {hasCompletedToday}/3</p>
                        <div className="d-flex justify-content-center">
                          {[...Array(3)].map((_, i) => (
                            <div 
                              key={i} 
                              className={`mx-1 rounded-circle ${i < hasCompletedToday ? 'bg-success' : 'bg-light'}`} 
                              style={{ width: '20px', height: '20px' }}
                            ></div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="card mb-4">
                <div className="card-header">
                  <h5 className="mb-0">Your Shower History</h5>
                </div>
                <div className="card-body p-0">
                  {showerEntries.length === 0 ? (
                    <div className="text-center py-4">
                      <p className="mb-0">No shower records yet. Use the timer to track your showers!</p>
                    </div>
                  ) : (
                    <div className="table-responsive">
                      <table className="table mb-0">
                        <thead>
                          <tr>
                            <th>Date</th>
                            <th>Type</th>
                            <th>Duration</th>
                            <th>Water Saved</th>
                            <th>Score</th>
                            <th>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {showerEntries.map(entry => (
                            <tr key={entry.id} className={isToday(entry.date) ? "table-light" : ""}>
                              <td>{formatDate(entry.date)}</td>
                              <td>
                                {entry.skipped ? (
                                  <span className="badge bg-info">Skipped</span>
                                ) : (
                                  <span className="badge bg-primary">Shower</span>
                                )}
                              </td>
                              <td>
                                {entry.skipped ? 'N/A' : formatTime(entry.duration)}
                              </td>
                              <td>{entry.waterSaved.toFixed(1)} gallons</td>
                              <td>
                                <span className="badge bg-success">
                                  +{calculateScore(entry)} points
                                </span>
                              </td>
                              <td>
                                <button
                                  type="button"
                                  className="btn btn-outline-danger btn-sm"
                                  onClick={() => removeEntry(entry.id)}
                                >
                                  <FontAwesomeIcon icon={faTrash} />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            )}
            
            <div className="row">
              <div className="col-md-6 mb-4">
                <div className="card h-100">
                  <div className="card-body">
                    <h5 className="card-title">Did you know?</h5>
                    <p>The average shower uses 2.5 gallons (9.5 liters) of water per minute.</p>
                    <p>By reducing your shower time from 8 minutes to 5 minutes, you can save:</p>
                    <ul>
                      <li>7.5 gallons (28.5 liters) per shower</li>
                      <li>2,738 gallons (10,362 liters) per year</li>
                      <li>Enough to fill a small swimming pool!</li>
                    </ul>
                  </div>
                </div>
              </div>
              
              <div className="col-md-6 mb-4">
                <div className="card h-100">
                  <div className="card-body">
                    <h5 className="card-title">Your Score</h5>
                    <p className="display-4 text-center">
                      {calculateTotalScore()} <small className="fs-6">points</small>
                    </p>
                    <div className="progress">
                      <div 
                        className="progress-bar bg-info" 
                        role="progressbar" 
                        style={{ 
                          width: `${(calculateTotalScore() / Math.max(30, calculateTotalScore() * 1.2)) * 100}%`
                        }}
                        aria-valuenow={calculateTotalScore()}
                        aria-valuemin={0}
                        aria-valuemax={Math.max(30, calculateTotalScore() * 1.2)}
                      ></div>
                    </div>
                    <p className="text-center mt-2">
                      <small className="text-muted">
                        {showerEntries.some(e => e.skipped) ? 
                          "Good job skipping at least one shower!" : 
                          showerEntries.length === 0 ?
                          "Start the timer when you shower or track a skipped shower." :
                          showerEntries.filter(e => !e.skipped && e.duration <= 5).length > 0 ?
                          "Great short showers! Keep up the good work." :
                          "Try to reduce your shower time even more."}
                      </small>
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="d-grid gap-2">
              <button 
                type="submit" 
                className="btn btn-eco btn-lg"
                disabled={loading || showerEntries.length === 0}
              >
                <FontAwesomeIcon icon={faSave} className="me-2" />
                {loading ? 'Submitting...' : 'Submit Shower Records'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ShowerTimer; 