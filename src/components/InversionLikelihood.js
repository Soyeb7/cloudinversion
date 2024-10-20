import React, { useContext } from 'react';
import Context from '../Context';

const InversionLikelihood = () => {
  const { weatherData, city } = useContext(Context);

  if (!weatherData) return null;

  // Extract necessary data
  const surfaceTemp = weatherData.current_weather.temperature;
  const pressureLevels = ['850hPa', '700hPa'];
  const tempsAtLevels = pressureLevels.map((level) => {
    return weatherData.hourly[`temperature_${level}`][0];
  });

  const relativeHumidity = weatherData.hourly.relativehumidity_2m[0];
  const dewPoint = weatherData.hourly.dewpoint_2m[0];
  const windSpeed = weatherData.hourly.windspeed_10m[0];

  // Check for temperature inversion
  const isInversion = tempsAtLevels.some(temp => temp > surfaceTemp);

  // Assess likelihood
  let likelihoodMessage = '';
  let likelihoodClass = '';

  if (isInversion && relativeHumidity > 80 && windSpeed < 3 && surfaceTemp <= dewPoint + 2) {
    likelihoodMessage = 'High likelihood of a cloud inversion occurring due to strong temperature inversion, high humidity, and low wind speeds.';
    likelihoodClass = 'likely'; // Apply "likely" class
  } else if (isInversion) {
    likelihoodMessage = 'Possible inversion, but conditions may not be ideal for cloud formation due to low humidity or high wind speeds.';
    likelihoodClass = 'likely'; // Apply "likely" class but with a less certain message
  } else {
    likelihoodMessage = 'Low likelihood of a cloud inversion occurring.';
    likelihoodClass = 'unlikely'; // Apply "unlikely" class
  }

  return (
    <div className="weather-data">
      <h2>Inversion Analysis for {city}</h2>
      <div className="weather-data__box">
        <p><strong>Surface Temperature:</strong> {surfaceTemp} °C</p>
        <p><strong>Temperature at 850 hPa:</strong> {tempsAtLevels[0]} °C</p>
        <p><strong>Temperature at 700 hPa:</strong> {tempsAtLevels[1]} °C</p>
        <p><strong>Relative Humidity at Surface:</strong> {relativeHumidity}%</p>
        <p><strong>Dew Point at Surface:</strong> {dewPoint} °C</p>
        <p><strong>Wind Speed:</strong> {windSpeed} m/s</p>
      </div>
      <div className={`weather-data__box likelihood-message ${likelihoodClass}`}>
        <p>{likelihoodMessage}</p>
      </div>
    </div>
  );
};
export default InversionLikelihood;
