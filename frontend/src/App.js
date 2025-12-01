import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import authService from './services/authService';

// Importa tus componentes aquí (Login, Header, etc...)
import Login from './components/auth/Login';
import Header from './components/services/Header';
import CalendarioReservas from './components/Reservas/CalendarioReservas';
import MisReservas from './components/Reservas/MisReservas';
import AprobacionPanel from './components/AprobacionPanel';
import GestionEspacios from './components/Administración/GestionEspacios';
import GestionElementos from './components/Administración/GestionElementos';
import ResetPassword from './components/auth/ResetPassword';
import DashboardAdmin from './components/dashboard/DashboardAdmin';
import DashboardSolicitante from './components/dashboard/DashboardSolicitante';

// Lógica de decisión de Dashboard
function DashboardController() {
    const user = authService.getCurrentUser();
    
    // DEBUG: Mira la consola del navegador (F12) para ver qué rol imprime
    console.log("Rol detectado:", user?.rol_slug); 

    // Verificamos "admin" o "coordinador"
    if (user?.rol_slug === 'admin' || user?.rol_slug === 'coordinador') {
        return <DashboardAdmin />;
    }
    
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
        
        {/* RUTA INTELIGENTE */}
        <Route path="/dashboard" element={<PrivateRoute><DashboardController /></PrivateRoute>} />

        <Route path="/reservar" element={<PrivateRoute><CalendarioReservas /></PrivateRoute>} />
        <Route path="/mis-reservas" element={<PrivateRoute><MisReservas /></PrivateRoute>} />
        <Route path="/aprobacion" element={<PrivateRoute><AprobacionPanel /></PrivateRoute>} />
        <Route path="/gestion/espacios" element={<PrivateRoute><GestionEspacios /></PrivateRoute>} />
        <Route path="/gestion/elementos" element={<PrivateRoute><GestionElementos /></PrivateRoute>} />
        
        <Route path="/" element={<Navigate to="/dashboard" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;