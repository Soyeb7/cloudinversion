import React, { useState } from 'react';
import axios from 'axios';
import Context from '../Context';

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

      // Fetch atmospheric data
      const meteoResponse = await axios.get(
        `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&hourly=temperature_2m,relativehumidity_2m,pressure_msl,temperature_850hPa,temperature_700hPa&start=current&current_weather=true`
      );

      setWeatherData(meteoResponse.data);
      setError(null);
    } catch (err) {
      console.error(err);
      setError('An error occurred while fetching data');
      setWeatherData(null);
    }
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
