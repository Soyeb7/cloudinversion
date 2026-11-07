import React, { useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';
import ReactGA from 'react-ga4';

import Masthead from './components/Masthead';
import Footer from './components/Footer';
import Home from './pages/Home';
import Science from './pages/Science';

const TRACKING_ID = 'G-6Y949CPMQT';

const AppContent = () => {
  const location = useLocation();

  useEffect(() => {
    ReactGA.initialize(TRACKING_ID);
  }, []);

  useEffect(() => {
    ReactGA.send({ hitType: 'pageview', page: location.pathname + location.search });
    window.scrollTo(0, 0);
  }, [location.pathname]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="app">
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <Masthead />
      <main id="main">
        <Routes>
          <Route path="/" element={<Home />} />
          {/* Kept at its original path so existing links keep working */}
          <Route path="/ideal-conditions" element={<Science />} />
          <Route path="*" element={<Home />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
};

const App = () => (
  <Router basename="/cloudinversion">
    <AppContent />
  </Router>
);

export default App;
