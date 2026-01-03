import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';

export default function SprayPlanList() {
  const { tenant } = useParams();
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`https://${tenant}.agrigrid.net/spray/api/spray-plans/`, { credentials: 'include' })
      .then(r => r.json())
      .then(data => {
        setPlans(data.plans || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [tenant]);

  if (loading) return <div className="text-center py-20 text-2xl">Loading spray plans...</div>;

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Spray Plans</h1>
        <Link to={`/dashboard/${tenant}/spray/plans/add`} className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-bold">
          + New Plan
        </Link>
      </div>

      <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
        <table className="min-w-full">
          <thead className="bg-gray-800 text-white">
            <tr>
              <th className="px-6 py-4 text-left">Block</th>
              <th className="px-6 py-4 text-left">Target Pest</th>
              <th className="px-6 py-4 text-left">Scheduled</th>
              <th className="px-6 py-4 text-left">Equipment</th>
              <th className="px-6 py-4 text-center">Status</th>
              <th className="px-6 py-4 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {plans.length === 0 ? (
              <tr>
                <td colSpan="6" className="text-center py-12 text-gray-500">
                  No spray plans
                </td>
              </tr>
            ) : (
              plans.map(plan => (
                <tr key={plan.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium">{plan.block}</td>
                  <td className="px-6 py-4">{plan.target_pest}</td>
                  <td className="px-6 py-4">{new Date(plan.scheduled_date).toLocaleString()}</td>
                  <td className="px-6 py-4">{plan.equipment || '—'}</td>
                  <td className="px-6 py-4 text-center">
                    {plan.has_record ? (
                      <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Completed
                      </span>
                    ) : (
                      <span className="px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                        Planned
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-center space-x-3">
                    <Link to={`/dashboard/${tenant}/spray/plans/${plan.id}`} className="text-blue-600 hover:underline">
                      View
                    </Link>
                    {plan.has_record ? (
                      <Link to={`/dashboard/${tenant}/spray/record/${plan.id}`} className="text-green-600 hover:underline">
                        View Record
                      </Link>
                    ) : (
                      <Link to={`/dashboard/${tenant}/spray/record/new/${plan.id}`} className="text-green-600 hover:underline">
                        Record Application
                      </Link>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}