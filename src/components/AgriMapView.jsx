import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { MapContainer, TileLayer, Polygon, Popup, Tooltip } from 'react-leaflet';
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
  const [mapData, setMapData] = useState({ blocks: [], center: { lat: -16.992, lon: 145.423 } });
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
      <div className="bg-white shadow p-6 flex justify-between items-center">
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

      <div className="flex-1">
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
              {/* Permanent centered label */}
              <Tooltip permanent direction="center" opacity={1} className="bg-white/90 backdrop-blur border-0 rounded-xl shadow-lg px-4 py-2">
                <span className="font-bold text-gray-800 text-base">{block.name}</span>
              </Tooltip>

              {/* Click popup with actions */}
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

                  {/* Action buttons — centered icons */}
                  <div className="grid grid-cols-5 gap-3">
                    <Link
                      to={`/dashboard/${tenant}/map/assign-crop/${block.id}`}
                      className="bg-emerald-100 hover:bg-emerald-200 text-emerald-700 p-4 rounded-xl shadow hover:shadow-lg transition transform hover:scale-110 flex items-center justify-center"
                      title="Assign Crop"
                    >
                      <span className="text-3xl">🌱</span>
                    </Link>

                    <button className="bg-blue-100 hover:bg-blue-200 text-blue-700 p-4 rounded-xl shadow hover:shadow-lg transition transform hover:scale-110 flex items-center justify-center" title="Edit Block">
                      <span className="text-3xl">✏️</span>
                    </button>

                    <button className="bg-purple-100 hover:bg-purple-200 text-purple-700 p-4 rounded-xl shadow hover:shadow-lg transition transform hover:scale-110 flex items-center justify-center" title="Crop Record">
                      <span className="text-3xl">📋</span>
                    </button>

                    <button className="bg-amber-100 hover:bg-amber-200 text-amber-700 p-4 rounded-xl shadow hover:shadow-lg transition transform hover:scale-110 flex items-center justify-center" title="Fertilizer">
                      <span className="text-3xl">🧴</span>
                    </button>

                    <button className="bg-pink-100 hover:bg-pink-200 text-pink-700 p-4 rounded-xl shadow hover:shadow-lg transition transform hover:scale-110 flex items-center justify-center" title="Spray">
                      <span className="text-3xl">🌫️</span>
                    </button>

                    <button className="bg-orange-100 hover:bg-orange-200 text-orange-700 p-4 rounded-xl shadow hover:shadow-lg transition transform hover:scale-110 flex items-center justify-center" title="Harvest">
                      <span className="text-3xl">🚜</span>
                    </button>

                    <button className="bg-indigo-100 hover:bg-indigo-200 text-indigo-700 p-4 rounded-xl shadow hover:shadow-lg transition transform hover:scale-110 flex items-center justify-center" title="Planning">
                      <span className="text-3xl">📅</span>
                    </button>

                    <button className="bg-red-100 hover:bg-red-200 text-red-700 p-4 rounded-xl shadow hover:shadow-lg transition transform hover:scale-110 flex items-center justify-center" title="Safety">
                      <span className="text-3xl">🛡️</span>
                    </button>

                    <button className="bg-yellow-100 hover:bg-yellow-200 text-yellow-700 p-4 rounded-xl shadow hover:shadow-lg transition transform hover:scale-110 flex items-center justify-center" title="Notes">
                      <span className="text-3xl">📝</span>
                    </button>

                    <button className="bg-cyan-100 hover:bg-cyan-200 text-cyan-700 p-4 rounded-xl shadow hover:shadow-lg transition transform hover:scale-110 flex items-center justify-center" title="Irrigation">
                      <span className="text-3xl">💧</span>
                    </button>
                  </div>
                </div>
              </Popup>
            </Polygon>
          ))}
        </MapContainer>
      </div>
    </div>
  );
}