// set global vars
var searchHistory = [];
var detail = document.getElementById('today-detail');
var forecastSection = document.getElementById('five-day');

//constants
const apiKey = '535d5a3cfa997c56c5d07fc375fced11';


function getWeather(location) {
    var queryURL = 'https://api.openweathermap.org/data/2.5/weather?q=' + location + '&units=imperial&appid=' + apiKey;
    $.ajax({
        url: queryURL,
        method: "GET"
    }).then(function (locationRes) {
        console.log(locationRes);
        $("#weather-main").empty();

        var iconCode = locationRes.weather[0].icon;
        var iconURL = `https://openweathermap.org/img/w/${iconCode}.png`;
        var today = moment().format('L');
        var locationData = $(`
            <h2 id="locationData">
                ${locationRes.name} ${today} <img src="${iconURL}" alt="${locationRes.weather[0].description}" />
            </h2>
            <p>Temperature: ${locationRes.main.temp} °F</p>
            <p>Humidity: ${locationRes.main.humidity}\%</p>
            <p>Wind Speed: ${locationRes.wind.speed} MPH</p>
        `);

        detail.append(locationData);

        var lat = locationRes.coord.lat;
        var lon = locationRes.coord.lon;
        var uvQueryURL = 'https://api.openweathermap.org/data/2.5/uvi?lat=' + lat + '&lon=' + lon + '&appid=' + apiKey;

        $.ajax({
            url: uvQueryURL,
            method: "GET"
        }).then(function (uvResponse) {
            console.log(uvResponse);

            var uvIndex = uvResponse.value;
            var uvIndexP = $(`
                <p>UV Index: 
                    <span id="uvIndexColor" class="px-2 py-2 rounded">${uvIndex}</span>
                </p>
            `);

            detail.append(uvIndexP);

            forecast(lat, lon);

            if (uvIndex >= 0 && uvIndex <= 2) {
                $("#uvIndexColor").css("background-color", "#3EA72D").css("color", "white");
            } else if (uvIndex >= 3 && uvIndex <= 5) {
                $("#uvIndexColor").css("background-color", "#FFF300");
            } else if (uvIndex >= 6 && uvIndex <= 7) {
                $("#uvIndexColor").css("background-color", "#F18B00");
            } else if (uvIndex >= 8 && uvIndex <= 10) {
                $("#uvIndexColor").css("background-color", "#E53210").css("color", "white");
            } else {
                $("#uvIndexColor").css("background-color", "#B567A4").css("color", "white");
            };
        });
    });
}

function forecast(lat, lon) {
    var forecastURL = 'https://api.openweathermap.org/data/2.5/onecall?lat='+ lat + '&lon=' + lon + '&units=imperial&exclude=current,minutely,hourly,alerts&appid=' + apiKey;

    $.ajax({
        url: forecastURL,
        method: "GET"
    }).then(function (forecastRes) {
        console.log(forecastRes);
        $("#five-day").empty();

        for (let i = 1; i < 6; i++) {
            var locationInfo = {
                date: forecastRes.daily[i].dt,
                icon: forecastRes.daily[i].weather[0].icon,
                temp: forecastRes.daily[i].temp.day,
                humidity: forecastRes.daily[i].humidity
            };

            var currDate = moment.unix(locationInfo.date).format("MM/DD/YYYY");
            var iconURL = `<img src="https://openweathermap.org/img/w/${locationInfo.icon}.png" alt="${forecastRes.daily[i].weather[0].main}" />`;

            // displays the date
            // an icon representation of weather conditions
            // the temperature
            // the humidity
            var forecastCard = $(`
                <div class="pl-3">
                    <div class="card pl-3 pt-3 mb-3 bg-primary text-light" style="width: 12rem;>
                        <div class="card-body">
                            <h5>${currDate}</h5>
                            <p>${iconURL}</p>
                            <p>Temp: ${locationInfo.temp} °F</p>
                            <p>Humidity: ${locationInfo.humidity}\%</p>
                        </div>
                    </div>
                <div>
            `);

            forecastSection.append(forecastCard);
        }
    });
}

$("#search").on("click", function (event) {
    event.preventDefault();

    var location = $("#location-input").val().trim();
    getWeather(location);
    if (!searchHistory.includes(location)) {
        searchHistory.push(location);
        var searchedlocation = $(`
            <li class="list-group-item">${location}</li>
            `);
        $("#history").append(searchedlocation);
    };

    localStorage.setItem("history", JSON.stringify(searchHistory));
    console.log(searchHistory);
});

$(document).on("click", ".list-group-item", function () {
    var listlocation = $(this).text();
    getWeather(listlocation);
});

$(document).ready(function () {
    var searchHistory = JSON.parse(localStorage.getItem("history"));

    if (searchHistory !== null) {
        var lastSearchedIndex = searchHistory.length - 1;
        var lastSearchedlocation = searchHistory[lastSearchedIndex];
        getWeather(lastSearchedlocation);
        console.log(`Last searched location: ${lastSearchedlocation}`);
    }
});