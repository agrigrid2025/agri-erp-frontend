import { BrowserRouter, Routes, Route } from 'react-router-dom';
import TenantEntry from './components/TenantEntry';
import LoginPage from './components/LoginPage';
import Layout from './components/Layout';
import DashboardHome from './components/DashboardHome';
import { AuthProvider } from './context/AuthContext';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<TenantEntry />} />
          <Route path="/login/:tenant" element={<LoginPage />} />
          <Route path="/dashboard/:tenant" element={<Layout />}>
            <Route index element={<DashboardHome />} />
            <Route path="weather" element={<WeatherForecast />} />
            {/* Add more routes later: /dashboard/:tenant/inventory etc. */}
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;