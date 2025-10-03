const API_KEY = "90277c6fc464e2ce9eb69412b56690e6";

// Elements for Current Weather Card
const currentCityNameEl = document.getElementById("card-city-name");
const currentCountryCodeEl = document.getElementById("card-country-code");
const currentTempEl = document.getElementById("card-temperature");
const currentDescEl = document.getElementById("card-weather-desc");
const currentHumidityEl = document.getElementById("card-humidity");
const currentWindEl = document.getElementById("card-wind");
const currentPressureEl = document.getElementById("card-pressure");
const currentWeatherIconEl = document.getElementById(
"card-current-weather-icon"
);

// Elements for Search Section
const cityInput = document.getElementById("city-input");
const searchCityBtn = document.getElementById("search-city-btn");
const refreshBtn = document.getElementById("refresh-btn");

// Elements for Forecast Section
const forecastContainer = document.getElementById("forecast-container");
const avgHighEl = document.getElementById("avg-high");
const avgLowEl = document.getElementById("avg-low");

// General UI Elements
const lastUpdated = document.getElementById("last-updated");
const loadingEl = document.getElementById("loading");
const currentWeatherCard = document.getElementById("current-weather-card");
const forecastSection = document.getElementById("forecast-section");

function showLoading() {
loadingEl.classList.remove("hidden");
currentWeatherCard.classList.add("hidden");
forecastSection.classList.add("hidden");
}

function hideLoading() {
loadingEl.classList.add("hidden");
currentWeatherCard.classList.remove("hidden");
forecastSection.classList.remove("hidden");
}

function getWeatherIconClass(iconCode) {
if (!iconCode) return "fas fa-question";

switch (iconCode) {
    case "01d":
    return "fas fa-sun";
    case "01n":
    return "fas fa-moon";
    case "02d":
    return "fas fa-cloud-sun";
    case "02n":
    return "fas fa-cloud-moon";
    case "03d":
    case "03n":
    return "fas fa-cloud";
    case "04d":
    case "04n":
    return "fas fa-cloud-meatball";
    case "09d":
    case "09n":
    return "fas fa-cloud-showers-heavy";
    case "10d":
    return "fas fa-cloud-sun-rain";
    case "10n":
    return "fas fa-cloud-moon-rain";
    case "11d":
    case "11n":
    return "fas fa-bolt";
    case "13d":
    case "13n":
    return "fas fa-snowflake";
    case "50d":
    case "50n":
    return "fas fa-smog";
    default:
    return "fas fa-cloud";
}
}

// Fetch weather by city name
async function fetchWeatherByCity(city) {
showLoading();
try {
    const response = await fetch(
    `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`
    );
    if (!response.ok) throw new Error("City not found or invalid.");
    const data = await response.json();

    updateCurrentWeatherUI(data);
    fetchForecast(data.coord.lat, data.coord.lon);
} catch (err) {
    alert(err.message);
    hideLoading();
}
}

// Fetch weather
async function fetchWeatherByCoords(lat, lon) {
showLoading();
try {
    const response = await fetch(
    `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`
    );
    if (!response.ok)
    throw new Error("Could not retrieve weather data for coordinates.");
    const data = await response.json();

    updateCurrentWeatherUI(data);
    fetchForecast(data.coord.lat, data.coord.lon);
} catch (err) {
    alert("Error fetching weather by coordinates: " + err.message);
    hideLoading();
}
}

// UI for the main current weather card
function updateCurrentWeatherUI(data) {
currentCityNameEl.textContent = data.name;
currentCountryCodeEl.textContent = data.sys.country;
currentTempEl.textContent = Math.round(data.main.temp);

currentDescEl.textContent = data.weather[0].description
.split(" ")
.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
.join(" ");

currentHumidityEl.textContent = `${data.main.humidity}%`;
currentWindEl.textContent = `${(data.wind.speed * 3.6).toFixed(1)} km/h`;

currentPressureEl.textContent = `${data.main.pressure} hPa`;

currentWeatherIconEl.className = `${getWeatherIconClass(
data.weather[0].icon
)} weather-icon`;

lastUpdated.textContent = "Last updated: " + new Date().toLocaleTimeString();
}

// Fetch 3-day forecast
async function fetchForecast(lat, lon) {
try {
    const response = await fetch(
    `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`
    );
    if (!response.ok) throw new Error("Error fetching forecast data.");
    const data = await response.json();

    displayForecast(data);
    hideLoading();
} catch (err) {
    alert("Error fetching forecast: " + err.message);
    hideLoading();
}
}

function displayForecast(forecastData) {
forecastContainer.innerHTML = "";

const dailyData = {};
forecastData.list.forEach((item) => {
    const date = new Date(item.dt * 1000).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    });
    if (!dailyData[date]) {
    dailyData[date] = {
        temps: [],
        icon: item.weather[0].icon,
        description: item.weather[0].description,
    };
    }
    dailyData[date].temps.push(item.main.temp_max);
    dailyData[date].temps.push(item.main.temp_min);
});

let highTemps = [];
let lowTemps = [];
let count = 0;

for (const date in dailyData) {
    if (count >= 3) break;
    const dayInfo = dailyData[date];
    const maxTemp = Math.round(Math.max(...dayInfo.temps));
    const minTemp = Math.round(Math.min(...dayInfo.temps));

    highTemps.push(maxTemp);
    lowTemps.push(minTemp);

    const forecastCard = document.createElement("div");
    forecastCard.classList.add("forecast-card");
    forecastCard.innerHTML = `
            <h3>${date}</h3>
            <i class="${getWeatherIconClass(dayInfo.icon)} forecast-icon"></i>
            <p>${dayInfo.description
            .split(" ")
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(" ")}</p>
            <p>High: ${maxTemp}°C</p>
            <p>Low: ${minTemp}°C</p>
        `;
    forecastContainer.appendChild(forecastCard);
    count++;
}

const avgHigh =
    highTemps.length > 0
    ? Math.round(highTemps.reduce((a, b) => a + b, 0) / highTemps.length)
    : "N/A";
const avgLow =
    lowTemps.length > 0
    ? Math.round(lowTemps.reduce((a, b) => a + b, 0) / lowTemps.length)
    : "N/A";

avgHighEl.textContent = `${avgHigh}°C`;
avgLowEl.textContent = `${avgLow}°C`;
}

// Get user's current location
function getUserLocation() {
if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
    (position) => {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;
        fetchWeatherByCoords(lat, lon);
    },
    (error) => {
        console.error("Geolocation error:", error);
        alert(
        "Could not retrieve your location. Please allow location access or search for a city."
        );
        fetchWeatherByCity("London");
    }
    );
} else {
    alert(
    "Geolocation is not supported by your browser. Please search for a city."
    );
    fetchWeatherByCity("London");
}
}

searchCityBtn.addEventListener("click", () => {
const city = cityInput.value.trim();
if (city) {
fetchWeatherByCity(city);
    cityInput.value = "";
} else {
    alert("Please enter a city name.");
}
});

cityInput.addEventListener("keypress", (event) => {
if (event.key === "Enter") {
    searchCityBtn.click();
}
});

refreshBtn.addEventListener("click", () => {
getUserLocation();
});

// Initial load: Get user's location
document.addEventListener("DOMContentLoaded", getUserLocation);
