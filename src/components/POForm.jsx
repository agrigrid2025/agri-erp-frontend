import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation, Link } from 'react-router-dom';

export default function POForm() {
  const { tenant } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const isEdit = location.pathname.includes('/edit/');
  const poId = isEdit ? location.pathname.split('/').pop() : null;

  const [poData, setPoData] = useState({
    supplier: '',
    order_date: new Date().toISOString().split('T')[0],
    expected_date: '',
    status: 'draft',
    notes: '',
    lines: [],
  });
  const [suppliers, setSuppliers] = useState([]);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    // Load suppliers
    fetch(`https://${tenant}.agrigrid.net/suppliers/api/suppliers/`, { credentials: 'include' })
      .then(r => r.json())
      .then(data => setSuppliers(data.suppliers || []));

    // Load items for search
    fetch(`https://${tenant}.agrigrid.net/inventory3/api/items/`, { credentials: 'include' })
      .then(r => r.json())
      .then(data => setItems(data.items || []));

    if (isEdit && poId) {
      // Load existing PO
      fetch(`https://${tenant}.agrigrid.net/inventory3/api/po/${poId}/`, { credentials: 'include' })
        .then(r => r.json())
        .then(data => {
          const p = data.po;
          if (p) {
            setPoData({
              supplier: p.supplier_id || '',
              order_date: p.order_date,
              expected_date: p.expected_date || '',
              status: p.status,
              notes: p.notes || '',
              lines: p.lines.map(line => ({
                id: line.id,
                item: line.item.id,
                itemText: `${line.item.sku} - ${line.item.name}`,
                uom: line.item.uom,
                qty: line.ordered_qty,
                price: line.unit_price_ex_gst,
                total: line.total_price,
                searchResults: [],
              })),
            });
          }
          setLoading(false);
        })
        .catch(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [isEdit, poId, tenant]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setPoData(prev => ({ ...prev, [name]: value }));
  };

  const addLine = () => {
    setPoData(prev => ({
      ...prev,
      lines: [...prev.lines, {
        item: null,
        itemText: '',
        uom: '',
        qty: '',
        price: '',
        total: 0,
        searchResults: [],
      }],
    }));
  };

  const updateLine = (index, field, value) => {
    const newLines = [...poData.lines];
    newLines[index][field] = value;

    if (field === 'qty' || field === 'price') {
      const qty = parseFloat(newLines[index].qty) || 0;
      const price = parseFloat(newLines[index].price) || 0;
      newLines[index].total = qty * price;
    }

    setPoData(prev => ({ ...prev, lines: newLines }));
  };

  const removeLine = (index) => {
    setPoData(prev => ({
      ...prev,
      lines: prev.lines.filter((_, i) => i !== index),
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage('');
    try {
      const url = `https://${tenant}.agrigrid.net/inventory3/api/po/save/`;

      const payload = {
        ...poData,
        id: isEdit ? poId : undefined,
        lines: poData.lines.filter(line => line.item).map(line => ({
          id: line.id,
          item: line.item,
          qty: line.qty,
          price: line.price,
        })),
      };

      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        credentials: 'include',
      });
      const data = await res.json();
      if (data.success) {
        setMessage('Purchase Order saved successfully!');
        setTimeout(() => navigate(`/dashboard/${tenant}/inventory/po`), 1500);
      } else {
        setMessage(data.error || 'Save failed');
      }
    } catch (err) {
      setMessage('Network error');
    } finally {
      setSaving(false);
    }
  };

  const grandTotal = poData.lines.reduce((sum, line) => sum + line.total, 0);

  if (loading) return <div className="text-center py-20 text-2xl">Loading form...</div>;

  return (
    <div className="max-w-7xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8">
        {isEdit ? 'Edit Purchase Order' : 'Create Purchase Order'}
      </h1>

      <div className="bg-white rounded-2xl shadow-xl p-8 space-y-8">
        {/* Header Fields */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Supplier *</label>
            <select
              name="supplier"
              value={poData.supplier}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500"
            >
              <option value="">Select supplier</option>
              {suppliers.map(sup => (
                <option key={sup.id} value={sup.id}>{sup.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Order Date *</label>
            <input
              type="date"
              name="order_date"
              value={poData.order_date}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Expected Date</label>
            <input
              type="date"
              name="expected_date"
              value={poData.expected_date}
              onChange={handleChange}
              className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
          <select
            name="status"
            value={poData.status}
            onChange={handleChange}
            className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500"
          >
            <option value="draft">Draft</option>
            <option value="sent">Sent to Supplier</option>
            <option value="confirmed">Confirmed</option>
            <option value="received">Received</option>
            <option value="complete">Complete</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        {/* Line Items */}
        <div>
          <h2 className="text-2xl font-bold mb-4">Line Items</h2>

          {/* Column Headers */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 p-4 bg-gray-800 text-white rounded-t-lg font-medium">
            <div className="md:col-span-5">Item</div>
            <div className="md:col-span-1 text-center">UOM</div>
            <div className="md:col-span-2 text-right">Qty</div>
            <div className="md:col-span-2 text-right">Price</div>
            <div className="md:col-span-1 text-right">Line Total</div>
            <div className="md:col-span-1 text-center">Remove</div>
          </div>

          <div className="space-y-4">
            {poData.lines.map((line, index) => (
              <div key={index} className="grid grid-cols-1 md:grid-cols-12 gap-4 p-4 bg-gray-50 rounded-lg items-center relative">
                {/* Item Search */}
                <div className="md:col-span-5 relative">
                  <input
                    type="text"
                    value={line.itemText}
                    onChange={(e) => {
                      const value = e.target.value;
                      updateLine(index, 'itemText', value);
                      if (value.length > 1) {
                        const filtered = items.filter(item =>
                          item.sku.toLowerCase().includes(value.toLowerCase()) ||
                          item.name.toLowerCase().includes(value.toLowerCase())
                        );
                        updateLine(index, 'searchResults', filtered.slice(0, 10));
                      } else {
                        updateLine(index, 'searchResults', []);
                      }
                    }}
                    placeholder="Search item by SKU or name..."
                    className="w-full px-4 py-3 pr-12 border rounded-lg text-lg"
                  />
                  <svg className="absolute right-3 top-4 w-6 h-6 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                  </svg>

                  {/* Search Results */}
                  {line.searchResults && line.searchResults.length > 0 && (
                    <div className="absolute z-10 w-full bg-white border rounded-lg mt-1 shadow-lg max-h-60 overflow-y-auto">
                      {line.searchResults.map(item => (
                        <div
                          key={item.id}
                          className="px-4 py-2 hover:bg-blue-50 cursor-pointer"
                          onClick={() => {
                            updateLine(index, 'item', item.id);
                            updateLine(index, 'itemText', `${item.sku} - ${item.name}`);
                            updateLine(index, 'uom', item.uom);
                            updateLine(index, 'searchResults', []);
                          }}
                        >
                          {item.sku} - {item.name}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* UOM */}
                <div className="md:col-span-1">
                  <div className="px-4 py-3 bg-gray-100 rounded-lg text-center font-medium">
                    {line.uom || '—'}
                  </div>
                </div>

                {/* Qty */}
                <div className="md:col-span-2">
                  <input
                    type="number"
                    value={line.qty}
                    onChange={(e) => updateLine(index, 'qty', e.target.value)}
                    step="0.01"
                    className="w-full px-4 py-3 border rounded-lg text-right"
                    required
                  />
                </div>

                {/* Price */}
                <div className="md:col-span-2">
                  <input
                    type="number"
                    value={line.price}
                    onChange={(e) => updateLine(index, 'price', e.target.value)}
                    step="0.01"
                    className="w-full px-4 py-3 border rounded-lg text-right font-mono"
                    required
                  />
                </div>

                {/* Line Total */}
                <div className="md:col-span-1 text-right font-bold text-lg font-mono">
                  ${line.total.toFixed(2)}
                </div>

                {/* Remove */}
                <div className="md:col-span-1 text-center">
                  <button
                    type="button"
                    onClick={() => removeLine(index)}
                    className="text-red-600 hover:text-red-800 font-bold"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}

            {/* Add Line Button */}
            <button
              type="button"
              onClick={addLine}
              className="mt-4 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg shadow transition"
            >
              + Add Line
            </button>
          </div>
        </div>

        {/* Totals */}
        <div className="bg-gray-50 p-6 rounded-lg">
          <div className="flex justify-end">
            <div className="text-right">
              <p className="text-xl font-bold">Grand Total (ex GST)</p>
              <p className="text-3xl font-bold text-green-700 font-mono">${grandTotal.toFixed(2)}</p>
            </div>
          </div>
        </div>

        {/* Notes */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
          <textarea
            name="notes"
            value={poData.notes}
            onChange={handleChange}
            rows="4"
            className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500"
          />
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-4 pt-6">
          <Link
            to={`/dashboard/${tenant}/inventory/po`}
            className="px-8 py-4 border border-gray-300 rounded-xl text-lg font-medium hover:bg-gray-50 transition"
          >
            Cancel
          </Link>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-12 py-4 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white font-bold rounded-xl text-lg transition"
          >
            {saving ? 'Saving...' : 'Save Purchase Order'}
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