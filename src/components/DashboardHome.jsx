import { useParams } from 'react-router-dom';

export default function DashboardHome() {
  const { tenant } = useParams();

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-2">
        Welcome back to {tenant.charAt(0).toUpperCase() + tenant.slice(1)} Farm!
      </h1>
      <p className="text-gray-600 mb-8">Here's your farm overview</p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <DashboardCard title="Total Fields" value="24" color="green" />
        <DashboardCard title="Active Sprays" value="7" color="blue" />
        <DashboardCard title="Team Members" value="18" color="purple" />
        <DashboardCard title="Weather" value="Sunny" color="yellow" />
      </div>
    </div>
  );
}

function DashboardCard({ title, value, color }) {
  const colors = {
    green: 'bg-green-100 text-green-800',
    blue: 'bg-blue-100 text-blue-800',
    purple: 'bg-purple-100 text-purple-800',
    yellow: 'bg-yellow-100 text-yellow-800',
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h3 className="text-lg font-medium text-gray-600">{title}</h3>
      <p className={`text-4xl font-bold mt-4 ${colors[color]}`}>{value}</p>
    </div>
  );
}