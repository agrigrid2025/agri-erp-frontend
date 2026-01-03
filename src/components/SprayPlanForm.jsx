import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';

export default function SprayPlanForm() {
  const { tenant } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    block: '',
    target_pest: '',
    scheduled_date: '',
    equipment: '',
    notes: '',
    products: [],
  });

  const [blocks, setBlocks] = useState([]);
  const [equipment, setEquipment] = useState([]);
  const [items, setItems] = useState([]);
  const [equipmentStatus, setEquipmentStatus] = useState({});
  const [forecast, setForecast] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const loadData = async () => {
      try {
        const [blockRes, eqRes, itemRes] = await Promise.all([
          fetch(`https://${tenant}.agrigrid.net/agrimap/api/blocks/`, { credentials: 'include' }),
          fetch(`https://${tenant}.agrigrid.net/equipment/api/equipment/`, { credentials: 'include' }),
          fetch(`https://${tenant}.agrigrid.net/inventory3/api/items/`, { credentials: 'include' }),
        ]);

        const [blockData, eqData, itemData] = await Promise.all([
          blockRes.json(),
          eqRes.json(),
          itemRes.json(),
        ]);

        setBlocks(blockData.blocks || []);
        setEquipment(eqData.equipment || []);
        setItems(itemData.items || []);
      } catch (err) {
        console.error(err);
        setMessage('Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [tenant]);

  const updateForecast = () => {
    const blockId = formData.block;
    const scheduled = formData.scheduled_date;
    if (blockId && scheduled) {
      fetch(`/spray/forecast-preview/?block=${blockId}&scheduled_date=${encodeURIComponent(scheduled)}`)
        .then(r => r.text())
        .then(html => setForecast(html))
        .catch(() => setForecast('<p className="text-red-600">Failed to load forecast</p>'));
    } else {
      setForecast('<p className="text-gray-600">Select block and time above</p>');
    }
  };

  const updateEquipmentStatus = () => {
    const equipId = formData.equipment;
    if (!equipId) {
      setEquipmentStatus({});
      return;
    }

    const equip = equipment.find(e => e.id == equipId);
    if (!equip) {
      setEquipmentStatus({});
      return;
    }

    const today = new Date();

    // Service status
    let serviceStatus = 'Good';
    if (equip.next_service_due) {
      const nextService = new Date(equip.next_service_due);
      const days = Math.ceil((nextService - today) / (1000 * 60 * 60 * 24));
      if (days <= 7) serviceStatus = 'Do Not Use';
      else if (days <= 30) serviceStatus = 'Caution';
    }

    // Calibration status
    let calStatus = 'Good';
    if (equip.calibration_expiry) {
      const calExpiry = new Date(equip.calibration_expiry);
      const days = Math.ceil((calExpiry - today) / (1000 * 60 * 60 * 24));
      if (days <= 7) calStatus = 'Do Not Use';
      else if (days <= 30) calStatus = 'Caution';
    }

    setEquipmentStatus({
      service: serviceStatus,
      calibration: calStatus,
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (name === 'block' || name === 'scheduled_date') updateForecast();
    if (name === 'equipment') updateEquipmentStatus();
  };

  const addProduct = () => {
    setFormData(prev => ({
      ...prev,
      products: [...prev.products, { item: '', amount: '' }],
    }));
  };

  const updateProduct = (index, field, value) => {
    const newProducts = [...formData.products];
    newProducts[index][field] = value;
    setFormData(prev => ({ ...prev, products: newProducts }));
  };

  const removeProduct = (index) => {
    setFormData(prev => ({
      ...prev,
      products: prev.products.filter((_, i) => i !== index),
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage('');
    try {
      // Placeholder — add real save API when ready
      console.log('Saving plan:', formData);
      setMessage('Spray plan saved successfully! (placeholder)');
      setTimeout(() => navigate(`/dashboard/${tenant}/spray/plans`), 1500);
    } catch (err) {
      setMessage('Save failed');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="text-center py-20 text-2xl">Loading form...</div>;

  return (
    <div className="max-w-5xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8">New Spray Plan</h1>

      <div className="bg-white rounded-2xl shadow-xl p-8 space-y-8">
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="block font-semibold mb-2 text-green-700">Block / Paddock *</label>
            <select
              name="block"
              value={formData.block}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500"
            >
              <option value="">Select block</option>
              {blocks.map(block => (
                <option key={block.id} value={block.id}>{block.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block font-semibold mb-2 text-red-700">Target Pest / Disease *</label>
            <input
              type="text"
              name="target_pest"
              value={formData.target_pest}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500"
            />
          </div>
        </div>

        <div className="flex items-end gap-6">
          <div className="flex-1 max-w-md">
            <label className="block font-semibold mb-3 text-lg text-gray-800">Equipment to Use *</label>
            <select
              name="equipment"
              value={formData.equipment}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 text-base"
            >
              <option value="">Select equipment</option>
              {equipment.map(eq => (
                <option key={eq.id} value={eq.id}>{eq.name}</option>
              ))}
            </select>
          </div>

          {equipmentStatus.service && (
            <div className={`text-center px-6 py-3 rounded-xl font-bold text-white shadow-lg ${
              equipmentStatus.service === 'Good' ? 'bg-emerald-400' :
              equipmentStatus.service === 'Caution' ? 'bg-amber-400' :
              'bg-rose-400'
            }`}>
              <div className="text-xs opacity-90">Service</div>
              <div className="text-base">{equipmentStatus.service}</div>
            </div>
          )}

          {equipmentStatus.calibration && (
            <div className={`text-center px-6 py-3 rounded-xl font-bold text-white shadow-lg ${
              equipmentStatus.calibration === 'Good' ? 'bg-emerald-400' :
              equipmentStatus.calibration === 'Caution' ? 'bg-amber-400' :
              'bg-rose-400'
            }`}>
              <div className="text-xs opacity-90">Calibration</div>
              <div className="text-base">{equipmentStatus.calibration}</div>
            </div>
          )}
        </div>

        <hr className="my-8 border-green-500" />

        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="block font-semibold mb-2">Scheduled Date & Time *</label>
            <input
              type="datetime-local"
              name="scheduled_date"
              value={formData.scheduled_date}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500"
            />
          </div>
          <div>
            <label className="block font-semibold mb-2">Notes (optional)</label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows="4"
              className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500"
            />
          </div>
        </div>

        <div className="text-center">
          <div dangerouslySetInnerHTML={{ __html: forecast || '<p className="text-gray-600">Select block and time above</p>' }} />
        </div>

        <hr className="my-8 border-green-500" />

        <div className="flex justify-between items-center mb-4">
          <h3 className="text-2xl font-bold text-green-700">Products to Apply</h3>
          <button type="button" onClick={addProduct} className="px-8 py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg shadow">
            + Add Product
          </button>
        </div>

        <div className="space-y-4">
          {formData.products.map((prod, index) => (
            <div key={index} className="grid grid-cols-1 md:grid-cols-12 gap-4 p-4 bg-gray-50 rounded-lg items-center">
              <div className="md:col-span-8">
                <select
                  value={prod.item}
                  onChange={(e) => updateProduct(index, 'item', e.target.value)}
                  className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500"
                >
                  <option value="">Select item</option>
                  {items.map(item => (
                    <option key={item.id} value={item.id}>
                      {item.sku} — {item.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="md:col-span-3">
                <input
                  type="number"
                  value={prod.amount}
                  onChange={(e) => updateProduct(index, 'amount', e.target.value)}
                  step="0.001"
                  placeholder="Amount L/ha"
                  className="w-full px-4 py-3 border rounded-lg text-right focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div className="md:col-span-1 text-center">
                <button type="button" onClick={() => removeProduct(index)} className="text-red-600 hover:text-red-800 font-bold">
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-10 flex justify-end gap-4">
          <Link to={`/dashboard/${tenant}/spray/plans`} className="px-8 py-4 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">
            Cancel
          </Link>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="px-12 py-4 bg-green-600 hover:bg-green-700 text-white font-bold text-xl rounded-lg shadow-lg"
          >
            {saving ? 'Saving...' : 'Save Spray Plan'}
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