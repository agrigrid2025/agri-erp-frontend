import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';

const weatherIcons = {
  1000: "☀️",
  1001: "☁️",
  1100: "🌤️",
  1101: "⛅",
  1102: "🌥️",
  2000: "🌫️",
  4000: "🌦️",
  4001: "🌧️",
  4200: "🌧️",
  4201: "🌧️",
  8000: "⛈️",
};

export default function WeatherForecast() {
  const { tenant } = useParams();
  const [forecast, setForecast] = useState([]);
  const [location, setLocation] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        const res = await fetch(`https://${tenant}.agrigrid.net/api/weather/forecast/`, {
          credentials: 'include',
        });
        if (!res.ok) throw new Error('Failed to load weather');
        const data = await res.json();
        setForecast(data.forecast || []);
        setLocation(data.location || {});
      } catch (err) {
        setError('Cannot connect to weather service');
      } finally {
        setLoading(false);
      }
    };
    fetchWeather();
  }, [tenant]);

  if (loading) return <div className="text-center py-32 text-2xl text-gray-600">Loading forecast...</div>;
  if (error) return <div className="text-center py-32 text-2xl text-red-600">{error}</div>;

  const today = forecast[0] || {};

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-500 to-cyan-500 rounded-3xl shadow-2xl p-8 mb-12 text-white text-center">
        <h1 className="text-5xl font-bold mb-4">Weather Forecast</h1>
        <p className="text-2xl mb-2">{tenant.toUpperCase()} Farm</p>
      </div>

      {/* Today Hero Card - Reduced height */}
      <div className="bg-gradient-to-br from-blue-400 to-cyan-400 rounded-3xl shadow-2xl p-8 mb-12 text-white text-center">
        <p className="text-3xl font-bold mb-4">Today</p>
        <div className="text-8xl mb-4">{weatherIcons[today.weatherCode] || "☀️"}</div>
        <p className="text-6xl font-bold mb-2">{today.tempMax}°</p>
        <p className="text-4xl opacity-90 mb-6">{today.tempMin}°</p>

        {/* Larger info */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-2xl font-medium">
          <div>🌧️ {today.precipProb}% rain</div>
          <div>💨 {today.windSpeed} km/h</div>
          <div>💧 {today.humidity}% humidity</div>
          <div>☁️ {today.cloudCover}% cloud</div>
        </div>

        {/* Sunrise & Sunset on one line */}
        {today.sunrise && (
          <div className="mt-8 text-2xl font-medium">
            🌅 Sunrise {today.sunrise}  •  🌇 Sunset {today.sunset}
          </div>
        )}
      </div>

      {/* 6-Day Forecast */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 mb-12">
        {forecast.slice(1).map((day, index) => (
          <div
            key={index}
            className="bg-white/80 backdrop-blur rounded-3xl shadow-xl p-6 text-center hover:shadow-2xl hover:-translate-y-2 transition-all duration-300"
          >
            <p className="text-lg font-bold text-gray-800 mb-2">
              {index === 0 ? 'Tomorrow' : new Date(day.date).toLocaleDateString('en-GB', { weekday: 'short' }).toUpperCase()}
            </p>
            <p className="text-xl text-gray-700 mb-4">
              {new Date(day.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
            </p>
            <div className="text-6xl my-6">{weatherIcons[day.weatherCode] || "☀️"}</div>
            <p className="text-4xl font-bold text-gray-800 mb-1">{day.tempMax}°</p>
            <p className="text-2xl text-gray-600">{day.tempMin}°</p>
            <div className="mt-4 text-sm space-y-1">
              <p className="text-blue-600">🌧️ {day.precipProb}%</p>
              <p className="text-gray-600">💨 {day.windSpeed} km/h</p>
            </div>
          </div>
        ))}
      </div>

      {/* Location Info at Bottom */}
      <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
        <p className="text-lg text-gray-700 mb-4">
          Forecast location:{' '}
          <span className="font-mono text-blue-600">
            {parseFloat(location.lat).toFixed(4)}°, {parseFloat(location.lon).toFixed(4)}°
          </span>
          {' • '}
          <a
            href={`https://www.google.com/maps?q=${location.lat},${location.lon}&z=14`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline"
          >
            View on Map
          </a>
        </p>
        <Link
          to={`/dashboard/${tenant}/weather/set-location`}
          className="inline-block bg-green-600 hover:bg-green-700 text-white px-8 py-4 rounded-xl text-lg font-medium transition"
        >
          Set / Change Location
        </Link>
        <p className="text-sm text-gray-500 mt-4">Powered by Tomorrow.io – Hyperlocal & Accurate</p>
      </div>
    </div>
  );
}