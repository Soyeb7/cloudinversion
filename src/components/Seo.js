import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { seoFor } from '../seo';

// Keeps <head> tags in step with client-side navigation. The same tags are
// written into each page's HTML at build time by scripts/prerender.js.
const setMeta = (attr, key, content) => {
  let el = document.head.querySelector(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
};

const Seo = ({ title }) => {
  const { pathname } = useLocation();

  useEffect(() => {
    const s = seoFor(pathname);
    const pageTitle = title || s.title;
    document.title = pageTitle;
    setMeta('name', 'description', s.description);
    setMeta('property', 'og:title', pageTitle);
    setMeta('property', 'og:description', s.description);
    setMeta('property', 'og:url', s.canonical);
    let link = document.head.querySelector('link[rel="canonical"]');
    if (!link) {
      link = document.createElement('link');
      link.setAttribute('rel', 'canonical');
      document.head.appendChild(link);
    }
    link.setAttribute('href', s.canonical);
    let ld = document.getElementById('ld-json');
    if (!ld) {
      ld = document.createElement('script');
      ld.type = 'application/ld+json';
      ld.id = 'ld-json';
      document.head.appendChild(ld);
    }
    ld.textContent = JSON.stringify({ '@context': 'https://schema.org', '@graph': s.jsonLd });
  }, [pathname, title]);

  return null;
};

export default Seo;
