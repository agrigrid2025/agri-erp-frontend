import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';

export default function HazardDetail() {
  const { tenant, hazardId } = useParams();
  const [hazard, setHazard] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`https://${tenant}.agrigrid.net/agrisafe/api/hazards/`, { credentials: 'include' })
      .then(r => r.json())
      .then(data => {
        const h = data.hazards.find(h => h.id === parseInt(hazardId));
        setHazard(h);
        setLoading(false);
      });
  }, [tenant, hazardId]);

  if (loading) return <div className="text-center py-20">Loading...</div>;
  if (!hazard) return <div className="text-center py-20">Hazard not found</div>;

  const getRiskBadge = (level) => {
    const styles = {
      low: 'bg-green-100 text-green-800',
      medium: 'bg-yellow-100 text-yellow-800',
      high: 'bg-orange-100 text-orange-800',
      critical: 'bg-red-100 text-red-800',
    };
    return <span className={`px-3 py-1 rounded-full text-sm font-medium ${styles[level] || 'bg-gray-100 text-gray-800'}`}>
      {level.charAt(0).toUpperCase() + level.slice(1)}
    </span>;
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8">Hazard Details</h1>

      <div className="bg-white rounded-2xl shadow-xl p-8">
        <h3 className="text-2xl font-bold text-gray-800 mb-6">
          {hazard.type} at {hazard.location}
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div>
            <p className="text-sm text-gray-600">Reported By</p>
            <p className="font-medium">{hazard.reportedBy || '—'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Assigned To</p>
            <p className="font-medium">{hazard.assignedTo || '—'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Severity</p>
            {getRiskBadge(hazard.riskLevel)}
          </div>
          <div>
            <p className="text-sm text-gray-600">Status</p>
            <p className="font-medium">{hazard.status === 'open' ? 'Active' : 'Resolved'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Due Date</p>
            <p className="font-medium">
              {hazard.dueDate ? new Date(hazard.dueDate).toLocaleDateString() : '—'}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">GPS Coordinates</p>
            {hazard.gps ? (
              <a href={`https://www.google.com/maps?q=${hazard.gps}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                {hazard.gps}
              </a>
            ) : '—'}
          </div>
        </div>

        <div className="mb-8">
          <p className="text-sm text-gray-600 mb-2">Description</p>
          <p className="bg-gray-50 p-4 rounded-lg">{hazard.description}</p>
        </div>

        <div className="flex justify-start">
          <Link
            to={`/dashboard/${tenant}/safety/hazards`}
            className="px-8 py-4 border border-blue-600 text-blue-600 rounded-xl text-lg font-medium hover:bg-blue-50 transition"
          >
            ← Back to List
          </Link>
        </div>
      </div>
    </div>
  );
}