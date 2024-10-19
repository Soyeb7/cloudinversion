import React from 'react';

const About = () => {
  return (
    <div className="weather-data">
      <div className="weather-data__box">
        <p>
          This application calculates the likelihood of a cloud inversion by analyzing atmospheric
          data, including temperature profiles and humidity at different altitudes. It considers:
          <ul>
            <li>Presence of a temperature inversion layer.</li>
            <li>High relative humidity below the inversion layer.</li>
            <li>Stable atmospheric conditions.</li>
          </ul>
        </p>
      </div>
    </div>
  );
};

export default About;
