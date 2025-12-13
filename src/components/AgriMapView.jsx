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
                <div className="bg-white rounded-2xl shadow-2xl p-6 min-w-[320px]">
                  <h3 className="text-2xl font-bold text-gray-800 mb-4 text-center">{block.name}</h3>

                  <div className="grid grid-cols-2 gap-4 mb-6 text-center">
                    <div>
                      <p className="text-sm text-gray-600">Crop</p>
                      <p className="font-bold text-lg">{block.crop || 'None'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Area</p>
                      <p className="font-bold text-lg text-green-600">{block.areaHa.toFixed(2)} ha</p>
                    </div>
                  </div>

                  {/* Action Button Grid */}
                  <div className="grid grid-cols-5 gap-3">
                    <Link
                      to={`/dashboard/${tenant}/map/assign-crop/${block.id}`}
                      className="bg-emerald-100 hover:bg-emerald-200 text-emerald-700 p-4 rounded-xl shadow hover:shadow-lg transition transform hover:scale-110"
                      title="Assign Crop"
                    >
                      <div className="text-2xl">🌱</div>
                    </Link>

                    <button
                      className="bg-blue-100 hover:bg-blue-200 text-blue-700 p-4 rounded-xl shadow hover:shadow-lg transition transform hover:scale-110"
                      title="Edit Block"
                      onClick={() => alert('Edit block coming soon')}
                    >
                      <div className="text-2xl">✏️</div>
                    </button>

                    <button
                      className="bg-purple-100 hover:bg-purple-200 text-purple-700 p-4 rounded-xl shadow hover:shadow-lg transition transform hover:scale-110"
                      title="Crop Record"
                      onClick={() => alert('Crop record coming soon')}
                    >
                      <div className="text-2xl">📋</div>
                    </button>

                    <button
                      className="bg-amber-100 hover:bg-amber-200 text-amber-700 p-4 rounded-xl shadow hover:shadow-lg transition transform hover:scale-110"
                      title="Fertilizer"
                      onClick={() => alert('Fertilizer coming soon')}
                    >
                      <div className="text-2xl">🧴</div>
                    </button>

                    <button
                      className="bg-pink-100 hover:bg-pink-200 text-pink-700 p-4 rounded-xl shadow hover:shadow-lg transition transform hover:scale-110"
                      title="Spray"
                      onClick={() => alert('Spray coming soon')}
                    >
                      <div className="text-2xl">🌫️</div>
                    </button>

                    <button
                      className="bg-orange-100 hover:bg-orange-200 text-orange-700 p-4 rounded-xl shadow hover:shadow-lg transition transform hover:scale-110"
                      title="Harvest"
                      onClick={() => alert('Harvest coming soon')}
                    >
                      <div className="text-2xl">🚜</div>
                    </button>

                    <button
                      className="bg-indigo-100 hover:bg-indigo-200 text-indigo-700 p-4 rounded-xl shadow hover:shadow-lg transition transform hover:scale-110"
                      title="Planning"
                      onClick={() => alert('Planning coming soon')}
                    >
                      <div className="text-2xl">📅</div>
                    </button>

                    <button
                      className="bg-red-100 hover:bg-red-200 text-red-700 p-4 rounded-xl shadow hover:shadow-lg transition transform hover:scale-110"
                      title="Safety"
                      onClick={() => alert('Safety coming soon')}
                    >
                      <div className="text-2xl">🛡️</div>
                    </button>

                    <button
                      className="bg-yellow-100 hover:bg-yellow-200 text-yellow-700 p-4 rounded-xl shadow hover:shadow-lg transition transform hover:scale-110"
                      title="Notes"
                      onClick={() => alert('Notes coming soon')}
                    >
                      <div className="text-2xl">📝</div>
                    </button>

                    <button
                      className="bg-cyan-100 hover:bg-cyan-200 text-cyan-700 p-4 rounded-xl shadow hover:shadow-lg transition transform hover:scale-110"
                      title="Irrigation"
                      onClick={() => alert('Irrigation coming soon')}
                    >
                      <div className="text-2xl">💧</div>
                    </button>
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