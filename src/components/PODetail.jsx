import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';

export default function PODetail() {
  const { tenant, poId } = useParams();
  const [po, setPo] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`https://${tenant}.agrigrid.net/inventory3/api/pos/`, { credentials: 'include' })
      .then(r => r.json())
      .then(data => {
        const foundPo = data.pos.find(p => p.id === parseInt(poId));
        setPo(foundPo);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [tenant, poId]);

  const getStatusBadge = (status) => {
    const styles = {
      draft: 'bg-gray-100 text-gray-800',
      sent: 'bg-blue-100 text-blue-800',
      confirmed: 'bg-yellow-100 text-yellow-800',
      received: 'bg-green-100 text-green-800',
      complete: 'bg-purple-100 text-purple-800',
      cancelled: 'bg-red-100 text-red-800',
    };
    return <span className={`px-4 py-1 rounded-full text-sm font-medium ${styles[status] || 'bg-gray-100 text-gray-800'}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>;
  };

  if (loading) return <div className="text-center py-20 text-2xl">Loading PO...</div>;
  if (!po) return <div className="text-center py-20 text-2xl text-red-600">Purchase Order not found</div>;

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-4xl font-bold text-gray-900">Purchase Order {po.po_number}</h1>
          <p className="text-xl text-gray-600 mt-2">{po.supplier}</p>
        </div>
        <div className="flex gap-4">
          {po.status !== 'received' && po.status !== 'cancelled' && (
            <Link
              to={`/dashboard/${tenant}/inventory/po/${po.id}/receipt`}
              className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg shadow transition"
            >
              Receipt Items
            </Link>
          )}
          <Link
            to={`/dashboard/${tenant}/inventory/po`}
            className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition"
          >
            ← Back to List
          </Link>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid md:grid-cols-4 gap-6 mb-8">
        <div className="bg-gray-50 p-6 rounded-lg">
          <p className="text-sm text-gray-600">Status</p>
          <div className="mt-2">{getStatusBadge(po.status)}</div>
        </div>
        <div className="bg-gray-50 p-6 rounded-lg">
          <p className="text-sm text-gray-600">Order Date</p>
          <p className="text-2xl font-bold mt-2">{new Date(po.order_date).toLocaleDateString()}</p>
        </div>
        <div className="bg-gray-50 p-6 rounded-lg">
          <p className="text-sm text-gray-600">Expected Delivery</p>
          <p className="text-2xl font-bold mt-2">
            {po.expected_date ? new Date(po.expected_date).toLocaleDateString() : '—'}
          </p>
        </div>
        <div className="bg-green-50 p-6 rounded-lg border border-green-200">
          <p className="text-sm text-gray-600">Total Value (ex GST)</p>
          <p className="text-3xl font-bold text-green-700 mt-2">${po.total_value.toFixed(2)}</p>
        </div>
      </div>

      {/* Line Items */}
      <div className="bg-white rounded-xl shadow overflow-hidden mb-8">
        <div className="px-6 py-4 bg-gray-800 text-white">
          <h2 className="text-xl font-bold">Line Items</h2>
        </div>
        <table className="min-w-full">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-6 py-3 text-left">Item</th>
              <th className="px-6 py-3 text-right">Ordered</th>
              <th className="px-6 py-3 text-right">Received</th>
              <th className="px-6 py-3 text-right">Price</th>
              <th className="px-6 py-3 text-right">Line Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {/* Placeholder — full lines will come from API */}
            <tr>
              <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                Line items coming soon...
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Notes */}
      {po.notes && (
        <div className="bg-gray-50 p-6 rounded-lg">
          <p className="text-sm text-gray-600 font-bold mb-2">Notes</p>
          <p className="whitespace-pre-wrap">{po.notes}</p>
        </div>
      )}
    </div>
  );
}