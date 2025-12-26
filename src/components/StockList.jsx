import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

export default function StockList() {
  const { tenant } = useParams();
  const [stock, setStock] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`https://${tenant}.agrigrid.net/inventory3/api/stock-by-location/`, { credentials: 'include' })
      .then(r => r.json())
      .then(data => {
        setStock(data.stock || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [tenant]);

  if (loading) return <div className="text-center py-32 text-2xl">Loading stock...</div>;

  if (stock.length === 0) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">Stock by Location</h1>
        <div className="text-center py-16 text-gray-500 text-xl">
          No stock recorded yet.
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <h1 className="text-4xl font-bold text-gray-900 mb-8">Stock by Location</h1>

      <div className="space-y-8">
        {stock.map(entry => (
          <div key={entry.item.id} className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-6">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-bold">{entry.item.sku}</h2>
                  <p className="text-lg opacity-90">{entry.item.name}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm opacity-80">Total Stock</p>
                  <p className="text-4xl font-bold">{entry.total.toFixed(2)} {entry.item.uom}</p>
                </div>
              </div>
            </div>

            <div className="p-6">
              <table className="w-full">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="text-left px-4 py-3">Warehouse</th>
                    <th className="text-left px-4 py-3">Location</th>
                    <th className="text-left px-4 py-3">Batch / Serial</th>
                    <th className="text-right px-4 py-3">Qty</th>
                  </tr>
                </thead>
                <tbody>
                  {entry.locations.map((loc, idx) => (
                    <tr key={idx} className="border-b hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium">{loc.warehouse}</td>
                      <td className="px-4 py-3">{loc.location}</td>
                      <td className="px-4 py-3">
                        {loc.batch_number ? <span className="font-mono text-sm">B: {loc.batch_number}</span> : ''}
                        {loc.serial_number ? <span className="font-mono text-sm ml-2">S: {loc.serial_number}</span> : ''}
                        {!loc.batch_number && !loc.serial_number ? '—' : ''}
                      </td>
                      <td className="px-4 py-3 text-right font-bold text-green-600 text-xl">
                        {loc.quantity_on_hand.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}