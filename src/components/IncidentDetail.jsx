import { useParams } from 'react-router-dom';

export default function IncidentDetail() {
  const { tenant, incidentId } = useParams();

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8">Incident Detail</h1>
      <div className="bg-white rounded-2xl shadow-xl p-8">
        <p className="text-gray-600 mb-4">Incident detail page coming soon...</p>
        <p className="text-gray-500">Tenant: {tenant} | Incident ID: {incidentId}</p>
      </div>
    </div>
  );
}