import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';

export default function CropTypeForm() {
  const { tenant } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const isEdit = location.pathname.includes('/edit/');
  const cropId = isEdit ? location.pathname.split('/').pop() : null;

  const [formData, setFormData] = useState({
    name: '',
    code: '',
    colour: '#10b981',
    default_row_spacing_m: '',
    default_plant_spacing_m: '',
    typical_yield_t_ha: '',
    requires_spray_diary: true,
    requires_fertiliser_records: true,
    has_withholding_periods: true,
  });
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (isEdit && cropId) {
      fetch(`https://${tenant}.agrigrid.net/agrimap/api/crop-types/`, { credentials: 'include' })
        .then(r => r.json())
        .then(data => {
          const crop = data.crops.find(c => c.id === parseInt(cropId));
          if (crop) {
            setFormData(crop);
          }
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, [isEdit, cropId, tenant]);

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
      const res = await fetch(`https://${tenant}.agrigrid.net/agrimap/api/crop-type/save/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, id: isEdit ? cropId : undefined }),
        credentials: 'include',
      });
      const data = await res.json();
      if (data.success) {
        setMessage('Crop type saved!');
        setTimeout(() => navigate(`/dashboard/${tenant}/crop-types`), 1500);
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
        {isEdit ? 'Edit Crop Type' : 'Add New Crop Type'}
      </h1>

      <div className="bg-white rounded-2xl shadow-xl p-8 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
            <label className="block text-sm font-medium text-gray-700 mb-2">Code</label>
            <input
              type="text"
              name="code"
              value={formData.code}
              onChange={handleChange}
              className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Colour</label>
          <div className="flex items-center gap-4">
            <input
              type="color"
              name="colour"
              value={formData.colour}
              onChange={handleChange}
              className="h-12 w-24 rounded cursor-pointer"
            />
            <span className="font-mono text-lg">{formData.colour}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Row Spacing (m)</label>
            <input
              type="number"
              name="default_row_spacing_m"
              value={formData.default_row_spacing_m}
              onChange={handleChange}
              step="0.01"
              className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Plant Spacing (m)</label>
            <input
              type="number"
              name="default_plant_spacing_m"
              value={formData.default_plant_spacing_m}
              onChange={handleChange}
              step="0.01"
              className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Typical Yield (t/ha)</label>
            <input
              type="number"
              name="typical_yield_t_ha"
              value={formData.typical_yield_t_ha}
              onChange={handleChange}
              step="0.01"
              className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500"
            />
          </div>
        </div>

        <div className="space-y-4">
          <label className="flex items-center gap-4">
            <input
              type="checkbox"
              name="requires_spray_diary"
              checked={formData.requires_spray_diary}
              onChange={handleChange}
              className="h-5 w-5 text-green-600 rounded"
            />
            <span className="text-gray-700">Spray Diary Required</span>
          </label>
          <label className="flex items-center gap-4">
            <input
              type="checkbox"
              name="requires_fertiliser_records"
              checked={formData.requires_fertiliser_records}
              onChange={handleChange}
              className="h-5 w-5 text-green-600 rounded"
            />
            <span className="text-gray-700">Fertiliser Records Required</span>
          </label>
          <label className="flex items-center gap-4">
            <input
              type="checkbox"
              name="has_withholding_periods"
              checked={formData.has_withholding_periods}
              onChange={handleChange}
              className="h-5 w-5 text-green-600 rounded"
            />
            <span className="text-gray-700">Has Withholding Periods</span>
          </label>
        </div>

        <div className="flex justify-end gap-4 pt-6">
          <Link
            to={`/dashboard/${tenant}/crop-types`}
            className="px-8 py-4 border border-gray-300 rounded-xl text-lg font-medium hover:bg-gray-50 transition"
          >
            Cancel
          </Link>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-12 py-4 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white font-bold rounded-xl text-lg transition"
          >
            {saving ? 'Saving...' : isEdit ? 'Update Crop Type' : 'Create Crop Type'}
          </button>
        </div>

        {message && (
          <p className={`text-center text-xl font-medium mt-8 ${message.includes('success') ? 'text-green-600' : 'text-red-600'}`}>
            {message}
          </p>
        )}
      </div>
    </div>
  );
}