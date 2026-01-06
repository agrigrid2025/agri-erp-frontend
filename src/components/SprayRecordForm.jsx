import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';

export default function SprayRecordForm() {
  const { tenant, planId } = useParams();
  const navigate = useNavigate();

  const [plan, setPlan] = useState(null);
  const [formData, setFormData] = useState({
    start_time: '',
    end_time: '',
    applicator: '',
    equipment: '',
    weather_notes: '',
    comments: '',
    products: [],
  });

  const [sprayOperators, setSprayOperators] = useState([]);
  const [equipment, setEquipment] = useState([]);
  const [weatherSnapshot, setWeatherSnapshot] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const loadData = async () => {
      try {
        const [planRes, opRes, eqRes] = await Promise.all([
          fetch(`https://${tenant}.agrigrid.net/spray/api/spray-plan/${planId}/`, { credentials: 'include' }),
          fetch(`https://${tenant}.agrigrid.net/api/users/spray-operators/`, { credentials: 'include' }),
          fetch(`https://${tenant}.agrigrid.net/equipment/api/equipment/`, { credentials: 'include' }),
        ]);

        const [planData, opData, eqData] = await Promise.all([
          planRes.json(),
          opRes.json(),
          eqRes.json(),
        ]);

        setPlan(planData.plan);
        setSprayOperators(opData.operators || []);
        setEquipment(eqData.equipment || []);

        // Pre-fill form from plan
        setFormData(prev => ({
          ...prev,
          applicator: planData.plan.applicator_id || '',
          equipment: planData.plan.equipment_id || '',
          products: planData.plan.products.map(p => ({
            item: p.item_id,
            planned_amount: p.amount,
            actual_amount: p.amount,
          })),
        }));

        // Load weather snapshot for plan scheduled time
        if (planData.plan.scheduled_date) {
          fetch(`https://${tenant}.agrigrid.net/spray/api/forecast-data/?block=${planData.plan.block_id}&scheduled_date=${encodeURIComponent(planData.plan.scheduled_date)}`, { credentials: 'include' })
            .then(r => r.json())
            .then(data => setWeatherSnapshot(data.forecast?.target || null))
            .catch(() => setWeatherSnapshot(null));
        }
      } catch (err) {
        console.error(err);
        setMessage('Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [tenant, planId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const updateActualAmount = (index, value) => {
    const newProducts = [...formData.products];
    newProducts[index].actual_amount = value;
    setFormData(prev => ({ ...prev, products: newProducts }));
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage('');
    try {
      const url = `https://${tenant}.agrigrid.net/spray/api/spray-record/save/`;

      const payload = {
        plan_id: planId,
        start_time: formData.start_time,
        end_time: formData.end_time,
        applicator: formData.applicator,
        equipment: formData.equipment,
        weather_notes: formData.weather_notes,
        comments: formData.comments,
        weather_snapshot: weatherSnapshot,
        products: formData.products.map(p => ({
          item_id: p.item,
          planned_amount: p.planned_amount,
          actual_amount: p.actual_amount,
        })),
      };

      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        credentials: 'include',
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setMessage('Spray record saved successfully!');
        setTimeout(() => navigate(`/dashboard/${tenant}/spray/plans`), 1500);
      } else {
        setMessage(data.error || 'Save failed');
      }
    } catch (err) {
      setMessage('Network error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="text-center py-20 text-2xl">Loading record form...</div>;

  return (
    <div className="max-w-7xl mx-auto p-6">
      <h1 className="text-4xl font-bold text-center mb-10 text-gray-800">Record Spray — {plan?.block_name}</h1>

      <div className="bg-white rounded-3xl shadow-2xl p-12 space-y-12">
        {/* Weather Snapshot */}
        {weatherSnapshot && (
          <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-3xl p-10 border-2 border-blue-200">
            <h3 className="text-3xl font-bold text-center text-blue-800 mb-8">Weather Snapshot at Scheduled Time</h3>
            <div className="grid md:grid-cols-4 gap-8">
              <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
                <div className="text-5xl font-bold text-red-700">{weatherSnapshot.temp}°</div>
                <div className="text-xl text-gray-600 mt-4">Temperature</div>
              </div>
              <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
                <div className="text-5xl font-bold text-blue-700">{weatherSnapshot.rain}%</div>
                <div className="text-xl text-gray-600 mt-4">Rain Chance</div>
              </div>
              <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
                <div className="text-5xl font-bold text-gray-700">{weatherSnapshot.wind}/{weatherSnapshot.gust} km/h</div>
                <div className="text-xl text-gray-600 mt-4">Wind / Gust</div>
              </div>
              <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
                <div className="text-5xl font-bold text-green-700">{weatherSnapshot.humidity}%</div>
                <div className="text-xl text-gray-600 mt-4">Humidity</div>
              </div>
            </div>
          </div>
        )}

        {/* Start/End Time + Applicator + Equipment */}
        <div className="grid md:grid-cols-2 gap-10">
          <div>
            <label className="block text-xl font-bold text-gray-800 mb-4">Start Time *</label>
            <input
              type="datetime-local"
              name="start_time"
              value={formData.start_time}
              onChange={handleChange}
              required
              className="w-full px-8 py-5 border-2 border-gray-300 rounded-2xl focus:ring-4 focus:ring-green-300 focus:border-green-500 text-xl"
            />
          </div>
          <div>
            <label className="block text-xl font-bold text-gray-800 mb-4">End Time *</label>
            <input
              type="datetime-local"
              name="end_time"
              value={formData.end_time}
              onChange={handleChange}
              required
              className="w-full px-8 py-5 border-2 border-gray-300 rounded-2xl focus:ring-4 focus:ring-green-300 focus:border-green-500 text-xl"
            />
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-10">
          <div>
            <label className="block text-xl font-bold text-gray-800 mb-4">Spray Operator *</label>
            <select
              name="applicator"
              value={formData.applicator}
              onChange={handleChange}
              required
              className="w-full px-8 py-5 border-2 border-gray-300 rounded-2xl focus:ring-4 focus:ring-green-300 focus:border-green-500 text-xl"
            >
              <option value="">Select operator</option>
              {sprayOperators.map(op => (
                <option key={op.id} value={op.id}>
                  {op.first_name} {op.last_name} ({op.username})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xl font-bold text-gray-800 mb-4">Equipment Used *</label>
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
        </div>

        {/* Actual vs Planned Products */}
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-3xl p-10 border-2 border-green-200">
          <h3 className="text-3xl font-bold text-green-800 mb-8 text-center">Planned vs Actual Products</h3>
          <div className="space-y-8">
            {formData.products.map((prod, index) => (
              <div key={index} className="bg-white rounded-2xl shadow-xl p-8 border border-gray-200">
                <div className="grid md:grid-cols-12 gap-6 items-center">
                  <div className="md:col-span-5">
                    <div className="text-xl font-bold text-gray-800">{prod.name}</div>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-lg font-semibold text-gray-800 mb-3">Planned (L/ha)</label>
                    <div className="px-6 py-4 bg-gray-100 rounded-xl text-right text-2xl font-bold text-gray-800">
                      {prod.planned_amount.toFixed(3)}
                    </div>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-lg font-semibold text-gray-800 mb-3">Actual (L/ha)</label>
                    <input
                      type="number"
                      value={prod.actual_amount}
                      onChange={(e) => updateActualAmount(index, e.target.value)}
                      step="0.001"
                      className="w-full px-6 py-4 border-2 border-gray-300 rounded-xl text-right focus:ring-4 focus:ring-green-300 focus:border-green-500 text-lg"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-lg font-semibold text-gray-800 mb-3">Variance (L/ha)</label>
                    <div className={`px-6 py-4 rounded-xl text-right text-2xl font-bold ${prod.actual_amount - prod.planned_amount > 0 ? 'text-red-600 bg-red-100' : 'text-green-600 bg-green-100'}`}>
                      {(prod.actual_amount - prod.planned_amount).toFixed(3)}
                    </div>
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
            ))}
          </div>
        </div>

        {/* Weather Notes + Comments */}
        <div className="grid md:grid-cols-2 gap-10">
          <div>
            <label className="block text-xl font-bold text-gray-800 mb-4">Weather Notes</label>
            <textarea
              name="weather_notes"
              value={formData.weather_notes}
              onChange={handleChange}
              rows="6"
              placeholder="Observations on wind, temperature, rain during spray..."
              className="w-full px-8 py-5 border-2 border-gray-300 rounded-2xl focus:ring-4 focus:ring-green-300 focus:border-green-500 text-xl"
            />
          </div>
          <div>
            <label className="block text-xl font-bold text-gray-800 mb-4">General Comments</label>
            <textarea
              name="comments"
              value={formData.comments}
              onChange={handleChange}
              rows="6"
              placeholder="Any additional comments or observations..."
              className="w-full px-8 py-5 border-2 border-gray-300 rounded-2xl focus:ring-4 focus:ring-green-300 focus:border-green-500 text-xl"
            />
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
            {saving ? 'Saving...' : 'Save Spray Record'}
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