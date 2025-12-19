import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';

export default function HazardForm() {
  const { tenant } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const isEdit = location.pathname.includes('/edit/');
  const hazardId = isEdit ? location.pathname.split('/').pop() : null;

  const [formData, setFormData] = useState({
    hazard_type: '',
    location: '',
    gps_coordinates: '',
    description: '',
    risk_level: 'medium',
    assigned_to: '',
    due_date: '',
  });
  const [hazardTypes, setHazardTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    // Load hazard types
    fetch(`https://${tenant}.agrigrid.net/agrisafe/api/hazard-types/`, { credentials: 'include' })
      .then(r => r.json())
      .then(data => setHazardTypes(data.types || []));

    if (isEdit && hazardId) {
      // Load existing hazard
      fetch(`https://${tenant}.agrigrid.net/agrisafe/api/hazards/`, { credentials: 'include' })
        .then(r => r.json())
        .then(data => {
          const hazard = data.hazards.find(h => h.id === parseInt(hazardId));
          if (hazard) {
            setFormData({
              hazard_type: hazard.typeId || '',
              location: hazard.location,
              gps_coordinates: hazard.gps || '',
              description: hazard.description,
              risk_level: hazard.riskLevel,
              assigned_to: hazard.assignedToId || '',
              due_date: hazard.dueDate || '',
            });
          }
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, [isEdit, hazardId, tenant]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const getLocation = () => {
    if (!navigator.geolocation) {
      setMessage('Geolocation not supported by your browser');
      return;
    }
    setMessage('Fetching location...');
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const coords = `${position.coords.latitude.toFixed(6)},${position.coords.longitude.toFixed(6)}`;
        setFormData(prev => ({ ...prev, gps_coordinates: coords }));
        setMessage('Location captured');
      },
      () => setMessage('Unable to retrieve location')
    );
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage('');
    try {
      const url = isEdit
        ? `https://${tenant}.agrigrid.net/agrisafe/api/hazard/update/${hazardId}/`
        : `https://${tenant}.agrigrid.net/agrisafe/api/hazard/save/`;

      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
        credentials: 'include',
      });
      const data = await res.json();
      if (data.success) {
        setMessage('Hazard saved successfully!');
        setTimeout(() => navigate(`/dashboard/${tenant}/safety/hazards`), 1500);
      } else {
        setMessage(data.error || 'Save failed');
      }
    } catch (err) {
      setMessage('Network error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="text-center py-20 text-2xl">Loading form...</div>;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8">
        {isEdit ? 'Edit Hazard' : 'Report Hazard'}
      </h1>

      <div className="bg-white rounded-2xl shadow-xl p-8 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Hazard Type *</label>
            <select
              name="hazard_type"
              value={formData.hazard_type}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500"
            >
              <option value="">Select hazard type</option>
              {hazardTypes.map(type => (
                <option key={type.id} value={type.id}>{type.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Location *</label>
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">GPS Coordinates</label>
          <div className="flex gap-4">
            <input
              type="text"
              name="gps_coordinates"
              value={formData.gps_coordinates}
              onChange={handleChange}
              placeholder="-17.1234,145.6789"
              className="flex-1 px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500"
            />
            <button
              type="button"
              onClick={getLocation}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition"
            >
              📍 Use My Location
            </button>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Description *</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows="4"
            required
            className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Risk Level *</label>
            <select
              name="risk_level"
              value={formData.risk_level}
              onChange={handleChange}
              className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="critical">Critical</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Assigned To</label>
            <input
              type="text"
              name="assigned_to"
              value={formData.assigned_to}
              onChange={handleChange}
              className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Due Date</label>
            <input
              type="date"
              name="due_date"
              value={formData.due_date}
              onChange={handleChange}
              className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500"
            />
          </div>
        </div>

        <div className="flex justify-end gap-4 pt-6">
          <Link
            to={`/dashboard/${tenant}/safety/hazards`}
            className="px-8 py-4 border border-gray-300 rounded-xl text-lg font-medium hover:bg-gray-50 transition"
          >
            Cancel
          </Link>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-12 py-4 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white font-bold rounded-xl text-lg transition"
          >
            {saving ? 'Saving...' : 'Save Hazard'}
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