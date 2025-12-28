import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';

export default function ReceiptList() {
  const { tenant } = useParams();
  const [receipts, setReceipts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`https://${tenant}.agrigrid.net/inventory3/api/receipts/`, { credentials: 'include' })
      .then(r => r.json())
      .then(data => {
        setReceipts(data.receipts || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [tenant]);

  if (loading) return <div className="text-center py-20 text-2xl">Loading receipts...</div>;

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Purchase Receipts</h1>
        <Link
          to={`/dashboard/${tenant}/inventory/po`}
          className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg shadow transition"
        >
          Back to POs
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-800 text-white">
            <tr>
              <th className="px-6 py-4 text-left">Receipt #</th>
              <th className="px-6 py-4 text-left">PO #</th>
              <th className="px-6 py-4 text-left">Supplier</th>
              <th className="px-6 py-4 text-left">Warehouse</th>
              <th className="px-6 py-4 text-left">Date</th>
              <th className="px-6 py-4 text-center">Lines</th>
              <th className="px-6 py-4 text-center">Total Qty</th>
              <th className="px-6 py-4 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {receipts.length === 0 ? (
              <tr>
                <td colSpan="8" className="text-center py-16 text-gray-500 text-lg">
                  No purchase receipts yet.
                </td>
              </tr>
            ) : (
              receipts.map(r => (
                <tr key={r.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <Link
                      to={`/dashboard/${tenant}/inventory/receipt/${r.id}`}
                      className="text-indigo-600 hover:text-indigo-800 font-medium font-mono text-lg"
                    >
                      {r.receipt_number}
                    </Link>
                  </td>
                  <td className="px-6 py-4 font-mono">{r.po_number}</td>
                  <td className="px-6 py-4">{r.supplier}</td>
                  <td className="px-6 py-4">{r.warehouse}</td>
                  <td className="px-6 py-4">{new Date(r.receipt_date).toLocaleDateString()}</td>
                  <td className="px-6 py-4 text-center">{r.line_count}</td>
                  <td className="px-6 py-4 text-center font-bold text-green-600">
                    {r.total_qty.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <Link
                      to={`/dashboard/${tenant}/inventory/receipt/${r.id}`}
                      className="text-indigo-600 hover:text-indigo-800 font-medium"
                    >
                      View
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}