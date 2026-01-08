import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function RegisterPage() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    domain: '',
    username: '',
    password: '',
    password2: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    if (formData.password !== formData.password2) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    if (formData.domain.trim() === '') {
      setError('Farm code is required');
      setLoading(false);
      return;
    }

    try {
      const res = await fetch('/register/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          domain: formData.domain.toLowerCase().trim(),
          username: formData.username.trim(),
          password: formData.password,
          password2: formData.password2,
        }),
      });

      if (res.ok || res.redirected) {
        const subdomain = formData.domain.toLowerCase().trim();
        setSuccess(`Farm created! Your farm URL: https://${subdomain}.agrigrid.net`);
        setTimeout(() => navigate('/app'), 5000);
      } else {
        const text = await res.text();
        setError(text || 'Registration failed — check your details');
      }
    } catch (err) {
      console.error('Registration error:', err);
      setError('Network error — cannot reach server');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-light flex items-center justify-center p-4">
      <div className="card shadow-sm p-8" style={{ maxWidth: '420px', width: '100%' }}>
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <img src="/logo.png" alt="AgriGrid Logo" className="h-10" />
            <h1 className="text-3xl font-bold text-gray-800">AgriGrid</h1>
          </div>
          <h4 className="text-xl font-semibold">Create Test Farm</h4>
          <p className="text-sm text-gray-600 mt-2">For testing only</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-300 text-red-800 px-4 py-3 rounded mb-6 text-sm">
            {error}
          </div>
        )}
        {success && (
          <div className="bg-green-50 border border-green-300 text-green-800 px-4 py-3 rounded mb-6 text-sm">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Farm Code (subdomain)</label>
            <input
              type="text"
              name="domain"
              value={formData.domain}
              onChange={handleChange}
              required
              placeholder="e.g. gordon2026"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-xs text-gray-500 mt-1">Becomes yourfarm.agrigrid.net</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Admin Username</label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              required
              placeholder="e.g. gordon"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
            <input
              type="password"
              name="password2"
              value={formData.password2}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition disabled:opacity-70"
          >
            {loading ? 'Creating Farm...' : 'Create Farm'}
          </button>
        </form>

        <button
          onClick={() => navigate('/app')}
          className="w-full mt-6 text-center text-sm text-blue-600 hover:underline"
        >
          Back to Login
        </button>
      </div>
    </div>
  );
}