import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

export default function LoginPage() {
  const { tenant } = useParams();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const getCookie = (name) => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
    return null;
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const apiUrl = `https://${tenant}.agrigrid.net/api/login/`;

    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          'username': username,
          'password': password,
        }),
        credentials: 'include',
      });

      console.log('POST status:', response.status);
      console.log('POST ok:', response.ok);

      if (response.ok) {
        const data = await response.json();
        console.log('Success data:', data);
        navigate(`/dashboard/${tenant}`);
      } else {
        const text = await response.text();
        console.log('Error response:', text);
        setError('Login failed (wrong credentials or server error)');
      }
    } catch (err) {
      console.error('Fetch error:', err);
      setError(`Cannot reach ${apiUrl}. Check farm code or try again.`);
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