import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';

export default function SuppliersList() {
  const { tenant } = useParams();
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetch(`https://${tenant}.agrigrid.net/suppliers/api/suppliers/`, { credentials: 'include' })
      .then(r => r.json())
      .then(data => {
        setSuppliers(data.suppliers || []);
        setLoading(false);
      });
  }, [tenant]);

  const filtered = suppliers.filter(sup =>
    sup.name.toLowerCase().includes(search.toLowerCase()) ||
    sup.code.toLowerCase().includes(search.toLowerCase()) ||
    sup.contact_person.toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = async (id, name) => {
    if (!confirm(`Delete supplier "${name}"?`)) return;
    await fetch(`https://${tenant}.agrigrid.net/suppliers/api/supplier/delete/${id}/`, {
      method: 'POST',
      credentials: 'include',
    });
    setSuppliers(suppliers.filter(s => s.id !== id));
  };

  if (loading) return <div className="text-center py-20">Loading suppliers...</div>;

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="bg-white rounded-2xl shadow-xl p-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Suppliers</h1>
          <Link to={`/dashboard/${tenant}/inventory/suppliers/add`} className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg">
            + Add Supplier
          </Link>
        </div>

        <input
          type="text"
          placeholder="Search suppliers..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full max-w-md px-4 py-3 border rounded-lg mb-6"
        />

        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Code</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Contact</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Phone</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">City</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan="7" className="px-6 py-12 text-center text-gray-500">
                  No suppliers found
                </td>
              </tr>
            ) : (
              filtered.map(sup => (
                <tr key={sup.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-medium">{sup.name}</td>
                  <td className="px-6 py-4 text-sm">{sup.code || '—'}</td>
                  <td className="px-6 py-4 text-sm">{sup.contact_person || '—'}</td>
                  <td className="px-6 py-4 text-sm">{sup.phone || sup.mobile || '—'}</td>
                  <td className="px-6 py-4 text-sm">{sup.city || '—'}</td>
                  <td className="px-6 py-4 text-sm">
                    {sup.is_active ? 'Active' : 'Inactive'}
                  </td>
                  <td className="px-6 py-4 text-sm space-x-4">
                    <Link to={`/dashboard/${tenant}/inventory/suppliers/edit/${sup.id}`} className="text-blue-600 hover:underline">
                      Edit
                    </Link>
                    <button onClick={() => handleDelete(sup.id, sup.name)} className="text-red-600 hover:underline">
                      Delete
                    </button>
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