const apiKey = 'ad4ee17d2754336008bc1a43919a2363';

let lat = '37.5665'; // Default: Seoul
let lon = '126.9780'; // Default: Seoul


/// Initialize location and fetch data
function initializeLocation() {
   const storedLat = sessionStorage.getItem('lat');
   const storedLon = sessionStorage.getItem('lon');

   if (storedLat && storedLon) {
      lat = storedLat;
      lon = storedLon;
      console.log(`Using saved location: lat=${lat}, lon=${lon}`);
   } else {
      console.log('No location found in sessionStorage. Using default location.');

      // Store default location in sessionStorage
      sessionStorage.setItem('lat', lat);
      sessionStorage.setItem('lon', lon);
   }

   // Fetch weather and air quality data
   fetchWeatherData(lat, lon);
   fetchAirQualityData(lat, lon);
}


// Update the user's current location
function updateCurrentLocation() {
   if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
         (position) => {
            lat = position.coords.latitude;
            lon = position.coords.longitude;

            // Save updated location in sessionStorage
            sessionStorage.setItem('lat', lat);
            sessionStorage.setItem('lon', lon);

            console.log(`User location updated: lat=${lat}, lon=${lon}`);

            // Fetch updated data
            fetchWeatherData(lat, lon);
            fetchAirQualityData(lat, lon);
         },
         (error) => {
            console.error('Error fetching location:', error.message);

            // Use default location as fallback
            lat = '37.5665'; // Default: Seoul
            lon = '126.9780';

            // Fetch data using default location
            fetchWeatherData(lat, lon);
            fetchAirQualityData(lat, lon);
         }
      );
   } else {
      console.error('Geolocation is not supported by this browser.');

      // Use default location as fallback
      lat = '37.5665'; // Default: Seoul
      lon = '126.9780';

      // Fetch data using default location
      fetchWeatherData(lat, lon);
      fetchAirQualityData(lat, lon);
   }
}


// Add event listeners
document.addEventListener('DOMContentLoaded', () => {
   initializeLocation();

   const currentLocationBtn = document.getElementById('current-location-btn');
   if (currentLocationBtn) {
      currentLocationBtn.addEventListener('click', updateCurrentLocation);
   } else {
      console.error('Button with ID "current-location-btn" not found in DOM.');
   }
});


// Update current date & time
function updateDateTime() {
   const dateElement = document.getElementById('current-date'); // Date
   const timeElement = document.getElementById('current-time'); // Time
   const weekdayElement = document.getElementById('weekday'); // Weekday

   // Check if elements exist
   if (!dateElement || !timeElement) {
      console.error('Date or time elements not found');
      return;
   }

   // Format date
   const now = new Date();
   const options = { year: 'numeric', month: 'long', day: 'numeric' };
   const currentDate = now.toLocaleDateString(undefined, options);

   // Format time
   const hours = String(now.getHours()).padStart(2, '0');
   const minutes = String(now.getMinutes()).padStart(2, '0');
   const seconds = String(now.getSeconds()).padStart(2, '0');
   const currentTime = `${hours} : ${minutes} : ${seconds}`;

   // Update date & time
   dateElement.textContent = currentDate;
   timeElement.textContent = currentTime;

   // Update weekday
   const weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
   if (weekdayElement) {
      weekdayElement.textContent = weekdays[now.getDay()];
   }
}


// Fetch weather data
async function fetchWeatherData() {
   try {
      // Call OpenWeather API to get weather data
      const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`);

      // Check if the response is successful
      if (!response.ok) {
         throw new Error('Failed to fetch weather data');
      }

      // Convert the response to JSON
      const data = await response.json();

      // Display the weather data
      displayWeatherData(data);

      return data;
   } catch (error) { // Catch any errors that occur while try
      console.error("Error fetching weather data:", error);
      return null;
   }
}

// Fetch air quality data
async function fetchAirQualityData() {
   try {
      // Call OpenWeather API to get weather data
      const response = await fetch(`https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${apiKey}`);

      // Convert the response to JSON
      const data = await response.json();

      if (data.list && data.list.length > 0) {
         const components = data.list[0].components; // Extract air quality components

         // Display air quality data
         displayAirQualityData(components);

         // Update air quality status
         updateDustStatus(components);

         return components;
      }
   } catch (error) { // Catch any errors that occur while try
      console.error('Error fetching air quality data:', error);
   }
   return null;
}


// Update weather details
function displayWeatherData(data) {
   const weather = data.weather[0]; // Weather information
   const main = data.main; // Main weather details
   const wind = data.wind; // Wind details
   const sys = data.sys; // Sunrise & Sunset
   updateBackground(weather.main);

   // Get elements to update
   const cityElement = document.getElementById('city');
   const dateElement = document.getElementById('date');
   const weekdayElement = document.getElementById('weekday');
   const temperatureElement = document.getElementById('temperature');
   const weatherDescriptionElement = document.getElementById('weather-description');
   const feelsLikeElement = document.getElementById('feels-like');
   const humidityElement = document.getElementById('humidity');
   const precipitationElement = document.getElementById('precipitation');
   const pressureElement = document.getElementById('pressure');
   const windSpeedElement = document.getElementById('wind-speed');
   const windDirectionElement = document.getElementById('wind-direction');
   const cloudsElement = document.getElementById('clouds');
   const sunriseElement = document.getElementById('sunrise');
   const sunsetElement = document.getElementById('sunset');

   // Update city
   if (cityElement) cityElement.textContent = data.name || 'Unknown Location';

   // Update current date
   if (dateElement) dateElement.textContent = new Date().toLocaleDateString('en-US', { month: '2-digit', day: '2-digit' });

   // Update current weekday
   if (weekdayElement) weekdayElement.textContent = new Date().toLocaleDateString('en-US', { weekday: 'long' });

   // Update weather icon
   const iconCode = weather.icon;
   const iconUrl = `http://openweathermap.org/img/wn/${iconCode}@2x.png`;
   const weatherIconElement = document.getElementById('weather-icon');
   if (weatherIconElement) weatherIconElement.src = iconUrl;

   // Update temperature and weather description
   if (temperatureElement) temperatureElement.textContent = `${main.temp.toFixed(1)}°C`;
   if (weatherDescriptionElement) weatherDescriptionElement.textContent = weather.description;

   // Update weather details
   if (feelsLikeElement) feelsLikeElement.textContent = `${main.feels_like.toFixed(1)} °C`;
   if (humidityElement) humidityElement.textContent = `${main.humidity} %`;
   if (precipitationElement) precipitationElement.textContent = data.rain ? `${data.rain['1h']} mm` : `0 mm`;
   if (pressureElement) pressureElement.textContent = `${main.pressure} hPa`;
   if (windSpeedElement) windSpeedElement.textContent = `${wind.speed.toFixed(2)} m/s`;
   if (windDirectionElement) windDirectionElement.textContent = `${wind.deg} °`;
   if (cloudsElement) cloudsElement.textContent = `${data.clouds.all} %`;

   // Update sunrise & sunset
   if (sunriseElement) sunriseElement.textContent = new Date(sys.sunrise * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
   if (sunsetElement) sunsetElement.textContent = new Date(sys.sunset * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

   // Update weather message based on the weather condition
   updateWeatherMessage(weather.main);
}
fetchWeatherData(); // Call the function to fetch & display


// Update message based on the weather condition
// Update message based on the weather condition
function updateWeatherMessage(weather) {
   const weatherMessage = document.getElementById('weather-message');

   // Stop if the element doesn't exist
   if (!weatherMessage) return;

   // Set the message for different weather conditions
   switch (weather) {
      case "Clear":
         weatherMessage.textContent = "It's a sunny day! Perfect for a walk outside ☀️";
         break;
      case "Clouds":
         weatherMessage.textContent = "It's cloudy today. How about a cozy indoor day? ☁️";
         break;
      case "Rain":
         weatherMessage.textContent = "It's raining. Don't forget your umbrella! ☔️";
         break;
      case "Snow":
         weatherMessage.textContent = "Snow is falling! Be careful not to slip ❄️";
         break;
      case "Drizzle":
         weatherMessage.textContent = "A light drizzle is falling. Take a jacket just in case! 🌧️";
         break;
      case "Thunderstorm":
         weatherMessage.textContent = "Thunderstorms are expected. Stay safe indoors! ⛈️";
         break;
      case "Mist":
         weatherMessage.textContent = "It's misty outside. Drive carefully! 🌫️";
         break;
      case "Fog":
         weatherMessage.textContent = "Dense fog is present. Visibility might be low! 🌫️";
         break;
      case "Haze":
         weatherMessage.textContent = "The atmosphere is hazy. Stay hydrated and be cautious! 🌫️";
         break;
      case "Smoke":
         weatherMessage.textContent = "The air is smoky. Try to stay indoors if possible! 🚬";
         break;
      case "Dust":
         weatherMessage.textContent = "Dust is in the air. Wear a mask if you go outside! 🌪️";
         break;
      case "Sand":
         weatherMessage.textContent = "A sandstorm is ongoing. Protect yourself and stay safe! 🏜️";
         break;
      case "Ash":
         weatherMessage.textContent = "Volcanic ash is in the air. Avoid going outside! 🌋";
         break;
      case "Squall":
         weatherMessage.textContent = "Strong squalls are expected. Stay indoors and be safe! 💨";
         break;
      case "Tornado":
         weatherMessage.textContent = "A tornado is nearby. Seek shelter immediately! 🌪️";
         break;
      default:
         weatherMessage.textContent = "Fetching the latest weather data...";
   }
}



// Display air quality data
function displayAirQualityData(components) {

   // Stop if the element doesn't exist
   if (!components) return;

   // Get elements to update
   const pm25Element = document.getElementById('pm25'); // PM2.5 data element
   const pm10Element = document.getElementById('pm10'); // PM10 data element
   const coElement = document.getElementById('co'); // CO (Carbon Monoxide) data element
   const noElement = document.getElementById('no'); // NO (Nitric Oxide) data element
   const no2Element = document.getElementById('no2'); // NO2 (Nitrogen Dioxide) data element
   const o3Element = document.getElementById('o3'); // O3 (Ozone) data element
   const so2Element = document.getElementById('so2'); // SO2 (Sulfur Dioxide) data element
   const nh3Element = document.getElementById('nh3'); // NH3 (Ammonia) data element

   // Update air quality data
   if (pm25Element) pm25Element.textContent = components.pm2_5 ? `${components.pm2_5.toFixed(2)} µg/m³` : '--';
   if (pm10Element) pm10Element.textContent = components.pm10 ? `${components.pm10.toFixed(2)} µg/m³` : '--';
   if (coElement) coElement.textContent = components.co ? `${components.co.toFixed(2)} µg/m³` : '--';
   if (noElement) noElement.textContent = components.no ? `${components.no.toFixed(2)} ppb` : '--';
   if (no2Element) no2Element.textContent = components.no2 ? `${components.no2.toFixed(2)} ppb` : '--';
   if (o3Element) o3Element.textContent = components.o3 ? `${components.o3.toFixed(2)} ppb` : '--';
   if (so2Element) so2Element.textContent = components.so2 ? `${components.so2.toFixed(2)} ppb` : '--';
   if (nh3Element) nh3Element.textContent = components.nh3 ? `${components.nh3.toFixed(2)} ppb` : '--';
}


// Update dust status
function updateDustStatus(components) {
   // Stop if the element doesn't exist
   if (!components) return;

   // If PM10 exists, update its status
   if (components.pm10 !== undefined) {
      updateStatus('pm10', Math.round(components.pm10));
   }

   // If PM2.5 exists, update its status
   if (components.pm2_5 !== undefined) {
      updateStatus('pm25', Math.round(components.pm2_5));
   }
}


// Update the status of dust levels
function updateStatus(type, value) {
   // Get elements to update
   const statusElement = document.getElementById(`${type}-status`);
   const valueElement = document.getElementById(`${type}-value`);

   // Stop if the elements don't exist
   if (!statusElement || !valueElement) return;

   // Update value if it exists
   valueElement.textContent = value !== undefined ? value : '--';

   // Variables for status and CSS class
   let statusText = '';
   let statusClass = '';

   // Determine status and corresponding class based on value
   if (value <= 50) {
      statusText = 'Good';
      statusClass = 'good';
   } else if (value <= 100) {
      statusText = 'Moderate';
      statusClass = 'moderate';
   } else if (value <= 150) {
      statusText = 'Sensitive Groups';
      statusClass = 'sensitive';
   } else if (value <= 200) {
      statusText = 'Unhealthy';
      statusClass = 'unhealthy';
   } else if (value <= 300) {
      statusText = 'Very Unhealthy';
      statusClass = 'very-unhealthy';
   } else {
      statusText = 'Hazardous';
      statusClass = 'hazardous';
   }

   // Update the text content and apply the same class to both elements
   statusElement.textContent = statusText;
   valueElement.className = `dust-number ${statusClass}`; // Apply class to number
   statusElement.className = `dust-status ${statusClass}`; // Apply class to status
}


// Update dust status when the page is loaded
document.addEventListener('DOMContentLoaded', () => {
   updateDustStatus();
});


// Fetch hourly weather forecast data
async function fetchHourlyWeatherData() {
   const response = await fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`); // Fetch 5-day weather forecast data
   const data = await response.json(); // Convert response to JSON
   return data.list;
}


// Perform Updates when the page is loaded
document.addEventListener('DOMContentLoaded', () => {
   console.log('Page fully loaded');
   updateDateTime();
   fetchWeatherData();
   fetchAirQualityData();
   updateDustStatus();
   setInterval(updateDateTime, 1000); // Update the time every second
});


// For Default in 'data.html'
document.addEventListener('DOMContentLoaded', () => {
   // Get the current page's pathname
   const currentPage = window.location.pathname;

   if (currentPage.includes('index.html')) {
      const airQualityBox = document.getElementById('air-quality-box');
      if (airQualityBox) {
         airQualityBox.addEventListener('click', () => {
            window.location.href = 'data.html?chart=doughnut';
         });
      } else {
         console.error('Unable to find the element with ID "air-quality-box".'); // Error message if the element is not found
      }
   }

   if (currentPage.includes('data.html')) {
      const urlParams = new URLSearchParams(window.location.search);
      const chartType = urlParams.get('chart');
      if (chartType === 'doughnut') {
         showDoughnutChart();
      }
   }
});

// Update the background of the dashboard
function updateBackground(weatherCondition) {
   const body = document.body;
   body.className = "";

   switch (weatherCondition.toLowerCase()) {
      case "clear":
         body.classList.add("clear"); // Clear
         break;
      case "clouds":
         body.classList.add("cloudy"); // Cloudy
         break;
      case "rain":
         body.classList.add("rainy"); // Rainy
         break;
      case "snow":
         body.classList.add("snowy"); // Snowy
         break;
      case "thunderstorm":
         body.classList.add("thunderstorm"); // Thunderstorm
         break;
      case "mist":
      case "fog":
         body.classList.add("foggy"); // Foggy
         break;
      default:
         body.classList.add("clear"); // Default: clear weather
   }
}