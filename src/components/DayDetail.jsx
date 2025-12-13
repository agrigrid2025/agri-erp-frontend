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

  const currentDate = new Date(date);
  const prevDate = format(subDays(currentDate, 1), 'yyyy-MM-dd');
  const nextDate = format(addDays(currentDate, 1), 'yyyy-MM-dd');

  useEffect(() => {
    const fetchHourly = async () => {
      try {
        const res = await fetch(`https://${tenant}.agrigrid.net/api/weather/hourly/${date}/`, {
          credentials: 'include',
        });
        const data = await res.json();
        if (data.hourly) {
          setHourly(data.hourly);
          setSunrise(data.sunrise);
          setSunset(data.sunset);
          setDatePretty(data.datePretty);
        } else {
          setError(data.error || 'Failed to load hourly data');
        }
      } catch (err) {
        setError('Cannot connect to weather service');
      } finally {
        setLoading(false);
      }
    };
    fetchHourly();
  }, [tenant, date]);

  const getIcon = (hour, code) => {
    const h = parseInt(hour.split(':')[0]);
    const sunsetH = sunrise && sunset ? parseInt(sunset.split(':')[0]) : 18;
    const sunriseH = sunrise && sunset ? parseInt(sunrise.split(':')[0]) : 6;

    const isNight = h >= sunsetH || h < sunriseH;

    if (isNight) return "🌙";
    if (hour.precipProb > 70) return "🌧️";
    if (hour.precipProb > 40) return "🌦️";
    if (hour.windSpeed > 35) return "💨";
    if (hour.temperature > 35) return "🥵";
    if (hour.cloudCover > 80) return "☁️";
    if (hour.cloudCover > 30) return "⛅";

    return weatherIcons[code] || "🌤️";
  };

  if (loading) return <div className="text-center py-20 text-xl">Loading hourly forecast...</div>;
  if (error) return <div className="text-red-600 text-center py-20 text-xl">{error}</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="relative bg-gradient-to-br from-blue-600 to-blue-800 text-white rounded-3xl shadow-2xl p-10 mb-10 text-center overflow-hidden">
        {/* Prev Arrow */}
        <Link
          to={`/dashboard/${tenant}/weather/day/${prevDate}`}
          className="absolute left-6 top-1/2 -translate-y-1/2 z-10 bg-white/30 hover:bg-white/50 backdrop-blur-sm rounded-full p-5 transition-all hover:scale-110 shadow-2xl"
        >
          <svg className="w-14 h-14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="5">
            <path d="M15 18L9 12L15 6" />
          </svg>
        </Link>

        {/* Next Arrow */}
        <Link
          to={`/dashboard/${tenant}/weather/day/${nextDate}`}
          className="absolute right-6 top-1/2 -translate-y-1/2 z-10 bg-white/30 hover:bg-white/50 backdrop-blur-sm rounded-full p-5 transition-all hover:scale-110 shadow-2xl"
        >
          <svg className="w-14 h-14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="5">
            <path d="M9 18L15 12L9 6" />
          </svg>
        </Link>

        <h1 className="text-5xl font-bold mb-3 uppercase