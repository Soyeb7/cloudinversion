import React from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';

// Components
import Wrapper from './components/Wrapper';
import Main from './components/Main';
import IdealConditions from './components/IdealConditions';

const App = () => {
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
