import React, { useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';
import ReactGA from 'react-ga4';

// Components
import Wrapper from './components/Wrapper';
import Main from './components/Main';
import IdealConditions from './components/IdealConditions';

// Initialize Google Analytics with your tracking ID
const TRACKING_ID = 'G-6Y949CPMQT'; // Replace with your GA Measurement ID

const AppContent = () => {
  const location = useLocation();

  // Initialize GA on first load
  useEffect(() => {
    ReactGA.initialize(TRACKING_ID);
  }, []);

  // Track pageviews when location changes
  useEffect(() => {
    ReactGA.send({ hitType: "pageview", page: location.pathname + location.search });
  }, [location]);

  return (
    <Wrapper>
      <Routes>
        <Route path="/" element={<Main />} />
        <Route path="/ideal-conditions" element={<IdealConditions />} />
      </Routes>
    </Wrapper>
  );
};

// App component wrapping AppContent in the Router
const App = () => (
  <Router>
    <AppContent />
  </Router>
);

export default App;
