import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

export default function LoginPage() {
  const { tenant } = useParams();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const apiUrl = `https://${tenant}.agrigrid.net/api/login/`;

    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username,
          password,
        }),
        credentials: 'include', // Essential for session cookie
      });

      const data = await response.json();
      console.log('Login API response:', data);

      if (data.success) {
        // Optional: store user info for role checks later
        if (data.user) {
          localStorage.setItem('user', JSON.stringify(data.user));
        }
        navigate(`/dashboard/${tenant}`);
      } else {
        setError(data.message || 'Invalid username or password');
      }
    } catch (err) {
      console.error('Login network error:', err);
      setError('Cannot reach server. Please check your farm code and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-700 to-green-900 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-10 max-w-md w-full">
        <div className="text-center mb-8">
          <img src="/logo.png" alt="AgriGrid Logo" className="h-16 mx-auto mb-4" />
          <h2 className="text-3xl font-bold text-green-800">
            {tenant.charAt(0).toUpperCase() + tenant.slice(1)} Farm
          </h2>
          <p className="text-gray-600 mt-2">Sign in to your account</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-6 py-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-4 focus:ring-green-500 transition"
              required
              disabled={loading}
              autoFocus
            />
          </div>

          <div>
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-6 py-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-4 focus:ring-green-500 transition"
              required
              disabled={loading}
            />
          </div>

          {error && (
            <p className="text-red-600 text-center font-medium bg-red-50 py-3 rounded-lg">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-700 hover:bg-green-800 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold py-4 rounded-xl transition transform hover:scale-105"
          >
            {loading ? 'Signing in...' : 'Login'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-8">
          Need help? Contact your farm administrator.
        </p>
      </div>
    </div>
  );
}