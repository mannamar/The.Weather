// Imports
import { prod, dev } from './environment.js';
import { stateAbbr } from './states.js';
import { saveToLocalStorage, getLocalStorage, removeFromLocalStorage } from "./localStorage.js";

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
let body = document.getElementById('body');

// Declare JS variables
let weatherNowData, allLocationData, chosenCityData, weatherFutureData, parsedFutureData, dayOfWeekOrder;
let lat, lon, name, state;

let atmosphereTypes = ['Mist', 'Smoke', 'Haze', 'Dust', 'Fog', 'Sand', 'Ash', 'Squall'];
let fiveDay = {};



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
    await ReverseGeoLookup();
    lat = chosenCityData.lat;
    lon = chosenCityData.lon;
    SetDisplayNameVariables();
    console.log('Lat: ' + lat)
    console.log('Lon: ' + lon)
    await GetNowData();
    name = weatherNowData.name;
    SetNowData();
    await GetFutureData();
    ParseFutureData();
    SetFutureData();
}

async function error(err) {
    console.warn(err.message);
    lat = 37.9577016;
    lon = -121.2907796;
    await ReverseGeoLookup();
    lat = chosenCityData.lat;
    lon = chosenCityData.lon;
    SetDisplayNameVariables();
    console.log('Lat: ' + lat)
    console.log('Lon: ' + lon)
    await GetNowData();
    name = weatherNowData.name;
    SetNowData();
    await GetFutureData();
    ParseFutureData();
    SetFutureData();
}

async function ReverseGeoLookup() {
    let reverseGeoApi = `https://api.openweathermap.org/geo/1.0/reverse?lat=${lat}&lon=${lon}&limit=1&appid=${apiKey}`;
    await fetch(reverseGeoApi).then(
        response => response.json()
    ).then(
        data => {
            chosenCityData = data[0];
        }
    )
}

// Currently
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

function SetIcon(element, weather) {
    if (atmosphereTypes.includes(weather)) {
        element.src = `./assets/Atmosphere.png`;
    } else {
        element.src = `./assets/${weather}.png`;
    }
}

function SetNowData(data = weatherNowData) {

    if (stateAbbr[state]) {
        cityName.innerText = name + ', ' + stateAbbr[state];
    } else if (state && state.length === 2) {
        cityName.innerText = name + ', ' + state;
    } 
    else {
        cityName.innerText = name;
    }
    // chosenCityData.display_name = cityName.innerText;
    nowTemp.innerText = Math.round(data.main.temp);
    nowWeathText.innerText = data.weather[0].main;

    let unixTime = data.dt;
    let dateTime = new Date(unixTime * 1000);
    let time = dateTime.toLocaleTimeString('en-US', {timeStyle: 'short'}).toLowerCase().split(' ').join('');
    let date = dateTime.toLocaleDateString('en-US', {month:"long", day: "numeric", year:"numeric"});
    timeTxt.innerText = time;
    dateTxt.innerText = date;
    SetIcon(nowIcon, data.weather[0].main);
    // if (atmosphereTypes.includes(data.weather[0].main)) {
    //     nowIcon.src = `./assets/Atmosphere.png`;
    // } else {
    //     nowIcon.src = `./assets/${data.weather[0].main}.png`;
    // }

    // Also change BG
    if (data.weather[0].main === 'Rain' || data.weather[0].main === 'Snow' || data.weather[0].main === 'Clear') {
        body.style.backgroundImage = `url('../assets/${data.weather[0].main}BG.jpg')`;
    } else {
        body.style.backgroundImage = `url('../assets/CloudsBG.jpg')`;
    }
}

async function SearchForLocation(cityName, stateCode = '', countryCode = '', limit = 3) {
    let geocodingApi = `https://api.openweathermap.org/geo/1.0/direct?q=${cityName},${stateCode},${countryCode}&limit=${limit}&appid=${apiKey}`;
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
    chosenCityData = data[0];
    for (let i = 0; i < data.length; i++) {
        // console.log(data[i].country)
        if (data[i].country === 'US') {
            // console.log(data[i]);
            chosenCityData = data[i];
            break;
        }
    }
    lat = chosenCityData.lat;
    lon = chosenCityData.lon;
    SetDisplayNameVariables();
}

function SetDisplayNameVariables() {
    if (chosenCityData.local_names && chosenCityData.local_names.en) {
        name = chosenCityData.local_names.en;
    } else {
        name = chosenCityData.name;
    }
    if (chosenCityData.country === 'US' && chosenCityData.state) {
        state = chosenCityData.state;
    } else {
        state = chosenCityData.country;
    }
}


// Today/5-Day
async function GetFutureData(latitude = lat, longitude = lon) {
    let weatherFutureApi = `https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&appid=${apiKey}&units=imperial`
    await fetch(weatherFutureApi).then(
        response => response.json()
    ).then(
        data => {
            weatherFutureData = data;
        }
    )
}

function ParseFutureData() {
    parsedFutureData = {};
    dayOfWeekOrder = [];
    let list = weatherFutureData.list;
    for (let element of list) {
        let tempUnixTime = element.dt;
        let tempDateTime = new Date(tempUnixTime * 1000);
        let dayOfWeek = tempDateTime.toLocaleDateString('en-US', {weekday: "long"});
        // console.log(dayOfWeek, element.main.temp); // Log all temps for each day

        if (!dayOfWeekOrder.includes(dayOfWeek)) {
            dayOfWeekOrder.push(dayOfWeek);
            parsedFutureData[dayOfWeek] = {};
            parsedFutureData[dayOfWeek].all_weath = [];
        }
        if (!parsedFutureData[dayOfWeek].max || element.main.temp > parsedFutureData[dayOfWeek].max) {
            parsedFutureData[dayOfWeek].max = element.main.temp;
            parsedFutureData[dayOfWeek].max_weath = element.weather[0].main;
        }
        if (!parsedFutureData[dayOfWeek].min || element.main.temp < parsedFutureData[dayOfWeek].min) {
            parsedFutureData[dayOfWeek].min = element.main.temp;
            parsedFutureData[dayOfWeek].min_weath = element.weather[0].main;
        }
        if (!parsedFutureData[dayOfWeek].all_weath.includes(element.weather[0].main)) {
            parsedFutureData[dayOfWeek].all_weath.push(element.weather[0].main);
        }
    }
}

function SetFutureData() {
    // Today High-Low
    let highWeath = parsedFutureData[dayOfWeekOrder[0]].max_weath;
    let lowWeath = parsedFutureData[dayOfWeekOrder[0]].min_weath;
    todayHighWeath.innerText = highWeath;
    todayLowWeath.innerText = lowWeath;
    todayHighTemp.innerText = Math.round(parsedFutureData[dayOfWeekOrder[0]].max);
    todayLowTemp.innerText = Math.round(parsedFutureData[dayOfWeekOrder[0]].min);
    SetIcon(todayHighIcon, highWeath);
    SetIcon(todayLowIcon, lowWeath);
    // Later today
    let laterWeath = weatherFutureData.list[1].weather[0].main;
    todayLaterWeath.innerText = laterWeath;
    todayLaterTemp.innerText = Math.round(weatherFutureData.list[1].main.temp);
    SetIcon(todayLaterIcon, laterWeath);
    // 5-day
    SetDayFields(0, day1Name, day1Temps, day1Icon);
    SetDayFields(1, day2Name, day2Temps, day2Icon);
    SetDayFields(2, day3Name, day3Temps, day3Icon);
    SetDayFields(3, day4Name, day4Temps, day4Icon);
    SetDayFields(4, day5Name, day5Temps, day5Icon);
}

function SetDayFields(dayNum, nameElement, tempsElement, iconElement) {
    nameElement.innerText = dayOfWeekOrder[dayNum];
    tempsElement.innerText = `H: ${Math.round(parsedFutureData[dayOfWeekOrder[dayNum]].max)} L: ${Math.round(parsedFutureData[dayOfWeekOrder[dayNum]].min)}`;
    let tempWeath;
    if (parsedFutureData[dayOfWeekOrder[dayNum]].all_weath.includes('Snow')) {
        tempWeath = 'Snow';
    } else if (parsedFutureData[dayOfWeekOrder[dayNum]].all_weath.includes('Thunderstorm')) {
        tempWeath = 'Thunderstorm';
    } else if (parsedFutureData[dayOfWeekOrder[dayNum]].all_weath.includes('Rain')) {
        tempWeath = 'Rain';
    } else if (parsedFutureData[dayOfWeekOrder[dayNum]].all_weath.includes('Drizzle')) {
        tempWeath = 'Drizzle';
    // } else if (parsedFutureData[dayOfWeekOrder[dayNum]].all_weath.includes('Clouds')) {
    //     tempWeath = 'Clouds'; // Always ends up cloudy
    } else {
        tempWeath = 'Clear';
    }
    SetIcon(iconElement, tempWeath);
}

// Favorites

function CreateElements() {
    let favorites = getLocalStorage();
    favList.innerHTML = '';
    favorites.map(favItem => {
        let favBtn = document.createElement('button');
        favBtn.textContent = favItem.name;
        favBtn.classList.add('btn', 'btn-primary', 'favItem');
        favBtn.addEventListener('click', async function() {
            chosenCityData = favorites[favorites.indexOf(favItem)];
            console.log(chosenCityData);
            lat = chosenCityData.lat;
            lon = chosenCityData.lon;
            SetDisplayNameVariables();
            await GetNowData();
            SetNowData();
            await GetFutureData();
            ParseFutureData();
            SetFutureData();
        });

        let deleteBtn = document.createElement('button');
        deleteBtn.className = 'btn btn-danger';
        deleteBtn.textContent = 'Delete';
        deleteBtn.type = 'button';
        deleteBtn.addEventListener('click', function() {
            removeFromLocalStorage(favorites.indexOf(favItem));
            CreateElements();
        });

        favList.append(favBtn, deleteBtn);
    })
}

// Button event listeners
searchBtn.addEventListener('click', async function() {
    let input = searchBar.value;
    if (input === '') {
        console.warn('Empty input');
        return;
    }
    searchBar.value = '';
    console.log('Search input: ' + input);
    let inputSplit = input.split(',');
    if (inputSplit.length === 1) {
        await SearchForLocation(inputSplit[0]);
    } else {
        await SearchForLocation(inputSplit[0], inputSplit[1]);
    }
    ChooseLocation();
    console.log({chosenCityData});
    await GetNowData();
    SetNowData();

    await GetFutureData();
    ParseFutureData();
    SetFutureData();
});

addFavBtn.addEventListener('click', function() {
    console.log("Add to fav: " + name);
    saveToLocalStorage(chosenCityData);
});

favLink.addEventListener('click', function() {
    CreateElements();
});


// Call Functions on page load
navigator.geolocation.getCurrentPosition(success, error, options);

let favorites = getLocalStorage();