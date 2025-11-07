import React, { useState } from 'react';

// MOCKUP: Simula los elementos disponibles que vendrían del backend (HU09)
const MOCK_ELEMENTOS = [
    { id: 1, nombre: 'Proyector', stock: 5, descripcion: 'Proyector HDMI y VGA' },
    { id: 2, nombre: 'Pizarrón Móvil', stock: 2, descripcion: 'Pizarrón blanco con ruedas' },
    { id: 3, nombre: 'Mesa Adicional', stock: 10, descripcion: 'Mesa plegable para 4 personas' },
];

// Asumimos que el componente recibe el espacio y la hora ya seleccionados
const FormularioReserva = ({ 
    espacioSeleccionado = { nombre: 'Laboratorio C-201', capacidad: 30 }, // Prop simulada
    fechaInicio = '20-10-2025 15:00',
    fechaFin = '20-10-2025 18:00',
    onClose = () => { /* Función para cerrar modal/navegar */ } 
}) => {
    // 1. ESTADOS
    const [motivo, setMotivo] = useState('');
    const [elementosSolicitados, setElementosSolicitados] = useState([]);
    const [archivoImagen, setArchivoImagen] = useState(null); // Para el archivo de imagen
    const [isLoading, setIsLoading] = useState(false);
    const [validationError, setValidationError] = useState('');

    // 2. FUNCIÓN PARA MANEJAR LA CANTIDAD DE ELEMENTOS (Dinámico)
    const handleCantidadElemento = (id, change) => {
        setElementosSolicitados(prevElementos => {
            const existing = prevElementos.find(e => e.id === id);
            const mockStock = MOCK_ELEMENTOS.find(e => e.id === id).stock;
            
            if (existing) {
                const newCantidad = existing.cantidad + change;
                
                if (newCantidad <= 0) {
                    return prevElementos.filter(e => e.id !== id); // Eliminar si la cantidad es 0
                }
                
                // Validación de Stock (HU10)
                if (newCantidad > mockStock) {
                    setValidationError(`¡Stock Insuficiente! Solo quedan ${mockStock} de ${existing.nombre}.`);
                    return prevElementos; // Bloquear si supera el stock
                }
                
                // Actualizar cantidad
                return prevElementos.map(e => e.id === id ? { ...e, cantidad: newCantidad } : e);
            } else if (change > 0) {
                // Agregar nuevo elemento con cantidad 1
                const elementoData = MOCK_ELEMENTOS.find(e => e.id === id);
                return [...prevElementos, { id: id, nombre: elementoData.nombre, cantidad: 1 }];
            }
            return prevElementos;
        });
        setValidationError(''); 
    };
    
    // 3. FUNCIÓN DE ENVÍO (Manejo de Submit)
    const handleSubmit = (e) => {
        e.preventDefault();
        setValidationError('');
        
        // Validación del Motivo (mínimo 10 caracteres)
        if (motivo.length < 10) {
            setValidationError('El motivo de la reserva debe ser detallado (mínimo 10 caracteres).');
            return;
        }
        
        // Simulación de validaciones de políticas (HU24)
        // Ejemplo: Si no se adjunta imagen, lanzamos una advertencia
        if (!archivoImagen && (espacioSeleccionado.nombre.includes('hall') || espacioSeleccionado.nombre.includes('cubo'))) {
             setValidationError('Para espacios grandes como el hall o patio cubo, se recomienda adjuntar una imagen/croquis de montaje.');
        }

        setIsLoading(true);
        
        // Simulación de envío al backend (Aquí iría la llamada real a la API)
        setTimeout(() => {
            console.log('--- SOLICITUD FINAL ---');
            console.log('Motivo:', motivo);
            console.log('Elementos Solicitados:', elementosSolicitados);
            console.log('Archivo:', archivoImagen ? archivoImagen.name : 'N/A');
            
            // Reemplazar esto con la navegación a Mis Reservas (HU22)
            alert('¡Reserva enviada con éxito! Estado: Pendiente de Aprobación.'); 
            setIsLoading(false);
            onClose(); 
        }, 1500); 
    };

    // 4. ESTRUCTURA VISUAL (JSX)
    return (
        <div className="container mt-5">
            <div className="row justify-content-center">
                <div className="col-md-9">
                    
                    {/* Tarjeta Principal */}
                    <div className='card shadow mb-4 border-danger'>
                        <div className='card-header bg-danger text-white'>
                            <h4 className='m-0 font-weight-bold'>Solicitud de Reserva: {espacioSeleccionado.nombre}</h4>
                        </div>
                        
                        <form onSubmit={handleSubmit}>
                            <div className="card-body">

                                {/* MENSAJE DE VALIDACIÓN Y POLÍTICAS (HU24) */}
                                {validationError && (
                                    <div className="alert alert-warning" role="alert">
                                        <i className="bi bi-exclamation-triangle-fill me-2"></i>
                                        {validationError}
                                    </div>
                                )}
                                <div className="alert alert-info small" role="alert">
                                    <i className="bi bi-info-circle-fill me-2"></i>
                                    Recuerde que esta solicitud está sujeta a la validación de disponibilidad y políticas de uso institucional.
                                </div>
                                
                                {/* 1. DETALLES DE LA RESERVA */}
                                <h5 className="mb-3 text-secondary border-bottom pb-2">1. Horario y Espacio</h5>
                                <p>
                                    <strong>Espacio:</strong> {espacioSeleccionado.nombre} ({espacioSeleccionado.capacidad} pers.)<br/>
                                    <strong>Fecha:</strong> {fechaInicio.split(' ')[0]}<br/>
                                    <strong>Horario:</strong> {fechaInicio.split(' ')[1]} - {fechaFin.split(' ')[1]}
                                </p>

                                {/* 2. MOTIVO DE LA RESERVA (HU01) */}
                                <h5 className="mb-3 mt-4 text-secondary border-bottom pb-2">2. Propósito y Motivo</h5>
                                <div className="mb-3">
                                    <label htmlFor="motivo" className="form-label">Motivo Detallado <span className="text-danger">*</span></label>
                                    <textarea
                                        id="motivo"
                                        className="form-control"
                                        rows="3"
                                        value={motivo}
                                        onChange={(e) => setMotivo(e.target.value)}
                                        placeholder="Ej: Clase de Taller de Proyecto, Reunión de Carrera, evento de titulación..."
                                        required
                                    ></textarea>
                                    <div className="form-text">Mínimo 10 caracteres. Actual: {motivo.length}</div>
                                </div>

                                {/* 3. ELEMENTOS ASOCIADOS (HU01, HU09) */}
                                <h5 className="mb-3 mt-4 text-secondary border-bottom pb-2">3. Recursos Adicionales (Elementos)</h5>
                                <p className="small text-muted">Seleccione los elementos necesarios para el montaje de su actividad.</p>
                                <div className="table-responsive">
                                    <table className="table table-sm align-middle">
                                        <thead className="table-light">
                                            <tr>
                                                <th>Elemento</th>
                                                <th>Stock Disponible</th>
                                                <th className="text-center">Solicitado</th>
                                                <th>Acción</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {MOCK_ELEMENTOS.map(elemento => {
                                                // Verifica si el elemento ya fue solicitado
                                                const solicitado = elementosSolicitados.find(e => e.id === elemento.id);
                                                const cantidad = solicitado ? solicitado.cantidad : 0;
                                                
                                                return (
                                                    <tr key={elemento.id}>
                                                        <td>
                                                            <strong>{elemento.nombre}</strong><br/>
                                                            <small className="text-muted">{elemento.descripcion}</small>
                                                        </td>
                                                        <td><span className={elemento.stock < 5 ? 'text-warning' : 'text-success'}>
                                                            {elemento.stock} unidades
                                                        </span></td>
                                                        <td className="text-center">
                                                            {cantidad}
                                                        </td>
                                                        <td>
                                                            <div className="btn-group" role="group">
                                                                <button 
                                                                    type="button" 
                                                                    className="btn btn-sm btn-outline-danger" 
                                                                    onClick={() => handleCantidadElemento(elemento.id, -1)}
                                                                    disabled={cantidad === 0} // Deshabilitar si es 0
                                                                >
                                                                    -
                                                                </button>
                                                                <button 
                                                                    type="button" 
                                                                    className="btn btn-sm btn-outline-success" 
                                                                    onClick={() => handleCantidadElemento(elemento.id, 1)}
                                                                    disabled={cantidad >= elemento.stock} // Deshabilitar si llega al stock
                                                                >
                                                                    +
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                                
                                {/* 4. IMAGEN DE REFERENCIA (S1.pdf) */}
                                <h5 className="mb-3 mt-4 text-secondary border-bottom pb-2">4. Imagen de Montaje (Opcional)</h5>
                                <div className="mb-3">
                                    <label htmlFor="archivoImagen" className="form-label">Adjuntar Imagen de Referencia (Ej. Croquis de distribución)</label>
                                    <input 
                                        type="file" 
                                        className="form-control" 
                                        id="archivoImagen" 
                                        accept="image/*"
                                        onChange={(e) => setArchivoImagen(e.target.files[0])}
                                    />
                                    <div className="form-text">Formatos permitidos: JPG, PNG. Máx. 2MB.</div>
                                </div>

                            </div> {/* Fin card-body */}

                            <div className="card-footer text-end">
                                <button type="button" className="btn btn-secondary me-2" onClick={onClose} disabled={isLoading}>
                                    Cancelar
                                </button>
                                
                                <button
                                    type="submit"
                                    className="btn btn-danger"
                                    disabled={isLoading}
                                >
                                    {isLoading ? (
                                        <>
                                            <span className="spinner-border spinner-border-sm me-2"></span>
                                            Enviando Solicitud...
                                        </>
                                    ) : (
                                        <>
                                            <i className="bi bi-send-fill me-2"></i>
                                            Solicitar Reserva
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div> {/* Fin card */}
                </div>
            </div>
        </div>
    );
};

export default FormularioReserva;