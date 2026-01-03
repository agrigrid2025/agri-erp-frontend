import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

export default function StockAdjust() {
  const { tenant } = useParams();
  const [stock, setStock] = useState([]);
  const [loading, setLoading] = useState(true);
  const [adjustments, setAdjustments] = useState({});

  useEffect(() => {
    fetch(`https://${tenant}.agrigrid.net/inventory3/api/stock-adjust/`, { credentials: 'include' })
      .then(r => r.json())
      .then(data => {
        setStock(data.stock || []);
        setLoading(false);
      });
  }, [tenant]);

  const handleQtyChange = (id, value) => {
    setAdjustments(prev => ({
      ...prev,
      [id]: value === '' ? '' : parseFloat(value) || 0,
    }));
  };

  const handleSave = async () => {
    const toSave = Object.entries(adjustments)
      .filter(([_, qty]) => qty !== 0 && qty !== '')
      .map(([id, qty]) => {
        const item = stock.find(s => s.id === parseInt(id));
        return {
          item_id: item.item_id,
          warehouse_id: item.warehouse_id || null,
          location_id: item.location_id || null,
          batch_number: item.batch_number,
          serial_number: item.serial_number,
          expiry_date: item.expiry_date || null,
          adjustment_qty: qty,
          notes: `Manual adjustment on ${new Date().toLocaleDateString()}`,
        };
      });

    if (toSave.length === 0) {
      alert('No adjustments to save');
      return;
    }

    try {
      await Promise.all(toSave.map(item =>
        fetch(`https://${tenant}.agrigrid.net/inventory3/api/stock-adjust/save/`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(item),
          credentials: 'include',
        })
      ));
      alert('Stock adjustments saved!');
      window.location.reload();
    } catch (err) {
      alert('Save failed');
    }
  };

  if (loading) return <div className="text-center py-20">Loading stock...</div>;

  return (
    <div className="max-w-7xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8">Adjust Stock</h1>

      <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
        <table className="min-w-full">
          <thead className="bg-gray-800 text-white">
            <tr>
              <th className="px-6 py-4 text-left">Item</th>
              <th className="px-6 py-4 text-left">Warehouse</th>
              <th className="px-6 py-4 text-left">Location</th>
              <th className="px-6 py-4 text-left">Batch / Serial</th>
              <th className="px-6 py-4 text-right">Current Qty</th>
              <th className="px-6 py-4 text-right">Adjustment (+/-)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {stock.length === 0 ? (
              <tr>
                <td colSpan="6" className="text-center py-12 text-gray-500">
                  No stock to adjust
                </td>
              </tr>
            ) : (
              stock.map(item => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <span className="font-medium">{item.sku}</span> — {item.name}
                    <div className="text-sm text-gray-600">{item.uom}</div>
                  </td>
                  <td className="px-6 py-4">{item.warehouse}</td>
                  <td className="px-6 py-4">{item.location}</td>
                  <td className="px-6 py-4">
                    {item.batch_number ? `B: ${item.batch_number}` : ''}
                    {item.serial_number ? `S: ${item.serial_number}` : ''}
                  </td>
                  <td className="px-6 py-4 text-right font-bold">{item.quantity_on_hand.toFixed(2)}</td>
                  <td className="px-6 py-4 text-right">
                    <input
                      type="number"
                      value={adjustments[item.id] || ''}
                      onChange={(e) => handleQtyChange(item.id, e.target.value)}
                      step="0.01"
                      placeholder="0.00"
                      className="w-32 px-3 py-2 border rounded text-right focus:ring-2 focus:ring-green-500"
                    />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-8 flex justify-end">
        <button
          onClick={handleSave}
          className="px-12 py-4 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl text-lg transition"
        >
          Save Adjustments
        </button>
      </div>
    </div>
  );
}