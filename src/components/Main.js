import React, { useState } from 'react'
import axios from 'axios'
import Context from '../Context'

import Moment from 'moment'

import Header from './Header'
import Content from './Content'
import WeatherSearch from './WeatherSearch'
import OvernightInfo from './OvernightInfo'
import WeatherData from './WeatherData'
import InversionLikelihood from './InversionLikelihood'
import About from './About'
import Error from './Error'
import DateTime from './DateTime'
import Tagline from './Tagline'
import Footer from './Footer'

const Main = () => {

    const [weather, setWeather] = useState()

    const [city, setCity] = useState()

    const [sunrise, setSunrise] = useState()

    const [sunset, setSunset] = useState()

    const [error, setError] = useState()


            // Const for overnight data


    const [nightTemp, setNightTemp] = useState()
    const [wind, setWind] = useState()
    const [pressure, setPressure] = useState()
    const [clouds, setClouds] = useState()
    const [humidity, setHumidity] = useState()
    // This is an Async Await call. Until Axios successfully recieves the data, we wont go further
    const api_call = async e => {

        e.preventDefault();

        const location = e.target.elements.location.value;

        const API_KEY = '8f3392b07d6c3fbedeb6b9f37746b4bb';


        // If location is blank, display error message and hide previous weather information
        if (!location) return (
            setError('Please enter the name of the city')
        ), setWeather(null)
            

        const currentDayUrl = `https://api.openweathermap.org/data/2.5/weather?q=${location}&appid=${API_KEY}&units=metric`;
        console.log(currentDayUrl)
        const request = axios.get(currentDayUrl);
        const response = await request;


        // setWeather will assign the value of response to weather
        setWeather(response.data.main);
        setCity(response.data.name)
        setSunrise(response.data.sys.sunrise)
        setSunset(response.data.sys.sunset)

        console.log('Current temp is: ', response.data.main.temp)



        // Forecast Code
        const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${location}&appid=${API_KEY}&units=metric`
        const requestForecast = axios.get(forecastUrl);
        const responseForecast = await requestForecast;

        console.log('forecast url is: ', forecastUrl)
        console.log(responseForecast)
        
        var todayDate = new Date();
        var nextDayDate = new Date(todayDate.getTime() + (24 * 60 * 60 * 1000))
        const formattedDate = Moment(nextDayDate).format('YYYY-MM-DD');
    

        const filteredList = responseForecast.data.list.filter(t=> t.dt_txt === `${formattedDate} 03:00:00`);
        console.log('Filtered list', filteredList)
       
        // 3am weather detail 
        setNightTemp(filteredList[0].main.temp);
        setWind(filteredList[0].wind.speed);
        setPressure(filteredList[0].main.pressure)
        setClouds(filteredList[0].weather[0].description)
        setHumidity(filteredList[0].main.humidity)
        console.log('Night temp is: ', filteredList[0].main.temp);
        console.log('Night Wind Speed is: ', filteredList[0].wind.speed);
        console.log('Night Time Pressure is: ', filteredList[0].main.pressure);
        console.log('Night Time Weather Description is: ', filteredList[0].weather[0].description);
        console.log('Night Time Humidity is: ', filteredList[0].main.humidity);


        // If everything goes well, then seterror to null
        setError(null)
    }



    // Condition for Cloud Inversion
    // Cold overnight, no wind and warm during the day. 
    /* 
    If temp above 15 degrees during the day. 
    If temp below 10 degrees during the night
    If no wind
    Then chances of cloud inversion likely
    
    */

    return (
        <div className='main'>
            <Header />
            <Content>
                <DateTime />
                <Tagline />
                <Context.Provider value={{api_call, weather, city, sunrise, sunset, nightTemp, wind, pressure, clouds, humidity}}>
                    {/* We give access to api call in the WeatherSearch component */}
                    <WeatherSearch/>


                    

                    {/* If a location has been searched for, then pass on the value to the WeatherData component */}
                    {/* {weather && <WeatherData/>}

                    {weather && <OvernightInfo/>} */}

                    {/* This component will hold the information which will say how this app works.  If weather is not searched for then show this info*/}
                    {!weather && <About /> }

                    {weather && <InversionLikelihood/>}

                    {/* If search is blank then display error */}
                    {error && <Error error={error}/>}
                    
                </Context.Provider>
                <Footer />
            </Content>
            
        </div>
    )
}


export default Main