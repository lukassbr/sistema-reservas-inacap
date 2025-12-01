import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import authService from '../../services/authService';

const MisReservas = () => {
    const [reservas, setReservas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filtroEstado, setFiltroEstado] = useState('Todas');
    
    // Obtenemos el usuario para saber si es Admin
    const user = authService.getCurrentUser();
    const esAdmin = user?.rol_slug === 'admin' || user?.rol_slug === 'coordinador';

    useEffect(() => {
        cargarReservas();
    }, []);

    const cargarReservas = async () => {
        try {
            // Si es admin, el backend ya devuelve TODAS las reservas. Si es solicitante, solo las suyas.
            const response = await api.get('/reservas/');
            setReservas(response.data);
        } catch (error) {
            console.error("Error cargando reservas", error);
        } finally {
            setLoading(false);
        }
    };

    const cancelarReserva = async (id) => {
        const mensaje = esAdmin 
            ? "ADMINISTRADOR: ¿Estás seguro de forzar la cancelación de esta reserva? Se liberará el espacio."
            : "¿Estás seguro de cancelar tu solicitud?";

        if (!window.confirm(mensaje)) return;

        try {
            // Usamos DELETE para eliminarla completamente o podríamos cambiar estado a 'cancelada'
            await api.delete(`/reservas/${id}/`); 
            alert("Reserva eliminada/cancelada correctamente.");
            cargarReservas();
        } catch (error) {
            alert("No se pudo cancelar la reserva.");
        }
    };

    const reservasFiltradas = reservas.filter(r => 
        filtroEstado === 'Todas' || r.estado === filtroEstado.toLowerCase()
    );

    if (loading) return <div className="p-5 text-center">Cargando reservas...</div>;

    return (
        <div className="container mt-5">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2 className="text-danger">
                    <i className="bi bi-clock-history me-2"></i>
                    {esAdmin ? 'Gestión Total de Reservas (Vista Admin)' : 'Mis Solicitudes'}
                </h2>
                {esAdmin && <span className="badge bg-danger">Modo Administrador</span>}
            </div>

            <div className="card shadow-sm mb-4 p-3 border-0 bg-light">
                <div className="d-flex gap-2">
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

            <div className="card shadow border-0">
                <div className="table-responsive">
                    <table className="table table-hover align-middle mb-0">
                        <thead className="table-light">
                            <tr>
                                <th>ID</th>
                                <th>Solicitante</th> {/* Columna extra útil para Admin */}
                                <th>Espacio</th>
                                <th>Fecha y Hora</th>
                                <th>Motivo</th>
                                <th className="text-center">Estado</th>
                                <th className="text-center">Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {reservasFiltradas.length === 0 ? (
                                <tr><td colSpan="7" className="text-center py-4">No hay reservas en este estado.</td></tr>
                            ) : (
                                reservasFiltradas.map(res => (
                                    <tr key={res.id}>
                                        <td>#{res.id}</td>
                                        <td>
                                            <strong>{res.usuario_detalle?.nombre || 'Usuario'}</strong> <br/>
                                            <small className="text-muted">{res.usuario_detalle?.email}</small>
                                        </td>
                                        <td className="fw-bold">{res.espacio_detalle?.nombre || "Espacio"}</td>
                                        <td>
                                            {res.fecha_reserva} <br/>
                                            <small className="text-muted">{res.hora_inicio} - {res.hora_fin}</small>
                                        </td>
                                        <td>{res.motivo}</td>
                                        <td className="text-center">
                                            {res.estado === 'aprobada' && <span className="badge bg-success">Aprobada</span>}
                                            {res.estado === 'pendiente' && <span className="badge bg-warning text-dark">Pendiente</span>}
                                            {res.estado === 'rechazada' && <span className="badge bg-danger">Rechazada</span>}
                                        </td>
                                        <td className="text-center">
                                            {/* LOGICA DE BOTÓN CANCELAR */}
                                            {(res.estado === 'pendiente' || esAdmin) && (
                                                <button 
                                                    className="btn btn-sm btn-outline-danger" 
                                                    onClick={() => cancelarReserva(res.id)}
                                                    title={esAdmin ? "Forzar cancelación por fuerza mayor" : "Cancelar solicitud"}
                                                >
                                                    <i className="bi bi-x-circle me-1"></i>
                                                    {esAdmin && res.estado === 'aprobada' ? 'Forzar Cancelación' : 'Cancelar'}
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default MisReservas;