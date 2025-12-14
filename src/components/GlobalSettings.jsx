import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

export default function GlobalSettings() {
  const { tenant } = useParams();
  const [formData, setFormData] = useState({
    tax_rate: '',
    po_prefix: 'PO',
    po_next_number: '',
    pr_next_number: '',
    currency_symbol: '$',
    low_stock_threshold: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetch(`https://${tenant}.agrigrid.net/api/settings/global/`, { credentials: 'include' })
      .then(r => r.json())
      .then(data => {
        setFormData({
          tax_rate: data.tax_rate || '',
          po_prefix: data.po_prefix || 'PO',
          po_next_number: data.po_next_number || '',
          pr_next_number: data.pr_next_number || '',
          currency_symbol: data.currency_symbol || '$',
          low_stock_threshold: data.low_stock_threshold || '',
        });
        setLoading(false);
      });
  }, [tenant]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage('');
    try {
      const res = await fetch(`https://${tenant}.agrigrid.net/api/settings/global/save/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
        credentials: 'include',
      });
      const data = await res.json();
      if (data.success) {
        setMessage('Global settings saved successfully!');
      } else {
        setMessage(data.error || 'Save failed');
      }
    } catch (err) {
      setMessage('Network error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="text-center py-32 text-2xl">Loading settings...</div>;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Global Settings</h1>

      {/* Warning Banner */}
      <div className="bg-red-50 border-l-4 border-red-600 p-6 mb-8 rounded-r-lg">
        <p className="text-lg font-semibold text-red-800">
          Be careful when updating these settings as they have system-wide implications.
        </p>
      </div>

      {message && (
        <div className={`p-6 rounded-lg mb-8 ${message.includes('success') ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
          <p className="font-medium text-lg">{737 message}</p>
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-xl p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Tax Rate (%)</label>
            <input
              type="number"
              name="tax_rate"
              value={formData.tax_rate}
              onChange={handleChange}
              step="0.01"
              className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-xs text-gray-500 mt-2">GST/VAT rate applied to all calculations</p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Purchase Order Prefix</label>
            <input
              type="text"
              name="po_prefix"
              value={formData.po_prefix}
              onChange={handleChange}
              maxLength="4"
              className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-xs text-gray-500 mt-2">Max 4 characters (e.g., PO, PURCH)</p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Next Purchase Order Number</label>
            <input
              type="number"
              name="po_next_number"
              value={formData.po_next_number}
              onChange={handleChange}
              className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Next Purchase Receipt Number</label>
            <input
              type="number"
              name="pr_next_number"
              value={formData.pr_next_number}
              onChange={handleChange}
              className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Currency Symbol</label>
            <input
              type="text"
              name="currency_symbol"
              value={formData.currency_symbol}
              onChange={handleChange}
              maxLength="5"
              className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Low Stock Warning Threshold</label>
            <input
              type="number"
              name="low_stock_threshold"
              value={formData.low_stock_threshold}
              onChange={handleChange}
              className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="pt-8 border-t border-gray-200 text-right">
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-12 py-4 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white font-bold text-xl rounded-lg shadow-lg transition"
          >
            {saving ? 'Saving...' : 'Save Global Settings'}
          </button>
        </div>
      </div>
    </div>
  );
}