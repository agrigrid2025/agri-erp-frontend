import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';

export default function ReceiptForm() {
  const { tenant, poId } = useParams();
  const navigate = useNavigate();

  const [po, setPo] = useState(null);
  const [lines, setLines] = useState([]);
  const [receiptData, setReceiptData] = useState({
    receipt_date: new Date().toISOString().split('T')[0],
    warehouse: '',
    location: '',
    supplier_invoice: '',
    notes: '',
  });
  const [warehouses, setWarehouses] = useState([]);
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    // Load PO and lines (replace with real API when ready)
    // For now, placeholder data
    setPo({
      po_number: 'PO-000001',
      supplier: 'Example Supplier',
    });
    setLines([
      { id: 1, item: 'ABC123 - Fertilizer 25kg', uom: 'bag', ordered_qty: 100, received_qty: 0 },
      { id: 2, item: 'XYZ456 - Pesticide 5L', uom: 'L', ordered_qty: 50, received_qty: 0 },
    ]);

    // Load warehouses and locations
    fetch(`https://${tenant}.agrigrid.net/inventory3/api/warehouses/`, { credentials: 'include' })
      .then(r => r.json())
      .then(data => setWarehouses(data.warehouses || []));

    fetch(`https://${tenant}.agrigrid.net/inventory3/api/locations/`, { credentials: 'include' })
      .then(r => r.json())
      .then(data => setLocations(data.locations || []));

    setLoading(false);
  }, [tenant]);

  const handleLineChange = (index, field, value) => {
    const newLines = [...lines];
    newLines[index][field] = value;
    setLines(newLines);
  };

  const handleReceiptChange = (e) => {
    const { name, value } = e.target;
    setReceiptData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage('');
    try {
      // Placeholder — add real save API when ready
      console.log('Saving receipt:', { receiptData, lines });
      setMessage('Receipt saved successfully! (placeholder)');
      setTimeout(() => navigate(`/dashboard/${tenant}/inventory/po/${poId}`), 1500);
    } catch (err) {
      setMessage('Save failed');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="text-center py-20 text-2xl">Loading receipt...</div>;

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8">Receive Purchase Order {po?.po_number}</h1>
      <p className="text-xl text-gray-600 mb-8">Supplier: {po?.supplier}</p>

      <div className="bg-white rounded-2xl shadow-xl p-8 space-y-8">
        {/* Receipt Header */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Receipt Date *</label>
            <input
              type="date"
              name="receipt_date"
              value={receiptData.receipt_date}
              onChange={handleReceiptChange}
              required
              className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Warehouse *</label>
            <select
              name="warehouse"
              value={receiptData.warehouse}
              onChange={handleReceiptChange}
              required
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
              value={receiptData.location}
              onChange={handleReceiptChange}
              className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500"
            >
              <option value="">Select location</option>
              {locations.map(loc => (
                <option key={loc.id} value={loc.id}>{loc.warehouse__name} — {loc.code} {loc.name ? `(${loc.name})` : ''}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Supplier Invoice #</label>
          <input
            type="text"
            name="supplier_invoice"
            value={receiptData.supplier_invoice}
            onChange={handleReceiptChange}
            className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500"
          />
        </div>

        {/* Line Items */}
        <div>
          <h2 className="text-2xl font-bold mb-4">Items to Receive</h2>
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left">Item</th>
                <th className="px-6 py-3 text-right">Ordered</th>
                <th className="px-6 py-3 text-right">Received</th>
                <th className="px-6 py-3 text-right">Batch / Serial</th>
                <th className="px-6 py-3 text-right">Expiry</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {lines.map((line, index) => (
                <tr key={line.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">{line.item} ({line.uom})</td>
                  <td className="px-6 py-4 text-right">{line.ordered_qty}</td>
                  <td className="px-6 py-4 text-right">
                    <input
                      type="number"
                      value={line.received_qty}
                      onChange={(e) => handleLineChange(index, 'received_qty', e.target.value)}
                      min="0"
                      max={line.ordered_qty}
                      step="0.01"
                      className="w-32 px-3 py-2 border rounded text-right focus:ring-2 focus:ring-green-500"
                    />
                  </td>
                  <td className="px-6 py-4 text-right">
                    <input
                      type="text"
                      value={line.batch_number || ''}
                      onChange={(e) => handleLineChange(index, 'batch_number', e.target.value)}
                      placeholder="Batch"
                      className="w-32 px-3 py-2 border rounded text-center"
                    />
                    <input
                      type="text"
                      value={line.serial_number || ''}
                      onChange={(e) => handleLineChange(index, 'serial_number', e.target.value)}
                      placeholder="Serial"
                      className="w-32 px-3 py-2 border rounded text-center mt-2"
                    />
                  </td>
                  <td className="px-6 py-4 text-right">
                    <input
                      type="date"
                      value={line.expiry_date || ''}
                      onChange={(e) => handleLineChange(index, 'expiry_date', e.target.value)}
                      className="w-40 px-3 py-2 border rounded"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Notes */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
          <textarea
            name="notes"
            value={receiptData.notes}
            onChange={handleReceiptChange}
            rows="4"
            className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500"
          />
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-4 pt-6">
          <Link
            to={`/dashboard/${tenant}/inventory/po/${poId}`}
            className="px-8 py-4 border border-gray-300 rounded-xl text-lg font-medium hover:bg-gray-50 transition"
          >
            Cancel
          </Link>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-12 py-4 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white font-bold rounded-xl text-lg transition"
          >
            {saving ? 'Saving...' : 'Save Receipt'}
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