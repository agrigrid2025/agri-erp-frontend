export default function TenantEntry() {
  const handleSubmit = (e) => {
    e.preventDefault();
    const tenant = e.target.tenant.value.trim().toLowerCase();
    if (tenant) {
      window.location.href = `/login/${tenant}`;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-700 to-green-900 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-10 max-w-md w-full text-center">
        <h1 className="text-4xl font-bold text-green-800 mb-4">AgriGrid ERP</h1>
        <p className="text-gray-600 mb-8">Enter your farm code to continue</p>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            name="tenant"
            type="text"
            placeholder="e.g. costawalkamin"
            className="px-6 py-4 text-lg border border-gray-300 rounded-xl focus:outline-none focus:ring-4 focus:ring-green-500"
            required
          />
          <button
            type="submit"
            className="bg-green-700 hover:bg-green-800 text-white font-semibold py-4 rounded-xl transition"
          >
            Continue
          </button>
        </form>
      </div>
    </div>
  );
}

export default TenantEntry;