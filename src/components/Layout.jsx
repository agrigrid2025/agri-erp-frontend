import { useState } from 'react';
import { Link, Outlet, useParams, useNavigate } from 'react-router-dom';

export default function Layout() {
  const { tenant } = useParams();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false); // Closed by default on mobile

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
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Top Bar - aligned with sidebar */}
      <header className="bg-white border-b border-gray-200 px-6 py-4 shadow-sm z-10">
        <div className="max-w-screen-2xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* Mobile menu button */}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-2 rounded hover:bg-gray-100"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <h2 className="text-xl font-semibold text-gray-800">Dashboard</h2>
          </div>
          <div className="text-sm text-gray-600">
            Logged in as <span className="font-medium">{user?.username || 'User'}</span>
            {user?.role && <span className="ml-2 text-green-600">({user.role})</span>}
          </div>
        </div>
      </header>

      <div className="flex flex-1">
        {/* Sidebar - collapsible */}
        <aside className={`fixed inset-y-0 left-0 z-20 w-64 bg-white shadow-lg transform transition-transform duration-300 lg:relative lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          <div className="h-full flex flex-col">
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
              {/* Your sidebar sections here — same as before */}
              {/* Example */}
              <SidebarSection title="My Farm" icon="🌤️" open={true}>
                <SidebarLink to="weather" label="Weather Forecast" open={true} />
              </SidebarSection>
              {/* ... rest of your sections ... */}
            </nav>

            {/* Logout */}
            <div className="p-4 border-t">
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 text-red-600 hover:bg-red-50 rounded-lg px-3 py-2 transition"
              >
                <span className="text-xl">🚪</span>
                <span className="font-medium">Logout</span>
              </button>
            </div>
          </div>
        </aside>

        {/* Overlay for mobile */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-10 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main Content */}
        <main className="flex-1 p-8 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

// Keep your SidebarSection and SidebarLink helpers as before
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
          <span className="font-medium text-gray-800">{title}</span>
        </span>
        {children && (
          <svg className={`w-5 h-5 text-gray-500 transition-transform ${isOpen ? 'rotate-90' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        )}
      </button>
      {isOpen && <div className="mt-1">{children}</div>}
    </div>
  );
}

function SidebarLink({ to, label, open }) {
  return (
    <Link
      to={to}
      className="block py-2 px-4 ml-8 rounded hover:bg-green-100 transition text-sm text-gray-700 hover:text-green-800"
    >
      {label}
    </Link>
  );
}