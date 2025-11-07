import React, {useState} from "react";

const MOCK_SOLICITUDES = [
    { id: 101, solicitante: 'Lukas Bastías', espacio: 'Patio Cubo', sede: 'SC', inicio: '2025-11-15 17:00', fin: '20:00', motivo: 'Evento de Taller de Proyecto final', elementos: ['Proyector', 'Mesa Adicional (5)'], estado: 'Pendiente' },
    { id: 102, solicitante: 'Fernanda Muñoz', espacio: 'Sala A-305', sede: 'SC', inicio: '2025-11-16 09:00', fin: '11:00', motivo: 'Reunión de coordinación de carrera', elementos: ['Pizarrón Móvil'], estado: 'Pendiente' },
    { id: 103, solicitante: 'Roberto Alveal', espacio: 'Auditorio', sede: 'TM', inicio: '2025-12-01 10:00', fin: '13:00', motivo: 'Charla de Ciberseguridad', elementos: ['Micrófono', 'Podio'], estado: 'Pendiente' },
];


const AprobacionPanel = () => {
    const [solicitudes, setSolicitudes] = useState(MOCK_SOLICITUDES);
    const [showModal, setShowModal] = useState(false);
    const [motivoRechazo, setMotivoRechazo] = useState('');
    const [solicitudSeleccionada, setSolicitudSeleccionada] = useState(null);

    const manejarAprobacion = (id) => {
        if (window.confirm('¿Estás seguro de aprobar esta solicitud?')) {
            setSolicitudes(solicitudes.filter(solicitud => solicitud.id !== id));
            alert(`Solicitud ${id} aprobada, se notificará a ${solicitudSeleccionada.solicitante}.`);
        }   
    };

    const manejarRechazo = (solicitud) => {
        setSolicitudSeleccionada(solicitud);
        setShowModal(true);
    };

    const confirmarRechazo = () => {
        if (motivoRechazo.trim() === '') {
            alert('Por favor, ingresa un motivo de rechazo.');
            return;
        }
        setSolicitudes(solicitudes.filter(solicitud => solicitud.id !== solicitudSeleccionada.id));
        alert(`Solicitud ${solicitudSeleccionada.id} rechazada por el motivo: "${motivoRechazo}". Se notificará a ${solicitudSeleccionada.solicitante}.`);
        setMotivoRechazo('');
        setShowModal(false);
        setSolicitudSeleccionada(null);
    };

    return (
        <div className="container mt-5">
            <h2 className="text-danger mb-4">Panel de Aprobación de Solicitudes</h2>
            <p>Revisa y gestiona las solicitudes de reserva pendientes.</p>

            <div className="card shadow mb-4 p-3 bg-light">
                <div className="row g-3">
                    <div className="col-md-4">
                        <label className="form-label">Filtrar por Espacio</label>
                        <select className="form-select">
                            <option>Todos los Espacios</option>
                            <option>Patio Cubo</option>
                            <option>Sala A-305</option>
                            {/* ... (Opciones dinámicas de espacios) */}
                        </select>
                    </div>
                    <div className="col-md-4">
                        <label className="form-label">Filtrar por Fecha</label>
                        <input type="date" className="form-control" />
                    </div>
                    <div className="col-md-4 d-flex align-items-end">
                        <button className="btn btn-outline-secondary w-100">Aplicar Filtros</button>
                    </div>
                </div>
            </div>

            {/* TABLA DE SOLICITUDES PENDIENTES (HU12) */}
            <div className="card shadow">
                <div className="card-body">
                    <div className="table-responsive">
                        <table className="table table-hover align-middle">
                            <thead className="table-light">
                                <tr>
                                    <th>ID</th>
                                    <th>Solicitante</th>
                                    <th>Espacio (Sede)</th>
                                    <th>Horario Solicitado</th>
                                    <th>Motivo/Elementos</th>
                                    <th className="text-center">Acciones (HU02)</th>
                                </tr>
                            </thead>
                            <tbody>
                                {solicitudes.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" className="text-center text-success py-4">
                                            🎉 ¡No hay solicitudes pendientes en este momento!
                                        </td>
                                    </tr>
                                ) : (
                                    solicitudes.map(sol => (
                                        <tr key={sol.id}>
                                            <td className="fw-bold">{sol.id}</td>
                                            <td>{sol.solicitante}</td>
                                            <td>{sol.espacio} ({sol.sede})</td>
                                            <td>{sol.inicio.split(' ')[0]} / {sol.inicio.split(' ')[1]} a {sol.fin}</td>
                                            <td>
                                                <small className="text-muted">
                                                    {sol.motivo} <br/>
                                                    **Elementos:** {sol.elementos.join(', ')}
                                                </small>
                                            </td>
                                            <td className="text-center">
                                                <div className="btn-group btn-group-sm" role="group">
                                                    <button 
                                                        className="btn btn-success"
                                                        onClick={() => manejarAprobacion(sol.id)}
                                                    >
                                                        Aprobar
                                                    </button>
                                                    <button 
                                                        className="btn btn-danger"
                                                        onClick={() => manejarRechazo(sol)}
                                                    >
                                                        Rechazar
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* MODAL DE RECHAZO (Simulado con Bootstrap Modal) */}
            {showModal && (
                <div className="modal d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header bg-danger text-white">
                                <h5 className="modal-title">Rechazar Solicitud #{solicitudSeleccionada?.id}</h5>
                                <button type="button" className="btn-close btn-close-white" onClick={() => setShowModal(false)}></button>
                            </div>
                            <div className="modal-body">
                                <p><strong>Espacio:</strong> {solicitudSeleccionada?.espacio}</p>
                                <p><strong>Solicitante:</strong> {solicitudSeleccionada?.solicitante}</p>
                                <hr/>
                                <label htmlFor="motivoRechazo" className="form-label">Motivo del Rechazo (Obligatorio)</label>
                                <textarea
                                    id="motivoRechazo"
                                    className="form-control"
                                    rows="3"
                                    value={motivoRechazo}
                                    onChange={(e) => setMotivoRechazo(e.target.value)}
                                    placeholder="Ingrese las observaciones que recibirá el solicitante..."
                                    required
                                ></textarea>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancelar</button>
                                <button type="button" className="btn btn-danger" onClick={confirmarRechazo}>Confirmar Rechazo</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
};

export default AprobacionPanel;