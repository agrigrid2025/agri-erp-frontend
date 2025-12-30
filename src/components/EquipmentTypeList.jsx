import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';

export default function EquipmentTypeList() {
  const { tenant } = useParams();
  const [types, setTypes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`https://${tenant}.agrigrid.net/equipment/api/equipment-types/`, { credentials: 'include' })
      .then(r => r.json())
      .then(data => {
        setTypes(data.types || []);
        setLoading(false);
      });
  }, [tenant]);

  if (loading) return <div className="text-center py-20">Loading equipment types...</div>;

  return (
    <div className="max-w-5xl mx-auto p-6">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Equipment Types</h1>
        <Link to={`/dashboard/${tenant}/equipment/types/add`} className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg">
          + Add Type
        </Link>
      </div>

      <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
        <table className="min-w-full">
          <thead className="bg-gray-800 text-white">
            <tr>
              <th className="px-6 py-4 text-left">Name</th>
              <th className="px-6 py-4 text-left">Description</th>
              <th className="px-6 py-4 text-center">Status</th>
              <th className="px-6 py-4 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {types.length === 0 ? (
              <tr>
                <td colSpan="4" className="text-center py-12 text-gray-500">
                  No equipment types defined
                </td>
              </tr>
            ) : (
              types.map(type => (
                <tr key={type.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium">{type.name}</td>
                  <td className="px-6 py-4 text-gray-600">{type.description || '—'}</td>
                  <td className="px-6 py-4 text-center">
                    {type.is_active ? (
                      <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Active
                      </span>
                    ) : (
                      <span className="px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        Inactive
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <Link to={`/dashboard/${tenant}/equipment/types/edit/${type.id}`} className="text-blue-600 hover:underline">
                      Edit
                    </Link>
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