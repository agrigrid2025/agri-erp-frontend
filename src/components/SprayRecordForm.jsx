import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';

export default function SprayRecordForm() {
  const { tenant, planId } = useParams();
  const navigate = useNavigate();

  const [plan, setPlan] = useState(null);
  const [products, setProducts] = useState([]);
  const [users, setUsers] = useState([]);
  const [equipment, setEquipment] = useState([]);
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  const [formData, setFormData] = useState({
    start_time: '',
    end_time: '',
    applicator: '',
    equipment: '',
    weather_notes: '',
    comments: '',
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        const planRes = await fetch(`https://${tenant}.agrigrid.net/spray/api/spray-plan/${planId}/`, { credentials: 'include' });
        const planJson = await planRes.json();
        const p = planJson.plan;
        setPlan(p);
        setProducts(p.products.map(prod => ({
          ...prod,
          actual_amount: prod.amount,
        })));

        // Load users and equipment
        const [userRes, eqRes] = await Promise.all([
          fetch(`https://${tenant}.agrigrid.net/admin/api/users/`, { credentials: 'include' }),
          fetch(`https://${tenant}.agrigrid.net/equipment/api/equipment/`, { credentials: 'include' }),
        ]);

        const [userData, eqData] = await Promise.all([userRes.json(), eqRes.json()]);
        setUsers(userData.users || []);
        setEquipment(eqData.equipment || []);

        // Load current weather (placeholder)
        setWeather({
          temp: 25,
          rain: 10,
          wind: 15,
          humidity: 65,
        });
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
    const newProducts = [...products];
    newProducts[index].actual_amount = value;
    setProducts(newProducts);
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
        weather_snapshot: weather,
        products: products.map(prod => ({
          item_id: prod.item_id,
          planned_amount: prod.amount,
          actual_amount: prod.actual_amount,
        })),
      };

      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        credentials: 'include',
      });
      const data = await res.json();
      if (data.success) {
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
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-center mb-8">Record Spray Application — {plan?.block_name}</h1>

      <div className="bg-white rounded-2xl shadow-xl border p-8 space-y-12">
        {weather && (
          <div className="bg-gradient-to-r from-blue-50 to-cyan-50 border-2 border-blue-200 rounded-2xl p-6">
            <h4 className="text-xl font-bold text-blue-800 text-center mb-4">Current Weather Conditions</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
              <div className="bg-white rounded-xl p-5 shadow">
                <div className="text-4xl font-bold text-red-600">{weather.temp}°</div>
                <div className="text-sm text-gray-600 mt-2">Temperature</div>
              </div>
              <div className="bg-white rounded-xl p-5 shadow">
                <div className="text-4xl font-bold text-blue-600">{weather.rain}%</div>
                <div className="text-sm text-gray-600 mt-2">Rain Chance</div>
              </div>
              <div className="bg-white rounded-xl p-5 shadow">
                <div className="text-4xl font-bold text-gray-700">{weather.wind} km/h</div>
                <div className="text-sm text-gray-600 mt-2">Wind Speed</div>
              </div>
              <div className="bg-white rounded-xl p-5 shadow">
                <div className="text-4xl font-bold text-purple-600">{weather.humidity}%</div>
                <div className="text-sm text-gray-600 mt-2">Humidity</div>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Start Time *</label>
            <input
              type="datetime-local"
              name="start_time"
              value={formData.start_time}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">End Time *</label>
            <input
              type="datetime-local"
              name="end_time"
              value={formData.end_time}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Operator *</label>
            <select
              name="applicator"
              value={formData.applicator}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500"
            >
              <option value="">Select operator</option>
              {users.map(user => (
                <option key={user.id} value={user.id}>{user.username}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="bg-gray-50 rounded-2xl p-8 border border-gray-300">
          <h3 className="text-2xl font-bold text-gray-800 mb-6">Planned vs Actual Chemicals</h3>
          <div className="space-y-6">
            {products.map((prod, index) => (
              <div key={prod.id} className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end bg-white rounded-xl p-6 shadow">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Chemical</label>
                  <div className="text-lg font-semibold text-gray-800">
                    {prod.sku} — {prod.name}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Planned (L/ha)</label>
                  <div className="text-xl font-bold text-blue-700">
                    {prod.amount.toFixed(3)}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Actual Used (L) *</label>
                  <input
                    type="number"
                    value={prod.actual_amount}
                    onChange={(e) => updateActualAmount(index, e.target.value)}
                    step="0.001"
                    required
                    className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-emerald-50 rounded-2xl p-8 border-2 border-emerald-200">
          <label className="block text-xl font-bold text-gray-800 mb-4">Equipment Used *</label>
          <select
            name="equipment"
            value={formData.equipment}
            onChange={handleChange}
            required
            className="w-full px-6 py-4 text-lg border-2 border-emerald-300 rounded-xl focus:ring-4 focus:ring-emerald-300 focus:border-emerald-500 bg-white"
          >
            <option value="">-- Select Equipment --</option>
            {equipment.map(eq => (
              <option key={eq.id} value={eq.id}>
                {eq.fleet_number ? `${eq.fleet_number} — ` : ''}{eq.name}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Weather Notes</label>
            <textarea
              name="weather_notes"
              value={formData.weather_notes}
              onChange={handleChange}
              rows="3"
              className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">General Comments</label>
            <textarea
              name="comments"
              value={formData.comments}
              onChange={handleChange}
              rows="3"
              className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500"
            />
          </div>
        </div>

        <div className="text-center pt-8">
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="px-16 py-5 bg-green-600 text-white text-xl font-bold rounded-xl hover:bg-green-700 shadow-2xl transition transform hover:scale-105"
          >
            {saving ? 'Saving...' : 'Save & Generate Report'}
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