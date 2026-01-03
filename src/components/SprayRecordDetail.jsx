import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';

export default function SprayRecordDetail() {
  const { tenant, recordId } = useParams();
  const [record, setRecord] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Placeholder — add real detail API when ready
    setRecord({
      id: recordId,
      plan: { block_name: 'Block A', target_pest: 'Aphids' },
      start_time: '2025-01-03T08:00',
      end_time: '2025-01-03T10:30',
      applicator: 'John Doe',
      equipment: 'Sprayer 001',
      weather_notes: 'Light wind, 25°C, no rain',
      comments: 'Good coverage',
      products: [
        { sku: 'CHEM001', name: 'Insecticide X', planned_amount: 5.000, actual_amount: 4.800 },
        { sku: 'ADJ001', name: 'Adjuvant', planned_amount: 1.000, actual_amount: 1.000 },
      ],
    });
    setLoading(false);
  }, [tenant, recordId]);

  if (loading) return <div className="text-center py-20 text-2xl">Loading record...</div>;
  if (!record) return <div className="text-center py-20 text-2xl text-red-600">Record not found</div>;

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-4xl font-bold text-gray-900">Spray Record</h1>
          <p className="text-xl text-gray-600 mt-2">{record.plan.block_name} — {record.plan.target_pest}</p>
        </div>
        <Link
          to={`/dashboard/${tenant}/spray/plans`}
          className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition"
        >
          ← Back to Plans
        </Link>
      </div>

      <div className="grid md:grid-cols-4 gap-6 mb-8">
        <div className="bg-gray-50 p-6 rounded-lg">
          <p className="text-sm text-gray-600">Start Time</p>
          <p className="text-2xl font-bold mt-2">{new Date(record.start_time).toLocaleString()}</p>
        </div>
        <div className="bg-gray-50 p-6 rounded-lg">
          <p className="text-sm text-gray-600">End Time</p>
          <p className="text-2xl font-bold mt-2">{new Date(record.end_time).toLocaleString()}</p>
        </div>
        <div className="bg-gray-50 p-6 rounded-lg">
          <p className="text-sm text-gray-600">Applicator</p>
          <p className="text-2xl font-bold mt-2">{record.applicator}</p>
        </div>
        <div className="bg-gray-50 p-6 rounded-lg">
          <p className="text-sm text-gray-600">Equipment</p>
          <p className="text-2xl font-bold mt-2">{record.equipment}</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow overflow-hidden mb-8">
        <div className="px-6 py-4 bg-gray-800 text-white">
          <h2 className="text-xl font-bold">Products Used</h2>
        </div>
        <table className="min-w-full">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-6 py-3 text-left">Item</th>
              <th className="px-6 py-3 text-right">Planned</th>
              <th className="px-6 py-3 text-right">Actual</th>
              <th className="px-6 py-3 text-right">Variance</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {record.products.map((prod, index) => {
              const variance = prod.actual_amount - prod.planned_amount;
              return (
                <tr key={index}>
                  <td className="px-6 py-4">
                    <span className="font-medium">{prod.sku}</span> — {prod.name}
                  </td>
                  <td className="px-6 py-4 text-right">{prod.planned_amount.toFixed(3)}</td>
                  <td className="px-6 py-4 text-right">{prod.actual_amount.toFixed(3)}</td>
                  <td className={`px-6 py-4 text-right font-bold ${variance > 0 ? 'text-red-600' : variance < 0 ? 'text-green-600' : ''}`}>
                    {variance > 0 ? '+' : ''}{variance.toFixed(3)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-gray-50 p-6 rounded-lg">
          <p className="text-sm text-gray-600 font-bold mb-2">Weather Notes (Freshcare)</p>
          <p className="whitespace-pre-wrap">{record.weather_notes || '—'}</p>
        </div>
        <div className="bg-gray-50 p-6 rounded-lg">
          <p className="text-sm text-gray-600 font-bold mb-2">General Comments</p>
          <p className="whitespace-pre-wrap">{record.comments || '—'}</p>
        </div>
      </div>
    </div>
  );
}