import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';

export default function ReceiptDetail() {
  const { tenant, receiptId } = useParams();
  const [receipt, setReceipt] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`https://${tenant}.agrigrid.net/inventory3/api/receipt/${receiptId}/`, { credentials: 'include' })
      .then(r => r.json())
      .then(data => {
        setReceipt(data.receipt);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [tenant, receiptId]);

  if (loading) return <div className="text-center py-20 text-2xl">Loading receipt...</div>;
  if (!receipt) return <div className="text-center py-20 text-2xl text-red-600">Receipt not found</div>;

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-4xl font-bold text-gray-900">Receipt {receipt.receipt_number}</h1>
          <p className="text-xl text-gray-600 mt-2">PO: {receipt.po_number} — {receipt.supplier}</p>
        </div>
        <Link
          to={`/dashboard/${tenant}/inventory/receipts`}
          className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition"
        >
          ← Back to Receipts
        </Link>
      </div>

      {/* Summary Cards */}
      <div className="grid md:grid-cols-4 gap-6 mb-8">
        <div className="bg-gray-50 p-6 rounded-lg">
          <p className="text-sm text-gray-600">Receipt Date</p>
          <p className="text-2xl font-bold mt-2">{new Date(receipt.receipt_date).toLocaleDateString()}</p>
        </div>
        <div className="bg-gray-50 p-6 rounded-lg">
          <p className="text-sm text-gray-600">Warehouse</p>
          <p className="text-2xl font-bold mt-2">{receipt.warehouse}</p>
        </div>
        <div className="bg-gray-50 p-6 rounded-lg">
          <p className="text-sm text-gray-600">Location</p>
          <p className="text-2xl font-bold mt-2">{receipt.location || '—'}</p>
        </div>
        <div className="bg-gray-50 p-6 rounded-lg">
          <p className="text-sm text-gray-600">Supplier Invoice</p>
          <p className="text-2xl font-bold mt-2">{receipt.supplier_invoice || '—'}</p>
        </div>
      </div>

      {/* Line Items */}
      <div className="bg-white rounded-xl shadow overflow-hidden mb-8">
        <div className="px-6 py-4 bg-gray-800 text-white">
          <h2 className="text-xl font-bold">Received Items</h2>
        </div>
        <table className="min-w-full">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-6 py-3 text-left">Item</th>
              <th className="px-6 py-3 text-right">Ordered</th>
              <th className="px-6 py-3 text-right">Received</th>
              <th className="px-6 py-3 text-right">Unit Price</th>
              <th className="px-6 py-3 text-right">Line Total</th>
              <th className="px-6 py-3 text-right">Batch / Serial</th>
              <th className="px-6 py-3 text-right">Expiry</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {receipt.lines.length === 0 ? (
              <tr>
                <td colSpan="7" className="px-6 py-8 text-center text-gray-500">
                  No items received
                </td>
              </tr>
            ) : (
              receipt.lines.map(line => {
                const lineTotal = line.received_qty * line.unit_price_ex_gst;
                return (
                  <tr key={line.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <span className="font-medium">{line.item.sku}</span> — {line.item.name}
                    </td>
                    <td className="px-6 py-4 text-right">{line.ordered_qty.toFixed(2)}</td>
                    <td className="px-6 py-4 text-right text-green-600 font-bold">
                      {line.received_qty.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 text-right font-mono">${line.unit_price_ex_gst.toFixed(2)}</td>
                    <td className="px-6 py-4 text-right font-mono font-bold">${lineTotal.toFixed(2)}</td>
                    <td className="px-6 py-4 text-right">
                      {line.batch_number ? <span className="font-mono text-sm">B: {line.batch_number}</span> : ''}
                      {line.serial_number ? <span className="font-mono text-sm ml-2">S: {line.serial_number}</span> : ''}
                      {!line.batch_number && !line.serial_number ? '—' : ''}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {line.expiry_date ? new Date(line.expiry_date).toLocaleDateString() : '—'}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
          <tfoot className="bg-gray-50 font-bold">
            <tr>
              <td colSpan="4" className="px-6 py-4 text-right">Receipt Total (ex GST)</td>
              <td className="px-6 py-4 text-right font-mono text-2xl text-green-700">
                ${receipt.lines.reduce((sum, line) => sum + (line.received_qty * line.unit_price_ex_gst), 0).toFixed(2)}
              </td>
              <td colSpan="2"></td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Notes */}
      {receipt.notes && (
        <div className="bg-gray-50 p-6 rounded-lg">
          <p className="text-sm text-gray-600 font-bold mb-2">Notes</p>
          <p className="whitespace-pre-wrap">{receipt.notes}</p>
        </div>
      )}
    </div>
  );
}