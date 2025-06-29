import React, { useState, useMemo } from 'react';
import { LeaderboardEntry } from '../types';
import { formatScore } from '../utils/helpers';

interface LeaderboardProps {
  entries: LeaderboardEntry[];
  title: string;
  isLoading: boolean;
  error: string | null;
  showCrew?: boolean;
  showAchievements?: boolean;
}

const Leaderboard: React.FC<LeaderboardProps> = ({
  entries,
  title,
  isLoading,
  error,
  showCrew = false,
  showAchievements = false,
}) => {
  const [sortBy, setSortBy] = useState<'position' | 'score'>('position');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [searchQuery, setSearchQuery] = useState('');

  const handleSort = (field: 'position' | 'score') => {
    if (field === sortBy) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortDirection('asc');
    }
  };

  const filteredAndSortedEntries = useMemo(() => {
    let filtered = entries;
    
    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(entry => 
        entry.displayName.toLowerCase().includes(query)
      );
    }

    // Apply sorting
    return [...filtered].sort((a, b) => {
      const multiplier = sortDirection === 'asc' ? 1 : -1;
      if (sortBy === 'position') {
        return (a.position - b.position) * multiplier;
      }
      return (a.score - b.score) * multiplier;
    });
  }, [entries, sortBy, sortDirection, searchQuery]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-500 text-center p-4 bg-red-50 rounded-lg">
        <p className="font-medium">Error loading leaderboard</p>
        <p className="text-sm mt-1">{error}</p>
      </div>
    );
  }

  if (entries.length === 0) {
    return (
      <div className="text-gray-500 text-center p-8 bg-gray-50 rounded-lg">
        <p className="font-medium">No entries found</p>
        <p className="text-sm mt-1">Be the first to join the leaderboard!</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md">
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
        <div className="mt-4">
          <input
            type="text"
            placeholder="Search users..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('position')}
              >
                <div className="flex items-center space-x-1">
                  <span>Rank</span>
                  {sortBy === 'position' && (
                    <span className="text-green-500">
                      {sortDirection === 'asc' ? '↑' : '↓'}
                    </span>
                  )}
                </div>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                User
              </th>
              {showCrew && (
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Crew
                </th>
              )}
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('score')}
              >
                <div className="flex items-center space-x-1">
                  <span>Score</span>
                  {sortBy === 'score' && (
                    <span className="text-green-500">
                      {sortDirection === 'asc' ? '↑' : '↓'}
                    </span>
                  )}
                </div>
              </th>
              {showAchievements && (
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Achievements
                </th>
              )}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredAndSortedEntries.map((entry) => (
              <tr key={entry.userId} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  <div className="flex items-center">
                    {entry.position <= 3 ? (
                      <span className={`inline-flex items-center justify-center h-8 w-8 rounded-full ${
                        entry.position === 1 ? 'bg-yellow-100 text-yellow-800' :
                        entry.position === 2 ? 'bg-gray-100 text-gray-800' :
                        'bg-orange-100 text-orange-800'
                      }`}>
                        {entry.position}
                      </span>
                    ) : (
                      <span className="text-gray-500">{entry.position}</span>
                    )}
                    {entry.tiedWith && entry.tiedWith > 1 && (
                      <span className="text-gray-400 ml-1">(T-{entry.tiedWith})</span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {entry.displayName}
                </td>
                {showCrew && (
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {entry.crewName || '-'}
                  </td>
                )}
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">
                  {formatScore(entry.score)}
                </td>
                {showAchievements && (
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {entry.achievements?.length || 0}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filteredAndSortedEntries.length === 0 && searchQuery && (
        <div className="text-center py-8 text-gray-500">
          No users found matching "{searchQuery}"
        </div>
      )}
    </div>
  );
};

export default Leaderboard; 