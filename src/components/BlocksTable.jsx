import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';

export default function BlocksTable() {
  const { tenant } = useParams();
  const [blocks, setBlocks] = useState([]);
  const [filteredBlocks, setFilteredBlocks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

  useEffect(() => {
    fetch(`https://${tenant}.agrigrid.net/agrimap/api/map/data/`, { credentials: 'include' })
      .then(r => r.json())
      .then(data => {
        const sorted = (data.blocks || []).sort((a, b) => a.name.localeCompare(b.name));
        setBlocks(sorted);
        setFilteredBlocks(sorted);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [tenant]);

  // Search filter
  useEffect(() => {
    const lowerSearch = searchTerm.toLowerCase();
    const filtered = blocks.filter(block =>
      block.name.toLowerCase().includes(lowerSearch) ||
      (block.crop && block.crop.toLowerCase().includes(lowerSearch)) ||
      block.areaHa.toString().includes(lowerSearch)
    );
    setFilteredBlocks(filtered);
  }, [searchTerm, blocks]);

  // Sorting
  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });

    const sorted = [...filteredBlocks].sort((a, b) => {
      if (key === 'areaHa') {
        return direction === 'asc' ? a.areaHa - b.areaHa : b.areaHa - a.areaHa;
      }
      const aVal = (a[key] || '').toString().toLowerCase();
      const bVal = (b[key] || '').toString().toLowerCase();
      return direction === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
    });
    setFilteredBlocks(sorted);
  };

  const getSortIcon = (key) => {
    if (sortConfig.key !== key) return '↕️';
    return sortConfig.direction === 'asc' ? '↑' : '↓';
  };

  if (loading) return <p className="text-center py-20 text-xl">Loading blocks...</p>;

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="bg-white rounded-xl shadow-lg p-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-8">
          <h2 className="text-3xl font-bold text-gray-800">Farm Blocks</h2>
          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
            {/* Search Box */}
            <input
              type="text"
              placeholder="Search blocks..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 w-full sm:w-64"
            />
            <Link
              to={`/dashboard/${tenant}/map/blocks`}
              className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-8 rounded-lg text-center transition"
            >
              View on Map
            </Link>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th
                  className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('name')}
                >
                  Block Name {getSortIcon('name')}
                </th>
                <th
                  className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('crop')}
                >
                  Crop {getSortIcon('crop')}
                </th>
                <th
                  className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('areaHa')}
                >
                  Area (ha) {getSortIcon('areaHa')}
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredBlocks.length === 0 ? (
                <tr>
                  <td colSpan="4" className="px-6 py-12 text-center text-gray-500 text-lg">
                    {searchTerm ? 'No blocks match your search' : 'No blocks defined yet'}
                  </td>
                </tr>
              ) : (
                filteredBlocks.map(block => (
                  <tr key={block.id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      {block.name}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      {block.crop ? (
                        <span className="inline-flex px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                          {block.crop}
                        </span>
                      ) : (
                        <span className="text-gray-400 italic">No crop assigned</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      {block.areaHa.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <Link
                        to={`/dashboard/${tenant}/map/assign-crop/${block.id}`}
                        className="text-emerald-600 hover:text-emerald-900 font-medium"
                      >
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