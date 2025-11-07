import React, { useState } from 'react';

// MOCKUP: Simula las reservas del usuario logueado
const MOCK_RESERVAS = [
    { id: 301, espacio: 'Laboratorio C-201', fecha: '2025-11-18', hora: '10:00 - 12:00', estado: 'Aprobada', motivo: 'Clase Taller de Proyecto', sede: 'Santiago' },
    { id: 302, espacio: 'Sala de Estudio 405', fecha: '2025-11-19', hora: '16:00 - 18:00', estado: 'Pendiente', motivo: 'Reunión grupal', sede: 'Santiago' },
    { id: 303, espacio: 'Patio Cubo', fecha: '2025-11-05', hora: '17:00 - 20:00', estado: 'Finalizada', motivo: 'Evento de Ciberseguridad', sede: 'Temuco' },
    { id: 304, espacio: 'Auditorio Principal', fecha: '2025-12-01', hora: '09:00 - 14:00', estado: 'Rechazada', motivo: 'Charla con invitado', sede: 'Temuco' },
    { id: 305, espacio: 'Sala A-301', fecha: '2025-12-10', hora: '15:00 - 16:30', estado: 'Cancelada', motivo: 'Evaluación Docente', sede: 'Santiago' },
];

// Helper para colores de estado con íconos
const getEstadoInfo = (estado) => {
    switch (estado) {
        case 'Aprobada': return { badge: 'bg-success', icon: 'bi-check-circle-fill', text: 'Confirmada' };
        case 'Pendiente': return { badge: 'bg-warning text-dark', icon: 'bi-clock-fill', text: 'En Revisión' };
        case 'Rechazada': return { badge: 'bg-danger', icon: 'bi-x-circle-fill', text: 'Rechazada' };
        case 'Finalizada': return { badge: 'bg-secondary', icon: 'bi-flag-fill', text: 'Finalizada' };
        case 'Cancelada': return { badge: 'bg-info', icon: 'bi-slash-circle', text: 'Cancelada' };
        default: return { badge: 'bg-light text-muted', icon: 'bi-question-circle', text: 'Desconocido' };
    }
};

const MisReservas = () => {
    const [reservas, setReservas] = useState(MOCK_RESERVAS);
    const [filtroEstado, setFiltroEstado] = useState('Activas');

    // MOCKUP: Manejar la cancelación (HU21)
    const handleCancelar = (id, espacio) => {
        if (window.confirm(`¿Está seguro de CANCELAR la reserva #${id} (${espacio})?`)) {
            // Lógica API: Cambiar estado en el backend
            setReservas(reservas.map(r => 
                r.id === id ? { ...r, estado: 'Cancelada' } : r
            ));
            alert(`Reserva ${id} cancelada. Se notificará al coordinador.`);
        }
    };
    
    // Lógica de filtrado 
    const reservasFiltradas = reservas.filter(r => {
        if (filtroEstado === 'Activas') {
            return r.estado === 'Aprobada' || r.estado === 'Pendiente';
        }
        if (filtroEstado === 'Historial') {
            return r.estado === 'Finalizada' || r.estado === 'Rechazada' || r.estado === 'Cancelada';
        }
        return true; 
    });

    return (
        <div className="container mt-5">
            
            {/* ENCABEZADO */}
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h1 className="text-danger">
                    <i className="bi bi-calendar-check-fill me-2"></i> Mis Solicitudes y Reservas
                </h1>
                <span className="lead text-muted">{reservasFiltradas.length} Reservas Mostradas</span>
            </div>
            <p className="lead text-muted">Consulta el estado, detalles y gestiona la cancelación de tus reservas (HU22, HU21).</p>

            {/* FILTROS DE ESTADO */}
            <div className="card shadow mb-4 p-3 bg-light border-0">
                <div className="d-flex justify-content-start align-items-center">
                    <strong className="me-3 text-muted">Mostrar:</strong>
                    
                    <div className="btn-group" role="group">
                        <input type="radio" className="btn-check" name="filtro" id="fActivas" 
                            checked={filtroEstado === 'Activas'} onChange={() => setFiltroEstado('Activas')} />
                        <label className="btn btn-outline-danger" htmlFor="fActivas">
                             <i className="bi bi-list-columns-reverse me-1"></i> Activas
                        </label>

                        <input type="radio" className="btn-check" name="filtro" id="fHistorial" 
                            checked={filtroEstado === 'Historial'} onChange={() => setFiltroEstado('Historial')} />
                        <label className="btn btn-outline-danger" htmlFor="fHistorial">
                            <i className="bi bi-archive-fill me-1"></i> Historial
                        </label>
                        
                        <input type="radio" className="btn-check" name="filtro" id="fTodos" 
                            checked={filtroEstado === 'Todos'} onChange={() => setFiltroEstado('Todos')} />
                        <label className="btn btn-outline-danger" htmlFor="fTodos">
                            <i className="bi bi-grid-fill me-1"></i> Ver Todos
                        </label>
                    </div>
                </div>
            </div>

            {/* TABLA DE RESERVAS (Diseño más informativo) */}
            <div className="card shadow-lg border-0">
                <div className="card-body p-0">
                    <div className="table-responsive">
                        <table className="table table-striped table-hover align-middle mb-0">
                            <thead className="bg-light">
                                <tr>
                                    <th style={{width: '5%'}}>ID</th>
                                    <th style={{width: '25%'}}>Espacio / Sede</th>
                                    <th style={{width: '20%'}}>Fecha y Horario</th>
                                    <th style={{width: '25%'}}>Motivo</th>
                                    <th style={{width: '15%'}} className="text-center">Estado</th>
                                    <th style={{width: '10%'}} className="text-center">Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {reservasFiltradas.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" className="text-center text-muted py-3">
                                            No se encontraron reservas en este estado.
                                        </td>
                                    </tr>
                                ) : (
                                    reservasFiltradas.map(res => {
                                        const estadoInfo = getEstadoInfo(res.estado);
                                        return (
                                            <tr key={res.id}>
                                                <td className="text-muted small">{res.id}</td>
                                                <td>
                                                    <strong className="text-primary">{res.espacio}</strong> <br/>
                                                    <span className="badge bg-secondary">{res.sede}</span>
                                                </td>
                                                <td>
                                                    <i className="bi bi-calendar-event me-1"></i> {res.fecha} <br/>
                                                    <i className="bi bi-clock me-1"></i> {res.hora}
                                                </td>
                                                <td><small className="text-muted">{res.motivo}</small></td>
                                                <td className="text-center">
                                                    <span className={`badge py-2 px-3 ${estadoInfo.badge}`}>
                                                        <i className={`bi ${estadoInfo.icon} me-1`}></i>
                                                        {estadoInfo.text}
                                                    </span>
                                                </td>
                                                <td className="text-center">
                                                    <div className="btn-group btn-group-sm" role="group">
                                                        <button 
                                                            className="btn btn-outline-info"
                                                            title="Ver detalles completos"
                                                        >
                                                            <i className="bi bi-eye"></i>
                                                        </button>
                                                        
                                                        {(res.estado === 'Aprobada' || res.estado === 'Pendiente') && (
                                                            <button 
                                                                className="btn btn-outline-danger"
                                                                title="Cancelar Reserva (HU21)"
                                                                onClick={() => handleCancelar(res.id, res.espacio)}
                                                            >
                                                                <i className="bi bi-x-circle"></i>
                                                            </button>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MisReservas;