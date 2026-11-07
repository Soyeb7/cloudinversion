// Page titles, descriptions and structured data for every route. Used by the
// <Seo> component in the browser and by scripts/prerender.js at build time,
// so search engines get the same tags without running JavaScript.

import { REGIONS, regionBySlug } from './data/regions';
import { FAQ } from './data/faq';

export const SITE_URL = 'https://soyeb7.github.io/cloudinversion';
export const SITE_NAME = 'Cloud Inversion Checker';
export const AUTHOR = { '@type': 'Person', name: 'Soyeb Patel', url: 'https://www.soyebpatel.co.uk' };
export const UPDATED = '2026-11-07';
const OG_IMAGE = `${SITE_URL}/og-image.png`;

const url = (path) => `${SITE_URL}${path}`;

const crumbs = (items) => ({
  '@type': 'BreadcrumbList',
  itemListElement: items.map((it, i) => ({ '@type': 'ListItem', position: i + 1, name: it.name, item: url(it.path) })),
});

// Every indexable page, in sitemap order.
export const PAGES = ['/', '/what-is-a-cloud-inversion/', ...REGIONS.map((r) => `/cloud-inversion-forecast/${r.slug}/`)];

export function seoFor(pathname) {
  const path = pathname.endsWith('/') ? pathname : `${pathname}/`;

  if (path === '/what-is-a-cloud-inversion/' || path === '/ideal-conditions/') {
    const canonical = url('/what-is-a-cloud-inversion/');
    return {
      title: 'What Is a Cloud Inversion? How and When They Form | Cloud Inversion Checker',
      description:
        'How cloud inversions form, the ideal conditions (high pressure, light winds, clear nights, damp ground), the best time of day and year, and how high you need to climb to see one.',
      canonical,
      jsonLd: [
        {
          '@type': 'Article',
          headline: 'What is a cloud inversion? How and when they form',
          description:
            'The science of cloud inversions: temperature inversions, valley fog, anticyclonic stratus, ideal conditions and how high to climb.',
          author: AUTHOR,
          datePublished: '2024-10-19',
          dateModified: UPDATED,
          image: OG_IMAGE,
          mainEntityOfPage: canonical,
          publisher: AUTHOR,
        },
        crumbs([
          { name: 'Cloud Inversion Checker', path: '/' },
          { name: 'What is a cloud inversion?', path: '/what-is-a-cloud-inversion/' },
        ]),
      ],
    };
  }

  const m = path.match(/^\/cloud-inversion-forecast\/([a-z-]+)\/$/);
  const region = m && regionBySlug(m[1]);
  if (region) {
    const canonical = url(path);
    const tops = region.viewpoints.map((v) => v.name).slice(0, 3).join(', ');
    return {
      title: `${region.name} Cloud Inversion Forecast | Cloud Inversion Checker`,
      description: `Will there be a cloud inversion in the ${region.name} at sunrise? Free 5-day forecast with estimated cloud-top heights and the best viewpoints, including ${tops}.`,
      canonical,
      jsonLd: [
        {
          '@type': 'WebPage',
          name: `${region.name} cloud inversion forecast`,
          url: canonical,
          about: region.viewpoints.map((v) => ({
            '@type': 'Place',
            name: v.name,
            geo: { '@type': 'GeoCoordinates', latitude: v.latitude, longitude: v.longitude, elevation: v.height },
          })),
        },
        crumbs([
          { name: 'Cloud Inversion Checker', path: '/' },
          { name: `${region.name} forecast`, path },
        ]),
      ],
    };
  }

  return {
    title: 'Cloud Inversion Checker: Free Cloud Inversion Forecast for Any Hill or Valley',
    description:
      'Will there be a cloud inversion at sunrise? Check the chance of a sea of cloud over the next 5 mornings for any town, valley or hill, with the estimated cloud-top height and how high to climb.',
    canonical: url('/'),
    jsonLd: [
      {
        '@type': 'WebSite',
        name: SITE_NAME,
        url: url('/'),
        description: 'Cloud inversion forecasts for any hill or valley.',
        inLanguage: 'en-GB',
      },
      {
        '@type': 'WebApplication',
        name: SITE_NAME,
        url: url('/'),
        applicationCategory: 'WeatherApplication',
        operatingSystem: 'Any',
        browserRequirements: 'Requires JavaScript',
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'GBP' },
        author: AUTHOR,
        description:
          'Forecasts the likelihood of a cloud inversion (sea of clouds) at sunrise from weather-model temperature and humidity profiles, with estimated cloud-top heights.',
      },
      {
        '@type': 'FAQPage',
        mainEntity: FAQ.map((f) => ({
          '@type': 'Question',
          name: f.q,
          acceptedAnswer: { '@type': 'Answer', text: f.a },
        })),
      },
    ],
  };
}

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

// The <head> tags for a route, as an HTML string (used at build time).
export function headHtml(pathname, { noindex = false } = {}) {
  const s = seoFor(pathname);
  const ld = JSON.stringify({ '@context': 'https://schema.org', '@graph': s.jsonLd }).replace(/</g, '\\u003c');
  return [
    `<title>${esc(s.title)}</title>`,
    `<meta name="description" content="${esc(s.description)}" />`,
    noindex ? '<meta name="robots" content="noindex" />' : `<link rel="canonical" href="${s.canonical}" />`,
    `<meta property="og:type" content="website" />`,
    `<meta property="og:site_name" content="${SITE_NAME}" />`,
    `<meta property="og:title" content="${esc(s.title)}" />`,
    `<meta property="og:description" content="${esc(s.description)}" />`,
    `<meta property="og:url" content="${s.canonical}" />`,
    `<meta property="og:image" content="${OG_IMAGE}" />`,
    `<meta property="og:image:width" content="1200" />`,
    `<meta property="og:image:height" content="630" />`,
    `<meta property="og:locale" content="en_GB" />`,
    `<meta name="twitter:card" content="summary_large_image" />`,
    `<meta name="twitter:title" content="${esc(s.title)}" />`,
    `<meta name="twitter:description" content="${esc(s.description)}" />`,
    `<meta name="twitter:image" content="${OG_IMAGE}" />`,
    `<script type="application/ld+json" id="ld-json">${ld}</script>`,
  ].join('\n    ');
}
