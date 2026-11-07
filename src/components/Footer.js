import React from 'react';
import ReactGA from 'react-ga4';

const Footer = () => {
  const onEmail = (e) => {
    e.preventDefault();
    ReactGA.event({ category: 'Feedback', action: 'Clicked on email link' });
    window.location.href = `mailto:${['soyeb717', 'gmail.com'].join('@')}?subject=Cloud%20Inversion%20Checker`;
  };

  return (
    <footer className="footer">
      <div className="footer__inner">
        <p>
          Forecasts are model estimates, not observations. Always check your local mountain forecast before heading out
          in the dark, and carry a headtorch.
        </p>
        <p>
          Weather data by{' '}
          <a href="https://open-meteo.com/" target="_blank" rel="noopener noreferrer">
            Open-Meteo.com
          </a>{' '}
          (CC BY 4.0). Place names from GeoNames.
        </p>
        <p>
          Made by{' '}
          <a href="https://www.soyebpatel.co.uk" target="_blank" rel="noopener noreferrer">
            Soyeb Patel
          </a>
          . Spotted a forecast that was way off?{' '}
          <a href="#feedback" onClick={onEmail}>
            Send feedback
          </a>
          .
        </p>
      </div>
    </footer>
  );
};

export default Footer;
