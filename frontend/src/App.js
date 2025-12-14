import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import authService from './services/authService';

// --- IMPORTACIONES DE COMPONENTES ---
import Login from './components/auth/Login';
import Header from './components/services/Header';
import ResetPassword from './components/auth/ResetPassword';

// Dashboards
import DashboardAdmin from './components/dashboard/DashboardAdmin';
import DashboardSolicitante from './components/dashboard/DashboardSolicitante';

// Reservas
import CalendarioReservas from './components/Reservas/CalendarioReservas';
import MisReservas from './components/Reservas/MisReservas';
import AprobacionPanel from './components/AprobacionPanel';

// Administración y Gestión
import GestionEspacios from './components/Administración/GestionEspacios';
import GestionElementos from './components/Administración/GestionElementos';
import GestionCarreras from './components/Administración/GestionCarreras';
import GestionUsuarios from './components/Administración/GestionUsuarios';

// Reportes
import ReportesAvanzados from './components/Reportes/ReportesAvanzados'; 


// 1. CONTROLADOR DE DASHBOARD (Decide qué mostrar según el rol)
function DashboardController() {
    const user = authService.getCurrentUser();
    console.log("Rol detectado:", user?.rol_slug); 

    if (user?.rol_slug === 'admin' || user?.rol_slug === 'coordinador') {
        return <DashboardAdmin />;
    }
    return <DashboardSolicitante />;
}

// 2. RUTA PRIVADA (Ahora soporta Roles)
function PrivateRoute({ children, allowedRoles }) {
  // A. Si no está logueado -> Login
  if (!authService.isAuthenticated()) return <Navigate to="/login" />;
  
  // B. Verificación de Roles (Si la ruta exige roles específicos)
  if (allowedRoles) {
      const user = authService.getCurrentUser();
      // Si el rol del usuario NO está en la lista permitida -> Dashboard
      if (!allowedRoles.includes(user?.rol_slug)) {
          return <Navigate to="/dashboard" replace />;
      }
  }

  // C. Si pasa todo -> Muestra el sitio con Header
  return (
    <>
      <Header /> 
      <div className="py-4">{children}</div>
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Rutas Públicas */}
        <Route path="/login" element={<Login />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        
        {/* --- RUTAS COMUNES (Todos los logueados) --- */}
        <Route path="/dashboard" element={<PrivateRoute><DashboardController /></PrivateRoute>} />
        <Route path="/reservar" element={<PrivateRoute><CalendarioReservas /></PrivateRoute>} />
        <Route path="/mis-reservas" element={<PrivateRoute><MisReservas /></PrivateRoute>} />
        
        {/* --- RUTAS DE GESTIÓN (Solo Admin y Coordinador) --- */}
        <Route 
            path="/aprobacion" 
            element={<PrivateRoute allowedRoles={['admin', 'coordinador']}><AprobacionPanel /></PrivateRoute>} 
        />
        <Route 
            path="/gestion/espacios" 
            element={<PrivateRoute allowedRoles={['admin', 'coordinador']}><GestionEspacios /></PrivateRoute>} 
        />
        <Route 
            path="/gestion/elementos" 
            element={<PrivateRoute allowedRoles={['admin', 'coordinador']}><GestionElementos /></PrivateRoute>} 
        />
        
        {/* Nuevas Rutas Implementadas */}
        <Route 
            path="/gestion-carreras" 
            element={<PrivateRoute allowedRoles={['admin', 'coordinador']}><GestionCarreras /></PrivateRoute>} 
        />
        <Route 
            path="/gestion-usuarios" 
            element={<PrivateRoute allowedRoles={['admin', 'coordinador']}><GestionUsuarios /></PrivateRoute>} 
        />
        <Route 
            path="/reportes" 
            element={<PrivateRoute allowedRoles={['admin', 'coordinador']}><ReportesAvanzados /></PrivateRoute>} 
        />

        {/* Redirección por defecto */}
        <Route path="/" element={<Navigate to="/dashboard" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;