import React from 'react';

const ForecastSkeleton = ({ name }) => (
  <div className="forecast forecast--loading" aria-busy="true">
    <p className="sr-only" role="status">
      Loading the forecast for {name}…
    </p>
    <div className="skeleton skeleton--title" />
    <div className="skeleton-row">
      {[0, 1, 2, 3, 4].map((i) => (
        <div key={i} className="skeleton skeleton--tab" />
      ))}
    </div>
    <div className="skeleton skeleton--panel" />
  </div>
);

export default ForecastSkeleton;
