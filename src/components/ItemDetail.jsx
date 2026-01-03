import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';

export default function ItemDetail() {
  const { tenant, itemId } = useParams();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`https://${tenant}.agrigrid.net/inventory3/api/items/`, { credentials: 'include' })
      .then(r => r.json())
      .then(data => {
        const foundItem = data.items.find(i => i.id === parseInt(itemId));
        setItem(foundItem);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [tenant, itemId]);

  if (loading) return <div className="text-center py-20 text-2xl">Loading item...</div>;
  if (!item) return <div className="text-center py-20 text-2xl text-red-600">Item not found</div>;

  return (
    <div className="max-w-5xl mx-auto p-6">
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-4xl font-bold text-gray-900">{item.name}</h1>
          <p className="text-xl text-gray-600 mt-2">{item.sku}</p>
        </div>
        <div className="flex gap-4">
          <Link
            to={`/dashboard/${tenant}/inventory/items/edit/${item.id}`}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg shadow transition"
          >
            Edit Item
          </Link>
          <Link
            to={`/dashboard/${tenant}/inventory/items/${item.id}/adjust`}
            className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg shadow transition"
          >
            Adjust Stock
          </Link>
          <Link
            to={`/dashboard/${tenant}/inventory/items/${item.id}/history`}
            className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg shadow transition"
          >
            Stock History
          </Link>
          <Link
            to={`/dashboard/${tenant}/inventory/items`}
            className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition"
          >
            ← Back to Items
          </Link>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid md:grid-cols-4 gap-6 mb-8">
        <div className="bg-gray-50 p-6 rounded-lg">
          <p className="text-sm text-gray-600">Current Stock</p>
          <p className="text-3xl font-bold mt-2">{item.currentStock.toFixed(2)} {item.uom}</p>
        </div>
        <div className="bg-gray-50 p-6 rounded-lg">
          <p className="text-sm text-gray-600">On Order</p>
          <p className="text-3xl font-bold mt-2">{item.onOrder.toFixed(2)} {item.uom}</p>
        </div>
        <div className="bg-gray-50 p-6 rounded-lg">
          <p className="text-sm text-gray-600">Reorder Level</p>
          <p className="text-3xl font-bold mt-2">{item.reorderLevel.toFixed(2)} {item.uom}</p>
        </div>
        <div className="bg-gray-50 p-6 rounded-lg">
          <p className="text-sm text-gray-600">Default Supplier</p>
          <p className="text-3xl font-bold mt-2">{item.defaultSupplier || '—'}</p>
        </div>
      </div>

      {/* Item Details */}
      <div className="bg-white rounded-2xl shadow-xl p-8 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <p className="text-sm text-gray-600">Category</p>
            <p className="text-xl font-bold mt-1">{item.category || '—'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">UOM</p>
            <p className="text-xl font-bold mt-1">{item.uom || '—'}</p>
          </div>
        </div>

        <div>
          <p className="text-sm text-gray-600">Notes</p>
          <p className="text-xl mt-1 whitespace-pre-wrap">{item.notes || '—'}</p>
        </div>
      </div>
    </div>
  );
}