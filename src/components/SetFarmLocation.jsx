import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

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

export default function SetFarmLocation() {
  const { tenant } = useParams();
  const [position, setPosition] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetch(`https://${tenant}.agrigrid.net/agrimap/api/map/data/`, { credentials: 'include' })
      .then(r => r.json())
      .then(data => {
        const lat = data.center.lat;
        const lon = data.center.lon;
        setPosition({ lat, lng: lon });
        setLoading(false);
      });
  }, [tenant]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch(`https://${tenant}.agrigrid.net/api/map/set-location/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lat: position.lat, lon: position.lng }),
        credentials: 'include',
      });
      const data = await res.json();
      if (data.success) {
        setMessage('Location saved!');
      } else {
        setMessage(data.error || 'Save failed');
      }
    } catch (err) {
      setMessage('Save failed');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p className="text-center py-20">Loading map...</p>;

  return (
    <div className="max-w-7xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Set Farm Location</h1>
      <p className="text-gray-600 mb-6">
        Drag the marker to your farm's main location (e.g., homestead or weather station).
      </p>

      <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-6" style={{ height: '600px' }}>
        <MapContainer center={position || [-16.992, 145.423]} zoom={15} style={{ height: '100%' }}>
          <TileLayer url="https://{s}.google.com/vt/lyrs=s,h&x={x}&y={y}&z={z}" subdomains={['mt0','mt1','mt2','mt3']} />
          <DraggableMarker position={position} setPosition={setPosition} />
        </MapContainer>
      </div>

      <div className="text-center">
        <p className="text-lg mb-4">
          Current: {position ? `${position.lat.toFixed(6)}, ${position.lng.toFixed(6)}` : 'Not set'}
        </p>
        <button
          onClick={handleSave}
          disabled={saving}
          className="bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white px-8 py-4 rounded-lg text-xl font-medium"
        >
          {saving ? 'Saving...' : 'Save Location'}
        </button>
        {' '}
        <Link to={`/dashboard/${tenant}/map/blocks`} className="text-blue-600 hover:underline text-lg">
          Cancel
        </Link>
        {message && <p className="mt-4 text-lg font-medium text-green-600">{message}</p>}
      </div>
    </div>
  );
}