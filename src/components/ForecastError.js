import React from 'react';

const ForecastError = ({ name, message, onRetry }) => (
  <div className="notice" role="alert">
    <h2>The forecast for {name} didn’t load</h2>
    <p>The weather service didn’t respond ({message}). This is usually temporary.</p>
    <button type="button" className="btn btn--primary" onClick={onRetry}>
      Try again
    </button>
  </div>
);

export default ForecastError;
