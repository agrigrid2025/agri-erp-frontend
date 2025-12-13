import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { MapContainer, TileLayer, Polygon, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

export default function AgriMapView() {
  const { tenant } = useParams();
  const [mapData, setMapData] = useState({ blocks: [], center: { lat: -16.992, lon: 145.423 }, hasPin: false });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`https://${tenant}.agrigrid.net/agrimap/api/map/data/`, { credentials: 'include' })
      .then(r => r.json())
      .then(data => {
        setMapData(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [tenant]);

  if (loading) return <div className="text-center py-32 text-2xl text-gray-600">Loading map...</div>;

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <div className="bg-white shadow-md p-6 flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-800">My Blocks</h1>
        <div className="flex gap-4">
          <Link to={`/dashboard/${tenant}/map/blocks-table`} className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-medium transition">
            View Table
          </Link>
          <Link to={`/dashboard/${tenant}/map/define-blocks`} className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium transition">
            Define Blocks
          </Link>
        </div>
      </div>

      {/* Map */}
      <div className="flex-1 relative">
        <MapContainer center={[mapData.center.lat, mapData.center.lon]} zoom={mapData.hasPin ? 16 : 12} style={{ height: '100%' }}>
          <TileLayer url="https://{s}.google.com/vt/lyrs=s,h&x={x}&y={y}&z={z}" subdomains={['mt0','mt1','mt2','mt3']} />
          {mapData.blocks.map(block => block.geojson && (
            <Polygon
              key={block.id}
              positions={block.geojson.coordinates[0].map(coord => [coord[1], coord[0]])}
              pathOptions={{
                color: block.cropColour || '#3388ff',
                weight: 4,
                opacity: 1,
                fillOpacity: 0.6,
              }}
            >
              <Popup>
                <div className="bg-white rounded-2xl shadow-2xl p-6 min-w-[280px]">
                  <h3 className="text-2xl font-bold text-gray-800 mb-3">{block.name}</h3>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">🌱</span>
                      <span className="text-lg font-medium">
                        Crop: {block.crop || <span className="text-gray-500">None assigned</span>}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">📏</span>
                      <span className="text-lg font-medium">
                        Area: <span className="text-green-600 font-bold">{block.areaHa.toFixed(2)} ha</span>
                      </span>
                    </div>
                  </div>

                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <Link
                      to={`/dashboard/${tenant}/map/assign-crop/${block.id}`}
                      className="block w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-lg text-center transition"
                    >
                      Assign / Change Crop
                    </Link>
                  </div>
                </div>
              </Popup>
            </Polygon>
          ))}
        </MapContainer>

        {/* Empty state overlay */}
        {mapData.blocks.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/20 pointer-events-none">
            <div className="bg-white rounded-2xl shadow-2xl p-10 text-center max-w-md">
              <p className="text-2xl font-bold text-gray-800 mb-4">No blocks defined yet</p>
              <p className="text-gray-600 mb-8">Draw your farm blocks to see them on the map</p>
              <Link
                to={`/dashboard/${tenant}/map/define-blocks`}
                className="bg-green-600 hover:bg-green-700 text-white px-8 py-4 rounded-lg text-lg font-medium"
              >
                Define Blocks Now
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}