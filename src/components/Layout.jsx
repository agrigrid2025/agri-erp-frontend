import { useState } from 'react';
import { Link, Outlet, useParams, useNavigate } from 'react-router-dom';

export default function Layout() {
  const { tenant } = useParams();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Get user from localStorage (set on login)
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
      <div className={`${sidebarOpen ? 'w-64' : 'w-20'} transition-all duration-300 bg-white shadow-lg flex flex-col`}>
        {/* Logo + Title */}
        <div className="p-4 border-b">
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="AgriGrid Logo" className="h-10 w-auto" />
            {sidebarOpen && (
              <div>
                <h1 className="font-bold text-lg text-green-800">AgriGrid</h1>
                <p className="text-xs text-gray-600 uppercase">{tenant}</p>
              </div>
            )}
          </div>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="absolute top-6 -right-3 bg-white rounded-full p-1 shadow-md hover:shadow-lg"
          >
            <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={sidebarOpen ? "M15 19l-7-7 7-7" : "M9 5l7 7-7 7"} />
            </svg>
          </button>
        </div>

        {/* Scrollable Menu */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-2">
          {/* My Farm */}
          <SidebarSection title="My Farm" icon="🌤️" open={sidebarOpen}>
            <SidebarLink to={`/dashboard/${tenant}/weather`} label="Weather Forecast" open={sidebarOpen} />
          </SidebarSection>

          {/* Inventory */}
          <SidebarSection title="Inventory" icon="📦" open={sidebarOpen}>
            <SidebarLink to="inventory/items" label="Items" open={sidebarOpen} />
            <SidebarLink to="suppliers" label="Suppliers" open={sidebarOpen} />
            <SidebarLink to="inventory/po" label="Purchase Orders" open={sidebarOpen} />
            <SidebarLink to="inventory/receipts" label="Purchase Receipts" open={sidebarOpen} />
            <SidebarLink to="inventory/stock" label="Stock by Location" open={sidebarOpen} />

            {isAdmin && (
              <div className="ml-6 mt-2 space-y-1">
                <p className="text-xs font-medium text-gray-500 uppercase">Settings</p>
                <SidebarLink to="inventory/uom" label="Units of Measure" open={sidebarOpen} />
                <SidebarLink to="inventory/categories" label="Item Categories" open={sidebarOpen} />
                <SidebarLink to="inventory/warehouses" label="Warehouses" open={sidebarOpen} />
                <SidebarLink to="inventory/locations" label="Locations" open={sidebarOpen} />
                <SidebarLink to="inventory/adjust" label="Adjust Stock" open={sidebarOpen} />
              </div>
            )}
          </SidebarSection>

          {/* AgriMap */}
          <SidebarSection title="AgriMap" icon="🗺️" open={sidebarOpen}>
            <SidebarLink to="map/blocks" label="Blocks (Map)" open={sidebarOpen} />
            <SidebarLink to="map/blocks-table" label="Blocks (Table)" open={sidebarOpen} />

            {isAdmin && (
              <div className="ml-6 mt-2 space-y-1">
                <p className="text-xs font-medium text-gray-500 uppercase">Settings</p>
                <SidebarLink to="map/farm-location" label="Define Farm Location" open={sidebarOpen} />
                <SidebarLink to="map/define-blocks" label="Define Blocks" open={sidebarOpen} />
                <SidebarLink to="map/crop-types" label="Crop Types" open={sidebarOpen} />
              </div>
            )}
          </SidebarSection>

          {/* AgriSafe */}
          <SidebarSection title="AgriSafe" icon="🛡️" open={sidebarOpen}>
            <SidebarLink to="safety/hazards" label="Hazard Register" open={sidebarOpen} />
            <SidebarLink to="safety/incidents" label="Incident Register" open={sidebarOpen} />

            {isAdmin && (
              <>
                <SidebarLink to="safety/hazard-types" label="Hazard Types" open={sidebarOpen} />
                <SidebarLink to="safety/incident-types" label="Incident Types" open={sidebarOpen} />
              </>
            )}
          </SidebarSection>

          {/* AgriSpray */}
          <SidebarSection title="AgriSpray" icon="🌫️" open={sidebarOpen}>
            <SidebarLink to="spray/plans" label="Spray Plans" open={sidebarOpen} />
          </SidebarSection>

          {/* Equipment */}
          <SidebarSection title="Equipment" icon="🚜" open={sidebarOpen}>
            <SidebarLink to="equipment/list" label="Equipment List" open={sidebarOpen} />

            {isAdmin && (
              <div className="ml-6 mt-2 space-y-1">
                <p className="text-xs font-medium text-gray-500 uppercase">Settings</p>
                <SidebarLink to="equipment/types" label="Equipment Types" open={sidebarOpen} />
              </div>
            )}
          </SidebarSection>

          {/* Admin Settings (Top Level) */}
          {isAdmin && (
            <SidebarSection title="Admin Settings" icon="⚙️" open={sidebarOpen}>
              <SidebarLink to="admin/users" label="User Management" open={sidebarOpen} />
              <SidebarLink to="admin/company" label="Company Settings" open={sidebarOpen} />
              <SidebarLink to="admin/global" label="Global Settings" open={sidebarOpen} />
            </SidebarSection>
          )}
        </nav>

        {/* Logout at bottom */}
        <div className="p-4 border-t">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 text-red-600 hover:bg-red-50 rounded-lg px-3 py-2 transition"
          >
            <span className="text-xl">🚪</span>
            {sidebarOpen && <span className="font-medium">Logout</span>}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Slim Top Bar (optional - just tenant name) */}
        <header className="bg-white border-b px-6 py-3 shadow-sm">
          <div className="max-w-screen-2xl mx-auto flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-800">
              Dashboard
            </h2>
            <p className="text-sm text-gray-600">
              Logged in as <span className="font-medium">{user?.username || 'User'}</span>
              {user?.role && <span className="ml-2 text-green-600">({user.role})</span>}
            </p>
          </div>
        </header>

        <main className="flex-1 p-8 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

// Reusable components
function SidebarSection({ title, icon, children, open }) {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="mb-2">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-green-50 transition text-left"
      >
        <span className="flex items-center gap-3">
          <span className="text-2xl">{icon}</span>
          {open && <span className="font-medium text-gray-800">{title}</span>}
        </span>
        {open && children && (
          <svg className={`w-5 h-5 text-gray-500 transition-transform ${isOpen ? 'rotate-90' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        )}
      </button>
      {open && isOpen && <div className="mt-1">{children}</div>}
    </div>
  );
}

function SidebarLink({ to, label, open }) {
  return (
    <Link
      to={to}
      className="block py-2 px-4 ml-8 rounded hover:bg-green-100 transition text-sm text-gray-700 hover:text-green-800"
    >
      {open ? label : '•'}
    </Link>
  );
}