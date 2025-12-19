import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

export default function ItemForm() {
  const { tenant } = useParams();
  const navigate = useNavigate();
  const { itemId } = useParams(); // null for add, id for edit
  const isEdit = !!itemId;

  const [formData, setFormData] = useState({
    sku: '',
    name: '',
    description: '',
    category: '',
    unit_of_measure: '',
    default_supplier: '',
    default_purchase_price: '',
    default_warehouse: '',
    reorder_level: '',
    min_order_qty: '',
    has_sds: false,
    sds_url: '',
    sds_expiry: '',
    has_serial: false,
    has_batch: false,
    has_whp: false,
    whp_days: '',
    notes: '',
    is_active: true,
  });
  const [categories, setCategories] = useState([]);
  const [uoms, setUoms] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    // Load dropdown data (replace with real APIs when ready)
    // setCategories(fetchCategories());
    // setUoms(fetchUoms());
    // setSuppliers(fetchSuppliers());
    // setWarehouses(fetchWarehouses());

    if (isEdit) {
      fetch(`https://${tenant}.agrigrid.net/inventory3/api/items/`, { credentials: 'include' })
        .then(r => r.json())
        .then(data => {
          const item = data.items.find(i => i.id === parseInt(itemId));
          if (item) {
            setFormData({
              sku: item.sku,
              name: item.name,
              description: '',
              category: '',
              unit_of_measure: '',
              default_supplier: '',
              default_purchase_price: '',
              default_warehouse: '',
              reorder_level: item.reorderLevel,
              min_order_qty: '',
              has_sds: false,
              sds_url: '',
              sds_expiry: '',
              has_serial: false,
              has_batch: false,
              has_whp: false,
              whp_days: '',
              notes: '',
              is_active: item.isActive,
            });
          }
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, [isEdit, itemId, tenant]);

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
      // Placeholder — add real save endpoint when ready
      console.log('Saving item:', formData);
      setMessage('Item saved successfully! (placeholder)');
      setTimeout(() => navigate(`/dashboard/${tenant}/inventory/items`), 1500);
    } catch (err) {
      setMessage('Save failed');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="text-center py-20 text-2xl">Loading form...</div>;

  return (
    <div className="max-w-5xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8">
        {isEdit ? 'Edit Item' : 'Add New Item'}
      </h1>

      <div className="bg-white rounded-2xl shadow-xl p-8 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">SKU *</label>
            <input
              type="text"
              name="sku"
              value={formData.sku}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500"
            />
          </div>
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
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows="4"
            className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500"
            >
              <option value="">Select category</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Unit of Measure</label>
            <select
              name="unit_of_measure"
              value={formData.unit_of_measure}
              onChange={handleChange}
              className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500"
            >
              <option value="">Select UOM</option>
              {uoms.map(uom => (
                <option key={uom.id} value={uom.id}>{uom.abbreviation}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Default Supplier</label>
            <select
              name="default_supplier"
              value={formData.default_supplier}
              onChange={handleChange}
              className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500"
            >
              <option value="">Select supplier</option>
              {suppliers.map(sup => (
                <option key={sup.id} value={sup.id}>{sup.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Default Purchase Price</label>
            <input
              type="number"
              name="default_purchase_price"
              value={formData.default_purchase_price}
              onChange={handleChange}
              step="0.01"
              className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Default Warehouse</label>
          <select
            name="default_warehouse"
            value={formData.default_warehouse}
            onChange={handleChange}
            className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500"
          >
            <option value="">Select warehouse</option>
            {warehouses.map(wh => (
              <option key={wh.id} value={wh.id}>{wh.name}</option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Reorder Level</label>
            <input
              type="number"
              name="reorder_level"
              value={formData.reorder_level}
              onChange={handleChange}
              step="0.01"
              className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Min Order Qty</label>
            <input
              type="number"
              name="min_order_qty"
              value={formData.min_order_qty}
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
              name="has_sds"
              checked={formData.has_sds}
              onChange={handleChange}
              className="h-5 w-5 text-green-600 rounded"
            />
            <span className="text-gray-700">Has SDS</span>
          </label>
          <label className="flex items-center gap-4">
            <input
              type="checkbox"
              name="has_serial"
              checked={formData.has_serial}
              onChange={handleChange}
              className="h-5 w-5 text-green-600 rounded"
            />
            <span className="text-gray-700">Has Serial Number</span>
          </label>
          <label className="flex items-center gap-4">
            <input
              type="checkbox"
              name="has_batch"
              checked={formData.has_batch}
              onChange={handleChange}
              className="h-5 w-5 text-green-600 rounded"
            />
            <span className="text-gray-700">Has Batch Number</span>
          </label>
          <label className="flex items-center gap-4">
            <input
              type="checkbox"
              name="has_whp"
              checked={formData.has_whp}
              onChange={handleChange}
              className="h-5 w-5 text-green-600 rounded"
            />
            <span className="text-gray-700">Has Withholding Period</span>
          </label>
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

        <div className="flex justify-end gap-4 pt-6">
          <Link
            to={`/dashboard/${tenant}/inventory/items`}
            className="px-8 py-4 border border-gray-300 rounded-xl text-lg font-medium hover:bg-gray-50 transition"
          >
            Cancel
          </Link>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-12 py-4 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white font-bold rounded-xl text-lg transition"
          >
            {saving ? 'Saving...' : isEdit ? 'Update Item' : 'Create Item'}
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