import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';

export default function EquipmentList() {
  const { tenant } = useParams();
  const [equipment, setEquipment] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`https://${tenant}.agrigrid.net/equipment/api/equipment/`, { credentials: 'include' })
      .then(r => r.json())
      .then(data => {
        setEquipment(data.equipment || []);
        setLoading(false);
      });
  }, [tenant]);

  if (loading) return <div className="text-center py-20">Loading equipment...</div>;

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Equipment</h1>
        <Link to={`/dashboard/${tenant}/equipment/add`} className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg">
          + Add Equipment
        </Link>
      </div>

      <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
        <table className="min-w-full">
          <thead className="bg-gray-800 text-white">
            <tr>
              <th className="px-6 py-4 text-left">Name</th>
              <th className="px-6 py-4 text-left">Fleet #</th>
              <th className="px-6 py-4 text-left">Type</th>
              <th className="px-6 py-4 text-left">Make / Model</th>
              <th className="px-6 py-4 text-left">Registration</th>
              <th className="px-6 py-4 text-left">Serial</th>
              <th className="px-6 py-4 text-center">Status</th>
              <th className="px-6 py-4 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {equipment.length === 0 ? (
              <tr>
                <td colSpan="8" className="text-center py-12 text-gray-500">
                  No equipment registered
                </td>
              </tr>
            ) : (
              equipment.map(eq => (
                <tr key={eq.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium">{eq.name}</td>
                  <td className="px-6 py-4">{eq.fleet_number || '—'}</td>
                  <td className="px-6 py-4">{eq.type || '—'}</td>
                  <td className="px-6 py-4">{eq.make} {eq.model}</td>
                  <td className="px-6 py-4">{eq.registration_number || '—'}</td>
                  <td className="px-6 py-4">{eq.serial_number || '—'}</td>
                  <td className="px-6 py-4 text-center">
                    {eq.is_active ? (
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
                    <Link to={`/dashboard/${tenant}/equipment/edit/${eq.id}`} className="text-blue-600 hover:underline">
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