import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FunnelIcon, ChevronDownIcon, XMarkIcon } from '@heroicons/react/24/outline'; // ← Correct v2 import

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

  // Dropdown open states
  const [openFilter, setOpenFilter] = useState(null); // 'block', 'pest', 'equipment', 'applicator'

  // Unique values
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
        setUniqueBlocks([...new Set(planList.map(p => p.block))].sort());
        setUniquePests([...new Set(planList.map(p => p.target_pest))].sort());
        setUniqueEquipment([...new Set(planList.map(p => p.equipment || 'None'))].sort());
        setUniqueApplicators([...new Set(planList.map(p => p.applicator_name || 'None'))].sort());
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

    if (blockFilter.length > 0) filtered = filtered.filter(p => blockFilter.includes(p.block));
    if (pestFilter.length > 0) filtered = filtered.filter(p => pestFilter.includes(p.target_pest));
    if (equipmentFilter.length > 0) filtered = filtered.filter(p => equipmentFilter.includes(p.equipment || 'None'));
    if (applicatorFilter.length > 0) filtered = filtered.filter(p => applicatorFilter.includes(p.applicator_name || 'None'));

    setFilteredPlans(filtered);
  }, [plans, hideCompleted, blockFilter, pestFilter, equipmentFilter, applicatorFilter]);

  const toggleFilter = (array, setArray, value) => {
    setArray(prev => 
      prev.includes(value) 
        ? prev.filter(v => v !== value)
        : [...prev, value]
    );
  };

  const clearFilters = () => {
    setHideCompleted(false);
    setBlockFilter([]);
    setPestFilter([]);
    setEquipmentFilter([]);
    setApplicatorFilter([]);
  };

  const activeFilterCount = hideCompleted + blockFilter.length + pestFilter.length + equipmentFilter.length + applicatorFilter.length;

  const FilterDropdown = ({ title, options, selected, setSelected }) => (
    <div className="relative">
      <button
        onClick={() => setOpenFilter(openFilter === title ? null : title)}
        className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition"
      >
        <FunnelIcon className="h-5 w-5 text-gray-600" />
        <span className="text-sm font-medium">{title}</span>
        {selected.length > 0 && (
          <span className="px-2 py-1 bg-indigo-600 text-white text-xs rounded-full">{selected.length}</span>
        )}
        <ChevronDownIcon className={`h-4 w-4 transition ${openFilter === title ? 'rotate-180' : ''}`} />
      </button>

      {openFilter === title && (
        <div className="absolute top-full left-0 mt-2 w-64 bg-white rounded-xl shadow-2xl border border-gray-200 z-50 p-4">
          <div className="max-h-64 overflow-y-auto space-y-2">
            {options.map(opt => (
              <label key={opt} className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 p-2 rounded">
                <input
                  type="checkbox"
                  checked={selected.includes(opt)}
                  onChange={() => toggleFilter(selected, setSelected, opt)}
                  className="h-4 w-4 text-indigo-600 rounded focus:ring-indigo-500"
                />
                <span className="text-sm">{opt}</span>
              </label>
            ))}
          </div>
        </div>
      )}
    </div>
  );

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

      {/* Filters & Actions */}
      <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-3xl p-8 mb-10 shadow-xl">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-6">
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={hideCompleted}
                onChange={(e) => setHideCompleted(e.target.checked)}
                className="h-6 w-6 text-indigo-600 rounded focus:ring-indigo-500"
              />
              <span className="text-xl font-bold text-gray-800">Hide Completed</span>
            </label>

            {activeFilterCount > 0 && (
              <div className="flex items-center gap-3">
                <span className="px-4 py-2 bg-indigo-600 text-white font-bold rounded-full">
                  {activeFilterCount} Active Filter{activeFilterCount > 1 ? 's' : ''}
                </span>
                <button
                  onClick={clearFilters}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg transition"
                >
                  Clear Filters
                </button>
              </div>
            )}
          </div>

          <div className="flex gap-4">
            <button className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl shadow-xl transition">
              Export PDF
            </button>
            <button className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl shadow-xl transition">
              Export Excel
            </button>
          </div>
        </div>

        {/* Column Filter Icons */}
        <div className="flex gap-8">
          <FilterDropdown title="Block" options={uniqueBlocks} selected={blockFilter} setSelected={setBlockFilter} />
          <FilterDropdown title="Target Pest" options={uniquePests} selected={pestFilter} setSelected={setPestFilter} />
          <FilterDropdown title="Equipment" options={uniqueEquipment} selected={equipmentFilter} setSelected={setEquipmentFilter} />
          <FilterDropdown title="Applicator" options={uniqueApplicators} selected={applicatorFilter} setSelected={setApplicatorFilter} />
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