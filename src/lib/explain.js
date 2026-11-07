// Plain-language explanations of an assessment from inversion.js.
import { roughMetres, temp } from './format';

const statusOf = (v) => (v >= 0.7 ? 'good' : v >= 0.4 ? 'fair' : 'poor');
const pct = (x) => `${Math.round(x)}%`;
const ms = (x) => `${x.toFixed(1)} m/s`;

const LIMITS = {
  lid: 'The lid is weak. Low cloud may be around, but it’s more likely to be a patchy grey layer than a flat sea of cloud.',
  moisture: 'There’s a warm lid, but the air underneath is too dry for cloud. Expect clear, cold valleys rather than a cloud sea.',
  clearAbove: 'Cloud may be trapped under the lid, but there’s more cloud above it, so the view and the sunrise may be blocked.',
  wind: 'The wind is strong enough to stir the layers and break any cloud sea up.',
  dry: 'Rain around dawn points to a passing weather system rather than settled, layered air.',
};

// The ingredient that is holding the score back the most. Clear air above and
// wind scale the score less than the lid and moisture, so they're compared on
// the same footing as they enter the score.
function limitingFactor(ing) {
  const eff = {
    lid: ing.lid,
    moisture: ing.moisture,
    clearAbove: 0.35 + 0.65 * ing.clearAbove,
    wind: 0.4 + 0.6 * ing.wind,
    dry: ing.dry,
  };
  return Object.keys(eff).reduce((a, b) => (eff[b] < eff[a] ? b : a));
}

export function headline(m) {
  const ing = m.ingredients;
  if (!m.inversion && !m.stable) {
    return 'No inversion in the forecast. The air cools steadily with height, so cloud will mix upwards instead of settling in the valleys.';
  }
  const limit = limitingFactor(ing);
  if (m.band.key === 'unlikely' || m.band.key === 'possible') {
    const text = LIMITS[limit];
    return m.band.key === 'possible' ? `${text} Still worth a look if you’re nearby.` : text;
  }
  const strong = m.inversion && m.inversion.strength >= 2.5;
  let text;
  if (m.fogOnly) {
    text = `A ${strong ? 'strong lid over a ' : ''}clear, still night: good for fog pooling in the valleys, with clearer air above.`;
  } else if (m.band.key === 'very-likely') {
    text = 'A textbook set-up: a warm lid with saturated air trapped beneath it and drier, clearer air above.';
  } else {
    text = 'The main ingredients are there: a warm lid with cloud forecast beneath it.';
  }
  if (limit === 'clearAbove' && ing.clearAbove < 0.4) text += ' Some higher cloud could dull the sunrise.';
  if (limit === 'wind' && ing.wind < 0.5) text += ' A breeze may ruffle the cloud tops.';
  return text;
}

export function factors(m) {
  const r = m.readings;
  const inv = m.inversion;
  const out = [];

  out.push({
    key: 'lid',
    title: 'Warm lid',
    status: statusOf(m.ingredients.lid),
    value: inv
      ? `${inv.strength >= 0 ? '+' : ''}${inv.strength.toFixed(1)}°C`
      : m.stable
      ? 'Weak'
      : 'None',
    detail: inv
      ? `Air warms by ${inv.strength.toFixed(1)}°C between ${roughMetres(inv.base)} and ${roughMetres(inv.top)}.${
          inv.strength >= 3 ? ' That’s a strong lid.' : inv.strength < 1 ? ' That’s a weak lid that can break easily.' : ''
        }`
      : m.stable
      ? `Temperature barely changes between ${roughMetres(m.stable.base)} and ${roughMetres(m.stable.top)}. A weak cap at best.`
      : 'Temperature falls steadily with height in the lowest 2 km, so nothing holds cloud down.',
  });

  const moistBits = [];
  if (r.lowCloud >= 20) moistBits.push(`low cloud cover ${pct(r.lowCloud)}`);
  moistBits.push(`humidity up to ${pct(r.belowRh)} below the lid`);
  if (r.spread != null) moistBits.push(`dew point ${r.spread.toFixed(1)}°C below the air temperature`);
  if (r.visibility != null && r.visibility < 5000) moistBits.push(`visibility ${(r.visibility / 1000).toFixed(1)} km`);
  out.push({
    key: 'moisture',
    title: 'Cloud underneath',
    status: statusOf(m.ingredients.moisture),
    value: r.lowCloud >= 20 ? pct(r.lowCloud) : pct(r.belowRh),
    valueNote: r.lowCloud >= 20 ? 'low cloud' : 'humidity',
    detail: `${capitalise(moistBits.join(', '))}.${m.ingredients.moisture < 0.4 ? ' Too dry for cloud or fog to form.' : ''}`,
  });

  out.push({
    key: 'clear',
    title: 'Clear air above',
    status: statusOf(m.ingredients.clearAbove),
    value: pct(Math.max(r.midCloud || 0, r.highCloud || 0)),
    valueNote: 'cloud above',
    detail: `Humidity above the lid ${pct(r.aboveRh)}; mid-level cloud ${pct(r.midCloud || 0)}, high cloud ${pct(
      r.highCloud || 0
    )}.${m.ingredients.clearAbove < 0.4 ? ' Expect a grey sky above the cloud sea.' : ''}`,
  });

  out.push({
    key: 'wind',
    title: 'Wind',
    status: statusOf(m.ingredients.wind),
    value: ms(r.wind),
    detail: `${ms(r.wind)} near the ground and about ${ms(r.lidWind)} at lid height. ${
      r.wind < 3 ? 'Calm enough for the layers to stay put.' : r.wind < 6 ? 'A breeze that may ruffle the cloud tops.' : 'Strong enough to mix the layers.'
    }`,
  });

  out.push({
    key: 'dry',
    title: 'Rain',
    status: statusOf(m.ingredients.dry),
    value: r.precip > 0.05 ? `${r.precip.toFixed(1)} mm` : 'Dry',
    detail: r.precip > 0.05 ? 'Rain or drizzle forecast around dawn.' : 'No rain forecast around dawn.',
  });

  return out;
}

export function contextNotes(m) {
  const c = m.context;
  const notes = [];
  const trend = c.trend >= 2 ? 'and rising' : c.trend <= -2 ? 'and falling' : 'and steady';
  notes.push({
    label: 'Pressure',
    value: `${Math.round(c.pressure)} hPa`,
    note: `${c.pressure >= 1022 ? 'High' : c.pressure < 1008 ? 'Low' : 'Average'} ${trend}`,
  });
  notes.push({
    label: 'Overnight cloud',
    value: pct(c.cloudyNight),
    note: c.cloudyNight < 30 ? 'Clear night, so the ground cools fast' : c.cloudyNight > 70 ? 'Cloudy night, so less cooling' : 'Partly cloudy night',
  });
  notes.push({
    label: 'Rain in the last day',
    value: `${c.rain.toFixed(1)} mm`,
    note: c.rain > 1 ? 'Damp ground helps valley fog' : 'Mostly dry',
  });
  const lidTop = m.inversion && m.profile.find((p) => p.z === m.inversion.top);
  notes.push({
    label: 'Valley temperature',
    value: temp(m.readings.surfaceTemp),
    note: lidTop ? `${temp(lidTop.t)} up at ${roughMetres(lidTop.z)}` : 'At model ground level',
  });
  return notes;
}

function capitalise(s) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
