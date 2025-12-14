import { useParams } from 'react-router-dom';

export default function GlobalSettings() {
  const { tenant } = useParams();

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8">Global Settings</h1>
      <div className="bg-white rounded-2xl shadow-xl p-8">
        <p className="text-gray-600 mb-4">Global settings form coming soon...</p>
        <p className="text-gray-500">Tenant: {tenant}</p>
      </div>
    </div>
  );
}