// set global vars
var searchHistory = [];
var detail = document.getElementById('today-detail');
var forecastSection = document.getElementById('five-day');

//constants
const apiKey = '535d5a3cfa997c56c5d07fc375fced11';

// main function for api grabs
function getWeather(location) {
    // set url for getting the api requests
    // jquery ajax request to the api 
    $.ajax({
        url: 'https://api.openweathermap.org/data/2.5/weather?q=' + location + '&units=imperial&appid=' + apiKey,
        method: "GET",
        // on success call the recordWeatherData function
        success: (locationRes) => {
            // clear the element before we reload it
            $(detail).empty();
            var iconCode = locationRes.weather[0].icon;
            var iconURL = `https://openweathermap.org/img/w/${iconCode}.png`;
            var today = moment().format('L');
            // set the HTML of the placed element with jquery style variables
            var locationData = $(`
            <h2 id="locationData">
                ${locationRes.name} ${today} <img src="${iconURL}" alt="${locationRes.weather[0].description}" />
            </h2>
            <p>Temperature: ${locationRes.main.temp} °F</p>
            <p>Humidity: ${locationRes.main.humidity}\%</p>
            <p>Wind Speed: ${locationRes.wind.speed} MPH</p>
        `);
            // append the location data to the detail element with jquery
            $(detail).append(locationData);
            // call the uv index api call
            // pass the first api call into it so we can get lat / long
            uvi(locationRes);
        }
        // error: logError('main api error')
    });
};

// get the uv index via query
function uvi(apiResponse) {
    var lat = apiResponse.coord.lat;
    var lon = apiResponse.coord.lon;
    var uvQueryURL = 'https://api.openweathermap.org/data/2.5/uvi?lat=' + lat + '&lon=' + lon + '&appid=' + apiKey;
    $.ajax({
        url: uvQueryURL,
        method: "GET",
        // on success run a function on uvResponse
        success: function (uvResponse) {
            var uvIndex = uvResponse.value;
            // set the HTML for the element containing the uv index
            var uvIndexP = $(`
                <p>UV Index: 
                    <span id="uvIndexColor" class="px-2 py-2 rounded">${uvIndex}</span>
                </p>
            `);
            // append the uv index to the detail element 
            $(detail).append(uvIndexP);
            // call the forecast function with lat and long to get the 5 day
            forecast(lat, lon);
            // call the uv index function to get the uv index
            UVIndex(uvIndex)
        }
        // error: logError('uv index api error')
    });
}

function forecast(lat, lon) {
    var forecastURL = 'https://api.openweathermap.org/data/2.5/onecall?lat=' + lat + '&lon=' + lon + '&units=imperial&exclude=current,minutely,hourly,alerts&appid=' + apiKey;
    $.ajax({
        url: forecastURL,
        method: "GET",
        success: (forecastRes) => {
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
                    <div class="card pl-3 pt-3 mb-3 bg-primary text-light">
                        <div class="card-body">
                            <h5>${currDate}</h5>
                            <p>${iconURL}</p>
                            <p>Temp: ${locationInfo.temp} °F</p>
                            <p>Humidity: ${locationInfo.humidity}\%</p>
                        </div>
                    </div>
                <div>
            `);

                $(forecastSection).append(forecastCard);
            }
        }
        // error: logError('forecast api error')

    });
}

// cycle through the UV index on the main detail element to set it to it's respective color
function UVIndex(element) {
    if (element >= 0 && element <= 2) {
        $("#uvIndexColor").css("background-color", "#3EA72D").css("color", "white");
    } else if (element >= 3 && element <= 5) {
        $("#uvIndexColor").css("background-color", "#FFF300");
    } else if (element >= 6 && element <= 7) {
        $("#uvIndexColor").css("background-color", "#F18B00");
    } else if (element >= 8 && element <= 10) {
        $("#uvIndexColor").css("background-color", "#E53210").css("color", "white");
    } else {
        $("#uvIndexColor").css("background-color", "#B567A4").css("color", "white");
    };
}

// creat on click for each button that 
$("#search").on("click", function (event) {
    event.preventDefault();
    //
    var location = $("#location-input").val().trim();
    // run the get weather with the searched location
    getWeather(location);
    addCityToSidebar(location);
    // save the search history to the localstorage
    localStorage.setItem("history", JSON.stringify(searchHistory));
});

// for each city in the history, make it clickable and search for the weather
$(document).on("click", ".list-group-item", function () {
    var listlocation = $(this).text();
    getWeather(listlocation);
});

// add the city to the sidebar of recent searches
function addCityToSidebar(cityName) {
    if (!searchHistory.includes(cityName)) {
        // push the searched city in to the history array
        searchHistory.push(cityName);
        var searchedlocation = $(`
                <li class="list-group-item">${cityName}</li>
                `);
        // append the searched location to the history list
        $("#history").append(searchedlocation);
    }
}

//when the doc is loaded and ready, start the scripts
$(document).ready(function () {
    // pull the history from the localstorage
    var searchHistory = JSON.parse(localStorage.getItem("history"));
    // check if any history exists
    if (searchHistory !== null) {
        // get the length of the search array to get the last item added to it
        var lastSearchedIndex = searchHistory.length - 1;
        var lastSearchedlocation = searchHistory[lastSearchedIndex];
        for (var i = searchHistory.length; i > (searchHistory.length - 5); i--) {
            addCityToSidebar(searchHistory[i]);
            var searchedlocation = $(`
                <li class="list-group-item">${searchHistory[i]}</li>
                `);
            // append the searched location to the history list
            $("#history").append(searchedlocation);
        }
        // using the most recent city, get the weather
        getWeather(lastSearchedlocation);

    }
});

function logError(error) {
    console.log(Error(error));
}