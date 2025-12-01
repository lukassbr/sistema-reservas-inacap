import React, { useState } from 'react';

const MOCK_ELEMENTOS = [
    { id: 1, nombre: 'Proyector HDMI', stockTotal:10, stockDisponible:4, unidad:'unidades', descripcion: 'Proyector portátil de alta definición' },
    { id: 2, nombre: 'Pantalla 4K', stockTotal:5, stockDisponible:2, unidad:'unidades', descripcion: 'Pantalla 4K de 55 pulgadas' },
    { id: 3, nombre: 'Micrófono Inalámbrico', stockTotal:15, stockDisponible:10, unidad:'unidades', descripcion: 'Micrófono inalámbrico de mano' },
    { id: 4, nombre: 'Sistema de Sonido', stockTotal:3, stockDisponible:1, unidad:'sistemas', descripcion: 'Sistema de sonido profesional para eventos' }
];

const GestionElementos = () => {
    const [elementos, setElementos] = useState(MOCK_ELEMENTOS);
    const [showModal, setShowModal] = useState(false);
    const [currentElemento, setCurrentElemento] = useState(null);
    const [filtroUbicacion, setFiltroUbicacion] = useState('Todos');

    const handleDelete = (id, nombre) => {
        if (window.confirm(`¿Estás seguro de que deseas eliminar "${nombre}"?`)) {
            setElementos(elementos.filter(elemento => elemento.id !== id));
            alert(`Elemento "${nombre}" eliminado exitosamente.`);
        }
    };

    const handleOpenModal = (elemento = null) => {
        setCurrentElemento(elemento);
        setShowModal(true);
    };

    const elementosFiltrados = elementos.filter(elemento => 
        filtroUbicacion === 'Todos' || elemento.ubicacion === filtroUbicacion
    );

    const getStockStyle = (disponible) => {
        if (disponible === 0) return 'bg-danger text-white';
        if (disponible <= 10) return 'bg-warning text-dark';
        return 'bg-success text-white';
    };

    const ubicaciones = ['Todos','Patio Cubo', 'Auditorio', 'Laboratorio PC', 'Sala Ejecutiva', 'Sala de Creatividad', ...new Set(MOCK_ELEMENTOS.map(e => e.ubicacion))];


    return (
        <div className="container mt-5">

            {/* TÍTULO Y ACCIÓN PRINCIPAL */}
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h1 className='text-danger'>
                    <i className="bi bi-box-seam me-2"></i> Gestión de Elementos
                </h1>

                {/* Botón para agregar nuevo elemento */}
                <button 
                    className="btn btn-lg btn-danger shadow-lg"
                    onClick={() => handleOpenModal(null)}
                >
                    <i className="bi bi-plus-lg me-2"></i> Agregar Elemento
                </button>
            </div>

            <p className='lead text-muted'>Gestión de inventario y Stock de recursos adicionales.</p>

            {/* BARRA DE FILTROS */}
            <div className="card shadow mb-4 p-4 bg-light border-0">
                <div className="row g-3 align-items-center">
                    <div className="col-md-5">
                        <label className='form-label fw-bold'>Buscar por Nombre</label>
                        <input
                            type="text"
                            className='form-control'
                            placeholder='Escribe el nombre del elemento...'
                        />
                    </div>
                    <div className="col-md-4">
                        <label className='cold-md-4'>Filtrar por Ubicación</label>
                        <select
                            className='form-select'
                            value={filtroUbicacion}
                            onChange={(e) => setFiltroUbicacion(e.target.value)}
                        >
                            {ubicaciones.map(ubicacion => (
                                <option key={ubicacion} value={ubicacion}>{ubicacion}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {/* TABLA DE ELEMENTOS */}
            <div className="card shadow-lg border-0">
                <div className="card-body p-0">
                    <div className="table-responsive">
                        <table className='table table-striped table-hover align-middle mb-0'>
                            <thead className='table-danger'>
                                <tr>
                                    <th style={{width: '25%'}}>Elemento</th>
                                    <th style={{width: '20%'}}>Ubicación</th>
                                    <th style={{width: '15%'}}>Stock Disponible</th>
                                    <th style={{width: '30%'}}>Acción</th>
                                </tr>
                            </thead>
                            <tbody>
                                {elementosFiltrados.map(elemento => (
                                    <tr key={elemento.id}>
                                        <td>
                                            <strong className='text-primary'>{elemento.nombre}</strong> <br />
                                            <small className='text-muted'>{elemento.descripcion}</small>
                                        </td>
                                        <td>{elemento.ubicacion}</td>
                                        <td className='text-center'>{elemento.stockTotal}</td>
                                        <td className='text-center'>
                                            <span className={`badge py-2 px-3 ${getStockStyle(elemento.stockDisponible)}`}>
                                                <i className={'bi bi-info-circle-fill me-1'}></i>
                                                 {elemento.stockDisponible}
                                            </span>
                                            {elemento.stockDisponible <= 10 && elemento.stockDisponible > 0 && (
                                                <span className='d-block text-warning small fw-bold mt-1'>ALERTA BAJO STOCK</span>
                                            )}
                                            {elemento.stockDisponible === 0 && (
                                                <span className='d-block text-danger small fw-bold mt-1'>AGOTADO</span>
                                            )}
                                        </td>
                                        <td className='text-center'>
                                            <div className="btn-group" role="group">
                                                <button
                                                    className="btn btn-sm btn-warning"
                                                    title="Editar Elemento"
                                                    onClick={() => handleOpenModal(elemento)}
                                                >   
                                                    <i className="bi bi-pencil"></i>
                                                </button>
                                                <button
                                                    className="btn btn-sm btn-outline-danger"
                                                    title="Eliminar Elemento"
                                                    onClick={() => handleDelete(elemento.id, elemento.nombre)}
                                                >
                                                    <i className="bi bi-trash"></i>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* MODAL PARA AGREGAR/EDITAR ELEMENTO */}
            {showModal && <ElementoModal
                elemento={currentElemento}
                onClose={() => setShowModal(false)}
            />}
        </div>
    );
}

export default GestionElementos;

// --- COMPONENTE AUXILIAR: ElementoModal ---
const ElementoModal = ({ elemento, onClose }) => {
    const isEditing = !!elemento;
    const [nombre, setNombre] = useState(elemento?.nombre || '');
    const [stockTotal, setStockTotal] = useState(elemento?.stockTotal || 1);
    const [stockDisponible, setStockDisponible] = useState(elemento?.stockDisponible || 1);

    const handleSave = (e) => {
        e.preventDefault();
        // Lógica de validación y llamada a API
        if (stockDisponible > stockTotal) {
            alert("Error: El stock disponible no puede ser mayor que el stock total.");
            return;
        }
        const accion = isEditing ? 'Editado' : 'Creado';
        alert(`Elemento "${nombre}" ${accion} con éxito. (API call simulada)`);
        onClose();
    };

    return (
        <div className="modal d-block fade show" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}>
            <div className="modal-dialog">
                <div className="modal-content">
                    <form onSubmit={handleSave}>
                        <div className="modal-header bg-danger text-white">
                            <h5 className="modal-title"><i className="bi bi-tools me-2"></i> {isEditing ? `Editar: ${elemento.nombre}` : 'Crear Nuevo Elemento'}</h5>
                            <button type="button" className="btn-close btn-close-white" onClick={onClose}></button>
                        </div>
                        <div className="modal-body">
                            <div className="mb-3">
                                <label className="form-label">Nombre del Elemento</label>
                                <input type="text" className="form-control" value={nombre} onChange={(e) => setNombre(e.target.value)} required />
                            </div>
                            <div className="mb-3">
                                <label className="form-label">Stock Total Adquirido</label>
                                <input type="number" className="form-control" value={stockTotal} onChange={(e) => setStockTotal(Number(e.target.value))} min="1" required />
                            </div>
                            <div className="mb-3">
                                <label className="form-label">Stock Disponible Actual</label>
                                <input type="number" className="form-control" value={stockDisponible} onChange={(e) => setStockDisponible(Number(e.target.value))} min="0" required />
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancelar</button>
                            <button type="submit" className="btn btn-danger">
                                <i className={`bi bi-${isEditing ? 'save' : 'plus-circle'} me-2`}></i> 
                                {isEditing ? 'Guardar Cambios' : 'Crear Elemento'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};