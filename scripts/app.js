let weatherNowApi = 'https://api.openweathermap.org/data/2.5/weather?lat=37.96&lon=-121.29&appid=56f305c5100fcf8fededa1a56848c62d&units=imperial'
let weatherFutureApi = 'https://api.openweathermap.org/data/2.5/forecast?lat=37.96&lon=-121.29&appid=56f305c5100fcf8fededa1a56848c62d&units=imperial'
let weatherNowData = GetNowData(weatherNowApi);
let weatherFutureData = GetFutureData(weatherFutureApi);

function GetNowData(apiUrl) {
    fetch(apiUrl).then(
        response => response.json()
    ).then(
        data => {
            console.log(data);
            console.log(data.main.temp);
            console.log(data.name);
        }
    )
}

function GetFutureData(apiUrl) {
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