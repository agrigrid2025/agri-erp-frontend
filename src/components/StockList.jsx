import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

export default function StockList() {
  const { tenant } = useParams();
  const [stock, setStock] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sortField, setSortField] = useState('sku');
  const [sortDirection, setSortDirection] = useState('asc');

  useEffect(() => {
    fetch(`https://${tenant}.agrigrid.net/inventory3/api/stock-by-location/`, { credentials: 'include' })
      .then(r => r.json())
      .then(data => {
        const flat = [];
        data.stock.forEach(entry => {
          entry.locations.forEach(loc => {
            flat.push({
              sku: entry.item.sku,
              name: entry.item.name,
              uom: entry.item.uom,
              warehouse: loc.warehouse,
              location: loc.location,
              batch: loc.batch_number,
              serial: loc.serial_number,
              qty: loc.quantity_on_hand,
            });
          });
        });
        setStock(flat);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [tenant]);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const sorted = [...stock].sort((a, b) => {
    let aVal = a[sortField];
    let bVal = b[sortField];
    if (typeof aVal === 'string') aVal = aVal.toLowerCase();
    if (typeof bVal === 'string') bVal = bVal.toLowerCase();
    if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
    if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  const filtered = sorted.filter(item =>
    item.sku.toLowerCase().includes(search.toLowerCase()) ||
    item.name.toLowerCase().includes(search.toLowerCase()) ||
    item.warehouse.toLowerCase().includes(search.toLowerCase()) ||
    item.location.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <div className="text-center py-20 text-2xl">Loading stock...</div>;

  return (
    <div className="max-w-7xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8">Stock by Location</h1>

      <input
        type="text"
        placeholder="Search stock..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full max-w-md px-4 py-3 border rounded-lg mb-6"
      />

      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th onClick={() => handleSort('sku')} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer">
              SKU {sortField === 'sku' && (sortDirection === 'asc' ? '↑' : '↓')}
            </th>
            <th onClick={() => handleSort('name')} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer">
              Name {sortField === 'name' && (sortDirection === 'asc' ? '↑' : '↓')}
            </th>
            <th onClick={() => handleSort('warehouse')} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer">
              Warehouse {sortField === 'warehouse' && (sortDirection === 'asc' ? '↑' : '↓')}
            </th>
            <th onClick={() => handleSort('location')} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer">
              Location {sortField === 'location' && (sortDirection === 'asc' ? '↑' : '↓')}
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Batch / Serial</th>
            <th onClick={() => handleSort('qty')} className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase cursor-pointer">
              Qty {sortField === 'qty' && (sortDirection === 'asc' ? '↑' : '↓')}
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">UOM</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {filtered.length === 0 ? (
            <tr>
              <td colSpan="7" className="px-6 py-12 text-center text-gray-500 text-lg">
                No stock found
              </td>
            </tr>
          ) : (
            filtered.map((row, idx) => (
              <tr key={idx} className="hover:bg-gray-50">
                <td className="px-6 py-4 text-sm font-medium">{row.sku}</td>
                <td className="px-6 py-4 text-sm">{row.name}</td>
                <td className="px-6 py-4 text-sm">{row.warehouse}</td>
                <td className="px-6 py-4 text-sm">{row.location}</td>
                <td className="px-6 py-4 text-sm">
                  {row.batch ? <span className="font-mono text-xs">B: {row.batch}</span> : ''}
                  {row.serial ? <span className="font-mono text-xs ml-2">S: {row.serial}</span> : ''}
                  {!row.batch && !row.serial ? '—' : ''}
                </td>
                <td className="px-6 py-4 text-right text-sm font-bold text-green-600">
                  {row.qty.toFixed(2)}
                </td>
                <td className="px-6 py-4 text-sm">{row.uom}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}