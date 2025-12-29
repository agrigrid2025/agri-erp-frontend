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
    const loadData = async () => {
      try {
        // Load PO with lines
        const poRes = await fetch(`https://${tenant}.agrigrid.net/inventory3/api/po/${poId}/`, { credentials: 'include' });
        if (!poRes.ok) throw new Error('Failed to load PO');
        const poJson = await poRes.json();
        const p = poJson.po;
        setPo(p);

        // Map PO lines for receipt
        setLines(p.lines.map(line => ({
          id: line.id,
          item: line.item.id,
          itemText: `${line.item.sku} - ${line.item.name}`,
          uom: line.item.uom,
          ordered_qty: line.ordered_qty,
          received_qty: 0,
          unit_price: line.unit_price_ex_gst,  // Pre-populate from PO
          line_total: 0,
          batch_number: '',
          serial_number: '',
          expiry_date: '',
        })));

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
  }, [tenant, poId]);

  const handleReceiptChange = (e) => {
    const { name, value } = e.target;
    setReceiptData(prev => ({ ...prev, [name]: value }));
  };

  const handleLineChange = (index, field, value) => {
    const newLines = [...lines];
    newLines[index][field] = value;

    if (field === 'received_qty' || field === 'unit_price') {
      const qty = parseFloat(newLines[index].received_qty) || 0;
      const price = parseFloat(newLines[index].unit_price) || 0;
      newLines[index].line_total = qty * price;
    }

    setLines(newLines);
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage('');
    try {
      const url = `https://${tenant}.agrigrid.net/inventory3/api/receipt/save/`;

      const payload = {
        po: poId,
        receipt_date: receiptData.receipt_date,
        warehouse: receiptData.warehouse,
        location: receiptData.location || null,
        supplier_invoice: receiptData.supplier_invoice,
        notes: receiptData.notes,
        lines: lines.map(line => ({
          po_line_id: line.id,
          item: line.item,
          received_qty: parseFloat(line.received_qty) || 0,
          batch_number: line.batch_number || '',
          serial_number: line.serial_number || '',
          expiry_date: line.expiry_date || null,
        })),
      };

      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        credentials: 'include',
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setMessage('Receipt saved successfully!');
        setTimeout(() => navigate(`/dashboard/${tenant}/inventory/receipts`), 1500);
      } else {
        setMessage(data.error || 'Save failed');
      }
    } catch (err) {
      setMessage('Network error');
    } finally {
      setSaving(false);
    }
  };

  const grandTotal = lines.reduce((sum, line) => sum + line.line_total, 0);
  const tax = grandTotal * 0.1; // 10% GST
  const totalInclGST = grandTotal + tax;

  if (loading) return <div className="text-center py-20 text-2xl">Loading receipt form...</div>;

  return (
    <div className="max-w-7xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8">Receive Purchase Order {po?.po_number || poId}</h1>
      <p className="text-xl text-gray-600 mb-8">Supplier: {po?.supplier || 'Loading...'}</p>

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
                <option key={loc.id} value={loc.id}>
                  {loc.warehouse__name} — {loc.code} {loc.name ? `(${loc.name})` : ''}
                </option>
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

          {/* Column Headers */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 p-4 bg-gray-800 text-white rounded-t-lg font-medium">
            <div className="md:col-span-4">Item</div>
            <div className="md:col-span-1 text-right">Ordered</div>
            <div className="md:col-span-1 text-right">Received</div>
            <div className="md:col-span-2 text-right">Unit Price</div>
            <div className="md:col-span-2 text-right">Line Total</div>
            <div className="md:col-span-1 text-right">Batch / Serial</div>
            <div className="md:col-span-1 text-right">Expiry</div>
          </div>

          <div className="space-y-4">
            {lines.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No items on this PO
              </div>
            ) : (
              lines.map((line, index) => (
                <div key={line.id} className="grid grid-cols-1 md:grid-cols-12 gap-4 p-4 bg-gray-50 rounded-lg items-center">
                  {/* Item */}
                  <div className="md:col-span-4">
                    <div className="font-medium">{line.itemText}</div>
                    <div className="text-sm text-gray-600">{line.uom}</div>
                  </div>

                  {/* Ordered */}
                  <div className="md:col-span-1 text-right">{line.ordered_qty.toFixed(2)}</div>

                  {/* Received */}
                  <div className="md:col-span-1">
                    <input
                      type="number"
                      value={line.received_qty}
                      onChange={(e) => {
                        const qty = e.target.value;
                        handleLineChange(index, 'received_qty', qty);
                        const price = line.unit_price || 0;
                        handleLineChange(index, 'line_total', qty * price);
                      }}
                      min="0"
                      max={line.ordered_qty}
                      step="0.01"
                      className="w-full px-3 py-2 border rounded text-right focus:ring-2 focus:ring-green-500"
                      required
                    />
                  </div>

                  {/* Unit Price */}
                  <div className="md:col-span-2">
                    <div className="px-4 py-3 bg-gray-100 rounded-lg text-right font-mono">
                      ${line.unit_price.toFixed(2)}
                    </div>
                  </div>

                  {/* Line Total */}
                  <div className="md:col-span-2 text-right font-bold text-lg font-mono">
                    ${line.line_total.toFixed(2)}
                  </div>

                  {/* Batch / Serial */}
                  <div className="md:col-span-1">
                    <input
                      type="text"
                      value={line.batch_number}
                      onChange={(e) => handleLineChange(index, 'batch_number', e.target.value)}
                      placeholder="Batch"
                      className="w-full px-3 py-2 border rounded text-center"
                    />
                    <input
                      type="text"
                      value={line.serial_number}
                      onChange={(e) => handleLineChange(index, 'serial_number', e.target.value)}
                      placeholder="Serial"
                      className="w-full px-3 py-2 border rounded text-center mt-2"
                    />
                  </div>

                  {/* Expiry */}
                  <div className="md:col-span-1">
                    <input
                      type="date"
                      value={line.expiry_date}
                      onChange={(e) => handleLineChange(index, 'expiry_date', e.target.value)}
                      className="w-full px-3 py-2 border rounded"
                    />
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Totals */}
          <div className="mt-8 bg-gray-50 p-6 rounded-lg">
            <div className="flex justify-end space-y-2">
              <div className="text-right">
                <p className="text-xl font-bold">Total Ex GST</p>
                <p className="text-3xl font-bold text-green-700 font-mono">
                  ${grandTotal.toFixed(2)}
                </p>
                <p className="text-lg text-gray-600 mt-2">
                  Tax @ 10% = ${tax.toFixed(2)}
                </p>
                <p className="text-2xl font-bold text-green-700 mt-2">
                  Total Incl GST = ${totalInclGST.toFixed(2)}
                </p>
              </div>
            </div>
          </div>
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