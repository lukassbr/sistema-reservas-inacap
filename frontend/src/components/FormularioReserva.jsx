import React, { useState, useEffect } from 'react';
import api from '../services/api';

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
                // Usamos el endpoint 'disponibles' si quieres solo los que tienen stock, 
                // o '/elementos/' para todos. Usaremos '/elementos/' para ver el nuevo.
                const response = await api.get('/elementos/');
                setElementosDisponibles(response.data);
            } catch (error) {
                console.error("Error al cargar elementos", error);
            }
        };
        cargarElementos();
    }, []);

    const handleCantidadChange = (id, cambio, stockMax) => {
        setSeleccionElementos(prev => {
            const actual = prev[id] || 0;
            const nuevo = actual + cambio;
            if (nuevo < 0) return prev; // No bajar de 0
            if (nuevo > stockMax) return prev; // No superar stock
            return { ...prev, [id]: nuevo };
        });
    };
    
    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        const start = new Date(fechaInicio);
        const end = new Date(fechaFin);
        
        // Preparamos la lista de elementos para el Backend
        // Formato esperado: [{ elemento_id: 1, cantidad: 2 }, ...]
        const elementosParaEnviar = Object.entries(seleccionElementos)
            .filter(([_, cantidad]) => cantidad > 0)
            .map(([id, cantidad]) => ({
                elemento_id: parseInt(id),
                cantidad: cantidad
            }));

        const payload = {
            espacio: espacioSeleccionado.id,
            fecha_reserva: start.toISOString().split('T')[0],
            hora_inicio: start.toTimeString().split(' ')[0],
            hora_fin: end.toTimeString().split(' ')[0],
            motivo: motivo,
            elementos: elementosParaEnviar // ¡Ahora sí enviamos los elementos!
        };

        try {
            await api.post('/reservas/', payload);
            alert('¡Reserva creada exitosamente! Queda pendiente de aprobación.');
            onClose(true);
        } catch (error) {
            console.error("Error creando reserva:", error.response?.data);
            alert("Error al crear reserva: " + JSON.stringify(error.response?.data));
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="container mt-5">
            <div className="row justify-content-center">
                <div className="col-md-8">
                    <div className='card shadow border-danger'>
                        <div className='card-header bg-danger text-white d-flex justify-content-between align-items-center'>
                            <h4 className='m-0'>Confirmar Reserva</h4>
                            <button type="button" className="btn-close btn-close-white" onClick={() => onClose(false)}></button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className="card-body">
                                <div className="alert alert-light border border-secondary mb-4">
                                    <h5 className="alert-heading text-danger">{espacioSeleccionado?.nombre}</h5>
                                    <hr/>
                                    <p className="mb-0">
                                        <i className="bi bi-calendar-event me-2"></i>
                                        <strong>Inicio:</strong> {new Date(fechaInicio).toLocaleString()} <br/>
                                        <i className="bi bi-clock me-2"></i>
                                        <strong>Fin:</strong> {new Date(fechaFin).toLocaleTimeString()}
                                    </p>
                                </div>

                                <div className="mb-4">
                                    <label className="form-label fw-bold">Motivo de la Reserva <span className="text-danger">*</span></label>
                                    <textarea
                                        className="form-control"
                                        rows="3"
                                        value={motivo}
                                        onChange={(e) => setMotivo(e.target.value)}
                                        required
                                        placeholder="Ej: Clase de reforzamiento, Reunión de equipo..."
                                    ></textarea>
                                </div>

                                <div className="mb-3">
                                    <label className="form-label fw-bold">Solicitar Recursos Adicionales (Opcional)</label>
                                    <div className="card border-0 bg-light" style={{maxHeight: '250px', overflowY: 'auto'}}>
                                        <ul className="list-group list-group-flush">
                                            {elementosDisponibles.length === 0 ? (
                                                <li className="list-group-item bg-transparent text-muted fst-italic">No hay elementos disponibles.</li>
                                            ) : (
                                                elementosDisponibles.map(el => (
                                                    <li key={el.id} className="list-group-item bg-transparent d-flex justify-content-between align-items-center">
                                                        <div>
                                                            <span className="fw-bold">{el.nombre}</span>
                                                            <br/>
                                                            <small className="text-muted">Stock: {el.stock_disponible}</small>
                                                        </div>
                                                        <div className="btn-group" role="group">
                                                            <button 
                                                                type="button" 
                                                                className="btn btn-outline-danger btn-sm"
                                                                onClick={() => handleCantidadChange(el.id, -1, el.stock_disponible)}
                                                                disabled={!seleccionElementos[el.id]}
                                                            >-</button>
                                                            <button 
                                                                type="button" 
                                                                className="btn btn-light btn-sm px-3 border" 
                                                                disabled
                                                            >
                                                                {seleccionElementos[el.id] || 0}
                                                            </button>
                                                            <button 
                                                                type="button" 
                                                                className="btn btn-outline-success btn-sm"
                                                                onClick={() => handleCantidadChange(el.id, 1, el.stock_disponible)}
                                                                disabled={seleccionElementos[el.id] >= el.stock_disponible}
                                                            >+</button>
                                                        </div>
                                                    </li>
                                                ))
                                            )}
                                        </ul>
                                    </div>
                                </div>
                            </div>
                            <div className="card-footer text-end bg-white border-top-0 pb-3 pe-3">
                                <button type="button" className="btn btn-secondary me-2" onClick={() => onClose(false)}>
                                    Cancelar
                                </button>
                                <button type="submit" className="btn btn-danger px-4" disabled={isLoading}>
                                    {isLoading ? <><span className="spinner-border spinner-border-sm me-2"></span>Enviando...</> : 'Confirmar Reserva'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FormularioReserva;