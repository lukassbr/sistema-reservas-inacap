import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import Swal from 'sweetalert2';

const GestionEspacios = () => {
    const [espacios, setEspacios] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    
    // Estado del formulario (Igual estructura que Elementos, adaptado a Espacios)
    const [formData, setFormData] = useState({
        id: null,
        nombre: '',
        tipo: 'salon',
        capacidad: 0,
        ubicacion: '',
        estado: 'disponible' // Agregamos estado para editarlo en el modal
    });

    useEffect(() => {
        cargarEspacios();
    }, []);

    const cargarEspacios = async () => {
        try {
            const response = await api.get('/espacios/');
            setEspacios(response.data);
        } catch (error) {
            console.error("Error al cargar espacios", error);
        } finally {
            setLoading(false);
        }
    };

    const handleGuardar = async (e) => {
        e.preventDefault();
        try {
            if (formData.id) {
                // Editar (PUT)
                await api.put(`/espacios/${formData.id}/`, formData);
                Swal.fire("Actualizado", "Espacio actualizado correctamente ✅", "success");
            } else {
                // Crear (POST)
                await api.post('/espacios/', formData);
                Swal.fire("Creado", "Espacio creado correctamente ✅", "success");
            }
            cargarEspacios();
            setShowModal(false);
        } catch (error) {
            console.error("Error guardando:", error);
            Swal.fire("Error", "Error al guardar. Revisa los datos.", "error");
        }
    };

    const handleEliminar = async (id) => {
        const result = await Swal.fire({
            title: "¿Eliminar espacio?",
            text: "No podrás revertir esto.",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#d33",
            confirmButtonText: "Sí, eliminar"
        });

        if (result.isConfirmed) {
            try {
                await api.delete(`/espacios/${id}/`);
                cargarEspacios();
                Swal.fire("Eliminado", "El espacio ha sido eliminado.", "success");
            } catch (error) {
                Swal.fire("Error", "No se pudo eliminar.", "error");
            }
        }
    };

    const abrirModal = (espacio = null) => {
        if (espacio) {
            setFormData(espacio);
        } else {
            // Valores por defecto al crear
            setFormData({
                id: null,
                nombre: '',
                tipo: 'salon',
                capacidad: 20,
                ubicacion: '',
                estado: 'disponible'
            });
        }
        setShowModal(true);
    };

    if (loading) return <div className="p-5 text-center">Cargando espacios...</div>;

    return (
        <div className="container mt-5">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h1 className="text-danger">Gestión de Espacios</h1>
                <button className="btn btn-danger" onClick={() => abrirModal(null)}>
                    <i className="bi bi-plus-lg me-2"></i> Nuevo Espacio
                </button>
            </div>

            <div className="card shadow border-0">
                <div className="table-responsive">
                    <table className="table table-hover align-middle mb-0">
                        <thead className="table-light">
                            <tr>
                                <th>Nombre</th>
                                <th>Tipo</th>
                                <th>Capacidad</th>
                                <th>Ubicación</th>
                                <th>Estado</th>
                                <th className="text-center">Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {espacios.map(esp => (
                                <tr key={esp.id}>
                                    <td className="fw-bold">{esp.nombre}</td>
                                    <td>
                                        <span className="badge bg-light text-dark border">
                                            {esp.tipo}
                                        </span>
                                    </td>
                                    <td>{esp.capacidad} pers.</td>
                                    <td className="text-muted small">{esp.ubicacion}</td>
                                    
                                    {/* Badge de Estado (Visualmente igual a Elementos) */}
                                    <td>
                                        {esp.estado === 'disponible' 
                                            ? <span className="badge bg-success">Disponible</span>
                                            : <span className="badge bg-warning text-dark">En Mantención</span>
                                        }
                                    </td>

                                    <td className="text-center">
                                        <button className="btn btn-sm btn-outline-primary me-2" onClick={() => abrirModal(esp)}>
                                            <i className="bi bi-pencil"></i>
                                        </button>
                                        <button className="btn btn-sm btn-outline-danger" onClick={() => handleEliminar(esp.id)}>
                                            <i className="bi bi-trash"></i>
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* MODAL (Idéntico estilo al de Elementos) */}
            {showModal && (
                <div className="modal d-block" style={{backgroundColor: 'rgba(0,0,0,0.5)'}}>
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header bg-danger text-white">
                                <h5 className="modal-title">{formData.id ? 'Editar' : 'Crear'} Espacio</h5>
                                <button type="button" className="btn-close btn-close-white" onClick={() => setShowModal(false)}></button>
                            </div>
                            <form onSubmit={handleGuardar}>
                                <div className="modal-body">
                                    {/* Nombre */}
                                    <div className="mb-3">
                                        <label>Nombre del Espacio</label>
                                        <input type="text" className="form-control" required
                                            value={formData.nombre}
                                            onChange={e => setFormData({...formData, nombre: e.target.value})}
                                            placeholder="Ej: Sala 101"
                                        />
                                    </div>

                                    <div className="row">
                                        {/* Tipo */}
                                        <div className="col-md-6 mb-3">
                                            <label>Tipo</label>
                                            <select className="form-select" value={formData.tipo}
                                                onChange={e => setFormData({...formData, tipo: e.target.value})}>
                                                <option value="salon">Salón</option>
                                                <option value="laboratorio">Laboratorio</option>
                                                <option value="auditorio">Auditorio</option>
                                                <option value="patio">Patio</option>
                                                <option value="cancha">Cancha</option>
                                                <option value="otro">Otro</option>
                                            </select>
                                        </div>
                                        {/* Capacidad */}
                                        <div className="col-md-6 mb-3">
                                            <label>Capacidad</label>
                                            <input type="number" className="form-control" required min="1"
                                                value={formData.capacidad}
                                                onChange={e => setFormData({...formData, capacidad: e.target.value})}
                                            />
                                        </div>
                                    </div>

                                    {/* Ubicación */}
                                    <div className="mb-3">
                                        <label>Ubicación</label>
                                        <input type="text" className="form-control" required
                                            value={formData.ubicacion}
                                            onChange={e => setFormData({...formData, ubicacion: e.target.value})}
                                            placeholder="Ej: Edificio A, Piso 2"
                                        />
                                    </div>

                                    {/* Estado (Aquí se cambia, igual que en Elementos) */}
                                    <div className="mb-3">
                                        <label>Estado</label>
                                        <select className="form-select" value={formData.estado}
                                            onChange={e => setFormData({...formData, estado: e.target.value})}>
                                            <option value="disponible">Disponible</option>
                                            <option value="mantenimiento">En Mantenimiento</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="modal-footer">
                                    <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancelar</button>
                                    <button type="submit" className="btn btn-success">Guardar</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default GestionEspacios;