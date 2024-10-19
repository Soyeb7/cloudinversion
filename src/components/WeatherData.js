// WeatherData.js
import React, { useContext } from 'react';
import Context from '../Context';

const WeatherData = () => {
    const { weather, city } = useContext(Context);

    if (!weather) return null;

    const { temp, humidity, pressure } = weather.main;

    return (
        <div className="current-weather">
            <h2>Current Conditions in {city}</h2>
            <div className="weather-data__box">
                <div className="weather-data__property">
                    <p className="weather-data__title">Temperature</p>
                    <p className="weather-data__value">{temp} °C</p>
                </div>
                <div className="weather-data__property">
                    <p className="weather-data__title">Humidity</p>
                    <p className="weather-data__value">{humidity}%</p>
                </div>
                <div className="weather-data__property">
                    <p className="weather-data__title">Pressure</p>
                    <p className="weather-data__value">{pressure} hPa</p>
                </div>
            </div>
        </div>
    );
};

export default WeatherData;
