// Small display helpers. Forecast times from Open-Meteo (timezone=auto) are
// local wall-clock strings like "2026-11-08T07:21" with no offset, so we
// format them as strings instead of letting Date shift them to the viewer's zone.

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const LONG_DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const parts = (iso) => {
  const [d, t = '00:00'] = iso.split('T');
  const [y, m, day] = d.split('-').map(Number);
  const [hh, mm] = t.split(':').map(Number);
  return { y, m, day, hh, mm, dow: new Date(Date.UTC(y, m - 1, day)).getUTCDay() };
};

export const clock = (iso) => iso.split('T')[1].slice(0, 5);

export const shortDay = (iso) => {
  const p = parts(iso);
  return `${DAYS[p.dow]} ${p.day}`;
};

export const longDate = (iso) => {
  const p = parts(iso);
  return `${LONG_DAYS[p.dow]} ${p.day} ${MONTHS[p.m - 1]}`;
};

// "Tomorrow", "Today", or weekday name relative to the place's local date.
export const relativeDay = (iso, todayIso) => {
  const a = Date.UTC(...ymd(iso));
  const b = Date.UTC(...ymd(todayIso));
  const diff = Math.round((a - b) / 86400000);
  if (diff === 0) return 'This morning';
  if (diff === 1) return 'Tomorrow';
  return LONG_DAYS[parts(iso).dow];
};

const ymd = (iso) => {
  const p = parts(iso);
  return [p.y, p.m - 1, p.day];
};

export const metres = (m) => `${Math.round(m).toLocaleString('en-GB')} m`;

// Round heights to a sensible precision: model levels are ~250 m apart, so
// claiming "487 m" would be false precision.
export const roughMetres = (m, step = 50) => metres(Math.round(m / step) * step);

export const temp = (c) => `${c > -0.05 && c < 0 ? 0 : c.toFixed(1)}°C`;

export const placeSubtitle = (p) =>
  [
    p.admin2 && p.admin2 !== p.name ? p.admin2 : null,
    p.admin1 && p.admin1 !== p.name && p.admin1 !== p.admin2 ? p.admin1 : null,
    p.country,
    p.elevation != null ? metres(p.elevation) : null,
  ]
    .filter(Boolean)
    .join(', ');
