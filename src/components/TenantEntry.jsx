import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function TenantEntry() {
  const [tenant, setTenant] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmed = tenant.trim().toLowerCase();
    if (trimmed) {
      navigate(`/app/login/${trimmed}`);
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
        </div>

        <h4 className="text-xl font-semibold mb-6 text-center">Welcome</h4>
        <p className="text-center text-gray-600 mb-8">Enter your farm code to continue</p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <input
              type="text"
              value={tenant}
              onChange={(e) => setTenant(e.target.value)}
              placeholder="e.g. yourtenantname"
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition"
          >
            Continue
          </button>
        </form>
        <div className="text-center mt-6">
          <button
            onClick={() => navigate('/app/register')}
            className="text-blue-600 hover:underline text-sm"
          >
            Create a new test farm
          </button>
        </div>


        <p className="text-center text-gray-500 text-sm mt-8">
          Having issues? Contact support.
        </p>
      </div>
    </div>
  );
}