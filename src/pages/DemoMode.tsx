import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faChevronLeft, 
  faChevronRight, 
  faPlay, 
  faLeaf, 
  faUsers, 
  faTrophy,
  faRecycle,
  faShower,
  faUtensils,
  faBars,
  faTimes
} from '@fortawesome/free-solid-svg-icons';

interface Challenge {
  id: string;
  title: string;
  description: string;
  icon: any;
  type: string;
  route: string;
}

const Challenges: React.FC = () => {
  const navigate = useNavigate();
  const [currentChallengeIndex, setCurrentChallengeIndex] = useState(0);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const challenges: Challenge[] = [
    {
      id: 'carbon-footprint',
      title: 'Carbon Footprint Calculator',
      description: 'Track your daily carbon emissions from transportation, energy use, and lifestyle choices. Get personalized insights and reduction tips.',
      icon: faLeaf,
      type: 'carbon',
      route: '/challenges/carbon-footprint'
    },
    {
      id: 'recycling',
      title: 'Recycling Challenge',
      description: 'Document your recycling efforts and learn about proper waste sorting. Earn points for every item recycled correctly.',
      icon: faRecycle,
      type: 'waste',
      route: '/challenges/recycling'
    },
    {
      id: 'shower-timer',
      title: 'Water Conservation',
      description: 'Time your showers and reduce water consumption. Set goals and track your progress towards more sustainable water usage.',
      icon: faShower,
      type: 'water',
      route: '/challenges/shower-timer'
    },
    {
      id: 'food-carbon',
      title: 'Sustainable Food Choices',
      description: 'Calculate the carbon footprint of your meals and discover eco-friendly alternatives. Make informed food decisions.',
      icon: faUtensils,
      type: 'food',
      route: '/challenges/food-carbon'
    }
  ];

  const currentChallenge = challenges[currentChallengeIndex];

  const nextChallenge = () => {
    setCurrentChallengeIndex((prev) => 
      prev === challenges.length - 1 ? 0 : prev + 1
    );
  };

  const prevChallenge = () => {
    setCurrentChallengeIndex((prev) => 
      prev === 0 ? challenges.length - 1 : prev - 1
    );
  };

  const goToChallenge = () => {
    navigate(currentChallenge.route);
  };

  const goToDashboard = () => {
    navigate('/dashboard');
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="container-fluid demo-mode">
      {/* Mobile Menu Toggle */}
      <button 
        className="mobile-menu-toggle d-mobile-block d-md-none"
        onClick={toggleSidebar}
      >
        <FontAwesomeIcon icon={sidebarOpen ? faTimes : faBars} />
      </button>

      <div className="row min-vh-100">
        {/* Left Sidebar - Challenge Navigation */}
        <div className={`col-md-3 bg-dark text-white p-3 ${sidebarOpen ? 'show' : ''}`}>
          <div className="d-flex flex-column h-100">
            <div className="mb-3">
              <h4 className="text-eco mb-1">EcoRank Challenges</h4>
              <p className="text-muted small">Interactive Challenge Showcase</p>
            </div>

            <div className="flex-grow-1">
              <h6 className="mb-2">Available Challenges</h6>
              <div className="list-group list-group-flush">
                {challenges.map((challenge, index) => (
                  <button
                    key={challenge.id}
                    className={`list-group-item list-group-item-action d-flex align-items-center py-2 ${
                      index === currentChallengeIndex ? 'active' : ''
                    }`}
                    onClick={() => {
                      setCurrentChallengeIndex(index);
                      setSidebarOpen(false); // Close sidebar on mobile
                    }}
                  >
                    <FontAwesomeIcon 
                      icon={challenge.icon} 
                      className="me-2" 
                      size="sm"
                    />
                    <div className="text-start">
                      <small className="fw-bold mb-0">{challenge.title}</small>
                      <br />
                      <small className="text-muted">{challenge.type}</small>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-3">
              <button
                className="btn btn-eco btn-sm w-100 mb-2"
                onClick={() => {
                  goToDashboard();
                  setSidebarOpen(false); // Close sidebar on mobile
                }}
              >
                <FontAwesomeIcon icon={faUsers} className="me-1" />
                View Dashboard
              </button>
              <button
                className="btn btn-outline-light btn-sm w-100"
                onClick={() => {
                  navigate('/');
                  setSidebarOpen(false); // Close sidebar on mobile
                }}
              >
                Back to Home
              </button>
            </div>
          </div>
        </div>

        {/* Main Content - Challenge Preview */}
        <div className="col-md-9 bg-light p-4">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <button
              className="btn btn-outline-secondary btn-sm"
              onClick={prevChallenge}
            >
              <FontAwesomeIcon icon={faChevronLeft} className="me-1" />
              Previous
            </button>
            
            <div className="text-center">
              <h4 className="mb-1">{currentChallenge.title}</h4>
              <p className="text-muted mb-0 small">
                Challenge {currentChallengeIndex + 1} of {challenges.length}
              </p>
            </div>

            <button
              className="btn btn-outline-secondary btn-sm"
              onClick={nextChallenge}
            >
              Next
              <FontAwesomeIcon icon={faChevronRight} className="ms-1" />
            </button>
          </div>

          <div className="card shadow-lg">
            <div className="card-body p-4">
              <div className="text-center mb-3">
                <div className="demo-icon-wrapper mb-2">
                  <FontAwesomeIcon 
                    icon={currentChallenge.icon} 
                    size="3x" 
                    className="text-eco"
                  />
                </div>
                <h5 className="mb-2">{currentChallenge.title}</h5>
                <p className="text-muted mb-3">
                  {currentChallenge.description}
                </p>
              </div>

              <div className="row mb-3">
                <div className="col-md-4">
                  <div className="text-center">
                    <div className="demo-stat">
                      <h4 className="text-eco">
                        {currentChallenge.type === 'carbon' ? '4' : 
                         currentChallenge.type === 'food' ? '3' :
                         currentChallenge.type === 'waste' ? '5' :
                         currentChallenge.type === 'water' ? '2' : '0'}
                      </h4>
                      <p className="text-muted small">
                        {currentChallenge.type === 'carbon' ? 'Transport Modes' : 
                         currentChallenge.type === 'food' ? 'Food Categories' :
                         currentChallenge.type === 'waste' ? 'Recycling Types' :
                         currentChallenge.type === 'water' ? 'Conservation Tips' : 'Features'}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="col-md-4">
                  <div className="text-center">
                    <div className="demo-stat">
                      <h4 className="text-eco">
                        {currentChallenge.type === 'carbon' ? 'Transport' : 
                         currentChallenge.type === 'food' ? 'Diet' :
                         currentChallenge.type === 'waste' ? 'Recycling' :
                         currentChallenge.type === 'water' ? 'Conservation' : 'Type'}
                      </h4>
                      <p className="text-muted small">Challenge Focus</p>
                    </div>
                  </div>
                </div>
                <div className="col-md-4">
                  <div className="text-center">
                    <div className="demo-stat">
                      <h4 className="text-eco">
                        {currentChallenge.type === 'carbon' ? 'Daily' : 
                         currentChallenge.type === 'food' ? 'Per Meal' :
                         currentChallenge.type === 'waste' ? 'Weekly' :
                         currentChallenge.type === 'water' ? 'Per Shower' : 'Frequency'}
                      </h4>
                      <p className="text-muted small">Tracking Frequency</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="text-center">
                <button
                  className="btn btn-eco"
                  onClick={goToChallenge}
                >
                  <FontAwesomeIcon icon={faPlay} className="me-2" />
                  Try This Challenge
                </button>
              </div>
            </div>
          </div>

          {/* Feature Highlights */}
          <div className="row mt-4">
            <div className="col-md-4">
              <div className="card h-100">
                <div className="card-body text-center p-3">
                  <FontAwesomeIcon icon={faUsers} className="text-primary mb-2" size="lg" />
                  <h6>Team Collaboration</h6>
                  <p className="text-muted small">Join crews and compete together on environmental challenges.</p>
                </div>
              </div>
            </div>
            <div className="col-md-4">
              <div className="card h-100">
                <div className="card-body text-center p-3">
                  <FontAwesomeIcon icon={faTrophy} className="text-warning mb-2" size="lg" />
                  <h6>Gamification</h6>
                  <p className="text-muted small">Earn points, badges, and climb leaderboards while saving the planet.</p>
                </div>
              </div>
            </div>
            <div className="col-md-4">
              <div className="card h-100">
                <div className="card-body text-center p-3">
                  <FontAwesomeIcon icon={faLeaf} className="text-success mb-2" size="lg" />
                  <h6>Real Impact</h6>
                  <p className="text-muted small">Track your actual environmental impact with detailed analytics.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Challenges; 