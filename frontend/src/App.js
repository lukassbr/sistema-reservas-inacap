// src/App.js (Versión Corregida y Funcional)

import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import authService from './services/authService';

// Importar todos los componentes diseñados
import Login from './components/auth/Login';
import Header from './components/services/Header'; 
// NOTA: FormularioReserva no es una ruta, se carga dentro de CalendarioReservas
import FormularioReserva from './components/FormularioReserva'; 
import AprobacionPanel from './components/AprobacionPanel';
import GestionEspacios from './components/Administración/GestionEspacios'; 
import MisReservas from './components/Reservas/MisReservas'; 
import CalendarioReservas from './components/Reservas/CalendarioReservas'; 


// 1. Componente temporal para el Dashboard
function Dashboard() {
  return (
    <div className="container mt-5">
      <h1 className="text-danger">🎉 ¡Bienvenido al Dashboard!</h1>
      <p className="lead text-muted">Usa la barra superior para navegar entre las vistas diseñadas.</p>
    </div>
  );
}

// 2. Componente Wrapper para Rutas Protegidas
function PrivateRoute({ children }) {
  // NOTA: Esta función está MOCKEADA en src/services/authService.js para siempre devolver TRUE
  const isAuthenticated = authService.isAuthenticated(); 
  
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  // Si está autenticado, muestra el Header y el contenido de la ruta
  return (
    <>
      <Header /> 
      <div className="py-4"> 
        {children}
      </div>
    </>
  );
}

// 3. Función Principal de la App
function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Rutas Públicas */}
        <Route path="/login" element={<Login />} />
        
        {/* Rutas Protegidas (Acceso con el Header) */}
        <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />

        {/* ⭐ CORRECCIÓN: /reservar solo carga el calendario, el formulario se carga dentro de él. */}
        <Route path="/reservar" element={<PrivateRoute><CalendarioReservas /></PrivateRoute>} />
        
        {/* Mis Reservas */}
        <Route path="/mis-reservas" element={<PrivateRoute><MisReservas /></PrivateRoute>} />
        
        {/* Vistas de Coordinador / Admin */}
        <Route path="/aprobacion" element={<PrivateRoute><AprobacionPanel /></PrivateRoute>} />
        <Route path="/gestion/espacios" element={<PrivateRoute><GestionEspacios /></PrivateRoute>} />
        
        {/* Ruta Raíz: Envía al Dashboard si hay sesión activa (MOCKED) */}
        <Route 
          path="/" 
          element={
            authService.isAuthenticated() ? 
            <Navigate to="/dashboard" /> : 
            <Navigate to="/login" />
          } 
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;