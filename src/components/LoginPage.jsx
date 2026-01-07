import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Helper to get CSRF token from cookie (Django sets it on any response)
const getCsrfToken = () => {
  const name = 'csrftoken';
  const cookies = document.cookie.split(';');
  for (let cookie of cookies) {
    const [key, value] = cookie.trim().split('=');
    if (key === name) {
      return decodeURIComponent(value);
    }
  }
  return null;
};

export default function LoginPage() {
  const { tenant } = useParams();  // e.g., "costawalkamin" or "taryn"
  const navigate = useNavigate();
  const { login } = useAuth();  // If you use AuthContext to store user

  const [formData, setFormData] = useState({
    username: '',
    password: '',
    remember: false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Use tenant-specific subdomain for API calls
      const apiUrl = `https://${tenant}.agrigrid.net/api/login/`;

      const csrfToken = getCsrfToken();

      const res = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': csrfToken || '',  // Required for Django CSRF protection
        },
        body: JSON.stringify({
          username: formData.username,
          password: formData.password,
        }),
        credentials: 'include',  // Important: sends/receives session cookie
      });

      const data = await res.json();

      if (res.ok && data.success) {
        // Save user data (adjust based on your backend response)
        localStorage.setItem('user', JSON.stringify(data.user));
        if (login) login(data.user);  // Update AuthContext if used

        // Navigate to dashboard under /app
        navigate(`/app/dashboard/${tenant}`);
      } else {
        setError(data.message || 'Invalid credentials or inactive account');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('Network error — check your connection or tenant code');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-light flex items-center justify-center p-4">
      <div className="card shadow-sm p-8" style={{ maxWidth: '400px', width: '100%' }}>
        {/* Logo + Title */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <img src="/logo.png" alt="AgriGrid Logo" className="h-10" />
            <h1 className="text-3xl font-bold text-gray-800">AgriGrid</h1>
          </div>
          <p className="text-gray-600 text-sm uppercase">{tenant || 'Farm'}</p>
        </div>

        <h4 className="text-xl font-semibold mb-6 text-center">Log in</h4>

        {error && (
          <div className="bg-red-50 border border-red-300 text-red-800 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="text"
              name="username"
              id="username"
              value={formData.username}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Email"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              type="password"
              name="password"
              id="password"
              value={formData.password}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Password"
            />
            <div className="text-right mt-1">
              <Link to="/app/password-reset" className="text-muted text-sm hover:underline">
                Forgot?
              </Link>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition disabled:opacity-70"
          >
            {loading ? 'Logging in...' : 'Log in'}
          </button>

          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              name="remember"
              id="remember"
              checked={formData.remember}
              onChange={handleChange}
              className="h-4 w-4 text-blue-600 rounded"
            />
            <label htmlFor="remember" className="text-sm text-gray-700">
              Remember me
            </label>
          </div>

          <hr className="my-6" />

          <p className="text-center text-gray-600 text-sm">or access quickly</p>

          <div className="space-y-3 mt-4">
            <button type="button" className="w-full border border-gray-400 text-gray-700 py-3 rounded-lg hover:bg-gray-50 transition">
              Google
            </button>
            <button type="button" className="w-full border border-gray-400 text-gray-700 py-3 rounded-lg hover:bg-gray-50 transition">
              SSO
            </button>
          </div>

          <div className="flex justify-between mt-6 text-sm text-gray-600">
            <span>Don't have an account?</span>
            <span>Having issues logging in?</span>
          </div>
        </form>
      </div>
    </div>
  );
}