import { useState } from 'react';
import { useParams } from 'react-router-dom';

export default function SprayReport() {
  const { tenant } = useParams();

  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleGenerateReport = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const res = await fetch(`https://${tenant}.agrigrid.net/spray/report/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          start_date: startDate,
          end_date: endDate,
        }),
        credentials: 'include',
      });

      if (!res.ok) {
        const err = await res.json();
        setMessage(err.error || 'Failed to generate report');
        return;
      }

      // Download PDF
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `freshcare_spray_report_${new Date().toISOString().slice(0,10)}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();

      setMessage('Report downloaded successfully!');
    } catch (err) {
      setMessage('Network error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-4xl font-bold text-center mb-12 text-gray-800">FreshCare Spray Report</h1>

      <div className="bg-white rounded-3xl shadow-2xl p-12 space-y-10">
        <form onSubmit={handleGenerateReport} className="space-y-8">
          <div className="grid md:grid-cols-2 gap-10">
            <div>
              <label className="block text-xl font-bold text-gray-800 mb-4">Start Date *</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                required
                className="w-full px-8 py-5 border-2 border-gray-300 rounded-2xl focus:ring-4 focus:ring-green-300 focus:border-green-500 text-xl"
              />
            </div>
            <div>
              <label className="block text-xl font-bold text-gray-800 mb-4">End Date *</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                required
                className="w-full px-8 py-5 border-2 border-gray-300 rounded-2xl focus:ring-4 focus:ring-green-300 focus:border-green-500 text-xl"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full px-12 py-6 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white font-bold text-3xl rounded-2xl shadow-2xl transition transform hover:scale-105"
          >
            {loading ? 'Generating...' : 'Download FreshCare Report (PDF)'}
          </button>
        </form>

        {message && (
          <div className={`text-center text-2xl font-bold ${message.includes('success') ? 'text-green-600' : 'text-red-600'}`}>
            {message}
          </div>
        )}
      </div>
    </div>
  );
}