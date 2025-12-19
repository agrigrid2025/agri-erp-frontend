import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';

export default function CategoryList() {
  const { tenant } = useParams();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`https://${tenant}.agrigrid.net/inventory3/api/categories/`, { credentials: 'include' })
      .then(r => r.json())
      .then(data => {
        setCategories(data.categories || []);
        setLoading(false);
      });
  }, [tenant]);

  const handleDelete = async (id, name) => {
    if (!confirm(`Delete category "${name}"?`)) return;
    await fetch(`https://${tenant}.agrigrid.net/inventory3/api/category/delete/${id}/`, {
      method: 'POST',
      credentials: 'include',
    });
    setCategories(categories.filter(c => c.id !== id));
  };

  if (loading) return <div className="text-center py-20">Loading categories...</div>;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-2xl shadow-xl p-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Item Categories</h1>
          <Link to={`/dashboard/${tenant}/inventory/categories/add`} className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg">
            + Add Category
          </Link>
        </div>

        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {categories.length === 0 ? (
              <tr>
                <td colSpan="3" className="px-6 py-12 text-center text-gray-500">
                  No categories defined yet
                </td>
              </tr>
            ) : (
              categories.map(cat => (
                <tr key={cat.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-medium">{cat.name}</td>
                  <td className="px-6 py-4 text-sm">
                    {cat.is_active ? 'Active' : 'Inactive'}
                  </td>
                  <td className="px-6 py-4 text-sm space-x-4">
                    <Link to={`/dashboard/${tenant}/inventory/categories/edit/${cat.id}`} className="text-blue-600 hover:underline">
                      Edit
                    </Link>
                    <button onClick={() => handleDelete(cat.id, cat.name)} className="text-red-600 hover:underline">
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