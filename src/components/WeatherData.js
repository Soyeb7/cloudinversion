import React, {useContext} from 'react'

import Moment from 'react-moment'

import Context from '../Context'

const WeatherData = () => {


    const {weather, city, sunrise, sunset} = useContext(Context)

    const {temp, humidity, pressure} = weather

const mom = <Moment format='HH:mm:ss'> {sunrise}</Moment>
    
    return (
        <div> 

        <h2> Current conditions</h2>
        <div className="weather-data">
            <p className="weather__tagline">Weather forecast for <span className="weather-data__city">{city}</span></p>
            <div className="weather-data__box">
                <span className="weather-data__property">
                    <p className="weather-data__title">Temperature</p>
                    <p className="weather-data__value">{temp}</p>
                </span>
                <span className="weather-data__property">
                    <p className="weather-data__title">Humidity</p>
                    <p className="weather-data__value">{humidity}</p>
                </span>
                <span className="weather-data__property">
                    <p className="weather-data__title">Pressure</p>
                    <p className="weather-data__value">{pressure}</p>
                </span>
            </div>

            {/* <div className="weather-data__box">
                <span className="weather-data__property">
                    <p className="weather-data__title">Sunrise</p>
                    <p className="weather-data__value"> <Moment unix format="HH:mm">{sunrise}</Moment></p>
                </span>

                <span className="weather-data__property"> 
                    <p className="weather-data__title">Sunset</p>
                    <p className="weather-data__value"> <Moment unix format="HH:mm">{sunset}</Moment></p>
                </span>
               
            </div> */}
            
        </div>

        </div>

    )
}


export default WeatherData