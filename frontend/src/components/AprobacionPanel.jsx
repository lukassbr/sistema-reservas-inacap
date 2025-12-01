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
                if (!motivoRechazo) return alert("Ingrese un motivo.");
                await api.post(`/reservas/${id}/rechazar/`, { observaciones: motivoRechazo });
                alert("Solicitud Rechazada ❌");
            }
            setSelectedSolicitud(null);
            setMotivoRechazo("");
            cargarPendientes();
        } catch (error) {
            alert("Error al procesar la solicitud.");
        }
    };

    if (loading) return <div className="p-5 text-center">Cargando solicitudes...</div>;

    return (
        <div className="container mt-5">
            <h2 className="text-danger mb-4">Aprobación de Solicitudes</h2>
            
            {solicitudes.length === 0 ? (
                <div className="alert alert-success">No hay solicitudes pendientes.</div>
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
                                        <td>#{sol.id}</td>
                                        <td>{sol.usuario_detalle?.nombre} {sol.usuario_detalle?.apellido}</td>
                                        <td>{sol.espacio_detalle?.nombre}</td>
                                        <td>{sol.fecha_reserva}</td>
                                        <td className="text-center">
                                            <button className="btn btn-sm btn-primary" onClick={() => setSelectedSolicitud(sol)}>
                                                Revisar
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
                <div className="modal d-block" style={{backgroundColor: 'rgba(0,0,0,0.5)'}}>
                    <div className="modal-dialog modal-lg">
                        <div className="modal-content">
                            <div className="modal-header bg-danger text-white">
                                <h5 className="modal-title">Solicitud #{selectedSolicitud.id}</h5>
                                <button type="button" className="btn-close btn-close-white" onClick={() => setSelectedSolicitud(null)}></button>
                            </div>
                            <div className="modal-body">
                                <div className="row">
                                    <div className="col-md-6">
                                        <p><strong>Espacio:</strong> {selectedSolicitud.espacio_detalle?.nombre}</p>
                                        <p><strong>Horario:</strong> {selectedSolicitud.hora_inicio} - {selectedSolicitud.hora_fin}</p>
                                        <p><strong>Motivo:</strong> {selectedSolicitud.motivo}</p>
                                    </div>
                                    <div className="col-md-6">
                                        <p><strong>Solicitante:</strong> {selectedSolicitud.usuario_detalle?.nombre}</p>
                                        <p><strong>Email:</strong> {selectedSolicitud.usuario_detalle?.email}</p>
                                    </div>
                                </div>

                                <hr />
                                <h6 className="text-danger">Elementos Solicitados:</h6>
                                {selectedSolicitud.elementos && selectedSolicitud.elementos.length > 0 ? (
                                    <ul className="list-group">
                                        {selectedSolicitud.elementos.map((item, index) => (
                                            <li key={index} className="list-group-item d-flex justify-content-between align-items-center">
                                                <span>{item.elemento_detalle?.nombre || "Elemento"}</span>
                                                <span className="badge bg-secondary rounded-pill">Cant: {item.cantidad_solicitada}</span>
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <p className="text-muted fst-italic">No se solicitaron elementos adicionales.</p>
                                )}

                                <hr />
                                <div className="mt-3">
                                    <label className="text-danger fw-bold">Motivo Rechazo (Opcional):</label>
                                    <textarea className="form-control" rows="2" value={motivoRechazo} onChange={e => setMotivoRechazo(e.target.value)} />
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button className="btn btn-secondary" onClick={() => setSelectedSolicitud(null)}>Cancelar</button>
                                <button className="btn btn-danger" onClick={() => manejarAccion(selectedSolicitud.id, 'rechazar')}>Rechazar</button>
                                <button className="btn btn-success" onClick={() => manejarAccion(selectedSolicitud.id, 'aprobar')}>Aprobar</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AprobacionPanel;