import React from 'react';
import { Link } from 'react-router-dom';

const About = () => {
  return (
    <div className="weather-data">
      <div className="weather-data__box">
        <h2><strong> About Cloud Inversions </strong></h2>
        <p>
          A cloud inversion occurs when warmer air sits above cooler air, trapping moisture and clouds below. 
          This app analyzes the likelihood of a cloud inversion by examining atmospheric data such as temperature 
          profiles, humidity, and wind speed.
        </p>
        <p>
          For more information on the ideal weather conditions for a cloud inversion, 
          <Link to="/ideal-conditions"> click here</Link>.
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
            onClick={(e) => { 
              e.preventDefault(); 
              window.location.href = 'mailto:soyeb717@gmail.com'; 
            }}
          >
             soyeb717[at]gmail[dot]com
          </a>.
        </p>
      </div>
    </div>
  );
};

export default About;
