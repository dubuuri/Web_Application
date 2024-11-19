const apiKey = 'ad4ee17d2754336008bc1a43919a2363';
const lat = '35.1796'; // 부산 위도
const lon = '129.0756'; // 부산 경도


// 날짜와 시간 업데이트 함수
function updateDateTime() {
   const dateElement = document.getElementById('current-date');
   const timeElement = document.getElementById('current-time');
   const weekdayElement = document.getElementById('weekday');

   // 요소가 없는 경우 함수 종료
   if (!dateElement || !timeElement) {
      console.error('Date or time elements not found');
      return;
   }

   const now = new Date();
   const options = { year: 'numeric', month: 'long', day: 'numeric' };
   const currentDate = now.toLocaleDateString(undefined, options);

   const hours = String(now.getHours()).padStart(2, '0');
   const minutes = String(now.getMinutes()).padStart(2, '0');
   const seconds = String(now.getSeconds()).padStart(2, '0');
   const currentTime = `${hours} : ${minutes} : ${seconds}`;

   dateElement.textContent = currentDate;
   timeElement.textContent = currentTime;

   const weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
   if (weekdayElement) {
      weekdayElement.textContent = weekdays[now.getDay()];
   }
}


// 날씨 데이터 가져오기
async function fetchWeatherData() {
   try {
      const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`);
      if (!response.ok) {
         throw new Error('Failed to fetch weather data');
      }
      const data = await response.json();
      displayWeatherData(data);
      return data;
   } catch (error) {
      console.error("Error fetching weather data:", error);
      return null;
   }
}


// 날씨에 따른 메세지 전달 함수
function updateWeatherMessage(weather) {
   const weatherMessage = document.getElementById('weather-message');
   if (!weatherMessage) return;

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


// 홈화면 날씨 업데이트
function displayWeatherData(data) {
   const weather = data.weather[0];
   const main = data.main;
   const wind = data.wind;
   const sys = data.sys;

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

   // 요소가 존재할 경우에만 업데이트
   if (cityElement) cityElement.textContent = data.name || 'Unknown Location';
   if (dateElement) dateElement.textContent = new Date().toLocaleDateString('en-US', { month: '2-digit', day: '2-digit' });
   if (weekdayElement) weekdayElement.textContent = new Date().toLocaleDateString('en-US', { weekday: 'long' });

   const iconCode = weather.icon;
   const iconUrl = `http://openweathermap.org/img/wn/${iconCode}@2x.png`;
   const weatherIconElement = document.getElementById('weather-icon');
   if (weatherIconElement) weatherIconElement.src = iconUrl;

   if (temperatureElement) temperatureElement.textContent = `${main.temp.toFixed(1)}°C`;
   if (weatherDescriptionElement) weatherDescriptionElement.textContent = weather.description;
   if (feelsLikeElement) feelsLikeElement.textContent = `${main.feels_like.toFixed(1)} °C`;
   if (humidityElement) humidityElement.textContent = `${main.humidity} %`;
   if (precipitationElement) precipitationElement.textContent = data.rain ? `${data.rain['1h']} mm` : `0 mm`;
   if (pressureElement) pressureElement.textContent = `${main.pressure} hPa`;
   if (windSpeedElement) windSpeedElement.textContent = `${wind.speed.toFixed(2)} m/s`;
   if (windDirectionElement) windDirectionElement.textContent = `${wind.deg} °`;
   if (cloudsElement) cloudsElement.textContent = `${data.clouds.all} %`;
   if (sunriseElement) sunriseElement.textContent = new Date(sys.sunrise * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
   if (sunsetElement) sunsetElement.textContent = new Date(sys.sunset * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

   updateWeatherMessage(weather.main);
}

fetchWeatherData();


// 대기질 데이터 가져오기
async function fetchAirQualityData() {
   try {
      const response = await fetch(`https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${apiKey}`);
      const data = await response.json();
      if (data.list && data.list.length > 0) {
         const components = data.list[0].components;
         displayAirQualityData(components);
         updateDustStatus(components);
         return components;
      }
   } catch (error) {
      console.error('Error fetching air quality data:', error);
   }
   return null;
}

// console.log(https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${apiKey})

// 대기질 데이터 표시 함수
function displayAirQualityData(components) {
   if (!components) return;

   const pm25Element = document.getElementById('pm25');
   const pm10Element = document.getElementById('pm10');
   const coElement = document.getElementById('co');
   const noElement = document.getElementById('no');
   const no2Element = document.getElementById('no2');
   const o3Element = document.getElementById('o3');
   const so2Element = document.getElementById('so2');
   const nh3Element = document.getElementById('nh3');

   // 요소가 존재하는지 확인 후 업데이트
   if (pm25Element) pm25Element.textContent = components.pm2_5 ? `${components.pm2_5.toFixed(2)} µg/m³` : '--';
   if (pm10Element) pm10Element.textContent = components.pm10 ? `${components.pm10.toFixed(2)} µg/m³` : '--';
   if (coElement) coElement.textContent = components.co ? `${components.co.toFixed(2)} µg/m³` : '--';
   if (noElement) noElement.textContent = components.no ? `${components.no.toFixed(2)} ppb` : '--';
   if (no2Element) no2Element.textContent = components.no2 ? `${components.no2.toFixed(2)} ppb` : '--';
   if (o3Element) o3Element.textContent = components.o3 ? `${components.o3.toFixed(2)} ppb` : '--';
   if (so2Element) so2Element.textContent = components.so2 ? `${components.so2.toFixed(2)} ppb` : '--';
   if (nh3Element) nh3Element.textContent = components.nh3 ? `${components.nh3.toFixed(2)} ppb` : '--';
}


// 미세먼지 상태 업데이트 함수
function updateDustStatus(components) {
   if (!components) return;

   // pm10과 pm25 요소가 있는지 확인 후 업데이트
   if (components.pm10 !== undefined) {
      updateStatus('pm10', Math.round(components.pm10));
   }
   if (components.pm2_5 !== undefined) {
      updateStatus('pm25', Math.round(components.pm2_5));
   }
}

function updateStatus(type, value) {
   const element = document.getElementById(`${type}-status`);
   const valueElement = document.getElementById(`${type}-value`);

   // 요소가 존재하지 않으면 종료
   if (!element || !valueElement) return;

   valueElement.textContent = value !== undefined ? value : '--'; // 반올림된 값 표시

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


// 페이지가 로드되면 미세먼지 상태 업데이트
document.addEventListener('DOMContentLoaded', () => {
   updateDustStatus();
});


async function fetchHourlyWeatherData() {
   const response = await fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`);
   const data = await response.json();
   return data.list.slice(0, 8); // 첫 8시간 데이터만 사용
}


document.addEventListener('DOMContentLoaded', () => {
   console.log('Page fully loaded');
   updateDateTime();
   fetchWeatherData();
   fetchAirQualityData();
   updateDustStatus();
   setInterval(updateDateTime, 1000);
});