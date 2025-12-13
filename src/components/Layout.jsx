import { useState } from 'react';
import { Link, Outlet, useParams, useNavigate } from 'react-router-dom';

export default function Layout() {
  const { tenant } = useParams();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [settingsOpen, setSettingsOpen] = useState(false);

  // Get user from localStorage (simple for now — we'll improve with context later)
  const user = JSON.parse(localStorage.getItem('user') || 'null');
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
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Top Navbar */}
      <nav className="bg-white border-b shadow-sm px-6 py-4">
        <div className="max-w-screen-2xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-2 rounded hover:bg-gray-100"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <div className="flex items-center gap-3">
              <img src="/logo.png" alt="AgriGrid Logo" className="h-10 w-auto" />
              <span className="text-xl font-bold text-gray-800">AgriGrid BETA – {tenant.toUpperCase()}</span>
            </div>
          </div>

          {/* Top Right Settings Dropdown */}
          <div className="relative">
            <button
              onClick={() => setSettingsOpen(!settingsOpen)}
              className="flex items-center gap-2 text-gray-700 hover:text-gray-900"
            >
              <span>Settings</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {settingsOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border z-50">
                <div className="py-1">
                  {isAdmin && (
                    <>
                      <Link to={`/dashboard/${tenant}/admin/users`} className="block px-4 py-2 text-sm hover:bg-gray-100">User Management</Link>
                      <Link to={`/dashboard/${tenant}/admin/company`} className="block px-4 py-2 text-sm hover:bg-gray-100">Company Settings</Link>
                      <Link to={`/dashboard/${tenant}/admin/global`} className="block px-4 py-2 text-sm font-medium text-indigo-600 hover:bg-gray-100">Global Settings</Link>
                      <hr className="my-1 border-gray-200" />
                    </>
                  )}
                  <Link to={`/dashboard/${tenant}/profile`} className="block px-4 py-2 text-sm hover:bg-gray-100">Profile</Link>
                  <button onClick={handleLogout} className="w-full text-left block px-4 py-2 text-sm text-red-600 hover:bg-gray-100">Logout</button>
                </div>
              </div>
            )}
          </div>
        </div>
      </nav>

      <div className="flex flex-1">
        {/* Sidebar */}
        <div className={`${sidebarOpen ? 'w-64' : 'w-16'} transition-all duration-300 bg-white shadow-lg overflow-y-auto`}>
          {/* ... sidebar content from before ... */}

          {/* Add admin-only settings in sidebar sections */}
          {isAdmin && (
            <SidebarItem icon="⚙️" label="Admin Settings" open={sidebarOpen}>
              <SidebarLink to={`/dashboard/${tenant}/admin/users`} label="User Management" open={sidebarOpen} />
              <SidebarLink to={`/dashboard/${tenant}/admin/company`} label="Company Settings" open={sidebarOpen} />
            </SidebarItem>
          )}

          {/* In Inventory, AgriMap, etc., add admin sub-menus similarly with {isAdmin && (...)} */}
        </div>

        <div className="flex-1 p-8 overflow-auto">
          <Outlet />
        </div>
      </div>
    </div>
  );
}