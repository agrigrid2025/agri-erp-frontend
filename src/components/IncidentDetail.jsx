import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';

export default function IncidentDetail() {
  const { tenant, incidentId } = useParams();
  const [incident, setIncident] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [status, setStatus] = useState('');
  const [comment, setComment] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetch(`https://${tenant}.agrigrid.net/agrisafe/api/incidents/`, { credentials: 'include' })
      .then(r => r.json())
      .then(data => {
        const inc = data.incidents.find(i => i.id === parseInt(incidentId));
        if (inc) {
          setIncident(inc);
          setStatus(inc.status);
        }
        setLoading(false);
      });
  }, [tenant, incidentId]);

  const handleUpdate = async () => {
    setUpdating(true);
    setMessage('');
    try {
      const res = await fetch(`https://${tenant}.agrigrid.net/agrisafe/api/incident/update-status/${incidentId}/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, comment }),
        credentials: 'include',
      });
      const data = await res.json();
      if (data.success) {
        setMessage('Incident updated successfully!');
        setIncident(prev => ({ ...prev, status, corrective_action: comment }));
        setComment('');
      } else {
        setMessage(data.error || 'Update failed');
      }
    } catch (err) {
      setMessage('Network error');
    } finally {
      setUpdating(false);
    }
  };

  const getSeverityBadge = (severity) => {
    const styles = {
      low: 'bg-green-100 text-green-800',
      medium: 'bg-yellow-100 text-yellow-800',
      high: 'bg-orange-100 text-orange-800',
      critical: 'bg-red-100 text-red-800',
    };
    return <span className={`px-3 py-1 rounded-full text-sm font-medium ${styles[severity] || 'bg-gray-100 text-gray-800'}`}>
      {severity.charAt(0).toUpperCase() + severity.slice(1)}
    </span>;
  };

  if (loading) return <div className="text-center py-20 text-2xl">Loading incident...</div>;
  if (!incident) return <div className="text-center py-20 text-2xl text-red-600">Incident not found</div>;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8">Incident Details</h1>

      <div className="bg-white rounded-2xl shadow-xl p-8">
        <h3 className="text-2xl font-bold text-gray-800 mb-6">
          {incident.type} at {incident.location}
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div>
            <p className="text-sm text-gray-600">Reported By</p>
            <p className="font-medium">{incident.reportedBy || '—'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Assigned To</p>
            <p className="font-medium">{incident.assignedTo || '—'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Severity</p>
            {getSeverityBadge(incident.severity)}
          </div>
          <div>
            <p className="text-sm text-gray-600">Status</p>
            <p className="font-medium">
              {incident.status === 'open' ? 'Open' :
               incident.status === 'investigating' ? 'Investigating' : 'Resolved'}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Due Date</p>
            <p className="font-medium">
              {incident.dueDate ? new Date(incident.dueDate).toLocaleDateString() : '—'}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">GPS Coordinates</p>
            {incident.gps ? (
              <a href={`https://www.google.com/maps?q=${incident.gps}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                {incident.gps}
              </a>
            ) : '—'}
          </div>
        </div>

        <div className="mb-8">
          <p className="text-sm text-gray-600 mb-2">Description</p>
          <p className="bg-gray-50 p-4 rounded-lg">{incident.description || '—'}</p>
        </div>

        {incident.corrective_action && (
          <div className="mb-8">
            <p className="text-sm text-gray-600 mb-2">Corrective Action</p>
            <p className="bg-gray-50 p-4 rounded-lg">{incident.corrective_action}</p>
          </div>
        )}

        {/* Admin/Power Update Section */}
        <div className="border-t border-gray-300 pt-8">
          <h3 className="text-xl font-semibold text-gray-700 mb-6">Update Incident</h3>
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Comment / Update</label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows="4"
                className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500"
                placeholder="Add corrective action or update..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500"
              >
                <option value="open">Open</option>
                <option value="investigating">Investigating</option>
                <option value="resolved">Resolved</option>
              </select>
            </div>
          </div>

          <div className="mt-6">
            <button
              onClick={handleUpdate}
              disabled={updating}
              className="px-8 py-4 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white font-bold rounded-xl transition"
            >
              {updating ? 'Updating...' : 'Save Update'}
            </button>
          </div>
        </div>

        {message && (
          <p className={`text-center text-xl font-medium mt-8 ${message.includes('success') ? 'text-green-600' : 'text-red-600'}`}>
            {message}
          </p>
        )}

        <div className="mt-8">
          <Link
            to={`/dashboard/${tenant}/safety/incidents`}
            className="inline-block px-8 py-4 border border-blue-600 text-blue-600 rounded-xl text-lg font-medium hover:bg-blue-50 transition"
          >
            ← Back to List
          </Link>
        </div>
      </div>
    </div>
  );
}