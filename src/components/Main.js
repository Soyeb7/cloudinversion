import React, { useState } from 'react';
import axios from 'axios';
import Context from '../Context';
import ReactGA from 'react-ga4';

import Header from './Header';
import Content from './Content';
import WeatherSearch from './WeatherSearch';
import InversionLikelihood from './InversionLikelihood';
import About from './About';
import Error from './Error';
import DateTime from './DateTime';
import Tagline from './Tagline';
import Footer from './Footer';

const Main = () => {
  const [weatherData, setWeatherData] = useState(null);
  const [city, setCity] = useState();
  const [error, setError] = useState();

  // Function to fetch atmospheric data
  const api_call = async (e) => {
    e.preventDefault();

    const location = e.target.elements.location.value;

    if (!location) {
      setError('Please enter the name of the city');
      setWeatherData(null);
      return;
    }

    try {
      // Track search event with Google Analytics
      ReactGA.event({
        category: 'Search',
        action: `Location searched: ${location}`,
      });

      // Geocoding API to get latitude and longitude
      const geoResponse = await axios.get(
        `https://geocoding-api.open-meteo.com/v1/search?name=${location}`
      );

      if (!geoResponse.data.results || geoResponse.data.results.length === 0) {
        setError('Location not found');
        setWeatherData(null);
        return;
      }

      const { latitude, longitude, name } = geoResponse.data.results[0];
      setCity(name);

      // Fetch atmospheric data including dew point and wind speed
      const meteoResponse = await axios.get(
        `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&hourly=temperature_2m,relativehumidity_2m,pressure_msl,temperature_850hPa,temperature_700hPa,dewpoint_2m,windspeed_10m&start=current&current_weather=true`
      );

      setWeatherData(meteoResponse.data);
      setError(null);

      // Track inversion result with Google Analytics based on likelihood
      const likelihood = calculateInversionLikelihood(meteoResponse.data);
      ReactGA.event({
        category: 'Inversion Result',
        action: `Location: ${name} - Likelihood: ${likelihood}`,
      });
      
    } catch (err) {
      console.error(err);
      setError('An error occurred while fetching data');
      setWeatherData(null);
    }
  };

  // Simple function to determine inversion likelihood (mock logic)
  const calculateInversionLikelihood = (data) => {
    const surfaceTemp = data.current_weather.temperature;
    const higherAltitudeTemp = data.hourly.temperature_850hPa[0];
    const humidity = data.hourly.relativehumidity_2m[0];

    // Example condition: if the temperature at 850hPa is higher than surface, and humidity is high
    if (higherAltitudeTemp > surfaceTemp && humidity > 80) {
      return 'High';
    }
    return 'Low';
  };

  return (
    <div className="main">
      <Header />
      <Content>
        <DateTime />
        <Tagline />
        <Context.Provider value={{ api_call, weatherData, city }}>
          <WeatherSearch />
          {!weatherData && !error && <About />}
          {weatherData && <InversionLikelihood />}
          {error && <Error error={error} />}
        </Context.Provider>
        <Footer />
      </Content>
    </div>
  );
};

export default Main;
