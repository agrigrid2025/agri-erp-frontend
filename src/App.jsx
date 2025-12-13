import { BrowserRouter, Routes, Route } from 'react-router-dom';
import TenantEntry from './components/TenantEntry';
import LoginPage from './components/LoginPage';
import Dashboard from './components/Dashboard';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<TenantEntry />} />
        <Route path="/login/:tenant" element={<LoginPage />} />
        <Route path="/dashboard/:tenant" element={<Dashboard />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;