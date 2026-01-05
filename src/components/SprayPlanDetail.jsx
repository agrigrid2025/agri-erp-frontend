import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';

export default function SprayPlanDetail() {
  const { tenant, planId } = useParams();
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`https://${tenant}.agrigrid.net/spray/api/spray-plan/${planId}/`, { credentials: 'include' })
      .then(r => r.json())
      .then(data => {
        setPlan(data.plan);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [tenant, planId]);

  if (loading) return <div className="text-center py-20 text-2xl">Loading plan...</div>;
  if (!plan) return <div className="text-center py-20 text-2xl text-red-600">Plan not found</div>;

  return (
    <div className="max-w-5xl mx-auto p-6">
      <div className="bg-white rounded-3xl shadow-2xl p-10">
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-800">{plan.block_name}</h1>
            <p className="text-2xl text-red-700 mt-2">Target: {plan.target_pest}</p>
          </div>
          <Link to={`/dashboard/${tenant}/spray/plans`} className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">
            ← Back to List
          </Link>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-10">
          <div>
            <p className="text-lg text-gray-600">Scheduled</p>
            <p className="text-3xl font-bold">{new Date(plan.scheduled_date).toLocaleString()}</p>
          </div>
          <div>
            <p className="text-lg text-gray-600">Equipment</p>
            <p className="text-3xl font-bold">{plan.equipment_name || '—'}</p>
          </div>
        </div>

        <h3 className="text-2xl font-bold text-green-800 mb-6">Planned Products</h3>
        <div className="space-y-4">
          {plan.products.length === 0 ? (
            <p className="text-center text-gray-500 py-8">No products planned</p>
          ) : (
            plan.products.map((prod, i) => (
              <div key={i} className="bg-gray-50 rounded-xl p-6 flex justify-between items-center">
                <span className="text-xl font-medium">{prod.sku} — {prod.name}</span>
                <span className="text-2xl font-bold text-green-700">{prod.amount.toFixed(3)} L/ha</span>
              </div>
            ))
          )}
        </div>

        {plan.notes && (
          <div className="mt-10">
            <h3 className="text-2xl font-bold text-gray-800 mb-4">Notes</h3>
            <p className="text-lg text-gray-700 bg-gray-50 rounded-xl p-6">{plan.notes}</p>
          </div>
        )}

        <div className="mt-10 text-center">
          {plan.has_record ? (
            <Link to={`/dashboard/${tenant}/spray/record/${plan.id}`} className="px-12 py-4 bg-green-600 hover:bg-green-700 text-white font-bold text-xl rounded-xl shadow-lg transition">
              View Record
            </Link>
          ) : (
            <Link to={`/dashboard/${tenant}/spray/record/new/${plan.id}`} className="px-12 py-4 bg-green-600 hover:bg-green-700 text-white font-bold text-xl rounded-xl shadow-lg transition">
              Record Application
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}