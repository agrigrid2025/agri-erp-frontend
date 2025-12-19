import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';

export default function WarehouseList() {
  const { tenant } = useParams();
  const [warehouses, setWarehouses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`https://${tenant}.agrigrid.net/inventory3/api/warehouses/`, { credentials: 'include' })
      .then(r => r.json())
      .then(data => {
        setWarehouses(data.warehouses || []);
        setLoading(false);
      });
  }, [tenant]);

  const handleDelete = async (id, name) => {
    if (!confirm(`Delete warehouse "${name}"?`)) return;
    await fetch(`https://${tenant}.agrigrid.net/inventory3/api/warehouse/delete/${id}/`, {
      method: 'POST',
      credentials: 'include',
    });
    setWarehouses(warehouses.filter(w => w.id !== id));
  };

  if (loading) return <div className="text-center py-20">Loading warehouses...</div>;

  return (
    <div className="max-w-5xl mx-auto p-6">
      <div className="bg-white rounded-2xl shadow-xl p-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Warehouses</h1>
          <Link to={`/dashboard/${tenant}/inventory/warehouses/add`} className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg">
            + Add Warehouse
          </Link>
        </div>

        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Code</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {warehouses.length === 0 ? (
              <tr>
                <td colSpan="4" className="px-6 py-12 text-center text-gray-500">
                  No warehouses defined yet
                </td>
              </tr>
            ) : (
              warehouses.map(wh => (
                <tr key={wh.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-medium">{wh.name}</td>
                  <td className="px-6 py-4 text-sm">{wh.code}</td>
                  <td className="px-6 py-4 text-sm">
                    {wh.is_active ? 'Active' : 'Inactive'}
                  </td>
                  <td className="px-6 py-4 text-sm space-x-4">
                    <Link to={`/dashboard/${tenant}/inventory/warehouses/edit/${wh.id}`} className="text-blue-600 hover:underline">
                      Edit
                    </Link>
                    <button onClick={() => handleDelete(wh.id, wh.name)} className="text-red-600 hover:underline">
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