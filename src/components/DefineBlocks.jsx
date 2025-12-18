import { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { MapContainer, TileLayer, Polygon } from 'react-leaflet';
import '@geoman-io/leaflet-geoman-free/dist/leaflet-geoman.css';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

export default function DefineBlocks() {
  const { tenant } = useParams();
  const mapRef = useRef();
  const [mapData, setMapData] = useState({ blocks: [], center: { lat: -16.992, lon: 145.423 } });
  const [blockName, setBlockName] = useState('');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetch(`https://${tenant}.agrigrid.net/agrimap/api/map/data/`, { credentials: 'include' })
      .then(r => r.json())
      .then(data => setMapData(data));
  }, [tenant]);

  useEffect(() => {
    if (!mapRef.current) return;

    const map = mapRef.current;

    map.pm.addControls({
      position: 'topleft',
      drawMarker: false,
      drawPolyline: false,
      drawRectangle: false,
      drawCircle: false,
      drawCircleMarker: false,
      drawPolygon: true,
      editPolygon: true,
      deleteLayer: true,
      cutPolygon: false,
    });

    map.pm.setLang('en');

    map.on('pm:create', (e) => {
      const layer = e.layer;
      const geojson = layer.toGeoJSON().geometry;
      // Store for save
      map.currentDrawnLayer = layer;
      map.currentGeoJSON = geojson;
      setMessage('Polygon drawn — enter name and save');
    });

    return () => {
      map.pm.removeControls();
    };
  }, [mapRef.current]);

  const handleSave = async () => {
    if (!blockName.trim()) {
      setMessage('Please enter a block name');
      return;
    }
    if (!mapRef.current?.currentGeoJSON) {
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
          geojson: mapRef.current.currentGeoJSON,
        }),
        credentials: 'include',
      });
      const data = await res.json();
      if (data.success) {
        setMessage('Block saved successfully!');
        setBlockName('');
        mapRef.current.currentGeoJSON = null;
        mapRef.current.currentDrawnLayer = null;
        window.location.reload();
      } else {
        setMessage(data.error || 'Save failed');
      }
    } catch (err) {
      setMessage('Network error');
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
        <MapContainer
          whenCreated={(map) => (mapRef.current = map)}
          center={[mapData.center.lat, mapData.center.lon]}
          zoom={16}
          style={{ height: '100%' }}
        >
          <TileLayer url="https://{s}.google.com/vt/lyrs=s,h&x={x}&y={y}&z={z}" subdomains={['mt0','mt1','mt2','mt3']} />
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
            <label className="block text-sm font-medium text-gray-700 mb-2">Block Name</label>
            <input
              type="text"
              value={blockName}
              onChange={(e) => setBlockName(e.target.value)}
              placeholder="e.g. Block 10"
              className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500"
            />
          </div>
          <button
            onClick={handleSave}
            disabled={saving}
            className="bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white font-bold px-8 py-3 rounded-lg"
          >
            {saving ? 'Saving...' : 'Save Block'}
          </button>
        </div>

        {message && (
          <p className={`mt-6 text-center text-lg font-medium ${message.includes('success') ? 'text-green-600' : 'text-red-600'}`}>
            {message}
          </p>
        )}
      </div>
    </div>
  );
}