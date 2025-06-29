import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, AppProvider } from './context';
import './styles/main.scss';
import './App.css';

// Components
import { PrivateRoute, Navigation } from './components';

// Pages
import {
  Home,
  Login,
  Register,
  Dashboard,
  Leaderboard,
  CreateCrew,
  JoinCrew,
  CrewDetail,
  ManageCrew,
  CreateChallenge,
  CarbonFootprint,
  FoodCarbon,
  RecyclingChallenge,
  ShowerTimer,
  Transportation,
  DemoMode
} from './pages';

// Error Boundary Component
class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error?: Error }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '20px', backgroundColor: '#ffebee', color: '#c62828' }}>
          <h1>Something went wrong!</h1>
          <p>Error: {this.state.error?.message}</p>
          <button onClick={() => window.location.reload()}>Reload Page</button>
        </div>
      );
    }

    return this.props.children;
  }
}

const App: React.FC = () => {
  console.log('App component rendering');
  
  // Force mobile scrolling to work
  useEffect(() => {
    const enableMobileScrolling = () => {
      // Set CSS properties to ensure scrolling works
      document.documentElement.style.overflowY = 'auto';
      (document.documentElement.style as any).webkitOverflowScrolling = 'touch';
      document.body.style.overflowY = 'auto';
      (document.body.style as any).webkitOverflowScrolling = 'touch';
      
      // Force touch scrolling on mobile
      if (window.innerWidth <= 768) {
        document.documentElement.style.touchAction = 'pan-y';
        document.body.style.touchAction = 'pan-y';
        
        // Add touch event listeners to ensure scrolling works
        const handleTouchStart = (e: TouchEvent) => {
          // Allow default touch behavior for scrolling
          e.stopPropagation();
        };
        
        const handleTouchMove = (e: TouchEvent) => {
          // Allow default touch behavior for scrolling
          e.stopPropagation();
        };
        
        document.addEventListener('touchstart', handleTouchStart, { passive: true });
        document.addEventListener('touchmove', handleTouchMove, { passive: true });
        
        return () => {
          document.removeEventListener('touchstart', handleTouchStart);
          document.removeEventListener('touchmove', handleTouchMove);
        };
      }
    };
    
    enableMobileScrolling();
    
    // Re-enable on resize
    window.addEventListener('resize', enableMobileScrolling);
    
    return () => {
      window.removeEventListener('resize', enableMobileScrolling);
    };
  }, []);

  return (
    <ErrorBoundary>
      <Router>
        <ErrorBoundary>
          <AuthProvider>
            <ErrorBoundary>
              <AppProvider>
                <ErrorBoundary>
                  <Navigation />
                  <Routes>
                    {/* Public Routes */}
                    <Route path="/" element={<Home />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/demo" element={<DemoMode />} />
                    
                    {/* Protected Routes */}
                    <Route path="/dashboard" element={<PrivateRoute element={<Dashboard />} />} />
                    <Route path="/leaderboard" element={<PrivateRoute element={<Leaderboard />} />} />
                    
                    {/* Crew Routes */}
                    <Route path="/crew" element={<PrivateRoute element={<CrewDetail />} />} />
                    <Route path="/crew/create" element={<PrivateRoute element={<CreateCrew />} />} />
                    <Route path="/crew/join" element={<PrivateRoute element={<JoinCrew />} />} />
                    <Route path="/crew/manage" element={<PrivateRoute element={<ManageCrew />} />} />
                    <Route path="/crew/challenges/create" element={<PrivateRoute element={<CreateChallenge />} />} />
                    <Route path="/crew/:id" element={<PrivateRoute element={<CrewDetail />} />} />
                    
                    {/* Challenge Routes */}
                    <Route path="/challenges/carbon-footprint" element={<PrivateRoute element={<CarbonFootprint />} />} />
                    <Route path="/challenges/recycling" element={<PrivateRoute element={<RecyclingChallenge />} />} />
                    <Route path="/challenges/shower-timer" element={<PrivateRoute element={<ShowerTimer />} />} />
                    <Route path="/challenges/food-carbon" element={<PrivateRoute element={<FoodCarbon />} />} />
                    <Route path="/challenges/transportation" element={<PrivateRoute element={<Transportation />} />} />
                    
                    {/* Fallback Route */}
                    <Route path="*" element={<Navigate to="/" />} />
                  </Routes>
                </ErrorBoundary>
              </AppProvider>
            </ErrorBoundary>
          </AuthProvider>
        </ErrorBoundary>
      </Router>
    </ErrorBoundary>
  );
};

export default App;
