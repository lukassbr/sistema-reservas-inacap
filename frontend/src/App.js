import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import authService from './services/authService';

// Componentes
import Login from './components/auth/Login';
import Header from './components/services/Header'; 
import CalendarioReservas from './components/Reservas/CalendarioReservas'; 
import MisReservas from './components/Reservas/MisReservas'; 
import AprobacionPanel from './components/AprobacionPanel';
import GestionEspacios from './components/Administración/GestionEspacios'; 
import GestionElementos from './components/Administración/GestionElementos';
import ResetPassword from './components/auth/ResetPassword';
import DashboardAdmin from './components/dashboard/DashboardAdmin';
// Si no tienes este archivo, crea uno simple o usa MisReservas temporalmente
import DashboardSolicitante from './components/dashboard/DashboardSolicitante'; 

// Controlador inteligente de Dashboard
function DashboardController() {
    const user = authService.getCurrentUser();
    // Si es admin o coordinador -> Dashboard de Gestión
    if (user?.rol_slug === 'admin' || user?.rol_slug === 'coordinador') {
        return <DashboardAdmin />;
    }
    // Si es profe o alumno -> Dashboard de Solicitante
    return <DashboardSolicitante />;
}

function PrivateRoute({ children }) {
  if (!authService.isAuthenticated()) return <Navigate to="/login" />;
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
        <Route path="/login" element={<Login />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        
        {/* RUTA PRINCIPAL QUE DECIDE QUÉ MOSTRAR */}
        <Route path="/dashboard" element={
            <PrivateRoute>
                <DashboardController />
            </PrivateRoute>
        } />

        {/* Rutas Comunes */}
        <Route path="/reservar" element={<PrivateRoute><CalendarioReservas /></PrivateRoute>} />
        <Route path="/mis-reservas" element={<PrivateRoute><MisReservas /></PrivateRoute>} />
        
        {/* Rutas de Admin */}
        <Route path="/aprobacion" element={<PrivateRoute><AprobacionPanel /></PrivateRoute>} />
        <Route path="/gestion/espacios" element={<PrivateRoute><GestionEspacios /></PrivateRoute>} />
        <Route path="/gestion/elementos" element={<PrivateRoute><GestionElementos /></PrivateRoute>} />
        
        {/* Redirección por defecto */}
        <Route path="/" element={<Navigate to="/dashboard" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;