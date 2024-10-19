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

  // Check for temperature inversion
  const isInversion = tempsAtLevels.some((temp, index) => {
    return temp > surfaceTemp;
  });

  // Check relative humidity at surface
  const relativeHumidity = weatherData.hourly.relativehumidity_2m[0];

  // Assess inversion likelihood
  let likelihoodMessage = '';

  if (isInversion && relativeHumidity > 80) {
    likelihoodMessage = 'High likelihood of a cloud inversion occurring.';
  } else if (isInversion) {
    likelihoodMessage = 'Possible inversion, but low humidity reduces cloud formation likelihood.';
  } else {
    likelihoodMessage = 'Low likelihood of a cloud inversion occurring.';
  }

  return (
    <div className="weather-data">
      <h2>Inversion Analysis for {city}</h2>
      <div className="weather-data__box">
        <p>
          <strong>Surface Temperature:</strong> {surfaceTemp} °C
        </p>
        <p>
          <strong>Temperature at 850 hPa:</strong> {tempsAtLevels[0]} °C
        </p>
        <p>
          <strong>Temperature at 700 hPa:</strong> {tempsAtLevels[1]} °C
        </p>
        <p>
          <strong>Relative Humidity at Surface:</strong> {relativeHumidity}%
        </p>
      </div>
      <div className="weather-data__box">
        <p className="likelihood-message">{likelihoodMessage}</p>
      </div>
    </div>
  );
};

export default InversionLikelihood;
