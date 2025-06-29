import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import Leaderboard from '../components/Leaderboard';
import { LeaderboardEntry } from '../types';

const LeaderboardPage: React.FC = () => {
  const { leaderboard, isLoading, error, refreshData } = useApp();
  const [activeTab, setActiveTab] = useState<'current' | 'overall'>('current');
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  useEffect(() => {
    if (leaderboard) {
      setEntries(leaderboard);
    }
  }, [leaderboard]);

  const handleTabChange = (tab: 'current' | 'overall') => {
    setActiveTab(tab);
  };

  return (
    <div className="container-fluid leaderboard-container">
      <div className="row justify-content-center">
        <div className="col-12 col-lg-10">
          <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mb-4">
            <h1 className="h2 mb-3 mb-md-0">Leaderboard</h1>
            <div className="btn-group w-100 w-md-auto" role="group">
              <button
                type="button"
                className={`btn ${activeTab === 'current' ? 'btn-success' : 'btn-outline-success'}`}
                onClick={() => handleTabChange('current')}
              >
                Current Challenge
              </button>
              <button
                type="button"
                className={`btn ${activeTab === 'overall' ? 'btn-success' : 'btn-outline-success'}`}
                onClick={() => handleTabChange('overall')}
              >
                Overall Rankings
              </button>
            </div>
          </div>

          <Leaderboard
            entries={entries}
            title={activeTab === 'current' ? 'Current Challenge Rankings' : 'Overall Rankings'}
            isLoading={isLoading}
            error={error}
            showCrew={true}
            showAchievements={true}
          />
        </div>
      </div>
    </div>
  );
};

export default LeaderboardPage; 