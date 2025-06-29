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
  faUtensils
} from '@fortawesome/free-solid-svg-icons';

interface DemoChallenge {
  id: string;
  title: string;
  description: string;
  icon: any;
  type: string;
  route: string;
}

const DemoMode: React.FC = () => {
  const navigate = useNavigate();
  const [currentChallengeIndex, setCurrentChallengeIndex] = useState(0);

  const demoChallenges: DemoChallenge[] = [
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

  const currentChallenge = demoChallenges[currentChallengeIndex];

  const nextChallenge = () => {
    setCurrentChallengeIndex((prev) => 
      prev === demoChallenges.length - 1 ? 0 : prev + 1
    );
  };

  const prevChallenge = () => {
    setCurrentChallengeIndex((prev) => 
      prev === 0 ? demoChallenges.length - 1 : prev - 1
    );
  };

  const goToChallenge = () => {
    navigate(currentChallenge.route);
  };

  const goToDashboard = () => {
    navigate('/dashboard');
  };

  return (
    <div className="container-fluid demo-mode">
      <div className="row min-vh-100">
        {/* Left Sidebar - Challenge Navigation */}
        <div className="col-md-4 bg-dark text-white p-4">
          <div className="d-flex flex-column h-100">
            <div className="mb-4">
              <h2 className="text-eco mb-2">EcoRank Demo</h2>
              <p className="text-muted">Interactive Challenge Showcase</p>
            </div>

            <div className="flex-grow-1">
              <h5 className="mb-3">Available Challenges</h5>
              <div className="list-group list-group-flush">
                {demoChallenges.map((challenge, index) => (
                  <button
                    key={challenge.id}
                    className={`list-group-item list-group-item-action d-flex align-items-center ${
                      index === currentChallengeIndex ? 'active' : ''
                    }`}
                    onClick={() => setCurrentChallengeIndex(index)}
                  >
                    <FontAwesomeIcon 
                      icon={challenge.icon} 
                      className="me-3" 
                      size="lg"
                    />
                    <div className="text-start">
                      <h6 className="mb-1">{challenge.title}</h6>
                      <small className="text-muted">{challenge.type}</small>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-4">
              <button
                className="btn btn-eco w-100 mb-2"
                onClick={goToDashboard}
              >
                <FontAwesomeIcon icon={faUsers} className="me-2" />
                View Dashboard
              </button>
              <button
                className="btn btn-outline-light w-100"
                onClick={() => navigate('/')}
              >
                Back to Home
              </button>
            </div>
          </div>
        </div>

        {/* Main Content - Challenge Preview */}
        <div className="col-md-8 bg-light p-5">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <button
              className="btn btn-outline-secondary"
              onClick={prevChallenge}
            >
              <FontAwesomeIcon icon={faChevronLeft} className="me-2" />
              Previous
            </button>
            
            <div className="text-center">
              <h3 className="mb-1">{currentChallenge.title}</h3>
              <p className="text-muted mb-0">
                Challenge {currentChallengeIndex + 1} of {demoChallenges.length}
              </p>
            </div>

            <button
              className="btn btn-outline-secondary"
              onClick={nextChallenge}
            >
              Next
              <FontAwesomeIcon icon={faChevronRight} className="ms-2" />
            </button>
          </div>

          <div className="card shadow-lg">
            <div className="card-body p-5">
              <div className="text-center mb-4">
                <div className="demo-icon-wrapper mb-3">
                  <FontAwesomeIcon 
                    icon={currentChallenge.icon} 
                    size="4x" 
                    className="text-eco"
                  />
                </div>
                <h4 className="mb-3">{currentChallenge.title}</h4>
                <p className="lead text-muted mb-4">
                  {currentChallenge.description}
                </p>
              </div>

              <div className="row mb-4">
                <div className="col-md-4">
                  <div className="text-center">
                    <div className="demo-stat">
                      <h3 className="text-eco">85%</h3>
                      <p className="text-muted">Completion Rate</p>
                    </div>
                  </div>
                </div>
                <div className="col-md-4">
                  <div className="text-center">
                    <div className="demo-stat">
                      <h3 className="text-eco">1,247</h3>
                      <p className="text-muted">Active Users</p>
                    </div>
                  </div>
                </div>
                <div className="col-md-4">
                  <div className="text-center">
                    <div className="demo-stat">
                      <h3 className="text-eco">4.8★</h3>
                      <p className="text-muted">User Rating</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="text-center">
                <button
                  className="btn btn-eco btn-lg"
                  onClick={goToChallenge}
                >
                  <FontAwesomeIcon icon={faPlay} className="me-2" />
                  Try This Challenge
                </button>
              </div>
            </div>
          </div>

          {/* Feature Highlights */}
          <div className="row mt-5">
            <div className="col-md-4">
              <div className="card h-100">
                <div className="card-body text-center">
                  <FontAwesomeIcon icon={faUsers} className="text-primary mb-3" size="2x" />
                  <h5>Team Collaboration</h5>
                  <p className="text-muted">Join crews and compete together on environmental challenges.</p>
                </div>
              </div>
            </div>
            <div className="col-md-4">
              <div className="card h-100">
                <div className="card-body text-center">
                  <FontAwesomeIcon icon={faTrophy} className="text-warning mb-3" size="2x" />
                  <h5>Gamification</h5>
                  <p className="text-muted">Earn points, badges, and climb leaderboards while saving the planet.</p>
                </div>
              </div>
            </div>
            <div className="col-md-4">
              <div className="card h-100">
                <div className="card-body text-center">
                  <FontAwesomeIcon icon={faLeaf} className="text-success mb-3" size="2x" />
                  <h5>Real Impact</h5>
                  <p className="text-muted">Track your actual environmental impact with detailed analytics.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DemoMode; 