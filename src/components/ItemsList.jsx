import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';

export default function ItemsList() {
  const { tenant } = useParams();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetch(`https://${tenant}.agrigrid.net/inventory3/api/items/`, { credentials: 'include' })
      .then(r => r.json())
      .then(data => {
        setItems(data.items || []);
        setLoading(false);
      });
  }, [tenant]);

  const filtered = items.filter(item =>
    item.sku.toLowerCase().includes(search.toLowerCase()) ||
    item.name.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <div className="text-center py-20">Loading items...</div>;

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="bg-white rounded-xl shadow-lg p-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Items</h1>
          <Link to={`/dashboard/${tenant}/inventory/items/new`} className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg">
            + Add Item
          </Link>
        </div>

        <input
          type="text"
          placeholder="Search items..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full max-w-md px-4 py-3 border rounded-lg mb-6"
        />

        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">SKU</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Stock</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">On Order</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Reorder</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filtered.map(item => (
              <tr key={item.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 text-sm font-medium">{item.sku}</td>
                <td className="px-6 py-4 text-sm">{item.name}</td>
                <td className="px-6 py-4 text-sm">{item.category || '—'}</td>
                <td className="px-6 py-4 text-sm">{item.currentStock.toFixed(2)}</td>
                <td className="px-6 py-4 text-sm">{item.onOrder.toFixed(2)}</td>
                <td className="px-6 py-4 text-sm">{item.reorderLevel.toFixed(2)}</td>
                <td className="px-6 py-4 text-sm">
                  <Link to={`/dashboard/${tenant}/inventory/items/${item.id}`} className="text-blue-600 hover:underline">
                    View
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}