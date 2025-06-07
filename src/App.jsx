import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import PrivateRoute from './components/PrivateRoute';
import AccueilDashboard from './pages/AccueilDashboard';
import AdminSettings from './pages/AdminSettings';
import SuiviJour from './pages/SuiviJour';
import { Toaster } from 'react-hot-toast';
import DiagnosticAPI from './pages/DiagnosticAPI';
import SuiviFinancier from './pages/SuiviFinancier';
import Journalisation from './pages/Journalisation';


function App() {
  return (
    
  

    <BrowserRouter>
    <Toaster position="top-right" toastOptions={{ duration: 1500 }} />

      <Routes>
        {/* <Route path="/suivi-financier" element={<PrivateRoute>
          <SuiviFinancier />
          </PrivateRoute>    } /> */}
        <Route path="/diagnostic-api" element={
          <PrivateRoute>
          <DiagnosticAPI />
          </PrivateRoute>    } />
        <Route path="/" element={<Login />} />
        <Route path="/dashboard" element={
          <PrivateRoute>
          <AccueilDashboard />
          </PrivateRoute>    } /><Route
  path="/suivi-jour"
  element={
    <PrivateRoute>
      <SuiviJour />
    </PrivateRoute>
  }
/><Route
  path="/journalisation"
  element={
    <PrivateRoute>
      <Journalisation />
    </PrivateRoute>
  }
/>
           <Route path="/admin-settings" element={
  <PrivateRoute>
    <AdminSettings />
  </PrivateRoute>
} />
      </Routes>
     
    </BrowserRouter>
    

  );
}

export default App
