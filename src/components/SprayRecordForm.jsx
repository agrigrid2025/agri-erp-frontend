import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';

export default function SprayRecordForm() {
  const { tenant, planId } = useParams();
  const navigate = useNavigate();

  const [plan, setPlan] = useState(null);
  const [record, setRecord] = useState(null);
  const [products, setProducts] = useState([]);
  const [users, setUsers] = useState([]);
  const [equipment, setEquipment] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  const [formData, setFormData] = useState({
    start_time: '',
    end_time: '',
    applicator: '',
    equipment: '',
    comments: '',
    weather_notes: '',
    weather_snapshot: {},
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        const planRes = await fetch(`https://${tenant}.agrigrid.net/spray/api/spray-plan/${planId}/`, { credentials: 'include' });
        const planJson = await planRes.json();
        const p = planJson.plan;
        setPlan(p);
        setProducts(p.products);

        // Load users and equipment
        const [userRes, eqRes] = await Promise.all([
          fetch(`https://${tenant}.agrigrid.net/admin/api/users/`, { credentials: 'include' }),
          fetch(`https://${tenant}.agrigrid.net/equipment/api/equipment/`, { credentials: 'include' }),
        ]);

        const [userData, eqData] = await Promise.all([userRes.json(), eqRes.json()]);
        setUsers(userData.users || []);
        setEquipment(eqData.equipment || []);

        // If record exists, load it
        if (p.has_record) {
          // Placeholder — add record detail API when ready
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
        comments: formData.comments,
        weather_notes: formData.weather_notes,
        weather_snapshot: formData.weather_snapshot,
        products: products.map(prod => ({
          item_id: prod.item_id,
          planned_amount: prod.amount,
          actual_amount: prod.actual_amount || prod.amount,
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
      <h1 className="text-3xl font-bold mb-8">Spray Record — {plan?.block_name}</h1>
      <p className="text-xl text-gray-600 mb-8">Target Pest: {plan?.target_pest}</p>

      <div className="bg-white rounded-2xl shadow-xl p-8 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Applicator *</label>
            <select
              name="applicator"
              value={formData.applicator}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500"
            >
              <option value="">Select applicator</option>
              {users.map(user => (
                <option key={user.id} value={user.id}>{user.username}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Equipment Used</label>
            <select
              name="equipment"
              value={formData.equipment}
              onChange={handleChange}
              className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500"
            >
              <option value="">Select equipment</option>
              {equipment.map(eq => (
                <option key={eq.id} value={eq.id}>{eq.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Weather Notes (Freshcare)</label>
          <textarea
            name="weather_notes"
            value={formData.weather_notes}
            onChange={handleChange}
            rows="3"
            placeholder="Wind, temperature, rain during spray..."
            className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500"
          />
        </div>

        {/* Products */}
        <div>
          <h2 className="text-2xl font-bold mb-4">Products Used</h2>
          <table className="min-w-full">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-6 py-3 text-left">Item</th>
                <th className="px-6 py-3 text-right">Planned Amount</th>
                <th className="px-6 py-3 text-right">Actual Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {products.map((prod, index) => (
                <tr key={prod.id}>
                  <td className="px-6 py-4">
                    {prod.sku} — {prod.name}
                  </td>
                  <td className="px-6 py-4 text-right">{prod.amount.toFixed(3)}</td>
                  <td className="px-6 py-4">
                    <input
                      type="number"
                      value={prod.actual_amount || ''}
                      onChange={(e) => updateActualAmount(index, e.target.value)}
                      step="0.001"
                      className="w-32 px-3 py-2 border rounded text-right focus:ring-2 focus:ring-green-500"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">General Comments</label>
          <textarea
            name="comments"
            value={formData.comments}
            onChange={handleChange}
            rows="4"
            className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500"
          />
        </div>

        <div className="flex justify-end gap-4 pt-6">
          <Link
            to={`/dashboard/${tenant}/spray/plans`}
            className="px-8 py-4 border border-gray-300 rounded-xl text-lg font-medium hover:bg-gray-50 transition"
          >
            Cancel
          </Link>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-12 py-4 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white font-bold rounded-xl text-lg transition"
          >
            {saving ? 'Saving...' : 'Save Record'}
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