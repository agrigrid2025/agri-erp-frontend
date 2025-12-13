import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';

export default function BlocksTable() {
  const { tenant } = useParams();
  const [blocks, setBlocks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`https://${tenant}.agrigrid.net/agrimap/api/map/data/`, { credentials: 'include' })
      .then(r => r.json())
      .then(data => {
        setBlocks(data.blocks || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [tenant]);

  if (loading) return <p className="text-center py-20 text-xl">Loading blocks...</p>;

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="bg-white rounded-xl shadow-lg p-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold text-gray-800">Farm Blocks (Table)</h2>
          <Link to={`/dashboard/${tenant}/map/blocks`} className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg transition">
            View on Map
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Block Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Crop</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Area (ha)</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {blocks.length === 0 ? (
                <tr>
                  <td colSpan="4" className="px-6 py-8 text-center text-gray-500">
                    No blocks defined yet
                  </td>
                </tr>
              ) : (
                blocks.map(block => (
                  <tr key={block.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {block.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {block.crop || <span className="text-gray-400">No crop assigned</span>}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {block.areaHa.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <Link to={`/dashboard/${tenant}/map/assign-crop/${block.id}`} className="text-emerald-600 hover:text-emerald-900">
                        Assign Crop
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}