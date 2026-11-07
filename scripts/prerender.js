/* eslint-disable no-console */
// Build-time prerender: renders every public route to static HTML so search
// engines (and visitors without JavaScript) get real content, page titles,
// descriptions and structured data. Also writes sitemap.xml and robots.txt.
//
// Runs after `react-scripts build` (see "postbuild" in package.json). Source
// files are compiled on the fly with the same Babel preset CRA uses.

const fs = require('fs');
const path = require('path');
const Module = require('module');

process.env.NODE_ENV = 'production';
process.env.BABEL_ENV = 'test'; // babel-preset-react-app's node/commonjs target

const babel = require('@babel/core');

const ROOT = path.resolve(__dirname, '..');
const SRC = path.join(ROOT, 'src');
const BUILD = path.join(ROOT, 'build');

const jsLoader = Module._extensions['.js'];
Module._extensions['.js'] = function load(module, filename) {
  if (!filename.startsWith(SRC)) return jsLoader(module, filename);
  const { code } = babel.transformSync(fs.readFileSync(filename, 'utf8'), {
    filename,
    babelrc: false,
    configFile: false,
    presets: [require.resolve('babel-preset-react-app')],
  });
  return module._compile(code, filename);
};
['.scss', '.css', '.svg', '.png'].forEach((ext) => {
  Module._extensions[ext] = () => {};
});

const React = require('react');
const { renderToString } = require('react-dom/server');
const { StaticRouter } = require('react-router-dom/server');
const { AppRoutes, BASENAME } = require(path.join(SRC, 'App.js'));
const { PAGES, SITE_URL, UPDATED, headHtml } = require(path.join(SRC, 'seo.js'));

const template = fs.readFileSync(path.join(BUILD, 'index.html'), 'utf8');
// CRA minifies index.html (dropping comments), so anchor on the default
// <title> and description tags and swap them for each page's own tags.
const SEO_BLOCK = /<title>[\s\S]*?<\/title>\s*<meta name="description"[^>]*>/;
if (!SEO_BLOCK.test(template)) throw new Error('index.html is missing the default <title> and description');
if (!template.includes('<div id="root"></div>')) throw new Error('build/index.html is already prerendered; run `npm run build`');

// Function replacements, so "$" in content is never treated as a pattern.
const page = (route, { markup = '', noindex = false } = {}) =>
  template
    .replace(SEO_BLOCK, () => headHtml(route, { noindex }))
    .replace('<div id="root"></div>', () => `<div id="root">${markup}</div>`);

const write = (rel, html) => {
  const file = path.join(BUILD, rel);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, html);
  console.log(`  prerendered ${rel}`);
};

const render = (route) =>
  renderToString(
    React.createElement(
      StaticRouter,
      { basename: BASENAME, location: `${BASENAME}${route}` },
      React.createElement(AppRoutes)
    )
  );

console.log('Prerendering pages…');
PAGES.forEach((route) => {
  const rel = route === '/' ? 'index.html' : path.join(route, 'index.html');
  write(rel, page(route, { markup: render(route) }));
});

// The original explainer URL: real content, canonical pointing at the new page.
write(path.join('ideal-conditions', 'index.html'), page('/ideal-conditions/', { markup: render('/ideal-conditions') }));

// Unknown paths: GitHub Pages serves 404.html, which boots the app client-side.
write('404.html', page('/', { noindex: true }));

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${PAGES.map(
  (route) => `  <url>
    <loc>${SITE_URL}${route}</loc>
    <lastmod>${UPDATED}</lastmod>
    <changefreq>${route === '/' ? 'daily' : 'weekly'}</changefreq>
    <priority>${route === '/' ? '1.0' : '0.8'}</priority>
  </url>`
).join('\n')}
</urlset>
`;
write('sitemap.xml', sitemap);
write('robots.txt', `User-agent: *\nAllow: /\n\nSitemap: ${SITE_URL}/sitemap.xml\n`);
console.log('Done.');
