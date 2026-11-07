import React from 'react';
import ReactDOM from 'react-dom';
import './styles/styles.scss';
import App from './App';

const root = document.getElementById('root');

// Pages are prerendered at build time. Hydrate that markup when the page is
// exactly what was prerendered; a shared forecast link (?place=...) shows
// different content, so render it fresh instead.
if (root.hasChildNodes() && !window.location.search) {
  ReactDOM.hydrate(<App />, root);
} else {
  root.innerHTML = '';
  ReactDOM.render(<App />, root);
}
