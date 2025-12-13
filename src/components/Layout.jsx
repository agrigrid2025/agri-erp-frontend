import { useState } from 'react';
import { Link, Outlet, useParams, useNavigate } from 'react-router-dom';

export default function Layout() {
  const { tenant } = useParams();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const userJson = localStorage.getItem('user');
  const user = userJson ? JSON.parse(userJson) : null;
  const isAdmin = user?.role === 'admin';

  const handleLogout = () => {
    fetch(`https://${tenant}.agrigrid.net/logout/`, {
      method: 'POST',
      credentials: 'include',
    }).finally(() => {
      localStorage.removeItem('user');
      navigate('/');
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-30 w-64 bg-white shadow-xl transform transition-transform duration-300 lg:relative lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} flex flex-col`}>
        {/* Logo */}
        <div className="p-6 border-b">
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="AgriGrid Logo" className="h-10 w-auto" />
            <div>
              <h1 className="font-bold text-lg text-green-800">AgriGrid</h1>
              <p className="text-xs text-gray-600 uppercase">{tenant}</p>
            </div>
          </div>
        </div>

        {/* Menu */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {/* My Farm */}
          <SidebarSection title="My Farm" icon="🌤️">
            <SidebarLink to="weather" label="Weather Forecast" />
          </SidebarSection>

          {/* Inventory */}
          <SidebarSection title="Inventory" icon="📦">
            <SidebarLink to="inventory/items" label="Items" />
            <SidebarLink to="suppliers" label="Suppliers" />
            <SidebarLink to="inventory/po" label="Purchase Orders" />
            <SidebarLink to="inventory/receipts" label="Purchase Receipts" />
            <SidebarLink to="inventory/stock" label="Stock by Location" />
            {isAdmin && (
              <div className="ml-8 mt-2 space-y-1">
                <p className="text-xs font-medium text-gray-500 uppercase">Settings</p>
                <SidebarLink to="inventory/uom" label="Units of Measure" />
                <SidebarLink to="inventory/categories" label="Item Categories" />
                <SidebarLink to="inventory/warehouses" label="Warehouses" />
                <SidebarLink to="inventory/locations" label="Locations" />
                <SidebarLink to="inventory/adjust" label="Adjust Stock" />
              </div>
            )}
          </SidebarSection>

          {/* AgriMap */}
          <SidebarSection title="AgriMap" icon="🗺️">
            <SidebarLink to="map/blocks" label="Blocks (Map)" />
            <SidebarLink to="map/blocks-table" label="Blocks (Table)" />
            {isAdmin && (
              <div className="ml-8 mt-2 space-y-1">
                <p className="text-xs font-medium text-gray-500 uppercase">Settings</p>
                <SidebarLink to="map/farm-location" label="Define Farm Location" />
                <SidebarLink to="map/define-blocks" label="Define Blocks" />
                <SidebarLink to="map/crop-types" label="Crop Types" />
              </div>
            )}
          </SidebarSection>

          {/* AgriSafe */}
          <SidebarSection title="AgriSafe" icon="🛡️">
            <SidebarLink to="safety/hazards" label="Hazard Register" />
            <SidebarLink to="safety/incidents" label="Incident Register" />
            {isAdmin && (
              <>
                <SidebarLink to="safety/hazard-types" label="Hazard Types" />
                <SidebarLink to="safety/incident-types" label="Incident Types" />
              </>
            )}
          </SidebarSection>

          {/* AgriSpray */}
          <SidebarSection title="AgriSpray" icon="🌫️">
            <SidebarLink to="spray/plans" label="Spray Plans" />
          </SidebarSection>

          {/* Equipment */}
          <SidebarSection title="Equipment" icon="🚜">
            <SidebarLink to="equipment/list" label="Equipment List" />
            {isAdmin && (
              <div className="ml-8 mt-2 space-y-1">
                <p className="text-xs font-medium text-gray-500 uppercase">Settings</p>
                <SidebarLink to="equipment/types" label="Equipment Types" />
              </div>
            )}
          </SidebarSection>

          {/* Admin Settings */}
          {isAdmin && (
            <SidebarSection title="Admin Settings" icon="⚙️">
              <SidebarLink to="admin/users" label="User Management" />
              <SidebarLink to="admin/company" label="Company Settings" />
              <SidebarLink to="admin/global" label="Global Settings" />
            </SidebarSection>
          )}
        </nav>

        {/* Bottom: User + Logout */}
        <div className="p-4 border-t space-y-3">
          {user && (
            <p className="text-sm text-gray-600 text-center">
              Logged in as <span className="font-medium">{user.username}</span>
              {user.role && <span className="ml-1 text-green-600">({user.role})</span>}
            </p>
          )}
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-3 text-red-600 hover:bg-red-50 rounded-lg px-4 py-2 transition font-medium"
          >
            <span className="text-xl">🚪</span>
            Logout
          </button>
        </div>
      </aside>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Mobile hamburger button */}
      <button
        onClick={() => setSidebarOpen(true)}
        className="fixed top-4 left-4 z-40 lg:hidden p-3 bg-white rounded-lg shadow-lg hover:shadow-xl"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* Main content */}
      <main className="flex-1 p-8 lg:p-12 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}

// Sidebar helpers
function SidebarSection({ title, icon, children }) {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="mb-2">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-green-50 transition text-left"
      >
        <span className="flex items-center gap-3">
          <span className="text-2xl">{icon}</span>
          <span className="font-medium text-gray-800">{title}</span>
        </span>
        {children && (
          <svg
            className={`w-5 h-5 text-gray-500 transition-transform ${isOpen ? 'rotate-90' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        )}
      </button>
      {isOpen && <div className="mt-1">{children}</div>}
    </div>
  );
}

function SidebarLink({ to, label }) {
  return (
    <Link
      to={to}
      className="block py-2 px-4 ml-8 rounded hover:bg-green-100 transition text-sm text-gray-700 hover:text-green-800"
    >
      {label}
    </Link>
  );
}