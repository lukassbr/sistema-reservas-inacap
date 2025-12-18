import React, { useState, useEffect } from "react";
import api from "../services/api";

const AprobacionPanel = () => {
    const [solicitudes, setSolicitudes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedSolicitud, setSelectedSolicitud] = useState(null);
    const [motivoRechazo, setMotivoRechazo] = useState("");

    useEffect(() => {
        cargarPendientes();
    }, []);

    const cargarPendientes = async () => {
        try {
            const response = await api.get('/reservas/pendientes/');
            setSolicitudes(response.data);
        } catch (error) {
            console.error("Error cargando pendientes", error);
        } finally {
            setLoading(false);
        }
    };

    const manejarAccion = async (id, accion) => {
        if (!window.confirm(`¿Confirmar ${accion}?`)) return;

        try {
            if (accion === 'aprobar') {
                await api.post(`/reservas/${id}/aprobar/`);
                alert("Solicitud Aprobada ✅");
            } else {
                if (!motivoRechazo) return alert("Debe ingresar un motivo para rechazar.");
                
                // --- CORRECCIÓN CLAVE AQUÍ ---
                // Antes enviabas: { observaciones: motivoRechazo }
                // Ahora enviamos: { motivo_rechazo: motivoRechazo }
                // Esto hace que coincida con lo que espera tu views.py
                await api.post(`/reservas/${id}/rechazar/`, { 
                    motivo_rechazo: motivoRechazo 
                });
                
                alert("Solicitud Rechazada ❌");
            }
            setSelectedSolicitud(null);
            setMotivoRechazo("");
            cargarPendientes();
        } catch (error) {
            console.error(error);
            alert("Error al procesar la solicitud.");
        }
    };

    if (loading) return <div className="p-5 text-center">Cargando solicitudes...</div>;

    return (
        <div className="container mt-5 fade-in">
            <h2 className="text-danger mb-4 fw-bold">
                <i className="bi bi-check-circle-fill me-2"></i>Aprobación de Solicitudes
            </h2>
            
            {solicitudes.length === 0 ? (
                <div className="alert alert-success border-success shadow-sm">
                    <i className="bi bi-check-all me-2"></i>¡Todo al día! No hay solicitudes pendientes.
                </div>
            ) : (
                <div className="card shadow border-0">
                    <div className="table-responsive">
                        <table className="table table-hover align-middle mb-0">
                            <thead className="table-light">
                                <tr>
                                    <th>ID</th>
                                    <th>Solicitante</th>
                                    <th>Espacio</th>
                                    <th>Fecha</th>
                                    <th className="text-center">Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {solicitudes.map(sol => (
                                    <tr key={sol.id}>
                                        <td className="fw-bold">#{sol.id}</td>
                                        <td>
                                            <div className="d-flex flex-column">
                                                <span className="fw-bold">{sol.usuario_detalle?.nombre} {sol.usuario_detalle?.apellido}</span>
                                                <small className="text-muted">{sol.usuario_detalle?.email}</small>
                                            </div>
                                        </td>
                                        <td>{sol.espacio_detalle?.nombre}</td>
                                        <td>
                                            {sol.fecha_reserva}
                                            <small className="d-block text-muted">{sol.hora_inicio} - {sol.hora_fin}</small>
                                        </td>
                                        <td className="text-center">
                                            <button className="btn btn-sm btn-primary shadow-sm" onClick={() => setSelectedSolicitud(sol)}>
                                                <i className="bi bi-eye-fill me-1"></i>Revisar
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* MODAL DETALLE */}
            {selectedSolicitud && (
                <div className="modal d-block" style={{backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1050}}>
                    <div className="modal-dialog modal-lg modal-dialog-centered">
                        <div className="modal-content shadow-lg border-0">
                            <div className="modal-header bg-danger text-white">
                                <h5 className="modal-title fw-bold">Evaluando Solicitud #{selectedSolicitud.id}</h5>
                                <button type="button" className="btn-close btn-close-white" onClick={() => setSelectedSolicitud(null)}></button>
                            </div>
                            <div className="modal-body p-4">
                                <div className="row g-3">
                                    <div className="col-md-6">
                                        <div className="p-3 bg-light rounded border h-100">
                                            <h6 className="text-muted text-uppercase small fw-bold">Datos del Espacio</h6>
                                            <p className="mb-1 fs-5 fw-bold text-dark">{selectedSolicitud.espacio_detalle?.nombre}</p>
                                            <p className="mb-0"><i className="bi bi-calendar3 me-2"></i>{selectedSolicitud.fecha_reserva}</p>
                                            <p className="mb-0"><i className="bi bi-clock me-2"></i>{selectedSolicitud.hora_inicio} - {selectedSolicitud.hora_fin}</p>
                                        </div>
                                    </div>
                                    <div className="col-md-6">
                                        <div className="p-3 bg-light rounded border h-100">
                                            <h6 className="text-muted text-uppercase small fw-bold">Datos del Solicitante</h6>
                                            <p className="mb-1 fw-bold">{selectedSolicitud.usuario_detalle?.nombre} {selectedSolicitud.usuario_detalle?.apellido}</p>
                                            <p className="mb-0 text-muted">{selectedSolicitud.usuario_detalle?.email}</p>
                                            <hr className="my-2"/>
                                            <p className="mb-0 fst-italic">"{selectedSolicitud.motivo}"</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-4">
                                    <h6 className="text-danger fw-bold border-bottom pb-2">Elementos Solicitados</h6>
                                    {selectedSolicitud.elementos && selectedSolicitud.elementos.length > 0 ? (
                                        <div className="row g-2 mt-2">
                                            {selectedSolicitud.elementos.map((item, index) => (
                                                <div key={index} className="col-md-6">
                                                    <div className="d-flex justify-content-between align-items-center p-2 border rounded bg-white">
                                                        <span><i className="bi bi-box-seam me-2 text-primary"></i>{item.elemento_detalle?.nombre || "Elemento"}</span>
                                                        <span className="badge bg-secondary">x{item.cantidad_solicitada}</span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-muted fst-italic mt-2">No se solicitaron elementos adicionales.</p>
                                    )}
                                </div>

                                <hr className="my-4" />
                                
                                <div className="bg-danger bg-opacity-10 p-3 rounded border border-danger border-opacity-25">
                                    <label className="text-danger fw-bold mb-2">
                                        <i className="bi bi-pencil-square me-2"></i>
                                        Motivo de Rechazo (Obligatorio si rechaza):
                                    </label>
                                    <textarea 
                                        className="form-control" 
                                        rows="2" 
                                        placeholder="Escriba aquí la razón del rechazo para que el solicitante la vea..."
                                        value={motivoRechazo} 
                                        onChange={e => setMotivoRechazo(e.target.value)} 
                                    />
                                </div>
                            </div>
                            <div className="modal-footer bg-light">
                                <button className="btn btn-secondary" onClick={() => setSelectedSolicitud(null)}>Cancelar</button>
                                <button className="btn btn-outline-danger" onClick={() => manejarAccion(selectedSolicitud.id, 'rechazar')}>
                                    <i className="bi bi-x-circle me-2"></i>Rechazar
                                </button>
                                <button className="btn btn-success" onClick={() => manejarAccion(selectedSolicitud.id, 'aprobar')}>
                                    <i className="bi bi-check-circle me-2"></i>Aprobar
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AprobacionPanel;