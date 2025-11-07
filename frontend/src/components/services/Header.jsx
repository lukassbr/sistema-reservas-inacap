import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import authService from '../../services/authService';

const Header = () => {
    const navigate = useNavigate();
    const user = authService.getCurrentUser(); // Obtiene la info del usuario (rol)

    // Lógica simple para simular roles
    const esCoordinadorOAdmin = user?.rol === 'Coordinador' || user?.rol === 'Administrador';
    
    // Función para cerrar la sesión
    const handleLogout = () => {
        authService.logout();
        navigate('/login');
    };

    return (
        // Navbar de Bootstrap con color de INACAP
        <nav className="navbar navbar-expand-lg navbar-dark bg-danger sticky-top shadow">
            <div className="container-fluid">
                
                {/* Logo/Marca */}
                <Link className="navbar-brand fw-bold" to="/dashboard">
                    <h4 className="mb-0">INACAP | Reservas</h4>
                </Link>

                {/* Botón para móviles */}
                <button 
                    className="navbar-toggler" 
                    type="button" 
                    data-bs-toggle="collapse" 
                    data-bs-target="#navbarNav" 
                    aria-controls="navbarNav" 
                    aria-expanded="false" 
                    aria-label="Toggle navigation"
                >
                    <span className="navbar-toggler-icon"></span>
                </button>

                <div className="collapse navbar-collapse" id="navbarNav">
                    
                    {/* Enlaces para el Solicitante (Todos los usuarios) */}
                    <ul className="navbar-nav me-auto mb-2 mb-lg-0">
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
                        
                        {/* Enlaces de Administración/Coordinación (HU02, HU08) */}
                        {esCoordinadorOAdmin && (
                            <>
                                <li className="nav-item">
                                    <Link className="nav-link" to="/aprobacion">
                                        <i className="bi bi-file-earmark-check-fill me-1"></i> Aprobación
                                    </Link>
                                </li>
                                <li className="nav-item">
                                    <Link className="nav-link" to="/gestion/espacios">
                                        <i className="bi bi-gear-fill me-1"></i> Espacios
                                    </Link>
                                </li>
                            </>
                        )}
                    </ul>
                    
                    {/* Botón de Perfil y Logout (Derecha) */}
                    <ul className="navbar-nav">
                         <li className="nav-item">
                            <span className="nav-link text-white-50">
                                <i className="bi bi-person-circle me-1"></i> {user?.nombre || 'Usuario'}
                            </span>
                        </li>
                        <li className="nav-item">
                            <button className="btn btn-sm btn-outline-light" onClick={handleLogout}>
                                <i className="bi bi-box-arrow-right"></i> Cerrar Sesión
                            </button>
                        </li>
                    </ul>
                </div>
            </div>
        </nav>
    );
};

export default Header;