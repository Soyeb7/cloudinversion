import React from 'react';
import { Link } from 'react-router-dom';
import ReactGA from 'react-ga4';
import { REGIONS } from '../data/regions';

const Footer = () => {
  const onEmail = (e) => {
    e.preventDefault();
    ReactGA.event({ category: 'Feedback', action: 'Clicked on email link' });
    window.location.href = `mailto:${['soyeb717', 'gmail.com'].join('@')}?subject=Cloud%20Inversion%20Checker`;
  };

  return (
    <footer className="footer">
      <div className="container footer__grid">
        <div className="footer__about">
          <p className="footer__brand">Cloud Inversion Checker</p>
          <p>
            Forecasts are model estimates, not observations. Always check your local mountain forecast before heading
            out in the dark, and carry a headtorch.
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
        <nav className="footer__col" aria-label="Regional forecasts">
          <p className="footer__heading">Forecasts</p>
          <ul>
            {REGIONS.map((r) => (
              <li key={r.slug}>
                <Link to={`/cloud-inversion-forecast/${r.slug}/`}>{r.short}</Link>
              </li>
            ))}
          </ul>
        </nav>
        <nav className="footer__col" aria-label="Learn">
          <p className="footer__heading">Learn</p>
          <ul>
            <li>
              <Link to="/what-is-a-cloud-inversion/">What is a cloud inversion?</Link>
            </li>
            <li>
              <a href="/cloudinversion/what-is-a-cloud-inversion/#conditions">Ideal conditions</a>
            </li>
            <li>
              <a href="/cloudinversion/what-is-a-cloud-inversion/#method">How the forecast works</a>
            </li>
          </ul>
          <p className="footer__credit">
            Weather data by{' '}
            <a href="https://open-meteo.com/" target="_blank" rel="noopener noreferrer">
              Open-Meteo.com
            </a>{' '}
            (CC BY 4.0). Places from GeoNames and © OpenStreetMap contributors.
          </p>
        </nav>
      </div>
    </footer>
  );
};

export default Footer;
