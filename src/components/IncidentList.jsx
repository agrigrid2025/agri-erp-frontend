import { useParams } from 'react-router-dom';

export default function IncidentList() {
  const { tenant } = useParams();

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="bg-white rounded-2xl shadow-xl p-8">
        <h1 className="text-3xl font-bold mb-8">Incident Register</h1>
        <p className="text-gray-600">Coming soon...</p>
      </div>
    </div>
  );
}