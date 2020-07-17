import React, { useState } from 'react'
import axios from 'axios'
import Context from '../Context'

import Moment from 'react-moment'

import Header from './Header'
import Content from './Content'
import WeatherSearch from './WeatherSearch'
import WeatherData from './WeatherData'
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

    // This is an Async Await call. Until Axios successfully recieves the data, we wont go further
    const api_call = async e => {

        e.preventDefault();

        const location = e.target.elements.location.value;

        // If location is blank, display error message and hide previous weather information
        if (!location) return (
            setError('Please enter the name of the city')
        ), setWeather(null)
            
        

        const API_KEY = '8f3392b07d6c3fbedeb6b9f37746b4bb';

        const url = `https://api.openweathermap.org/data/2.5/weather?q=${location}&appid=${API_KEY}&units=metric`;
        const request = axios.get(url);
        const response = await request;

        console.log(response)

        // setWeather will assign the value of response to weather
        setWeather(response.data.main);
        setCity(response.data.name)
        setSunrise(response.data.sys.sunrise)
        setSunset(response.data.sys.sunset)

        // If everything goes well, then seterror to null
        setError(null)
    }

   
    const unixTimestamp = {sunrise};
    
    console.log(unixTimestamp.sunrise)

    return (
        <div className='main'>
            <Header />
            <Content>
                <DateTime />
                <Tagline />
                <Context.Provider value={{api_call, weather, city, sunrise, sunset}}>
                    {/* We give access to api call in the WeatherSearch component */}
                    <WeatherSearch/>

                    {/* If a location has been searched for, then pass on the value to the WeatherData component */}
                    {weather && <WeatherData/>}


                    {/* If search is blank then display error */}
                    {error && <Error error={error}/>}
                    
                </Context.Provider>
                <Footer />
            </Content>
            
        </div>
    )
}


export default Main