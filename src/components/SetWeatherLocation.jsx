import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix Leaflet default icon issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

function DraggableMarker({ position, setPosition }) {
  useMapEvents({
    click(e) {
      setPosition(e.latlng);
    },
  });

  return position === null ? null : (
    <Marker
      position={position}
      draggable={true}
      eventHandlers={{
        dragend: (e) => setPosition(e.target.getLatLng()),
      }}
    />
  );
}

export default function SetWeatherLocation() {
  const { tenant } = useParams();
  const [position, setPosition] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load current pinned location
    fetch(`https://${tenant}.agrigrid.net/api/weather/forecast/`, { credentials: 'include' })
      .then(r => r.json())
      .then(data => {
        const lat = data.location.lat;
        const lon = data.location.lon;
        setPosition({ lat, lng: lon });
        setLoading(false);
      });
  }, [tenant]);

  const handleSave = () => {
    fetch(`https://${tenant}.agrigrid.net/weather/set-location/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        lat: position.lat,
        lon: position.lng,
      }),
      credentials: 'include',
    }).then(() => {
      window.location.href = `/dashboard/${tenant}/weather`;
    });
  };

  if (loading) return <p className="text-center py-20">Loading map...</p>;

  return (
    <div className="max-w-7xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Set Weather Location</h1>
      <p className="text-gray-600 mb-6">
        Drag the marker to your farm's main location (e.g., homestead or weather station).
      </p>

      <div className="bg-white rounded-xl shadow-lg overflow-hidden" style={{ height: '600px' }}>
        <MapContainer center={position || [-16.992, 145.423]} zoom={15} style={{ height: '100%' }}>
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          <DraggableMarker position={position} setPosition={setPosition} />
        </MapContainer>
      </div>

      <div className="mt-8 text-center">
        <p className="text-lg font-medium mb-4">
          Current position: {position ? `${position.lat.toFixed(6)}, ${position.lng.toFixed(6)}` : 'Not set'}
        </p>
        <button
          onClick={handleSave}
          className="bg-green-600 hover:bg-green-700 text-white px-8 py-4 rounded-lg text-xl font-medium transition"
        >
          Save Location & Return
        </button>
        {' '}
        <Link to={`/dashboard/${tenant}/weather`} className="text-blue-600 hover:underline text-lg">
          Cancel
        </Link>
      </div>
    </div>
  );
}