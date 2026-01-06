import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';

export default function SprayPlanList() {
  const { tenant } = useParams();

  const [plans, setPlans] = useState([]);
  const [filteredPlans, setFilteredPlans] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filter states
  const [hideCompleted, setHideCompleted] = useState(false);
  const [blockFilter, setBlockFilter] = useState([]);
  const [pestFilter, setPestFilter] = useState([]);
  const [equipmentFilter, setEquipmentFilter] = useState([]);
  const [applicatorFilter, setApplicatorFilter] = useState([]);

  // Unique values for filters
  const [uniqueBlocks, setUniqueBlocks] = useState([]);
  const [uniquePests, setUniquePests] = useState([]);
  const [uniqueEquipment, setUniqueEquipment] = useState([]);
  const [uniqueApplicators, setUniqueApplicators] = useState([]);

  useEffect(() => {
    const loadPlans = async () => {
      try {
        const res = await fetch(`https://${tenant}.agrigrid.net/spray/api/spray-plans/`, { credentials: 'include' });
        const data = await res.json();
        const planList = data.plans || [];

        setPlans(planList);
        setFilteredPlans(planList);

        // Extract unique values
        const blocks = [...new Set(planList.map(p => p.block))].sort();
        const pests = [...new Set(planList.map(p => p.target_pest))].sort();
        const equip = [...new Set(planList.map(p => p.equipment || 'None'))].sort();
        const apps = [...new Set(planList.map(p => p.applicator_name || 'None'))].sort();

        setUniqueBlocks(blocks);
        setUniquePests(pests);
        setUniqueEquipment(equip);
        setUniqueApplicators(apps);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadPlans();
  }, [tenant]);

  // Apply filters
  useEffect(() => {
    let filtered = plans;

    if (hideCompleted) {
      filtered = filtered.filter(p => !p.has_record);
    }

    if (blockFilter.length > 0) {
      filtered = filtered.filter(p => blockFilter.includes(p.block));
    }
    if (pestFilter.length > 0) {
      filtered = filtered.filter(p => pestFilter.includes(p.target_pest));
    }
    if (equipmentFilter.length > 0) {
      filtered = filtered.filter(p => equipmentFilter.includes(p.equipment || 'None'));
    }
    if (applicatorFilter.length > 0) {
      filtered = filtered.filter(p => applicatorFilter.includes(p.applicator_name || 'None'));
    }

    setFilteredPlans(filtered);
  }, [plans, hideCompleted, blockFilter, pestFilter, equipmentFilter, applicatorFilter]);

  const toggleFilter = (filterArray, setFilter, value) => {
    setFilter(prev => 
      prev.includes(value) 
        ? prev.filter(v => v !== value)
        : [...prev, value]
    );
  };

  // Export to PDF
  const exportToPDF = () => {
    const doc = new jsPDF('l', 'mm', 'a4');
    doc.text('Spray Plans Report', 14, 15);

    const tableData = filteredPlans.map(p => [
      p.block,
      p.target_pest,
      new Date(p.scheduled_date).toLocaleDateString(),
      p.equipment || '—',
      p.has_record ? 'Completed' : 'Planned'
    ]);

    doc.autoTable({
      head: [['Block', 'Target Pest', 'Scheduled', 'Equipment', 'Status']],
      body: tableData,
      startY: 25,
    });

    doc.save('spray-plans.pdf');
  };

  // Export to Excel
  const exportToExcel = () => {
    const wsData = filteredPlans.map(p => ({
      Block: p.block,
      'Target Pest': p.target_pest,
      Scheduled: new Date(p.scheduled_date).toLocaleDateString(),
      Equipment: p.equipment || '—',
      Status: p.has_record ? 'Completed' : 'Planned'
    }));

    const ws = XLSX.utils.json_to_sheet(wsData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Spray Plans');
    XLSX.writeFile(wb, 'spray-plans.xlsx');
  };

  if (loading) return <div className="text-center py-20 text-2xl">Loading spray plans...</div>;

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold text-gray-800">Spray Plans</h1>
        <Link 
          to={`/dashboard/${tenant}/spray/plans/add`}
          className="px-8 py-4 bg-green-600 hover:bg-green-700 text-white font-bold text-xl rounded-xl shadow-2xl transition"
        >
          + New Plan
        </Link>
      </div>

      {/* Filters & Export */}
      <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-3xl p-8 mb-10 shadow-xl">
        <div className="grid md:grid-cols-2 gap-8 mb-8">
          <div>
            <label className="flex items-center gap-4">
              <input
                type="checkbox"
                checked={hideCompleted}
                onChange={(e) => setHideCompleted(e.target.checked)}
                className="h-6 w-6 text-indigo-600 rounded focus:ring-indigo-500"
              />
              <span className="text-xl font-bold text-gray-800">Hide Completed Plans</span>
            </label>
          </div>

          <div className="flex justify-end gap-6">
            <button
              onClick={exportToPDF}
              className="px-8 py-4 bg-red-600 hover:bg-red-700 text-white font-bold text-lg rounded-xl shadow-xl transition"
            >
              Export PDF
            </button>
            <button
              onClick={exportToExcel}
              className="px-8 py-4 bg-green-600 hover:bg-green-700 text-white font-bold text-lg rounded-xl shadow-xl transition"
            >
              Export Excel
            </button>
          </div>
        </div>

        <div className="grid md:grid-cols-4 gap-8">
          {/* Block Filter */}
          <div>
            <label className="block text-lg font-bold text-gray-800 mb-3">Filter by Block</label>
            <div className="space-y-2 max-h-60 overflow-y-auto bg-white rounded-xl p-4 border border-gray-300">
              {uniqueBlocks.map(block => (
                <label key={block} className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={blockFilter.includes(block)}
                    onChange={() => toggleFilter(blockFilter, setBlockFilter, block)}
                    className="h-5 w-5 text-indigo-600 rounded focus:ring-indigo-500"
                  />
                  <span className="text-lg">{block}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Pest Filter */}
          <div>
            <label className="block text-lg font-bold text-gray-800 mb-3">Filter by Target Pest</label>
            <div className="space-y-2 max-h-60 overflow-y-auto bg-white rounded-xl p-4 border border-gray-300">
              {uniquePests.map(pest => (
                <label key={pest} className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={pestFilter.includes(pest)}
                    onChange={() => toggleFilter(pestFilter, setPestFilter, pest)}
                    className="h-5 w-5 text-indigo-600 rounded focus:ring-indigo-500"
                  />
                  <span className="text-lg">{pest}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Equipment Filter */}
          <div>
            <label className="block text-lg font-bold text-gray-800 mb-3">Filter by Equipment</label>
            <div className="space-y-2 max-h-60 overflow-y-auto bg-white rounded-xl p-4 border border-gray-300">
              {uniqueEquipment.map(eq => (
                <label key={eq} className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={equipmentFilter.includes(eq)}
                    onChange={() => toggleFilter(equipmentFilter, setEquipmentFilter, eq)}
                    className="h-5 w-5 text-indigo-600 rounded focus:ring-indigo-500"
                  />
                  <span className="text-lg">{eq}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Applicator Filter */}
          <div>
            <label className="block text-lg font-bold text-gray-800 mb-3">Filter by Applicator</label>
            <div className="space-y-2 max-h-60 overflow-y-auto bg-white rounded-xl p-4 border border-gray-300">
              {uniqueApplicators.map(app => (
                <label key={app} className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={applicatorFilter.includes(app)}
                    onChange={() => toggleFilter(applicatorFilter, setApplicatorFilter, app)}
                    className="h-5 w-5 text-indigo-600 rounded focus:ring-indigo-500"
                  />
                  <span className="text-lg">{app}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Plans Table */}
      <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
        <table className="min-w-full">
          <thead className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
            <tr>
              <th className="px-8 py-6 text-left text-xl font-bold">Block</th>
              <th className="px-8 py-6 text-left text-xl font-bold">Target Pest</th>
              <th className="px-8 py-6 text-left text-xl font-bold">Scheduled</th>
              <th className="px-8 py-6 text-left text-xl font-bold">Equipment</th>
              <th className="px-8 py-6 text-left text-xl font-bold">Applicator</th>
              <th className="px-8 py-6 text-center text-xl font-bold">Status</th>
              <th className="px-8 py-6 text-center text-xl font-bold">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredPlans.length === 0 ? (
              <tr>
                <td colSpan="7" className="text-center py-20 text-2xl text-gray-500">
                  No plans match your filters
                </td>
              </tr>
            ) : (
              filteredPlans.map(plan => (
                <tr key={plan.id} className="hover:bg-gray-50 transition">
                  <td className="px-8 py-6 text-lg font-medium">{plan.block}</td>
                  <td className="px-8 py-6 text-lg">{plan.target_pest}</td>
                  <td className="px-8 py-6 text-lg">{new Date(plan.scheduled_date).toLocaleString()}</td>
                  <td className="px-8 py-6 text-lg">{plan.equipment || '—'}</td>
                  <td className="px-8 py-6 text-lg">{plan.applicator_name || '—'}</td>
                  <td className="px-8 py-6 text-center">
                    <span className={`px-6 py-3 rounded-full text-lg font-bold ${
                      plan.has_record ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                    }`}>
                      {plan.has_record ? 'Completed' : 'Planned'}
                    </span>
                  </td>
                  <td className="px-8 py-6 text-center space-x-4">
                    <Link 
                      to={`/dashboard/${tenant}/spray/plans/${plan.id}`}
                      className="text-blue-600 hover:underline text-lg font-medium"
                    >
                      View Plan
                    </Link>
                    {plan.has_record ? (
                      <Link 
                        to={`/dashboard/${tenant}/spray/record/${plan.record_id}`}
                        className="text-emerald-600 hover:underline text-lg font-medium"
                      >
                        View Record
                      </Link>
                    ) : (
                      <Link 
                        to={`/dashboard/${tenant}/spray/record/new/${plan.id}`}
                        className="text-green-600 hover:underline text-lg font-medium"
                      >
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