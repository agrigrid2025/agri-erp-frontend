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
  const [mapData, setMapData] = useState({ blocks: [], center: { lat: -16.992, lon: 145.423 } });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`https://${tenant}.agrigrid.net/api/map/data/`, { credentials: 'include' })
      .then(r => r.json())
      .then(data => {
        setMapData(data);
        setLoading(false);
      });
  }, [tenant]);

  if (loading) return <div className="text-center py-32 text-2xl">Loading map...</div>;

  return (
    <div className="h-screen flex flex-col">
      <div className="bg-white shadow p-6 flex justify-between items-center">
        <h1 className="text-3xl font-bold">My Blocks</h1>
        <Link to={`/dashboard/${tenant}/map/define-blocks`} className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg">
          Add/Edit Blocks
        </Link>
      </div>

      <div className="flex-1">
        <MapContainer center={[mapData.center.lat, mapData.center.lon]} zoom={16} style={{ height: '100%' }}>
          <TileLayer url="https://{s}.google.com/vt/lyrs=s,h&x={x}&y={y}&z={z}" subdomains={['mt0','mt1','mt2','mt3']} />
          {mapData.blocks.map(block => block.geojson && (
            <Polygon
              key={block.id}
              positions={block.geojson.coordinates[0].map(coord => [coord[1], coord[0]])}
              pathOptions={{ color: block.cropColour, weight: 3, fillOpacity: 0.6 }}
            >
              <Popup>
                <div className="text-center p-4">
                  <h3 className="font-bold text-2xl mb-2">{block.name}</h3>
                  <p className="text-lg mb-4">Area: <strong>{block.areaHa.toFixed(2)} ha</strong></p>

                  <div className="grid grid-cols-5 gap-4">
                    <button className="bg-emerald-100 hover:bg-emerald-200 text-emerald-700 p-4 rounded-xl shadow" title="Assign Crop">
                      🌱
                    </button>
                    <button className="bg-blue-100 hover:bg-blue-200 text-blue-700 p-4 rounded-xl shadow" title="Edit Block">
                      ✏️
                    </button>
                    <button className="bg-purple-100 hover:bg-purple-200 text-purple-700 p-4 rounded-xl shadow" title="Add Crop Record">
                      📋
                    </button>
                    <button className="bg-amber-100 hover:bg-amber-200 text-amber-700 p-4 rounded-xl shadow" title="Add Fertilizer">
                      🧴
                    </button>
                    <button className="bg-pink-100 hover:bg-pink-200 text-pink-700 p-4 rounded-xl shadow" title="Add Spray">
                      🌫️
                    </button>
                    <button className="bg-orange-100 hover:bg-orange-200 text-orange-700 p-4 rounded-xl shadow" title="Harvest">
                      🚜
                    </button>
                    <button className="bg-indigo-100 hover:bg-indigo-200 text-indigo-700 p-4 rounded-xl shadow" title="Planning">
                      📅
                    </button>
                    <button className="bg-red-100 hover:bg-red-200 text-red-700 p-4 rounded-xl shadow" title="Safety">
                      🛡️
                    </button>
                    <button className="bg-yellow-100 hover:bg-yellow-200 text-yellow-700 p-4 rounded-xl shadow" title="Notes">
                      📝
                    </button>
                    <button className="bg-cyan-100 hover:bg-cyan-200 text-cyan-700 p-4 rounded-xl shadow" title="Irrigate">
                      💧
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