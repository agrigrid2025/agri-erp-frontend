import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';

export default function LocationList() {
  const { tenant } = useParams();
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`https://${tenant}.agrigrid.net/inventory3/api/locations/`, { credentials: 'include' })
      .then(r => r.json())
      .then(data => {
        setLocations(data.locations || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [tenant]);

  const handleDelete = async (id, code) => {
    if (!confirm(`Delete location "${code}"?`)) return;
    await fetch(`https://${tenant}.agrigrid.net/inventory3/api/location/delete/${id}/`, {
      method: 'POST',
      credentials: 'include',
    });
    setLocations(locations.filter(l => l.id !== id));
  };

  if (loading) return <div className="text-center py-20 text-2xl">Loading locations...</div>;

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="bg-white rounded-2xl shadow-xl p-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Locations</h1>
          <Link to={`/dashboard/${tenant}/inventory/locations/add`} className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg">
            + Add Location
          </Link>
        </div>

        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Warehouse</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Code</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {locations.length === 0 ? (
              <tr>
                <td colSpan="5" className="px-6 py-12 text-center text-gray-500 text-lg">
                  No locations defined yet
                </td>
              </tr>
            ) : (
              locations.map(loc => (
                <tr key={loc.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-medium">{loc.warehouse__name}</td>
                  <td className="px-6 py-4 text-sm">{loc.code}</td>
                  <td className="px-6 py-4 text-sm">{loc.name || '—'}</td>
                  <td className="px-6 py-4 text-sm">
                    {loc.is_active ? (
                      <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Active
                      </span>
                    ) : (
                      <span className="px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        Inactive
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm space-x-4">
                    <Link to={`/dashboard/${tenant}/inventory/locations/edit/${loc.id}`} className="text-blue-600 hover:underline">
                      Edit
                    </Link>
                    <button onClick={() => handleDelete(loc.id, loc.code)} className="text-red-600 hover:underline">
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}