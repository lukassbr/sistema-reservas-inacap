import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import authService from './services/authService';

// --- COMPONENTES ---
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

// Administración
import GestionEspacios from './components/Administración/GestionEspacios';
import GestionElementos from './components/Administración/GestionElementos';
import GestionCarreras from './components/Administración/GestionCarreras';
import GestionUsuarios from './components/Administración/GestionUsuarios';
import ReportesAvanzados from './components/Reportes/ReportesAvanzados'; 

// 1. CONTROLADOR DE DASHBOARD (EL CEREBRO DE LA REDIRECCIÓN)
function DashboardController() {
    const user = authService.getCurrentUser();
    
    // Parche de seguridad: Convertimos a minúscula para evitar errores de tipeo en BD
    // Si rol_slug viene nulo, usamos string vacío para que no explote el toLowerCase
    const rol = user?.rol_slug?.toLowerCase() || "";

    console.log("DashboardController -> Rol detectado:", rol); 

    // Admin y Coordinador comparten la misma vista base (DashboardAdmin), 
    // pero internamente ese componente se adapta (oculta cosas)
    if (rol === 'admin' || rol === 'coordinador') {
        return <DashboardAdmin />;
    }
    
    // Si no es ninguno de los anteriores, asumo Solicitante
    return <DashboardSolicitante />;
}

// 2. RUTA PRIVADA (WRAPPER DE SEGURIDAD)
function PrivateRoute({ children, allowedRoles }) {
  // A. ¿Está logueado? Si no, fuera.
  if (!authService.isAuthenticated()) return <Navigate to="/login" />;
  
  // B. ¿Tiene el rol correcto?
  if (allowedRoles) {
      const user = authService.getCurrentUser();
      const userRol = user?.rol_slug?.toLowerCase() || "";
      
      // Si el rol del usuario NO está en la lista permitida para esta ruta -> Dashboard
      // Nota: allowedRoles también debería tener los roles en minúscula ('admin', etc)
      if (!allowedRoles.includes(userRol)) {
          console.warn(`Acceso denegado a ruta protegida. Rol: ${userRol}`);
          return <Navigate to="/dashboard" replace />;
      }
  }

  // C. Pase adelante
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
        
        {/* --- RUTAS COMUNES (Cualquier logueado) --- */}
        {/* El DashboardController decide qué dashboard mostrar */}
        <Route path="/dashboard" element={<PrivateRoute><DashboardController /></PrivateRoute>} />
        <Route path="/reservar" element={<PrivateRoute><CalendarioReservas /></PrivateRoute>} />
        <Route path="/mis-reservas" element={<PrivateRoute><MisReservas /></PrivateRoute>} />
        
        {/* --- RUTAS OPERATIVAS (Admin y Coordinador) --- */}
        {/* El coordinador necesita entrar aquí para aprobar/rechazar */}
        <Route 
            path="/aprobacion" 
            element={<PrivateRoute allowedRoles={['admin', 'coordinador']}><AprobacionPanel /></PrivateRoute>} 
        />
        
        {/* Gestión Básica (Espacios/Elementos) - Coordinador puede ver, Admin edita (controlado en el componente) */}
        <Route 
            path="/gestion/espacios" 
            element={<PrivateRoute allowedRoles={['admin', 'coordinador']}><GestionEspacios /></PrivateRoute>} 
        />
        <Route 
            path="/gestion/elementos" 
            element={<PrivateRoute allowedRoles={['admin', 'coordinador']}><GestionElementos /></PrivateRoute>} 
        />
        <Route 
            path="/gestion-carreras" 
            element={<PrivateRoute allowedRoles={['admin', 'coordinador']}><GestionCarreras /></PrivateRoute>} 
        />
        <Route 
            path="/gestion-usuarios" 
            element={<PrivateRoute allowedRoles={['admin', 'coordinador']}><GestionUsuarios /></PrivateRoute>} 
        />

        {/* --- RUTAS EXCLUSIVAS DE ADMIN --- */}
        {/* Reportes avanzados: Solo el Admin entra aquí. Si el coord intenta, lo patea al dashboard */}
        <Route 
            path="/reportes" 
            element={<PrivateRoute allowedRoles={['admin']}><ReportesAvanzados /></PrivateRoute>} 
        />

        {/* Redirección por defecto (Catch-all) */}
        <Route path="/" element={<Navigate to="/dashboard" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;