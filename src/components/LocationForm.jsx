// src/components/LocationForm.jsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';

export default function LocationForm() {
  const { tenant } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const isEdit = location.pathname.includes('/edit/');
  const locId = isEdit ? location.pathname.split('/').pop() : null;

  const [formData, setFormData] = useState({
    warehouse: '',
    code: '',
    name: '',
    is_active: true,
  });
  const [warehouses, setWarehouses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    // Load warehouses for dropdown
    fetch(`https://${tenant}.agrigrid.net/inventory3/api/warehouses/`, { credentials: 'include' })
      .then(r => r.json())
      .then(data => setWarehouses(data.warehouses || []));

    if (isEdit && locId) {
      fetch(`https://${tenant}.agrigrid.net/inventory3/api/locations/`, { credentials: 'include' })
        .then(r => r.json())
        .then(data => {
          const loc = data.locations.find(l => l.id === parseInt(locId));
          if (loc) {
            setFormData({
              warehouse: loc.warehouse__id || '',
              code: loc.code,
              name: loc.name || '',
              is_active: loc.is_active,
            });
          }
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, [isEdit, locId, tenant]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage('');
    try {
      const res = await fetch(`https://${tenant}.agrigrid.net/inventory3/api/location/save/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, id: isEdit ? locId : undefined }),
        credentials: 'include',
      });
      const data = await res.json();
      if (data.success) {
        setMessage('Location saved!');
        setTimeout(() => navigate(`/dashboard/${tenant}/inventory/locations`), 1500);
      } else {
        setMessage(data.error || 'Save failed');
      }
    } catch (err) {
      setMessage('Network error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="text-center py-20">Loading...</div>;

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8">
        {isEdit ? 'Edit Location' : 'Add New Location'}
      </h1>

      <div className="bg-white rounded-2xl shadow-xl p-8 space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Warehouse *</label>
          <select
            name="warehouse"
            value={formData.warehouse}
            onChange={handleChange}
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
          <label className="block text-sm font-medium text-gray-700 mb-2">Code *</label>
          <input
            type="text"
            name="code"
            value={formData.code}
            onChange={handleChange}
            required
            className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500"
          />
        </div>

        <div className="flex items-center gap-4">
          <input
            type="checkbox"
            name="is_active"
            checked={formData.is_active}
            onChange={handleChange}
            className="h-5 w-5 text-green-600 rounded"
          />
          <label className="text-gray-700">Active</label>
        </div>

        <div className="flex justify-end gap-4 pt-6">
          <Link
            to={`/dashboard/${tenant}/inventory/locations`}
            className="px-8 py-4 border border-gray-300 rounded-xl text-lg font-medium hover:bg-gray-50 transition"
          >
            Cancel
          </Link>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-12 py-4 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white font-bold rounded-xl text-lg transition"
          >
            {saving ? 'Saving...' : 'Save Location'}
          </button>
        </div>

        {message && (
          <p className={`text-center text-xl font-medium mt-8 ${message.includes('saved') ? 'text-green-600' : 'text-red-600'}`}>
            {message}
          </p>
        )}
      </div>
    </div>
  );
}