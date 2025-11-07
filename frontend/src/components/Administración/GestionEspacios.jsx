// src/components/administracion/GestionEspacios.jsx (REVISADO: SOLO SEDE TEMUCO)

import React, { useState } from 'react';

// MOCKUP: Simula los espacios existentes en la Sede Temuco
const MOCK_ESPACIOS = [
    { id: 202, nombre: 'Laboratorio B-102', tipo: 'Laboratorio Computación', capacidad: 20, caracteristicas: 'PCs, Proyector 4K', estado: 'Activo' },
    { id: 203, nombre: 'Sala de Estudio 401', tipo: 'Sala de Clases', capacidad: 40, caracteristicas: 'Pizarrón interactivo, 20 sillas', estado: 'Inactivo' },
    { id: 204, nombre: 'Auditorio Principal', tipo: 'Auditorio', capacidad: 150, caracteristicas: 'Sonido profesional, podio', estado: 'Activo' },
    { id: 205, nombre: 'Patio Cubo', tipo: 'Evento Exterior', capacidad: 300, caracteristicas: 'Al aire libre, toma eléctrica', estado: 'Activo' },
];

const GestionEspacios = () => {
    const [espacios, setEspacios] = useState(MOCK_ESPACIOS);
    const [showModal, setShowModal] = useState(false);
    const [currentEspacio, setCurrentEspacio] = useState(null); 
    const [filtroTipo, setFiltroTipo] = useState('Todos');
    const [busqueda, setBusqueda] = useState('');

    // Función para manejar la eliminación
    const handleDelete = (id, nombre) => {
        if (window.confirm(`¿Está seguro de eliminar el espacio "${nombre}"? Esta acción es irreversible.`)) {
            setEspacios(espacios.filter(e => e.id !== id));
        }
    };
    
    // Función para abrir el modal
    const handleOpenModal = (espacio = null) => {
        setCurrentEspacio(espacio);
        setShowModal(true);
    };

    // Lógica de filtrado (combinando tipo y búsqueda - SOLO POR NOMBRE)
    const espaciosFiltrados = espacios.filter(e => 
        (filtroTipo === 'Todos' || e.tipo === filtroTipo) &&
        (busqueda === '' || e.nombre.toLowerCase().includes(busqueda.toLowerCase()))
    );

    return (
        <div className="container mt-5">
            
            {/* ENCABEZADO Y ACCIÓN PRINCIPAL */}
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h1 className="text-danger">
                    <i className="bi bi-geo-alt-fill me-2"></i> Mantenedor de Espacios (Sede Temuco)
                </h1>
                
                {/* Botón de Nuevo Espacio (Destacado) */}
                <button 
                    className="btn btn-lg btn-danger shadow-lg" 
                    onClick={() => handleOpenModal(null)}
                >
                    <i className="bi bi-plus-lg me-2"></i> Nuevo Espacio
                </button>
            </div>
            <p className="lead text-muted">Administración y configuración de los recintos de INACAP Sede Temuco.</p>

            {/* BARRA DE FILTROS Y BÚSQUEDA */}
            <div className="card shadow mb-4 p-4 bg-light border-0">
                <div className="row g-3 align-items-center">
                    <div className="col-md-5">
                         <label className="form-label fw-bold">Buscar por Nombre</label>
                        <input 
                            type="text" 
                            className="form-control" 
                            placeholder="Ej: Sala 401, Auditorio"
                            value={busqueda}
                            onChange={(e) => setBusqueda(e.target.value)}
                        />
                    </div>
                    <div className="col-md-4">
                         <label className="form-label fw-bold">Filtrar por Tipo de Recinto</label>
                        <select 
                            className="form-select" 
                            value={filtroTipo}
                            onChange={(e) => setFiltroTipo(e.target.value)}
                        >
                            <option value="Todos">Todos los Tipos</option>
                            <option value="Sala de Clases">Sala de Clases</option>
                            <option value="Laboratorio Computación">Laboratorio Computación</option>
                            <option value="Evento Exterior">Evento Exterior</option>
                            <option value="Auditorio">Auditorio</option>
                        </select>
                    </div>
                    <div className="col-md-3 text-end">
                        <p className="mb-0 mt-3 text-muted small">
                            <i className="bi bi-funnel"></i> {espaciosFiltrados.length} Espacios Encontrados
                        </p>
                    </div>
                </div>
            </div>

            {/* TABLA DE ESPACIOS */}
            <div className="card shadow-lg border-0">
                <div className="card-body p-0">
                    <div className="table-responsive">
                        <table className="table table-striped table-hover align-middle mb-0">
                            <thead className="bg-light">
                                <tr>
                                    <th style={{width: '5%'}}>#</th>
                                    <th style={{width: '25%'}}>Espacio</th> {/* Eliminado (Sede) */}
                                    <th style={{width: '15%'}}>Tipo</th>
                                    <th style={{width: '10%'}} className="text-center">Capacidad</th>
                                    <th style={{width: '35%'}}>Características / Equipamiento</th>
                                    <th style={{width: '10%'}} className="text-center">Estado</th>
                                    <th style={{width: '10%'}} className="text-center">Acción</th>
                                </tr>
                            </thead>
                            <tbody>
                                {espaciosFiltrados.map(espacio => (
                                    <tr key={espacio.id}>
                                        <td className="text-muted small">{espacio.id}</td>
                                        <td>
                                            <strong className="text-primary">{espacio.nombre}</strong>
                                        </td>
                                        <td>{espacio.tipo}</td>
                                        <td className="text-center">
                                            <i className="bi bi-people-fill me-1"></i> {espacio.capacidad}
                                        </td>
                                        <td>
                                            <small className="text-muted">{espacio.caracteristicas || 'No especificado'}</small>
                                        </td>
                                        <td className="text-center">
                                            <span className={`badge py-2 px-3 ${espacio.estado === 'Activo' ? 'bg-success' : 'bg-secondary'}`}>
                                                <i className={`bi bi-${espacio.estado === 'Activo' ? 'check-circle' : 'slash-circle'} me-1`}></i>
                                                {espacio.estado}
                                            </span>
                                        </td>
                                        <td className="text-center">
                                            <div className="btn-group" role="group">
                                                <button 
                                                    className="btn btn-sm btn-warning"
                                                    title="Editar Espacio"
                                                    onClick={() => handleOpenModal(espacio)}
                                                >
                                                    <i className="bi bi-pencil"></i>
                                                </button>
                                                <button 
                                                    className="btn btn-sm btn-outline-danger"
                                                    title="Eliminar Espacio"
                                                    onClick={() => handleDelete(espacio.id, espacio.nombre)}
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

            {/* MODAL DE CREACIÓN/EDICIÓN (Componente auxiliar) */}
            {showModal && <EspacioModal 
                    espacioData={currentEspacio} 
                    onClose={() => setShowModal(false)} 
            />}
        </div>
    );
};

export default GestionEspacios;


// --- COMPONENTE AUXILIAR: EspacioModal ---
const EspacioModal = ({ espacioData, onClose }) => {
    const isEditing = !!espacioData;
    const [nombre, setNombre] = useState(espacioData?.nombre || '');
    const [tipo, setTipo] = useState(espacioData?.tipo || 'Sala de Clases');
    const [capacidad, setCapacidad] = useState(espacioData?.capacidad || 1);
    const [estado, setEstado] = useState(espacioData?.estado || 'Activo');

    const handleSave = (e) => {
        e.preventDefault();
        const accion = isEditing ? 'Editado' : 'Creado';
        alert(`Espacio "${nombre}" ${accion} con éxito en Sede Temuco. (API call simulada)`);
        onClose();
    };

    return (
        <div className="modal d-block fade show" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}>
            <div className="modal-dialog modal-lg">
                <div className="modal-content">
                    <form onSubmit={handleSave}>
                        <div className="modal-header bg-danger text-white">
                            <h5 className="modal-title"><i className="bi bi-tools me-2"></i> {isEditing ? `Editar: ${espacioData.nombre}` : 'Crear Nuevo Espacio (Temuco)'}</h5>
                            <button type="button" className="btn-close btn-close-white" onClick={onClose}></button>
                        </div>
                        <div className="modal-body">
                            <div className="row">
                                <div className="col-md-6 mb-3">
                                    <label className="form-label">Nombre del Espacio</label>
                                    <input type="text" className="form-control" value={nombre} onChange={(e) => setNombre(e.target.value)} required />
                                </div>
                                <div className="col-md-6 mb-3">
                                    <label className="form-label">Tipo de Recinto</label>
                                    <select className="form-select" value={tipo} onChange={(e) => setTipo(e.target.value)} required>
                                        <option value="Sala de Clases">Sala de Clases</option>
                                        <option value="Laboratorio Computación">Laboratorio Computación</option>
                                        <option value="Evento Exterior">Evento Exterior</option>
                                        <option value="Auditorio">Auditorio</option>
                                    </select>
                                </div>
                                <div className="col-md-6 mb-3">
                                    <label className="form-label">Capacidad (Personas)</label>
                                    <input type="number" className="form-control" value={capacidad} onChange={(e) => setCapacidad(Number(e.target.value))} min="1" required />
                                </div>
                                 <div className="col-md-6 mb-3">
                                    <label className="form-label">Estado de la Instalación</label>
                                    <select className="form-select" value={estado} onChange={(e) => setEstado(e.target.value)} required>
                                        <option value="Activo">Activo (Disponible)</option>
                                        <option value="Inactivo">Inactivo (Mantención)</option>
                                    </select>
                                </div>
                                <div className="col-12 mb-3">
                                     <label className="form-label">Características/Equipamiento</label>
                                     <textarea className="form-control" rows="2" placeholder="Ej: Pizarrón, proyector 4k, 30 sillas."></textarea>
                                </div>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancelar</button>
                            <button type="submit" className="btn btn-danger">
                                <i className={`bi bi-${isEditing ? 'save' : 'plus-circle'} me-2`}></i> 
                                {isEditing ? 'Guardar Cambios' : 'Crear Espacio'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};