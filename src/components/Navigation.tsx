import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faHome, 
  faTrophy, 
  faUser, 
  faSignOutAlt,
  faMedal,
  faStar,
  faLeaf,
  faUsers,
  faPlay
} from '@fortawesome/free-solid-svg-icons';
import '../styles/game.css';

export const Navigation: React.FC = () => {
  const { userProfile, currentUser, logout } = useAuth();
  const [showDropdown, setShowDropdown] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const location = useLocation();

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isActive = (path: string) => location.pathname === path;

  // Determine home link based on authentication status
  const homeLink = (userProfile || currentUser) ? '/dashboard' : '/';

  const MobileNav = () => (
    <div className="mobile-nav safe-area-bottom">
      <Link to={homeLink} className={`mobile-nav-item ${isActive(homeLink) ? 'active' : ''}`}>
        <FontAwesomeIcon icon={faHome} />
        <span>Home</span>
      </Link>
      <Link to="/demo" className={`mobile-nav-item ${isActive('/demo') ? 'active' : ''}`}>
        <FontAwesomeIcon icon={faPlay} />
        <span>Challenges</span>
      </Link>
      <Link to="/crew/join" className={`mobile-nav-item ${isActive('/crew/join') ? 'active' : ''}`}>
        <FontAwesomeIcon icon={faUsers} />
        <span>Join Crew</span>
      </Link>
      <Link to="/leaderboard" className={`mobile-nav-item ${isActive('/leaderboard') ? 'active' : ''}`}>
        <FontAwesomeIcon icon={faTrophy} />
        <span>Rankings</span>
      </Link>
      <Link to="/crew" className={`mobile-nav-item ${isActive('/crew') ? 'active' : ''}`}>
        <FontAwesomeIcon icon={faUsers} />
        <span>Crew</span>
      </Link>
      <button 
        className="mobile-nav-item"
        onClick={() => setShowDropdown(!showDropdown)}
      >
        <FontAwesomeIcon icon={faUser} />
        <span>Profile</span>
      </button>
    </div>
  );

  return (
    <>
      <nav className="navbar navbar-expand-lg navbar-dark safe-area-top" style={{ background: 'var(--gradient-primary)' }}>
        <div className="container">
          <Link className="navbar-brand" to={homeLink}>
            <FontAwesomeIcon icon={faHome} className="me-2" />
            EcoRank
          </Link>

          <div className="collapse navbar-collapse">
            <ul className="navbar-nav me-auto mb-2 mb-lg-0">
              <li className="nav-item">
                <Link to={homeLink} className={`nav-link${isActive(homeLink) ? ' active' : ''}`}>Home</Link>
              </li>
              <li className="nav-item">
                <Link to="/demo" className={`nav-link${isActive('/demo') ? ' active' : ''}`}>Challenges</Link>
              </li>
              <li className="nav-item">
                <Link to="/leaderboard" className={`nav-link${isActive('/leaderboard') ? ' active' : ''}`}>Leaderboard</Link>
              </li>
              <li className="nav-item">
                <Link to="/crew/join" className={`nav-link${isActive('/crew/join') ? ' active' : ''}`}>Join Crew</Link>
              </li>
            </ul>
            <div className="d-flex align-items-center ms-auto">
              {userProfile && (
                <div className="position-relative">
                  <button 
                    className="game-button"
                    onClick={() => setShowDropdown(!showDropdown)}
                  >
                    <FontAwesomeIcon icon={faUser} className="me-2" />
                    {userProfile.displayName || 'User'}
                  </button>
                  {showDropdown && (
                    <div className="game-card position-absolute end-0 mt-2" style={{ minWidth: '200px', zIndex: 1000 }}>
                      <div className="p-3">
                        <div className="text-center mb-3">
                          <div className="achievement-badge mx-auto">
                            <FontAwesomeIcon icon={faMedal} size="2x" />
                          </div>
                          <h6 className="mt-2 mb-0">{userProfile.displayName}</h6>
                          <small className="text-muted">Level {Math.floor((userProfile.totalScore || 0) / 100) + 1}</small>
                        </div>
                        <div className="progress-bar mb-3">
                          <div 
                            className="progress-bar-fill" 
                            style={{ width: `${((userProfile.totalScore || 0) % 100)}%` }}
                          />
                        </div>
                        <div className="d-grid gap-2">
                          <Link to="/dashboard" className="game-button w-100">
                            <FontAwesomeIcon icon={faUser} className="me-2" />
                            Profile
                          </Link>
                          <button 
                            onClick={logout} 
                            className="game-button w-100"
                            style={{ background: 'var(--gradient-secondary)' }}
                          >
                            <FontAwesomeIcon icon={faSignOutAlt} className="me-2" />
                            Logout
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {isMobile && userProfile && (
        <>
          <div className="points-display mx-3 my-2">
            <FontAwesomeIcon icon={faStar} />
            <span>{userProfile.totalScore || 0} Points</span>
          </div>
          <MobileNav />
        </>
      )}

      {isMobile && showDropdown && (
        <div className="game-card mx-3 my-2">
          <div className="p-3">
            <div className="text-center mb-3">
              <div className="achievement-badge mx-auto">
                <FontAwesomeIcon icon={faMedal} size="2x" />
              </div>
              <h6 className="mt-2 mb-0">{userProfile?.displayName}</h6>
              <small className="text-muted">Level {Math.floor((userProfile?.totalScore || 0) / 100) + 1}</small>
            </div>
            
            <div className="progress-bar mb-3">
              <div 
                className="progress-bar-fill" 
                style={{ 
                  width: `${((userProfile?.totalScore || 0) % 100)}%` 
                }}
              />
            </div>

            <div className="d-grid gap-2">
              <Link to="/dashboard" className="game-button w-100">
                <FontAwesomeIcon icon={faUser} className="me-2" />
                Profile
              </Link>

              <button 
                onClick={logout} 
                className="game-button w-100"
                style={{ background: 'var(--gradient-secondary)' }}
              >
                <FontAwesomeIcon icon={faSignOutAlt} className="me-2" />
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}; 