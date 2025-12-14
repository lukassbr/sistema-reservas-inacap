import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import authService from '../../services/authService';

const MisReservas = () => {
    const [reservas, setReservas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filtroEstado, setFiltroEstado] = useState('Todas');
    
    // Estados para el Modal de Detalle
    const [showModal, setShowModal] = useState(false);
    const [reservaSeleccionada, setReservaSeleccionada] = useState(null);
    
    // Obtenemos el usuario para saber si es Admin
    const user = authService.getCurrentUser();
    const esAdmin = user?.rol_slug === 'admin' || user?.rol_slug === 'coordinador';

    useEffect(() => {
        cargarReservas();
    }, []);

    const cargarReservas = async () => {
        try {
            const response = await api.get('/reservas/');
            // Ordenar por fecha (más reciente primero)
            const ordenadas = response.data.sort((a, b) => new Date(b.fecha_reserva) - new Date(a.fecha_reserva));
            setReservas(ordenadas);
        } catch (error) {
            console.error("Error cargando reservas", error);
        } finally {
            setLoading(false);
        }
    };

    const cancelarReserva = async (id) => {
        const mensaje = esAdmin 
            ? "ADMINISTRADOR: ¿Estás seguro de forzar la cancelación? Se liberará el espacio."
            : "¿Estás seguro de cancelar tu solicitud?";

        if (!window.confirm(mensaje)) return;

        try {
            await api.delete(`/reservas/${id}/`); 
            alert("Reserva cancelada correctamente.");
            cargarReservas();
            setShowModal(false); // Cerrar modal si estaba abierto
        } catch (error) {
            alert("No se pudo cancelar la reserva.");
        }
    };

    // Función para abrir el modal
    const verDetalle = (reserva) => {
        setReservaSeleccionada(reserva);
        setShowModal(true);
    };

    const reservasFiltradas = reservas.filter(r => 
        filtroEstado === 'Todas' || r.estado === filtroEstado.toLowerCase()
    );

    if (loading) return <div className="p-5 text-center">Cargando reservas...</div>;

    return (
        <div className="container mt-5 fade-in">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2 className="text-danger">
                    <i className="bi bi-clock-history me-2"></i>
                    {esAdmin ? 'Gestión Total de Reservas' : 'Mis Solicitudes'}
                </h2>
                {esAdmin && <span className="badge bg-danger">Vista Admin</span>}
            </div>

            {/* Filtros */}
            <div className="card shadow-sm mb-4 p-3 border-0 bg-light">
                <div className="d-flex gap-2 flex-wrap">
                    {['Todas', 'Pendiente', 'Aprobada', 'Rechazada'].map(estado => (
                        <button 
                            key={estado}
                            className={`btn ${filtroEstado === estado ? 'btn-danger' : 'btn-outline-secondary'}`}
                            onClick={() => setFiltroEstado(estado)}
                        >
                            {estado}
                        </button>
                    ))}
                </div>
            </div>

            {/* Tabla */}
            <div className="card shadow border-0">
                <div className="table-responsive">
                    <table className="table table-hover align-middle mb-0">
                        <thead className="table-light">
                            <tr>
                                <th>ID</th>
                                <th>Solicitante</th>
                                <th>Espacio</th>
                                <th>Fecha</th>
                                <th className="text-center">Estado</th>
                                <th className="text-center">Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {reservasFiltradas.length === 0 ? (
                                <tr><td colSpan="6" className="text-center py-4">No hay reservas en este estado.</td></tr>
                            ) : (
                                reservasFiltradas.map(res => (
                                    <tr key={res.id}>
                                        <td>#{res.id}</td>
                                        <td>
                                            <div className="d-flex flex-column">
                                                <span className="fw-bold">{res.usuario_detalle?.nombre || 'Usuario'}</span>
                                                <small className="text-muted" style={{fontSize: '0.75rem'}}>{res.usuario_detalle?.email}</small>
                                            </div>
                                        </td>
                                        <td className="fw-bold">{res.espacio_detalle?.nombre || "Espacio"}</td>
                                        <td>
                                            {res.fecha_reserva} <br/>
                                            <small className="text-muted">{res.hora_inicio} - {res.hora_fin}</small>
                                        </td>
                                        <td className="text-center">
                                            {res.estado === 'aprobada' && <span className="badge bg-success">Aprobada</span>}
                                            {res.estado === 'pendiente' && <span className="badge bg-warning text-dark">Pendiente</span>}
                                            {res.estado === 'rechazada' && <span className="badge bg-danger">Rechazada</span>}
                                        </td>
                                        <td className="text-center">
                                            <div className="d-flex justify-content-center gap-2">
                                                {/* BOTÓN VER DETALLE (NUEVO) */}
                                                <button 
                                                    className="btn btn-sm btn-info text-white" 
                                                    onClick={() => verDetalle(res)}
                                                    title="Ver detalle completo"
                                                >
                                                    <i className="bi bi-eye-fill"></i>
                                                </button>

                                                {/* BOTÓN CANCELAR */}
                                                {(res.estado === 'pendiente' || esAdmin) && (
                                                    <button 
                                                        className="btn btn-sm btn-outline-danger" 
                                                        onClick={() => cancelarReserva(res.id)}
                                                        title="Cancelar reserva"
                                                    >
                                                        <i className="bi bi-x-lg"></i>
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* --- MODAL DE DETALLE (NUEVO) --- */}
            {showModal && reservaSeleccionada && (
                <div className="modal d-block" style={{backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1050}}>
                    <div className="modal-dialog modal-lg modal-dialog-centered">
                        <div className="modal-content border-0 shadow-lg">
                            <div className={`modal-header text-white ${
                                reservaSeleccionada.estado === 'aprobada' ? 'bg-success' : 
                                reservaSeleccionada.estado === 'rechazada' ? 'bg-danger' : 'bg-warning'
                            }`}>
                                <h5 className="modal-title fw-bold">
                                    <i className="bi bi-card-checklist me-2"></i>
                                    Detalle Reserva #{reservaSeleccionada.id}
                                </h5>
                                <button type="button" className="btn-close btn-close-white" onClick={() => setShowModal(false)}></button>
                            </div>
                            
                            <div className="modal-body p-4">
                                <div className="row g-4">
                                    {/* INFO PRINCIPAL */}
                                    <div className="col-md-6">
                                        <h6 className="text-secondary fw-bold small text-uppercase">Información del Espacio</h6>
                                        <div className="p-3 bg-light rounded border">
                                            <h4 className="text-dark fw-bold mb-1">{reservaSeleccionada.espacio_detalle?.nombre}</h4>
                                            <p className="text-muted mb-0"><i className="bi bi-geo-alt me-1"></i>{reservaSeleccionada.espacio_detalle?.ubicacion}</p>
                                        </div>
                                    </div>
                                    
                                    <div className="col-md-6">
                                        <h6 className="text-secondary fw-bold small text-uppercase">Fecha y Hora</h6>
                                        <div className="p-3 bg-light rounded border">
                                            <div className="d-flex align-items-center mb-2">
                                                <i className="bi bi-calendar3 fs-4 me-3 text-danger"></i>
                                                <div>
                                                    <small className="d-block text-muted">Fecha</small>
                                                    <strong>{reservaSeleccionada.fecha_reserva}</strong>
                                                </div>
                                            </div>
                                            <div className="d-flex align-items-center">
                                                <i className="bi bi-clock fs-4 me-3 text-danger"></i>
                                                <div>
                                                    <small className="d-block text-muted">Horario</small>
                                                    <strong>{reservaSeleccionada.hora_inicio} - {reservaSeleccionada.hora_fin}</strong>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* MOTIVO */}
                                    <div className="col-12">
                                        <h6 className="text-secondary fw-bold small text-uppercase">Motivo de la Actividad</h6>
                                        <div className="p-3 border rounded bg-white fst-italic text-muted">
                                            "{reservaSeleccionada.motivo}"
                                        </div>
                                    </div>

                                    {/* ELEMENTOS / INSUMOS */}
                                    <div className="col-12">
                                        <h6 className="text-secondary fw-bold small text-uppercase border-bottom pb-2">
                                            Insumos Solicitados
                                        </h6>
                                        {reservaSeleccionada.elementos_detalle && reservaSeleccionada.elementos_detalle.length > 0 ? (
                                            <div className="row g-2">
                                                {reservaSeleccionada.elementos_detalle.map((item, idx) => (
                                                    <div key={idx} className="col-md-6">
                                                        <div className="d-flex justify-content-between align-items-center p-2 border rounded">
                                                            <span><i className="bi bi-box-seam me-2 text-primary"></i>{item.elemento_nombre}</span>
                                                            <span className="badge bg-secondary">x{item.cantidad_solicitada}</span>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <p className="text-muted small">No se solicitaron elementos adicionales.</p>
                                        )}
                                    </div>

                                    {/* USUARIO (Solo Admin lo ve necesario, pero útil para todos confirmar sus datos) */}
                                    <div className="col-12 text-end text-muted small mt-2">
                                        Solicitado por: <strong>{reservaSeleccionada.usuario_detalle?.nombre}</strong> ({reservaSeleccionada.usuario_detalle?.email})
                                    </div>
                                </div>
                            </div>
                            
                            <div className="modal-footer bg-light">
                                {(reservaSeleccionada.estado === 'pendiente' || esAdmin) && (
                                    <button className="btn btn-outline-danger me-auto" onClick={() => cancelarReserva(reservaSeleccionada.id)}>
                                        Cancelar Reserva
                                    </button>
                                )}
                                <button type="button" className="btn btn-secondary px-4" onClick={() => setShowModal(false)}>
                                    Cerrar
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MisReservas;