// Classic UK cloud-inversion areas. Each has a valley "base" used for the
// forecast and a list of viewpoints with their published summit heights
// (metres). Coordinates are summit positions from OpenStreetMap.

const vp = (name, latitude, longitude, height, note) => ({ name, latitude, longitude, height, note });

export const REGIONS = [
  {
    slug: 'lake-district',
    name: 'Lake District',
    short: 'Lake District',
    country: 'England',
    base: { name: 'Keswick', latitude: 54.5995, longitude: -3.1326, elevation: 93, admin1: 'Lake District', country: 'United Kingdom' },
    summary:
      'Deep glacial valleys and big lakes make the Lake District one of the best places in Britain to look down on a sea of cloud.',
    intro: [
      'On still autumn and winter mornings, cold damp air drains off the fells and pools over Derwentwater, Ullswater and Windermere. When a warm lid sits above it, the valleys fill with flat, white cloud and the fells poke out like islands.',
      'Shallow valley fog can be seen from small hills like Latrigg or Cat Bells. Deeper anticyclonic cloud seas often need a 900 m summit such as Helvellyn or Skiddaw.',
    ],
    viewpoints: [
      vp('Latrigg', 54.6124, -3.1179, 368, 'Short walk from Keswick; looks straight down on Derwentwater and Bassenthwaite'),
      vp('Cat Bells', 54.5684, -3.1707, 451, 'Popular ridge above the west shore of Derwentwater'),
      vp('Hallin Fell', 54.5704, -2.8785, 388, 'Quick climb above Ullswater'),
      vp('Loughrigg Fell', 54.4375, -3.0084, 335, 'Low fell above Grasmere and Ambleside'),
      vp('Blencathra', 54.64, -3.0497, 868, 'Looks south over the Thirlmere and St John’s valleys'),
      vp('Skiddaw', 54.6514, -3.1478, 931, 'Wide views over Keswick and the northern lakes'),
      vp('Helvellyn', 54.527, -3.0175, 950, 'Classic for big cloud seas over Ullswater and Thirlmere'),
      vp('Scafell Pike', 54.4543, -3.2117, 978, 'England’s highest summit, above almost any inversion'),
    ],
  },
  {
    slug: 'peak-district',
    name: 'Peak District',
    short: 'Peak District',
    country: 'England',
    base: { name: 'Castleton', latitude: 53.3434, longitude: -1.7768, elevation: 200, admin1: 'Peak District', country: 'United Kingdom' },
    summary:
      'The Hope Valley is famous for filling with cloud on calm, cold mornings, watched from Mam Tor and Win Hill.',
    intro: [
      'Cold air collects in the Hope Valley and the Edale valley overnight. On the right mornings the valleys fill to the brim and the Great Ridge between Mam Tor and Lose Hill rises above a flat cloud sea.',
      'Mam Tor is the easiest viewpoint, a short walk from the Mam Nick car park. Win Hill and Lose Hill look along the valley, and Kinder Scout sits above deeper inversions.',
    ],
    viewpoints: [
      vp('Mam Tor', 53.3493, -1.8096, 517, 'Short walk from Mam Nick; the classic Hope Valley inversion spot'),
      vp('Lose Hill', 53.3649, -1.7714, 476, 'East end of the Great Ridge, overlooking Hope and Edale'),
      vp('Win Hill', 53.3624, -1.7208, 462, 'Looks down the Hope Valley and over Ladybower'),
      vp('Stanage Edge', 53.3685, -1.6642, 458, 'Gritstone edge above Hathersage and the Derwent valley'),
      vp('Kinder Scout', 53.3848, -1.8739, 636, 'High plateau above Edale for deeper inversions'),
    ],
  },
  {
    slug: 'snowdonia',
    name: 'Eryri (Snowdonia)',
    short: 'Eryri',
    country: 'Wales',
    base: { name: 'Llanberis', latitude: 53.117, longitude: -4.129, elevation: 110, admin1: 'Eryri (Snowdonia)', country: 'United Kingdom' },
    summary:
      'Steep-sided valleys and lakes in Eryri trap cloud below the summits of Yr Wyddfa, the Glyderau and Moel Siabod.',
    intro: [
      'Cloud and fog settle in the Llanberis Pass, Nant Gwynant, the Ogwen valley and the Conwy valley on calm, cold nights. Above the lid, the high summits stand clear in bright sunshine.',
      'Moel Siabod is a favourite for watching cloud fill the valleys around Capel Curig. Yr Wyddfa and the Glyderau are high enough to sit above most inversions.',
    ],
    viewpoints: [
      vp('Cnicht', 52.9997, -4.0199, 689, 'Pointed summit above Croesor and the Glaslyn estuary'),
      vp('Moel Siabod', 53.0732, -3.934, 872, 'Views over Capel Curig and the Ogwen and Lledr valleys'),
      vp('Cadair Idris', 52.6996, -3.9088, 893, 'Southern Eryri, above Dolgellau and the Mawddach'),
      vp('Tryfan', 53.115, -3.998, 917, 'Scrambly summit above the Ogwen valley'),
      vp('Glyder Fawr', 53.1015, -4.0291, 1001, 'Above the Llanberis Pass and Llyn Ogwen'),
      vp('Yr Wyddfa (Snowdon)', 53.0685, -4.0762, 1085, 'Highest summit in Wales'),
    ],
  },
  {
    slug: 'scottish-highlands',
    name: 'Scottish Highlands',
    short: 'Highlands',
    country: 'Scotland',
    base: { name: 'Fort William', latitude: 56.8198, longitude: -5.1052, elevation: 20, admin1: 'Highlands', country: 'United Kingdom' },
    summary:
      'From Ben Nevis to Loch Lomond and Perthshire, Highland glens and sea lochs fill with cloud under winter high pressure.',
    intro: [
      'Long winter nights and high pressure can leave Highland glens and sea lochs under a lid of cold, damp air for days, while the summits bask in sunshine and temperatures above freezing.',
      'Around Fort William and Glencoe, the cloud often fills Loch Linnhe and Glen Coe. Further south, Conic Hill and Ben Lomond look over Loch Lomond, and Ben Vrackie and Schiehallion over the Perthshire glens.',
    ],
    viewpoints: [
      vp('Conic Hill', 56.0987, -4.5207, 361, 'Short climb from Balmaha above Loch Lomond'),
      vp('Ben Vrackie', 56.749, -3.7173, 841, 'Above Pitlochry and the Tummel and Garry valleys'),
      vp('Ben Lomond', 56.1904, -4.6333, 974, 'Above Loch Lomond and the Trossachs'),
      vp('Buachaille Etive Mòr', 56.6463, -4.9009, 1022, 'Stob Dearg, guarding the entrance to Glen Coe'),
      vp('Schiehallion', 56.6669, -4.1003, 1083, 'Isolated peak above Loch Rannoch and Loch Tummel'),
      vp('Ben Nevis', 56.7969, -5.0035, 1345, 'Highest summit in Britain, above Fort William'),
    ],
  },
  {
    slug: 'brecon-beacons',
    name: 'Bannau Brycheiniog (Brecon Beacons)',
    short: 'Bannau Brycheiniog',
    country: 'Wales',
    base: { name: 'Brecon', latitude: 51.947, longitude: -3.391, elevation: 140, admin1: 'Bannau Brycheiniog', country: 'United Kingdom' },
    summary: 'The Usk valley fills with fog on calm mornings, seen from Pen y Fan, the Sugar Loaf and the Skirrid.',
    intro: [
      'The broad Usk valley between Brecon, Crickhowell and Abergavenny collects cold air and river fog on still nights. The Sugar Loaf and Skirrid above Abergavenny are quick climbs out of it.',
      'Pen y Fan, the highest point in southern Britain, looks north over Brecon and the Usk valley when cloud sits below the lid.',
    ],
    viewpoints: [
      vp('Skirrid Fawr', 51.859, -2.9727, 486, 'Short, steep climb above Abergavenny'),
      vp('Sugar Loaf', 51.8627, -3.0579, 596, 'Views over the Usk valley and Abergavenny'),
      vp('Pen y Fan', 51.884, -3.437, 886, 'Highest point in southern Britain, above Brecon'),
    ],
  },
  {
    slug: 'yorkshire-dales',
    name: 'Yorkshire Dales',
    short: 'Yorkshire Dales',
    country: 'England',
    base: { name: 'Settle', latitude: 54.069, longitude: -2.278, elevation: 160, admin1: 'Yorkshire Dales', country: 'United Kingdom' },
    summary: 'Ribblesdale and the Three Peaks are a fine place to watch cloud fill the dales below limestone summits.',
    intro: [
      'Cold air drains into Ribblesdale, Wharfedale and the other dales overnight. Under high pressure the dales can fill with cloud while Ingleborough, Whernside and Pen-y-ghent stand clear.',
      'Pen-y-ghent is the quickest of the Three Peaks from Horton in Ribblesdale; Whernside is the highest.',
    ],
    viewpoints: [
      vp('Pen-y-ghent', 54.156, -2.2488, 694, 'Quickest of the Three Peaks, above Horton in Ribblesdale'),
      vp('Ingleborough', 54.1663, -2.3979, 723, 'Flat-topped summit above Ingleton and Ribblesdale'),
      vp('Whernside', 54.2289, -2.402, 736, 'Highest of the Three Peaks, above the Ribblehead Viaduct'),
    ],
  },
];

export const regionBySlug = (slug) => REGIONS.find((r) => r.slug === slug);

// Flat list of curated viewpoints, used to boost place search.
export const VIEWPOINTS = REGIONS.flatMap((r) =>
  r.viewpoints.map((v) => ({
    id: `vp-${r.slug}-${v.name}`,
    name: v.name,
    latitude: v.latitude,
    longitude: v.longitude,
    elevation: v.height,
    admin1: r.short,
    country: 'United Kingdom',
    featureCode: 'PK',
    source: 'curated',
  }))
);
