import React, { useContext } from 'react'

import Context from '../Context'

const InversionLikelihood = () => {


    const { nightTemp, wind, pressure, clouds, weather, city, humidity } = useContext(Context)
    const { temp } = weather

    /* 
    Const meaning
    City = Location search 
    Night Temp = Temperature at 3am
    Wind = Wind speed at 3am
    Pressure = Pressure at 3am
    Cloud = Clouds at 3am

    Temp = Current temperature (at time of search)
    
    */



    /*
        <p> 
        
        Look out for high pressure. 
            
        Low wind speeds

        Clear skies
            
        Warm during the day 

        Cold overnight


        High humidity 

        Temperature dropping to the dew point
        </p>


        11 July Day 8pm: 14 c
        Max Wind Speed: 7mph
        Humidity: 67%

        12 July: 12am wind = 1mph, 9 c, fair, humidity = 93%
        12 July: 5.20am wind = 1mph: 6 c, fair, humidity = 100%

    */

    console.log()

    return (

        <div className="weather-data">

<div className="weather-data__box">





                <span className="weather-data__property">
                    <p className="weather-data__title">3am Temp is:</p>
                    <p className="weather-data__value">{nightTemp}</p>
                </span>

                <span className="weather-data__property">
                    <p className="weather-data__title"> 3am Wind Speed is:</p>
                    <p className="weather-data__value">{wind}</p>
                </span>

                <span className="weather-data__property">
                    <p className="weather-data__title"> 3am Humidity is:</p>
                    <p className="weather-data__value">{humidity}</p>
                </span>



                </div>


            <div className="weather-data__box">
                {/* If 3am temp is less than 9 degrees, current search time temp is more than 14, wind speed is less than 2mph and clouds are clear sky or few clouds or scattered clouds*/}
                {nightTemp < 10 && temp > 14 && wind < 2 && humidity > 85 && (clouds === 'clear sky'
                    || clouds === 'few clouds'
                    || clouds === 'scattered clouds')
                    &&

                    <p className='likely'> There is a good possibility of an Cloud Inversion occuring.  </p>


                } <p className='unlikely'> Chances of an Cloud Inversion are unlikely</p>
            </div>
        </div>

    )
}

export default InversionLikelihood