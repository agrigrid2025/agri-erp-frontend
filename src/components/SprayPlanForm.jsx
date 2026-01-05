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
  const [forecastData, setForecastData] = useState(null);
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

        updateEquipmentStatus();
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
      fetch(`https://${tenant}.agrigrid.net/spray/api/forecast-data/?block=${blockId}&scheduled_date=${encodeURIComponent(scheduled)}`, { credentials: 'include' })
        .then(r => r.json())
        .then(data => setForecastData(data.forecast || null))
        .catch(() => setForecastData(null));
    } else {
      setForecastData(null);
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

    let serviceStatus = 'No date set';
    if (equip.next_service_due) {
      const nextService = new Date(equip.next_service_due);
      const days = Math.ceil((nextService - today) / (1000 * 60 * 60 * 24));
      if (days <= 7) serviceStatus = 'Do Not Use';
      else if (days <= 30) serviceStatus = 'Caution';
      else serviceStatus = 'Good';
    }

    let calStatus = 'No date set';
    if (equip.calibration_expiry) {
      const calExpiry = new Date(equip.calibration_expiry);
      const days = Math.ceil((calExpiry - today) / (1000 * 60 * 60 * 24));
      if (days <= 7) calStatus = 'Do Not Use';
      else if (days <= 30) calStatus = 'Caution';
      else calStatus = 'Good';
    }

    setEquipmentStatus({
      service: serviceStatus,
      calibration: calStatus,
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
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

  const suitability = forecastData?.suitability;
  const target = forecastData?.target;
  const hourly = forecastData?.hourly || [];

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-4xl font-bold text-center mb-10 text-gray-800">New Spray Plan</h1>

      <div className="bg-white rounded-3xl shadow-2xl p-10 space-y-10">
        {/* Block & Target Pest */}
        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <label className="block text-lg font-semibold text-green-700 mb-3">Block / Paddock *</label>
            <select
              name="block"
              value={formData.block}
              onChange={handleChange}
              required
              className="w-full px-6 py-4 border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-green-300 focus:border-green-500 text-lg"
            >
              <option value="">Select block</option>
              {blocks.map(block => (
                <option key={block.id} value={block.id}>{block.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-lg font-semibold text-red-700 mb-3">Target Pest / Disease *</label>
            <input
              type="text"
              name="target_pest"
              value={formData.target_pest}
              onChange={handleChange}
              required
              placeholder="e.g. Aphids, Powdery Mildew"
              className="w-full px-6 py-4 border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-green-300 focus:border-green-500 text-lg"
            />
          </div>
        </div>

        {/* Equipment + Status */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-3xl p-10 border-2 border-blue-200">
          <label className="block text-xl font-bold text-gray-800 mb-6">Equipment to Use *</label>
          <div className="flex flex-wrap items-end gap-8">
            <div className="flex-1 min-w-80">
              <select
                name="equipment"
                value={formData.equipment}
                onChange={handleChange}
                required
                className="w-full px-6 py-4 border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-green-300 focus:border-green-500 text-lg"
              >
                <option value="">Select equipment</option>
                {equipment.map(eq => (
                  <option key={eq.id} value={eq.id}>{eq.name}</option>
                ))}
              </select>
            </div>

            {equipmentStatus.service && (
              <div className={`text-center px-8 py-6 rounded-2xl font-bold text-white shadow-xl transition-all ${
                equipmentStatus.service === 'Good' ? 'bg-emerald-500' :
                equipmentStatus.service === 'Caution' ? 'bg-amber-500' :
                equipmentStatus.service === 'Do Not Use' ? 'bg-rose-500' :
                'bg-gray-500'
              }`}>
                <div className="text-sm opacity-90">Service</div>
                <div className="text-2xl mt-1">{equipmentStatus.service}</div>
              </div>
            )}

            {equipmentStatus.calibration && (
              <div className={`text-center px-8 py-6 rounded-2xl font-bold text-white shadow-xl transition-all ${
                equipmentStatus.calibration === 'Good' ? 'bg-emerald-500' :
                equipmentStatus.calibration === 'Caution' ? 'bg-amber-500' :
                equipmentStatus.calibration === 'Do Not Use' ? 'bg-rose-500' :
                'bg-gray-500'
              }`}>
                <div className="text-sm opacity-90">Calibration</div>
                <div className="text-2xl mt-1">{equipmentStatus.calibration}</div>
              </div>
            )}
          </div>
        </div>

        {/* Scheduled + Update Button + Notes */}
        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <label className="block text-lg font-semibold text-gray-800 mb-3">Scheduled Date & Time *</label>
            <input
              type="datetime-local"
              name="scheduled_date"
              value={formData.scheduled_date}
              onChange={handleChange}
              required
              className="w-full px-6 py-4 border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-green-300 focus:border-green-500 text-lg"
            />
            <button
              type="button"
              onClick={updateForecast}
              className="mt-6 w-full px-8 py-5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xl rounded-xl shadow-2xl transition"
            >
              Update Forecast
            </button>
          </div>
          <div>
            <label className="block text-lg font-semibold text-gray-800 mb-3">Notes (optional)</label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows="8"
              placeholder="Additional notes about the spray plan..."
              className="w-full px-6 py-4 border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-green-300 focus:border-green-500 text-lg"
            />
          </div>
        </div>

        {/* Forecast Card */}
        {forecastData ? (
          <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-3xl shadow-2xl p-10 border-2 border-blue-200">
            <h3 className="text-3xl font-bold text-center text-blue-800 mb-8">Spray Window Forecast</h3>
            <div className="grid md:grid-cols-2 gap-10">
              {/* Left: Suitability + Hourly */}
              <div className="space-y-8">
                {/* Suitability Score */}
                <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
                  <div className="text-7xl font-bold text-blue-700 mb-4">{suitability.score}</div>
                  <div className="text-3xl font-bold text-blue-800 mb-4">{suitability.rating}</div>
                  {suitability.warnings.length > 0 && (
                    <div className="text-red-600 font-semibold">
                      {suitability.warnings.join(' • ')}
                    </div>
                  )}
                </div>

                {/* Hourly List */}
                <div className="bg-white rounded-2xl shadow-xl p-6">
                  <h4 className="text-2xl font-bold text-gray-800 mb-6 text-center">Hourly Window</h4>
                  <div className="space-y-4">
                    {hourly.map((h, i) => (
                      <div key={i} className={`p-5 rounded-xl ${h.is_target ? 'bg-blue-100 border-2 border-blue-400' : 'bg-gray-50'}`}>
                        <div className="flex justify-between items-center">
                          <div className="font-mono text-2xl font-bold">{h.time}</div>
                          <div className="text-right">
                            <div className="text-4xl font-bold text-gray-800">{h.temp}°</div>
                            <div className="text-sm text-gray-600 mt-1">
                              {h.rain}% rain • {h.wind}/{h.gust} km/h
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right: Parameter Cards */}
              <div className="grid grid-cols-2 gap-6">
                <div className="bg-white rounded-2xl shadow-xl p-6 text-center">
                  <div className="text-5xl font-bold text-blue-700">{target.rain}%</div>
                  <div className="text-lg text-gray-600 mt-2">Rain Chance</div>
                </div>
                <div className="bg-white rounded-2xl shadow-xl p-6 text-center">
                  <div className="text-5xl font-bold text-gray-700">{target.wind}<small className="text-3xl">/{target.gust}</small></div>
                  <div className="text-lg text-gray-600 mt-2">Wind / Gust (km/h)</div>
                </div>
                <div className="bg-white rounded-2xl shadow-xl p-6 text-center">
                  <div className="text-5xl font-bold text-purple-700">{target.visibility}</div>
                  <div className="text-lg text-gray-600 mt-2">Visibility (km)</div>
                </div>
                <div className="bg-white rounded-2xl shadow-xl p-6 text-center">
                  <div className="text-5xl font-bold text-yellow-700">UV {target.uv}</div>
                  <div className="text-lg text-gray-600 mt-2">UV Index</div>
                </div>
                <div className="bg-white rounded-2xl shadow-xl p-6 text-center">
                  <div className="text-5xl font-bold text-indigo-700">{target.cloud}%</div>
                  <div className="text-lg text-gray-600 mt-2">Cloud Cover</div>
                </div>
                <div className="bg-white rounded-2xl shadow-xl p-6 text-center">
                  <div className="text-5xl font-bold text-green-700">{target.humidity}%</div>
                  <div className="text-lg text-gray-600 mt-2">Humidity</div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-3xl shadow-2xl p-10 border-2 border-blue-200 text-center">
            <h3 className="text-3xl font-bold text-blue-800 mb-8">Spray Window Forecast</h3>
            <p className="text-xl text-gray-600">Select block and time, then click Update Forecast</p>
          </div>
        )}

        {/* Products */}
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-3xl p-10 border-2 border-green-200">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-3xl font-bold text-green-800">Products to Apply</h3>
            <button
              type="button"
              onClick={addProduct}
              className="px-8 py-4 bg-green-600 hover:bg-green-700 text-white font-bold text-lg rounded-xl shadow-2xl transition"
            >
              + Add Product
            </button>
          </div>

          <div className="space-y-8">
            {formData.products.length === 0 ? (
              <p className="text-center text-gray-600 py-16 text-xl">No products added yet</p>
            ) : (
              formData.products.map((prod, index) => (
                <div key={index} className="bg-white rounded-2xl shadow-xl p-8 border border-gray-200">
                  <div className="grid md:grid-cols-12 gap-6 items-end">
                    <div className="md:col-span-8">
                      <label className="block text-lg font-semibold text-gray-800 mb-3">Chemical / Product</label>
                      <select
                        value={prod.item}
                        onChange={(e) => updateProduct(index, 'item', e.target.value)}
                        className="w-full px-6 py-4 border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-green-300 focus:border-green-500 text-lg"
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
                      <label className="block text-lg font-semibold text-gray-800 mb-3">Amount (L/ha)</label>
                      <input
                        type="number"
                        value={prod.amount}
                        onChange={(e) => updateProduct(index, 'amount', e.target.value)}
                        step="0.001"
                        placeholder="0.000"
                        className="w-full px-6 py-4 border-2 border-gray-300 rounded-xl text-right focus:ring-4 focus:ring-green-300 focus:border-green-500 text-lg"
                      />
                    </div>
                    <div className="md:col-span-1 text-center">
                      <button
                        type="button"
                        onClick={() => removeProduct(index)}
                        className="text-5xl text-red-600 hover:text-red-800 font-bold transition"
                      >
                        ×
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-8 pt-10">
          <Link
            to={`/dashboard/${tenant}/spray/plans`}
            className="px-14 py-6 border-2 border-gray-400 rounded-xl text-2xl font-bold text-gray-700 hover:bg-gray-100 transition"
          >
            Cancel
          </Link>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="px-20 py-6 bg-green-600 hover:bg-green-700 disabled:opacity-70 text-white font-bold text-3xl rounded-xl shadow-2xl transition transform hover:scale-105"
          >
            {saving ? 'Saving...' : 'Save Spray Plan'}
          </button>
        </div>

        {message && (
          <div className={`text-center text-3xl font-bold mt-12 ${message.includes('success') ? 'text-green-600' : 'text-red-600'}`}>
            {message}
          </div>
        )}
      </div>
    </div>
  );
}