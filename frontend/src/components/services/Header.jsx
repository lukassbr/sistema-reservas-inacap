// src/components/services/Header.jsx
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import authService from '../../services/authService';

const Header = () => {
  const navigate = useNavigate();
  const user = authService.getCurrentUser(); // Ahora trae nombre y rol reales

  const getRoleName = (user) => {
    if (!user) return null;
    if (user.rol_nombre) return String(user.rol_nombre).toLowerCase();
    if (user.rol && typeof user.rol === 'object' && user.rol.nombre) {
      return String(user.rol.nombre).toLowerCase();
    }
    if (typeof user.rol === 'string') return user.rol.toLowerCase();
    return null;
  };

  const roleName = getRoleName(user);
  const esAdmin = ['admin', 'administrador', 'coordinador'].includes(roleName || '');

  const getDisplayName = (user) => {
    if (!user) return 'Usuario';
    const first =
      user.nombre ||
      user.first_name ||
      user.username ||
      user.email ||
      'Usuario';
    const last = user.apellido || user.last_name || '';
    return `${first} ${last}`.trim();
  };

  const handleLogout = () => {
    authService.logout();
    navigate('/login');
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-danger sticky-top shadow">
      <div className="container-fluid">
        <Link className="navbar-brand fw-bold" to="/dashboard">
          <h4 className="mb-0">INACAP | Reservas</h4>
        </Link>

        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav me-auto mb-2 mb-lg-0">
            {/* Menú para TODOS */}
            <li className="nav-item">
              <Link className="nav-link" to="/reservar">
                📅 Nueva Reserva
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/mis-reservas">
                📜 Mis Reservas
              </Link>
            </li>

            {/* Menú SOLO ADMIN/COORDINADOR */}
            {esAdmin && (
              <>
                <li className="nav-item">
                  <Link className="nav-link" to="/aprobacion">
                    <i className="bi bi-check-circle-fill me-1"></i> Aprobación
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/gestion/espacios">
                    <i className="bi bi-gear-fill me-1"></i> Espacios
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/gestion/elementos">
                    <i className="bi bi-boxes me-1"></i> Elementos
                  </Link>
                </li>
              </>
            )}
          </ul>

          <ul className="navbar-nav align-items-center">
            <li className="nav-item">
              {/* Aquí se corrige el nombre y el espaciado */}
              <span className="nav-link text-white me-3 fw-bold">
                <i className="bi bi-person-circle me-2"></i>
                {getDisplayName(user)}
              </span>
            </li>
            <li className="nav-item">
              <button
                className="btn btn-sm btn-light text-danger fw-bold"
                onClick={handleLogout}
              >
                <i className="bi bi-box-arrow-right"></i> Salir
              </button>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Header;
