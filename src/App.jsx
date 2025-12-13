import { BrowserRouter, Routes, Route } from 'react-router-dom';
import TenantEntry from './components/TenantEntry';
import LoginPage from './components/LoginPage';
import Layout from './components/Layout';
import DashboardHome from './components/DashboardHome';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<TenantEntry />} />
        <Route path="/login/:tenant" element={<LoginPage />} />
        <Route path="/dashboard/:tenant" element={<Layout />}>
          <Route index element={<DashboardHome />} />
          {/* Add more routes later: /dashboard/:tenant/inventory etc. */}
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;