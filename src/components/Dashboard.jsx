import { useParams } from 'react-router-dom';

export default function Dashboard() {
  const { tenant } = useParams();

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-green-800 text-white p-4 shadow-lg">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold">{tenant.toUpperCase()} Farm Dashboard</h1>
          <button className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded">
            Logout
          </button>
        </div>
      </nav>
      <div className="max-w-7xl mx-auto p-8">
        <h2 className="text-3xl font-bold mb-8">Welcome back!</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-xl shadow">
            <h3 className="text-xl font-semibold text-gray-800">Total Fields</h3>
            <p className="text-4xl font-bold text-green-600 mt-4">24</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow">
            <h3 className="text-xl font-semibold text-gray-800">Active Sprays</h3>
            <p className="text-4xl font-bold text-green-600 mt-4">7</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow">
            <h3 className="text-xl font-semibold text-gray-800">Team Members</h3>
            <p className="text-4xl font-bold text-green-600 mt-4">18</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;