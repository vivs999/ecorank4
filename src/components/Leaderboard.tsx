import React, { useState, useMemo } from 'react';
import { LeaderboardEntry } from '../types';
import { formatScore } from '../utils/helpers';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrophy, faMedal, faAward, faSearch, faSort, faSortUp, faSortDown } from '@fortawesome/free-solid-svg-icons';

interface LeaderboardProps {
  entries: LeaderboardEntry[];
  title: string;
  isLoading: boolean;
  error: string | null;
  showCrew?: boolean;
  showAchievements?: boolean;
  onCreateSampleData?: () => void;
}

const Leaderboard: React.FC<LeaderboardProps> = ({
  entries,
  title,
  isLoading,
  error,
  showCrew = false,
  showAchievements = false,
  onCreateSampleData,
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

  const getSortIcon = (field: 'position' | 'score') => {
    if (sortBy !== field) return faSort;
    return sortDirection === 'asc' ? faSortUp : faSortDown;
  };

  const getPositionIcon = (position: number) => {
    switch (position) {
      case 1: return faTrophy;
      case 2: return faMedal;
      case 3: return faAward;
      default: return null;
    }
  };

  const getPositionColor = (position: number) => {
    switch (position) {
      case 1: return 'text-warning';
      case 2: return 'text-secondary';
      case 3: return 'text-danger';
      default: return 'text-muted';
    }
  };

  if (isLoading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '300px' }}>
        <div className="spinner-border text-success" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-danger text-center">
        <h5 className="alert-heading">Error loading leaderboard</h5>
        <p className="mb-0">{error}</p>
      </div>
    );
  }

  if (entries.length === 0) {
    return (
      <div className="card shadow">
        <div className="card-header bg-success text-white">
          <h4 className="mb-0">{title}</h4>
        </div>
        <div className="card-body text-center py-5">
          <div className="text-muted">
            <h5>No leaderboard entries yet</h5>
            <p className="mb-4">Start submitting challenges to see your ranking on the leaderboard!</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="card shadow">
      <div className="card-header bg-success text-white">
        <h4 className="mb-0">{title}</h4>
      </div>
      <div className="card-body">
        <div className="mb-3">
          <div className="input-group">
            <span className="input-group-text">
              <FontAwesomeIcon icon={faSearch} />
            </span>
            <input
              type="text"
              className="form-control"
              placeholder="Search users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="table-responsive">
          <table className="table table-hover">
            <thead className="table-light">
              <tr>
                <th 
                  className="cursor-pointer"
                  onClick={() => handleSort('position')}
                  style={{ cursor: 'pointer' }}
                >
                  <div className="d-flex align-items-center">
                    <span>Rank</span>
                    <FontAwesomeIcon 
                      icon={getSortIcon('position')} 
                      className={`ms-2 ${sortBy === 'position' ? 'text-success' : 'text-muted'}`}
                    />
                  </div>
                </th>
                <th>User</th>
                {showCrew && <th>Crew</th>}
                <th 
                  className="cursor-pointer"
                  onClick={() => handleSort('score')}
                  style={{ cursor: 'pointer' }}
                >
                  <div className="d-flex align-items-center">
                    <span>Score</span>
                    <FontAwesomeIcon 
                      icon={getSortIcon('score')} 
                      className={`ms-2 ${sortBy === 'score' ? 'text-success' : 'text-muted'}`}
                    />
                  </div>
                </th>
                {showAchievements && <th>Achievements</th>}
              </tr>
            </thead>
            <tbody>
              {filteredAndSortedEntries.map((entry) => (
                <tr key={entry.userId} className="align-middle">
                  <td>
                    <div className="d-flex align-items-center">
                      {entry.position <= 3 ? (
                        <div className={`me-2 ${getPositionColor(entry.position)}`}>
                          <FontAwesomeIcon icon={getPositionIcon(entry.position)!} size="lg" />
                        </div>
                      ) : null}
                      <span className={`fw-bold ${entry.position <= 3 ? 'fs-5' : ''}`}>
                        {entry.position}
                      </span>
                    </div>
                  </td>
                  <td>
                    <div className="d-flex align-items-center">
                      <div className="bg-success rounded-circle d-flex align-items-center justify-content-center me-3" 
                           style={{ width: '40px', height: '40px' }}>
                        <span className="text-white fw-bold">
                          {entry.displayName.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <div className="fw-bold">{entry.displayName}</div>
                        {entry.tiedWith && entry.tiedWith > 1 && (
                          <small className="text-muted">Tied with {entry.tiedWith} others</small>
                        )}
                      </div>
                    </div>
                  </td>
                  {showCrew && (
                    <td>
                      <span className="badge bg-light text-dark">
                        {entry.crewName || '-'}
                      </span>
                    </td>
                  )}
                  <td>
                    <span className="fw-bold text-success fs-5">
                      {formatScore(entry.score)}
                    </span>
                  </td>
                  {showAchievements && (
                    <td>
                      <div className="d-flex flex-wrap gap-1">
                        {entry.achievements?.slice(0, 3).map((achievement, index) => (
                          <span key={index} className="badge bg-warning text-dark">
                            {achievement}
                          </span>
                        ))}
                        {entry.achievements && entry.achievements.length > 3 && (
                          <span className="badge bg-secondary">
                            +{entry.achievements.length - 3} more
                          </span>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredAndSortedEntries.length === 0 && searchQuery && (
          <div className="text-center py-4 text-muted">
            <p>No users found matching "{searchQuery}"</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Leaderboard; 