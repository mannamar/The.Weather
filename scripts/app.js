// Imports
import { prod, dev } from './environment.js';

let apiKey = '';

if (prod.isLive) {
    apiKey += prod.apiKey;
} else {
    apiKey += dev.apiKey;
}

// Declare element variables
let nowTemp = document.getElementById('nowTemp');
let cityName = document.getElementById('cityName');
let searchBtn = document.getElementById('searchBtn');
let searchBar = document.getElementById('searchBar');

// Declare JS variables
let weatherNowData, weatherFutureData, allLocationData, cityLocationData;
let lat, lon, name;



// Navigator variables/functions
const options = {
    enableHighAccuracy: true,
    timeout: 5000,
    maximumAge: 0
};

async function success(position) {
    // console.log(position);
    lat = position.coords.latitude;
    lon = position.coords.longitude;
    console.log('Lat: ' + lat)
    console.log('Lon: ' + lon)
    await GetNowData();
    name = weatherNowData.name;
    SetNowData();
}

function error(err) {
    console.warn(err.message);
}

async function GetNowData(latitude = lat, longitude = lon) {
    let weatherNowApi = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${apiKey}&units=imperial`
    await fetch(weatherNowApi).then(
        response => response.json()
    ).then(
        data => {
            weatherNowData = data;
            console.log(weatherNowData.name, weatherNowData.main.temp);
        }
    )
}

function SetNowData(data = weatherNowData) {
    cityName.innerText = name;
    nowTemp.innerText = Math.round(data.main.temp);
}

function SetFiveDayData() {

}

async function SearchForLocation(cityName, stateCode = '', countryCode = '', limit = 3) {
    let geocodingApi = `http://api.openweathermap.org/geo/1.0/direct?q=${cityName},${stateCode},${countryCode}&limit=${limit}&appid=${apiKey}`;
    await fetch(geocodingApi).then(
        response => response.json()
    ).then(
        data => {
            allLocationData = data;
            // console.log(locationData);
        }
    )
}

function ChooseLocation(data = allLocationData) {
    // console.log(data);
    let returnIndex;
    for (let i = 0; i < data.length; i++) {
        // console.log(data[i].country)
        if (data[i].country === 'US') {
            // console.log(data[i]);
            lat = data[i].lat;
            lon = data[i].lon;
            if (data[i].local_names) {
                name = data[i].local_names.en;
            } else {
                name = data[i].name;
            }
            return data[i];
        }
    }
}

searchBtn.addEventListener('click', async function() {
    let input = searchBar.value;
    console.log('Search input: ' + input);
    let inputSplit = input.split(',');
    if (inputSplit.length === 1) {
        await SearchForLocation(inputSplit[0]);
    } else {
        await SearchForLocation(inputSplit[0], inputSplit[1]);
    }
    cityLocationData = await ChooseLocation();
    console.log({cityLocationData});
    await GetNowData();
    SetNowData();
    searchBar.value = '';
});

async function GetFutureData(latitude = lat, longitude = lon) {
    let weatherFutureApi = `https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&appid=${apiKey}&units=imperial`
    fetch(apiUrl).then(
        response => response.json()
    ).then(
        data => {
            console.log(data);
            console.log(data.list[0]);
            console.log(data.list[0].dt);
            console.log(data.list[0].dt_text);
            console.log(data.list[0].main.temp);
        }
    )
}


// Call Functions on page load
navigator.geolocation.getCurrentPosition(success, error, options);