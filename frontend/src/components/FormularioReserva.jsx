import React, { useState, useEffect } from 'react';
import api from '../services/api';
import Swal from 'sweetalert2';

// Recibimos las props del calendario (incluyendo onClose para cerrar el modal)
const FormularioReserva = ({ 
    espacioSeleccionado,
    fechaInicio,
    fechaFin,
    onClose 
}) => {
    const [motivo, setMotivo] = useState('');
    const [elementosDisponibles, setElementosDisponibles] = useState([]);
    const [seleccionElementos, setSeleccionElementos] = useState({}); // { id_elemento: cantidad }
    const [isLoading, setIsLoading] = useState(false);

    // Cargar elementos al abrir
    useEffect(() => {
        const cargarElementos = async () => {
            try {
                const response = await api.get('/elementos/');
                setElementosDisponibles(response.data);
            } catch (error) {
                console.error("Error al cargar elementos", error);
            }
        };
        cargarElementos();
    }, []);

    // Manejador inteligente de cantidad (+ y -)
    const handleCantidadChange = (id, cambio, stockMax) => {
        setSeleccionElementos(prev => {
            const actual = prev[id] || 0;
            const nuevo = actual + cambio;
            if (nuevo < 0) return prev; // No bajar de 0
            // Opcional: if (nuevo > stockMax) return prev; 
            return { ...prev, [id]: nuevo };
        });
    };
    
    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        const start = new Date(fechaInicio);
        const end = new Date(fechaFin);
        
        // --- ADAPTACIÓN CLAVE PARA EL BACKEND ---
        // Transformamos tu selección al formato que pide Django:
        // "elementos": [ { "elemento_id": 1, "cantidad": 2 }, ... ]
        const elementosParaEnviar = Object.entries(seleccionElementos)
            .filter(([_, cantidad]) => cantidad > 0)
            .map(([id, cantidad]) => ({
                elemento_id: parseInt(id), // <--- ESTO ES CRÍTICO (backend lo espera así)
                cantidad: cantidad
            }));

        const payload = {
            espacio: espacioSeleccionado.id,
            fecha_reserva: start.toISOString().split('T')[0],
            hora_inicio: start.toTimeString().split(' ')[0], // HH:MM:SS
            hora_fin: end.toTimeString().split(' ')[0],      // HH:MM:SS
            motivo: motivo,
            elementos: elementosParaEnviar
        };

        try {
            await api.post('/reservas/', payload);
            
            // Éxito con SweetAlert2
            Swal.fire({
                title: '¡Solicitud Enviada!',
                text: 'Tu reserva ha sido creada exitosamente.',
                icon: 'success',
                confirmButtonColor: '#d33'
            }).then(() => {
                onClose(true); // Cierra el modal y avisa que recargue
            });

        } catch (error) {
            console.error("Error creando reserva:", error.response?.data);
            const mensaje = error.response?.data?.non_field_errors?.[0] || 'Error al procesar la solicitud.';
            Swal.fire('Error', mensaje, 'error');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        // Fondo semitransparente para efecto Modal
        <div className="position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center" 
             style={{backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1050}}>
            
            <div className="col-md-8 col-lg-6">
                <div className='card shadow-lg border-0 rounded-3'>
                    
                    {/* Header Rojo INACAP */}
                    <div className='card-header bg-danger text-white d-flex justify-content-between align-items-center py-3'>
                        <h5 className='m-0 fw-bold'><i className="bi bi-calendar-check me-2"></i>Confirmar Reserva</h5>
                        <button type="button" className="btn-close btn-close-white" onClick={() => onClose(false)}></button>
                    </div>
                    
                    <form onSubmit={handleSubmit}>
                        <div className="card-body p-4">
                            
                            {/* Resumen Visual de Fecha/Hora */}
                            <div className="alert alert-light border shadow-sm mb-4">
                                <h5 className="alert-heading text-danger fw-bold mb-2">
                                    {espacioSeleccionado?.nombre || 'Espacio Seleccionado'}
                                </h5>
                                <div className="d-flex flex-wrap gap-4 text-secondary">
                                    <div className="d-flex align-items-center">
                                        <i className="bi bi-calendar3 fs-4 me-2 text-dark"></i>
                                        <div>
                                            <small className="d-block text-uppercase fw-bold" style={{fontSize: '0.7rem'}}>Fecha</small>
                                            <span className="fw-bold text-dark">{new Date(fechaInicio).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                    <div className="d-flex align-items-center">
                                        <i className="bi bi-clock fs-4 me-2 text-dark"></i>
                                        <div>
                                            <small className="d-block text-uppercase fw-bold" style={{fontSize: '0.7rem'}}>Horario</small>
                                            <span className="fw-bold text-dark">
                                                {new Date(fechaInicio).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} - {new Date(fechaFin).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Campo Motivo */}
                            <div className="mb-4">
                                <label className="form-label fw-bold text-muted small">MOTIVO DE LA ACTIVIDAD (*)</label>
                                <textarea
                                    className="form-control"
                                    rows="2"
                                    value={motivo}
                                    onChange={(e) => setMotivo(e.target.value)}
                                    required
                                    placeholder="Ej: Clase de reforzamiento, Reunión de equipo..."
                                ></textarea>
                            </div>

                            {/* Selección de Elementos con Botones +/- */}
                            <div className="mb-3">
                                <label className="form-label fw-bold text-muted small d-flex justify-content-between">
                                    <span>RECURSOS ADICIONALES</span>
                                    <span className="badge bg-light text-dark border fw-normal">Opcional</span>
                                </label>
                                
                                <div className="card border bg-light" style={{maxHeight: '200px', overflowY: 'auto'}}>
                                    <ul className="list-group list-group-flush">
                                        {elementosDisponibles.length === 0 ? (
                                            <li className="list-group-item bg-transparent text-muted small text-center py-3">No hay elementos disponibles.</li>
                                        ) : (
                                            elementosDisponibles.map(el => {
                                                const cantidad = seleccionElementos[el.id] || 0;
                                                return (
                                                    <li key={el.id} className="list-group-item bg-transparent d-flex justify-content-between align-items-center py-2">
                                                        <div>
                                                            <span className={`fw-bold ${cantidad > 0 ? 'text-danger' : 'text-dark'}`}>{el.nombre}</span>
                                                            <br/>
                                                            <small className="text-muted" style={{fontSize: '0.75rem'}}>Disponible: {el.stock_disponible}</small>
                                                        </div>
                                                        
                                                        <div className="btn-group shadow-sm" role="group">
                                                            <button 
                                                                type="button" 
                                                                className="btn btn-outline-secondary btn-sm"
                                                                onClick={() => handleCantidadChange(el.id, -1, el.stock_disponible)}
                                                                disabled={cantidad <= 0}
                                                                style={{width: '30px'}}
                                                            >-</button>
                                                            <button 
                                                                type="button" 
                                                                className="btn btn-white btn-sm border-top border-bottom px-3 fw-bold" 
                                                                disabled
                                                                style={{minWidth: '40px'}}
                                                            >
                                                                {cantidad}
                                                            </button>
                                                            <button 
                                                                type="button" 
                                                                className="btn btn-outline-danger btn-sm"
                                                                onClick={() => handleCantidadChange(el.id, 1, el.stock_disponible)}
                                                                // disabled={cantidad >= el.stock_disponible} // Descomentar si quieres limitar por stock real
                                                                style={{width: '30px'}}
                                                            >+</button>
                                                        </div>
                                                    </li>
                                                );
                                            })
                                        )}
                                    </ul>
                                </div>
                            </div>
                        </div>
                        
                        {/* Footer con Botones */}
                        <div className="card-footer bg-white border-top-0 d-flex justify-content-end gap-2 pb-3 pe-4">
                            <button type="button" className="btn btn-outline-secondary" onClick={() => onClose(false)}>
                                Cancelar
                            </button>
                            <button type="submit" className="btn btn-danger fw-bold px-4 shadow-sm" disabled={isLoading}>
                                {isLoading ? <><span className="spinner-border spinner-border-sm me-2"></span>Procesando...</> : 'Confirmar Reserva'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default FormularioReserva;