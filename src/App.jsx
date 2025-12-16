import { BrowserRouter, Routes, Route } from 'react-router-dom';
import TenantEntry from './components/TenantEntry';
import LoginPage from './components/LoginPage';
import Layout from './components/Layout';
import DashboardHome from './components/DashboardHome';
import { AuthProvider } from './context/AuthContext';
import WeatherForecast from './components/WeatherForecast';
import DayDetail from './components/DayDetail';
import SetWeatherLocation from './components/SetWeatherLocation';
import AgriMapView from './components/AgriMapView';
import BlocksTable from './components/BlocksTable';
import DefineBlocks from './components/DefineBlocks';
import SetFarmLocation from './components/SetFarmLocation';
import UserManagement from './components/UserManagement';
import UserForm from './components/UserForm';
import CompanySettings from './components/CompanySettings';
import GlobalSettings from './components/GlobalSettings';
import CropTypeList from './components/CropTypeList';
import CropTypeForm from './components/CropTypeForm';


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
            <Route path="weather/day/:date" element={<DayDetail />} />
            <Route path="weather/set-location" element={<SetWeatherLocation />} />
            <Route path="map/blocks" element={<AgriMapView />} />
            <Route path="map/blocks-table" element={<BlocksTable />} />
            <Route path="map/define-blocks" element={<DefineBlocks />} />
            <Route path="map/set-location" element={<SetFarmLocation />} />
            <Route path="map/crop-types" element={<CropTypeList />} />
            <Route path="map/crop-types/add" element={<CropTypeForm />} />
            <Route path="map/crop-types/edit/:cropId" element={<CropTypeForm />} />
            <Route path="/dashboard/:tenant/users" element={<UserManagement />} />
            <Route path="/dashboard/:tenant/users/add" element={<UserForm mode="add" />} />
            <Route path="/dashboard/:tenant/users/edit/:userId" element={<UserForm mode="edit" />} />
            <Route path="/dashboard/:tenant/admin/company" element={<CompanySettings />} />
            <Route path="/dashboard/:tenant/admin/global" element={<GlobalSettings />} />
            <Route path="/dashboard/:tenant/admin/users" element={<UserManagement />} />  
            <Route path="/dashboard/:tenant/crop-types" element={<CropTypeList />} />
            <Route path="/dashboard/:tenant/crop-types/add" element={<CropTypeForm />} />
            <Route path="/dashboard/:tenant/crop-types/edit/:cropId" element={<CropTypeForm />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;