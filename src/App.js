import React, { useEffect } from 'react';
import { BrowserRouter as Router, Route, Switch, useLocation } from 'react-router-dom';
import ReactGA from 'react-ga4';

// Components
import Wrapper from './components/Wrapper';
import Main from './components/Main';
import IdealConditions from './components/IdealConditions';

const TRACKING_ID = 'G-6Y949CPMQT';

const App = () => {
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
    <Router>
      <Wrapper>
        <Switch>
          <Route path="/" exact component={Main} />
          <Route path="/ideal-conditions" component={IdealConditions} />
        </Switch>
      </Wrapper>
    </Router>
  );
};

export default App;
