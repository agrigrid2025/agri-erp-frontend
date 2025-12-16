import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';

export default function AssignCrop() {
  const { tenant, blockId } = useParams();
  const [block, setBlock] = useState(null);
  const [crops, setCrops] = useState([]);
  const [selectedCrop, setSelectedCrop] = useState('');
  const [plantingDate, setPlantingDate] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    // Load block and crop types
    fetch(`https://${tenant}.agrigrid.net/agrimap/api/map/data/`, { credentials: 'include' })
      .then(r => r.json())
      .then(data => {
        const currentBlock = data.blocks.find(b => b.id === parseInt(blockId));
        setBlock(currentBlock);
        setSelectedCrop(currentBlock.crop || '');
        setCrops(data.cropTypes || []);
        setLoading(false);
      });
  }, [tenant, blockId]);

  const handleSave = async () => {
    setSaving(true);
    setMessage('');
    try {
      const res = await fetch(`https://${tenant}.agrigrid.net/agrimap/block/${blockId}/assign-crop/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          crop_type: selectedCrop,
          planting_date: plantingDate,
        }),
        credentials: 'include',
      });
      if (res.ok) {
        setMessage('Crop assigned successfully!');
        setTimeout(() => window.location.href = `/dashboard/${tenant}/map/blocks`, 1500);
      } else {
        setMessage('Save failed');
      }
    } catch (err) {
      setMessage('Network error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="text-center py-20">Loading...</div>;

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8">Assign Crop to Block: {block?.name}</h1>

      <div className="bg-white rounded-2xl shadow-xl p-8">
        <div className="mb-6">
          <label className="block text-lg font-medium text-gray-700 mb-2">Crop Type</label>
          <select
            value={selectedCrop || ''}
            onChange={(e) => setSelectedCrop(e.target.value)}
            className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 text-lg"
          >
            <option value="">-- No crop --</option>
            {crops.map(crop => (
              <option key={crop.id} value={crop.id}>{crop.name}</option>
            ))}
          </select>
        </div>

        <div className="mb-8">
          <label className="block text-lg font-medium text-gray-700 mb-2">Planting Date</label>
          <input
            type="date"
            value={plantingDate}
            onChange={(e) => setPlantingDate(e.target.value)}
            className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 text-lg"
          />
        </div>

        <div className="flex justify-end gap-4">
          <Link
            to={`/dashboard/${tenant}/map/blocks`}
            className="px-8 py-4 border border-gray-300 rounded-xl text-lg font-medium hover:bg-gray-50 transition"
          >
            Cancel
          </Link>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-12 py-4 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white font-bold rounded-xl text-lg transition"
          >
            {saving ? 'Saving...' : 'Save Assignment'}
          </button>
        </div>

        {message && (
          <p className={`mt-8 text-center text-xl font-medium ${message.includes('success') ? 'text-green-600' : 'text-red-600'}`}>
            {message}
          </p>
        )}
      </div>
    </div>
  );
}