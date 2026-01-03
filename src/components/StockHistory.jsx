import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';

export default function StockHistory() {
  const { tenant, itemId } = useParams();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [sortField, setSortField] = useState('date');
  const [sortDirection, setSortDirection] = useState('desc');

  useEffect(() => {
    fetch(`https://${tenant}.agrigrid.net/inventory3/api/stock-movements/${itemId}/`, { credentials: 'include' })
      .then(r => r.json())
      .then(data => {
        setHistory(data.movements || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [tenant, itemId]);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const sorted = [...history].sort((a, b) => {
    let aVal = a[sortField];
    let bVal = b[sortField];
    if (aVal instanceof Date) aVal = aVal.getTime();
    if (bVal instanceof Date) bVal = bVal.getTime();
    if (sortDirection === 'desc') return bVal > aVal ? 1 : -1;
    return aVal > bVal ? 1 : -1;
  });

  const filtered = sorted.filter(entry =>
    entry.source.toLowerCase().includes(filter.toLowerCase()) ||
    entry.notes.toLowerCase().includes(filter.toLowerCase())
  );

  if (loading) return <div className="text-center py-20 text-2xl">Loading stock history...</div>;

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Stock History</h1>
        <Link
          to={`/dashboard/${tenant}/inventory/items/${itemId}`}
          className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition"
        >
          ← Back to Item
        </Link>
      </div>

      <input
        type="text"
        placeholder="Filter by source or notes..."
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
        className="w-full max-w-md px-4 py-3 border rounded-lg mb-6"
      />

      <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
        <table className="min-w-full">
          <thead className="bg-gray-800 text-white">
            <tr>
              <th
                onClick={() => handleSort('date')}
                className="px-6 py-4 text-left cursor-pointer"
              >
                Date {sortField === 'date' && (sortDirection === 'asc' ? '↑' : '↓')}
              </th>
              <th
                onClick={() => handleSort('source')}
                className="px-6 py-4 text-left cursor-pointer"
              >
                Source {sortField === 'source' && (sortDirection === 'asc' ? '↑' : '↓')}
              </th>
              <th
                onClick={() => handleSort('quantity')}
                className="px-6 py-4 text-right cursor-pointer"
              >
                Quantity {sortField === 'quantity' && (sortDirection === 'asc' ? '↑' : '↓')}
              </th>
              <th
                onClick={() => handleSort('running_total')}
                className="px-6 py-4 text-right cursor-pointer"
              >
                Running Total {sortField === 'running_total' && (sortDirection === 'asc' ? '↑' : '↓')}
              </th>
              <th className="px-6 py-4 text-left">Notes</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                  No stock movements found
                </td>
              </tr>
            ) : (
              filtered.map(entry => (
                <tr key={entry.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">{new Date(entry.date).toLocaleString()}</td>
                  <td className="px-6 py-4">{entry.source}</td>
                  <td className={`px-6 py-4 text-right font-bold ${entry.quantity > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {entry.quantity > 0 ? '+' : ''}{entry.quantity.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 text-right font-bold">
                    {entry.running_total.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{entry.notes || '—'}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}