import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation, Link } from 'react-router-dom';

export default function UserForm() {
  const { tenant } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const isEdit = location.pathname.includes('/edit/');
  const userId = isEdit ? location.pathname.split('/').pop() : null;

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    role: 'view',
    is_spray_operator: false,
    first_name: '',
    last_name: '',
    phone_number: '',
    department: '',
    acdc_license_number: '',
    acdc_expiry_date: '',
    chemcert_number: '',
    chemcert_expiry_date: '',
    other_qualifications: '',
  });

  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (isEdit && userId) {
      fetch(`https://${tenant}.agrigrid.net/api/users/list/`, { credentials: 'include' })
        .then(r => r.json())
        .then(data => {
          const user = data.users.find(u => u.id === parseInt(userId));
          if (user) {
            setFormData({
              username: user.username,
              email: user.email || '',
              password: '',
              role: user.role || 'view',
              is_spray_operator: user.is_spray_operator || false,
              first_name: user.first_name || '',
              last_name: user.last_name || '',
              phone_number: user.phone_number || '',
              department: user.department || '',
              acdc_license_number: user.acdc_license_number || '',
              acdc_expiry_date: user.acdc_expiry_date || '',
              chemcert_number: user.chemcert_number || '',
              chemcert_expiry_date: user.chemcert_expiry_date || '',
              other_qualifications: user.other_qualifications || '',
            });
          }
          setLoading(false);
        })
        .catch(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [isEdit, userId, tenant]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');

    const url = isEdit
      ? `https://${tenant}.agrigrid.net/api/users/update/${userId}/`
      : `https://${tenant}.agrigrid.net/api/users/create/`;

    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
        credentials: 'include',
      });
      const data = await res.json();
      if (data.success) {
        setMessage('User saved successfully!');
        setTimeout(() => navigate(`/dashboard/${tenant}/users`), 1500);
      } else {
        setMessage(data.error || 'Save failed');
      }
    } catch (err) {
      setMessage('Network error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="text-center py-20 text-2xl">Loading user...</div>;

  return (
    <div className="max-w-5xl mx-auto p-6">
      <h1 className="text-4xl font-bold mb-10 text-center text-gray-800">
        {isEdit ? 'Edit User' : 'Add New User'}
      </h1>

      <form onSubmit={handleSubmit} className="bg-white rounded-3xl shadow-2xl p-10 space-y-10">
        {/* Basic Info */}
        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <label className="block text-lg font-semibold text-gray-700 mb-3">Username *</label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              required
              className="w-full px-6 py-4 border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-green-300 focus:border-green-500 text-lg"
            />
          </div>
          <div>
            <label className="block text-lg font-semibold text-gray-700 mb-3">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-6 py-4 border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-green-300 focus:border-green-500 text-lg"
            />
          </div>
          <div>
            <label className="block text-lg font-semibold text-gray-700 mb-3">
              {isEdit ? 'New Password (leave blank to keep)' : 'Password *'}
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required={!isEdit}
              className="w-full px-6 py-4 border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-green-300 focus:border-green-500 text-lg"
            />
          </div>
          <div>
            <label className="block text-lg font-semibold text-gray-700 mb-3">Role *</label>
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="w-full px-6 py-4 border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-green-300 focus:border-green-500 text-lg"
            >
              <option value="view">View Only</option>
              <option value="general">General User</option>
              <option value="power">Power User</option>
              <option value="admin">Admin</option>
            </select>
          </div>
        </div>

        {/* Personal Info */}
        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <label className="block text-lg font-semibold text-gray-700 mb-3">First Name</label>
            <input
              type="text"
              name="first_name"
              value={formData.first_name}
              onChange={handleChange}
              className="w-full px-6 py-4 border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-green-300 focus:border-green-500 text-lg"
            />
          </div>
          <div>
            <label className="block text-lg font-semibold text-gray-700 mb-3">Last Name</label>
            <input
              type="text"
              name="last_name"
              value={formData.last_name}
              onChange={handleChange}
              className="w-full px-6 py-4 border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-green-300 focus:border-green-500 text-lg"
            />
          </div>
          <div>
            <label className="block text-lg font-semibold text-gray-700 mb-3">Phone Number</label>
            <input
              type="text"
              name="phone_number"
              value={formData.phone_number}
              onChange={handleChange}
              className="w-full px-6 py-4 border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-green-300 focus:border-green-500 text-lg"
            />
          </div>
          <div>
            <label className="block text-lg font-semibold text-gray-700 mb-3">Department</label>
            <input
              type="text"
              name="department"
              value={formData.department}
              onChange={handleChange}
              className="w-full px-6 py-4 border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-green-300 focus:border-green-500 text-lg"
            />
          </div>
        </div>

        {/* Spray Operator Toggle */}
        <div className="bg-gradient-to-r from-emerald-50 to-green-50 rounded-3xl p-8 border-2 border-emerald-200">
          <label className="flex items-center gap-6 cursor-pointer">
            <input
              type="checkbox"
              name="is_spray_operator"
              checked={formData.is_spray_operator}
              onChange={handleChange}
              className="h-8 w-8 text-emerald-600 rounded focus:ring-emerald-500"
            />
            <span className="text-2xl font-bold text-gray-800">This user is a Spray Operator</span>
          </label>
        </div>

        {/* Spray Operator Qualifications — Shown only if is_spray_operator */}
        {formData.is_spray_operator && (
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-3xl p-10 border-2 border-amber-200 space-y-8">
            <h2 className="text-3xl font-bold text-center text-amber-800 mb-8">Spray Operator Qualifications</h2>

            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <label className="block text-lg font-semibold text-gray-800 mb-3">ACDC Commercial Operator License Number</label>
                <input
                  type="text"
                  name="acdc_license_number"
                  value={formData.acdc_license_number}
                  onChange={handleChange}
                  placeholder="e.g. QLD123456"
                  className="w-full px-6 py-4 border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-amber-300 focus:border-amber-500 text-lg"
                />
              </div>
              <div>
                <label className="block text-lg font-semibold text-gray-800 mb-3">ACDC Expiry Date</label>
                <input
                  type="date"
                  name="acdc_expiry_date"
                  value={formData.acdc_expiry_date}
                  onChange={handleChange}
                  className="w-full px-6 py-4 border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-amber-300 focus:border-amber-500 text-lg"
                />
              </div>
              <div>
                <label className="block text-lg font-semibold text-gray-800 mb-3">ChemCert Accreditation Number</label>
                <input
                  type="text"
                  name="chemcert_number"
                  value={formData.chemcert_number}
                  onChange={handleChange}
                  placeholder="e.g. CC2025-123"
                  className="w-full px-6 py-4 border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-amber-300 focus:border-amber-500 text-lg"
                />
              </div>
              <div>
                <label className="block text-lg font-semibold text-gray-800 mb-3">ChemCert Expiry Date</label>
                <input
                  type="date"
                  name="chemcert_expiry_date"
                  value={formData.chemcert_expiry_date}
                  onChange={handleChange}
                  className="w-full px-6 py-4 border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-amber-300 focus:border-amber-500 text-lg"
                />
              </div>
            </div>

            <div>
              <label className="block text-lg font-semibold text-gray-800 mb-3">Other Qualifications / Training</label>
              <textarea
                name="other_qualifications"
                value={formData.other_qualifications}
                onChange={handleChange}
                rows="5"
                placeholder="List any additional spray-related training, certificates, or licenses..."
                className="w-full px-6 py-4 border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-amber-300 focus:border-amber-500 text-lg"
              />
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-end gap-8 pt-10">
          <Link
            to={`/dashboard/${tenant}/users`}
            className="px-14 py-6 border-2 border-gray-400 rounded-xl text-2xl font-bold text-gray-700 hover:bg-gray-100 transition"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={saving}
            className="px-20 py-6 bg-green-600 hover:bg-green-700 disabled:opacity-70 text-white font-bold text-3xl rounded-xl shadow-2xl transition transform hover:scale-105"
          >
            {saving ? 'Saving...' : isEdit ? 'Update User' : 'Create User'}
          </button>
        </div>

        {message && (
          <div className={`text-center text-3xl font-bold mt-12 ${message.includes('success') ? 'text-green-600' : 'text-red-600'}`}>
            {message}
          </div>
        )}
      </form>
    </div>
  );
}