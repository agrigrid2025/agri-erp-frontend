import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation, Link } from 'react-router-dom';

export default function EquipmentForm() {
  const { tenant } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const isEdit = location.pathname.includes('/edit/');
  const equipId = isEdit ? location.pathname.split('/').pop() : null;

  const [formData, setFormData] = useState({
    name: '',
    fleet_number: '',
    equipment_type: '',
    make: '',
    model: '',
    registration_number: '',
    serial_number: '',
    boom_width_metres: '',
    tank_capacity_litres: '',
    pump_flow_lpm: '',
    purchase_date: '',
    warranty_expiry: '',
    last_service_date: '',
    next_service_due: '',
    requires_calibration: false,
    calibration_expiry: '',
    is_active: true,
    notes: '',
  });

  const [types, setTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    // Load equipment types
    fetch(`https://${tenant}.agrigrid.net/equipment/api/equipment-types/`, { credentials: 'include' })
      .then(r => r.json())
      .then(data => setTypes(data.types || []));

    if (isEdit && equipId) {
      // Load existing equipment
      fetch(`https://${tenant}.agrigrid.net/equipment/api/equipment/`, { credentials: 'include' })
        .then(r => r.json())
        .then(data => {
          const eq = data.equipment.find(e => e.id === parseInt(equipId));
          if (eq) {
            setFormData({
              name: eq.name,
              fleet_number: eq.fleet_number || '',
              equipment_type: eq.type || '',
              make: eq.make,
              model: eq.model,
              registration_number: eq.registration_number || '',
              serial_number: eq.serial_number || '',
              boom_width_metres: eq.boom_width_metres || '',
              tank_capacity_litres: eq.tank_capacity_litres || '',
              pump_flow_lpm: eq.pump_flow_lpm || '',
              purchase_date: eq.purchase_date || '',
              warranty_expiry: eq.warranty_expiry || '',
              last_service_date: eq.last_service_date || '',
              next_service_due: eq.next_service_due || '',
              requires_calibration: eq.requires_calibration || false,
              calibration_expiry: eq.calibration_expiry || '',
              is_active: eq.is_active,
              notes: eq.notes || '',
            });
          }
          setLoading(false);
        })
        .catch(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [isEdit, equipId, tenant]);

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
      const url = `https://${tenant}.agrigrid.net/equipment/api/equipment/save/`;

      const payload = {
        ...formData,
        id: isEdit ? equipId : undefined,
        equipment_type: formData.equipment_type || null,
        boom_width_metres: formData.boom_width_metres || null,
        tank_capacity_litres: formData.tank_capacity_litres || null,
        pump_flow_lpm: formData.pump_flow_lpm || null,
        purchase_date: formData.purchase_date || null,
        warranty_expiry: formData.warranty_expiry || null,
        last_service_date: formData.last_service_date || null,
        next_service_due: formData.next_service_due || null,
        calibration_expiry: formData.calibration_expiry || null,
      };

      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        credentials: 'include',
      });
      const data = await res.json();
      if (data.success) {
        setMessage('Equipment saved successfully!');
        setTimeout(() => navigate(`/dashboard/${tenant}/equipment`), 1500);
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
    <div className="max-w-5xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8">
        {isEdit ? 'Edit Equipment' : 'Add New Equipment'}
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
            <label className="block text-sm font-medium text-gray-700 mb-2">Fleet Number</label>
            <input
              type="text"
              name="fleet_number"
              value={formData.fleet_number}
              onChange={handleChange}
              className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Equipment Type</label>
            <select
              name="equipment_type"
              value={formData.equipment_type}
              onChange={handleChange}
              className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500"
            >
              <option value="">Select type</option>
              {types.map(type => (
                <option key={type.id} value={type.id}>{type.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Make</label>
            <input
              type="text"
              name="make"
              value={formData.make}
              onChange={handleChange}
              className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Model</label>
            <input
              type="text"
              name="model"
              value={formData.model}
              onChange={handleChange}
              className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Registration Number</label>
            <input
              type="text"
              name="registration_number"
              value={formData.registration_number}
              onChange={handleChange}
              className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Serial Number</label>
          <input
            type="text"
            name="serial_number"
            value={formData.serial_number}
            onChange={handleChange}
            className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Boom Width (m)</label>
            <input
              type="number"
              name="boom_width_metres"
              value={formData.boom_width_metres}
              onChange={handleChange}
              step="0.01"
              className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Tank Capacity (L)</label>
            <input
              type="number"
              name="tank_capacity_litres"
              value={formData.tank_capacity_litres}
              onChange={handleChange}
              className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Pump Flow (L/min)</label>
            <input
              type="number"
              name="pump_flow_lpm"
              value={formData.pump_flow_lpm}
              onChange={handleChange}
              step="0.1"
              className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Purchase Date</label>
            <input
              type="date"
              name="purchase_date"
              value={formData.purchase_date}
              onChange={handleChange}
              className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Warranty Expiry</label>
            <input
              type="date"
              name="warranty_expiry"
              value={formData.warranty_expiry}
              onChange={handleChange}
              className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Last Service Date</label>
            <input
              type="date"
              name="last_service_date"
              value={formData.last_service_date}
              onChange={handleChange}
              className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Next Service Due</label>
            <input
              type="date"
              name="next_service_due"
              value={formData.next_service_due}
              onChange={handleChange}
              className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500"
            />
          </div>
        </div>

        <div className="space-y-4">
          <label className="flex items-center gap-4">
            <input
              type="checkbox"
              name="requires_calibration"
              checked={formData.requires_calibration}
              onChange={handleChange}
              className="h-5 w-5 text-green-600 rounded"
            />
            <span className="text-gray-700">Requires Calibration</span>
          </label>
          {formData.requires_calibration && (
            <div className="ml-8">
              <label className="block text-sm font-medium text-gray-700 mb-2">Calibration Expiry</label>
              <input
                type="date"
                name="calibration_expiry"
                value={formData.calibration_expiry}
                onChange={handleChange}
                className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500"
              />
            </div>
          )}
          <label className="flex items-center gap-4">
            <input
              type="checkbox"
              name="is_active"
              checked={formData.is_active}
              onChange={handleChange}
              className="h-5 w-5 text-green-600 rounded"
            />
            <span className="text-gray-700">Active</span>
          </label>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
          <textarea
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            rows="4"
            className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500"
          />
        </div>

        <div className="flex justify-end gap-4 pt-6">
          <Link
            to={`/dashboard/${tenant}/equipment`}
            className="px-8 py-4 border border-gray-300 rounded-xl text-lg font-medium hover:bg-gray-50 transition"
          >
            Cancel
          </Link>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-12 py-4 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white font-bold rounded-xl text-lg transition"
          >
            {saving ? 'Saving...' : 'Save Equipment'}
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