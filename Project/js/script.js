const apiKey = 'ad4ee17d2754336008bc1a43919a2363';
const lat = '35.1796'; // Busan latitude
const lon = '129.0756'; // Busan longitude


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


// Update weather details
function displayWeatherData(data) {
   const weather = data.weather[0]; // Weather information
   const main = data.main; // Main weather details
   const wind = data.wind; // Wind details
   const sys = data.sys; // Sunrise & Sunset

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
      case "Thunderstorm":
         weatherMessage.textContent = "Thunderstorms are expected. Stay safe indoors! ⛈️";
         break;
      case "Mist":
      case "Fog":
         weatherMessage.textContent = "It's misty outside. Drive carefully! 🌫️";
         break;
      case "Drizzle":
         weatherMessage.textContent = "A light drizzle is falling. Take a jacket just in case! 🌧️";
         break;
      default:
         weatherMessage.textContent = "Fetching the latest weather data...";
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
   const element = document.getElementById(`${type}-status`);
   const valueElement = document.getElementById(`${type}-value`);

   // Stop if the element doesn't exist
   if (!element || !valueElement) return;

   // Update value if it exists
   valueElement.textContent = value !== undefined ? value : '--';

   // Set the status and class based on the value
   if (value <= 50) {
      element.textContent = 'Good';
      element.className = 'dust-status good';
   } else if (value <= 100) {
      element.textContent = 'Moderate';
      element.className = 'dust-status moderate';
   } else if (value <= 150) {
      element.textContent = 'Sensitive Groups';
      element.className = 'dust-status sensitive';
   } else if (value <= 200) {
      element.textContent = 'Unhealthy';
      element.className = 'dust-status unhealthy';
   } else if (value <= 300) {
      element.textContent = 'Very Unhealthy';
      element.className = 'dust-status very-unhealthy';
   } else {
      element.textContent = 'Hazardous';
      element.className = 'dust-status hazardous';
   }
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


// Display the temperature chart by default when the page loads
document.addEventListener('DOMContentLoaded', () => {
   displayHourlyChart('temperature'); // Show hourly temperature chart
});
