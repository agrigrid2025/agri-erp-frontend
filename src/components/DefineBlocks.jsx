import { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { MapContainer, TileLayer, Polygon } from 'react-leaflet';
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
  const [drawingLayer, setDrawingLayer] = useState(null);
  const [isDrawing, setIsDrawing] = useState(false);

  useEffect(() => {
    fetch(`https://${tenant}.agrigrid.net/agrimap/api/map/data/`, { credentials: 'include' })
      .then(r => r.json())
      .then(data => setMapData(data));
  }, [tenant]);

  useEffect(() => {
    if (!mapRef.current) return;

    const map = mapRef.current;

    // Disable double-click zoom
    map.doubleClickZoom.disable();

    const startDrawing = () => {
      setIsDrawing(true);
      setMessage('Click on the map to add points. Click the first point or "Finish" to complete.');

      const layer = L.polygon([], {
        color: '#3388ff',
        weight: 4,
        fillOpacity: 0.5,
      }).addTo(map);

      setDrawingLayer(layer);

      map.on('click', addPoint);
    };

    const addPoint = (e) => {
      if (!isDrawing || !drawingLayer) return;

      const latlngs = drawingLayer.getLatLngs()[0] || [];
      latlngs.push(e.latlng);
      drawingLayer.setLatLngs([latlngs]);

      // If clicked near first point, auto-finish
      if (latlngs.length > 2) {
        const first = latlngs[0];
        const last = e.latlng;
        const dist = first.distanceTo(last);
        if (dist < 10) { // 10 meters tolerance
          finishDrawing();
        }
      }
    };

    const finishDrawing = () => {
      if (!isDrawing || !drawingLayer) return;

      const latlngs = drawingLayer.getLatLngs()[0];
      if (latlngs.length < 3) {
        setMessage('Need at least 3 points for a polygon');
        cancelDrawing();
        return;
      }

      setIsDrawing(false);
      map.off('click', addPoint);
      setMessage('Polygon complete — enter name and save');
    };

    const cancelDrawing = () => {
      if (drawingLayer) drawingLayer.remove();
      setDrawingLayer(null);
      setIsDrawing(false);
      map.off('click', addPoint);
      setMessage('');
    };

    const deleteLastPoint = () => {
      if (!drawingLayer || !isDrawing) return;
      const latlngs = drawingLayer.getLatLngs()[0];
      if (latlngs.length > 0) {
        latlngs.pop();
        drawingLayer.setLatLngs([latlngs]);
      }
    };

    // Expose functions to buttons
    window.defineBlocksActions = {
      startDrawing,
      finishDrawing,
      cancelDrawing,
      deleteLastPoint,
    };

    return () => {
      map.doubleClickZoom.enable();
      if (drawingLayer) drawingLayer.remove();
      map.off('click', addPoint);
    };
  }, [mapRef.current, isDrawing]);

  const handleSave = async () => {
    if (!blockName.trim()) {
      setMessage('Please enter a block name');
      return;
    }
    if (!drawingLayer) {
      setMessage('Please draw a polygon first');
      return;
    }

    setSaving(true);
    try {
      const geojson = drawingLayer.toGeoJSON().geometry;
      const res = await fetch(`https://${tenant}.agrigrid.net/agrimap/api/map/save-block/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: blockName.trim(), geojson }),
        credentials: 'include',
      });
      const data = await res.json();
      if (data.success) {
        setMessage('Block saved successfully!');
        setBlockName('');
        drawingLayer.remove();
        setDrawingLayer(null);
        setIsDrawing(false);
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

      <p className="text-gray-600 mb-6">
        Use the buttons below to draw blocks on the map.
      </p>

      {/* Custom Button Toolbar */}
      <div className="bg-white rounded-xl shadow-lg p-4 mb-6 flex flex-wrap gap-3 justify-center">
        <button
          onClick={() => window.defineBlocksActions.startDrawing()}
          className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium transition"
        >
          Start Drawing Polygon
        </button>
        <button
          onClick={() => window.defineBlocksActions.finishDrawing()}
          disabled={!isDrawing}
          className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-6 py-3 rounded-lg font-medium transition"
        >
          Finish Polygon
        </button>
        <button
          onClick={() => window.defineBlocksActions.deleteLastPoint()}
          disabled={!isDrawing}
          className="bg-yellow-600 hover:bg-yellow-700 disabled:opacity-50 text-white px-6 py-3 rounded-lg font-medium transition"
        >
          Delete Last Point
        </button>
        <button
          onClick={() => window.defineBlocksActions.cancelDrawing()}
          disabled={!isDrawing}
          className="bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white px-6 py-3 rounded-lg font-medium transition"
        >
          Cancel Drawing
        </button>
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
            disabled={saving || !drawingLayer}
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