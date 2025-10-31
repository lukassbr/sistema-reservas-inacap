// src/App.js
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/auth/Login';
import authService from './services/authService';

// Componente temporal para el Dashboard
function Dashboard() {
  return (
    <div className="container mt-5">
      <h1>🎉 ¡Bienvenido al Dashboard!</h1>
      <p>Iniciaste sesión correctamente</p>
      <button 
        className="btn btn-danger"
        onClick={() => {
          authService.logout();
          window.location.href = '/login';
        }}
      >
        Cerrar Sesión
      </button>
    </div>
  );
}

// Ruta protegida: Solo accesible si está autenticado
function PrivateRoute({ children }) {
  return authService.isAuthenticated() ? children : <Navigate to="/login" />;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route 
          path="/dashboard" 
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          } 
        />
        <Route path="/" element={<Navigate to="/login" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;