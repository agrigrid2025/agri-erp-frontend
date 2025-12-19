import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';

export default function IncidentList() {
  const { tenant } = useParams();
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showResolved, setShowResolved] = useState(false);

  useEffect(() => {
    fetch(`https://${tenant}.agrigrid.net/agrisafe/api/incidents/`, { credentials: 'include' })
      .then(r => r.json())
      .then(data => {
        setIncidents(data.incidents || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [tenant]);

  const filtered = incidents.filter(incident => {
    if (!showResolved && incident.status === 'resolved') return false;
    const term = search.toLowerCase();
    return incident.type.toLowerCase().includes(term) ||
           incident.location.toLowerCase().includes(term) ||
           incident.description.toLowerCase().includes(term);
  });

  const getSeverityBadge = (severity) => {
    const styles = {
      low: 'bg-green-100 text-green-800',
      medium: 'bg-yellow-100 text-yellow-800',
      high: 'bg-orange-100 text-orange-800',
      critical: 'bg-red-100 text-red-800',
    };
    return <span className={`px-3 py-1 rounded-full text-xs font-medium ${styles[severity] || 'bg-gray-100 text-gray-800'}`}>
      {severity.charAt(0).toUpperCase() + severity.slice(1)}
    </span>;
  };

  if (loading) return <div className="text-center py-32 text-2xl text-gray-600">Loading incidents...</div>;

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="bg-white rounded-2xl shadow-xl p-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Incident Register</h1>
          <div className="flex flex-col md:flex-row gap-4">
            <input
              type="text"
              placeholder="Search incidents..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-full md:w-64"
            />
            <button
              onClick={() => setShowResolved(!showResolved)}
              className="px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition"
            >
              {showResolved ? 'Hide Resolved' : 'Show Resolved'}
            </button>
            <Link
              to={`/dashboard/${tenant}/safety/incidents/new`}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-3 rounded-lg text-center transition"
            >
              Report Incident
            </Link>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Severity</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reported</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-gray-500 text-lg">
                    No incidents found
                  </td>
                </tr>
              ) : (
                filtered.map(incident => (
                  <tr key={incident.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{incident.type}</td>
                    <td className="px-6 py-4 text-sm text-gray-700">{incident.location}</td>
                    <td className="px-6 py-4">{getSeverityBadge(incident.severity)}</td>
                    <td className="px-6 py-4 text-sm">
                      {incident.status === 'open' ? 'Open' :
                       incident.status === 'investigating' ? 'Investigating' : 'Resolved'}
                    </td>
                    <td className="px-6 py-4 text-sm">{new Date(incident.reportedAt).toLocaleDateString()}</td>
                    <td className="px-6 py-4 text-sm">
                      <Link to={`/dashboard/${tenant}/safety/incidents/${incident.id}`} className="text-blue-600 hover:underline">
                        View
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}