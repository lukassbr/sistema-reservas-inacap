import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import authService from "../../services/authService";
import api from "../../services/api";

const DashboardSolicitante = () => {
    const user = authService.getCurrentUser();
    const [resumen, setResumen] = useState({
        total: 0,
        pendientes: 0,
        proxima_reserva: null
    });

    useEffect(() => {
        cargarResumen();
    }, []);

    const cargarResumen = async () => {
        try {
            // Reutilizamos el endpoint de "Mis Reservas" para sacar cuentas rápidas
            const res = await api.get("/reservas/");
            const misReservas = res.data;
            
            // Calculamos datos para las tarjetas
            const pendientes = misReservas.filter(r => r.estado === 'pendiente').length;
            
            // Buscar la próxima reserva aprobada (futura)
            const ahora = new Date();
            const futuras = misReservas
                .filter(r => r.estado === 'aprobada' && new Date(`${r.fecha_reserva}T${r.hora_inicio}`) > ahora)
                .sort((a, b) => new Date(`${a.fecha_reserva}T${a.hora_inicio}`) - new Date(`${b.fecha_reserva}T${b.hora_inicio}`));

            setResumen({
                total: misReservas.length,
                pendientes: pendientes,
                proxima_reserva: futuras.length > 0 ? futuras[0] : null
            });
        } catch (error) {
            console.error("Error cargando resumen", error);
        }
    };

    return (
        <div className="container mt-4 fade-in">
            {/* ENCABEZADO DE BIENVENIDA */}
            <div className="bg-white p-4 rounded shadow-sm border-start border-5 border-danger mb-4">
                <h1 className="fw-bold text-dark">
                    Hola, <span className="text-danger">{user?.nombre || 'Estudiante'}</span> 👋
                </h1>
                <p className="text-muted m-0">
                    {user?.carrera_nombre 
                        ? `Estudiante de ${user.carrera_nombre}` 
                        : 'Bienvenido al Portal de Reservas INACAP'}
                </p>
            </div>

            {/* TARJETAS DE RESUMEN */}
            <div className="row g-4 mb-5">
                {/* 1. Tarjeta de Acción Principal */}
                <div className="col-md-4">
                    <div className="card h-100 shadow border-0 bg-danger text-white">
                        <div className="card-body d-flex flex-column justify-content-center align-items-center text-center p-4">
                            <i className="bi bi-calendar-plus-fill display-1 mb-3"></i>
                            <h4 className="fw-bold">¿Necesitas un Espacio?</h4>
                            <p className="opacity-75">Reserva laboratorios, salas o canchas.</p>
                            <Link to="/reservar" className="btn btn-light text-danger fw-bold w-100 mt-2">
                                Nueva Reserva
                            </Link>
                        </div>
                    </div>
                </div>

                {/* 2. Próxima Reserva */}
                <div className="col-md-4">
                    <div className="card h-100 shadow-sm border-0">
                        <div className="card-header bg-white fw-bold text-primary">
                            <i className="bi bi-clock-history me-2"></i>Tu Próxima Reserva
                        </div>
                        <div className="card-body d-flex flex-column justify-content-center">
                            {resumen.proxima_reserva ? (
                                <>
                                    <h5 className="fw-bold text-dark mb-1">{resumen.proxima_reserva.espacio_detalle?.nombre || 'Sala'}</h5>
                                    <span className="badge bg-success mb-3 w-auto align-self-start">Confirmada</span>
                                    
                                    <div className="d-flex align-items-center text-muted mb-2">
                                        <i className="bi bi-calendar3 me-2"></i>
                                        {resumen.proxima_reserva.fecha_reserva}
                                    </div>
                                    <div className="d-flex align-items-center text-muted">
                                        <i className="bi bi-clock me-2"></i>
                                        {resumen.proxima_reserva.hora_inicio} - {resumen.proxima_reserva.hora_fin}
                                    </div>
                                </>
                            ) : (
                                <div className="text-center text-muted py-4">
                                    <i className="bi bi-calendar-x display-4 mb-2 d-block opacity-25"></i>
                                    No tienes reservas próximas.
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* 3. Estado de Solicitudes */}
                <div className="col-md-4">
                    <div className="card h-100 shadow-sm border-0">
                        <div className="card-header bg-white fw-bold">Estado de Solicitudes</div>
                        <div className="card-body">
                            <ul className="list-group list-group-flush">
                                <li className="list-group-item d-flex justify-content-between align-items-center py-3">
                                    Pendientes de Aprobación
                                    <span className={`badge rounded-pill ${resumen.pendientes > 0 ? 'bg-warning text-dark' : 'bg-secondary'}`}>
                                        {resumen.pendientes}
                                    </span>
                                </li>
                                <li className="list-group-item d-flex justify-content-between align-items-center py-3">
                                    Total Histórico
                                    <span className="badge bg-primary rounded-pill">{resumen.total}</span>
                                </li>
                            </ul>
                            <div className="mt-3 text-center">
                                <Link to="/mis-reservas" className="btn btn-outline-secondary btn-sm w-100">
                                    Ver Historial Completo
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DashboardSolicitante;