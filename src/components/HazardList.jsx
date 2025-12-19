import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';

export default function HazardList() {
  const { tenant } = useParams();
  const [hazards, setHazards] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`https://${tenant}.agrigrid.net/agrisafe/api/hazards/`, { credentials: 'include' })
      .then(r => r.json())
      .then(data => {
        setHazards(data.hazards || []);
        setLoading(false);
      });
  }, [tenant]);

  const getRiskBadge = (level) => {
    const styles = {
      low: 'bg-green-100 text-green-800',
      medium: 'bg-yellow-100 text-yellow-800',
      high: 'bg-orange-100 text-orange-800',
      critical: 'bg-red-100 text-red-800',
    };
    return <span className={`px-3 py-1 rounded-full text-xs font-medium ${styles[level] || 'bg-gray-100 text-gray-800'}`}>
      {level.charAt(0).toUpperCase() + level.slice(1)}
    </span>;
  };

  if (loading) return <p className="text-center py-20">Loading hazards...</p>;

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="bg-white rounded-xl shadow-lg p-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Hazard Register</h1>
          <Link to={`/dashboard/${tenant}/safety/hazards/new`} className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg">
            Report Hazard
          </Link>
        </div>

        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Location</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Severity</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Due Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Reported</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {hazards.map(hazard => (
              <tr key={hazard.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 text-sm">{hazard.type}</td>
                <td className="px-6 py-4 text-sm">{hazard.location}</td>
                <td className="px-6 py-4">{getRiskBadge(hazard.riskLevel)}</td>
                <td className="px-6 py-4 text-sm">{hazard.status === 'open' ? 'Active' : 'Resolved'}</td>
                <td className="px-6 py-4 text-sm">
                  {hazard.dueDate ? new Date(hazard.dueDate).toLocaleDateString() : '—'}
                </td>
                <td className="px-6 py-4 text-sm">{new Date(hazard.reportedAt).toLocaleDateString()}</td>
                <td className="px-6 py-4 text-sm">
                  <Link to={`/dashboard/${tenant}/safety/hazards/${hazard.id}`} className="text-blue-600 hover:underline">
                    View
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}