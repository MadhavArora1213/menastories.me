import React, { useEffect, useState } from 'react';

const WeatherWidget = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        // Using WeatherAPI.com for weather data
        const apiKey = import.meta.env.VITE_WEATHERAPI_KEY || 'YOUR_WEATHERAPI_KEY';
        const city = 'Dubai';
        const res = await fetch(`https://api.weatherapi.com/v1/current.json?key=${apiKey}&q=${city}&aqi=no`);

        if (!res.ok) {
          // Fallback to Open-Meteo if WeatherAPI fails
          const lat = 25.2048, lon = 55.2708;
          const fallbackRes = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weather_code&hourly=temperature_2m&timezone=auto`);
          const fallbackJson = await fallbackRes.json();
          setData({
            temp: Math.round(fallbackJson.current.temperature_2m),
            description: getWeatherDescription(fallbackJson.current.weather_code),
            icon: getWeatherIcon(fallbackJson.current.weather_code)
          });
        } else {
          const json = await res.json();
          setData({
            temp: Math.round(json.current.temp_c),
            description: json.current.condition.text,
            icon: json.current.condition.icon
          });
        }
      } catch (error) {
        console.error('Weather API error:', error);
        // Fallback to mock data if both APIs fail
        setData({
          temp: 32,
          description: 'Sunny',
          icon: '01d'
        });
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const getWeatherDescription = (code) => {
    const descriptions = {
      0: 'Clear sky',
      1: 'Mainly clear',
      2: 'Partly cloudy',
      3: 'Overcast',
      45: 'Foggy',
      48: 'Depositing rime fog',
      51: 'Light drizzle',
      53: 'Moderate drizzle',
      55: 'Dense drizzle',
      61: 'Slight rain',
      63: 'Moderate rain',
      65: 'Heavy rain',
      71: 'Slight snow',
      73: 'Moderate snow',
      75: 'Heavy snow'
    };
    return descriptions[code] || 'Unknown';
  };

  const getWeatherIcon = (code) => {
    if (code === 0 || code === 1) return '01d'; // Sunny
    if (code === 2 || code === 3) return '02d'; // Partly cloudy
    if (code >= 45 && code <= 48) return '50d'; // Fog
    if (code >= 51 && code <= 55) return '09d'; // Drizzle
    if (code >= 61 && code <= 65) return '10d'; // Rain
    if (code >= 71 && code <= 75) return '13d'; // Snow
    return '01d';
  };

  if (loading) {
    return (
      <div className="bg-white border border-gray-200 rounded p-1 flex items-center space-x-1">
        <div className="w-3 h-3 bg-gray-300 rounded animate-pulse"></div>
        <div className="text-xs text-gray-600">Loading...</div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="bg-white border border-gray-200 rounded p-1 flex items-center space-x-1 shadow-sm">
      <div className="text-xs text-gray-600">Dubai</div>
      <div className="text-sm font-bold text-gray-900">{data.temp}°C</div>
    </div>
  );
};

export default WeatherWidget;

