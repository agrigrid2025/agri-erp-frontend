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

  const getDayLabel = (index) => {
    if (index === 0) return 'TODAY';
    if (index === 1) return 'TOMORROW';
    return new Date(forecast[index].date).toLocaleDateString('en-GB', { weekday: 'uppercase' }).toUpperCase();
  };

  const getDateLabel = (index) => {
    return new Date(forecast[index].date).toLocaleDateString('en-GB', { day: 'numeric', month: 'uppercase' });
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="bg-white rounded-2xl shadow-lg p-8 mb-10 text-center">
        <h1 className="text-4xl font-bold text-gray-800 mb-6">
          Weather Forecast – {tenant.toUpperCase()}
        </h1>

        <p className="text-lg text-gray-700 mb-4">
          Forecast location:{' '}
          <span className="font-mono text-blue-600">
            {parseFloat(location.lat).toFixed(6)}, {parseFloat(location.lon).toFixed(6)}
          </span>
          {' '}
          <a
            href={`https://www.google.com/maps?q=${location.lat},${location.lon}&z=16`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline"
          >
            (view on map)
          </a>
        </p>

        <Link
          to={`/dashboard/${tenant}/weather/set-location`}
          className="inline-block bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium"
        >
          Set / Change Location
        </Link>

        <p className="text-sm text-gray-500 mt-4">Powered by Tomorrow.io – Hyperlocal & Accurate</p>
      </div>

      {/* 7-Day Forecast Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-6">
        {forecast.map((day, index) => (
          <div
            key={index}
            className="bg-white rounded-2xl shadow-xl p-6 text-center hover:shadow-2xl hover:scale-105 transition-all duration-300 border-2 border-transparent hover:border-green-500"
          >
            {/* Day of week */}
            <p className="text-lg font-bold text-gray-900 uppercase tracking-wider">
              {index === 0 ? 'TODAY' :
              index === 1 ? 'TOMORROW' :
              new Date(day.date).toLocaleDateString('en-GB', { weekday: 'short' }).toUpperCase()}
            </p>

            {/* Date below */}
            <p className="text-xl font-semibold text-gray-700 mb-4">
              {new Date(day.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }).toUpperCase()}
            </p>

            {/* Icon */}
            <div className="text-7xl my-6">
              {weatherIcons[day.weatherCode] || "☀️"}
            </div>

            {/* Temperatures */}
            <div className="mb-6">
              <p className="text-4xl font-bold text-red-600">{day.tempMax}°</p>
              <p className="text-2xl text-blue-600">{day.tempMin}°</p>
            </div>

            {/* Info Grid */}
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="bg-blue-50 rounded-lg p-3">🌧️ {day.precipProb}% rain</div>
              <div className="bg-gray-50 rounded-lg p-3">💨 {day.windSpeed} km/h</div>
              <div className="bg-purple-50 rounded-lg p-3">👁️ {day.visibility} km</div>
              <div className="bg-yellow-50 rounded-lg p-3">☀️ UV {day.uvIndex}</div>
              <div className="bg-indigo-50 rounded-lg p-3">☁️ {day.cloudCover}% cloud</div>
              <div className="bg-green-50 rounded-lg p-3">💧 {day.humidity}% RH</div>
            </div>

            {/* Sunrise/Sunset on Today only */}
            {index === 0 && day.sunrise && (
              <div className="mt-6 pt-4 border-t text-sm text-gray-600">
                <p>🌅 {day.sunrise}</p>
                <p>🌇 {day.sunset}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}