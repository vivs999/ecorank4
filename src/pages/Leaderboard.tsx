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
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Leaderboard</h1>
        <div className="flex space-x-4">
          <button
            onClick={() => handleTabChange('current')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              activeTab === 'current'
                ? 'bg-green-500 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Current Challenge
          </button>
          <button
            onClick={() => handleTabChange('overall')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              activeTab === 'overall'
                ? 'bg-green-500 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
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
  );
};

export default LeaderboardPage; 