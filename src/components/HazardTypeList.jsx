import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';

export default function HazardTypeList() {
  const { tenant } = useParams();
  const [types, setTypes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`https://${tenant}.agrigrid.net/agrisafe/api/hazard-types/`, { credentials: 'include' })
      .then(r => r.json())
      .then(data => {
        setTypes(data.types || []);
        setLoading(false);
      });
  }, [tenant]);

  const handleDelete = async (id, name) => {
    if (!confirm(`Delete hazard type "${name}"?`)) return;
    await fetch(`https://${tenant}.agrigrid.net/agrisafe/api/hazard-type/delete/${id}/`, {
      method: 'POST',
      credentials: 'include',
    });
    setTypes(types.filter(t => t.id !== id));
  };

  if (loading) return <div className="text-center py-20">Loading hazard types...</div>;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-2xl shadow-xl p-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Hazard Types</h1>
          <Link to={`/dashboard/${tenant}/safety/hazard-types/add`} className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg">
            + Add Hazard Type
          </Link>
        </div>

        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {types.length === 0 ? (
              <tr>
                <td colSpan="2" className="px-6 py-12 text-center text-gray-500">
                  No hazard types defined yet
                </td>
              </tr>
            ) : (
              types.map(type => (
                <tr key={type.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-medium">{type.name}</td>
                  <td className="px-6 py-4 text-sm space-x-4">
                    <Link to={`/dashboard/${tenant}/safety/hazard-types/edit/${type.id}`} className="text-blue-600 hover:underline">
                      Edit
                    </Link>
                    <button onClick={() => handleDelete(type.id, type.name)} className="text-red-600 hover:underline">
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