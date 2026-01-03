import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation, Link } from 'react-router-dom';

export default function SprayPlanForm() {
  const { tenant } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const isEdit = location.pathname.includes('/edit/');
  const planId = isEdit ? location.pathname.split('/').pop() : null;

  const [planData, setPlanData] = useState({
    block: '',
    target_pest: '',
    scheduled_date: '',
    equipment: '',
    notes: '',
    products: [], // { item: '', amount: '' }
  });

  const [blocks, setBlocks] = useState([]);
  const [equipment, setEquipment] = useState([]);
  const [items, setItems] = useState([]);
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

        if (isEdit && planId) {
          const planRes = await fetch(`https://${tenant}.agrigrid.net/spray/api/spray-plan/${planId}/`, { credentials: 'include' });
          const planJson = await planRes.json();
          const p = planJson.plan;
          if (p) {
            setPlanData({
              block: p.block_id,
              target_pest: p.target_pest,
              scheduled_date: p.scheduled_date.slice(0, 16),
              equipment: p.equipment_id || '',
              notes: p.notes,
              products: p.products.map(prod => ({
                item: prod.item_id,
                amount: prod.amount,
              })),
            });
          }
        }
      } catch (err) {
        console.error(err);
        setMessage('Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [isEdit, planId, tenant]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setPlanData(prev => ({ ...prev, [name]: value }));
  };

  const addProduct = () => {
    setPlanData(prev => ({
      ...prev,
      products: [...prev.products, { item: '', amount: '' }],
    }));
  };

  const updateProduct = (index, field, value) => {
    const newProducts = [...planData.products];
    newProducts[index][field] = value;
    setPlanData(prev => ({ ...prev, products: newProducts }));
  };

  const removeProduct = (index) => {
    setPlanData(prev => ({
      ...prev,
      products: prev.products.filter((_, i) => i !== index),
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage('');
    try {
      const url = `https://${tenant}.agrigrid.net/spray/api/spray-plan/save/`;

      const payload = {
        ...planData,
        id: isEdit ? planId : undefined,
        products: planData.products.filter(p => p.item && p.amount),
      };

      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        credentials: 'include',
      });
      const data = await res.json();
      if (data.success) {
        setMessage('Spray plan saved successfully!');
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

  if (loading) return <div className="text-center py-20 text-2xl">Loading form...</div>;

  return (
    <div className="max-w-5xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8">
        {isEdit ? 'Edit Spray Plan' : 'New Spray Plan'}
      </h1>

      <div className="bg-white rounded-2xl shadow-xl p-8 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Block *</label>
            <select
              name="block"
              value={planData.block}
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
            <label className="block text-sm font-medium text-gray-700 mb-2">Target Pest *</label>
            <input
              type="text"
              name="target_pest"
              value={planData.target_pest}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Scheduled Date & Time *</label>
            <input
              type="datetime-local"
              name="scheduled_date"
              value={planData.scheduled_date}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Equipment</label>
            <select
              name="equipment"
              value={planData.equipment}
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

        {/* Products */}
        <div>
          <h2 className="text-2xl font-bold mb-4">Planned Products</h2>
          <div className="space-y-4">
            {planData.products.map((prod, index) => (
              <div key={index} className="grid grid-cols-1 md:grid-cols-12 gap-4 p-4 bg-gray-50 rounded-lg items-center">
                <div className="md:col-span-6">
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
                <div className="md:col-span-4">
                  <input
                    type="number"
                    value={prod.amount}
                    onChange={(e) => updateProduct(index, 'amount', e.target.value)}
                    step="0.001"
                    placeholder="Amount"
                    className="w-full px-4 py-3 border rounded-lg text-right focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <div className="md:col-span-2 text-center">
                  <button
                    type="button"
                    onClick={() => removeProduct(index)}
                    className="text-red-600 hover:text-red-800 font-bold"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
            <button
              type="button"
              onClick={addProduct}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition"
            >
              + Add Product
            </button>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
          <textarea
            name="notes"
            value={planData.notes}
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
            {saving ? 'Saving...' : 'Save Plan'}
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