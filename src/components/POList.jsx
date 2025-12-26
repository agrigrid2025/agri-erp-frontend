import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';

export default function POList() {
  const { tenant } = useParams();
  const [pos, setPos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`https://${tenant}.agrigrid.net/inventory3/api/pos/`, { credentials: 'include' })
      .then(r => r.json())
      .then(data => {
        setPos(data.pos || []);
        setLoading(false);
      });
  }, [tenant]);

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

  if (loading) return <div className="text-center py-20">Loading POs...</div>;

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="bg-white rounded-xl shadow-lg p-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Purchase Orders</h1>
          <Link to={`/dashboard/${tenant}/inventory/po/new`} className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg">
            + New PO
          </Link>
        </div>

        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-800 text-white">
            <tr>
              <th className="px-6 py-4 text-left">PO #</th>
              <th className="px-6 py-4 text-left">Supplier</th>
              <th className="px-6 py-4 text-left">Date</th>
              <th className="px-6 py-4 text-center">Status</th>
              <th className="px-6 py-4 text-right">Value (ex GST)</th>
              <th className="px-6 py-4 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {pos.length === 0 ? (
              <tr>
                <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                  No purchase orders yet
                </td>
              </tr>
            ) : (
              pos.map(po => (
                <tr key={po.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-mono font-medium">
                    <Link to={`/dashboard/${tenant}/inventory/po/${po.id}`} className="text-indigo-600 hover:text-indigo-800">
                      {po.po_number}
                    </Link>
                  </td>
                  <td className="px-6 py-4">{po.supplier}</td>
                  <td className="px-6 py-4">{new Date(po.order_date).toLocaleDateString()}</td>
                  <td className="px-6 py-4 text-center">{getStatusBadge(po.status)}</td>
                  <td className="px-6 py-4 text-right font-mono">${po.total_value.toFixed(2)}</td>
                  <td className="px-6 py-4 text-center space-x-4">
                    <Link to={`/dashboard/${tenant}/inventory/po/${po.id}`} className="text-indigo-600 hover:text-indigo-800">
                      View
                    </Link>
                    {po.status !== 'received' && po.status !== 'cancelled' && (
                      <Link to={`/dashboard/${tenant}/inventory/po/${po.id}/receipt`} className="text-green-600 hover:text-green-800">
                        Receipt
                      </Link>
                    )}
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