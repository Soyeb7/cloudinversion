import React, { useContext } from 'react'

const About = () => {



    return (

        <div className="weather-data">



            <div className="weather-data__box">

                <p> The way this app calculates the likelihood of an cloud inversion is if:

                    
                    <li>
                        Temperature at 3am is less than 10 Degrees

                    </li>
                    <li>
                        Wind speed is less than 2mph
                    </li>
                    <li>
                        Humidity is greater than 85%
                    </li>
                    <li>
                        The skies are either clear or few clouds present.
                    </li>
                </p>


            </div>


        </div>

    )
}

export default About