import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';

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
    // Add other fields as needed
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
              ...formData,
              ...user,
              password: '', // Don't pre-fill password
            });
          }
          setLoading(false);
        });
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

  if (loading) return <div className="text-center py-20">Loading...</div>;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8">
        {isEdit ? 'Edit User' : 'Add New User'}
      </h1>

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-xl p-8 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Username *</label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {isEdit ? 'New Password (leave blank to keep)' : 'Password *'}
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required={!isEdit}
              className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Role *</label>
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500"
            >
              <option value="view">View Only</option>
              <option value="general">General User</option>
              <option value="power">Power User</option>
              <option value="admin">Admin</option>
            </select>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <input
            type="checkbox"
            name="is_spray_operator"
            id="is_spray_operator"
            checked={formData.is_spray_operator}
            onChange={handleChange}
            className="h-5 w-5 text-green-600 rounded focus:ring-green-500"
          />
          <label htmlFor="is_spray_operator" className="text-lg font-medium text-gray-700">
            User is Spray Operator
          </label>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
            <input
              type="text"
              name="first_name"
              value={formData.first_name}
              onChange={handleChange}
              className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
            <input
              type="text"
              name="last_name"
              value={formData.last_name}
              onChange={handleChange}
              className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
            <input
              type="text"
              name="phone_number"
              value={formData.phone_number}
              onChange={handleChange}
              className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Department</label>
            <input
              type="text"
              name="department"
              value={formData.department}
              onChange={handleChange}
              className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500"
            />
          </div>
        </div>

        <div className="flex justify-end gap-4 pt-6">
          <Link
            to={`/dashboard/${tenant}/users`}
            className="px-8 py-4 border border-gray-300 rounded-xl text-lg font-medium hover:bg-gray-50 transition"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={saving}
            className="px-12 py-4 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white font-bold rounded-xl text-lg transition"
          >
            {saving ? 'Saving...' : isEdit ? 'Update User' : 'Create User'}
          </button>
        </div>

        {message && (
          <p className={`text-center text-xl font-medium mt-8 ${message.includes('success') ? 'text-green-600' : 'text-red-600'}`}>
            {message}
          </p>
        )}
      </form>
    </div>
  );
}