import { useState } from 'react';
import { useParams } from 'react-router-dom';

export default function LoginTest() {
  const { tenant } = useParams();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
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
        setMessage('Login successful! User: ' + data.user.username + ' Role: ' + data.user.role);
      } else {
        setMessage(data.message || 'Login failed');
      }
    } catch (err) {
        setMessage('Network error');
    }
  };

  return (
    <div className="max-w-md mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8 text-center">Test Login</h1>

      <form onSubmit={handleLogin} className="bg-white rounded-2xl shadow-xl p-8 space-y-6">
        <div>
          <label className="block text-lg font-medium mb-2">Username</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500"
          />
        </div>
        <div>
          <label className="block text-lg font-medium mb-2">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500"
          />
        </div>
        <button
          type="submit"
          className="w-full px-6 py-4 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg"
        >
          Test Login
        </button>
      </form>

      {message && (
        <p className="text-center text-xl font-medium mt-8">
          {message}
        </p>
      )}
    </div>
  );
}