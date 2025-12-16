import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';

export default function CropTypeList() {
  const { tenant } = useParams();
  const [crops, setCrops] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`https://${tenant}.agrigrid.net/agrimap/api/crop-types/`, { credentials: 'include' })
      .then(r => r.json())
      .then(data => {
        setCrops(data.crops || []);
        setLoading(false);
      });
  }, [tenant]);

  const handleDelete = async (id, name) => {
    if (!confirm(`Delete crop type "${name}"?`)) return;
    await fetch(`https://${tenant}.agrigrid.net/agrimap/api/crop-type/delete/${id}/`, {
      method: 'POST',
      credentials: 'include',
    });
    setCrops(crops.filter(c => c.id !== id));
  };

  if (loading) return <p className="text-center py-20">Loading crop types...</p>;

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Crop Types</h1>
        <Link to={`/dashboard/${tenant}/crop-types/add`} className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg">
          + Add Crop Type
        </Link>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {crops.map(crop => (
          <div key={crop.id} className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-xl font-bold">{crop.name}</h3>
              <div className="w-10 h-10 rounded-lg border-2" style={{ backgroundColor: crop.colour }}></div>
            </div>
            {crop.code && <p className="text-sm text-gray-600 mb-2">Code: <strong>{crop.code}</strong></p>}
            <div className="text-xs text-gray-500 space-y-1 mb-4">
              <div>Row spacing: {crop.default_row_spacing_m || '—'} m</div>
              <div>Plant spacing: {crop.default_plant_spacing_m || '—'} m</div>
              <div>Typical yield: {crop.typical_yield_t_ha || '—'} t/ha</div>
            </div>
            <div className="flex gap-4">
              <Link to={`/dashboard/${tenant}/crop-types/edit/${crop.id}`} className="text-blue-600 hover:underline">
                Edit
              </Link>
              <button onClick={() => handleDelete(crop.id, crop.name)} className="text-red-600 hover:underline">
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}