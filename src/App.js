import React, { useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';
import ReactGA from 'react-ga4';

import Masthead from './components/Masthead';
import Footer from './components/Footer';
import Seo from './components/Seo';
import Home from './pages/Home';
import Science from './pages/Science';
import Region from './pages/Region';

const TRACKING_ID = 'G-6Y949CPMQT';
export const BASENAME = '/cloudinversion';

// Routes and page chrome, shared by the browser app and the build-time
// prerender (which wraps it in a StaticRouter instead).
export const AppRoutes = () => {
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
      <Seo />
      <Masthead />
      <main id="main">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/what-is-a-cloud-inversion" element={<Science />} />
          {/* Original URL of the explainer, kept so existing links work */}
          <Route path="/ideal-conditions" element={<Science />} />
          <Route path="/cloud-inversion-forecast/:slug" element={<Region />} />
          <Route path="*" element={<Home />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
};

const App = () => (
  <Router basename={BASENAME}>
    <AppRoutes />
  </Router>
);

export default App;
