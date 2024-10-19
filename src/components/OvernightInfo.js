// OvernightInfo.js
import React, { useContext } from 'react';
import Context from '../Context';

const OvernightInfo = () => {
    const { nightTemp, wind, pressure, clouds, humidity } = useContext(Context);

    return (
        <div className="overnight-info">
            <h2>Overnight Forecast</h2>
            <div className="weather-data__box">
                <div className="weather-data__property">
                    <p className="weather-data__title">Temperature</p>
                    <p className="weather-data__value">{nightTemp} °C</p>
                </div>
                <div className="weather-data__property">
                    <p className="weather-data__title">Wind Speed</p>
                    <p className="weather-data__value">{wind} m/s</p>
                </div>
                <div className="weather-data__property">
                    <p className="weather-data__title">Pressure</p>
                    <p className="weather-data__value">{pressure} hPa</p>
                </div>
                <div className="weather-data__property">
                    <p className="weather-data__title">Conditions</p>
                    <p className="weather-data__value">{clouds}</p>
                </div>
                <div className="weather-data__property">
                    <p className="weather-data__title">Humidity</p>
                    <p className="weather-data__value">{humidity}%</p>
                </div>
            </div>
        </div>
    );
};

export default OvernightInfo;
