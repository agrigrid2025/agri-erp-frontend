import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { MapContainer, TileLayer, FeatureGroup } from 'react-leaflet';
import { EditControl } from 'react-leaflet-draw';
import 'leaflet/dist/leaflet.css';
import 'leaflet-draw/dist/leaflet.draw.css';
import L from 'leaflet';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

export default function DefineBlocks() {
  const { tenant } = useParams();
  const [mapData, setMapData] = useState({ blocks: [], center: { lat: -16.992, lon: 145.423 } });
  const [drawnGeoJSON, setDrawnGeoJSON] = useState(null);
  const [blockName, setBlockName] = useState('');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetch(`https://${tenant}.agrigrid.net/agrimap/api/map/data/`, { credentials: 'include' })
      .then(r => r.json())
      .then(data => setMapData(data));
  }, [tenant]);

  const handleCreated = (e) => {
    const layer = e.layer;
    setDrawnGeoJSON(layer.toGeoJSON().geometry);
    setMessage('Polygon drawn — enter name and save');
  };

  const handleSave = async () => {
    if (!blockName.trim()) {
      setMessage('Please enter a block name');
      return;
    }
    if (!drawnGeoJSON) {
      setMessage('Please draw a polygon first');
      return;
    }

    setSaving(true);
    try {
      const res = await fetch(`https://${tenant}.agrigrid.net/agrimap/api/map/save-block/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: blockName.trim(),
          geojson: drawnGeoJSON,
        }),
        credentials: 'include',
      });
      const data = await res.json();
      if (data.success) {
        setMessage('Block saved successfully!');
        setBlockName('');
        setDrawnGeoJSON(null);
        // Refresh map data
        window.location.reload();
      } else {
        setMessage(data.error || 'Failed to save block');
      }
    } catch (err) {
      setMessage('Network error — try again');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Define Farm Blocks</h1>
        <Link to={`/dashboard/${tenant}/map/blocks`} className="text-blue-600 hover:underline text-lg">
          ← Back to Map View
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-6" style={{ height: '600px' }}>
        <MapContainer center={[mapData.center.lat, mapData.center.lon]} zoom={16} style={{ height: '100%' }}>
          <TileLayer url="https://{s}.google.com/vt/lyrs=s,h&x={x}&y={y}&z={z}" subdomains={['mt0','mt1','mt2','mt3']} />
          <FeatureGroup>
            <EditControl
              position="topleft"
              onCreated={handleCreated}
              draw={{
                rectangle: false,
                circle: false,
                circlemarker: false,
                marker: false,
                polyline: false,
                polygon: {
                  shapeOptions: {
                    color: '#3388ff',
                    weight: 4,
                  },
                  allowIntersection: false,
                  showArea: true,
                },
              }}
              edit={{
                remove: false,
              }}
            />
          </FeatureGroup>

          {/* Existing blocks */}
          {mapData.blocks.map(block => block.geojson && (
            <Polygon
              key={block.id}
              positions={block.geojson.coordinates[0].map(coord => [coord[1], coord[0]])}
              pathOptions={{ color: block.cropColour || '#3388ff', weight: 3, fillOpacity: 0.5 }}
            />
          ))}
        </MapContainer>
      </div>

      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex gap-4 items-end">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Block Name
            </label>
            <input
              type="text"
              value={blockName}
              onChange={(e) => setBlockName(e.target.value)}
              placeholder="e.g. Block 10"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
          <button
            onClick={handleSave}
            disabled={saving}
            className="bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white font-bold px-8 py-3 rounded-lg transition"
          >
            {saving ? 'Saving...' : 'Save Block'}
          </button>
        </div>

        {message && (
          <p className={`mt-6 text-center text-lg font-medium ${message.includes('success') || message.includes('drawn') ? 'text-green-600' : 'text-red-600'}`}>
            {message}
          </p>
        )}
      </div>
    </div>
  );
}