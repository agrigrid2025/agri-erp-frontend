import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';

export default function SprayRecordDetail() {
  const { tenant, recordId } = useParams();
  const navigate = useNavigate();

  const [record, setRecord] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const loadRecord = async () => {
      try {
        const res = await fetch(`https://${tenant}.agrigrid.net/spray/api/spray-record/${recordId}/`, { credentials: 'include' });
        const data = await res.json();

        if (res.ok && data.record) {
          setRecord(data.record);
        } else {
          setMessage(data.error || 'Record not found');
        }
      } catch (err) {
        setMessage('Failed to load record');
      } finally {
        setLoading(false);
      }
    };

    loadRecord();
  }, [tenant, recordId]);

  if (loading) return <div className="text-center py-20 text-2xl">Loading record...</div>;

  if (!record) return <div className="text-center py-20 text-2xl text-red-600">{message}</div>;

  const weather = record.weather_snapshot;

  return (
    <div className="max-w-7xl mx-auto p-6">
      <h1 className="text-4xl font-bold text-center mb-12 text-gray-800">
        Spray Record — {record.block_name}
      </h1>

      <div className="bg-white rounded-3xl shadow-2xl p-12 space-y-12">
        {/* Plan Summary */}
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-3xl p-10 border-2 border-green-200">
          <h2 className="text-3xl font-bold text-green-800 mb-6">Plan Summary</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <div className="text-lg text-gray-600">Target Pest</div>
              <div className="text-2xl font-bold text-gray-800">{record.target_pest}</div>
            </div>
            <div>
              <div className="text-lg text-gray-600">Scheduled</div>
              <div className="text-2xl font-bold text-gray-800">
                {new Date(record.scheduled_date).toLocaleString()}
              </div>
            </div>
            <div>
              <div className="text-lg text-gray-600">Planned Applicator</div>
              <div className="text-2xl font-bold text-gray-800">{record.planned_applicator || 'Not set'}</div>
            </div>
          </div>
        </div>

        {/* Actual Application */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-3xl p-10 border-2 border-blue-200">
          <h2 className="text-3xl font-bold text-blue-800 mb-6">Actual Application</h2>
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="text-lg text-gray-600">Start Time</div>
              <div className="text-2xl font-bold text-gray-800">
                {new Date(record.start_time).toLocaleString()}
              </div>
            </div>
            <div>
              <div className="text-lg text-gray-600">End Time</div>
              <div className="text-2xl font-bold text-gray-800">
                {new Date(record.end_time).toLocaleString()}
              </div>
            </div>
            <div>
              <div className="text-lg text-gray-600">Applicator</div>
              <div className="text-2xl font-bold text-gray-800">{record.applicator_name}</div>
            </div>
            <div>
              <div className="text-lg text-gray-600">Equipment</div>
              <div className="text-2xl font-bold text-gray-800">{record.equipment_name}</div>
            </div>
          </div>
        </div>

        {/* Weather Snapshot */}
        {weather && (
          <div className="bg-gradient-to-r from-cyan-50 to-blue-50 rounded-3xl p-10 border-2 border-cyan-200">
            <h3 className="text-3xl font-bold text-center text-blue-800 mb-8">Weather During Application</h3>
            <div className="grid md:grid-cols-4 gap-8">
              <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
                <div className="text-5xl font-bold text-red-700">{weather.temp}°</div>
                <div className="text-xl text-gray-600 mt-4">Temperature</div>
              </div>
              <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
                <div className="text-5xl font-bold text-blue-700">{weather.rain}%</div>
                <div className="text-xl text-gray-600 mt-4">Rain Chance</div>
              </div>
              <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
                <div className="text-5xl font-bold text-gray-700">{weather.wind}/{weather.gust} km/h</div>
                <div className="text-xl text-gray-600 mt-4">Wind / Gust</div>
              </div>
              <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
                <div className="text-5xl font-bold text-green-700">{weather.humidity}%</div>
                <div className="text-xl text-gray-600 mt-4">Humidity</div>
              </div>
            </div>
          </div>
        )}

        {/* Actual vs Planned Products */}
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-3xl p-10 border-2 border-green-200">
          <h3 className="text-3xl font-bold text-green-800 mb-8 text-center">Actual vs Planned Products</h3>
          <div className="space-y-8">
            {record.products.map((prod, index) => (
              <div key={index} className="bg-white rounded-2xl shadow-xl p-8 border border-gray-200">
                <div className="grid md:grid-cols-12 gap-6 items-center">
                  <div className="md:col-span-5">
                    <div className="text-2xl font-bold text-gray-800">{prod.name}</div>
                  </div>
                  <div className="md:col-span-2">
                    <div className="text-lg text-gray-600">Planned</div>
                    <div className="text-2xl font-bold text-blue-700">{prod.planned_amount.toFixed(3)} L/ha</div>
                  </div>
                  <div className="md:col-span-2">
                    <div className="text-lg text-gray-600">Actual</div>
                    <div className="text-2xl font-bold text-green-700">{prod.actual_amount.toFixed(3)} L/ha</div>
                  </div>
                  <div className="md:col-span-3">
                    <div className="text-lg text-gray-600">Variance</div>
                    <div className={`text-2xl font-bold ${(prod.actual_amount - prod.planned_amount) > 0 ? 'text-red-600' : 'text-green-600'}`}>
                      {((prod.actual_amount - prod.planned_amount).toFixed(3))} L/ha
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Notes & Comments */}
        <div className="grid md:grid-cols-2 gap-10">
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-3xl p-10 border-2 border-amber-200">
            <h3 className="text-2xl font-bold text-amber-800 mb-6">Weather Notes</h3>
            <p className="text-xl text-gray-800 whitespace-pre-wrap">{record.weather_notes || 'No notes'}</p>
          </div>
          <div className="bg-gradient-to-r from-teal-50 to-cyan-50 rounded-3xl p-10 border-2 border-teal-200">
            <h3 className="text-2xl font-bold text-teal-800 mb-6">General Comments</h3>
            <p className="text-xl text-gray-800 whitespace-pre-wrap">{record.comments || 'No comments'}</p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-center pt-12">
          <Link
            to={`/dashboard/${tenant}/spray/plans`}
            className="px-16 py-7 bg-gray-600 hover:bg-gray-700 text-white font-bold text-3xl rounded-2xl shadow-2xl transition"
          >
            ← Back to Plans
          </Link>
        </div>
      </div>
    </div>
  );
}