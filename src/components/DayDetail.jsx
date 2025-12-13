import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { format, addDays, subDays } from 'date-fns';

const weatherIcons = {
  1000: "☀️", // Clear
  1001: "☁️", // Cloudy
  1100: "🌤️", // Mostly Clear
  1101: "⛅", // Partly Cloudy
  1102: "🌥️", // Mostly Cloudy
  2000: "🌫️", // Fog
  4000: "🌦️", // Drizzle
  4001: "🌧️", // Rain
  4200: "🌧️", // Light Rain
  4201: "🌧️", // Heavy Rain
  8000: "⛈️", // Thunderstorm
};

export default function DayDetail() {
  const { tenant, date } = useParams(); // date format YYYY-MM-DD
  const [hourly, setHourly] = useState([]);
  const [sunrise, setSunrise] = useState('');
  const [sunset, setSunset] = useState('');
  const [datePretty, setDatePretty] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Fix Safari date parsing
  const currentDate = new Date(date.replace(/-/g, '/'));
  const prevDate = format(subDays(currentDate, 1), 'yyyy-MM-dd');
  const nextDate = format(addDays(currentDate, 1), 'yyyy-MM-dd');

  useEffect(() => {
    const fetchHourly = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await fetch(`https://${tenant}.agrigrid.net/api/weather/hourly/${date}/`, {
          credentials: 'include',
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        setHourly(data.hourly || []);
        setSunrise(data.sunrise || '');
        setSunset(data.sunset || '');
        setDatePretty(data.datePretty || date);
      } catch (err) {
        console.error('Hourly fetch error:', err);
        setError('Failed to load hourly data');
      } finally {
        setLoading(false);
      }
    };
    fetchHourly();
  }, [tenant, date]);

  const getIcon = (hour) => {
    const h = parseInt(hour.localHour?.split(':')[0] || 12);
    const sunsetH = sunset ? parseInt(sunset.split(':')[0]) : 18;
    const sunriseH = sunrise ? parseInt(sunrise.split(':')[0]) : 6;

    const isNight = h >= sunsetH || h < sunriseH;

    if (isNight) return "🌙";
    if (hour.precipProb > 70) return "🌧️";
    if (hour.precipProb > 40) return "🌦️";
    if (hour.windSpeed > 35) return "💨";
    if (hour.temperature > 35) return "🥵";
    if (hour.cloudCover > 80) return "☁️";
    if (hour.cloudCover > 30) return "⛅";

    return weatherIcons[hour.weatherCode] || "🌤️";
  };

  if (loading) {
    return <div className="text-center py-32 text-2xl text-gray-600">Loading hourly forecast...</div>;
  }

  if (error) {
    return <div className="text-center py-32 text-2xl text-red-600">{error}</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="relative bg-gradient-to-br from-blue-600 to-blue-800 text-white rounded-3xl shadow-2xl p-10 mb-10 text-center overflow-hidden">
        {/* Previous Day Arrow */}
        <Link
          to={`/dashboard/${tenant}/weather/day/${prevDate}`}
          className="absolute left-6 top-1/2 -translate-y-1/2 z-10 bg-white/30 hover:bg-white/50 backdrop-blur-sm rounded-full p-5 transition-all hover:scale-110 shadow-2xl"
        >
          <svg className="w-14 h-14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="5">
            <path d="M15 18L9 12L15 6" />
          </svg>
        </Link>

        {/* Next Day Arrow */}
        <Link
          to={`/dashboard/${tenant}/weather/day/${nextDate}`}
          className="absolute right-6 top-1/2 -translate-y-1/2 z-10 bg-white/30 hover:bg-white/50 backdrop-blur-sm rounded-full p-5 transition-all hover:scale-110 shadow-2xl"
        >
          <svg className="w-14 h-14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="5">
            <path d="M9 18L15 12L9 6" />
          </svg>
        </Link>

        <h1 className="text-5xl font-bold mb-3 uppercase">{tenant}</h1>
        <p className="text-3xl font-medium opacity-95">{datePretty}</p>

        <div className="flex justify-center gap-16 mt-6 text-white/90">
          <div className="text-center">
            <div className="text-4xl mb-1">Sunrise</div>
            <div className="text-2xl font-bold">{sunrise || '—'}</div>
          </div>
          <div className="text-center">
            <div className="text-4xl mb-1">Sunset</div>
            <div className="text-2xl font-bold">{sunset || '—'}</div>
          </div>
        </div>

        <div className="mt-8">
          <Link to={`/dashboard/${tenant}/weather`} className="text-white/80 hover:text-white underline text-lg">
            ← Back to 7-Day Forecast
          </Link>
        </div>
      </div>

      {/* Hourly Grid */}
      {hourly.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
          {hourly.map((hour, i) => (
            <div key={i} className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all p-6 text-center border border-gray-200">
              <p className="text-xl font-bold text-gray-800 mb-3">
                {hour.localHour}
              </p>
              <div className="text-7xl my-4">
                {getIcon(hour)}
              </div>
              <p className="text-4xl font-bold text-red-600 mb-3">
                {hour.temperature}°
              </p>
              <div className="text-sm space-y-1 text-gray-600">
                <div>🌧️ {hour.precipProb}% rain</div>
                <div>💨 {hour.windSpeed} km/h</div>
                <div>💧 {hour.humidity}% humidity</div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-24 text-gray-500">
          <p className="text-2xl">No hourly data available for {datePretty}</p>
          <Link to={`/dashboard/${tenant}/weather`} className="mt-4 text-blue-600 hover:underline text-lg">
            Back to 7-Day Forecast
          </Link>
        </div>
      )}
    </div>
  );
}