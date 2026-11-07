import React from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';

const Mark = () => (
  <svg className="mark" viewBox="0 0 32 32" aria-hidden="true">
    <circle cx="22" cy="14" r="4" className="mark__sun" />
    <path d="M2 22 L12 8 L17 15 L20 12 L30 22 Z" className="mark__ridge" />
    <path d="M0 21c4-2 7 1 11-1s7-2 11 0 6-1 10 0v11H0z" className="mark__cloud" />
  </svg>
);

const Masthead = () => {
  const { pathname } = useLocation();
  const solid = pathname.replace(/\/$/, '') !== '';
  return (
  <header className={`masthead${solid ? ' masthead--solid' : ''}`}>
    <div className="masthead__inner">
      <Link to="/" className="brand">
        <Mark />
        <span>Cloud Inversion Checker</span>
      </Link>
      <nav aria-label="Main">
        <NavLink to="/ideal-conditions" className="masthead__link">
          How it works
        </NavLink>
      </nav>
    </div>
  </header>
  );
};

export default Masthead;
