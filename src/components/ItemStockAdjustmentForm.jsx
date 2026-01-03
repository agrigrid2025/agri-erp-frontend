import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';

export default function ItemStockAdjustmentForm() {
  const { tenant, itemId } = useParams();
  const navigate = useNavigate();

  const [item, setItem] = useState(null);
  const [warehouses, setWarehouses] = useState([]);
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  const [formData, setFormData] = useState({
    warehouse: '',
    location: '',
    batch_number: '',
    serial_number: '',
    expiry_date: '',
    adjustment_qty: '',
    notes: '',
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        // Load item
        const itemRes = await fetch(`https://${tenant}.agrigrid.net/inventory3/api/items/`, { credentials: 'include' });
        const itemData = await itemRes.json();
        const foundItem = itemData.items.find(i => i.id === parseInt(itemId));
        setItem(foundItem);

        // Load warehouses and locations
        const [whRes, locRes] = await Promise.all([
          fetch(`https://${tenant}.agrigrid.net/inventory3/api/warehouses/`, { credentials: 'include' }),
          fetch(`https://${tenant}.agrigrid.net/inventory3/api/locations/`, { credentials: 'include' }),
        ]);

        const [whData, locData] = await Promise.all([whRes.json(), locRes.json()]);
        setWarehouses(whData.warehouses || []);
        setLocations(locData.locations || []);
      } catch (err) {
        console.error(err);
        setMessage('Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [tenant, itemId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    if (!formData.adjustment_qty) {
      setMessage('Adjustment quantity is required');
      return;
    }

    setSaving(true);
    setMessage('');
    try {
      const url = `https://${tenant}.agrigrid.net/inventory3/api/stock-adjust/save/`;

      const payload = {
        item_id: itemId,
        warehouse_id: formData.warehouse || null,
        location_id: formData.location || null,
        batch_number: formData.batch_number || '',
        serial_number: formData.serial_number || '',
        expiry_date: formData.expiry_date || null,
        adjustment_qty: parseFloat(formData.adjustment_qty),
        notes: formData.notes || '',
      };

      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        credentials: 'include',
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setMessage('Stock adjustment saved successfully!');
        setTimeout(() => navigate(`/dashboard/${tenant}/inventory/items/${itemId}`), 1500);
      } else {
        setMessage(data.error || 'Save failed');
      }
    } catch (err) {
      setMessage('Network error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="text-center py-20 text-2xl">Loading...</div>;
  if (!item) return <div className="text-center py-20 text-2xl text-red-600">Item not found</div>;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8">Adjust Stock — {item.sku} {item.name}</h1>

      <div className="bg-white rounded-2xl shadow-xl p-8 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Current Stock</label>
            <div className="px-4 py-3 bg-gray-100 rounded-lg text-xl font-bold">
              {item.currentStock.toFixed(2)} {item.uom}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Adjustment Qty * (+/-)</label>
            <input
              type="number"
              name="adjustment_qty"
              value={formData.adjustment_qty}
              onChange={handleChange}
              step="0.01"
              required
              placeholder="e.g. 10 or -5"
              className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Warehouse</label>
            <select
              name="warehouse"
              value={formData.warehouse}
              onChange={handleChange}
              className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500"
            >
              <option value="">Select warehouse</option>
              {warehouses.map(wh => (
                <option key={wh.id} value={wh.id}>{wh.name} ({wh.code})</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
            <select
              name="location"
              value={formData.location}
              onChange={handleChange}
              className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500"
            >
              <option value="">Select location</option>
              {locations.map(loc => (
                <option key={loc.id} value={loc.id}>
                  {loc.warehouse__name} — {loc.code} {loc.name ? `(${loc.name})` : ''}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Batch Number</label>
            <input
              type="text"
              name="batch_number"
              value={formData.batch_number}
              onChange={handleChange}
              className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Serial Number</label>
            <input
              type="text"
              name="serial_number"
              value={formData.serial_number}
              onChange={handleChange}
              className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Expiry Date</label>
            <input
              type="date"
              name="expiry_date"
              value={formData.expiry_date}
              onChange={handleChange}
              className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
          <textarea
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            rows="4"
            className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500"
          />
        </div>

        <div className="flex justify-end gap-4 pt-6">
          <Link
            to={`/dashboard/${tenant}/inventory/items/${itemId}`}
            className="px-8 py-4 border border-gray-300 rounded-xl text-lg font-medium hover:bg-gray-50 transition"
          >
            Cancel
          </Link>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-12 py-4 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white font-bold rounded-xl text-lg transition"
          >
            {saving ? 'Saving...' : 'Save Adjustment'}
          </button>
        </div>

        {message && (
          <p className={`text-center text-xl font-medium mt-8 ${message.includes('success') ? 'text-green-600' : 'text-red-600'}`}>
            {message}
          </p>
        )}
      </div>
    </div>
  );
}