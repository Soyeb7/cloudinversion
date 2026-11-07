import React from 'react';
import { Link } from 'react-router-dom';

const Source = ({ href, children }) => (
  <li>
    <a href={href} target="_blank" rel="noopener noreferrer">
      {children}
    </a>
  </li>
);

const Science = () => (
  <div className="page page--prose">
    <article className="prose">
      <h1>How cloud inversions form</h1>
      <p className="prose__lead">
        Normally the air gets colder as you climb, by roughly 6 to 7°C for every kilometre. A temperature inversion is
        a layer where that flips and the air gets <em>warmer</em> with height. Warm air sits on top of cold air like a
        lid. If the cold air underneath is damp enough to form fog or low cloud, that cloud is trapped below the lid,
        and from a summit above it you look down on a flat, white sea.
      </p>

      <h2>The three ingredients</h2>
      <p>Every cloud inversion needs all three at the same time. Two out of three gives you something else.</p>
      <dl className="prose__defs">
        <div>
          <dt>A warm lid</dt>
          <dd>
            A layer where temperature rises with height. A degree or so is a weak lid; 3°C or more is a strong one. Without
            it, cloud simply mixes upwards and you get an ordinary grey day or hill fog on the summits.
          </dd>
        </div>
        <div>
          <dt>Saturated air beneath it</dt>
          <dd>
            Humidity near 100% under the lid, or the air temperature falling to within about 1°C of the dew point. Without
            moisture, an inversion just gives you a clear, frosty valley.
          </dd>
        </div>
        <div>
          <dt>Drier, clearer air above</dt>
          <dd>
            Humidity should drop sharply above the lid, with little cloud higher up. Otherwise you stand above one layer
            of cloud and under another, and miss the sunrise.
          </dd>
        </div>
      </dl>

      <h2>What helps</h2>
      <table className="prose__table">
        <thead>
          <tr>
            <th scope="col">Condition</th>
            <th scope="col">Why it matters</th>
            <th scope="col">Rough guide</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Light winds</td>
            <td>Wind stirs the layers together and breaks the lid.</td>
            <td>Under about 3 m/s in the valleys; strong winds at summit height point to hill fog instead.</td>
          </tr>
          <tr>
            <td>Clear night</td>
            <td>Ground loses heat to a clear sky and cools the air above it. Cloud acts like a blanket.</td>
            <td>Little cloud between sunset and dawn.</td>
          </tr>
          <tr>
            <td>High pressure</td>
            <td>Sinking air in an anticyclone warms as it descends, building the lid from above.</td>
            <td>Above about 1020 hPa helps; above 1030 hPa can hold an inversion for days.</td>
          </tr>
          <tr>
            <td>Long nights</td>
            <td>More hours to cool, and weak winter sun struggles to burn the cloud off.</td>
            <td>Autumn and winter. Radiation fog peaks in autumn, long-lived cold pools in midwinter.</td>
          </tr>
          <tr>
            <td>Damp ground</td>
            <td>Rain the day before adds moisture to the air that pools in the valleys overnight.</td>
            <td>A wet day followed by a clearing, calm night is a classic set-up.</td>
          </tr>
        </tbody>
      </table>

      <h2>Two kinds of cloud sea</h2>
      <h3>Valley fog</h3>
      <p>
        On a clear, calm night the ground radiates heat away. Cold air drains down the slopes and pools on the valley
        floors, and if it’s damp enough it condenses into radiation fog. These pools are usually shallow, from a few
        tens of metres to a couple of hundred metres deep, and fill the valleys rather than the whole landscape. They
        are at their best around sunrise and normally burn off within a few hours, although the fog often lifts into a
        layer of low cloud first. In a study of small valleys in Shropshire, the valley was more than 1°C colder than
        the hilltop on about 45% of nights; strong pools (over 4°C) formed on about 12%.
      </p>
      <h3>Anticyclonic stratus</h3>
      <p>
        Under a big area of high pressure, slowly sinking air warms and caps a damp lower layer, and a sheet of low
        cloud can sit beneath the lid for days. This is the extensive sea of cloud seen from the Lake District fells,
        Scottish summits or the Swiss Alps, where the cloud top is often 500 to 1,500 m up. It breaks up when a weather
        system brings colder air or stronger winds aloft.
      </p>

      <h2>How high do you need to be?</h2>
      <p>
        You need to stand above the top of the cloud. Under an elevated lid the cloud top sits at about the base of the
        warm layer; with valley fog it sits inside the cold pool. Cloud tops undulate and tend to rise as the morning
        warms, so aim for a viewpoint at least 50 to 100 m above the forecast top. If your summit is below the top,
        you’ll be standing inside the fog.
      </p>

      <h2>How this forecast works</h2>
      <ol className="prose__steps">
        <li>
          We fetch hourly forecasts from Open-Meteo, including temperature, humidity, wind and cloud at eight pressure
          levels from near the ground up to about 3 km, each with its real height.
        </li>
        <li>
          For each hour from two hours before to two hours after sunrise we build a temperature profile from the model’s
          ground level upwards, ignoring levels that sit below the ground.
        </li>
        <li>
          We find the strongest layer where temperature rises with height (the lid) and measure how much it warms.
        </li>
        <li>
          We look for saturated air underneath it (model low cloud, humidity, dew-point spread and visibility) and
          estimate the cloud top from where the humidity drops away.
        </li>
        <li>
          We check for dry air and little cloud above, light winds and no rain. The lid and the moisture multiply
          together because both are essential; the other factors scale the result.
        </li>
        <li>
          Overnight cloud, pressure and its trend, recent rain, night length and how far your valley sits below the
          model’s smoothed terrain nudge the score up or down.
        </li>
      </ol>
      <p>
        The result is a score out of 100, shown as Unlikely, Possible, Likely or Very likely. It’s a guide, not a
        probability: it hasn’t been calibrated against a long record of observed inversions.
      </p>

      <h2>Limits</h2>
      <ul>
        <li>
          Weather models smooth the terrain over a few kilometres, so deep, narrow valleys are shallower in the model
          and their fog is often missed.
        </li>
        <li>
          Pressure levels near the ground are 200 to 300 m apart, so shallow fog and exact cloud-top heights are
          approximate.
        </li>
        <li>Fog is one of the hardest things to forecast. Even professional fog rules have high false-alarm rates.</li>
        <li>Accuracy drops quickly beyond a day or two. Check again the evening before.</li>
      </ul>

      <h2>Sources</h2>
      <ul className="prose__sources">
        <Source href="https://home.chpc.utah.edu/~whiteman/homepage/articles/Whiteman2001Weather%20and%20Forecasting.pdf">
          Whiteman et al. (2001), Cold pools in the Columbia Basin, Weather and Forecasting
        </Source>
        <Source href="https://eprints.whiterose.ac.uk/130494/">
          Jemmett-Smith, Ross &amp; Sheridan (2018), A short climatological study of cold air pools and drainage flows in
          small valleys, Weather
        </Source>
        <Source href="https://research-portal.uea.ac.uk/en/publications/lanfex-a-field-and-modeling-study-to-improve-our-understanding-an/">
          Price et al. (2018), LANFEX: a field and modelling study of radiation fog, BAMS
        </Source>
        <Source href="https://acp.copernicus.org/articles/22/319/2022/">
          Boutle et al. (2022), Demistify: a radiation fog model intercomparison, Atmos. Chem. Phys.
        </Source>
        <Source href="https://atmos.uw.edu/~robwood/topic_eis.htm">
          Wood &amp; Bretherton (2006), Low cloud cover and lower-tropospheric stability, J. Climate
        </Source>
        <Source href="https://www.meteoswiss.admin.ch/weather/weather-and-climate-from-a-to-z/fog-top-height.html">
          MeteoSwiss, Fog-top height
        </Source>
        <Source href="https://www.metoffice.gov.uk/blog/2025/what-is-anticyclonic-gloom">Met Office, What is anticyclonic gloom?</Source>
        <Source href="https://www.weather.gov/safety/fog-radiation">US National Weather Service, Radiation fog</Source>
        <Source href="https://www.mwis.org.uk/">Mountain Weather Information Service (MWIS)</Source>
        <Source href="https://open-meteo.com/en/docs">Open-Meteo forecast API documentation</Source>
      </ul>

      <p className="prose__back">
        <Link to="/" className="btn btn--primary">
          Check a forecast
        </Link>
      </p>
    </article>
  </div>
);

export default Science;
