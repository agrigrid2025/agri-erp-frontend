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
    applicator: '',
    notes: '',
    products: [],
  });

  const [blocks, setBlocks] = useState([]);
  const [equipment, setEquipment] = useState([]);
  const [items, setItems] = useState([]);
  const [sprayOperators, setSprayOperators] = useState([]);
  const [equipmentStatus, setEquipmentStatus] = useState({});
  const [forecastData, setForecastData] = useState(null);
  const [blockArea, setBlockArea] = useState(0);
  const [itemStock, setItemStock] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const loadData = async () => {
      try {
        const [blockRes, eqRes, itemRes, opRes] = await Promise.all([
          fetch(`https://${tenant}.agrigrid.net/agrimap/api/blocks/`, { credentials: 'include' }),
          fetch(`https://${tenant}.agrigrid.net/equipment/api/equipment/`, { credentials: 'include' }),
          fetch(`https://${tenant}.agrigrid.net/inventory3/api/items/`, { credentials: 'include' }),
          fetch(`https://${tenant}.agrigrid.net/api/users/spray-operators/`, { credentials: 'include' }),
        ]);

        const [blockData, eqData, itemData, opData] = await Promise.all([
          blockRes.json(),
          eqRes.json(),
          itemRes.json(),
          opRes.json(),
        ]);

        setBlocks(blockData.blocks || []);
        setEquipment(eqData.equipment || []);
        setItems(itemData.items || []);
        setSprayOperators(opData.operators || []);

        // Load stock
        const stockMap = {};
        itemData.items.forEach(item => {
          stockMap[item.id] = item.currentStock || 0;
        });
        setItemStock(stockMap);

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

    if (name === 'block') {
      const selectedBlock = blocks.find(b => b.id == value);
      setBlockArea(selectedBlock?.area_ha || 0);
    }
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

  const getTotalNeeded = (amount) => {
    if (!amount || blockArea === 0) return '—';
    return (parseFloat(amount) * blockArea).toFixed(3);
  };

  const getStockStatus = (itemId, amount) => {
    if (!itemId || !amount || blockArea === 0) return { text: '—', color: 'text-gray-500 bg-gray-100' };
    const stock = itemStock[itemId] || 0;
    const totalNeeded = parseFloat(amount) * blockArea;
    if (stock >= totalNeeded) return { text: 'In Stock', color: 'text-green-600 bg-green-100' };
    if (stock > 0) return { text: 'Limited Stock', color: 'text-amber-600 bg-amber-100' };
    return { text: 'Insufficient Stock', color: 'text-red-600 bg-red-100' };
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage('');
    try {
      const payload = {
        block: formData.block,
        target_pest: formData.target_pest,
        scheduled_date: formData.scheduled_date,
        equipment: formData.equipment || null,
        applicator: formData.applicator || null,
        notes: formData.notes,
        products: formData.products.filter(p => p.item && p.amount).map(p => ({
          item: p.item,
          amount: p.amount,
        })),
      };

      const res = await fetch(`https://${tenant}.agrigrid.net/spray/api/spray-plan/save/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        credentials: 'include',
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setMessage('Spray plan saved successfully!');
        setTimeout(() => navigate(`/dashboard/${tenant}/spray/plans`), 1500);
      } else {
        setMessage(data.error || 'Save failed');
      }
    } catch (err) {
      console.error(err);
      setMessage('Network error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="text-center py-20 text-2xl">Loading form...</div>;

  const suitability = forecastData?.suitability;
  const target = forecastData?.target;
  const hourly = forecastData?.hourly || [];

  return (
    <div className="max-w-7xl mx-auto p-6">
      <h1 className="text-4xl font-bold text-center mb-12 text-gray-800">New Spray Plan</h1>

      <div className="bg-white rounded-3xl shadow-2xl p-12 space-y-12">
        {/* Block & Target Pest */}
        <div className="grid md:grid-cols-2 gap-10">
          <div>
            <label className="block text-xl font-bold text-green-700 mb-4">Block / Paddock *</label>
            <select
              name="block"
              value={formData.block}
              onChange={handleChange}
              required
              className="w-full px-8 py-5 border-2 border-gray-300 rounded-2xl focus:ring-4 focus:ring-green-300 focus:border-green-500 text-xl"
            >
              <option value="">Select block</option>
              {blocks.map(block => (
                <option key={block.id} value={block.id}>{block.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xl font-bold text-red-700 mb-4">Target Pest / Disease *</label>
            <input
              type="text"
              name="target_pest"
              value={formData.target_pest}
              onChange={handleChange}
              required
              placeholder="e.g. Aphids, Powdery Mildew"
              className="w-full px-8 py-5 border-2 border-gray-300 rounded-2xl focus:ring-4 focus:ring-green-300 focus:border-green-500 text-xl"
            />
          </div>
        </div>

        {/* Planned Applicator */}
        <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-3xl p-10 border-2 border-purple-200">
          <label className="block text-2xl font-bold text-gray-800 mb-6">Planned Applicator *</label>
          <select
            name="applicator"
            value={formData.applicator}
            onChange={handleChange}
            required
            className="w-full px-8 py-5 border-2 border-gray-300 rounded-2xl focus:ring-4 focus:ring-purple-300 focus:border-purple-500 text-xl"
          >
            <option value="">Select applicator</option>
            {sprayOperators.map(op => (
              <option key={op.id} value={op.id}>
                {op.first_name} {op.last_name} ({op.username})
              </option>
            ))}
          </select>
        </div>

        {/* Equipment + Status */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-3xl p-10 border-2 border-blue-200">
          <label className="block text-2xl font-bold text-gray-800 mb-6">Equipment to Use *</label>
          <div className="flex flex-wrap items-end gap-10">
            <div className="flex-1 min-w-96">
              <select
                name="equipment"
                value={formData.equipment}
                onChange={handleChange}
                required
                className="w-full px-8 py-5 border-2 border-gray-300 rounded-2xl focus:ring-4 focus:ring-green-300 focus:border-green-500 text-xl"
              >
                <option value="">Select equipment</option>
                {equipment.map(eq => (
                  <option key={eq.id} value={eq.id}>{eq.name}</option>
                ))}
              </select>
            </div>

            {equipmentStatus.service && (
              <div className={`text-center px-10 py-8 rounded-3xl font-bold text-white shadow-2xl transition-all ${
                equipmentStatus.service === 'Good' ? 'bg-emerald-500' :
                equipmentStatus.service === 'Caution' ? 'bg-amber-500' :
                equipmentStatus.service === 'Do Not Use' ? 'bg-rose-500' :
                'bg-gray-500'
              }`}>
                <div className="text-lg opacity-90">Service</div>
                <div className="text-3xl mt-2">{equipmentStatus.service}</div>
              </div>
            )}

            {equipmentStatus.calibration && (
              <div className={`text-center px-10 py-8 rounded-3xl font-bold text-white shadow-2xl transition-all ${
                equipmentStatus.calibration === 'Good' ? 'bg-emerald-500' :
                equipmentStatus.calibration === 'Caution' ? 'bg-amber-500' :
                equipmentStatus.calibration === 'Do Not Use' ? 'bg-rose-500' :
                'bg-gray-500'
              }`}>
                <div className="text-lg opacity-90">Calibration</div>
                <div className="text-3xl mt-2">{equipmentStatus.calibration}</div>
              </div>
            )}
          </div>
        </div>

        {/* Scheduled + Update All + Notes */}
        <div className="grid md:grid-cols-2 gap-10">
          <div>
            <label className="block text-xl font-bold text-gray-800 mb-4">Scheduled Date & Time *</label>
            <input
              type="datetime-local"
              name="scheduled_date"
              value={formData.scheduled_date}
              onChange={handleChange}
              required
              className="w-full px-8 py-5 border-2 border-gray-300 rounded-2xl focus:ring-4 focus:ring-green-300 focus:border-green-500 text-xl"
            />
            <button
              type="button"
              onClick={() => {
                updateForecast();
                updateEquipmentStatus();
              }}
              className="mt-8 w-full px-10 py-6 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-2xl rounded-2xl shadow-2xl transition"
            >
              Update All
            </button>
          </div>
          <div>
            <label className="block text-xl font-bold text-gray-800 mb-4">Notes (optional)</label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows="10"
              placeholder="Additional notes about the spray plan..."
              className="w-full px-8 py-5 border-2 border-gray-300 rounded-2xl focus:ring-4 focus:ring-green-300 focus:border-green-500 text-xl"
            />
          </div>
        </div>

        {/* Forecast Card */}
        {forecastData ? (
          <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-3xl shadow-2xl p-12 border-2 border-blue-200">
            <h3 className="text-4xl font-bold text-center text-blue-800 mb-10">Spray Window Forecast</h3>
            <div className="grid md:grid-cols-2 gap-12">
              {/* Left: Suitability + Hourly */}
              <div className="space-y-10">
                {/* Suitability Score */}
                <div className="bg-white rounded-3xl shadow-2xl p-10 text-center">
                  <div className="text-8xl font-bold text-blue-700 mb-6">{suitability.score}</div>
                  <div className="text-4xl font-bold text-blue-800 mb-6">{suitability.rating}</div>
                  {suitability.warnings.length > 0 && (
                    <div className="text-red-600 font-bold text-xl">
                      {suitability.warnings.join(' • ')}
                    </div>
                  )}
                </div>

                {/* Hourly List */}
                <div className="bg-white rounded-3xl shadow-2xl p-8">
                  <h4 className="text-3xl font-bold text-gray-800 mb-8 text-center">Hourly Window</h4>
                  <div className="space-y-6">
                    {hourly.map((h, i) => (
                      <div key={i} className={`p-8 rounded-2xl ${h.is_target ? 'bg-blue-100 border-4 border-blue-500' : 'bg-gray-50'}`}>
                        <div className="flex justify-between items-center">
                          <div className="font-mono text-3xl font-bold">{h.time}</div>
                          <div className="text-right">
                            <div className="text-5xl font-bold text-gray-800">{h.temp}°</div>
                            <div className="text-lg text-gray-600 mt-2">
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
              <div className="grid grid-cols-2 gap-8">
                <div className="bg-white rounded-3xl shadow-2xl p-8 text-center">
                  <div className="text-6xl font-bold text-blue-700">{target?.rain ?? 0}%</div>
                  <div className="text-xl text-gray-600 mt-4">Rain Chance</div>
                </div>
                <div className="bg-white rounded-3xl shadow-2xl p-8 text-center">
                  <div className="text-6xl font-bold text-gray-700">{target?.wind ?? 0}<small className="text-4xl">/{target?.gust ?? 0}</small></div>
                  <div className="text-xl text-gray-600 mt-4">Wind / Gust (km/h)</div>
                </div>
                <div className="bg-white rounded-3xl shadow-2xl p-8 text-center">
                  <div className="text-6xl font-bold text-purple-700">{target?.visibility ?? 0}</div>
                  <div className="text-xl text-gray-600 mt-4">Visibility (km)</div>
                </div>
                <div className="bg-white rounded-3xl shadow-2xl p-8 text-center">
                  <div className="text-6xl font-bold text-yellow-700">UV {target?.uv ?? 0}</div>
                  <div className="text-xl text-gray-600 mt-4">UV Index</div>
                </div>
                <div className="bg-white rounded-3xl shadow-2xl p-8 text-center">
                  <div className="text-6xl font-bold text-indigo-700">{target?.cloud ?? 0}%</div>
                  <div className="text-xl text-gray-600 mt-4">Cloud Cover</div>
                </div>
                <div className="bg-white rounded-3xl shadow-2xl p-8 text-center">
                  <div className="text-6xl font-bold text-green-700">{target?.humidity ?? 0}%</div>
                  <div className="text-xl text-gray-600 mt-4">Humidity</div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-3xl shadow-2xl p-20 border-2 border-blue-200 text-center">
            <h3 className="text-4xl font-bold text-blue-800 mb-8">Spray Window Forecast</h3>
            <p className="text-2xl text-gray-600">Select block and time, then click Update All</p>
          </div>
        )}

        {/* Products */}
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-3xl p-12 border-2 border-green-200">
          <div className="flex justify-between items-center mb-10">
            <h3 className="text-4xl font-bold text-green-800">Products to Apply</h3>
            <button
              type="button"
              onClick={addProduct}
              className="px-10 py-5 bg-green-600 hover:bg-green-700 text-white font-bold text-2xl rounded-2xl shadow-2xl transition"
            >
              + Add Product
            </button>
          </div>

          <div className="space-y-10">
            {formData.products.length === 0 ? (
              <p className="text-center text-gray-600 py-20 text-2xl">No products added yet</p>
            ) : (
              formData.products.map((prod, index) => {
                const amount = parseFloat(prod.amount) || 0;
                const totalNeeded = getTotalNeeded(amount);
                const status = getStockStatus(prod.item, amount);
                return (
                  <div key={index} className="bg-white rounded-3xl shadow-2xl p-10 border-2 border-gray-200">
                    <div className="grid md:grid-cols-12 gap-8 items-end">
                      <div className="md:col-span-6">
                        <label className="block text-xl font-bold text-gray-800 mb-4">Chemical / Product</label>
                        <select
                          value={prod.item}
                          onChange={(e) => updateProduct(index, 'item', e.target.value)}
                          className="w-full px-8 py-5 border-2 border-gray-300 rounded-2xl focus:ring-4 focus:ring-green-300 focus:border-green-500 text-xl"
                        >
                          <option value="">Select item</option>
                          {items.map(item => (
                            <option key={item.id} value={item.id}>
                              {item.sku} — {item.name}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-xl font-bold text-gray-800 mb-4">Amount (L/ha)</label>
                        <input
                          type="number"
                          value={prod.amount}
                          onChange={(e) => updateProduct(index, 'amount', e.target.value)}
                          step="0.001"
                          placeholder="0.000"
                          className="w-full px-8 py-5 border-2 border-gray-300 rounded-2xl text-right focus:ring-4 focus:ring-green-300 focus:border-green-500 text-xl"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-xl font-bold text-gray-800 mb-4">Total Needed (L)</label>
                        <div className="px-8 py-5 bg-gray-100 rounded-2xl text-right text-3xl font-bold text-gray-800">
                          {totalNeeded}
                        </div>
                      </div>
                      <div className="md:col-span-1">
                        <label className="block text-xl font-bold text-gray-800 mb-4">Status</label>
                        <div className={`px-8 py-5 rounded-2xl text-center text-xl font-bold ${status.color}`}>
                          {status.text}
                        </div>
                      </div>
                      <div className="md:col-span-1 text-center">
                        <button
                          type="button"
                          onClick={() => removeProduct(index)}
                          className="text-6xl text-red-600 hover:text-red-800 font-bold transition"
                        >
                          ×
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-10 pt-12">
          <Link
            to={`/dashboard/${tenant}/spray/plans`}
            className="px-16 py-7 border-2 border-gray-400 rounded-2xl text-3xl font-bold text-gray-700 hover:bg-gray-100 transition"
          >
            Cancel
          </Link>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="px-24 py-7 bg-green-600 hover:bg-green-700 disabled:opacity-70 text-white font-bold text-4xl rounded-2xl shadow-2xl transition transform hover:scale-105"
          >
            {saving ? 'Saving...' : 'Save Spray Plan'}
          </button>
        </div>

        {message && (
          <div className={`text-center text-4xl font-bold mt-16 ${message.includes('success') ? 'text-green-600' : 'text-red-600'}`}>
            {message}
          </div>
        )}
      </div>
    </div>
  );
}