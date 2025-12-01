// src/components/dashboard/DashboardSolicitante.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import authService from '../../services/authService';

const DashboardSolicitante = () => {
  const user = authService.getCurrentUser();

  const getDisplayName = (user) => {
    if (!user) return 'Solicitante';
    const first =
      user.nombre ||
      user.first_name ||
      user.username ||
      user.email ||
      'Solicitante';
    const last = user.apellido || user.last_name || '';
    return `${first} ${last}`.trim();
  };

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-8 text-center">
          <h1 className="display-4 text-danger mb-4">
            ¡Bienvenido, {getDisplayName(user)}!
          </h1>
          <p className="lead text-muted mb-5">
            Sistema de Gestión de Espacios - Sede Temuco
          </p>

          <div className="row g-4">
            <div className="col-md-6">
              <div className="card h-100 shadow-sm hover-shadow border-danger">
                <div className="card-body p-5">
                  <i className="bi bi-calendar-plus display-1 text-danger mb-3"></i>
                  <h3 className="card-title">Solicitar Espacio</h3>
                  <p className="card-text">
                    Revisa la disponibilidad y reserva laboratorios o auditorios.
                  </p>
                  <Link to="/reservar" className="btn btn-danger btn-lg w-100">
                    Ir al Calendario
                  </Link>
                </div>
              </div>
            </div>
            <div className="col-md-6">
              <div className="card h-100 shadow-sm hover-shadow border-secondary">
                <div className="card-body p-5">
                  <i className="bi bi-list-check display-1 text-secondary mb-3"></i>
                  <h3 className="card-title">Mis Solicitudes</h3>
                  <p className="card-text">
                    Consulta el estado de tus reservas pendientes o aprobadas.
                  </p>
                  <Link
                    to="/mis-reservas"
                    className="btn btn-secondary btn-lg w-100"
                  >
                    Ver Historial
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardSolicitante;
