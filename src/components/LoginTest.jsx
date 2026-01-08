// src/components/LoginTest.jsx
import { useState } from 'react';
import { useParams } from 'react-router-dom';

export default function LoginTest() {
  const { tenant } = useParams();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const res = await fetch(`https://${tenant}.agrigrid.net/api/login-test/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
        credentials: 'include',
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setMessage(`Login successful! User: ${data.user.username} Role: ${data.user.role}`);
      } else {
        setMessage(data.message || 'Login failed');
      }
    } catch (err) {
      setMessage('Network error — check console');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-6">
      <div className="bg-white rounded-3xl shadow-2xl p-12 max-w-md w-full">
        <h1 className="text-4xl font-bold text-center text-gray-800 mb-8">Test Login</h1>
        <p className="text-center text-lg text-gray-600 mb-10">
          Tenant: <span className="font-bold">{tenant}</span>
        </p>

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-lg font-medium text-gray-700 mb-2">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="w-full px-6 py-4 border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-green-300 focus:border-green-500 text-lg"
              placeholder="admin"
            />
          </div>

          <div>
            <label className="block text-lg font-medium text-gray-700 mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-6 py-4 border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-green-300 focus:border-green-500 text-lg"
              placeholder="your password"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full px-8 py-5 bg-green-600 hover:bg-green-700 disabled:opacity-70 text-white font-bold text-2xl rounded-xl shadow-2xl transition transform hover:scale-105"
          >
            {loading ? 'Testing...' : 'Test Login'}
          </button>
        </form>

        {message && (
          <div className={`text-center text-2xl font-bold mt-10 p-6 rounded-xl ${message.includes('successful') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
            {message}
          </div>
        )}
      </div>
    </div>
  );
}