import { BrowserRouter, Routes, Route } from 'react-router-dom';
import TenantEntry from './components/TenantEntry';
import LoginPage from './components/LoginPage';
import Layout from './components/Layout';
import DashboardHome from './components/DashboardHome';
import { AuthProvider } from './context/AuthContext';
import WeatherForecast from './components/WeatherForecast';
import DayDetail from './components/DayDetail';
import SetWeatherLocation from './components/SetWeatherLocation';

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
            <Route path="/dashboard/:tenant/weather/day/:date" element={<DayDetail />} />
            <Route path="/dashboard/:tenant/weather/set-location" element={<SetWeatherLocation />} />
            <Route path="/dashboard/:tenant/map/blocks" element={<AgriMapView />} />
            <Route path="/dashboard/:tenant/map/blocks-table" element={<BlocksTable />} />
            <Route path="/dashboard/:tenant/map/define-blocks" element={<DefineBlocks />} />
            <Route path="/dashboard/:tenant/map/set-location" element={<SetFarmLocation />} />
            {/* Add more routes later: /dashboard/:tenant/inventory etc. */}
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;