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

    try {
      // First, get CSRF token by fetching the login page
      const getResponse = await fetch(`https://${tenant}.agrigrid.net/login/`, {
        credentials: 'include',
      });
      const text = await getResponse.text();
      const csrfMatch = text.match(/name="csrfmiddlewaretoken" value="([^"]+)"/);
      const csrfToken = csrfMatch ? csrfMatch[1] : '';

      // Then POST login
      const postResponse = await fetch(`https://${tenant}.agrigrid.net/login/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'X-CSRFToken': csrfToken,
        },
        body: new URLSearchParams({
          username,
          password,
          csrfmiddlewaretoken: csrfToken,
        }),
        credentials: 'include',
        redirect: 'manual', // Handle redirect manually
      });

      if (postResponse.ok || postResponse.type === 'opaque') {
        navigate(`/dashboard/${tenant}`);
      } else {
        setError('Invalid username or password');
      }
    } catch (err) {
      setError('Cannot connect to server. Check farm code or network.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-700 to-green-900 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-10 max-w-md w-full">
        <h2 className="text-3xl font-bold text-center text-green-800 mb-8">
          {tenant.charAt(0).toUpperCase() + tenant.slice(1)} Farm
        </h2>
        <form onSubmit={handleLogin} className="space-y-6">
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full px-6 py-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-4 focus:ring-green-500"
            required
            disabled={loading}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-6 py-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-4 focus:ring-green-500"
            required
            disabled={loading}
          />
          {error && <p className="text-red-600 text-center font-medium">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-700 hover:bg-green-800 disabled:opacity-60 text-white font-semibold py-4 rounded-xl transition"
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
      </div>
    </div>
  );
}