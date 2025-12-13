import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix Leaflet icon issue in React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

function LocationMarker() {
  const [position, setPosition] = useState(null);
  const map = useMapEvents({
    click(e) {
      setPosition(e.latlng);
    },
  });

  return position === null ? null : (
    <Marker position={position} draggable={true} eventHandlers={{
      dragend: (e) => setPosition(e.target.getLatLng()),
    }} />
  );
}

export default function SetWeatherLocation() {
  const { tenant } = useParams();
  const [lat, setLat] = useState(-16.992);
  const [lon, setLon] = useState(145.423);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load current location
    fetch(`https://${tenant}.agrigrid.net/api/weather/forecast/`, { credentials: 'include' })
      .then(r => r.json())
      .then(data => {
        if (data.location.hasPin) {
          setLat(data.location.lat);
          setLon(data.location.lon);
        }
        setLoading(false);
      });
  }, [tenant]);

  const handleSave = () => {
    fetch(`https://${tenant}.agrigrid.net/weather/set-location/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ lat, lon }),
      credentials: 'include',
    }).then(() => {
      window.location.href = `/dashboard/${tenant}/weather`;
    });
  };

  if (loading) return <p>Loading map...</p>;

  return (
    <div className="max-w-7xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Set Weather Location</h1>
      <div className="bg-white rounded-xl shadow-lg overflow-hidden" style={{ height: '600px' }}>
        <MapContainer center={[lat, lon]} zoom={16} style={{ height: '100%' }}>
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          <LocationMarker />
        </MapContainer>
      </div>
      <div className="mt-6 text-center">
        <p className="text-lg mb-4">Current: {lat.toFixed(6)}, {lon.toFixed(6)}</p>
        <button onClick={handleSave} className="bg-green-600 hover:bg-green-700 text-white px-8 py-4 rounded-lg text-lg font-medium">
          Save Location & Return
        </button>
      </div>
    </div>
  );
}