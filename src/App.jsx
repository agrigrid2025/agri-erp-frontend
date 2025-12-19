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
import AssignCrop from './components/AssignCrop';
import HazardList from './components/HazardList';
import HazardForm from './components/HazardForm';
import HazardDetail from './components/HazardDetail';
import IncidentTypeList from './components/IncidentTypeList';
import IncidentTypeForm from './components/IncidentTypeForm';
import IncidentList from './components/IncidentList';
import IncidentForm from './components/IncidentForm';
import IncidentDetail from './components/IncidentDetail';
import HazardTypeList from './components/HazardTypeList';
import HazardTypeForm from './components/HazardTypeForm';
import ItemsList from './components/ItemsList';
import ItemForm from './components/ItemForm';
import ItemDetail from './components/ItemDetail';
import CategoryList from './components/CategoryList';
import CategoryForm from './components/CategoryForm';
import WarehouseList from './components/WarehouseList';
import WarehouseForm from './components/WarehouseForm';


function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<TenantEntry />} />
          <Route path="/login/:tenant" element={<LoginPage />} />
          
          <Route path="/dashboard/:tenant" element={<Layout />}>
            <Route index element={<DashboardHome />} />
            
            {/* Weather */}
            <Route path="weather" element={<WeatherForecast />} />
            <Route path="weather/day/:date" element={<DayDetail />} />
            <Route path="weather/set-location" element={<SetWeatherLocation />} />
            
            {/* AgriMap */}
            <Route path="map/blocks" element={<AgriMapView />} />
            <Route path="map/blocks-table" element={<BlocksTable />} />
            <Route path="map/define-blocks" element={<DefineBlocks />} />
            <Route path="map/set-location" element={<SetFarmLocation />} />
            <Route path="map/crop-types" element={<CropTypeList />} />
            <Route path="map/crop-types/add" element={<CropTypeForm />} />
            <Route path="map/crop-types/edit/:cropId" element={<CropTypeForm />} />
            <Route path="map/assign-crop/:blockId" element={<AssignCrop />} />
            
            {/* User Management */}
            <Route path="users" element={<UserManagement />} />
            <Route path="users/add" element={<UserForm mode="add" />} />
            <Route path="users/edit/:userId" element={<UserForm mode="edit" />} />
            
            {/* Admin Settings */}
            <Route path="admin/company" element={<CompanySettings />} />
            <Route path="admin/global" element={<GlobalSettings />} />
            <Route path="admin/users" element={<UserManagement />} />
            
            {/* AgriSafe */}
            <Route path="safety/hazards" element={<HazardList />} />
            <Route path="safety/hazards/new" element={<HazardForm />} />
            <Route path="safety/hazards/:hazardId" element={<HazardDetail />} />
            <Route path="safety/hazard-types" element={<HazardTypeList />} />
            <Route path="safety/hazard-types/add" element={<HazardTypeForm />} />
            <Route path="safety/hazard-types/edit/:typeId" element={<HazardTypeForm />} />
            <Route path="safety/incident-types" element={<IncidentTypeList />} />
            <Route path="safety/incident-types/add" element={<IncidentTypeForm />} />
            <Route path="safety/incident-types/edit/:typeId" element={<IncidentTypeForm />} />
            <Route path="safety/incidents" element={<IncidentList />} />
            <Route path="safety/incidents/new" element={<IncidentForm />} />
            <Route path="safety/incidents/:incidentId" element={<IncidentDetail />} />

            {/* Inventory3 */}
            <Route path="inventory/items" element={<ItemsList />} />
            <Route path="inventory/items/new" element={<ItemForm />} />
            <Route path="inventory/items/:itemId" element={<ItemDetail />} />
            <Route path="inventory/items/edit/:itemId" element={<ItemForm />} />
            <Route path="inventory/categories" element={<CategoryList />} />
            <Route path="inventory/categories/add" element={<CategoryForm />} />
            <Route path="inventory/categories/edit/:catId" element={<CategoryForm />} />
            <Route path="inventory/warehouses" element={<WarehouseList />} />
            <Route path="inventory/warehouses/add" element={<WarehouseForm />} />
            <Route path="inventory/warehouses/edit/:whId" element={<WarehouseForm />} />

          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;