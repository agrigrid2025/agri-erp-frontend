import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';

const weatherIcons = {
  1000: "☀️",   // Clear
  1001: "☁️",   // Cloudy
  1100: "🌤️",  // Mostly Clear
  1101: "⛅",   // Partly Cloudy
  1102: "🌥️",  // Mostly Cloudy
  2000: "🌫️",   // Fog
  4000: "🌧️",   // Drizzle
  4001: "🌧️",   // Rain
  4200: "🌧️",   // Light Rain
  4201: "🌧️",   // Heavy Rain
  8000: "⛈️",   // Thunderstorm
  // Add more as needed
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
        const data = await res.json();
        if (data.forecast) {
          setForecast(data.forecast);
          setLocation(data.location);
        } else {
          setError(data.error || 'Failed to load weather');
        }
      } catch (err) {
        setError('Cannot connect to weather service');
      } finally {
        setLoading(false);
      }
    };
    fetchWeather();
  }, [tenant]);

  if (loading) return <p className="text-center text-gray-600">Loading forecast...</p>;
  if (error) return <p className="text-red-600 text-center">{error}</p>;

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Weather Forecast</h1>
        {!location.hasPin && (
          <Link
            to={`/dashboard/${tenant}/weather/set-location`}
            className="bg-yellow-500 hover:bg-yellow-600 text-white px-6 py-3 rounded-lg font-medium"
          >
            Set Weather Location
          </Link>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-6">
        {forecast.map((day, index) => (
          <div key={index} className="bg-white rounded-2xl shadow-xl p-6 text-center hover:shadow-2xl transition">
            <p className="font-semibold text-gray-700">
              {index === 0 ? 'Today' :
              index === 1 ? 'Tomorrow' :
              new Date(day.date).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })}
            </p>
            <div className="text-6xl my-4">
              {weatherIcons[day.weatherCode] || "🌤️"}
            </div>
            <div className="text-3xl font-bold text-gray-800">
              {day.tempMax}°
            </div>
            <div className="text-xl text-gray-600">
              {day.tempMin}°
            </div>
            <div className="mt-4 space-y-2 text-sm text-gray-600">
              <p>🌧️ {day.precipProb}% rain</p>
              <p>💨 {day.windSpeed} km/h</p>
              <p>💧 {day.humidity}% humidity</p>
            </div>
            {index === 0 && (day.sunrise || day.sunset) && (
              <div className="mt-4 text-sm border-t pt-2">
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