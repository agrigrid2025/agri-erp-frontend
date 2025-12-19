import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';

export default function IncidentTypeForm() {
  const { tenant } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const isEdit = location.pathname.includes('/edit/');
  const typeId = isEdit ? location.pathname.split('/').pop() : null;

  const [formData, setFormData] = useState({
    name: '',
    description: '',
  });
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (isEdit && typeId) {
      fetch(`https://${tenant}.agrigrid.net/agrisafe/api/incident-types/`, { credentials: 'include' })
        .then(r => r.json())
        .then(data => {
          const type = data.types.find(t => t.id === parseInt(typeId));
          if (type) {
            setFormData({
              name: type.name,
              description: type.description || '',
            });
          }
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, [isEdit, typeId, tenant]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage('');
    try {
      const res = await fetch(`https://${tenant}.agrigrid.net/agrisafe/api/incident-type/save/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, id: isEdit ? typeId : undefined }),
        credentials: 'include',
      });
      const data = await res.json();
      if (data.success) {
        setMessage('Incident type saved!');
        setTimeout(() => navigate(`/dashboard/${tenant}/safety/incident-types`), 1500);
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
        {isEdit ? 'Edit Incident Type' : 'Add New Incident Type'}
      </h1>

      <div className="bg-white rounded-2xl shadow-xl p-8 space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Name *</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows="4"
            className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500"
          />
        </div>

        <div className="flex justify-end gap-4 pt-6">
          <Link
            to={`/dashboard/${tenant}/safety/incident-types`}
            className="px-8 py-4 border border-gray-300 rounded-xl text-lg font-medium hover:bg-gray-50 transition"
          >
            Cancel
          </Link>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-12 py-4 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white font-bold rounded-xl text-lg transition"
          >
            {saving ? 'Saving...' : 'Save Type'}
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