import React from 'react';
import { Link } from 'react-router-dom';
import ReactGA from 'react-ga4';

const About = () => {
  // Track event for "ideal-conditions" link
  const handleConditionsClick = () => {
    ReactGA.event({
      category: 'Navigation',
      action: 'Clicked to view Ideal Conditions',
    });
  };

  // Track event for email feedback link
  const handleEmailClick = (e) => {
    e.preventDefault();
    ReactGA.event({
      category: 'Feedback',
      action: 'Clicked on email link',
    });
    window.location.href = 'mailto:soyeb717@gmail.com';
  };

  return (
    <div className="weather-data">
      <div className="weather-data__box">
        <h2><strong>About Cloud Inversions</strong></h2>
        <p>
          A cloud inversion occurs when warmer air sits above cooler air, trapping moisture and clouds below. 
          This app analyzes the likelihood of a cloud inversion by examining atmospheric data such as temperature 
          profiles, humidity, and wind speed.
        </p>
        <p>
          For more information on the ideal weather conditions for a cloud inversion, 
          <Link to="/ideal-conditions" onClick={handleConditionsClick}> click here</Link>.
        </p>

        {/* Experimental Notice */}
        <p>
          <strong>Note:</strong> This app is experimental and is constantly being improved to enhance accuracy. 
          We appreciate any feedback to help us improve.
        </p>

        {/* Protected Email for Feedback */}
        <p>
          For feedback, please contact  
          <a 
            href="mailto:soyeb717[at]gmail[dot]com" 
            onClick={handleEmailClick}
          >
             soyeb717[at]gmail[dot]com
          </a>.
        </p>
      </div>
    </div>
  );
};

export default About;
