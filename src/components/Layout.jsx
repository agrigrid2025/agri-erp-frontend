import { useState } from 'react';
import { Link, Outlet, useParams, useNavigate } from 'react-router-dom';

export default function Layout() {
  const { tenant } = useParams();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Get user from localStorage
  const userJson = localStorage.getItem('user');
  const user = userJson ? JSON.parse(userJson) : null;

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
      {/* Sidebar - collapsible */}
      <aside
        className={`fixed inset-y-0 left-0 z-30 w-64 bg-white shadow-xl transform transition-transform duration-300 lg:relative lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } flex flex-col`}
      >
        {/* Logo Header */}
        <div className="p-6 border-b flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="AgriGrid Logo" className="h-10 w-auto" />
            <div>
              <h1 className="font-bold text-lg text-green-800">AgriGrid</h1>
              <p className="text-xs text-gray-600 uppercase">{tenant}</p>
            </div>
          </div>
          {/* Close button on mobile */}
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-2 rounded hover:bg-gray-100"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
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
            {/* Admin settings... */}
          </SidebarSection>

          {/* Add your other sections here exactly as before */}
          {/* AgriMap, AgriSafe, AgriSpray, Equipment, etc. */}
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

      {/* Mobile hamburger */}
      <button
        onClick={() => setSidebarOpen(true)}
        className="fixed top-4 left-4 z-40 lg:hidden p-3 bg-white rounded-lg shadow-lg hover:shadow-xl"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* Main Content - full width */}
      <main className="flex-1 p-8 lg:p-12 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}

// Sidebar helpers (keep these)
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