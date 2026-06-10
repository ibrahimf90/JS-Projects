/**
 * Maps WMO weather codes to OpenWeatherMap-like descriptions and icons.
 * @param {number} code - The WMO weather code.
 * @returns {Object} - Object containing main weather type and icon URL.
 */
function mapWeatherCode(code) {
    const mapping = {
        0: { main: "Clear", icon: "https://cdn.freecodecamp.org/weather-icons/01d.png" },
        1: { main: "Partly Cloudy", icon: "https://cdn.freecodecamp.org/weather-icons/02d.png" },
        2: { main: "Partly Cloudy", icon: "https://cdn.freecodecamp.org/weather-icons/03d.png" },
        3: { main: "Overcast", icon: "https://cdn.freecodecamp.org/weather-icons/04d.png" },
        45: { main: "Fog", icon: "https://cdn.freecodecamp.org/weather-icons/50d.png" },
        48: { main: "Fog", icon: "https://cdn.freecodecamp.org/weather-icons/50d.png" },
        51: { main: "Drizzle", icon: "https://cdn.freecodecamp.org/weather-icons/09d.png" },
        53: { main: "Drizzle", icon: "https://cdn.freecodecamp.org/weather-icons/09d.png" },
        55: { main: "Drizzle", icon: "https://cdn.freecodecamp.org/weather-icons/09d.png" },
        61: { main: "Rain", icon: "https://cdn.freecodecamp.org/weather-icons/10d.png" },
        63: { main: "Rain", icon: "https://cdn.freecodecamp.org/weather-icons/10d.png" },
        65: { main: "Heavy Rain", icon: "https://cdn.freecodecamp.org/weather-icons/10d.png" },
        71: { main: "Snow", icon: "https://cdn.freecodecamp.org/weather-icons/13d.png" },
        73: { main: "Snow", icon: "https://cdn.freecodecamp.org/weather-icons/13d.png" },
        75: { main: "Heavy Snow", icon: "https://cdn.freecodecamp.org/weather-icons/13d.png" },
        80: { main: "Showers", icon: "https://cdn.freecodecamp.org/weather-icons/09d.png" },
        81: { main: "Showers", icon: "https://cdn.freecodecamp.org/weather-icons/09d.png" },
        82: { main: "Heavy Showers", icon: "https://cdn.freecodecamp.org/weather-icons/09d.png" },
        95: { main: "Thunderstorm", icon: "https://cdn.freecodecamp.org/weather-icons/11d.png" },
        96: { main: "Thunderstorm", icon: "https://cdn.freecodecamp.org/weather-icons/11d.png" },
        99: { main: "Thunderstorm", icon: "https://cdn.freecodecamp.org/weather-icons/11d.png" },
    };
    return mapping[code] || { main: "Clouds", icon: "https://cdn.freecodecamp.org/weather-icons/02d.png" };
}

/**
 * Fetches weather data for a given city using Open-Meteo Geocoding and Forecast APIs.
 * Supports all global cities including Beirut.
 * @param {string} city - The name of the city.
 * @returns {Promise<Object|null>} - The mapped weather data object.
 */
async function getWeather(city) {
    try {
        // Step 1: Geocoding - Convert city name to lat/lon
        const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en&format=json`;
        const geoResponse = await fetch(geoUrl);
        const geoData = await geoResponse.json();

        if (!geoData.results || geoData.results.length === 0) {
            throw new Error("City not found");
        }

        const { latitude, longitude, name } = geoData.results[0];

        // Step 2: Fetch Weather Data
        const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m,wind_gusts_10m&timezone=auto`;
        const weatherResponse = await fetch(weatherUrl);
        const weatherData = await weatherResponse.json();

        if (!weatherData.current) {
            throw new Error("Weather data unavailable");
        }

        const current = weatherData.current;
        const mappedWeather = mapWeatherCode(current.weather_code);

        // Map Open-Meteo response to the application's expected format
        return {
            name: name,
            weather: [{
                main: mappedWeather.main,
                icon: mappedWeather.icon
            }],
            main: {
                temp: current.temperature_2m,
                feels_like: current.apparent_temperature,
                humidity: current.relative_humidity_2m
            },
            wind: {
                speed: current.wind_speed_10m,
                gust: current.wind_gusts_10m
            }
        };

    } catch (error) {
        console.log(error);
        return null;
    }
}

/**
 * Displays the weather data in the DOM.
 * @param {string} city - The name of the city to show weather for.
 */
async function showWeather(city) {
    const weatherDisplay = document.getElementById('weather-display');
    const data = await getWeather(city);

    if (!data) {
        alert("Something went wrong, please try again later.");
        return;
    }

    // Helper function to handle undefined values
    const formatValue = (val, unit = "") => (val !== undefined && val !== null) ? `${val}${unit}` : "N/A";

    // Update DOM elements
    document.getElementById('location').textContent = formatValue(data.name);
    
    const icon = document.getElementById('weather-icon');
    if (data.weather && data.weather[0] && data.weather[0].icon) {
        icon.src = data.weather[0].icon;
        icon.style.display = "block";
    } else {
        icon.src = "";
        icon.style.display = "none";
    }

    document.getElementById('main-temperature').textContent = formatValue(data.main ? data.main.temp : undefined);
    document.getElementById('weather-main').textContent = (data.weather && data.weather[0]) ? data.weather[0].main : "N/A";
    
    document.getElementById('feels-like').textContent = formatValue(data.main ? data.main.feels_like : undefined, "°C");
    document.getElementById('humidity').textContent = formatValue(data.main ? data.main.humidity : undefined, "%");
    document.getElementById('wind').textContent = formatValue(data.wind ? data.wind.speed : undefined, " m/s");
    document.getElementById('wind-gust').textContent = formatValue(data.wind ? data.wind.gust : undefined, " m/s");

    // Reveal the weather card
    weatherDisplay.classList.add('active');
}

// Event Listeners
document.getElementById('get-weather-btn').addEventListener('click', () => {
    const cityInput = document.getElementById('city-input');
    const selectedCity = cityInput.value.trim();

    if (selectedCity) {
        showWeather(selectedCity);
    }
});

// Optional: Allow pressing 'Enter' to search
document.getElementById('city-input').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        document.getElementById('get-weather-btn').click();
    }
});
