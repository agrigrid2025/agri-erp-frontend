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
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">
          {item.sku} - {item.name}
        </h1>
        <Link
          to={`/dashboard/${tenant}/inventory/items`}
          className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
        >
          ← Back to List
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Left Column - Basic Info */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h2 className="text-xl font-semibold mb-6">Item Information</h2>
          <dl className="space-y-4">
            <div>
              <dt className="text-sm font-medium text-gray-600">SKU</dt>
              <dd className="text-lg font-bold">{item.sku}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-600">Name</dt>
              <dd className="text-lg">{item.name}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-600">Category</dt>
              <dd className="text-lg">{item.category || '—'}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-600">Unit of Measure</dt>
              <dd className="text-lg">{item.uom || '—'}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-600">Default Supplier</dt>
              <dd className="text-lg">{item.defaultSupplier || '—'}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-600">Status</dt>
              <dd className="text-lg">
                {item.isActive ? (
                  <span className="px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                    Active
                  </span>
                ) : (
                  <span className="px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
                    Inactive
                  </span>
                )}
              </dd>
            </div>
          </dl>
        </div>

        {/* Right Column - Stock Info */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h2 className="text-xl font-semibold mb-6">Stock Levels</h2>
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <span className="text-lg font-medium text-gray-700">Current Stock</span>
              <span className="text-3xl font-bold text-green-600">{item.currentStock.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-lg font-medium text-gray-700">On Order</span>
              <span className="text-3xl font-bold text-blue-600">{item.onOrder.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-lg font-medium text-gray-700">Reorder Level</span>
              <span className={`text-3xl font-bold ${item.currentStock <= item.reorderLevel ? 'text-red-600' : 'text-gray-800'}`}>
                {item.reorderLevel.toFixed(2)}
              </span>
            </div>
            {item.currentStock <= item.reorderLevel && (
              <div className="mt-6 p-4 bg-red-50 border border-red-300 rounded-lg">
                <p className="text-red-800 font-medium">
                  ⚠️ Stock is at or below reorder level — consider ordering more
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="mt-8 text-center">
        <Link
          to={`/dashboard/${tenant}/inventory/items/edit/${item.id}`}
          className="inline-block px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition mr-4"
        >
          Edit Item
        </Link>
        <Link
          to={`/dashboard/${tenant}/inventory/adjustments/new?item=${item.id}`}
          className="inline-block px-8 py-4 bg-yellow-600 hover:bg-yellow-700 text-white font-bold rounded-xl transition"
        >
          Adjust Stock
        </Link>
      </div>
    </div>
  );
}