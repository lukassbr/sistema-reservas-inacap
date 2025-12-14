// src/components/services/Header.jsx
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import authService from '../../services/authService';

const Header = () => {
  const navigate = useNavigate();
  const user = authService.getCurrentUser();

  const getRoleName = (user) => {
    if (!user) return null;
    // Intenta obtener el rol de varias formas para compatibilidad
    if (user.rol_slug) return user.rol_slug; // Prioridad al slug si existe
    if (user.rol_nombre) return String(user.rol_nombre).toLowerCase();
    if (user.rol && typeof user.rol === 'object' && user.rol.nombre) {
      return String(user.rol.nombre).toLowerCase();
    }
    if (typeof user.rol === 'string') return user.rol.toLowerCase();
    return null;
  };

  const roleName = getRoleName(user);
  // Validamos si es admin o coordinador
  const esAdmin = ['admin', 'administrador', 'coordinador'].includes(roleName || '');

  const getDisplayName = (user) => {
    if (!user) return 'Usuario';
    const first = user.nombre || user.first_name || user.username || user.email || 'Usuario';
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
            {/* --- MENÚ PÚBLICO (Todos) --- */}
            <li className="nav-item">
              <Link className="nav-link" to="/reservar">
                <i className="bi bi-calendar-plus me-1"></i> Nueva Reserva
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/mis-reservas">
                <i className="bi bi-card-list me-1"></i> Mis Reservas
              </Link>
            </li>

            {/* --- MENÚ ADMINISTRACIÓN (Solo Admin/Coordinador) --- */}
            {esAdmin && (
              <>
                <div className="vr mx-2 text-white opacity-50 d-none d-lg-block"></div>
                
                <li className="nav-item">
                  <Link className="nav-link" to="/aprobacion">
                    <i className="bi bi-check-circle-fill me-1"></i> Aprobación
                  </Link>
                </li>
                
                {/* Gestión Recursos */}
                <li className="nav-item">
                  <Link className="nav-link" to="/gestion/espacios">
                    <i className="bi bi-door-closed me-1"></i> Espacios
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/gestion/elementos">
                    <i className="bi bi-box-seam me-1"></i> Elementos
                  </Link>
                </li>

                {/* --- NUEVOS LINKS AGREGADOS --- */}
                <li className="nav-item">
                  <Link className="nav-link" to="/gestion-carreras">
                    <i className="bi bi-mortarboard-fill me-1"></i> Carreras
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/gestion-usuarios">
                    <i className="bi bi-people-fill me-1"></i> Usuarios
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link text-warning fw-bold" to="/reportes">
                    <i className="bi bi-graph-up-arrow me-1"></i> Reportes
                  </Link>
                </li>
              </>
            )}
          </ul>

          {/* --- PERFIL DE USUARIO --- */}
          <ul className="navbar-nav align-items-center">
            <li className="nav-item">
              <span className="nav-link text-white me-3 fw-bold">
                <i className="bi bi-person-circle me-2"></i>
                {getDisplayName(user)}
              </span>
            </li>
            <li className="nav-item">
              <button
                className="btn btn-sm btn-light text-danger fw-bold shadow-sm"
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