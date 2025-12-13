import { useState } from 'react';
import { Link, Outlet, useParams } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';

export default function Layout() {
  const { tenant } = useParams();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const handleLogout = () => {
    // Simple logout — clear session by hitting Django logout
    fetch(`https://${tenant}.agrigrid.net/logout/`, {
      method: 'POST',
      credentials: 'include',
    }).finally(() => {
      navigate('/');
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'w-64' : 'w-16'} transition-all duration-300 bg-white shadow-lg`}>
        <div className="p-4">
          <div className="flex items-center justify-between mb-8">
            <h1 className={`font-bold text-xl text-green-800 ${!sidebarOpen && 'hidden'}`}>
              AgriGrid
            </h1>
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 rounded hover:bg-gray-100"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>

          <nav className="space-y-2">
            {/* My Farm */}
            <SidebarItem icon="🌤️" label="My Farm" open={sidebarOpen}>
              <SidebarLink to={`/dashboard/${tenant}/weather`} label="Weather Forecast" open={sidebarOpen} />
            </SidebarItem>

            {/* Inventory */}
            <SidebarItem icon="📦" label="Inventory" open={sidebarOpen}>
              <SidebarLink to={`/dashboard/${tenant}/inventory/items`} label="Items" open={sidebarOpen} />
              <SidebarLink to={`/dashboard/${tenant}/suppliers`} label="Suppliers" open={sidebarOpen} />
              <SidebarLink to={`/dashboard/${tenant}/inventory/stock`} label="Stock by Location" open={sidebarOpen} />
            </SidebarItem>

            {/* AgriMap */}
            <SidebarItem icon="🗺️" label="AgriMap" open={sidebarOpen}>
              <SidebarLink to={`/dashboard/${tenant}/map/blocks`} label="Blocks (Map)" open={sidebarOpen} />
              <SidebarLink to={`/dashboard/${tenant}/map/blocks-table`} label="Blocks (Table)" open={sidebarOpen} />
            </SidebarItem>

            {/* AgriSafe */}
            <SidebarItem icon="🛡️" label="AgriSafe" open={sidebarOpen}>
              <SidebarLink to={`/dashboard/${tenant}/safety/hazards`} label="Hazard Register" open={sidebarOpen} />
              <SidebarLink to={`/dashboard/${tenant}/safety/incidents`} label="Incident Register" open={sidebarOpen} />
            </SidebarItem>

            {/* AgriSpray */}
            <SidebarItem icon="🌫️" label="AgriSpray" open={sidebarOpen}>
              <SidebarLink to={`/dashboard/${tenant}/spray/plans`} label="Spray Plans" open={sidebarOpen} />
            </SidebarItem>

            {/* Equipment */}
            <SidebarItem icon="⚙️" label="Equipment" open={sidebarOpen}>
              <SidebarLink to={`/dashboard/${tenant}/equipment/list`} label="Equipment List" open={sidebarOpen} />
            </SidebarItem>
          </nav>

          <div className="absolute bottom-4 left-4 right-4">
            <button
              onClick={handleLogout}
              className="w-full py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition"
            >
              {sidebarOpen ? 'Logout' : '🚪'}
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8">
        <Outlet /> {/* This renders the current page (dashboard home, etc.) */}
      </div>
    </div>
  );
}

// Helper components
function SidebarItem({ icon, label, children, open }) {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="mb-2">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-green-50 transition"
      >
        <span className="flex items-center gap-3">
          <span className="text-xl">{icon}</span>
          {open && <span className="font-medium">{label}</span>}
        </span>
        {open && children && (
          <svg className={`w-4 h-4 transition ${isOpen ? 'rotate-90' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        )}
      </button>
      {open && isOpen && <div className="ml-8 mt-1 space-y-1">{children}</div>}
    </div>
  );
}

function SidebarLink({ to, label, open }) {
  return (
    <Link
      to={to}
      className="block py-2 px-4 rounded hover:bg-green-100 transition text-sm"
    >
      {open ? label : '•'}
    </Link>
  );
}