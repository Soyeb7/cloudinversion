import React, { useContext } from 'react'


import Context from '../Context'

const OvernightInfo = () => {

    const { nightTemp, wind, pressure, clouds } = useContext(Context)



    return (
        <div>
            <h2> Tonight </h2>

            <div className="weather-data__box">

                <span className="weather-data__property">
                    <p className="weather-data__title">Overnight Temp</p>
                    <p className="weather-data__value">{nightTemp}</p>
                </span>

                <span className="weather-data__property">
                    <p className="weather-data__title">Wind Speed</p>
                    <p className="weather-data__value">{wind} mph </p>
                </span>
                <span className="weather-data__property">
                    <p className="weather-data__title">Pressue</p>
                    <p className="weather-data__value">{pressure} </p>
                </span>
                <span className="weather-data__property">
                    <p className="weather-data__title">Conditions</p>
                    <p className="weather-data__value">{clouds}</p>
                </span>
            </div>
        </div>

    )
}

export default OvernightInfo