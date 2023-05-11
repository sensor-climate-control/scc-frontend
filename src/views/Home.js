import WindowOverview from "../features/weather/WindowOverview";
import GraphSection from "../features/weather/graph/GraphSection";
import './Home.css'
import { useStore } from 'react-redux'
import Header from '../features/application/Header';
import { useNavigate } from 'react-router-dom';
import CurrentWeather from '../features/weather/CurrentWeather';
import React, { useEffect } from 'react';
import { useGetUserDetailsQuery, useGetHomeDetailsQuery, useGetCurrentWeatherQuery, useGetHomeSensorsQuery } from '../reduxApi';
import CreateHome from "../features/home/CreateHome";
import CurrentAqi from "../features/weather/CurrentAqi";
import Recommendation from "../features/home/Recommendation";

export default function Home() {
    // useeffect
    const store = useStore()
    const navigate = useNavigate()
    useEffect(() => {
        if (!store.getState().token.token) {
            return navigate("/login");
        }
    })

    const userid = store.getState().token.userid
    const { data: userdata, isSuccess: skip } = useGetUserDetailsQuery(userid, {skip: !userid});

    let selectedHome = null;
    if (userdata) {
        // Make sure there is a home field
        if (userdata.homes) {
            if (userdata.homes.length > 0) {
                // We should only have one home for now
                selectedHome = userdata.homes[0];
            }
        }
    }

    const { data: homePrefs } = useGetHomeDetailsQuery(selectedHome, {skip: !selectedHome});
    const { data: weather } = useGetCurrentWeatherQuery((homePrefs) ? homePrefs.zip_code : null, {skip: !homePrefs});


    const { data: sensorData } = useGetHomeSensorsQuery(selectedHome, {
        pollingInterval: 300000,
        skip: !skip
    });

    const { data } = useGetHomeDetailsQuery(selectedHome, {
        skip: !skip
    })

    let window_data = []

    // switch to real data
    if (sensorData) {
        window_data = []
        for (let i = 0; i < sensorData.length; i++) {
            if (sensorData[i].readings) {
                let status = "closed"

                if (homePrefs && weather) {
                    let lastReadingF = sensorData[i].readings[sensorData[i].readings.length - 1].temp_f

                    // we open if the outside temp is cooler and the house is too hot
                    if (lastReadingF - parseInt(homePrefs.preferences.temperature) > 1) {
                        if (weather.main && lastReadingF > weather.main.temp) {
                            status = "open"
                        }
                    }
                }
                if (sensorData[i].readings.length === 0) {
                    window_data.push({
                        name: sensorData[i].name,
                        status: status,
                        temp: 0,
                        humidity: 0,
                        lastReadings: [],
                    })
                } else {
                    window_data.push({
                        name: sensorData[i].name,
                        status: status,
                        temp: sensorData[i].readings[sensorData[i].readings.length - 1].temp_f,
                        humidity: sensorData[i].readings[sensorData[i].readings.length - 1].humidity,
                        lastReadings: sensorData[i].readings,
                    })
                }
            } else {
                window_data.push({
                    name: sensorData[i].name,
                    status: "closed",
                    temp: 0,
                    humidity: 0,
                    lastReadings: [],
                })
            }

        }
    }

    const homeDetails = (
            !userdata || 
            !userdata.homes || 
            userdata.homes.length === 0
        ) ? <CreateHome userdata={userdata} /> : (
            <>
                <div className="outer-home-sections-wrapper">
                    <WindowOverview windows={window_data} />
                    <GraphSection windows={window_data}/>
                </div>
                <CurrentWeather zip_code={(data) ? data.zip_code : false} />
                <CurrentAqi zip_code={(data) ? data.zip_code : false} />
                <Recommendation recommendations={(data) ? data.recommendations : false} preferences={(data) ? data.preferences : false} />
            </>
        )

    return (
        <>
            <Header page_name='View Your Home' user_first_name={(userdata) ? userdata.name : ''} />

            {homeDetails}
        </>
    );
}
