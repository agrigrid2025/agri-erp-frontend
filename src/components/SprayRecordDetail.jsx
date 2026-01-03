import { useParams, Link } from 'react-router-dom';

export default function SprayRecordDetail() {
  const { tenant, recordId } = useParams();

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8">Spray Record Detail</h1>
      <div className="bg-white rounded-2xl shadow-xl p-8">
        <p className="text-gray-600">Record detail page coming soon...</p>
        <p className="text-gray-500 mt-4">Record ID: {recordId}</p>
        <Link to={`/dashboard/${tenant}/spray/plans`} className="inline-block mt-6 px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50">
          ← Back to Plans
        </Link>
      </div>
    </div>
  );
}